/**
 * CDN-as-CMS: Automated photo processing pipeline.
 *
 * Detects new/deleted images in the R2 bucket, generates WebP thumbnails,
 * extracts EXIF metadata, and updates photography/manifest.json on R2.
 *
 * Runs in GitHub Actions on a daily schedule or via manual trigger.
 * Does NOT modify any files in the git repository.
 *
 * Required env vars:
 *   CLOUDFLARE_ACCOUNT_ID  — Cloudflare account ID
 *   R2_ACCESS_KEY_ID       — R2 API token access key (S3-compatible)
 *   R2_SECRET_ACCESS_KEY   — R2 API token secret key
 *   R2_BUCKET_NAME         — defaults to 'ammaralam-me'
 */

import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import exifReader from 'exif-reader';
import path from 'path';

// Files in the photography/ R2 prefix that are NOT gallery images.
// The S3 SDK handles URL-encoding of keys internally — store raw filenames here.
const EXCLUDED_FILES = ['light_beam.jpg', 'light_beam-optimized.webp', 'manifest.json'];

// Thumbnail settings (match generate-thumbnails.js)
const THUMB_MIN_DIM = 1200;
const QUALITY = 85;

const bucket = process.env.R2_BUCKET_NAME || 'ammaralam-me';
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

if (!accountId || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
  console.error('Missing required env vars: CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY');
  process.exit(1);
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

function formatExposureTime(value) {
  if (!value) return null;
  if (value >= 1) return `${value}s`;
  return `1/${Math.round(1 / value)}s`;
}

async function extractExif(buffer) {
  try {
    const metadata = await sharp(buffer).metadata();
    if (!metadata.exif) return null;
    const exif = exifReader(metadata.exif);
    const photo = exif.Photo || exif.exif || {};
    const image = exif.Image || exif.image || {};
    const result = {};
    const make = image.Make;
    const model = image.Model;
    if (make && model) {
      result.camera = model.startsWith(make) ? model : `${make} ${model}`;
    } else if (model) {
      result.camera = model;
    }
    if (photo.LensModel) result.lens = photo.LensModel;
    if (photo.ISOSpeedRatings != null) result.iso = Array.isArray(photo.ISOSpeedRatings) ? photo.ISOSpeedRatings[0] : photo.ISOSpeedRatings;
    if (photo.ISO != null) result.iso = result.iso || photo.ISO;
    if (photo.FNumber != null) result.aperture = photo.FNumber;
    if (photo.ExposureTime != null) result.shutterSpeed = formatExposureTime(photo.ExposureTime);
    if (photo.FocalLength != null) result.focalLength = photo.FocalLength;
    return Object.keys(result).length > 0 ? result : null;
  } catch {
    return null;
  }
}

async function downloadFromR2(key) {
  // The S3 SDK handles URL-encoding of keys with spaces (e.g. '_DSF0788 1.jpg') internally.
  const res = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  return Buffer.from(await res.Body.transformToByteArray());
}

async function getManifest() {
  try {
    const res = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: 'photography/manifest.json' }));
    const text = await res.Body.transformToString();
    return JSON.parse(text);
  } catch (err) {
    if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
      console.log('  manifest.json not found on R2 — starting with empty manifest.');
      return { images: [] };
    }
    throw err;
  }
}

async function putManifest(manifest) {
  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: 'photography/manifest.json',
    Body: JSON.stringify(manifest, null, 2),
    ContentType: 'application/json',
    // Short cache so the photography page picks up changes within 5 min.
    CacheControl: 'max-age=300',
  }));
}

async function listGalleryFilenames() {
  // Using Delimiter '/' so only objects directly under photography/ are returned
  // (photography/thumbs/ and other sub-prefixes are excluded as CommonPrefixes).
  const res = await s3.send(new ListObjectsV2Command({
    Bucket: bucket,
    Prefix: 'photography/',
    Delimiter: '/',
  }));

  // Guard against silent truncation — throw rather than process an incomplete list.
  if (res.IsTruncated) {
    throw new Error('R2 listing was truncated (>1000 gallery images). Pagination is not implemented — split the gallery into sub-prefixes or implement NextContinuationToken handling.');
  }

  const keys = (res.Contents || [])
    .map(obj => path.basename(obj.Key))
    // Keep only JPEG files — filters out manifest.json, .webp files, etc.
    .filter(name => /\.(jpg|jpeg)$/i.test(name))
    // Exclude known non-gallery files (hero image etc.)
    .filter(name => !EXCLUDED_FILES.includes(name));

  return keys;
}

