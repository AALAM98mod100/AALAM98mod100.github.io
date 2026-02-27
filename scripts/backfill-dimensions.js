// One-time script to backfill thumbWidth/thumbHeight into photo-metadata.json
// by fetching existing thumbnails from R2.
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const metadataPath = path.join(__dirname, '../src/data/photo-metadata.json');
const R2_THUMB_BASE = 'https://cdn.ammaralam.me/photography/thumbs';

const imageFilenames = [
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
    'light_beam.jpg',
];

const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));

for (const filename of imageFilenames) {
    const thumbName = filename.replace(/\.jpg$/i, '.webp');
    const url = `${R2_THUMB_BASE}/${encodeURIComponent(thumbName)}`;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = Buffer.from(await res.arrayBuffer());
        const { width, height } = await sharp(buf).metadata();
        metadata[filename] = { ...(metadata[filename] || {}), thumbWidth: width, thumbHeight: height };
        console.log(`✓ ${filename}: ${width}x${height}`);
    } catch (err) {
        console.error(`✗ ${filename}: ${err.message}`);
    }
}

await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2) + '\n');
console.log('\nDone. photo-metadata.json updated.');
