import React from 'react';
import { Section, Text } from '@react-email/components';
import { BRAND } from '../../brand/hitpay.js';
import { Wrapper } from './shared/wrapper.js';
import { Header } from './shared/header.js';
import { Footer } from './shared/footer.js';
import { Button } from './shared/button.js';
import { SectionRenderer } from './shared/section-renderer.js';
import type { ComplianceFrontmatter, EdmSection } from '../../schema/edm.js';

interface Props {
  frontmatter: ComplianceFrontmatter;
  sections: EdmSection[];
}

export function ComplianceEmail({ frontmatter, sections }: Props) {
  const fm = frontmatter;

  return (
    <Wrapper previewText={fm.previewText}>
      <Header />

      {/* Compliance notice header */}
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
              bgcolor={BRAND.colors.paleBlue}
              style={{
                backgroundColor: BRAND.colors.paleBlue,
                borderBottom: `2px solid ${BRAND.colors.actionBlue}`,
                padding: `${BRAND.spacing.xl} ${BRAND.spacing.xl}`,
              }}
            >
              <Text
                style={{
                  fontFamily: BRAND.fonts.body,
                  fontSize: BRAND.fontSizes.eyebrow,
                  fontWeight: 600,
                  color: BRAND.colors.actionBlue,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '1.5px',
                  margin: '0 0 6px 0',
                }}
              >
                {fm.complianceType ?? 'Compliance Notice'}
              </Text>
              {fm.effectiveDate && (
                <Text
                  style={{
                    fontFamily: BRAND.fonts.body,
                    fontSize: BRAND.fontSizes.bodySmall,
                    color: BRAND.colors.textSecondary,
                    margin: '0',
                  }}
                >
                  Effective {fm.effectiveDate}
                </Text>
              )}
              {fm.requiredAction && (
                <Text
                  style={{
                    fontFamily: BRAND.fonts.body,
                    fontSize: BRAND.fontSizes.bodySmall,
                    fontWeight: 600,
                    color: BRAND.colors.textPrimary,
                    backgroundColor: BRAND.colors.lightBlue,
                    margin: '12px 0 0 0',
                    padding: '8px 12px',
                    borderRadius: BRAND.email.borderRadius,
                    display: 'block',
                  }}
                >
                  Action required: {fm.requiredAction}
                </Text>
              )}
            </td>
          </tr>
        </table>
      </Section>

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
