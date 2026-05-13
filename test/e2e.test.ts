import { describe, it, expect, afterAll } from 'vitest';
import { readFileSync, existsSync, rmSync } from 'fs';
import { join } from 'path';
import { parseEdm } from '../src/parser/markdown.js';
import { renderEdm } from '../src/renderer/engine.js';
import { campaignSlug } from '../src/campaign/slug.js';
import {
  createCampaignDir,
  saveInputMarkdown,
  saveHtml,
  saveCampaignMetadata,
} from '../src/campaign/manager.js';
import {
  createDraftCampaign,
  getCampaign,
  deleteCampaign,
} from '../src/loops/client.js';
import type { CampaignMetadata } from '../src/schema/campaign.js';

// ── Config ──────────────────────────────────────────────────────────

function loadLoopsToken(): string | undefined {
  try {
    const homedir = process.env.HOME || process.env.USERPROFILE || '';
    const configPath = join(homedir, '.hitpay-edm', 'config.json');
    if (!existsSync(configPath)) return undefined;
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    return config.loopsSessionToken || undefined;
  } catch {
    return undefined;
  }
}

const sessionToken = loadLoopsToken();

// ── Fixture ─────────────────────────────────────────────────────────

const fixtureDir = join(import.meta.dirname, 'fixtures');
const fixturePath = join(fixtureDir, 'product-launch.md');
const fixtureMarkdown = readFileSync(fixturePath, 'utf-8');

// ── Shared state across sequential tests ────────────────────────────

const ts = Date.now();
const slug = `e2e-test-${ts}`;
let html = '';
let campaignDir = '';
let loopsCampaignId = '';
let loopsEmailMessageId = '';

// ── E2E Suite ───────────────────────────────────────────────────────

describe.skipIf(!sessionToken)(
  'E2E: markdown → Loops draft campaign',
  () => {
    it('parses markdown fixture into valid EDM', () => {
      const edm = parseEdm(fixtureMarkdown);
      expect(edm.frontmatter.template).toBe('product-launch');
      expect(edm.frontmatter.subject).toBe('Introducing Borderless QR');
      expect(edm.sections.length).toBeGreaterThan(0);
    });

    it('renders EDM to branded HTML', async () => {
      const edm = parseEdm(fixtureMarkdown);
      html = await renderEdm(edm);
      expect(html).toContain('<!DOCTYPE html');
      expect(html).toContain('Borderless QR');
      expect(html.length).toBeGreaterThan(1000);
    });

    it('saves campaign files locally', () => {
      const edm = parseEdm(fixtureMarkdown);
      campaignDir = createCampaignDir(slug);
      saveInputMarkdown(campaignDir, fixturePath);
      saveHtml(campaignDir, html);

      const metadata: CampaignMetadata = {
        version: 1,
        slug,
        title: edm.frontmatter.subject,
        subject: `[E2E Test] ${edm.frontmatter.subject}`,
        template: edm.frontmatter.template,
        createdAt: new Date().toISOString(),
        inputFile: fixturePath,
        htmlFile: join(campaignDir, 'index.html'),
      };
      saveCampaignMetadata(campaignDir, metadata);

      expect(existsSync(join(campaignDir, 'index.html'))).toBe(true);
      expect(existsSync(join(campaignDir, 'input.md'))).toBe(true);
      expect(existsSync(join(campaignDir, 'campaign.json'))).toBe(true);
    });

    it('uploads to Loops as draft campaign', async () => {
      const result = await createDraftCampaign(
        sessionToken!,
        `[E2E Test] Introducing Borderless QR`,
        'Accept payments from any country',
        html,
      );

      expect(result.campaignId).toBeTruthy();
      expect(result.emailMessageId).toBeTruthy();
      expect(result.url).toContain('app.loops.so/campaigns/');

      loopsCampaignId = result.campaignId;
      loopsEmailMessageId = result.emailMessageId;
    }, 60_000);

    it('verifies campaign in Loops has correct metadata', async () => {
      expect(loopsCampaignId).toBeTruthy();

      const campaign = await getCampaign(sessionToken!, loopsCampaignId);

      expect(campaign.emailMessage.subject).toBe(
        '[E2E Test] Introducing Borderless QR',
      );
      expect(campaign.emailMessage.previewText).toBe(
        'Accept payments from any country',
      );
    }, 30_000);

    it('confirms HTML was uploaded (mjmlUploaded === true)', async () => {
      expect(loopsCampaignId).toBeTruthy();

      const campaign = await getCampaign(sessionToken!, loopsCampaignId);
      expect(campaign.emailMessage.mjmlUploaded).toBe(true);
    }, 30_000);

    it('local campaign.json has loopsId and loopsUrl', () => {
      // Update metadata with Loops info (as the upload command would)
      const metadataPath = join(campaignDir, 'campaign.json');
      const metadata: CampaignMetadata = JSON.parse(
        readFileSync(metadataPath, 'utf-8'),
      );
      metadata.loopsId = loopsCampaignId;
      metadata.loopsUrl = `https://app.loops.so/campaigns/${loopsCampaignId}/compose`;
      saveCampaignMetadata(campaignDir, metadata);

      // Re-read and verify
      const updated: CampaignMetadata = JSON.parse(
        readFileSync(metadataPath, 'utf-8'),
      );
      expect(updated.loopsId).toBe(loopsCampaignId);
      expect(updated.loopsUrl).toContain(loopsCampaignId);
    });

    // ── Cleanup ───────────────────────────────────────────────────

    afterAll(async () => {
      // Delete Loops campaign
      if (loopsCampaignId && sessionToken) {
        try {
          await deleteCampaign(sessionToken, loopsCampaignId);
        } catch {
          console.warn(
            `[E2E cleanup] Failed to delete Loops campaign ${loopsCampaignId}`,
          );
        }
      }

      // Remove local campaign directory
      if (campaignDir && existsSync(campaignDir)) {
        rmSync(campaignDir, { recursive: true, force: true });
      }
    });
  },
);
