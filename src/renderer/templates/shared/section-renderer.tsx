import React from 'react';
import { Section, Text, Img, Row, Column } from '@react-email/components';
import { BRAND } from '../../../brand/hitpay.js';
import { Button } from './button.js';
import { Divider } from './divider.js';
import { MetricCard } from './card.js';
import type { EdmSection } from '../../../schema/edm.js';

interface SectionRendererProps {
  section: EdmSection;
}

/**
 * Maps a parsed EdmSection to React Email components.
 * Used by all templates for consistent body rendering.
 */
export function SectionRenderer({ section }: SectionRendererProps) {
  switch (section.type) {
    case 'heading':
      return (
        <Text
          style={{
            fontFamily: BRAND.fonts.headline,
            fontSize: section.level <= 2 ? BRAND.fontSizes.headline : BRAND.fontSizes.body,
            fontWeight: 700,
            color: BRAND.colors.deepBlue,
            lineHeight: '1.3',
            margin: section.level <= 2 ? '0 0 16px 0' : '16px 0 24px 0',
            padding: `0 ${BRAND.spacing.lg}`,
          }}
        >
          {section.text}
        </Text>
      );

    case 'paragraph': {
      const isCentered = section.text.endsWith('{.center}');
      const paraText = isCentered ? section.text.slice(0, -'{.center}'.length).trim() : section.text;
      return (
        <Text
          style={{
            fontFamily: BRAND.fonts.body,
            fontSize: BRAND.fontSizes.bodySmall,
            color: BRAND.colors.textSecondary,
            lineHeight: '1.6',
            margin: '0 0 16px 0',
            padding: `0 ${BRAND.spacing.lg}`,
            ...(isCentered ? { textAlign: 'center' as const } : {}),
          }}
        >
          {renderInlineMarkdown(paraText)}
        </Text>
      );
    }

    case 'bullets':
      return (
        <Section style={{ padding: `0 ${BRAND.spacing.lg}`, marginBottom: '16px' }}>
          {section.items.map((item, i) => (
            <Text
              key={i}
              style={{
                fontFamily: BRAND.fonts.body,
                fontSize: BRAND.fontSizes.bodySmall,
                color: BRAND.colors.textSecondary,
                lineHeight: '1.6',
                margin: '0 0 8px 0',
                paddingLeft: '16px',
              }}
            >
              {'• '}{renderInlineMarkdown(item)}
            </Text>
          ))}
        </Section>
      );

    case 'blockquote':
      return (
        <Section>
          <Row>
            {/* Horizontal padding on the <td> keeps blockquote inset from email edges */}
            <Column style={{ padding: `0 ${BRAND.spacing.lg} ${BRAND.spacing.lg}` }}>
              <table
                width="100%"
                cellPadding={0}
                cellSpacing={0}
                border={0}
                style={{
                  borderLeft: `4px solid ${BRAND.colors.actionBlue}`,
                  backgroundColor: BRAND.colors.paleBlue,
                  borderRadius: `0 ${BRAND.email.cardRadius} ${BRAND.email.cardRadius} 0`,
                }}
              >
                <tbody>
                  <tr>
                    <td style={{ padding: `${BRAND.spacing.md} ${BRAND.spacing.lg}` }}>
                      <Text
                        style={{
                          fontFamily: BRAND.fonts.body,
                          fontSize: BRAND.fontSizes.bodySmall,
                          fontStyle: 'italic',
                          color: BRAND.colors.textSecondary,
                          lineHeight: '1.6',
                          margin: '0',
                        }}
                      >
                        {renderInlineMarkdown(section.text)}
                      </Text>
                      {section.attribution && (
                        <Text
                          style={{
                            fontFamily: BRAND.fonts.body,
                            fontSize: BRAND.fontSizes.bodySmall,
                            color: BRAND.colors.textSecondary,
                            margin: '8px 0 0 0',
                          }}
                        >
                          — {section.attribution}
                        </Text>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Column>
          </Row>
        </Section>
      );

    case 'cta':
      return (
        <Section
          style={{
            textAlign: 'center' as const,
            padding: `${BRAND.spacing.md} ${BRAND.spacing.lg} ${BRAND.spacing.lg}`,
          }}
        >
          <Button href={section.url}>{section.text}</Button>
        </Section>
      );

    case 'divider':
      return <Divider />;

    case 'image':
      return (
        <Section style={{ padding: `0 ${BRAND.spacing.lg}`, marginBottom: '16px', textAlign: section.width ? 'center' as const : undefined }}>
          <Img
            src={section.src}
            alt={section.alt || ''}
            width={section.width ?? '100%'}
            style={{
              display: 'block',
              borderRadius: BRAND.email.borderRadius,
              maxWidth: '100%',
              ...(section.width ? { margin: '0 auto' } : {}),
            }}
          />
        </Section>
      );

    case 'image_text': {
      const isLeft = section.imagePosition === 'left';
      const imgCol = (
        <Column style={{ width: '42%', verticalAlign: 'middle', paddingRight: isLeft ? '16px' : '0', paddingLeft: isLeft ? '0' : '16px' }}>
          <Img
            src={section.src}
            alt={section.alt || ''}
            width="100%"
            style={{ display: 'block', borderRadius: BRAND.email.cardRadius, objectFit: 'cover' as const }}
          />
        </Column>
      );
      const textCol = (
        <Column style={{ width: '58%', verticalAlign: 'top' }}>
          {section.heading && (
            <Text style={{ fontFamily: BRAND.fonts.headline, fontSize: BRAND.fontSizes.body, fontWeight: 700, color: BRAND.colors.textPrimary, lineHeight: '1.3', margin: '0 0 12px 0' }}>
              {section.heading}
            </Text>
          )}
          {section.items && section.items.length > 0
            ? section.items.map((item, idx) => (
                <Row key={idx} style={{ marginBottom: '12px' }}>
                  <Column style={{ verticalAlign: 'top' }}>
                    <Text style={{ fontFamily: BRAND.fonts.body, fontSize: BRAND.fontSizes.body, fontWeight: 700, color: BRAND.colors.textPrimary, lineHeight: '1.4', margin: '0 0 2px 0' }}>{item.title}</Text>
                    <Text style={{ fontFamily: BRAND.fonts.body, fontSize: BRAND.fontSizes.bodySmall, fontWeight: 400, color: BRAND.colors.textSecondary, lineHeight: '1.5', margin: '0' }}>{item.body}</Text>
                  </Column>
                </Row>
              ))
            : (
              <Text style={{ fontFamily: BRAND.fonts.body, fontSize: BRAND.fontSizes.body, color: BRAND.colors.textSecondary, lineHeight: '1.6', margin: '0' }}>
                {section.text}
              </Text>
            )
          }
        </Column>
      );
      return (
        <Section style={{ padding: `0 ${BRAND.spacing.lg}`, marginBottom: '24px', marginTop: '8px' }}>
          <Row style={{ width: '100%' }}>
            {isLeft ? imgCol : textCol}
            {isLeft ? textCol : imgCol}
          </Row>
        </Section>
      );
    }

    case 'bullet_list':
      return (
        <Section style={{ padding: `0 ${BRAND.spacing.lg}`, marginBottom: '24px' }}>
          {section.items.map((item, i) => (
            <Row key={i} style={{ marginBottom: i === section.items.length - 1 ? '0' : '20px' }}>
              <Column style={{ width: '24px', verticalAlign: 'top' }}>
                <Text style={{ fontFamily: BRAND.fonts.body, fontSize: BRAND.fontSizes.body, fontWeight: 700, color: BRAND.colors.actionBlue, lineHeight: '1.4', margin: '0' }}>•</Text>
              </Column>
              <Column style={{ verticalAlign: 'top', paddingLeft: '4px' }}>
                <Text style={{ fontFamily: BRAND.fonts.body, fontSize: BRAND.fontSizes.body, fontWeight: 700, color: BRAND.colors.textPrimary, lineHeight: '1.4', margin: '0 0 4px 0' }}>{item.title}</Text>
                <Text style={{ fontFamily: BRAND.fonts.body, fontSize: BRAND.fontSizes.bodySmall, fontWeight: 400, color: BRAND.colors.textSecondary, lineHeight: '1.6', margin: '0' }}>{item.body}</Text>
              </Column>
            </Row>
          ))}
        </Section>
      );

    case 'metric':
      return (
        <Section
          style={{
            padding: `0 ${BRAND.spacing.lg}`,
            marginBottom: '16px',
            textAlign: 'center' as const,
          }}
        >
          {section.items.map((item, i) => (
            <MetricCard key={i} value={item.value} label={item.label} solo={section.items.length === 1} />
          ))}
        </Section>
      );

    case 'image_row': {
      const colWidth = `${Math.floor(100 / section.images.length)}%`;
      return (
        <Section style={{ padding: '0', marginBottom: '16px' }}>
          <Row style={{ width: '100%' }}>
            {section.images.map((img, i) => (
              <Column key={i} style={{ width: colWidth, verticalAlign: 'top' }}>
                <Img
                  src={img.src}
                  alt={img.alt || ''}
                  width="100%"
                  style={{ display: 'block', borderRadius: '0', maxWidth: '100%' }}
                />
              </Column>
            ))}
          </Row>
        </Section>
      );
    }

    case 'feature_card': {
      const isLeft = section.imagePosition === 'left';
      const textCol = (
        <Column style={{ width: '62%', verticalAlign: 'top', paddingRight: isLeft ? '0' : '20px', paddingLeft: isLeft ? '20px' : '0' }}>
          <Text style={{ fontFamily: BRAND.fonts.headline, fontSize: BRAND.fontSizes.body, fontWeight: 700, color: BRAND.colors.textPrimary, lineHeight: '1.3', margin: '0 0 12px 0' }}>
            {section.heading}
          </Text>
          {section.paragraphs.map((p, i) => (
            <Text key={i} style={{ fontFamily: BRAND.fonts.body, fontSize: BRAND.fontSizes.bodySmall, color: BRAND.colors.textSecondary, lineHeight: '1.6', margin: '0 0 10px 0' }}>
              {p}
            </Text>
          ))}
          {section.youGet.length > 0 && (
            <>
              <Text style={{ fontFamily: BRAND.fonts.body, fontSize: BRAND.fontSizes.body, fontWeight: 600, color: BRAND.colors.textPrimary, lineHeight: '1.5', margin: '10px 0 6px 0' }}>
                You get:
              </Text>
              {section.youGet.map((item, i) => (
                <Text key={i} style={{ fontFamily: BRAND.fonts.body, fontSize: BRAND.fontSizes.bodySmall, color: BRAND.colors.textSecondary, lineHeight: '1.5', margin: '0 0 4px 0' }}>
                  {'• '}{item}
                </Text>
              ))}
            </>
          )}
          {section.closingText && (
            <Text style={{ fontFamily: BRAND.fonts.body, fontSize: BRAND.fontSizes.bodySmall, color: BRAND.colors.textSecondary, lineHeight: '1.6', margin: '10px 0 16px 0' }}>
              {section.closingText}
            </Text>
          )}
          <a href={section.ctaUrl} style={{ fontFamily: BRAND.fonts.body, fontSize: BRAND.fontSizes.body, fontWeight: 600, color: BRAND.colors.actionBlue, textDecoration: 'underline' }}>
            {section.ctaText}
          </a>
        </Column>
      );
      const imageCol = (
        <Column style={{ width: '38%', verticalAlign: 'middle', backgroundColor: BRAND.colors.paleBlue, borderRadius: '12px', padding: '12px' }}>
          <Img
            src={section.src}
            alt={section.alt || ''}
            width="100%"
            style={{ display: 'block', borderRadius: '8px', height: 'auto' }}
          />
        </Column>
      );
      return (
        <Section style={{ padding: `0 ${BRAND.spacing.lg}`, marginBottom: '40px' }}>
          <Row style={{ width: '100%' }}>
            {isLeft ? imageCol : textCol}
            {isLeft ? textCol : imageCol}
          </Row>
        </Section>
      );
    }
  }
}

/**
 * Render inline markdown bold/italic to React elements.
 * Handles **bold** and *italic* patterns.
 */
function renderInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Link: [text](url)
    const linkMatch = remaining.match(/^(.*?)\[([^\]]+)\]\(([^)]+)\)(.*)/s);
    if (linkMatch) {
      if (linkMatch[1]) parts.push(<React.Fragment key={key++}>{linkMatch[1]}</React.Fragment>);
      parts.push(
        <a key={key++} href={linkMatch[3]} style={{ color: BRAND.colors.actionBlue, textDecoration: 'underline' }}>
          {linkMatch[2]}
        </a>,
      );
      remaining = linkMatch[4];
      continue;
    }

    // Bold: **text**
    const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)/s);
    if (boldMatch) {
      if (boldMatch[1]) parts.push(<React.Fragment key={key++}>{boldMatch[1]}</React.Fragment>);
      parts.push(
        <span key={key++} style={{ fontWeight: 700, color: BRAND.colors.textPrimary }}>
          {boldMatch[2]}
        </span>,
      );
      remaining = boldMatch[3];
      continue;
    }

    // Italic: *text* (single asterisk, not preceded by another *)
    const italicMatch = remaining.match(/^(.*?)(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)(.*)/s);
    if (italicMatch) {
      if (italicMatch[1]) parts.push(<React.Fragment key={key++}>{italicMatch[1]}</React.Fragment>);
      parts.push(
        <span key={key++} style={{ fontStyle: 'italic' }}>
          {italicMatch[2]}
        </span>,
      );
      remaining = italicMatch[3];
      continue;
    }

    // No more inline formatting
    parts.push(<React.Fragment key={key++}>{remaining}</React.Fragment>);
    break;
  }

  return parts;
}
