import type { ParsedEdm, EdmSection } from '../schema/edm.js';

const CDN = 'https://azjzrc77u6pvsjpm.public.blob.vercel-storage.com/hitpay-edm';
const BRAND_CDN = 'https://azjzrc77u6pvsjpm.public.blob.vercel-storage.com/brand';

const B = {
  deepBlue: '#002771',
  actionBlue: '#2465DE',
  white: '#FFFFFF',
  beige: '#F9F9F6',
  neutral100: '#F0F2F5',
  neutral200: '#D4D9E0',
  textPrimary: '#03102F',
  textSecondary: '#61667C',
  textTertiary: '#9295A5',
  paleBlue: '#F5F7FC',
  font: "Manrope, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
};

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inlineMd(text: string): string {
  return esc(text)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, linkText, url) =>
      `<a href="${url}" style="color:${B.actionBlue};text-decoration:underline;">${linkText}</a>`)
    .replace(/\*\*(.+?)\*\*/g, `<b style="color:${B.textPrimary};">$1</b>`);
}

function bulletItemsTable(items: { title: string; body: string }[]): string {
  return items
    .map(
      (item, i, arr) => `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:${i === arr.length - 1 ? '0' : '20px'};">
  <tr>
    <td width="24" valign="top" style="font-family:${B.font};font-size:16px;font-weight:700;color:${B.actionBlue};line-height:1.4;padding:0;white-space:nowrap;">•</td>
    <td valign="top" style="font-family:${B.font};padding:0 0 0 4px;">
      <p style="font-family:${B.font};font-size:16px;font-weight:700;color:${B.textPrimary};line-height:1.4;margin:0 0 4px 0;">${esc(item.title)}</p>
      <p style="font-family:${B.font};font-size:14px;font-weight:400;color:${B.textSecondary};line-height:1.6;margin:0;">${esc(item.body)}</p>
    </td>
  </tr>
</table>`,
    )
    .join('');
}

