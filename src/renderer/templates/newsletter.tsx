import React from 'react';
import { Section, Text } from '@react-email/components';
import { BRAND } from '../../brand/hitpay.js';
import { Wrapper } from './shared/wrapper.js';
import { Header } from './shared/header.js';
import { Footer } from './shared/footer.js';
import { SectionRenderer } from './shared/section-renderer.js';
import type { NewsletterFrontmatter, EdmSection } from '../../schema/edm.js';

interface Props {
  frontmatter: NewsletterFrontmatter;
  sections: EdmSection[];
}

export function NewsletterEmail({ frontmatter, sections }: Props) {
  const fm = frontmatter;

  return (
    <Wrapper previewText={fm.previewText}>
      <Header />

      {/* Newsletter header bar */}
      <Section
        style={{
          backgroundColor: BRAND.colors.deepBlue,
          padding: `${BRAND.spacing.lg} ${BRAND.spacing.xl}`,
        }}
      >
        <Text
          style={{
            fontFamily: BRAND.fonts.headline,
            fontSize: BRAND.fontSizes.headline,
            fontWeight: 700,
            color: BRAND.colors.white,
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

      {/* Body sections */}
      <Section style={{ padding: `${BRAND.spacing.xl} 0` }}>
        {sections.map((section, i) => (
          <SectionRenderer key={i} section={section} />
        ))}
      </Section>

      <Footer market={fm.market} />
    </Wrapper>
  );
}
