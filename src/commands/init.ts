import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { createInterface } from 'readline';
import chalk from 'chalk';

const CONFIG_DIR = join(homedir(), '.hitpay-edm');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

interface Config {
  loopsApiKey?: string;
  loopsSessionToken?: string;
}

export function loadConfig(): Config {
  if (!existsSync(CONFIG_FILE)) return {};
  return JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
}

export function saveConfig(config: Config): void {
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + '\n');
}

function prompt(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export async function initCommand(): Promise<void> {
  console.log(chalk.bold('\nHitPay EDM — Loops.so Setup\n'));

  const existing = loadConfig();

  // API Key
  const apiKeyPrompt = existing.loopsApiKey
    ? `Loops API Key [${chalk.dim(mask(existing.loopsApiKey))}]: `
    : 'Loops API Key: ';
  const apiKey = (await prompt(apiKeyPrompt)) || existing.loopsApiKey || '';

  // Session Token
  console.log(chalk.dim('\nTo get your session token:'));
  console.log(chalk.dim('1. Log into app.loops.so'));
  console.log(chalk.dim('2. Open DevTools → Application → Cookies'));
  console.log(chalk.dim('3. Copy the session cookie value\n'));

  const sessionPrompt = existing.loopsSessionToken
    ? `Session Token [${chalk.dim(mask(existing.loopsSessionToken))}]: `
    : 'Session Token: ';
  const sessionToken =
    (await prompt(sessionPrompt)) || existing.loopsSessionToken || '';

  const config: Config = {
    loopsApiKey: apiKey,
    loopsSessionToken: sessionToken,
  };
  saveConfig(config);

  console.log(chalk.green(`\nCredentials saved to ${CONFIG_FILE}`));
}

function mask(value: string): string {
  if (value.length <= 8) return '****';
  return value.slice(0, 4) + '...' + value.slice(-4);
}
