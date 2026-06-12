/**
 * One-time script: upload static brand assets to Supabase Storage.
 * Run with: npx tsx src/scripts/migrate-brand-to-supabase.ts
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';

const SUPABASE_URL = 'https://gpmgkjbyolgpikphcxvl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbWdramJ5b2xncGlrcGhjeHZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODcyNzQ4MywiZXhwIjoyMDk0MzAzNDgzfQ.svppFCWibjFmhulQaHNppIw2rjCV8FosDQboxawL5Uw';

const BUCKET = 'hitpay-brand';
const EDM_IMAGES = '/Users/riacorral/Documents/HitPay-Claude/hitpay-edm-main/emails/images';
const BRANDING = '/Users/riacorral/Downloads/Branding';

const files = [
  // Logos
  {
    localPath: `${BRANDING}/Logo/HitPay/HitPay@2x.png`,
    storagePath: 'logo-dark.png',
    contentType: 'image/png',
  },
  {
    localPath: `${BRANDING}/Logo/HitPay White/HitPay_White@2x.png`,
    storagePath: 'logo-white.png',
    contentType: 'image/png',
  },
  // Social icons
  {
    localPath: `${EDM_IMAGES}/social-instagram.png`,
    storagePath: 'social-instagram.png',
    contentType: 'image/png',
  },
  {
    localPath: `${EDM_IMAGES}/social-facebook.png`,
    storagePath: 'social-facebook.png',
    contentType: 'image/png',
  },
  {
    localPath: `${EDM_IMAGES}/social-linkedin.png`,
    storagePath: 'social-linkedin.png',
    contentType: 'image/png',
  },
  {
    localPath: `${EDM_IMAGES}/social-tiktok.png`,
    storagePath: 'social-tiktok.png',
    contentType: 'image/png',
  },
  {
    localPath: `${EDM_IMAGES}/social-youtube.png`,
    storagePath: 'social-youtube.png',
    contentType: 'image/png',
  },
  // Logogram SVG
  {
    localPath: `${EDM_IMAGES}/hitpay-logogram.svg`,
    storagePath: 'hitpay-logogram.svg',
    contentType: 'image/svg+xml',
  },
];

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Create bucket if it doesn't exist
  const { error: bucketError } = await supabase.storage.createBucket(BUCKET, { public: true });
  if (bucketError && !bucketError.message.toLowerCase().includes('already exists')) {
    console.error('Could not create bucket:', bucketError.message);
    process.exit(1);
  }

  console.log(`\nUploading to Supabase Storage bucket: ${BUCKET}\n`);

  for (const file of files) {
    if (!existsSync(file.localPath)) {
      console.warn(`  SKIP (not found): ${file.localPath}`);
      continue;
    }
    const buffer = readFileSync(file.localPath);
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(file.storagePath, buffer, { contentType: file.contentType, upsert: true });

    if (error) {
      console.error(`  FAIL: ${file.storagePath} — ${error.message}`);
    } else {
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(file.storagePath);
      console.log(`  ✓ ${file.storagePath}`);
      console.log(`    ${data.publicUrl}`);
    }
  }

  console.log('\nDone. Update CDN constants in mjml.ts and src/brand/hitpay.ts.\n');
}

main().catch(console.error);
