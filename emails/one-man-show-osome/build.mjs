import mjml2html from 'mjml';
import fs from 'fs';
const F = "Manrope, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
const L = 'https://luma.com/1a5w49x9?utm_source=email&amp;utm_medium=email&amp;utm_campaign=one-man-show-osome&amp;utm_content=';
const row = (icon, title, sub) => `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;"><tr>
<td width="48" valign="top" style="width:48px;"><img src="img/icon-${icon}.png" width="40" height="40" alt="" style="display:block;border:0;" /></td>
<td valign="middle" style="font-family:${F};padding-left:4px;"><div style="font-size:15px;font-weight:700;color:#002771;line-height:1.4;">${title}</div>${sub ? `<div style="font-size:13px;color:#61667C;line-height:1.5;">${sub}</div>` : ''}</td></tr></table>`;
const btn = (n, label) => `<table cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#2465DE" style="background-color:#2465DE;border-radius:8px;"><a href="${L}${n}" style="display:inline-block;padding:14px 28px;font-family:${F};font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none;">${label} →</a></td></tr></table>`;
const eyebrow = t => `<div style="font-family:${F};font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#2465DE;margin:0 0 12px 0;">${t}</div>`;
const bio = (name, role, co) => `<td class="bio" valign="top" width="48%" style="width:48%;padding:16px;background-color:#F5F7FC;border-radius:12px;font-family:${F};"><div style="font-size:15px;font-weight:700;color:#002771;line-height:1.3;">${name}</div><div style="font-size:12px;color:#61667C;line-height:1.5;margin-top:2px;">${role}</div><div style="font-size:12px;font-weight:700;color:#2465DE;margin-top:6px;">${co}</div></td>`;

