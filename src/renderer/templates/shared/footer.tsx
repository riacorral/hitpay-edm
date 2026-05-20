import React from 'react';
import { Section, Row, Column, Text, Link, Hr, Img } from '@react-email/components';
import { BRAND } from '../../../brand/hitpay.js';

const APP_BASE = 'https://hitpay-edm.vercel.app';

const SOCIAL_ICONS = [
  { name: 'Instagram', href: BRAND.social.links.instagram, src: `${APP_BASE}/icons/social-instagram.png` },
  { name: 'Facebook',  href: BRAND.social.links.facebook,  src: `${APP_BASE}/icons/social-facebook.png`  },
  { name: 'LinkedIn',  href: BRAND.social.links.linkedin,  src: `${APP_BASE}/icons/social-linkedin.png`  },
  { name: 'TikTok',   href: BRAND.social.links.tiktok,    src: `${APP_BASE}/icons/social-tiktok.png`    },
  { name: 'YouTube',  href: BRAND.social.links.youtube,   src: `${APP_BASE}/icons/social-youtube.png`   },
];

function SocialIcon({ name, href, src }: { name: string; href: string; src: string }) {
  return (
    <td style={{ padding: '0 5px' }}>
      <Link href={href} title={name} style={{ textDecoration: 'none' }}>
        <Img src={src} alt={name} width={24} height={24} style={{ display: 'block', borderRadius: '50%' }} />
      </Link>
    </td>
  );
}

export function Footer() {
  return (
    <Section>
      <Row>
        <Column
          style={{
            backgroundColor: BRAND.colors.beige,
            padding: `${BRAND.spacing.xl} ${BRAND.spacing.xl} ${BRAND.spacing.lg}`,
          }}
        >
          {/* Logogram */}
          <table width="100%" cellPadding={0} cellSpacing={0}>
            <tbody>
              <tr>
                <td style={{ textAlign: 'center', paddingBottom: '16px' }}>
                  <Img
                    src={BRAND.logo.dark}
                    alt="HitPay"
                    width={80}
                    height="auto"
                    style={{ display: 'inline-block' }}
                  />
                </td>
              </tr>
            </tbody>
          </table>

          {/* Social icon circles */}
          <table cellPadding={0} cellSpacing={0} style={{ margin: '0 auto', paddingBottom: '20px' }}>
            <tbody>
              <tr>
                {SOCIAL_ICONS.map(s => (
                  <SocialIcon key={s.name} {...s} />
                ))}
              </tr>
            </tbody>
          </table>

          <Hr style={{ borderColor: BRAND.colors.neutral200, margin: '0 0 16px 0' }} />

          {/* Company name — linked */}
          <Text
            style={{
              fontFamily: BRAND.fonts.body,
              fontSize: '11px',
              color: BRAND.colors.textTertiary,
              lineHeight: '16px',
              margin: '0 0 4px 0',
              textAlign: 'center' as const,
            }}
          >
            <Link
              href={BRAND.defaults.website}
              style={{ color: BRAND.colors.textTertiary, textDecoration: 'none' }}
            >
              HitPay Payment Solutions Pte Ltd
            </Link>
          </Text>

          {/* Unsubscribe — small and muted, separated */}
          <Text
            style={{
              fontFamily: BRAND.fonts.body,
              fontSize: '10px',
              color: BRAND.colors.neutral400,
              lineHeight: '14px',
              margin: '8px 0 0 0',
              textAlign: 'center' as const,
            }}
          >
            <Link
              href="{unsubscribe_link}"
              style={{ color: BRAND.colors.neutral400, textDecoration: 'underline', fontSize: '10px' }}
            >
              Unsubscribe
            </Link>
          </Text>
        </Column>
      </Row>
    </Section>
  );
}