function sectionToMjml(section: EdmSection): string {
  switch (section.type) {
    case 'heading':
      return `
  <mj-section padding="0">
    <mj-column padding="${section.level <= 2 ? '0 32px 16px' : '16px 32px 24px'}">
      <mj-text font-size="${section.level <= 2 ? '24px' : '16px'}" font-weight="700" color="${B.deepBlue}" line-height="1.3" padding="0">${esc(section.text)}</mj-text>
    </mj-column>
  </mj-section>`;

    case 'paragraph': {
      const isCentered = section.text.endsWith('{.center}');
      const paraText = isCentered ? section.text.slice(0, -'{.center}'.length).trim() : section.text;
      return `
  <mj-section padding="0">
    <mj-column padding="0 32px 16px">
      <mj-text font-size="14px" color="${B.textSecondary}" line-height="1.6" padding="0"${isCentered ? ' align="center"' : ''}>${inlineMd(paraText)}</mj-text>
    </mj-column>
  </mj-section>`;
    }

    case 'bullets':
      return `
  <mj-section padding="0">
    <mj-column padding="0 32px 16px">
      ${section.items.map(item => `<mj-text font-size="14px" color="${B.textSecondary}" line-height="1.6" padding="0 0 8px 0">• ${inlineMd(item)}</mj-text>`).join('\n      ')}
    </mj-column>
  </mj-section>`;

    case 'bullet_list':
      return `
  <mj-section padding="0">
    <mj-column padding="0 32px 16px">
      <mj-raw>${bulletItemsTable(section.items)}</mj-raw>
    </mj-column>
  </mj-section>`;

    case 'blockquote':
      return `
  <mj-section padding="0 32px 16px">
    <mj-column border-left="4px solid ${B.actionBlue}" background-color="${B.paleBlue}" border-radius="0 8px 8px 0" padding="16px">
      <mj-text font-size="14px" font-style="italic" color="${B.textSecondary}" line-height="1.6" padding="0">${esc(section.text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '$1'))}</mj-text>
      ${section.attribution ? `<mj-text font-size="14px" color="${B.textSecondary}" padding="8px 0 0">— ${esc(section.attribution)}</mj-text>` : ''}
    </mj-column>
  </mj-section>`;

    case 'cta':
      return `
  <mj-section padding="16px 32px 24px">
    <mj-column>
      <mj-button href="${esc(section.url)}" background-color="${B.actionBlue}" color="${B.white}" border-radius="6px" font-size="16px" font-weight="600" inner-padding="12px 24px" align="center">${esc(section.text)}</mj-button>
    </mj-column>
  </mj-section>`;

    case 'divider':
      return `
  <mj-section padding="0 32px 24px">
    <mj-column>
      <mj-divider border-color="${B.neutral200}" border-width="1px" padding="8px 0 0" />
    </mj-column>
  </mj-section>`;

    case 'image':
      return `
  <mj-section padding="0 32px 16px">
    <mj-column>
      <mj-image src="${esc(section.src)}" alt="${esc(section.alt || '')}" border-radius="8px" padding="0"${section.width ? ` width="${section.width}px" align="center"` : ''} />
    </mj-column>
  </mj-section>`;

    case 'metric':
      return `
  <mj-section padding="0 32px 16px">
    <mj-column>
      ${section.items
        .map(
          item => `
      <mj-text align="center" font-size="36px" font-weight="700" color="${B.actionBlue}" line-height="1.2" padding="0 0 4px">${esc(item.value)}</mj-text>
      <mj-text align="center" font-size="14px" color="${B.textSecondary}" padding="0 0 16px">${esc(item.label)}</mj-text>`,
        )
        .join('')}
    </mj-column>
  </mj-section>`;

    case 'image_text': {
      const imgCol = `
    <mj-column width="42%" vertical-align="middle" padding="0 16px 0 0">
      <mj-image src="${esc(section.src)}" alt="${esc(section.alt || '')}" border-radius="8px" padding="0" />
    </mj-column>`;

      const textColContent =
        section.items && section.items.length > 0
          ? `<mj-raw>${bulletItemsTable(section.items)}</mj-raw>`
          : `<mj-text font-size="14px" color="${B.textSecondary}" line-height="1.6" padding="0">${inlineMd(section.text || '')}</mj-text>`;

      const headingContent = section.heading
        ? `<mj-text font-size="16px" font-weight="700" color="${B.textPrimary}" line-height="1.3" padding="0 0 12px">${esc(section.heading)}</mj-text>\n      `
        : '';

      const textCol = `
    <mj-column width="58%" vertical-align="top" padding="0">
      ${headingContent}${textColContent}
    </mj-column>`;

      return `
  <mj-section padding="8px 32px 24px">
    ${section.imagePosition === 'left' ? imgCol + textCol : textCol + imgCol}
  </mj-section>`;
    }

    case 'image_row': {
      const colWidth = `${Math.floor(100 / section.images.length)}%`;
      const cols = section.images
        .map(
          (img, i) =>
            `\n    <mj-column width="${colWidth}" padding="0">\n      <mj-image src="${esc(img.src)}" alt="${esc(img.alt || '')}" border-radius="0" padding="0" />\n    </mj-column>`,
        )
        .join('');
      return `\n  <mj-section padding="0 0 16px">${cols}\n  </mj-section>`;
    }

    case 'feature_card': {
      const paragraphsHtml = section.paragraphs
        .map(p => `\n      <mj-text font-size="14px" color="${B.textSecondary}" line-height="1.6" padding="0 0 10px">${inlineMd(p)}</mj-text>`)
        .join('');

      const youGetHtml = section.youGet.length > 0
        ? `\n      <mj-text font-size="16px" font-weight="600" color="${B.textPrimary}" line-height="1.5" padding="10px 0 6px">You get:</mj-text>\n      ${section.youGet.map(item => `<mj-text font-size="14px" color="${B.textSecondary}" line-height="1.5" padding="0 0 4px">• ${esc(item)}</mj-text>`).join('\n      ')}`
        : '';

      const closingHtml = section.closingText
        ? `\n      <mj-text font-size="14px" color="${B.textSecondary}" line-height="1.6" padding="10px 0 16px">${inlineMd(section.closingText)}</mj-text>`
        : '\n      <mj-text padding="8px 0 0"> </mj-text>';

      const textCol = `
    <mj-column width="62%" vertical-align="top" padding="0 20px 0 0">
      <mj-text font-size="16px" font-weight="700" color="${B.textPrimary}" line-height="1.3" padding="0 0 12px">${esc(section.heading)}</mj-text>${paragraphsHtml}${youGetHtml}${closingHtml}
      <mj-text font-size="16px" font-weight="600" color="${B.actionBlue}" padding="0"><a href="${esc(section.ctaUrl)}" style="color:${B.actionBlue};text-decoration:underline;">${esc(section.ctaText)}</a></mj-text>
    </mj-column>`;

      const imageCol = `
    <mj-column width="38%" vertical-align="middle" padding="0">
      <mj-raw><div style="background-color:${B.paleBlue};border-radius:12px;padding:12px;overflow:hidden;"><img src="${esc(section.src)}" alt="${esc(section.alt || '')}" style="width:100%;border-radius:8px;display:block;height:auto;" /></div></mj-raw>
    </mj-column>`;

      return `
  <mj-section padding="0 32px 40px">
    ${section.imagePosition === 'left' ? imageCol + textCol : textCol + imageCol}
  </mj-section>`;
    }

    default:
      return '';
  }
}

