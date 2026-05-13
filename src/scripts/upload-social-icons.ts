/**
 * One-time script to upload social icons to Vercel Blob.
 *
 * Run with: BLOB_READ_WRITE_TOKEN=xxx npx tsx src/scripts/upload-social-icons.ts
 */
import { put } from '@vercel/blob';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const imagesDir = join(__dirname, '../../emails/images');

const files = [
  { name: 'hitpay-logogram.svg', type: 'image/svg+xml' },
  { name: 'social-instagram.png', type: 'image/png' },
  { name: 'social-facebook.png', type: 'image/png' },
  { name: 'social-linkedin.png', type: 'image/png' },
  { name: 'social-tiktok.png', type: 'image/png' },
  { name: 'social-youtube.png', type: 'image/png' },
];

for (const file of files) {
  const buffer = readFileSync(join(imagesDir, file.name));
  const blob = await put(`hitpay-edm/${file.name}`, buffer, {
    access: 'public',
    contentType: file.type,
    addRandomSuffix: false,
  });
  console.log(`✓ ${file.name} → ${blob.url}`);
}

console.log('\nAll social icons uploaded.');
