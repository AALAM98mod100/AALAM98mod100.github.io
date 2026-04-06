/**
 * One-time migration script: seeds photography/manifest.json on R2
 * from the existing photo metadata (embedded below).
 *
 * Run once locally: node scripts/seed-manifest.js
 * Requires wrangler auth (same as generate-thumbnails.js).
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const R2_BUCKET = 'ammaralam-me';

// Gallery filenames in original display order (ascending shoot order).
// light_beam.jpg is excluded — it is the hero background, not a gallery image.
const GALLERY_FILENAMES = [
  '_DSF0436.jpg',
  '_DSF0449.jpg',
  '_DSF0451.jpg',
  '_DSF0466.jpg',
  '_DSF0686.jpg',
  '_DSF0788 1.jpg',
  '_DSF3075.jpg',
  '_DSF3114.jpg',
  '_DSF3126.jpg',
  '_DSF3143.jpg',
  '_DSF3171.jpg',
  '_DSF3225.jpg',
  '_DSF3381.jpg',
  '_DSF3605.jpg',
  '_DSF3622.jpg',
  '_DSF3645 1.jpg',
  '_DSF3836.jpg',
  '_DSF4509.jpg',
  '_DSF4618.jpg',
  '_DSF4676.jpg',
  '_DSF4963 1.jpg',
  'akbarpura-leaf.jpg',
];

// EXIF + thumb dimensions from the original src/data/photo-metadata.json (now deleted).
// This data is embedded here to make the seed script self-contained.
const METADATA = {
  '_DSF0449.jpg': { camera: 'FUJIFILM X-T4', lens: 'XC35mmF2', iso: 160, aperture: 8, shutterSpeed: '1/320s', focalLength: 35, thumbWidth: 1932, thumbHeight: 1200 },
  '_DSF0451.jpg': { camera: 'FUJIFILM X-T4', lens: 'XC35mmF2', iso: 160, aperture: 8, shutterSpeed: '1/350s', focalLength: 35, thumbWidth: 1200, thumbHeight: 1500 },
  '_DSF0466.jpg': { camera: 'FUJIFILM X-T4', lens: 'XC35mmF2', iso: 160, aperture: 8, shutterSpeed: '1/45s', focalLength: 35, thumbWidth: 1754, thumbHeight: 1200 },
  '_DSF0686.jpg': { camera: 'FUJIFILM X-T4', lens: 'XC35mmF2', iso: 320, aperture: 2, shutterSpeed: '1/80s', focalLength: 35, thumbWidth: 3250, thumbHeight: 1200 },
  '_DSF0788 1.jpg': { camera: 'FUJIFILM X-T4', lens: 'XC35mmF2', iso: 160, aperture: 4, shutterSpeed: '1/1800s', focalLength: 35, thumbWidth: 3250, thumbHeight: 1200 },
  '_DSF3075.jpg': { camera: 'FUJIFILM X-T4', lens: 'XC35mmF2', iso: 320, aperture: 2, shutterSpeed: '1/75s', focalLength: 35, thumbWidth: 1800, thumbHeight: 1200 },
  '_DSF3114.jpg': { camera: 'FUJIFILM X-T4', lens: 'XF16-80mmF4 R OIS WR', iso: 160, aperture: 4, shutterSpeed: '1/28s', focalLength: 50.5, thumbWidth: 1800, thumbHeight: 1200 },
  '_DSF3126.jpg': { camera: 'FUJIFILM X-T4', lens: 'XF16-80mmF4 R OIS WR', iso: 160, aperture: 5.6, shutterSpeed: '1/1250s', focalLength: 58.6, thumbWidth: 1200, thumbHeight: 1800 },
  '_DSF3143.jpg': { camera: 'FUJIFILM X-T4', lens: 'XF16-80mmF4 R OIS WR', iso: 160, aperture: 8, shutterSpeed: '1/58s', focalLength: 80, thumbWidth: 2800, thumbHeight: 1200 },
  '_DSF3171.jpg': { camera: 'FUJIFILM X-T4', lens: 'XF16-80mmF4 R OIS WR', iso: 160, aperture: 5.6, shutterSpeed: '1/1000s', focalLength: 52.4, thumbWidth: 2400, thumbHeight: 1200 },
  '_DSF3225.jpg': { camera: 'FUJIFILM X-T4', lens: 'XF16-80mmF4 R OIS WR', iso: 160, aperture: 4, shutterSpeed: '1/240s', focalLength: 60.8, thumbWidth: 1800, thumbHeight: 1200 },
  '_DSF3381.jpg': { camera: 'FUJIFILM X-T4', lens: 'XF16-80mmF4 R OIS WR', iso: 160, aperture: 8, shutterSpeed: '1/900s', focalLength: 16, thumbWidth: 3073, thumbHeight: 1200 },
  '_DSF3605.jpg': { camera: 'FUJIFILM X-T4', lens: 'XC35mmF2', iso: 400, aperture: 2, shutterSpeed: '1/52s', focalLength: 35, thumbWidth: 1200, thumbHeight: 1200 },
  '_DSF3645 1.jpg': { camera: 'FUJIFILM X-T4', lens: 'XF16-80mmF4 R OIS WR', iso: 160, aperture: 5.6, shutterSpeed: '1/28s', focalLength: 80, thumbWidth: 1200, thumbHeight: 1901 },
  '_DSF3836.jpg': { camera: 'FUJIFILM X-T4', lens: 'XF16-80mmF4 R OIS WR', iso: 160, aperture: 8, shutterSpeed: '1/600s', focalLength: 22.3, thumbWidth: 2799, thumbHeight: 1200 },
  '_DSF4509.jpg': { camera: 'FUJIFILM X-T4', lens: 'XF16-80mmF4 R OIS WR', iso: 400, aperture: 5.6, shutterSpeed: '1/30s', focalLength: 80, thumbWidth: 3249, thumbHeight: 1200 },
  '_DSF4618.jpg': { camera: 'FUJIFILM X-T4', lens: 'XC35mmF2', iso: 1000, aperture: 2, shutterSpeed: '1/52s', focalLength: 35, thumbWidth: 1200, thumbHeight: 1800 },
  '_DSF4676.jpg': { camera: 'FUJIFILM X-T4', lens: 'XC35mmF2', iso: 500, aperture: 2, shutterSpeed: '1/52s', focalLength: 35, thumbWidth: 1200, thumbHeight: 1600 },
  '_DSF4963 1.jpg': { camera: 'FUJIFILM X-T4', lens: 'XF16-80mmF4 R OIS WR', iso: 160, aperture: 5.6, shutterSpeed: '1/500s', focalLength: 56.5, thumbWidth: 1200, thumbHeight: 1200 },
  'akbarpura-leaf.jpg': { camera: 'FUJIFILM X-T4', lens: 'XF16-80mmF4 R OIS WR', iso: 160, aperture: 5.6, shutterSpeed: '1/60s', focalLength: 48.5, thumbWidth: 3249, thumbHeight: 1200 },
  '_DSF0436.jpg': { thumbWidth: 1200, thumbHeight: 1200 },
  '_DSF3622.jpg': { thumbWidth: 1200, thumbHeight: 1832 },
};

async function seedManifest() {
  console.log('Seeding photography/manifest.json on R2...\n');

  // Assign synthetic dates: newest-first, 1 day apart, ending at 2026-04-06.
  // Reverse the array so the last item in GALLERY_FILENAMES gets the most recent date.
  const baseDate = new Date('2026-04-06T00:00:00.000Z');
  const reversed = [...GALLERY_FILENAMES].reverse();

  const images = reversed.map((filename, index) => {
    const meta = METADATA[filename] || {};
    const uploadedAt = new Date(baseDate.getTime() - index * 24 * 60 * 60 * 1000).toISOString();
    const entry = { filename, uploadedAt };
    if (meta.camera) entry.camera = meta.camera;
    if (meta.lens) entry.lens = meta.lens;
    if (meta.iso != null) entry.iso = meta.iso;
    if (meta.aperture != null) entry.aperture = meta.aperture;
    if (meta.shutterSpeed) entry.shutterSpeed = meta.shutterSpeed;
    if (meta.focalLength != null) entry.focalLength = meta.focalLength;
    if (meta.thumbWidth != null) entry.thumbWidth = meta.thumbWidth;
    if (meta.thumbHeight != null) entry.thumbHeight = meta.thumbHeight;
    return entry;
  });

  const manifest = { images };

  // Write to a temp file and upload via wrangler
  const tempPath = path.join(__dirname, '../.manifest-seed-temp.json');
  await fs.writeFile(tempPath, JSON.stringify(manifest, null, 2) + '\n');

  console.log(`  Prepared manifest with ${images.length} images.`);
  console.log('  Uploading to R2...');

  try {
    execSync(
      `wrangler r2 object put "${R2_BUCKET}/photography/manifest.json" --file="${tempPath}" --content-type="application/json" --remote`,
      { stdio: 'inherit' },
    );
    console.log('\n  manifest.json uploaded to R2 at photography/manifest.json');
    console.log('  Verify: curl https://cdn.ammaralam.me/photography/manifest.json | python3 -m json.tool');
  } finally {
    await fs.unlink(tempPath).catch(() => {});
  }
}

seedManifest().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
