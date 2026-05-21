import React from 'react';
import { Section, Row, Column, Text, Link, Hr, Img } from '@react-email/components'; // Img used for banner + social icons
import { BRAND } from '../../../brand/hitpay.js';

const BLOB_BASE = 'https://azjzrc77u6pvsjpm.public.blob.vercel-storage.com/icons';
const BRAND_BASE = 'https://azjzrc77u6pvsjpm.public.blob.vercel-storage.com/brand';

const FOOTER_BANNERS: Record<string, string> = {
  sg:     `${BRAND_BASE}/footer-banner-sg.png`,
  my:     `${BRAND_BASE}/footer-banner-my.png`,
  ph:     `${BRAND_BASE}/footer-banner-ph.png`,
  global: `${BRAND_BASE}/footer-banner-global.png`,
};

const SOCIAL_ICONS = [
  { name: 'Instagram', href: BRAND.social.links.instagram, src: `${BLOB_BASE}/social-instagram.png` },
  { name: 'Facebook',  href: BRAND.social.links.facebook,  src: `${BLOB_BASE}/social-facebook.png`  },
  { name: 'LinkedIn',  href: BRAND.social.links.linkedin,  src: `${BLOB_BASE}/social-linkedin.png`  },
  { name: 'TikTok',   href: BRAND.social.links.tiktok,    src: `${BLOB_BASE}/social-tiktok.png`    },
  { name: 'YouTube',  href: BRAND.social.links.youtube,   src: `${BLOB_BASE}/social-youtube.png`   },
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

export function Footer({ market = 'sg' }: { market?: string }) {
  const bannerSrc = FOOTER_BANNERS[market] ?? FOOTER_BANNERS.global;
  return (
    <Section>
      <Row>
        <Column
          style={{
            backgroundColor: BRAND.colors.beige,
            padding: `${BRAND.spacing.lg} ${BRAND.spacing.xl}`,
          }}
        >
          {/* Social icons */}
          <table cellPadding={0} cellSpacing={0} style={{ margin: '0 auto', paddingBottom: '16px' }}>
            <tbody>
              <tr>
                {SOCIAL_ICONS.map(s => (
                  <SocialIcon key={s.name} {...s} />
                ))}
              </tr>
            </tbody>
          </table>

          <Hr style={{ borderColor: BRAND.colors.neutral200, margin: '0 0 12px 0' }} />

          {/* Company name */}
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
            <Link href={BRAND.defaults.website} style={{ color: BRAND.colors.textTertiary, textDecoration: 'none' }}>
              HitPay Payment Solutions Pte Ltd
            </Link>
          </Text>

          {/* Unsubscribe */}
          <Text
            style={{
              fontFamily: BRAND.fonts.body,
              fontSize: '10px',
              color: BRAND.colors.neutral400,
              lineHeight: '14px',
              margin: '4px 0 0 0',
              textAlign: 'center' as const,
            }}
          >
            <Link href="{unsubscribe_link}" style={{ color: BRAND.colors.neutral400, textDecoration: 'underline', fontSize: '10px' }}>
              Unsubscribe
            </Link>
          </Text>
        </Column>
      </Row>

      {/* Market cross-sell banner */}
      <Row>
        <Column style={{ padding: '0' }}>
          <Img
            src={bannerSrc}
            alt="HitPay"
            width="600"
            style={{ display: 'block', width: '100%', maxWidth: '600px' }}
          />
        </Column>
      </Row>
    </Section>
  );
}
