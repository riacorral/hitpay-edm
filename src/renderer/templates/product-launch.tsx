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
  const bodyHasCta = sections.some(s => s.type === 'cta');

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
        <table cellPadding={0} cellSpacing={0} border={0} style={{ margin: '0 auto 20px' }}>
          <tbody>
            <tr>
              <td
                style={{
                  backgroundColor: BRAND.colors.white,
                  borderRadius: '20px',
                  padding: '8px 20px',
                  fontFamily: BRAND.fonts.body,
                  fontSize: '13px',
                  fontWeight: 800,
                  color: BRAND.colors.deepBlue,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase' as const,
                  textAlign: 'center' as const,
                  whiteSpace: 'nowrap' as const,
                }}
              >
                {fm.eyebrowText ?? 'Product Announcement'}
              </td>
            </tr>
          </tbody>
        </table>
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
        {fm.subtitle && (
          <Text
            style={{
              fontFamily: BRAND.fonts.body,
              fontSize: '15px',
              fontWeight: 400,
              color: BRAND.colors.neutral200,
              lineHeight: '1.5',
              margin: '0 8px 24px',
            }}
          >
            {fm.subtitle}
          </Text>
        )}
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

      {/* Body sections — Column wrapper ensures paddingTop is on a <td>, not a <table> (Gmail strips table margins) */}
      <Section>
        <Row>
          <Column style={{ paddingTop: BRAND.spacing.xl }}>
            {sections.map((section, i) => (
              <SectionRenderer key={i} section={section} />
            ))}
          </Column>
        </Row>
      </Section>

      {/* Primary CTA + optional secondary CTA — skipped if body already has a {.cta} link or no ctaUrl */}
      {!bodyHasCta && fm.ctaUrl && <Section
        style={{
          textAlign: 'center' as const,
          padding: `${BRAND.spacing.lg} ${BRAND.spacing.xl} ${BRAND.spacing.xxl}`,
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
      </Section>}

      <Footer market={fm.market} />
    </Wrapper>
  );
}
