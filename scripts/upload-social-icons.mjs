/**
 * Generate social icon PNGs from simple-icons and upload to Vercel Blob.
 * Run once: node scripts/upload-social-icons.mjs
 */
import { readFileSync } from 'fs';
import sharp from 'sharp';
import { put } from '@vercel/blob';

// Load env
const env = readFileSync('.env.vercel', 'utf8');
const blobToken = env.match(/BLOB_READ_WRITE_TOKEN="?([^"\n]+)"?/)?.[1]?.trim();
if (!blobToken) throw new Error('No BLOB_READ_WRITE_TOKEN in .env.vercel');

// Import simple-icons
const si = await import('simple-icons');

const ICONS = [
  { name: 'instagram', key: 'siInstagram', color: '#E1306C' },
  { name: 'facebook',  key: 'siFacebook',  color: '#1877F2' },
  { name: 'linkedin',  key: 'siLinkedin',  color: '#0A66C2' },
  { name: 'tiktok',    key: 'siTiktok',    color: '#010101' },
  { name: 'youtube',   key: 'siYoutube',   color: '#FF0000' },
];

const SIZE = 48; // 48px → displayed at 24px (2x Retina)
const RADIUS = SIZE / 2;

for (const icon of ICONS) {
  const siIcon = si[icon.key];
  if (!siIcon) { console.error(`Icon not found: ${icon.key}`); continue; }

  // Scale simple-icons path (designed for 24x24 viewBox) to SIZE
  const scale = SIZE / 24;
  const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <circle cx="${RADIUS}" cy="${RADIUS}" r="${RADIUS}" fill="${icon.color}"/>
  <g transform="translate(${(SIZE - 24 * scale) / 2 + 6}, ${(SIZE - 24 * scale) / 2 + 6}) scale(${scale * 0.5})">
    <path d="${siIcon.path}" fill="white"/>
  </g>
</svg>`.trim();

  const buf = await sharp(Buffer.from(svgContent)).png().toBuffer();

  const blob = await put(`hitpay-edm/social-${icon.name}.png`, buf, {
    access: 'public',
    token: blobToken,
    addRandomSuffix: false,
  });

  console.log(`✓ ${icon.name}: ${blob.url}`);
}

// Also upload the logogram (HitPay "H" mark)
const logogramSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#002771"/>
  <text x="16" y="23" font-family="Arial,sans-serif" font-size="22" font-weight="bold" fill="white" text-anchor="middle">H</text>
</svg>`.trim();

const logoBuf = await sharp(Buffer.from(logogramSvg)).png().toBuffer();
const logoBlob = await put('hitpay-edm/hitpay-logogram.png', logoBuf, {
  access: 'public',
  token: blobToken,
  addRandomSuffix: false,
});
console.log(`✓ logogram: ${logoBlob.url}`);
