import React from 'react';
import { Section, Row, Column, Text, Link, Hr, Img } from '@react-email/components';
import { BRAND } from '../../../brand/hitpay.js';

const SOCIAL_ICONS = [
  { name: 'Instagram', href: BRAND.social.links.instagram, src: BRAND.social.icons.instagram },
  { name: 'Facebook',  href: BRAND.social.links.facebook,  src: BRAND.social.icons.facebook  },
  { name: 'LinkedIn',  href: BRAND.social.links.linkedin,  src: BRAND.social.icons.linkedin  },
  { name: 'TikTok',   href: BRAND.social.links.tiktok,    src: BRAND.social.icons.tiktok    },
  { name: 'YouTube',  href: BRAND.social.links.youtube,   src: BRAND.social.icons.youtube   },
];

export function Footer() {
  return (
    <Section>
      <Row>
        {/* bgcolor on <td> ensures the beige background fills the full footer reliably */}
        <Column
          bgcolor="#F9F9F6"
          style={{
            backgroundColor: BRAND.colors.beige,
            padding: `${BRAND.spacing.xl} ${BRAND.spacing.xl}`,
          }}
        >
          {/* Social row: logogram | icons | hitpayapp.com */}
          <table cellPadding={0} cellSpacing={0} style={{ margin: '0 auto' }}>
            <tbody>
              <tr>
                <td style={{ verticalAlign: 'middle', paddingRight: '10px' }}>
                  <Img
                    src={BRAND.social.logogram}
                    width="22"
                    height="22"
                    alt="HitPay"
                    style={{ display: 'block' }}
                  />
                </td>
                <td style={{ verticalAlign: 'middle', color: BRAND.colors.neutral200, fontSize: '18px', paddingRight: '10px', lineHeight: '1' }}>|</td>
                {SOCIAL_ICONS.map(icon => (
                  <td key={icon.name} style={{ verticalAlign: 'middle', padding: '0 3px' }}>
                    <Link href={icon.href}>
                      <Img src={icon.src} width="26" height="26" alt={icon.name} style={{ display: 'block' }} />
                    </Link>
                  </td>
                ))}
                <td style={{ verticalAlign: 'middle', color: BRAND.colors.neutral200, fontSize: '18px', paddingLeft: '10px', paddingRight: '10px', lineHeight: '1' }}>|</td>
                <td style={{ verticalAlign: 'middle' }}>
                  <Link
                    href={BRAND.defaults.website}
                    style={{
                      fontFamily: BRAND.fonts.body,
                      fontSize: BRAND.fontSizes.bodySmall,
                      color: BRAND.colors.textSecondary,
                      textDecoration: 'none',
                    }}
                  >
                    hitpayapp.com
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Spacer between social row and tagline */}
          <table width="100%" cellPadding={0} cellSpacing={0} border={0}>
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
