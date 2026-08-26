import { writeFileSync, mkdirSync, rmSync, copyFileSync, existsSync } from 'fs';
import AdmZip from 'adm-zip';
import { join, basename, extname } from 'path';
import { tmpdir } from 'os';

const BASE_URL = 'https://app.loops.so';
const COOKIE_NAME = '__Secure-next-auth.session-token';
const DEFAULT_TEMPLATE_ID = 'ckxja0s6q0000yjr6vqouwn8a';

export interface CreateDraftResult {
  campaignId: string;
  emailMessageId: string;
  url: string;
  bundledBlobUrls: string[];
  bundledSupabasePaths: string[];
}

interface ZipUploadResult {
  bundledBlobUrls: string[];
  bundledSupabasePaths: string[];
}

export interface LoopsCampaign {
  id: string;
  name: string;
  status: string;
  emailMessage: {
    id: string;
    subject: string;
    previewText: string;
    mjmlUploaded: boolean;
  };
}

let activeSession = '';

export function initSession(token: string): void {
  activeSession = token;
}

function cookieHeader(): string {
  return `${COOKIE_NAME}=${activeSession}`;
}

export function refreshSession(
  res: Response,
  onRefresh?: (newToken: string) => void,
): void {
  const setCookie = res.headers.get('set-cookie');
  if (setCookie?.includes(`${COOKIE_NAME}=`)) {
    const newToken = setCookie.split(`${COOKIE_NAME}=`)[1].split(';')[0];
    activeSession = newToken;
    onRefresh?.(newToken);
  }
}

export async function loopsFetch(
  path: string,
  method: string,
  body?: unknown,
): Promise<Response> {
  const headers: Record<string, string> = {
    Cookie: cookieHeader(),
    'Content-Type': 'application/json',
  };
  if (method === 'PUT') {
    headers['X-Request-Timestamp'] = Date.now().toString();
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(30000),
  });
  refreshSession(res);
  return res;
}

export async function createDraftCampaign(
  sessionToken: string,
  subject: string,
  previewText: string,
  content: string,
  useMjml: boolean,
  campaignName?: string,
  onRefresh?: (newToken: string) => void,
): Promise<CreateDraftResult> {
  activeSession = sessionToken;

  // Step 1: Create campaign
  const createRes = await loopsFetch('/api/campaigns/create', 'POST', {
    templateId: DEFAULT_TEMPLATE_ID,
  });
  if (!createRes.ok) {
    const text = await createRes.text();
    throw new Error(`Failed to create campaign: ${createRes.status} ${text}`);
  }
  const createData = (await createRes.json()) as {
    success: boolean;
    campaignId: string;
  };
  const campaignId = createData.campaignId;

  // Step 2: Get the email message ID from the campaign
  const campRes = await loopsFetch(`/api/campaigns/${campaignId}`, 'GET');
  if (!campRes.ok) {
    throw new Error(`Failed to get campaign: ${campRes.status}`);
  }
  const campData = (await campRes.json()) as {
    campaign: { emailMessage: { id: string } };
  };
  const emailMessageId = campData.campaign.emailMessage.id;

  // Step 3: Set subject, preview text, and editor type to MJML
  const updateRes = await loopsFetch(
    `/api/emailMessages/${emailMessageId}/update`,
    'PUT',
    { subject, previewText, editorType: 'MJML' },
  );
  if (!updateRes.ok) {
    throw new Error(`Failed to update email: ${updateRes.status}`);
  }

  // Step 4: Upload content as MJML zip
  const zipResult = useMjml
    ? await uploadMjmlAsZip(emailMessageId, content)
    : await uploadHtmlAsZip(emailMessageId, content);

  // Step 5: Set campaign name
  await loopsFetch(`/api/campaigns/${campaignId}`, 'PUT', {
    name: campaignName ?? subject,
  });

  if (onRefresh && activeSession !== sessionToken) {
    onRefresh(activeSession);
  }

  const url = `${BASE_URL}/campaigns/${campaignId}/compose`;
  return { campaignId, emailMessageId, url, bundledBlobUrls: zipResult.bundledBlobUrls, bundledSupabasePaths: zipResult.bundledSupabasePaths };
}

