import React from 'react';
import { Section, Text } from '@react-email/components';
import { BRAND } from '../../brand/hitpay.js';
import { Wrapper } from './shared/wrapper.js';
import { Header } from './shared/header.js';
import { Footer } from './shared/footer.js';
import { Button } from './shared/button.js';
import { SectionRenderer } from './shared/section-renderer.js';
import type { PromotionalFrontmatter, EdmSection } from '../../schema/edm.js';

interface Props {
  frontmatter: PromotionalFrontmatter;
  sections: EdmSection[];
}

export function PromotionalEmail({ frontmatter, sections }: Props) {
  const fm = frontmatter;

  return (
    <Wrapper previewText={fm.previewText}>
      <Header />

      {/* Promo highlight banner */}
      <Section
        style={{
          background: `linear-gradient(135deg, ${BRAND.colors.deepBlue} 0%, ${BRAND.colors.actionBlue} 100%)`,
          padding: `${BRAND.spacing.xxl} ${BRAND.spacing.xl}`,
          textAlign: 'center' as const,
        }}
      >
        {fm.discountText && (
          <Text
            style={{
              fontFamily: BRAND.fonts.headline,
              fontSize: BRAND.fontSizes.heroTitle,
              fontWeight: 700,
              color: BRAND.colors.white,
              margin: '0 0 8px 0',
              lineHeight: '1.2',
            }}
          >
            {fm.discountText}
          </Text>
        )}
        {fm.promoCode && (
          <Text
            style={{
              fontFamily: BRAND.fonts.body,
              fontSize: BRAND.fontSizes.subheadline,
              fontWeight: 600,
              color: BRAND.colors.white,
              backgroundColor: 'rgba(255,255,255,0.15)',
              display: 'inline-block',
              padding: '8px 24px',
              borderRadius: '6px',
              margin: '8px 0 0 0',
              letterSpacing: '2px',
            }}
          >
            {fm.promoCode}
          </Text>
        )}
        {fm.expiryDate && (
          <Text
            style={{
              fontFamily: BRAND.fonts.body,
              fontSize: BRAND.fontSizes.bodySmall,
              color: BRAND.colors.neutral200,
              margin: '12px 0 0 0',
            }}
          >
            Offer expires {fm.expiryDate}
          </Text>
        )}
      </Section>

      {/* Body sections */}
      <Section style={{ padding: `${BRAND.spacing.xl} 0` }}>
        {sections.map((section, i) => (
          <SectionRenderer key={i} section={section} />
        ))}
      </Section>

      {/* Primary CTA */}
      <Section
        style={{
          textAlign: 'center' as const,
          padding: `0 ${BRAND.spacing.xl} ${BRAND.spacing.xl}`,
        }}
      >
        <Button href={fm.ctaUrl}>{fm.ctaText}</Button>
      </Section>

      <Footer />
    </Wrapper>
  );
}
