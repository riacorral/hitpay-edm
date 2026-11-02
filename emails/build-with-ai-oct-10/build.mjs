import mjml2html from '../../node_modules/mjml/lib/index.js';
import fs from 'fs';
const F = "Manrope, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
const L = 'https://luma.com/ax6v7i9c?utm_source=email&amp;utm_medium=email&amp;utm_campaign=build-with-ai-oct-10&amp;utm_content=';
const row = (icon, title, sub) => `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;"><tr>
<td width="48" valign="top" style="width:48px;"><img src="img/icon-${icon}.png" width="40" height="40" alt="" style="display:block;border:0;" /></td>
<td valign="middle" style="font-family:${F};padding-left:4px;"><div style="font-size:15px;font-weight:700;color:#002771;line-height:1.4;">${title}</div>${sub ? `<div style="font-size:13px;color:#61667C;line-height:1.5;">${sub}</div>` : ''}</td></tr></table>`;
const btn = (n, label) => `<table cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#2465DE" style="background-color:#2465DE;border-radius:8px;"><a href="${L}${n}" style="display:inline-block;padding:14px 28px;font-family:${F};font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none;">${label} →</a></td></tr></table>`;
const eyebrow = t => `<div style="font-family:${F};font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#2465DE;margin:0 0 12px 0;">${t}</div>`;
const sec = (pad, inner) => `<mj-section padding="${pad}"><mj-column>${inner}</mj-column></mj-section>`;