export async function updateDraftCampaign(
  sessionToken: string,
  campaignId: string,
  subject: string,
  previewText: string,
  content: string,
  useMjml: boolean,
  onRefresh?: (newToken: string) => void,
): Promise<CreateDraftResult> {
  activeSession = sessionToken;

  // Step 1: Get emailMessageId from existing campaign
  const campRes = await loopsFetch(`/api/campaigns/${campaignId}`, 'GET');
  if (!campRes.ok) {
    throw new Error(`Failed to get campaign: ${campRes.status}`);
  }
  const campData = (await campRes.json()) as {
    campaign: { emailMessage: { id: string } };
  };
  const emailMessageId = campData.campaign.emailMessage.id;

  // Step 2: Update subject and preview text
  const updateRes = await loopsFetch(
    `/api/emailMessages/${emailMessageId}/update`,
    'PUT',
    { subject, previewText, editorType: 'MJML' },
  );
  if (!updateRes.ok) {
    throw new Error(`Failed to update email: ${updateRes.status}`);
  }

  // Step 3: Upload new content
  const zipResult = useMjml
    ? await uploadMjmlAsZip(emailMessageId, content)
    : await uploadHtmlAsZip(emailMessageId, content);

  // Step 4: Update campaign name
  await loopsFetch(`/api/campaigns/${campaignId}`, 'PUT', {
    name: `[EDM] ${subject}`,
  });

  if (onRefresh && activeSession !== sessionToken) {
    onRefresh(activeSession);
  }

  const url = `${BASE_URL}/campaigns/${campaignId}/compose`;
  return { campaignId, emailMessageId, url, bundledBlobUrls: zipResult.bundledBlobUrls, bundledSupabasePaths: zipResult.bundledSupabasePaths };
}

export async function getCampaign(
  sessionToken: string,
  campaignId: string,
): Promise<LoopsCampaign> {
  initSession(sessionToken);
  const res = await loopsFetch(`/api/campaigns/${campaignId}`, 'GET');
  if (!res.ok) {
    throw new Error(`Failed to get campaign: ${res.status}`);
  }
  const data = (await res.json()) as { campaign: LoopsCampaign };
  return data.campaign;
}

export async function deleteCampaign(
  sessionToken: string,
  campaignId: string,
): Promise<boolean> {
  initSession(sessionToken);
  const res = await loopsFetch(`/api/campaigns/${campaignId}`, 'DELETE');
  return res.ok;
}

const LOCAL_IMG_PATTERN = /src="((?!https?:\/\/|data:)[^"]+\.(?:jpg|jpeg|png|gif|webp|svg))"/gi;
// Matches only the user-upload bucket — brand CDN images are left as remote URLs
const BLOB_UPLOAD_PATTERN = /src="(https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/edm-uploads\/[^"]+)"/gi;
// Matches Supabase campaign-images uploads (not the brand CDN bucket)
const SUPABASE_IMG_PATTERN = /src="(https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/campaign-images\/[^"]+)"/gi;
// Matches base64 data URL images embedded inline
const BASE64_IMG_PATTERN = /src="(data:image\/([a-zA-Z]+);base64,[A-Za-z0-9+\/=]+)"/g;

function bundleBase64Images(content: string, imagesDir: string): string {
  const matches = [...content.matchAll(BASE64_IMG_PATTERN)];
  const unique = [...new Set(matches.map(m => m[1]))];
  if (unique.length === 0) return content;

  mkdirSync(imagesDir, { recursive: true });
  let result = content;
  let counter = 0;
  const usedNames = new Set<string>();

  for (const dataUrl of unique) {
    const mimeMatch = dataUrl.match(/^data:image\/([a-zA-Z]+);base64,/);
    const rawExt = mimeMatch?.[1]?.toLowerCase() ?? 'jpg';
    const ext = rawExt === 'jpeg' ? 'jpg' : rawExt;
    let name = `image-${++counter}.${ext}`;
    while (usedNames.has(name)) name = `image-${counter}-${Date.now()}.${ext}`;
    usedNames.add(name);
    const base64Data = dataUrl.split(',')[1];
    writeFileSync(join(imagesDir, name), Buffer.from(base64Data, 'base64'));
    result = result.replaceAll(dataUrl, `images/${name}`);
  }

  return result;
}

async function bundleVercelBlobImages(
  content: string,
  imagesDir: string,
): Promise<{ processed: string; bundledUrls: string[] }> {
  const matches = [...content.matchAll(BLOB_UPLOAD_PATTERN)];
  const uniqueUrls = [...new Set(matches.map(m => m[1]))];
  if (uniqueUrls.length === 0) return { processed: content, bundledUrls: [] };

  mkdirSync(imagesDir, { recursive: true });
  let result = content;
  const bundledUrls: string[] = [];
  const usedNames = new Set<string>();

  for (const url of uniqueUrls) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) {
        console.warn(`  Could not download blob image, leaving as URL: ${url}`);
        continue;
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      const urlPath = new URL(url).pathname;
      const ext = extname(urlPath);
      const base = basename(urlPath, ext);
      let destName = `${base}${ext}`;
      let counter = 1;
      while (usedNames.has(destName)) {
        destName = `${base}-${counter}${ext}`;
        counter++;
      }
      usedNames.add(destName);
      writeFileSync(join(imagesDir, destName), buffer);
      result = result.replaceAll(url, `images/${destName}`);
      bundledUrls.push(url);
    } catch (err) {
      console.warn(`  Failed to bundle blob image, leaving as URL: ${url}`, err);
    }
  }

  return { processed: result, bundledUrls };
}

