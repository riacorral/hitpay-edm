import { mkdirSync, writeFileSync, copyFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import type { CampaignMetadata } from '../schema/campaign.js';

const CAMPAIGNS_DIR = join(resolve('.'), 'campaigns');

export function getCampaignsDir(): string {
  return CAMPAIGNS_DIR;
}

export function createCampaignDir(slug: string): string {
  const dir = join(CAMPAIGNS_DIR, slug);
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function saveInputMarkdown(campaignDir: string, sourcePath: string): void {
  const dest = join(campaignDir, 'input.md');
  copyFileSync(sourcePath, dest);
}

export function saveHtml(campaignDir: string, html: string): string {
  const dest = join(campaignDir, 'index.html');
  writeFileSync(dest, html);
  return dest;
}

export function saveMjml(campaignDir: string, mjml: string): string {
  const dest = join(campaignDir, 'index.mjml');
  writeFileSync(dest, mjml);
  return dest;
}

export function saveCampaignMetadata(campaignDir: string, metadata: CampaignMetadata): void {
  const dest = join(campaignDir, 'campaign.json');
  writeFileSync(dest, JSON.stringify(metadata, null, 2) + '\n');
}

export function campaignExists(slug: string): boolean {
  return existsSync(join(CAMPAIGNS_DIR, slug));
}

export function getCampaignDir(slug: string): string {
  return join(CAMPAIGNS_DIR, slug);
}

export function getHtmlPath(slugOrPath: string): string | null {
  // If it's a direct path to an HTML file
  if (slugOrPath.endsWith('.html') && existsSync(slugOrPath)) {
    return slugOrPath;
  }

  // If it's a path to a campaign directory
  const htmlInDir = join(slugOrPath, 'index.html');
  if (existsSync(htmlInDir)) {
    return htmlInDir;
  }

  // If it's a slug
  const htmlInCampaign = join(CAMPAIGNS_DIR, slugOrPath, 'index.html');
  if (existsSync(htmlInCampaign)) {
    return htmlInCampaign;
  }

  return null;
}
