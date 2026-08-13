export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/get-user';
import { createAdminClient } from '@/lib/supabase';
import AdmZip from 'adm-zip';
import mjml2html from 'mjml';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

type Params = { params: Promise<{ id: string }> };

const BRAND_FILES = [
  'logo-white.png',
  'logo-dark.png',
  'social-facebook.png',
  'social-instagram.png',
  'social-linkedin.png',
  'social-tiktok.png',
  'social-youtube.png',
];

// Matches absolute brand URLs that the MJML renderer injects (e.g. https://…/brand/logo-dark.png)
const BRAND_URL_RE = /https?:\/\/[^\s"'<>]+\/brand\/([\w.-]+)/g;
// Matches embedded base64 data URLs (images pasted/uploaded in the editor)
const DATA_URL_RE = /data:image\/([a-zA-Z]+);base64,([^"'\s<>]+)/g;

function toSlug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);
}

function makeReadme(subject: string): string {
  return `HitPay EDM
==========
Subject : ${subject}

CONTENTS
--------
index.mjml      -- Source MJML (upload this ZIP to Loops)
index.html      -- Local preview (open in browser after extracting)
img/            -- All images (Loops hosts these on its CDN automatically)

HOW TO UPLOAD TO LOOPS
----------------------
1. Extract this ZIP and open index.html in a browser to preview.
2. In Loops: Campaigns > New Campaign > Upload MJML > select this ZIP file.
   Loops will rewrite all img/ paths to its CDN at send time.

NOTES
-----
- {unsubscribe_link} is replaced by Loops at send time.
`;
}

export async function POST(_req: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('id, subject, mjml_content')
    .eq('id', id)
    .single();

  if (error || !campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  if (!campaign.mjml_content) return NextResponse.json({ error: 'Campaign has no rendered content. Save first.' }, { status: 400 });

  // --- Extract embedded data URL images and replace with img/ paths ---
  const dataUrlImages: { name: string; buffer: Buffer }[] = [];
  let imgCounter = 0;

  let processedMjml = campaign.mjml_content.replace(DATA_URL_RE, (_, mime: string, b64: string) => {
    imgCounter++;
    const ext = mime === 'jpeg' ? 'jpg' : mime;
    const name = `user-img-${imgCounter}.${ext}`;
    dataUrlImages.push({ name, buffer: Buffer.from(b64, 'base64') });
    return `img/${name}`;
  });

  // --- Replace absolute brand URLs with relative img/ paths ---
  processedMjml = processedMjml.replace(BRAND_URL_RE, (_, filename: string) => `img/${filename}`);

  // --- Recompile MJML → HTML so the local preview also uses img/ paths ---
  const { html: compiledHtml } = mjml2html(processedMjml, { validationLevel: 'skip' });

  // --- Build ZIP ---
  const zip = new AdmZip();

  // User-uploaded images (extracted from data URLs)
  for (const img of dataUrlImages) {
    zip.addFile(`img/${img.name}`, img.buffer);
  }

  // Static brand assets from public/brand/
  const brandDir = join(process.cwd(), 'public', 'brand');
  for (const filename of BRAND_FILES) {
    const filePath = join(brandDir, filename);
    if (existsSync(filePath)) {
      zip.addFile(`img/${filename}`, readFileSync(filePath));
    }
  }

  zip.addFile('index.mjml', Buffer.from(processedMjml, 'utf-8'));
  zip.addFile('index.html', Buffer.from(compiledHtml, 'utf-8'));
  zip.addFile('README.txt', Buffer.from(makeReadme(campaign.subject), 'utf-8'));

  const zipBuffer = zip.toBuffer();
  const filename = `edm-${toSlug(campaign.subject)}.zip`;

  return new NextResponse(zipBuffer, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(zipBuffer.length),
    },
  });
}
