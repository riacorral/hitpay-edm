import React from 'react';
import { Section, Text, Img, Row, Column } from '@react-email/components';
import { BRAND } from '../../brand/hitpay.js';
import { Wrapper } from './shared/wrapper.js';
import { Header } from './shared/header.js';
import { Footer } from './shared/footer.js';
import { Button } from './shared/button.js';
import { SectionRenderer } from './shared/section-renderer.js';
import type { EventInvitationFrontmatter, EdmSection } from '../../schema/edm.js';

interface Props {
  frontmatter: EventInvitationFrontmatter;
  sections: EdmSection[];
}

/**
 * Email-safe vertical spacer. Uses <td height> (HTML attribute) which is
 * universally supported in all email clients, unlike CSS padding on <table>.
 */
function Spacer({ height }: { height: number }) {
  return (
    <table width="100%" cellPadding={0} cellSpacing={0} border={0}>
      <tbody>
        <tr>
          <td
            height={height}
            style={{ height: `${height}px`, lineHeight: `${height}px`, fontSize: '1px' }}
          >
            &nbsp;
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function EventInvitationEmail({ frontmatter, sections }: Props) {
  const fm = frontmatter;

  // Split body sections into three groups:
  // introSections  — everything before the first divider (Hi [First Name], opening copy)
  // mainSections   — from first divider up to (not including) first blockquote
  // closingSections — blockquote onwards (spots-limited note, questions, sign-off)
  const firstDividerIdx = sections.findIndex(s => s.type === 'divider');
  const introSections = firstDividerIdx >= 0 ? sections.slice(0, firstDividerIdx) : sections;
  const afterIntro = firstDividerIdx >= 0 ? sections.slice(firstDividerIdx) : [];
  const firstBlockquoteIdx = afterIntro.findIndex(s => s.type === 'blockquote');
  const mainSectionsRaw = firstBlockquoteIdx >= 0 ? afterIntro.slice(0, firstBlockquoteIdx) : afterIntro;
  // Strip leading and trailing dividers to avoid gaps around the section
  const firstNonDivider = mainSectionsRaw.findIndex(s => s.type !== 'divider');
  const trimmedStart = firstNonDivider >= 0 ? mainSectionsRaw.slice(firstNonDivider) : mainSectionsRaw;
  const lastNonDivider = [...trimmedStart].reverse().findIndex(s => s.type !== 'divider');
  const mainSections = lastNonDivider >= 0
    ? trimmedStart.slice(0, trimmedStart.length - lastNonDivider)
    : trimmedStart;
  const closingSections = firstBlockquoteIdx >= 0 ? afterIntro.slice(firstBlockquoteIdx) : [];

  return (
    <Wrapper previewText={fm.previewText}>
      <Header />

      {/* Event hero — flat HTML table so bgcolor="#002771" is on the outermost <table> AND <td>.
          Gmail dark mode reads the outermost bgcolor; if it's dark it preserves white text.
          The CSS gradient visually overrides bgcolor but doesn't affect Gmail's dark mode check. */}
      <table
        width="100%"
        cellPadding={0}
        cellSpacing={0}
        border={0}
        bgcolor="#002771"
        style={{ backgroundColor: BRAND.colors.deepBlue }}
      >
        <tbody>
          <tr>
            <td
              bgcolor="#002771"
              style={{
                background: `linear-gradient(135deg, ${BRAND.colors.deepBlue} 0%, ${BRAND.colors.actionBlue} 100%)`,
                padding: `${BRAND.spacing.xxl} ${BRAND.spacing.xl}`,
                textAlign: 'center' as const,
              }}
            >
              {fm.eyebrowText && (
                <Text
                  style={{
                    fontFamily: BRAND.fonts.body,
                    fontSize: BRAND.fontSizes.eyebrow,
                    fontWeight: 600,
                    color: BRAND.colors.neutral200,
                    textTransform: 'uppercase' as const,
                    letterSpacing: '1.5px',
                    margin: '0 0 16px 0',
                  }}
                >
                  {fm.eyebrowText}
                </Text>
              )}
              {fm.eventName && (
                <Text
                  style={{
                    fontFamily: BRAND.fonts.headline,
                    fontSize: BRAND.fontSizes.heroTitle,
                    fontWeight: 700,
                    color: BRAND.colors.white,
                    lineHeight: '1.2',
                    margin: '0 0 4px 0',
                  }}
                >
                  {fm.eventName}
                </Text>
              )}
              {fm.eventSubtitle && (
                <Text
                  style={{
                    fontFamily: BRAND.fonts.headline,
                    fontSize: BRAND.fontSizes.heroTitle,
                    fontWeight: 700,
                    color: BRAND.colors.white,
                    lineHeight: '1.2',
                    margin: '0',
                  }}
                >
                  {fm.eventSubtitle}
                </Text>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Hero image — full bleed */}
      {fm.heroImage && (
        <Section style={{ padding: '0' }}>
          <Img
            src={fm.heroImage}
            alt="Workshop"
            width="600"
            style={{ display: 'block', width: '100%' }}
          />
        </Section>
      )}

      {/* 1. Intro copy — Hi [First Name], opening paragraphs */}
      {introSections.length > 0 && (
        <>
          <Spacer height={24} />
          <Section>
            {introSections.map((section, i) => (
              <SectionRenderer key={i} section={section} />
            ))}
          </Section>
        </>
      )}

      {/* 2. Event details — bordered text, no background box */}
      {fm.eventDate && (
        <>
          <Spacer height={16} />
          <Section>
            <Row>
              <Column style={{ padding: `0 ${BRAND.spacing.lg} ${BRAND.spacing.md}` }}>
                <table width="100%" cellPadding={0} cellSpacing={0} border={0}>
                  <tbody>
                    <tr>
                      <td
                        style={{
                          borderTop: `1px solid ${BRAND.colors.neutral200}`,
                          borderBottom: `1px solid ${BRAND.colors.neutral200}`,
                          padding: `${BRAND.spacing.lg} 0`,
                          textAlign: 'center' as const,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: BRAND.fonts.body,
                            fontSize: BRAND.fontSizes.body,
                            fontWeight: 700,
                            color: BRAND.colors.deepBlue,
                            margin: '0 0 4px 0',
                            letterSpacing: '0.2px',
                          }}
                        >
                          {fm.eventDate}
                          {fm.eventTime ? ` · ${fm.eventTime}` : ''}
                        </Text>
                        {fm.eventLocation && (
                          <Text
                            style={{
                              fontFamily: BRAND.fonts.body,
                              fontSize: BRAND.fontSizes.bodySmall,
                              color: BRAND.colors.textSecondary,
                              margin: '0',
                            }}
                          >
                            {fm.eventLocation}
                          </Text>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Column>
            </Row>
          </Section>
        </>
      )}

      {/* 3. Testimonial top (Dean Seiff) */}
      {fm.testimonialTopImage && (
        <>
          <Spacer height={32} />
          <Section style={{ padding: '0' }}>
            <Row>
              <Column>
                <Img
                  src={fm.testimonialTopImage}
                  alt="What attendees said"
                  width="600"
                  style={{ display: 'block', width: '100%' }}
                />
              </Column>
            </Row>
          </Section>
        </>
      )}

      {/* 4. Primary CTA — Register for a Spot */}
      {fm.primaryCtaText && fm.primaryCtaUrl && (
        <>
          <Spacer height={32} />
          <Section>
            <Row>
              <Column style={{ textAlign: 'center' as const, padding: `0 ${BRAND.spacing.lg}` }}>
                <Button href={fm.primaryCtaUrl}>{fm.primaryCtaText}</Button>
              </Column>
            </Row>
          </Section>
          <Spacer height={32} />
        </>
      )}

      {/* 5. Main body sections — What You'll Build, Learn, Prerequisites */}
      {mainSections.length > 0 && (
        <Section>
          {mainSections.map((section, i) => (
            <SectionRenderer key={i} section={section} />
          ))}
        </Section>
      )}

      {/* 6. Testimonial bottom (Gillian) */}
      {fm.testimonialBottomImage && (
        <>
          <Spacer height={32} />
          <Section style={{ padding: '0' }}>
            <Row>
              <Column>
                <Img
                  src={fm.testimonialBottomImage}
                  alt="What attendees said"
                  width="600"
                  style={{ display: 'block', width: '100%' }}
                />
              </Column>
            </Row>
          </Section>
        </>
      )}

      {/* 7. Secondary CTA — I want in! */}
      {fm.secondaryCtaText && fm.secondaryCtaUrl && (
        <>
          <Spacer height={32} />
          <Section>
            <Row>
              <Column style={{ textAlign: 'center' as const, padding: `0 ${BRAND.spacing.lg}` }}>
                <Button href={fm.secondaryCtaUrl}>{fm.secondaryCtaText}</Button>
              </Column>
            </Row>
          </Section>
          <Spacer height={32} />
        </>
      )}

      {/* 8. Closing sections — blockquote, questions, sign-off */}
      {closingSections.length > 0 && (
        <Section>
          {closingSections.map((section, i) => (
            <SectionRenderer key={i} section={section} />
          ))}
        </Section>
      )}

      <Spacer height={24} />

      {/* Official venue partner */}
      {fm.partnerLogo && (
        <Section>
          <Row>
            <Column
              style={{
                backgroundColor: '#FFFFFF',
                padding: '24px',
                textAlign: 'center' as const,
              }}
            >
              <Text
                style={{
                  fontFamily: BRAND.fonts.body,
                  fontSize: '10px',
                  fontWeight: 600,
                  color: BRAND.colors.textTertiary,
                  letterSpacing: '1.2px',
                  textTransform: 'uppercase' as const,
                  margin: '0 0 8px 0',
                }}
              >
                Official Venue Partner
              </Text>
              <Img
                src={fm.partnerLogo}
                alt={fm.partnerName || 'Partner'}
                width="80"
                style={{ display: 'inline-block' }}
              />
            </Column>
          </Row>
        </Section>
      )}

      <Footer />
    </Wrapper>
  );
}
