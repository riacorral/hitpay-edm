import { describe, it, expect } from 'vitest';
import { EdmFrontmatter, EdmSectionSchema } from '../src/schema/edm.js';

describe('EdmFrontmatter', () => {
  it('validates product-launch frontmatter', () => {
    const result = EdmFrontmatter.parse({
      template: 'product-launch',
      subject: 'Test Subject',
      productName: 'Test Product',
      ctaUrl: 'https://example.com',
    });
    expect(result.template).toBe('product-launch');
    if (result.template === 'product-launch') {
      expect(result.ctaText).toBe('Get Started'); // default
    }
  });

  it('validates promotional frontmatter with optional fields', () => {
    const result = EdmFrontmatter.parse({
      template: 'promotional',
      subject: 'Sale!',
      promoCode: 'SAVE20',
      ctaUrl: 'https://example.com',
    });
    expect(result.template).toBe('promotional');
  });

  it('rejects invalid template', () => {
    expect(() =>
      EdmFrontmatter.parse({
        template: 'unknown',
        subject: 'Test',
      }),
    ).toThrow();
  });

  it('rejects missing subject', () => {
    expect(() =>
      EdmFrontmatter.parse({
        template: 'newsletter',
      }),
    ).toThrow();
  });
});

describe('EdmSectionSchema', () => {
  it('validates heading section', () => {
    const result = EdmSectionSchema.parse({
      type: 'heading',
      level: 2,
      text: 'Hello World',
    });
    expect(result.type).toBe('heading');
  });

  it('validates bullets section', () => {
    const result = EdmSectionSchema.parse({
      type: 'bullets',
      items: ['item 1', 'item 2'],
    });
    if (result.type === 'bullets') {
      expect(result.items).toHaveLength(2);
    }
  });

  it('validates metric section', () => {
    const result = EdmSectionSchema.parse({
      type: 'metric',
      items: [
        { value: '$4.2M', label: 'Revenue' },
        { value: '32%', label: 'Growth' },
      ],
    });
    expect(result.type).toBe('metric');
  });

  it('rejects invalid section type', () => {
    expect(() =>
      EdmSectionSchema.parse({
        type: 'invalid',
        text: 'test',
      }),
    ).toThrow();
  });
});
