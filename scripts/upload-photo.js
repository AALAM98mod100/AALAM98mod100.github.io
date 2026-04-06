/**
 * Upload a JPEG to R2 and immediately trigger the processing workflow.
 *
 * Usage: node scripts/upload-photo.js /path/to/photo.jpg
 *        node scripts/upload-photo.js /path/to/photo.jpg custom-name.jpg
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node scripts/upload-photo.js /path/to/photo.jpg [remote-filename.jpg]');
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

// Use provided remote name or just the basename of the source file
const remoteName = process.argv[3] || path.basename(filePath);
const r2Key = `ammaralam-me/photography/${remoteName}`;

console.log(`Uploading ${path.basename(filePath)} → R2 photography/${remoteName} ...`);
execSync(`wrangler r2 object put "${r2Key}" --file="${filePath}" --remote`, { stdio: 'inherit' });

console.log('\nTriggering photo processing workflow...');
execSync('gh workflow run process-new-photos.yml', { stdio: 'inherit' });

console.log(`\nDone. Check progress: gh run list --workflow=process-new-photos.yml`);