async function processImage(filename, batchIndex = 0) {
  console.log(`  Processing: ${filename}`);
  const buffer = await downloadFromR2(`photography/${filename}`);

  // Extract EXIF from the downloaded JPEG buffer
  const exif = await extractExif(buffer);

  // Generate WebP thumbnail (minimum dimension 1200px, quality 85)
  const meta = await sharp(buffer).metadata();
  const isLandscape = meta.width > meta.height;
  const { data: thumbData, info: thumbInfo } = await sharp(buffer)
    .resize(isLandscape ? null : THUMB_MIN_DIM, isLandscape ? THUMB_MIN_DIM : null)
    .webp({ quality: QUALITY })
    .toBuffer({ resolveWithObject: true });

  // Upload thumbnail to photography/thumbs/{stem}.webp
  const stem = path.parse(filename).name;
  const thumbKey = `photography/thumbs/${stem}.webp`;
  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: thumbKey,
    Body: thumbData,
    ContentType: 'image/webp',
  }));
  console.log(`    Thumbnail uploaded: ${thumbKey} (${thumbInfo.width}x${thumbInfo.height})`);

  // Upload orientation-corrected display JPEG — pixels rotated per EXIF, EXIF orientation tag stripped.
  // LightGallery serves this instead of the raw original so both filmstrip and modal are consistently oriented.
  const displayData = await sharp(buffer)
    .jpeg({ quality: 95 })
    .toBuffer();
  const displayKey = `photography/display/${filename}`;
  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: displayKey,
    Body: displayData,
    ContentType: 'image/jpeg',
  }));
  console.log(`    Display JPEG uploaded: ${displayKey}`);

  return {
    filename,
    ...(exif || {}),
    thumbWidth: thumbInfo.width,
    thumbHeight: thumbInfo.height,
    // Offset by batchIndex seconds so same-run images sort in a stable, deterministic order.
    uploadedAt: new Date(Date.now() + batchIndex * 1000).toISOString(),
  };
}

async function main() {
  console.log('CDN-as-CMS: Processing new photos...\n');

  const [r2Filenames, manifest, displayRes] = await Promise.all([
    listGalleryFilenames(),
    getManifest(),
    s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: 'photography/display/', Delimiter: '/' })),
  ]);

  const manifestFilenames = new Set(manifest.images.map(img => img.filename));
  const r2FilenameSet = new Set(r2Filenames);

  const newFilenames = r2Filenames.filter(f => !manifestFilenames.has(f));
  const deletedFilenames = manifest.images
    .map(img => img.filename)
    .filter(f => !r2FilenameSet.has(f));

  const existingDisplayStems = new Set(
    (displayRes.Contents || []).map(obj => path.parse(path.basename(obj.Key)).name)
  );
  const forceDisplay = process.env.FORCE_DISPLAY_REPROCESS === 'true';
  const needsBackfill = manifest.images
    .map(img => img.filename)
    .filter(f => forceDisplay || !existingDisplayStems.has(path.parse(f).name));

  console.log(`  R2 gallery images: ${r2Filenames.length}`);
  console.log(`  Manifest images:   ${manifest.images.length}`);
  console.log(`  New:               ${newFilenames.length}`);
  console.log(`  Deleted:           ${deletedFilenames.length}`);
  console.log(`  Missing display:   ${needsBackfill.length}\n`);

  if (newFilenames.length === 0 && deletedFilenames.length === 0 && needsBackfill.length === 0) {
    console.log('No changes detected. Nothing to do.');
    process.exit(0);
  }

  // Process new images sequentially to avoid memory pressure from sharp
  const newEntries = [];
  const failed = [];
  for (let i = 0; i < newFilenames.length; i++) {
    const filename = newFilenames[i];
    try {
      const entry = await processImage(filename, i);
      newEntries.push(entry);
    } catch (err) {
      console.error(`  Failed to process ${filename}: ${err.message}`);
      failed.push(filename);
    }
  }

  // Remove deleted entries
  if (deletedFilenames.length > 0) {
    console.log(`\n  Removing ${deletedFilenames.length} deleted image(s) from manifest:`);
    deletedFilenames.forEach(f => console.log(`    - ${f}`));
    manifest.images = manifest.images.filter(img => r2FilenameSet.has(img.filename));
  }

  // Add new entries and sort newest-first.
  // Intentional: manifest is written even on partial failure so that successfully-processed
  // images are persisted and failed images (absent from manifest) are retried on the next run.
  manifest.images.push(...newEntries);
  manifest.images.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

  // Write updated manifest back to R2
  await putManifest(manifest);
  console.log(`\n  manifest.json updated on R2 (${manifest.images.length} total images).`);

  // Backfill display JPEGs for any existing manifest images that pre-date this feature.
  if (needsBackfill.length > 0) {
    console.log(`\n  Backfilling display JPEGs for ${needsBackfill.length} image(s)...`);
    for (const filename of needsBackfill) {
      try {
        const buf = await downloadFromR2(`photography/${filename}`);
        const displayData = await sharp(buf).jpeg({ quality: 95 }).toBuffer();
        await s3.send(new PutObjectCommand({
          Bucket: bucket,
          Key: `photography/display/${filename}`,
          Body: displayData,
          ContentType: 'image/jpeg',
        }));
        console.log(`    Backfilled: photography/display/${filename}`);
      } catch (err) {
        console.error(`  Failed to backfill ${filename}: ${err.message}`);
      }
    }
  }

  if (failed.length > 0) {
    console.error(`\n  ${failed.length} image(s) failed processing: ${failed.join(', ')}`);
    process.exit(1);
  }

  console.log('\nDone.');
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
