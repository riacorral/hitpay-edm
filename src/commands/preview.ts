import chalk from 'chalk';
import { getHtmlPath } from '../campaign/manager.js';
import { openInBrowser } from '../utils/open-browser.js';

export async function previewCommand(fileOrSlug: string): Promise<void> {
  const htmlPath = getHtmlPath(fileOrSlug);

  if (!htmlPath) {
    console.error(chalk.red(`Could not find HTML file for: ${fileOrSlug}`));
    console.error(
      chalk.dim('Provide a campaign slug, campaign directory path, or HTML file path.'),
    );
    process.exit(1);
  }

  console.log(chalk.dim(`Opening: ${htmlPath}`));
  await openInBrowser(htmlPath);
}
