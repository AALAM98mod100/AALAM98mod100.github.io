import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourceDir = path.join(__dirname, '../public/images');
const outputDir = path.join(__dirname, '../.thumbs');

const R2_BUCKET = 'ammaralam-me';

// Configuration
const THUMB_WIDTH = 800;
const QUALITY = 85;
const HERO_WIDTH = 1920;
const HERO_QUALITY = 80;

function uploadToR2(localPath, r2Key) {
  console.log(`  ↑ Uploading to ${r2Key}`);
  execSync(`wrangler r2 object put "${R2_BUCKET}/${r2Key}" --file="${localPath}" --remote`, {
    stdio: 'inherit',
  });
}

async function generateThumbnails() {
  console.log('🖼️  Generating optimized thumbnails...\n');

  // Create temp output directory
  await fs.mkdir(outputDir, { recursive: true });

  // Get all image files
  const files = await fs.readdir(sourceDir);
  const imageFiles = files.filter(f => /\.(jpg|jpeg)$/i.test(f) && f !== 'light_beam.jpg');

  // Generate and upload thumbnails for gallery images
  for (const file of imageFiles) {
    const inputPath = path.join(sourceDir, file);
    const outputFilename = path.parse(file).name + '.webp';
    const outputPath = path.join(outputDir, outputFilename);

    await sharp(inputPath)
      .resize(THUMB_WIDTH, null, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: QUALITY })
      .toFile(outputPath);

    console.log(`  ✓ ${file} → ${outputFilename}`);
    uploadToR2(inputPath, `photography/${file}`);
    uploadToR2(outputPath, `photography/thumbs/${outputFilename}`);
    console.log('');
  }

  // Optimize and upload hero background image
  const heroInput = path.join(sourceDir, 'light_beam.jpg');
  const heroOutput = path.join(outputDir, 'light_beam-optimized.webp');

  await sharp(heroInput)
    .resize(HERO_WIDTH, null, { fit: 'inside' })
    .webp({ quality: HERO_QUALITY })
    .toFile(heroOutput);

  console.log(`  ✓ light_beam.jpg → light_beam-optimized.webp`);
  uploadToR2(heroInput, 'photography/light_beam.jpg');
  uploadToR2(heroOutput, 'photography/light_beam-optimized.webp');

  // Clean up temp directory
  await fs.rm(outputDir, { recursive: true });

  console.log('\n✅ Thumbnails generated and uploaded to R2!');
}

generateThumbnails().catch(console.error);
