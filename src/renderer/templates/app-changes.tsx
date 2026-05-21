import React from 'react';
import { Section, Text, Img } from '@react-email/components';
import { BRAND } from '../../brand/hitpay.js';
import { Wrapper } from './shared/wrapper.js';
import { Header } from './shared/header.js';
import { Footer } from './shared/footer.js';
import { Button } from './shared/button.js';
import { SectionRenderer } from './shared/section-renderer.js';
import type { AppChangesFrontmatter, EdmSection } from '../../schema/edm.js';

interface Props {
  frontmatter: AppChangesFrontmatter;
  sections: EdmSection[];
}

export function AppChangesEmail({ frontmatter, sections }: Props) {
  const fm = frontmatter;

  return (
    <Wrapper previewText={fm.previewText}>
      <Header />

      {/* Badge row */}
      <Section style={{ padding: `${BRAND.spacing.xl} ${BRAND.spacing.xl} 0` }}>
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
            margin: '0 8px 0 0',
          }}
        >
          App Update
        </Text>
        {fm.versionBadge && (
          <Text
            style={{
              fontFamily: BRAND.fonts.body,
              fontSize: BRAND.fontSizes.bodySmall,
              fontWeight: 600,
              color: BRAND.colors.textSecondary,
              backgroundColor: BRAND.colors.neutral100,
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '12px',
              margin: '0',
            }}
          >
            {fm.versionBadge}
          </Text>
        )}
        {fm.effectiveDate && (
          <Text
            style={{
              fontFamily: BRAND.fonts.body,
              fontSize: BRAND.fontSizes.caption,
              color: BRAND.colors.textSecondary,
              margin: '8px 0 0 0',
            }}
          >
            Effective {fm.effectiveDate}
          </Text>
        )}
      </Section>

      {/* Optional hero image */}
      {fm.heroImage && (
        <Section style={{ padding: `${BRAND.spacing.md} ${BRAND.spacing.xl} 0` }}>
          <Img
            src={fm.heroImage}
            alt=""
            width="536"
            style={{ display: 'block', maxWidth: '100%', borderRadius: BRAND.email.borderRadius }}
          />
        </Section>
      )}

      {/* Body sections */}
      <Section style={{ padding: `${BRAND.spacing.xl} 0` }}>
        {sections.map((section, i) => (
          <SectionRenderer key={i} section={section} />
        ))}
      </Section>

      {/* Optional CTA */}
      {fm.ctaUrl && (
        <Section
          style={{
            textAlign: 'center' as const,
            padding: `0 ${BRAND.spacing.xl} ${BRAND.spacing.xxl}`,
          }}
        >
          <Button href={fm.ctaUrl}>{fm.ctaText}</Button>
        </Section>
      )}

      <Footer market={fm.market} />
    </Wrapper>
  );
}