export function generateMjml(edm: ParsedEdm): string {
  const fm = edm.frontmatter;

  const preview = fm.previewText ? `\n    <mj-preview>${esc(fm.previewText)}</mj-preview>` : '';

  const hitpayWhiteLogo = 'https://azjzrc77u6pvsjpm.public.blob.vercel-storage.com/brand/logo-white.png';

  let heroSection = '';
  let cobrandFooterSection = '';
  let testimonialBottomMjml = '';
  let secondaryCtaMjml = '';
  if (fm.template === 'product-launch') {
    heroSection = `
  <mj-section background-color="${B.deepBlue}" padding="48px 32px 0">
    <mj-column>
      <mj-text align="center" font-size="11px" font-weight="600" color="${B.neutral200}" letter-spacing="1.5px" text-transform="uppercase" padding="0 0 8px">Product Announcement</mj-text>
      <mj-text align="center" font-size="28px" font-weight="700" color="${B.white}" line-height="1.2" padding="0 0 16px">${esc(fm.productName)}</mj-text>
      ${fm.heroImage ? `<mj-image src="${esc(fm.heroImage)}" alt="${esc(fm.productName)}" border-radius="8px 8px 0 0" padding="0" />` : ''}
    </mj-column>
  </mj-section>`;
  }

  if (fm.template === 'newsletter') {
    const hitpayDarkLogo = 'https://azjzrc77u6pvsjpm.public.blob.vercel-storage.com/brand/logo-dark.png';
    heroSection = `
  <mj-section background-color="${B.white}" padding="16px 32px">
    <mj-column>
      <mj-image src="${hitpayDarkLogo}" alt="HitPay" width="120" align="left" padding="0" />
    </mj-column>
  </mj-section>
  <mj-section background-color="${B.deepBlue}" padding="16px 32px">
    <mj-column>
      <mj-text font-size="24px" font-weight="700" color="${B.white}" line-height="1.3" padding="0">${esc(fm.title ?? fm.subject)}${fm.issueNumber ? ` #${fm.issueNumber}` : ''}</mj-text>
      ${(fm.subtitle ?? fm.date) ? `<mj-text font-size="12px" color="${B.neutral200}" padding="4px 0 0">${esc(fm.subtitle ?? fm.date)}</mj-text>` : ''}
    </mj-column>
  </mj-section>`;
  }

  if (fm.template === 'event-invitation') {
    cobrandFooterSection = fm.partnerLogo ? `
  <mj-section background-color="${B.white}" padding="24px 32px">
    <mj-column>
      <mj-text align="center" font-size="10px" font-weight="600" color="${B.textTertiary}" letter-spacing="1.2px" text-transform="uppercase" padding="0 0 8px">Official Venue Partner</mj-text>
      <mj-image src="${esc(fm.partnerLogo)}" alt="${esc(fm.partnerName || 'Partner')}" width="80px" align="center" padding="0" />
    </mj-column>
  </mj-section>` : '';

    const heroImageMjml = fm.heroImage
      ? `<mj-image src="${esc(fm.heroImage)}" alt="Workshop" padding="0" fluid-on-mobile="true" />`
      : '';

    const subtitleMjml = fm.eventSubtitle
      ? `<mj-text align="center" font-size="28px" font-weight="700" color="${B.white}" line-height="1.2" padding="0">${esc(fm.eventSubtitle)}</mj-text>`
      : '';

    const locationMjml = fm.eventLocation
      ? `<mj-text font-size="14px" color="${B.textSecondary}" padding="0">${esc(fm.eventLocation)}</mj-text>`
      : '';

    const primaryCtaMjml = fm.primaryCtaText && fm.primaryCtaUrl
      ? `
  <mj-section background-color="${B.white}" padding="24px 32px">
    <mj-column>
      <mj-button href="${esc(fm.primaryCtaUrl)}" background-color="${B.actionBlue}" color="${B.white}" border-radius="6px" font-size="16px" font-weight="600" inner-padding="14px 28px" align="center">${esc(fm.primaryCtaText)}</mj-button>
    </mj-column>
  </mj-section>`
      : '';

    secondaryCtaMjml = fm.secondaryCtaText && fm.secondaryCtaUrl
      ? `
  <mj-section background-color="${B.white}" padding="24px 32px 24px">
    <mj-column>
      <mj-button href="${esc(fm.secondaryCtaUrl)}" background-color="${B.actionBlue}" color="${B.white}" border-radius="6px" font-size="16px" font-weight="600" inner-padding="14px 28px" align="center">${esc(fm.secondaryCtaText)}</mj-button>
    </mj-column>
  </mj-section>`
      : '';

    testimonialBottomMjml = fm.testimonialBottomImage
      ? `\n  <mj-section padding="0">\n    <mj-column>\n      <mj-image src="${esc(fm.testimonialBottomImage)}" alt="What attendees said" padding="0" fluid-on-mobile="true" />\n    </mj-column>\n  </mj-section>`
      : '';

    // Split body sections same as the React template
    const firstDivIdx = edm.sections.findIndex(s => s.type === 'divider');
    const introSects = firstDivIdx >= 0 ? edm.sections.slice(0, firstDivIdx) : edm.sections;
    const afterIntroSects = firstDivIdx >= 0 ? edm.sections.slice(firstDivIdx) : [];
    const firstBqIdx = afterIntroSects.findIndex(s => s.type === 'blockquote');
    const mainSectsRaw = firstBqIdx >= 0 ? afterIntroSects.slice(0, firstBqIdx) : afterIntroSects;
    const firstNonDivMjml = mainSectsRaw.findIndex(s => s.type !== 'divider');
    const trimmedStartMjml = firstNonDivMjml >= 0 ? mainSectsRaw.slice(firstNonDivMjml) : mainSectsRaw;
    const lastNonDivMjml = [...trimmedStartMjml].reverse().findIndex(s => s.type !== 'divider');
    const mainSects = lastNonDivMjml >= 0
      ? trimmedStartMjml.slice(0, trimmedStartMjml.length - lastNonDivMjml)
      : trimmedStartMjml;
    const closingSects = firstBqIdx >= 0 ? afterIntroSects.slice(firstBqIdx) : [];

    const introMjml = introSects.map(sectionToMjml).join('');
    const mainMjml = mainSects.map(sectionToMjml).join('');
    const closingMjml = closingSects.map(sectionToMjml).join('');

    heroSection = `
  <mj-section background-color="${B.deepBlue}" padding="48px 32px 0">
    <mj-column>
      <mj-image src="${hitpayWhiteLogo}" alt="HitPay" width="100px" align="center" padding="0" />
    </mj-column>
  </mj-section>
  <mj-section background-color="${B.deepBlue}" padding="0 32px 48px">
    <mj-column>
      ${fm.eyebrowText ? `<mj-text align="center" font-size="11px" font-weight="600" color="${B.neutral200}" letter-spacing="1.5px" text-transform="uppercase" padding="0 0 16px">${esc(fm.eyebrowText)}</mj-text>` : ''}
      ${fm.eventName ? `<mj-text align="center" font-size="28px" font-weight="700" color="${B.white}" line-height="1.2" padding="0">${esc(fm.eventName)}</mj-text>` : ''}
      ${subtitleMjml}
    </mj-column>
  </mj-section>
  ${heroImageMjml ? `<mj-section background-color="${B.white}" padding="0">
    <mj-column>
      ${heroImageMjml}
    </mj-column>
  </mj-section>` : ''}
  <mj-section padding="24px 0 0" background-color="${B.white}"><mj-column />${introMjml}</mj-section>
  ${fm.eventDate ? `<mj-section background-color="${B.white}" padding="0 32px">
    <mj-column border-top="1px solid #D4D9E0" border-bottom="1px solid #D4D9E0" padding="24px 0">
      <mj-text align="center" font-size="16px" font-weight="700" color="${B.deepBlue}" padding="0 0 4px">${esc(fm.eventDate)}${fm.eventTime ? ` · ${esc(fm.eventTime)}` : ''}</mj-text>
      ${fm.eventLocation ? `<mj-text align="center" font-size="14px" color="${B.textSecondary}" padding="0">${esc(fm.eventLocation)}</mj-text>` : ''}
    </mj-column>
  </mj-section>` : ''}
  ${fm.testimonialTopImage ? `<mj-section padding="0">\n    <mj-column>\n      <mj-image src="${esc(fm.testimonialTopImage)}" alt="What attendees said" padding="0" fluid-on-mobile="true" />\n    </mj-column>\n  </mj-section>` : ''}${primaryCtaMjml}
  ${mainMjml}
  ${testimonialBottomMjml}${secondaryCtaMjml}
  ${closingMjml}`;
  }

  // Default blue header for templates that don't define their own heroSection
  if (!heroSection) {
    heroSection = `
  <mj-section background-color="${B.deepBlue}" padding="24px 32px">
    <mj-column>
      <mj-image src="${hitpayWhiteLogo}" alt="HitPay" width="120px" align="left" padding="0" />
    </mj-column>
  </mj-section>`;
  }

  const bodyMjml = edm.sections.map(sectionToMjml).join('');

  const versionBadgeMjml = fm.template === 'feature-update' && fm.versionBadge
    ? `
  <mj-section padding="32px 32px 16px" background-color="${B.white}">
    <mj-column>
      <mj-raw>
        <table cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="background-color:${B.actionBlue};border-radius:12px;padding:4px 12px;font-family:${B.font};font-size:14px;font-weight:600;color:${B.white};">${esc(fm.versionBadge)}</td>
        </tr></table>
      </mj-raw>
    </mj-column>
  </mj-section>`
    : '';

  let ctaSection = '';
  if (fm.template === 'product-launch') {
    if (fm.secondaryCtaText && fm.secondaryCtaUrl) {
      ctaSection = `
  <mj-section padding="0 32px 48px">
    <mj-column width="50%" vertical-align="middle" padding="0 16px 0 0">
      <mj-text align="right" padding="0"><a href="${esc(fm.secondaryCtaUrl)}" style="font-family:${B.font};font-size:14px;color:${B.actionBlue};text-decoration:underline;">${esc(fm.secondaryCtaText)}</a></mj-text>
    </mj-column>
    <mj-column width="50%" vertical-align="middle" padding="0">
      <mj-button href="${esc(fm.ctaUrl)}" background-color="${B.actionBlue}" color="${B.white}" border-radius="6px" font-size="16px" font-weight="600" inner-padding="14px 28px" align="left">${esc(fm.ctaText)}</mj-button>
    </mj-column>
  </mj-section>`;
    } else {
      ctaSection = `
  <mj-section padding="0 32px 48px">
    <mj-column>
      <mj-button href="${esc(fm.ctaUrl)}" background-color="${B.actionBlue}" color="${B.white}" border-radius="6px" font-size="16px" font-weight="600" inner-padding="14px 28px" align="center">${esc(fm.ctaText)}</mj-button>
    </mj-column>
  </mj-section>`;
    }
  }

  return `<mjml>
  <mj-head>
    <mj-font name="Manrope" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&display=swap" />${preview}
    <mj-attributes>
      <mj-all font-family="${B.font}" />
      <mj-section padding="0" background-color="${B.white}" />
      <mj-column padding="0" />
      <mj-text font-family="${B.font}" padding="0" />
      <mj-image padding="0" />
    </mj-attributes>
    <mj-style>
      a { color: inherit; text-decoration: none; }
      p { margin: 0 !important; }
    </mj-style>
  </mj-head>
  <mj-body background-color="${B.neutral100}" width="600px">
    ${heroSection}
    ${fm.template !== 'event-invitation' ? `${versionBadgeMjml || `<mj-section padding="32px 0 0" background-color="${B.white}"><mj-column /></mj-section>`}\n    ${bodyMjml}\n    ${testimonialBottomMjml}${secondaryCtaMjml}` : ''}
    ${ctaSection}
  ${cobrandFooterSection}
  <!-- Footer -->
  <mj-section background-color="${B.beige}" padding="24px 32px 16px">
    <mj-column>
      <!-- Social icons row -->
      <mj-table padding="0">
        <tr>
          <td align="center">
            <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
              <tr>
                <td style="vertical-align:middle;padding:0 5px;">
                  <a href="https://www.instagram.com/hitpayapp"><img src="${CDN}/social-instagram.png" width="24" height="24" alt="Instagram" style="display:block;border-radius:50%;" /></a>
                </td>
                <td style="vertical-align:middle;padding:0 5px;">
                  <a href="https://www.facebook.com/hitpayapp"><img src="${CDN}/social-facebook.png" width="24" height="24" alt="Facebook" style="display:block;border-radius:50%;" /></a>
                </td>
                <td style="vertical-align:middle;padding:0 5px;">
                  <a href="https://www.linkedin.com/company/hit-pay/"><img src="${CDN}/social-linkedin.png" width="24" height="24" alt="LinkedIn" style="display:block;border-radius:50%;" /></a>
                </td>
                <td style="vertical-align:middle;padding:0 5px;">
                  <a href="https://www.tiktok.com/@hitpayapp"><img src="${CDN}/social-tiktok.png" width="24" height="24" alt="TikTok" style="display:block;border-radius:50%;" /></a>
                </td>
                <td style="vertical-align:middle;padding:0 5px;">
                  <a href="https://www.youtube.com/@hitpayapp"><img src="${CDN}/social-youtube.png" width="24" height="24" alt="YouTube" style="display:block;border-radius:50%;" /></a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </mj-table>
    </mj-column>
  </mj-section>
  <!-- Footer banner -->
  <mj-section padding="0">
    <mj-column padding="0">
      <mj-image src="${BRAND_CDN}/footer-banner-${fm.market ?? 'sg'}.png" alt="HitPay" width="600px" padding="0" />
    </mj-column>
  </mj-section>
  <!-- Footer text -->
  <mj-section background-color="${B.beige}" padding="12px 32px 24px">
    <mj-column>
      <mj-divider border-color="${B.neutral200}" border-width="1px" padding="0 0 12px" />
      <mj-text align="center" font-size="11px" color="${B.textTertiary}" line-height="16px" padding="0 0 4px">HitPay Payment Solutions Pte Ltd</mj-text>
      <mj-text align="center" font-size="9px" color="${B.neutral200}" line-height="14px" padding="0"><a href="{unsubscribe_link}" style="color:${B.neutral200};text-decoration:none;font-size:9px;">Unsubscribe</a></mj-text>
    </mj-column>
  </mj-section>
  </mj-body>
</mjml>`;
}
