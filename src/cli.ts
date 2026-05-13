#!/usr/bin/env node

import 'dotenv/config';
import { Command } from 'commander';
import { createCommand } from './commands/create.js';
import { previewCommand } from './commands/preview.js';
import { uploadCommand } from './commands/upload.js';
import { templatesCommand } from './commands/templates.js';
import { initCommand } from './commands/init.js';

const program = new Command();

program
  .name('hitpay-edm')
  .description('Create HitPay-branded email campaigns (EDMs) from markdown')
  .version('1.0.0');

program
  .command('create')
  .description('Parse markdown → render branded HTML → save to campaigns/')
  .argument('<file>', 'Markdown file path')
  .option('--preview', 'Open HTML in browser after creation')
  .action(createCommand);

program
  .command('preview')
  .description('Open an existing campaign HTML in the browser')
  .argument('<file-or-slug>', 'Campaign slug, directory path, or HTML file path')
  .action(previewCommand);

program
  .command('upload')
  .description('Upload campaign to Loops.so as a draft')
  .argument('<file-or-slug>', 'Campaign slug, directory path, or HTML file path')
  .option('--html', 'Force HTML upload (skip MJML even if index.mjml exists)')
  .action(uploadCommand);

program
  .command('templates')
  .description('List available EDM templates')
  .action(templatesCommand);

program
  .command('init')
  .description('Set up Loops.so API key and session token')
  .action(initCommand);

program.parse();