async function bundleSupabaseImages(
  content: string,
  imagesDir: string,
): Promise<{ processed: string; bundledPaths: string[] }> {
  const matches = [...content.matchAll(SUPABASE_IMG_PATTERN)];
  const uniqueUrls = [...new Set(matches.map(m => m[1]))];
  if (uniqueUrls.length === 0) return { processed: content, bundledPaths: [] };

  mkdirSync(imagesDir, { recursive: true });
  let result = content;
  const bundledPaths: string[] = [];
  const usedNames = new Set<string>();

  for (const url of uniqueUrls) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) {
        console.warn(`  Could not download Supabase image, leaving as URL: ${url}`);
        continue;
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      const urlPath = new URL(url).pathname;
      const ext = extname(urlPath);
      const base = basename(urlPath, ext);
      let destName = `${base}${ext}`;
      let counter = 1;
      while (usedNames.has(destName)) {
        destName = `${base}-${counter}${ext}`;
        counter++;
      }
      usedNames.add(destName);
      writeFileSync(join(imagesDir, destName), buffer);
      result = result.replaceAll(url, `images/${destName}`);
      // Extract just the storage path (after /campaign-images/)
      const storagePath = url.split('/campaign-images/')[1];
      if (storagePath) bundledPaths.push(storagePath);
    } catch (err) {
      console.warn(`  Failed to bundle Supabase image, leaving as URL: ${url}`, err);
    }
  }

  return { processed: result, bundledPaths };
}

function bundleLocalImages(content: string, imagesDir: string): string {
  const matches = [...content.matchAll(LOCAL_IMG_PATTERN)];
  const unique = [...new Set(matches.map(m => m[1]))];
  if (unique.length === 0) return content;

  mkdirSync(imagesDir, { recursive: true });
  let result = content;
  const usedNames = new Set<string>();

  for (const src of unique) {
    const localPath = src.startsWith('file://') ? src.slice(7) : src;
    if (!existsSync(localPath)) {
      console.warn(`  Image not found, skipping: ${localPath}`);
      continue;
    }
    const ext = extname(localPath);
    const base = basename(localPath, ext);
    let destName = `${base}${ext}`;
    let counter = 1;
    while (usedNames.has(destName)) {
      destName = `${base}-${counter}${ext}`;
      counter++;
    }
    usedNames.add(destName);
    copyFileSync(localPath, join(imagesDir, destName));
    result = result.replaceAll(src, `images/${destName}`);
  }
  return result;
}

export async function uploadMjmlAsZip(
  emailMessageId: string,
  mjml: string,
): Promise<ZipUploadResult> {
  const tmpDir = join(tmpdir(), `hitpay-edm-upload-${Date.now()}`);
  mkdirSync(tmpDir, { recursive: true });
  const imagesDir = join(tmpDir, 'images');
  const mjmlAfterBase64 = bundleBase64Images(mjml, imagesDir);
  const { processed: mjmlAfterBlob, bundledUrls } = await bundleVercelBlobImages(mjmlAfterBase64, imagesDir);
  const { processed: mjmlAfterSupabase, bundledPaths } = await bundleSupabaseImages(mjmlAfterBlob, imagesDir);
  const processedMjml = bundleLocalImages(mjmlAfterSupabase, imagesDir);
  writeFileSync(join(tmpDir, 'index.mjml'), processedMjml);
  const hasImages = existsSync(imagesDir);
  const zip = new AdmZip();
  zip.addLocalFile(join(tmpDir, 'index.mjml'));
  if (hasImages) zip.addLocalFolder(join(tmpDir, 'images'), 'images');
  const zipBuffer = zip.toBuffer();

  try {
    const trpcRes = await loopsFetch(
      '/api/trpc/emailMessages.getPresignedMjmlUpload',
      'POST',
      {
        json: {
          emailMessageId,
          contentLength: zipBuffer.length,
        },
      },
    );
    if (!trpcRes.ok) {
      const errBody = await trpcRes.text();
      throw new Error(`Failed to get presigned URL: ${trpcRes.status} — ${errBody}`);
    }
    const trpcData = (await trpcRes.json()) as {
      result: { data: { json: { presignedUrl: string; filename: string } } };
    };
    const { presignedUrl, filename } = trpcData.result.data.json;

    const uploadRes = await fetch(presignedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/zip' },
      body: zipBuffer,
      signal: AbortSignal.timeout(30000),
    });
    if (!uploadRes.ok) {
      throw new Error(`Failed to upload to S3: ${uploadRes.status}`);
    }

    const notifyRes = await loopsFetch(
      `/api/emailMessages/${emailMessageId}/upload-mjml-zip`,
      'POST',
      { filename },
    );
    if (!notifyRes.ok) {
      const text = await notifyRes.text();
      throw new Error(`Failed to process upload: ${notifyRes.status} ${text}`);
    }
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }

  return { bundledBlobUrls: bundledUrls, bundledSupabasePaths: bundledPaths };
}

