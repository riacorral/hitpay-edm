import React from 'react';
import { Section, Text, Img } from '@react-email/components';
import { BRAND } from '../../brand/hitpay.js';
import { Wrapper } from './shared/wrapper.js';
import { Header } from './shared/header.js';
import { Footer } from './shared/footer.js';
import { Button } from './shared/button.js';
import { SectionRenderer } from './shared/section-renderer.js';
import type { RateChangesFrontmatter, EdmSection } from '../../schema/edm.js';

interface Props {
  frontmatter: RateChangesFrontmatter;
  sections: EdmSection[];
}

export function RateChangesEmail({ frontmatter, sections }: Props) {
  const fm = frontmatter;

  return (
    <Wrapper previewText={fm.previewText}>
      <Header />

      {/* Rate change hero banner */}
      <Section>
        <table
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          role="presentation"
          style={{ borderCollapse: 'collapse' as const }}
        >
          <tr>
            <td
              bgcolor={BRAND.colors.deepBlue}
              style={{
                background: `linear-gradient(135deg, ${BRAND.colors.deepBlue} 0%, ${BRAND.colors.logoBlue} 100%)`,
                backgroundColor: BRAND.colors.deepBlue,
                padding: `${BRAND.spacing.xxl} ${BRAND.spacing.xl}`,
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
                Rate Update
              </Text>
              {fm.rateDescription && (
                <Text
                  style={{
                    fontFamily: BRAND.fonts.headline,
                    fontSize: BRAND.fontSizes.heroTitle,
                    fontWeight: 700,
                    color: BRAND.colors.white,
                    margin: '0 0 16px 0',
                    lineHeight: '1.2',
                  }}
                >
                  {fm.rateDescription}
                </Text>
              )}
              {/* Effective date pill */}
              <Text
                style={{
                  fontFamily: BRAND.fonts.body,
                  fontSize: BRAND.fontSizes.bodySmall,
                  fontWeight: 600,
                  color: BRAND.colors.deepBlue,
                  backgroundColor: BRAND.colors.warning,
                  display: 'inline-block',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  margin: '0',
                }}
              >
                Effective {fm.effectiveDate}
              </Text>
            </td>
          </tr>
        </table>
      </Section>

      {/* Optional hero image */}
      {fm.heroImage && (
        <Img
          src={fm.heroImage}
          alt=""
          width="600"
          style={{ display: 'block', maxWidth: '100%' }}
        />
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