const mjml = `<mjml>
  <mj-head>
    <mj-font name="Manrope" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&amp;display=swap" />
    <mj-preview>Hands-on, no coding background needed. Registration is still open.</mj-preview>
    <mj-attributes>
      <mj-all font-family="${F}" />
      <mj-section padding="0" background-color="#FFFFFF" />
      <mj-column padding="0" />
      <mj-text font-family="${F}" padding="0" />
      <mj-image padding="0" />
    </mj-attributes>
    <mj-style>
      a { color: inherit; text-decoration: none; }
      p { margin: 0 !important; }
    </mj-style>
  </mj-head>
  <mj-body background-color="#F0F2F5" width="600px">
  <mj-section padding="24px 0 0" background-color="#F0F2F5"><mj-column /></mj-section>
  ${sec('32px 32px 20px', '<mj-image src="img/inline-1.png" alt="HitPay" width="110px" align="left" />')}
  ${sec('0 32px', `<mj-image src="img/hero.jpg" alt="Build with AI: Hands-On Coding Workshop for SMEs" href="${L}1-hero" border-radius="12px" fluid-on-mobile="true" />`)}
  ${sec('28px 32px 8px', `<mj-raw>${eyebrow("You're invited · This Saturday")}</mj-raw><mj-text font-size="28px" font-weight="800" color="#002771" line-height="1.25">Build your own business software in one day.</mj-text>`)}
  ${sec('8px 32px 24px', '<mj-text font-size="15px" color="#61667C" line-height="1.65">Hi {firstName},<br/><br/>Build with AI is back on 10 October. Use Claude as your coding co-pilot to turn a real business bottleneck into a working prototype. No coding background needed, and registration is still open.</mj-text>')}
  ${sec('0 32px 28px', `<mj-raw><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F5F7FC;border-radius:12px;border-collapse:separate;"><tr><td style="padding:22px 22px 8px 22px;">${row('calendar', 'Saturday, 10 October 2026')}${row('clock', '10am to 5pm SGT')}${row('pin', 'In person, Singapore', 'Venue details on Luma')}</td></tr></table></mj-raw>`)}
  ${sec('0 32px 36px', `<mj-raw>${btn('2-register-for-a-spot', 'Register for a spot')}</mj-raw>`)}
  ${sec('0 32px 8px', `<mj-raw>${eyebrow('What you will do')}</mj-raw>`)}
  ${sec('0 32px 28px', `<mj-raw>${row('tools', 'Build with an AI co-pilot', 'Use Claude to create functional software without a technical background')}${row('clock', 'Automate a real process', 'Pick one bottleneck in your business and fix it')}${row('people', 'Walk out with a prototype', 'Something you can actually use, built in a small, hands-on cohort')}</mj-raw>`)}
  ${sec('0 32px 8px', `<mj-raw>${eyebrow('Before you come')}</mj-raw>`)}
  ${sec('0 32px 28px', '<mj-text font-size="15px" color="#61667C" line-height="1.65">Bring a laptop and a paid Claude Pro plan (Anthropic), approx. SGD $25/month. Spots are limited and registration is subject to approval. Approved registrations will receive a confirmation email with full event details.</mj-text>')}
  ${sec('0 32px 36px', `<mj-raw>${btn('3-i-want-in', 'I want in')}</mj-raw>`)}
  ${sec('0 32px 16px', '<mj-text font-size="14px" color="#61667C" line-height="1.6">Questions? Reply to this email and we will help you out.</mj-text>')}
  ${sec('0 32px 32px', '<mj-text font-size="14px" color="#61667C" line-height="1.6"><b style="color:#03102F;">The HitPay Team</b></mj-text>')}
  <mj-section background-color="#F9F9F6" padding="24px 32px 16px">
    <mj-column>
      <mj-text align="center" padding="0">
        <a href="https://www.hitpayapp.com" style="display:inline-block;vertical-align:middle;margin-right:14px;"><img src="img/logogram.png" width="24" height="24" alt="HitPay" style="display:inline-block;border-radius:50%;vertical-align:middle;" /></a><a href="https://www.instagram.com/hitpayapp" style="display:inline-block;vertical-align:middle;margin:0 3px;"><img src="img/inline-2.png" width="24" height="24" alt="Instagram" style="display:inline-block;border-radius:50%;vertical-align:middle;" /></a><a href="https://www.facebook.com/hitpayapp" style="display:inline-block;vertical-align:middle;margin:0 3px;"><img src="img/inline-3.png" width="24" height="24" alt="Facebook" style="display:inline-block;border-radius:50%;vertical-align:middle;" /></a><a href="https://www.linkedin.com/company/hit-pay/" style="display:inline-block;vertical-align:middle;margin:0 3px;"><img src="img/inline-4.png" width="24" height="24" alt="LinkedIn" style="display:inline-block;border-radius:50%;vertical-align:middle;" /></a><a href="https://www.tiktok.com/@hitpayapp" style="display:inline-block;vertical-align:middle;margin:0 3px;"><img src="img/inline-5.png" width="24" height="24" alt="TikTok" style="display:inline-block;border-radius:50%;vertical-align:middle;" /></a><a href="https://www.youtube.com/@hitpayapp" style="display:inline-block;vertical-align:middle;margin:0 3px;"><img src="img/inline-6.png" width="24" height="24" alt="YouTube" style="display:inline-block;border-radius:50%;vertical-align:middle;" /></a>
      </mj-text>
    </mj-column>
  </mj-section>
  <mj-section background-color="#F9F9F6" padding="0"><mj-column padding="0"><mj-image src="img/inline-7.png" alt="HitPay products" width="600px" padding="0" /></mj-column></mj-section>
  <mj-section background-color="#F9F9F6" padding="12px 32px 24px">
    <mj-column>
      <mj-divider border-color="#D4D9E0" border-width="1px" padding="0 0 12px" />
      <mj-text align="center" font-size="11px" color="#9295A5" line-height="16px" padding="0 0 4px">HitPay Payment Solutions Pte Ltd</mj-text>
      <mj-text align="center" font-size="9px" color="#D4D9E0" line-height="14px" padding="0"><a href="{unsubscribe_link}" style="color:#D4D9E0;text-decoration:none;font-size:9px;">Unsubscribe</a></mj-text>
    </mj-column>
  </mj-section>
  </mj-body>
</mjml>`;
fs.writeFileSync('index.mjml', mjml);
const { html, errors } = mjml2html(mjml, { validationLevel: 'soft' });
if (errors.length) console.log(errors.map(e => e.formattedMessage));
fs.writeFileSync('index.html', html);
console.log('built');