export async function uploadHtmlAsZip(
  emailMessageId: string,
  html: string,
): Promise<ZipUploadResult> {
  // Extract body content and styles from the React Email HTML
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const bodyContent = bodyMatch ? bodyMatch[1] : html;
  const styleMatches = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)];
  const styles = styleMatches.map(m => `<style>${m[1]}</style>`).join('\n');

  // MJML injects `p { margin: 13px 0 }` which breaks our Text margins — override it.
  // Use <mj-font> for Manrope so MJML generates a proper <link> tag (survives Gmail).
  // Strip @import lines from styles since mj-font handles Google Fonts natively.
  const stylesWithoutImport = styles.replace(/@import url\([^)]+\);/g, '');

  const mjml = `<mjml>
  <mj-head>
    <mj-font name="Manrope" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&display=swap" />
    <mj-raw>
      ${stylesWithoutImport}
      <style>p { margin: 0; } img { height: auto; }</style>
    </mj-raw>
  </mj-head>
  <mj-body>
    <mj-raw>
${bodyContent}
    </mj-raw>
  </mj-body>
</mjml>`;

  const tmpDir = join(tmpdir(), `hitpay-edm-upload-${Date.now()}`);
  mkdirSync(tmpDir, { recursive: true });
  const imagesDir = join(tmpDir, 'images');
  const mjmlAfterBase64 = bundleBase64Images(mjml, imagesDir);
  const { processed: mjmlAfterBlob, bundledUrls } = await bundleVercelBlobImages(mjmlAfterBase64, imagesDir);
  const { processed: mjmlAfterSupabase, bundledPaths } = await bundleSupabaseImages(mjmlAfterBlob, imagesDir);
  const processedMjml2 = bundleLocalImages(mjmlAfterSupabase, imagesDir);
  writeFileSync(join(tmpDir, 'index.mjml'), processedMjml2);
  const hasImages2 = existsSync(imagesDir);
  const zip2 = new AdmZip();
  zip2.addLocalFile(join(tmpDir, 'index.mjml'));
  if (hasImages2) zip2.addLocalFolder(imagesDir, 'images');
  const zipBuffer = zip2.toBuffer();

  try {
    // Get presigned URL via tRPC
    const trpcRes = await loopsFetch(
      '/api/trpc/emailMessages.getPresignedMjmlUpload',
      'POST',
      {
        json: {
          emailMessageId,
          contentLength: zipBuffer.length,
        },
      },
    );
    if (!trpcRes.ok) {
      const errBody = await trpcRes.text();
      throw new Error(`Failed to get presigned URL: ${trpcRes.status} — ${errBody}`);
    }
    const trpcData = (await trpcRes.json()) as {
      result: { data: { json: { presignedUrl: string; filename: string } } };
    };
    const { presignedUrl, filename } = trpcData.result.data.json;

    // Upload zip to S3
    const uploadRes = await fetch(presignedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/zip' },
      body: zipBuffer,
      signal: AbortSignal.timeout(30000),
    });
    if (!uploadRes.ok) {
      throw new Error(`Failed to upload to S3: ${uploadRes.status}`);
    }

    // Notify backend to process the uploaded zip
    const notifyRes = await loopsFetch(
      `/api/emailMessages/${emailMessageId}/upload-mjml-zip`,
      'POST',
      { filename },
    );
    if (!notifyRes.ok) {
      const text = await notifyRes.text();
      throw new Error(`Failed to process upload: ${notifyRes.status} ${text}`);
    }
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
  return { bundledBlobUrls: bundledUrls, bundledSupabasePaths: bundledPaths };
}
