import React from 'react';
import { Section, Row, Column, Text, Link, Hr } from '@react-email/components';
import { BRAND } from '../../../brand/hitpay.js';

const SOCIAL_LINKS = [
  { name: 'Instagram', href: BRAND.social.links.instagram },
  { name: 'Facebook',  href: BRAND.social.links.facebook  },
  { name: 'LinkedIn',  href: BRAND.social.links.linkedin  },
  { name: 'TikTok',   href: BRAND.social.links.tiktok    },
  { name: 'YouTube',  href: BRAND.social.links.youtube   },
];

export function Footer() {
  return (
    <Section>
      <Row>
        <Column
          bgcolor="#F9F9F6"
          style={{
            backgroundColor: BRAND.colors.beige,
            padding: `${BRAND.spacing.xl} ${BRAND.spacing.xl}`,
          }}
        >
          {/* Social links row */}
          <table cellPadding={0} cellSpacing={0} style={{ margin: '0 auto' }}>
            <tbody>
              <tr>
                {SOCIAL_LINKS.map((s, i) => (
                  <React.Fragment key={s.name}>
                    <td style={{ verticalAlign: 'middle', padding: '0 6px' }}>
                      <Link
                        href={s.href}
                        style={{
                          fontFamily: BRAND.fonts.body,
                          fontSize: BRAND.fontSizes.caption,
                          fontWeight: 600,
                          color: BRAND.colors.textSecondary,
                          textDecoration: 'none',
                        }}
                      >
                        {s.name}
                      </Link>
                    </td>
                    {i < SOCIAL_LINKS.length - 1 && (
                      <td style={{ verticalAlign: 'middle', color: BRAND.colors.neutral200, fontSize: '10px', lineHeight: '1' }}>·</td>
                    )}
                  </React.Fragment>
                ))}
              </tr>
            </tbody>
          </table>

          {/* Spacer */}
          <table width="100%" cellPadding={0} cellSpacing={0}>
            <tbody><tr><td height={16} style={{ height: '16px', lineHeight: '16px', fontSize: '1px' }}>&nbsp;</td></tr></tbody>
          </table>

          {/* Tagline */}
          <Text
            style={{
              fontFamily: BRAND.fonts.body,
              fontSize: BRAND.fontSizes.bodySmall,
              color: BRAND.colors.textSecondary,
              lineHeight: '20px',
              margin: '0 0 16px 0',
              textAlign: 'center' as const,
            }}
          >
            {BRAND.defaults.tagline}
          </Text>

          <Hr style={{ borderColor: BRAND.colors.neutral200, margin: '0 0 16px 0' }} />

          {/* Address & unsubscribe */}
          <Text
            style={{
              fontFamily: BRAND.fonts.body,
              fontSize: BRAND.fontSizes.caption,
              color: BRAND.colors.textTertiary,
              lineHeight: '18px',
              margin: '0',
              textAlign: 'center' as const,
            }}
          >
            {BRAND.defaults.companyAddress}
            <br />
            <Link
              href="{unsubscribe_link}"
              style={{ color: BRAND.colors.textTertiary, textDecoration: 'none', fontSize: '12px' }}
            >
              {BRAND.defaults.unsubscribeText}
            </Link>
          </Text>
        </Column>
      </Row>
    </Section>
  );
}
