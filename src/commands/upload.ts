import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import { getHtmlPath, saveCampaignMetadata } from '../campaign/manager.js';
import { loadConfig, saveConfig } from './init.js';
import { createDraftCampaign } from '../loops/client.js';
import type { CampaignMetadata } from '../schema/campaign.js';

export async function uploadCommand(fileOrSlug: string, options: { html?: boolean } = {}): Promise<void> {
  const config = loadConfig();

  if (!config.loopsSessionToken) {
    console.error(chalk.red('Loops session token not configured.'));
    console.error(chalk.dim('Run: hitpay-edm init'));
    process.exit(1);
  }

  const htmlPath = getHtmlPath(fileOrSlug);
  if (!htmlPath) {
    console.error(chalk.red(`Could not find HTML file for: ${fileOrSlug}`));
    process.exit(1);
  }

  const campaignDir = htmlPath.replace('/index.html', '');
  const mjmlPath = join(campaignDir, 'index.mjml');
  const metadataPath = join(campaignDir, 'campaign.json');
  let metadata: CampaignMetadata | null = null;
  if (existsSync(metadataPath)) {
    metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
  }

  // Prefer MJML file (native Loops format), fall back to HTML; --html flag forces HTML
  const useMjml = !options.html && existsSync(mjmlPath);
  let content = useMjml
    ? readFileSync(mjmlPath, 'utf-8')
    : readFileSync(htmlPath, 'utf-8');

  const subject = metadata?.subject || 'HitPay EDM';
  const previewText = metadata?.title || '';

  console.log(chalk.dim(`Uploading to Loops as ${useMjml ? 'MJML' : 'HTML'}...`));
  console.log(chalk.dim(`Subject: ${subject}`));
  console.log(chalk.dim(`Size: ${(content.length / 1024).toFixed(1)} KB`));

  try {
    const result = await createDraftCampaign(
      config.loopsSessionToken,
      subject,
      previewText,
      content,
      useMjml,
      (newToken) => {
        config.loopsSessionToken = newToken;
        saveConfig(config);
      },
    );

    console.log('');
    console.log(chalk.green('Draft campaign created in Loops!'));
    console.log(chalk.blue(result.url));

    if (metadata) {
      metadata.loopsId = result.campaignId;
      metadata.loopsUrl = result.url;
      saveCampaignMetadata(campaignDir, metadata);
    }
  } catch (err) {
    console.error(chalk.yellow('\nCould not create draft via Loops dashboard API.'));
    console.error(chalk.dim(err instanceof Error ? err.message : 'Unknown error'));
    console.error(chalk.dim('Session token may be expired. Run: hitpay-edm init'));
  }
}
