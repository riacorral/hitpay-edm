import React from 'react';
import { Section, Text, Img, Row, Column } from '@react-email/components';
import { BRAND } from '../../brand/hitpay.js';
import { Wrapper } from './shared/wrapper.js';
import { Header } from './shared/header.js';
import { Footer } from './shared/footer.js';
import { Button } from './shared/button.js';
import { SectionRenderer } from './shared/section-renderer.js';
import type { ProductLaunchFrontmatter, EdmSection } from '../../schema/edm.js';

interface Props {
  frontmatter: ProductLaunchFrontmatter;
  sections: EdmSection[];
}

export function ProductLaunchEmail({ frontmatter, sections }: Props) {
  const fm = frontmatter;

  return (
    <Wrapper previewText={fm.previewText}>
      {/* Hero section */}
      <Section
        style={{
          background: `linear-gradient(135deg, ${BRAND.colors.deepBlue} 0%, ${BRAND.colors.actionBlue} 100%)`,
          padding: `${BRAND.spacing.xxl} ${BRAND.spacing.xl} 0`,
          textAlign: 'center' as const,
        }}
      >
        <Text
          style={{
            fontFamily: BRAND.fonts.body,
            fontSize: BRAND.fontSizes.eyebrow,
            fontWeight: 600,
            color: BRAND.colors.neutral200,
            textTransform: 'uppercase' as const,
            letterSpacing: '1.5px',
            margin: '0 0 8px 0',
          }}
        >
          Product Announcement
        </Text>
        {fm.productName.trim().split('\n').map((line, i) => (
          <Text
            key={i}
            style={{
              fontFamily: BRAND.fonts.headline,
              fontSize: i === 0 ? BRAND.fontSizes.heroTitle : BRAND.fontSizes.subheadline,
              fontWeight: i === 0 ? 700 : 400,
              color: i === 0 ? BRAND.colors.white : BRAND.colors.neutral200,
              lineHeight: '1.2',
              margin: i === 0 ? '0 0 4px 0' : '0 0 16px 0',
            }}
          >
            {line}
          </Text>
        ))}
        {fm.heroImage && (
          <Img
            src={fm.heroImage}
            alt={fm.productName}
            width="480"
            style={{
              display: 'block',
              margin: '16px auto 0',
              borderRadius: `${BRAND.email.borderRadius} ${BRAND.email.borderRadius} 0 0`,
              maxWidth: '100%',
            }}
          />
        )}
      </Section>

      {/* Body sections */}
      <Section style={{ padding: `${BRAND.spacing.xl} 0` }}>
        {sections.map((section, i) => (
          <SectionRenderer key={i} section={section} />
        ))}
      </Section>

      {/* Primary CTA + optional secondary CTA */}
      <Section
        style={{
          textAlign: 'center' as const,
          padding: `0 ${BRAND.spacing.xl} ${BRAND.spacing.xxl}`,
        }}
      >
        {fm.secondaryCtaText && fm.secondaryCtaUrl ? (
          <Row>
            <Column style={{ textAlign: 'right' as const, paddingRight: '16px', verticalAlign: 'middle' }}>
              <a
                href={fm.secondaryCtaUrl}
                style={{
                  fontFamily: BRAND.fonts.body,
                  fontSize: BRAND.fontSizes.bodySmall,
                  color: BRAND.colors.actionBlue,
                  textDecoration: 'underline',
                }}
              >
                {fm.secondaryCtaText}
              </a>
            </Column>
            <Column style={{ textAlign: 'left' as const, paddingLeft: '0' }}>
              <Button href={fm.ctaUrl}>{fm.ctaText}</Button>
            </Column>
          </Row>
        ) : (
          <Button href={fm.ctaUrl}>{fm.ctaText}</Button>
        )}
      </Section>

      <Footer />
    </Wrapper>
  );
}
