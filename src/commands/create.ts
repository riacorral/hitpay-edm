import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import chalk from 'chalk';
import { parseEdm } from '../parser/markdown.js';
import { renderEdm } from '../renderer/engine.js';
import { generateMjml } from '../renderer/mjml.js';
import { campaignSlug } from '../campaign/slug.js';
import {
  createCampaignDir,
  saveInputMarkdown,
  saveHtml,
  saveMjml,
  saveCampaignMetadata,
} from '../campaign/manager.js';
import { openInBrowser } from '../utils/open-browser.js';
import type { CampaignMetadata } from '../schema/campaign.js';

interface CreateOptions {
  preview?: boolean;
}

export async function createCommand(
  filePath: string,
  options: CreateOptions,
): Promise<void> {
  const fullPath = resolve(filePath);

  if (!existsSync(fullPath)) {
    console.error(chalk.red(`File not found: ${fullPath}`));
    process.exit(1);
  }

  // Parse markdown
  console.log(chalk.dim('Parsing markdown...'));
  const markdown = readFileSync(fullPath, 'utf-8');
  const edm = parseEdm(markdown);

  console.log(
    chalk.dim(`Template: ${edm.frontmatter.template}`),
  );
  console.log(
    chalk.dim(`Subject: ${edm.frontmatter.subject}`),
  );
  console.log(
    chalk.dim(`Sections: ${edm.sections.length}`),
  );

  // Render to HTML and MJML
  console.log(chalk.dim('Rendering HTML...'));
  const html = await renderEdm(edm);
  const mjml = generateMjml(edm);

  // Create campaign directory
  const slug = campaignSlug(edm.frontmatter.subject);
  const campaignDir = createCampaignDir(slug);
  saveInputMarkdown(campaignDir, fullPath);
  const htmlPath = saveHtml(campaignDir, html);
  saveMjml(campaignDir, mjml);

  // Save metadata
  const metadata: CampaignMetadata = {
    version: 1,
    slug,
    title: edm.frontmatter.subject,
    subject: edm.frontmatter.subject,
    template: edm.frontmatter.template,
    createdAt: new Date().toISOString(),
    inputFile: fullPath,
    htmlFile: htmlPath,
  };
  saveCampaignMetadata(campaignDir, metadata);

  // Output
  console.log('');
  console.log(chalk.green('EDM created successfully!'));
  console.log(chalk.dim(`Campaign: ${campaignDir}`));
  console.log(chalk.dim(`HTML: ${htmlPath}`));

  // Open in browser if requested
  if (options.preview) {
    console.log(chalk.dim('Opening in browser...'));
    await openInBrowser(htmlPath);
  }
}
