/**
 * Build a Loops-ready ZIP (index.mjml + index.html + local img/ + README.txt)
 * from a markdown EDM file — the same package the app's "Download ZIP for Loops"
 * button produces, but driven from a local .md file.
 *
 * Usage: npx tsx src/scripts/build-loops-zip.mts emails/<file>.md
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { basename, join, resolve } from 'path';
import AdmZip from 'adm-zip';
import mjml2html from 'mjml';
import { parseEdm } from '../parser/markdown.js';
import { generateMjml, minifyEmailHtml } from '../renderer/mjml.js';

const BRAND_URL_RE = /https?:\/\/[^\s"'<>]+\/brand\/([\w.-]+)/g;
const REMOTE_IMG_RE = /https?:\/\/[^\s"'<>]+\.(?:jpe?g|png|webp|gif)/gi;
// Inline base64 images (e.g. footer logo/social icons in mjml.ts) — most email
// clients (Gmail, Outlook) strip or fail to render data: URI <img> tags, so these
// must be bundled as real files, same as loops/client.ts's bundleBase64Images.
const BASE64_IMG_RE = /data:image\/([a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)/g;

async function fetchBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const mdPath = resolve(process.argv[2]);
  if (!existsSync(mdPath)) throw new Error(`File not found: ${mdPath}`);

  const edm = parseEdm(readFileSync(mdPath, 'utf-8'));
  let mjml = generateMjml(edm);

  const imgFiles: { name: string; buffer: Buffer }[] = [];
  const seen = new Map<string, string>(); // url -> img/name

  // 1. Brand assets → img/<file> (copy from public/brand/)
  const brandDir = join(process.cwd(), 'public', 'brand');
  mjml = mjml.replace(BRAND_URL_RE, (_m, filename: string) => {
    const local = `img/${filename}`;
    if (!seen.has(filename)) {
      const p = join(brandDir, filename);
      if (existsSync(p)) imgFiles.push({ name: filename, buffer: readFileSync(p) });
      seen.set(filename, local);
    }
    return local;
  });

  // 1b. Inline base64 images → img/<file> (decode to real files)
  {
    let counter = 0;
    mjml = mjml.replace(BASE64_IMG_RE, (fullMatch, rawExt: string) => {
      if (seen.has(fullMatch)) return seen.get(fullMatch)!;
      const ext = rawExt.toLowerCase() === 'jpeg' ? 'jpg' : rawExt.toLowerCase();
      counter++;
      const name = `inline-${counter}.${ext}`;
      const base64Data = fullMatch.slice(fullMatch.indexOf(',') + 1);
      imgFiles.push({ name, buffer: Buffer.from(base64Data, 'base64') });
      const local = `img/${name}`;
      seen.set(fullMatch, local);
      return local;
    });
  }

  // 2. Remaining remote images (hero + inline) → download to img/.
  //    If a URL is unreachable (404 etc.), leave it as-is and report it.
  const remoteUrls = [...new Set((mjml.match(REMOTE_IMG_RE) ?? []))];
  const missing: string[] = [];
  let counter = 0;
  for (const url of remoteUrls) {
    if (seen.has(url)) continue;
    counter++;
    const ext = (url.match(/\.(jpe?g|png|webp|gif)/i)?.[1] ?? 'jpg').toLowerCase().replace('jpeg', 'jpg');
    const name = counter === 1 ? `hero.${ext}` : `image-${counter - 1}.${ext}`;
    try {
      const buffer = await fetchBuffer(url);
      imgFiles.push({ name, buffer });
      seen.set(url, `img/${name}`);
      console.log(`  ↓ ${name}  ←  ${url}`);
    } catch (e) {
      missing.push(url);
      console.warn(`  ✗ MISSING (${(e as Error).message}) — left as remote URL: ${url}`);
    }
  }
  // Rewrite only the URLs we successfully downloaded
  mjml = mjml.replace(REMOTE_IMG_RE, (m) => seen.get(m) ?? m);

  // 2b. Local image files referenced by relative path (e.g. img/foo.png) → bundle as-is
  const localMissing: string[] = [];
  const LOCAL_IMG_RE = /(src|href)="([^"]+\.(?:jpe?g|png|webp|gif))"/gi;
  mjml = mjml.replace(LOCAL_IMG_RE, (full, _attr: string, src: string) => {
    if (/^https?:|^data:/i.test(src)) return full; // remote/data handled elsewhere
    const name = basename(src);
    if (imgFiles.some(f => f.name === name)) return full; // already bundled (brand/remote)
    const abs = join(process.cwd(), src);
    if (existsSync(abs)) {
      imgFiles.push({ name, buffer: readFileSync(abs) });
      console.log(`  + ${name}  (local)`);
      return full.replace(src, `img/${name}`);
    }
    localMissing.push(src);
    return full;
  });

  // 3. Recompile MJML → HTML so the local preview uses img/ paths
  const { html: rawHtml, errors } = mjml2html(mjml, { validationLevel: 'skip' });
  if (errors?.length) console.warn('MJML warnings:', errors.map(e => e.formattedMessage).join('\n'));
  // Minify — long campaigns can exceed Gmail's ~102KB clip threshold otherwise
  const html = minifyEmailHtml(rawHtml);
  console.log(`  HTML size: ${(rawHtml.length / 1024).toFixed(1)}KB -> ${(html.length / 1024).toFixed(1)}KB minified`);

  // 4. Build ZIP
  const zip = new AdmZip();
  for (const f of imgFiles) zip.addFile(`img/${f.name}`, f.buffer);
  zip.addFile('index.mjml', Buffer.from(mjml, 'utf-8'));
  zip.addFile('index.html', Buffer.from(html, 'utf-8'));
  zip.addFile('README.txt', Buffer.from(
`HitPay EDM
==========
Subject : ${edm.frontmatter.subject}

CONTENTS
--------
index.mjml   -- Source MJML (upload this ZIP to Loops)
index.html   -- Local preview (open in a browser after extracting)
img/         -- All images (Loops rehosts img/ paths on its CDN at send time)

HOW TO UPLOAD TO LOOPS
----------------------
1. Extract this ZIP and open index.html to preview.
2. In Loops: Campaigns > New Campaign > Upload MJML > select this ZIP.

NOTES
-----
- {unsubscribe_link} is replaced by Loops at send time.
`, 'utf-8'));

  const base = basename(mdPath).replace(/\.md$/, '');
  const outMjml = join(process.cwd(), 'emails', `${base}.mjml`);
  const outZip = join(process.cwd(), 'emails', `${base}.zip`);
  writeFileSync(outMjml, mjml);
  writeFileSync(outZip, zip.toBuffer());

  console.log(`\n✓ ${imgFiles.length} images bundled`);
  console.log(`✓ ${outMjml}`);
  console.log(`✓ ${outZip}`);
  if (missing.length) {
    console.log(`\n⚠ ${missing.length} remote image(s) could not be downloaded (left as remote URLs):`);
    for (const u of missing) console.log(`   - ${u}`);
  }
  if (localMissing.length) {
    console.log(`\n⚠ ${localMissing.length} local image(s) not found on disk (left as-is):`);
    for (const u of localMissing) console.log(`   - ${u}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
