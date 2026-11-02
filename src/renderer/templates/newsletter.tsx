import React from 'react';
import { Section, Text, Img } from '@react-email/components';
import { BRAND } from '../../brand/hitpay.js';
import { Wrapper } from './shared/wrapper.js';
import { Header } from './shared/header.js';
import { LOGO_DARK_OPAQUE } from '../brand-assets.js';
import { Footer } from './shared/footer.js';
import { SectionRenderer } from './shared/section-renderer.js';
import type { NewsletterFrontmatter, EdmSection } from '../../schema/edm.js';

interface Props {
  frontmatter: NewsletterFrontmatter;
  sections: EdmSection[];
}

export function NewsletterEmail({ frontmatter, sections }: Props) {
  const fm = frontmatter;
  const light = fm.headerStyle === 'light';

  return (
    <Wrapper previewText={fm.previewText}>
      {light ? (
        <Section style={{ backgroundColor: BRAND.colors.white, padding: `${BRAND.spacing.lg} ${BRAND.spacing.xl} 8px` }}>
          <Img src={LOGO_DARK_OPAQUE} alt="HitPay" width="120" style={{ display: 'block' }} />
        </Section>
      ) : (
        <Header />
      )}

      {/* Newsletter header bar — only shown when title/subtitle/date are provided */}
      {(fm.title || fm.subtitle || fm.date) && (
        <Section
          style={{
            backgroundColor: light ? BRAND.colors.white : BRAND.colors.deepBlue,
            padding: light ? `8px ${BRAND.spacing.xl} ${BRAND.spacing.lg}` : `${BRAND.spacing.lg} ${BRAND.spacing.xl}`,
          }}
        >
          <Text
            style={{
              fontFamily: BRAND.fonts.headline,
              fontSize: BRAND.fontSizes.headline,
              fontWeight: 700,
              color: light ? BRAND.colors.deepBlue : BRAND.colors.white,
              margin: '0',
              lineHeight: '1.3',
            }}
          >
            {fm.title ?? fm.subject}
            {fm.issueNumber ? ` #${fm.issueNumber}` : ''}
          </Text>
          {(fm.subtitle ?? fm.date) && (
            <Text
              style={{
                fontFamily: BRAND.fonts.body,
                fontSize: BRAND.fontSizes.bodySmall,
                color: BRAND.colors.neutral200,
                margin: '4px 0 0 0',
              }}
            >
              {fm.subtitle ?? fm.date}
            </Text>
          )}
        </Section>
      )}

      {/* Optional hero image — full bleed, no rounding */}
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

      <Footer market={fm.market} clean={fm.cleanFooter === true} />
    </Wrapper>
  );
}
