import React from 'react';
import { Section, Text, Img } from '@react-email/components';
import { BRAND } from '../../brand/hitpay.js';
import { Wrapper } from './shared/wrapper.js';
import { Header } from './shared/header.js';
import { Footer } from './shared/footer.js';
import { Button } from './shared/button.js';
import { SectionRenderer } from './shared/section-renderer.js';
import type { PartnerSpotlightFrontmatter, EdmSection } from '../../schema/edm.js';

interface Props {
  frontmatter: PartnerSpotlightFrontmatter;
  sections: EdmSection[];
}

export function PartnerSpotlightEmail({ frontmatter, sections }: Props) {
  const fm = frontmatter;

  return (
    <Wrapper previewText={fm.previewText}>
      <Header />

      {/* Partner header — hero image only if provided */}
      {fm.heroImage && (
        <Section style={{ lineHeight: '0', fontSize: '0' }}>
          <Img
            src={fm.heroImage}
            alt={fm.partnerName}
            width="600"
            style={{ display: 'block', width: '100%', maxWidth: '600px' }}
          />
        </Section>
      )}

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
