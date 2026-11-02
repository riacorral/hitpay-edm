import type { EdmSection } from '../schema/edm.js';

/**
 * Raw-table HTML for the `event` and `agenda` blocks. Shared by the React
 * Email renderer (dangerouslySetInnerHTML) and the MJML renderer (mj-raw) so
 * both outputs stay identical. Each event renders as a bordered card so a
 * multi-event email reads as clear, separate buckets.
 */

type EventSection = Extract<EdmSection, { type: 'event' }>;
type AgendaSection = Extract<EdmSection, { type: 'agenda' }>;

const C = {
  deepBlue: '#002771',
  actionBlue: '#2465DE',
  white: '#FFFFFF',
  border: '#D4D9E0',
  paleBlue: '#F5F7FC',
  lightBlue: '#EBF0FA',
  textPrimary: '#03102F',
  textSecondary: '#61667C',
  font: "Hauora, Manrope, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
};

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function inlineMd(text: string): string {
  return esc(text)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, url) =>
      `<a href="${url}" style="color:${C.actionBlue};text-decoration:underline;">${t}</a>`)
    .replace(/\*\*(.+?)\*\*/g, `<b style="color:${C.textPrimary};">$1</b>`);
}

function label(text: string): string {
  return `<div style="font-family:${C.font};font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${C.actionBlue};line-height:1.4;margin:0 0 6px 0;">${esc(text)}</div>`;
}

export function eventCardHtml(s: EventSection): string {
  const [dayNum, month = ''] = s.date.split(/\s+/);

  const tag = s.tag
    ? `<table cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px 0;"><tr><td style="background-color:${C.lightBlue};border-radius:12px;padding:3px 10px;font-family:${C.font};font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:${C.deepBlue};">${esc(s.tag)}</td></tr></table>`
    : '';

  const meta = [s.when, s.where].filter(Boolean).map(v => inlineMd(v!)).join('<br/>');

  const image = s.image
    ? `<tr><td style="padding:0 24px 20px 24px;"><img src="${esc(s.image)}" alt="${esc(s.imageAlt ?? '')}" width="100%" style="display:block;width:100%;max-width:100%;height:auto;border-radius:8px;border:0;" /></td></tr>`
    : '';

  const forBlock = s.for
    ? `<tr><td style="padding:0 24px 16px 24px;">${label("Who it's for")}<div style="font-family:${C.font};font-size:14px;color:${C.textSecondary};line-height:1.6;">${inlineMd(s.for)}</div></td></tr>`
    : '';

  const takeaways = s.takeaways.length
    ? `<tr><td style="padding:0 24px 16px 24px;">${label(s.listLabel ?? "What you'll take away")}${s.takeaways
        .map(
          (t, i, arr) => `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:${i === arr.length - 1 ? '0' : '8px'};"><tr>
<td width="18" valign="top" style="font-family:${C.font};font-size:14px;font-weight:700;color:${C.actionBlue};line-height:1.6;">&#10003;</td>
<td valign="top" style="font-family:${C.font};font-size:14px;color:${C.textSecondary};line-height:1.6;padding-left:6px;">${inlineMd(t)}</td>
</tr></table>`,
        )
        .join('')}</td></tr>`
    : '';

  const note = s.note
    ? `<tr><td style="padding:0 24px 20px 24px;"><div style="background-color:${C.paleBlue};border-radius:8px;padding:12px 14px;font-family:${C.font};font-size:13px;color:${C.textSecondary};line-height:1.6;">${inlineMd(s.note)}</div></td></tr>`
    : '';

  const cta = s.ctaText && s.ctaUrl
    ? `<tr><td style="padding:0 24px 24px 24px;"><table cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${C.actionBlue}" style="background-color:${C.actionBlue};border-radius:6px;"><a href="${esc(s.ctaUrl)}" style="display:inline-block;padding:12px 24px;font-family:${C.font};font-size:15px;font-weight:600;color:${C.white};text-decoration:none;">${esc(s.ctaText)}</a></td></tr></table></td></tr>`
    : '';

  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${C.border};border-radius:12px;border-collapse:separate;background-color:${C.white};">
<tr><td style="padding:24px 24px 20px 24px;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td width="64" valign="top" style="width:64px;">
      <table width="64" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" bgcolor="${C.deepBlue}" style="background-color:${C.deepBlue};border-radius:8px;padding:10px 0 8px 0;text-align:center;">
        <div style="font-family:${C.font};font-size:26px;font-weight:700;color:${C.white};line-height:1;">${esc(dayNum)}</div>
        <div style="font-family:${C.font};font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${C.white};line-height:1.4;margin-top:4px;">${esc(month)}</div>
        ${s.day ? `<div style="font-family:${C.font};font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#B8C4DE;line-height:1.4;">${esc(s.day)}</div>` : ''}
      </td></tr></table>
    </td>
    <td valign="top" style="padding-left:16px;">
      ${tag}
      ${s.title ? `<div style="font-family:${C.font};font-size:18px;font-weight:700;color:${C.deepBlue};line-height:1.3;margin:0 0 6px 0;">${esc(s.title)}</div>` : ''}
      ${meta ? `<div style="font-family:${C.font};font-size:13px;font-weight:600;color:${C.textPrimary};line-height:1.6;">${meta}</div>` : ''}
    </td>
  </tr></table>
</td></tr>
${image}${forBlock}${takeaways}${note}${cta}
</table>`;
}

export function agendaHtml(s: AgendaSection): string {
  const rows = s.items
    .map(
      (it, i, arr) => `<tr>
<td width="64" valign="top" style="width:64px;padding:12px 0;${i < arr.length - 1 ? `border-bottom:1px solid ${C.border};` : ''}font-family:${C.font};font-size:13px;font-weight:700;color:${C.actionBlue};line-height:1.4;white-space:nowrap;">${esc(it.date)}${it.day ? `<br/><span style="font-size:11px;font-weight:600;color:${C.textSecondary};text-transform:uppercase;">${esc(it.day)}</span>` : ''}</td>
<td valign="top" style="padding:12px 0 12px 12px;${i < arr.length - 1 ? `border-bottom:1px solid ${C.border};` : ''}font-family:${C.font};font-size:14px;font-weight:600;color:${C.textPrimary};line-height:1.4;">${esc(it.title)}${it.format ? `<br/><span style="font-size:12px;font-weight:400;color:${C.textSecondary};">${esc(it.format)}</span>` : ''}</td>
</tr>`,
    )
    .join('');
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.paleBlue};border-radius:12px;border-collapse:separate;">
<tr><td style="padding:20px 24px 8px 24px;">${label(s.heading ?? 'At a glance')}
<table width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>
</td></tr></table>`;
}
