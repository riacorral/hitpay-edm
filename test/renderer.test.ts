import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseEdm } from '../src/parser/markdown.js';
import { renderEdm } from '../src/renderer/engine.js';

const fixture = (name: string) =>
  readFileSync(join(import.meta.dirname, 'fixtures', name), 'utf-8');

describe('renderEdm', () => {
  it('renders product-launch to valid HTML', async () => {
    const edm = parseEdm(fixture('product-launch.md'));
    const html = await renderEdm(edm);
    expect(html).toContain('<!DOCTYPE html');
    expect(html).toContain('HitPay Borderless QR');
    expect(html).toContain('Get Started');
    expect(html).toContain('hitpayapp.com');
  });

  it('renders feature-update with version badge', async () => {
    const edm = parseEdm(fixture('feature-update.md'));
    const html = await renderEdm(edm);
    expect(html).toContain('v3.2');
    expect(html).toContain('Multi-Currency Payouts');
  });

  it('renders newsletter with issue number', async () => {
    const edm = parseEdm(fixture('newsletter.md'));
    const html = await renderEdm(edm);
    expect(html).toContain('#12');
    expect(html).toContain('March 2026');
  });

  it('renders promotional with promo code', async () => {
    const edm = parseEdm(fixture('promotional.md'));
    const html = await renderEdm(edm);
    expect(html).toContain('HITPAY50');
    expect(html).toContain('2026-03-31');
  });

  it('renders event-invitation with event details', async () => {
    const edm = parseEdm(fixture('event-invitation.md'));
    const html = await renderEdm(edm);
    expect(html).toContain('HitPay Partner Summit 2026');
    expect(html).toContain('April 15, 2026');
    expect(html).toContain('Marina Bay Sands');
  });

  it('renders partner-spotlight with partner name', async () => {
    const edm = parseEdm(fixture('partner-spotlight.md'));
    const html = await renderEdm(edm);
    expect(html).toContain('FoodRepublic');
    expect(html).toContain('Partner Spotlight');
  });

  it('includes brand colors in output', async () => {
    const edm = parseEdm(fixture('product-launch.md'));
    const html = await renderEdm(edm);
    // Action Blue for buttons
    expect(html).toContain('#2465DE');
    // Deep Blue for gradients
    expect(html).toContain('#002771');
  });

  it('includes unsubscribe link', async () => {
    const edm = parseEdm(fixture('product-launch.md'));
    const html = await renderEdm(edm);
    expect(html).toContain('Unsubscribe');
  });

  it('includes HitPay tagline in footer', async () => {
    const edm = parseEdm(fixture('product-launch.md'));
    const html = await renderEdm(edm);
    expect(html).toContain('Enabling growing businesses to get paid with confidence');
  });
});
