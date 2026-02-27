import sharp from 'sharp';
import exifReader from 'exif-reader';
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourceDir = path.join(__dirname, '../public/images');
const outputDir = path.join(__dirname, '../.thumbs');

const R2_BUCKET = 'ammaralam-me';
const metadataOutputPath = path.join(__dirname, '../src/data/photo-metadata.json');

// Configuration
const THUMB_MIN_DIM = 1200;
const QUALITY = 85;
const HERO_WIDTH = 1920;
const HERO_QUALITY = 80;

let uploadCount = 0;
let totalUploads = 0;

function uploadToR2(localPath, r2Key) {
  uploadCount++;
  console.log(`  ↑ [${uploadCount}/${totalUploads}] ${r2Key}`);
  execSync(`wrangler r2 object put "${R2_BUCKET}/${r2Key}" --file="${localPath}" --remote`, {
    stdio: 'pipe',
  });
}

function formatExposureTime(value) {
  if (!value) return null;
  if (value >= 1) return `${value}s`;
  return `1/${Math.round(1 / value)}s`;
}

async function extractExif(inputPath) {
  try {
    const metadata = await sharp(inputPath).metadata();
    if (!metadata.exif) return null;
    const exif = exifReader(metadata.exif);
    const photo = exif.Photo || exif.exif || {};
    const image = exif.Image || exif.image || {};
    const result = {};
    const make = image.Make;
    const model = image.Model;
    if (make && model) {
      // Remove make from model if duplicated (e.g. "FUJIFILM X-T30 II")
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

async function generateThumbnails() {
  console.log('🖼️  Generating optimized thumbnails...\n');

  // Create temp output directory
  await fs.mkdir(outputDir, { recursive: true });

  // Get all image files
  const files = await fs.readdir(sourceDir);
  const imageFiles = files.filter(f => /\.(jpg|jpeg)$/i.test(f) && f !== 'light_beam.jpg');

  const photoMetadata = {};
  const succeeded = [];
  const failed = [];

  // Check if hero image exists to include in upload count
  const heroInput = path.join(sourceDir, 'light_beam.jpg');
  let hasHero = false;
  try { await fs.access(heroInput); hasHero = true; } catch {}

  totalUploads = imageFiles.length * 2 + (hasHero ? 2 : 0);
  for (const file of imageFiles) {
    const inputPath = path.join(sourceDir, file);
    const outputFilename = path.parse(file).name + '.webp';
    const outputPath = path.join(outputDir, outputFilename);

    try {
      const meta = await sharp(inputPath).metadata();
      const isLandscape = meta.width > meta.height;
      const thumbInfo = await sharp(inputPath)
        .resize(isLandscape ? null : THUMB_MIN_DIM, isLandscape ? THUMB_MIN_DIM : null)
        .webp({ quality: QUALITY })
        .toFile(outputPath);

      // Extract EXIF metadata
      const exif = await extractExif(inputPath);
      photoMetadata[file] = {
        ...(exif || {}),
        thumbWidth: thumbInfo.width,
        thumbHeight: thumbInfo.height,
      };

      uploadToR2(inputPath, `photography/${file}`);
      uploadToR2(outputPath, `photography/thumbs/${outputFilename}`);
      succeeded.push(file);
    } catch (err) {
      failed.push({ file, error: err.message });
    }
  }

  // Write EXIF metadata JSON (only for succeeded photos)
  await fs.mkdir(path.dirname(metadataOutputPath), { recursive: true });
  await fs.writeFile(metadataOutputPath, JSON.stringify(photoMetadata, null, 2) + '\n');

  // Optimize and upload hero background image
  if (hasHero) {
    try {
      const heroOutput = path.join(outputDir, 'light_beam-optimized.webp');

      await sharp(heroInput)
        .resize(HERO_WIDTH, null, { fit: 'inside' })
        .webp({ quality: HERO_QUALITY })
        .toFile(heroOutput);

      uploadToR2(heroInput, 'photography/light_beam.jpg');
      uploadToR2(heroOutput, 'photography/light_beam-optimized.webp');
    } catch (err) {
      failed.push({ file: 'light_beam.jpg (hero)', error: err.message });
    }
  }

  // Clean up temp directory
  await fs.rm(outputDir, { recursive: true });

  // Summary
  console.log('\n' + '—'.repeat(50));
  console.log(`  ${succeeded.length} succeeded, ${failed.length} failed out of ${imageFiles.length} photos`);
  if (failed.length > 0) {
    console.log('\n  Failed photos:');
    for (const { file, error } of failed) {
      console.log(`    ✗ ${file}: ${error}`);
    }
    console.log('');
    process.exit(1);
  } else {
    console.log('\n✅ All thumbnails generated and uploaded to R2!');
  }
}

generateThumbnails().catch(console.error);
