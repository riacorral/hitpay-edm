import { readFileSync } from 'fs';
import { loadConfig } from '../src/commands/init.js';

const SESSION = loadConfig().loopsSessionToken!;
const EMAIL_MSG_ID = process.argv[2];
const HTML_PATH = process.argv[3];

if (!EMAIL_MSG_ID || !HTML_PATH) {
  console.error('Usage: npx tsx scripts/upload-to-loops.ts <emailMessageId> <htmlPath>');
  process.exit(1);
}

const html = readFileSync(HTML_PATH, 'utf-8');

// Step 1: Get presigned URL for MJML upload
console.log('Getting presigned upload URL...');
const presignRes = await fetch(
  `https://app.loops.so/api/emailMessages/${EMAIL_MSG_ID}/upload-mjml-zip`,
  {
    method: 'POST',
    headers: {
      'Cookie': `__Secure-next-auth.session-token=${SESSION}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ filename: 'email.zip' }),
    signal: AbortSignal.timeout(10000),
  },
);

if (presignRes.ok) {
  const presignData = await presignRes.json() as { presignedUrl?: string };
  console.log('Presign response:', JSON.stringify(presignData));

  if (presignData.presignedUrl) {
    // Upload the HTML as a file to the presigned S3 URL
    console.log('Uploading HTML to S3...');
    const uploadRes = await fetch(presignData.presignedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'text/html' },
      body: html,
    });
    console.log('Upload status:', uploadRes.status);
  }
} else {
  console.log('Presign failed:', presignRes.status);
  const text = await presignRes.text();
  console.log('Response:', text.slice(0, 500));
}

// Step 2: Also try setting the campaign name via the campaigns update endpoint
const CAMPAIGN_ID = 'cmm8r2czp1ic20izehqfuv47o';
console.log('\nUpdating campaign name...');
const nameRes = await fetch(
  `https://app.loops.so/api/campaigns/${CAMPAIGN_ID}`,
  {
    method: 'PUT',
    headers: {
      'Cookie': `__Secure-next-auth.session-token=${SESSION}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: '[EDM] Introducing Borderless QR' }),
  },
);
console.log('Name update status:', nameRes.status);
if (nameRes.ok) {
  const nameData = await nameRes.json();
  console.log('Response:', JSON.stringify(nameData).slice(0, 300));
}