const mjml = `<mjml>
  <mj-head>
    <mj-font name="Manrope" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&amp;display=swap" />
    <mj-preview>Hear from two founders who built their businesses on their own, then swap notes over drinks</mj-preview>
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
      @media only screen and (max-width:480px) {
        td.bio { display: block !important; width: 100% !important; margin-bottom: 8px !important; }
        td.bio-gap { display: none !important; }
      }
    </mj-style>
  </mj-head>
  <mj-body background-color="#F0F2F5" width="600px">
  <mj-section padding="24px 0 0" background-color="#F0F2F5"><mj-column /></mj-section>
  <mj-section padding="32px 32px 20px">
    <mj-column>
      <mj-image src="img/inline-1.png" alt="HitPay" width="110px" align="left" />
    </mj-column>
  </mj-section>
  <mj-section padding="0 32px">
    <mj-column>
      <mj-image src="img/hero.png" alt="HitPay x Osome: Running a One-Man Show, with Elizabeth Loh and Uma Rudd" href="${L}1-hero" border-radius="12px" fluid-on-mobile="true" />
    </mj-column>
  </mj-section>
  <mj-section padding="28px 32px 8px">
    <mj-column>
      <mj-raw>${eyebrow("You're invited · This Wednesday")}</mj-raw>
      <mj-text font-size="28px" font-weight="800" color="#002771" line-height="1.25">Running the whole business yourself? Come swap notes.</mj-text>
    </mj-column>
  </mj-section>
  <mj-section padding="8px 32px 24px">
    <mj-column>
      <mj-text font-size="15px" color="#61667C" line-height="1.65">Hi {firstName},<br/><br/>HitPay and Osome are hosting a casual panel with two founders who built their own businesses from the ground up. Hear how they handle payments, cash flow and admin, then stay for Q&amp;A, drinks and snacks.</mj-text>
    </mj-column>
  </mj-section>
  <mj-section padding="0 32px 28px">
    <mj-column>
      <mj-raw><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F5F7FC;border-radius:12px;border-collapse:separate;"><tr><td style="padding:22px 22px 8px 22px;">
${row('calendar', 'Wednesday, 7 October 2026', '')}${row('clock', '4–6pm SGT', '')}${row('pin', 'The Overlap, The Working Capitol', '1 Keong Saik Road, Singapore 089109')}
</td></tr></table></mj-raw>
    </mj-column>
  </mj-section>
  <mj-section padding="0 32px 36px">
    <mj-column>
      <mj-raw>${btn('2-save-my-spot', 'Save my spot')}</mj-raw>
    </mj-column>
  </mj-section>
  <mj-section padding="0 32px 8px">
    <mj-column>
      <mj-raw>${eyebrow("What to expect")}</mj-raw>
    </mj-column>
  </mj-section>
  <mj-section padding="0 32px 28px">
    <mj-column>
      <mj-raw>${row('wallet', 'Practical ideas', 'Managing payments, cash flow and admin when you are the whole team')}${row('tools', 'Tools and habits', 'Ways to spend less time on paperwork')}${row('chat', 'Open Q&amp;A', 'Ask the speakers anything')}${row('people', 'New connections', 'Meet other business owners in Singapore over drinks and snacks')}</mj-raw>
    </mj-column>
  </mj-section>
  <mj-section padding="0 32px 8px">
    <mj-column>
      <mj-raw>${eyebrow("Meet the speakers")}</mj-raw>
    </mj-column>
  </mj-section>
  <mj-section padding="0 32px 32px">
    <mj-column>
      <mj-raw><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;"><tr>
${bio('Elizabeth Loh', 'Founder &amp; Managing Director', 'Grow Connections')}<td class="bio-gap" width="4%" style="width:4%;font-size:0;line-height:0;">&nbsp;</td>${bio('Uma Rudd', 'Co-Founder &amp; Chief Marketing Officer', 'Oh My Strawberry')}
</tr></table></mj-raw>
    </mj-column>
  </mj-section>
  <mj-section padding="0 32px 32px">
    <mj-column>
      <mj-text font-size="12px" color="#9295A5" line-height="1.5" align="left">Official venue partner: The Working Capitol</mj-text>
    </mj-column>
  </mj-section>
  <mj-section padding="0 32px 16px">
    <mj-column><mj-text font-size="14px" color="#61667C" line-height="1.6">Questions? Reply to this email and we will help you out.</mj-text></mj-column>
  </mj-section>
  <mj-section padding="0 32px 32px">
    <mj-column><mj-text font-size="14px" color="#61667C" line-height="1.6"><b style="color:#03102F;">The HitPay Team</b></mj-text></mj-column>
  </mj-section>
  <mj-section background-color="#F9F9F6" padding="24px 32px 16px">
    <mj-column>
      <mj-text align="center" padding="0">
        <a href="https://www.hitpayapp.com" style="display:inline-block;vertical-align:middle;margin-right:14px;"><img src="img/logogram.png" width="24" height="24" alt="HitPay" style="display:inline-block;border-radius:50%;vertical-align:middle;" /></a><a href="https://www.instagram.com/hitpayapp" style="display:inline-block;vertical-align:middle;margin:0 3px;"><img src="img/inline-2.png" width="24" height="24" alt="Instagram" style="display:inline-block;border-radius:50%;vertical-align:middle;" /></a><a href="https://www.facebook.com/hitpayapp" style="display:inline-block;vertical-align:middle;margin:0 3px;"><img src="img/inline-3.png" width="24" height="24" alt="Facebook" style="display:inline-block;border-radius:50%;vertical-align:middle;" /></a><a href="https://www.linkedin.com/company/hit-pay/" style="display:inline-block;vertical-align:middle;margin:0 3px;"><img src="img/inline-4.png" width="24" height="24" alt="LinkedIn" style="display:inline-block;border-radius:50%;vertical-align:middle;" /></a><a href="https://www.tiktok.com/@hitpayapp" style="display:inline-block;vertical-align:middle;margin:0 3px;"><img src="img/inline-5.png" width="24" height="24" alt="TikTok" style="display:inline-block;border-radius:50%;vertical-align:middle;" /></a><a href="https://www.youtube.com/@hitpayapp" style="display:inline-block;vertical-align:middle;margin:0 3px;"><img src="img/inline-6.png" width="24" height="24" alt="YouTube" style="display:inline-block;border-radius:50%;vertical-align:middle;" /></a>
      </mj-text>
    </mj-column>
  </mj-section>
  <mj-section background-color="#F9F9F6" padding="0">
    <mj-column padding="0"><mj-image src="img/inline-7.png" alt="HitPay products" width="600px" padding="0" /></mj-column>
  </mj-section>
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
