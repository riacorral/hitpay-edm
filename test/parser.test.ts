import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseEdm } from '../src/parser/markdown.js';

const fixture = (name: string) =>
  readFileSync(join(import.meta.dirname, 'fixtures', name), 'utf-8');

describe('parseEdm', () => {
  it('parses product-launch frontmatter', () => {
    const result = parseEdm(fixture('product-launch.md'));
    expect(result.frontmatter.template).toBe('product-launch');
    expect(result.frontmatter.subject).toBe('Introducing Borderless QR');
    if (result.frontmatter.template === 'product-launch') {
      expect(result.frontmatter.productName).toBe('HitPay Borderless QR');
      expect(result.frontmatter.ctaText).toBe('Get Started');
      expect(result.frontmatter.ctaUrl).toBe('https://www.hitpayapp.com/borderless-qr');
    }
  });

  it('parses body sections from product-launch', () => {
    const result = parseEdm(fixture('product-launch.md'));
    const types = result.sections.map(s => s.type);
    expect(types).toContain('heading');
    expect(types).toContain('paragraph');
    expect(types).toContain('bullets');
    expect(types).toContain('divider');
    expect(types).toContain('blockquote');
    expect(types).toContain('cta');
  });

  it('parses bullet items correctly', () => {
    const result = parseEdm(fixture('product-launch.md'));
    const bullets = result.sections.find(s => s.type === 'bullets');
    expect(bullets).toBeDefined();
    if (bullets?.type === 'bullets') {
      expect(bullets.items).toHaveLength(3);
      expect(bullets.items[0]).toContain('Tourist scans QR');
    }
  });

  it('parses blockquote with attribution', () => {
    const result = parseEdm(fixture('product-launch.md'));
    const quote = result.sections.find(s => s.type === 'blockquote');
    expect(quote).toBeDefined();
    if (quote?.type === 'blockquote') {
      expect(quote.text).toContain('40% increase');
      expect(quote.attribution).toBe('Marina Bay Sands');
    }
  });

  it('parses CTA links', () => {
    const result = parseEdm(fixture('product-launch.md'));
    const cta = result.sections.find(s => s.type === 'cta');
    expect(cta).toBeDefined();
    if (cta?.type === 'cta') {
      expect(cta.text).toBe('Get Started with Borderless QR');
      expect(cta.url).toBe('https://www.hitpayapp.com/borderless-qr');
    }
  });

  it('parses newsletter with metrics', () => {
    const result = parseEdm(fixture('newsletter.md'));
    expect(result.frontmatter.template).toBe('newsletter');
    const metrics = result.sections.find(s => s.type === 'metric');
    expect(metrics).toBeDefined();
    if (metrics?.type === 'metric') {
      expect(metrics.items).toHaveLength(2);
      expect(metrics.items[0].value).toBe('$2.5M');
    }
  });

  it('parses promotional with promo code in frontmatter', () => {
    const result = parseEdm(fixture('promotional.md'));
    if (result.frontmatter.template === 'promotional') {
      expect(result.frontmatter.promoCode).toBe('HITPAY50');
      expect(result.frontmatter.expiryDate).toBe('2026-03-31');
    }
  });

  it('parses event-invitation frontmatter', () => {
    const result = parseEdm(fixture('event-invitation.md'));
    if (result.frontmatter.template === 'event-invitation') {
      expect(result.frontmatter.eventName).toBe('HitPay Partner Summit 2026');
      expect(result.frontmatter.eventDate).toBe('April 15, 2026');
      expect(result.frontmatter.eventLocation).toBe('Marina Bay Sands, Singapore');
    }
  });

  it('parses partner-spotlight frontmatter', () => {
    const result = parseEdm(fixture('partner-spotlight.md'));
    if (result.frontmatter.template === 'partner-spotlight') {
      expect(result.frontmatter.partnerName).toBe('FoodRepublic');
    }
  });

  it('parses images', () => {
    const result = parseEdm(fixture('newsletter.md'));
    const image = result.sections.find(s => s.type === 'image');
    expect(image).toBeDefined();
    if (image?.type === 'image') {
      expect(image.src).toBe('https://cdn.example.com/fintech-fest.png');
      expect(image.alt).toBe('Event Banner');
    }
  });

  it('rejects invalid template type', () => {
    const badMd = `---
template: invalid-type
subject: "Test"
---

Hello`;
    expect(() => parseEdm(badMd)).toThrow();
  });

  it('rejects missing required fields', () => {
    const badMd = `---
template: product-launch
subject: "Test"
---

Hello`;
    expect(() => parseEdm(badMd)).toThrow();
  });
});
