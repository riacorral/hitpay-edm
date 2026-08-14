import React from 'react';
import { join } from 'path';
import { Section, Row, Column, Text, Link, Hr, Img } from '@react-email/components'; // Img used for banner + social icons
import { BRAND } from '../../../brand/hitpay.js';

const CDN_LOCAL = join(process.cwd(), 'public', 'brand');
const EMAIL_SIGNATURE = `${CDN_LOCAL}/email-signature.png`;

// No local footer banner assets — kept empty so the banner row is skipped in browser preview
const FOOTER_BANNERS: Record<string, string> = {};

const SOCIAL_ICONS = [
  { name: 'Instagram', href: BRAND.social.links.instagram, src: BRAND.social.icons.instagram },
  { name: 'Facebook',  href: BRAND.social.links.facebook,  src: BRAND.social.icons.facebook  },
  { name: 'LinkedIn',  href: BRAND.social.links.linkedin,  src: BRAND.social.icons.linkedin  },
  { name: 'TikTok',   href: BRAND.social.links.tiktok,    src: BRAND.social.icons.tiktok    },
  { name: 'YouTube',  href: BRAND.social.links.youtube,   src: BRAND.social.icons.youtube   },
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
  const bannerSrc = FOOTER_BANNERS[market];
  return (
    <Section>
      {/* Logo + social icons */}
      <Row>
        <Column style={{ backgroundColor: BRAND.colors.beige, padding: `${BRAND.spacing.lg} ${BRAND.spacing.xl} 16px` }}>
          <table cellPadding={0} cellSpacing={0} style={{ margin: '0 auto' }}>
            <tbody>
              <tr>
                <td style={{ paddingRight: '16px', verticalAlign: 'middle' }}>
                  <Link href={BRAND.defaults.website} style={{ textDecoration: 'none' }}>
                    <Img src={BRAND.logo.dark} alt="HitPay" width={70} style={{ display: 'block' }} />
                  </Link>
                </td>
                {SOCIAL_ICONS.map(s => (
                  <SocialIcon key={s.name} {...s} />
                ))}
              </tr>
            </tbody>
          </table>
        </Column>
      </Row>

      {/* Market cross-sell banner — only shown when a local asset exists */}
      {bannerSrc && (
        <Row>
          <Column style={{ padding: '0', lineHeight: '0', fontSize: '0' }}>
            <Img
              src={bannerSrc}
              alt="HitPay"
              width="600"
              style={{ display: 'block', width: '100%', maxWidth: '600px' }}
            />
          </Column>
        </Row>
      )}

      {/* Email signature */}
      <Row>
        <Column style={{ padding: '0', lineHeight: '0', fontSize: '0' }}>
          <Img
            src={EMAIL_SIGNATURE}
            alt="HitPay products"
            width="600"
            style={{ display: 'block', width: '100%', maxWidth: '600px' }}
          />
        </Column>
      </Row>

      {/* Company name + unsubscribe */}
      <Row>
        <Column style={{ backgroundColor: BRAND.colors.beige, padding: `12px ${BRAND.spacing.xl} ${BRAND.spacing.lg}` }}>
          <Hr style={{ borderColor: BRAND.colors.neutral200, margin: '0 0 12px 0' }} />
          <Text style={{ fontFamily: BRAND.fonts.body, fontSize: '11px', color: BRAND.colors.textTertiary, lineHeight: '16px', margin: '0 0 4px 0', textAlign: 'center' as const }}>
            <Link href={BRAND.defaults.website} style={{ color: BRAND.colors.textTertiary, textDecoration: 'none' }}>
              HitPay Payment Solutions Pte Ltd
            </Link>
          </Text>
          <Text style={{ fontFamily: BRAND.fonts.body, fontSize: '9px', color: BRAND.colors.neutral200, lineHeight: '14px', margin: '4px 0 0 0', textAlign: 'center' as const }}>
            <Link href="{unsubscribe_link}" style={{ color: BRAND.colors.neutral200, textDecoration: 'none', fontSize: '9px' }}>
              Unsubscribe
            </Link>
          </Text>
        </Column>
      </Row>
    </Section>
  );
}
