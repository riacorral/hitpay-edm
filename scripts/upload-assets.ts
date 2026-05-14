import { put } from '@vercel/blob';
import { readFileSync } from 'fs';
import { join } from 'path';

const ASSETS_DIR = '/Users/adityaharipurkar/Documents/HitPay Assets';

const uploads = [
  // Hauora fonts
  {
    localPath: join(ASSETS_DIR, 'Fonts and Logos/Fonts/Hauora/webfonts/Hauora-Regular.woff2'),
    blobPath: 'hitpay-edm/Hauora-Regular.woff2',
    contentType: 'font/woff2',
  },
  {
    localPath: join(ASSETS_DIR, 'Fonts and Logos/Fonts/Hauora/webfonts/Hauora-SemiBold.woff2'),
    blobPath: 'hitpay-edm/Hauora-SemiBold.woff2',
    contentType: 'font/woff2',
  },
  {
    localPath: join(ASSETS_DIR, 'Fonts and Logos/Fonts/Hauora/webfonts/Hauora-Bold.woff2'),
    blobPath: 'hitpay-edm/Hauora-Bold.woff2',
    contentType: 'font/woff2',
  },
  // Logos (SVG for sharpness)
  {
    localPath: join(ASSETS_DIR, 'Fonts and Logos/Logo/HitPay/HitPay.svg'),
    blobPath: 'hitpay-edm/logo-dark.svg',
    contentType: 'image/svg+xml',
  },
  {
    localPath: join(ASSETS_DIR, 'Fonts and Logos/Logo/HitPay White/HitPay_White.svg'),
    blobPath: 'hitpay-edm/logo-white.svg',
    contentType: 'image/svg+xml',
  },
  // Logo PNGs (better email client support)
  {
    localPath: join(ASSETS_DIR, 'Fonts and Logos/Logo/HitPay/HitPay@2x.png'),
    blobPath: 'hitpay-edm/logo-dark@2x.png',
    contentType: 'image/png',
  },
  {
    localPath: join(ASSETS_DIR, 'Fonts and Logos/Logo/HitPay White/HitPay_White@2x.png'),
    blobPath: 'hitpay-edm/logo-white@2x.png',
    contentType: 'image/png',
  },
];

async function main() {
  for (const upload of uploads) {
    const file = readFileSync(upload.localPath);
    const blob = await put(upload.blobPath, file, {
      access: 'public',
      contentType: upload.contentType,
    });
    console.log(`${upload.blobPath} → ${blob.url}`);
  }
}

main().catch(console.error);
