// Osome-blast variant: no top HitPay logo header, generic greeting (no Loops merge tag)
import fs from 'fs';
import mjml2html from '../../node_modules/mjml/lib/index.js';
let m = fs.readFileSync('index.mjml', 'utf8');
m = m.replace(/\s*<mj-section padding="32px 32px 20px">\s*<mj-column>\s*<mj-image src="img\/inline-1.png"[^>]*\/>\s*<\/mj-column>\s*<\/mj-section>/, '');
m = m.replace('<mj-section padding="0 32px">\n    <mj-column>\n      <mj-image src="img/hero.png"', '<mj-section padding="32px 32px 0">\n    <mj-column>\n      <mj-image src="img/hero.png"');
m = m.replace('Hi {firstName},', 'Hi there,');
const D = '../one-man-show-osome-for-osome-blast';
fs.writeFileSync(`${D}/index.mjml`, m);
const { html, errors } = mjml2html(m, { validationLevel: 'soft' });
if (errors.length) console.log(errors.map(e => e.formattedMessage));
fs.writeFileSync(`${D}/index.html`, html);
