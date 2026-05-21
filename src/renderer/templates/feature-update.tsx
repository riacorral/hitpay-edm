import React from 'react';
import { Section, Text } from '@react-email/components';
import { BRAND } from '../../brand/hitpay.js';
import { Wrapper } from './shared/wrapper.js';
import { Header } from './shared/header.js';
import { Footer } from './shared/footer.js';
import { Button } from './shared/button.js';
import { SectionRenderer } from './shared/section-renderer.js';
import type { FeatureUpdateFrontmatter, EdmSection } from '../../schema/edm.js';

interface Props {
  frontmatter: FeatureUpdateFrontmatter;
  sections: EdmSection[];
}

export function FeatureUpdateEmail({ frontmatter, sections }: Props) {
  const fm = frontmatter;

  return (
    <Wrapper previewText={fm.previewText}>
      <Header />

      {/* Version badge + headline */}
      <Section style={{ padding: `${BRAND.spacing.xl} ${BRAND.spacing.xl} 0` }}>
        {fm.versionBadge && (
          <Text
            style={{
              fontFamily: BRAND.fonts.body,
              fontSize: BRAND.fontSizes.bodySmall,
              fontWeight: 600,
              color: BRAND.colors.white,
              backgroundColor: BRAND.colors.actionBlue,
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '12px',
              margin: '0 0 16px 0',
            }}
          >
            {fm.versionBadge}
          </Text>
        )}
      </Section>

      {/* Body sections */}
      <Section style={{ padding: `${BRAND.spacing.md} 0` }}>
        {sections.map((section, i) => (
          <SectionRenderer key={i} section={section} />
        ))}
      </Section>

      {/* Primary CTA */}
      {fm.ctaUrl && (
        <Section
          style={{
            textAlign: 'center' as const,
            padding: `0 ${BRAND.spacing.xl} ${BRAND.spacing.xl}`,
          }}
        >
          <Button href={fm.ctaUrl}>{fm.ctaText}</Button>
        </Section>
      )}

      <Footer market={fm.market} />
    </Wrapper>
  );
}
