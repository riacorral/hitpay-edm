import React from 'react';
import { Section, Text, Img } from '@react-email/components';
import { BRAND } from '../../brand/hitpay.js';
import { Wrapper } from './shared/wrapper.js';
import { Header } from './shared/header.js';
import { Footer } from './shared/footer.js';
import { Button } from './shared/button.js';
import { SectionRenderer } from './shared/section-renderer.js';
import type { ImportantAnnouncementFrontmatter, EdmSection } from '../../schema/edm.js';

interface Props {
  frontmatter: ImportantAnnouncementFrontmatter;
  sections: EdmSection[];
}

export function ImportantAnnouncementEmail({ frontmatter, sections }: Props) {
  const fm = frontmatter;

  return (
    <Wrapper previewText={fm.previewText}>
      <Header />

      {/* Alert banner */}
      <Section>
        <table width="100%" cellPadding={0} cellSpacing={0} role="presentation" style={{ borderCollapse: 'collapse' as const }}>
          <tr>
            <td
              bgcolor="#FFF8E1"
              style={{
                backgroundColor: '#FFF8E1',
                borderLeft: '4px solid #F4B840',
                padding: `${BRAND.spacing.md} ${BRAND.spacing.xl}`,
              }}
            >
              <Text
                style={{
                  fontFamily: BRAND.fonts.body,
                  fontSize: BRAND.fontSizes.bodySmall,
                  fontWeight: 700,
                  color: '#92400E',
                  textTransform: 'uppercase' as const,
                  letterSpacing: '1px',
                  margin: '0',
                }}
              >
                ⚠ {fm.badgeText}
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
