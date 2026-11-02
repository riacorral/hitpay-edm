import sharp from 'sharp';
const paths = {
  calendar: '<rect x="5" y="7" width="18" height="16" rx="3" fill="none" stroke="#2465DE" stroke-width="2"/><path d="M5 12h18M10 4v5M18 4v5" stroke="#2465DE" stroke-width="2" stroke-linecap="round"/>',
  clock: '<circle cx="14" cy="14" r="9" fill="none" stroke="#2465DE" stroke-width="2"/><path d="M14 9v5.5l3.5 2" fill="none" stroke="#2465DE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  pin: '<path d="M14 24s7-6.2 7-11.5A7 7 0 0 0 7 12.5C7 17.8 14 24 14 24z" fill="none" stroke="#2465DE" stroke-width="2" stroke-linejoin="round"/><circle cx="14" cy="12.5" r="2.5" fill="none" stroke="#2465DE" stroke-width="2"/>',
  wallet: '<rect x="5" y="8" width="18" height="13" rx="3" fill="none" stroke="#2465DE" stroke-width="2"/><path d="M5 12h18" stroke="#2465DE" stroke-width="2"/><circle cx="18.5" cy="16.5" r="1.3" fill="#2465DE"/>',
  tools: '<path d="M7 21l8-8M17.5 6.5a4 4 0 0 0-4.2 5.4L7 18.2 9.8 21l6.3-6.3a4 4 0 0 0 5.4-4.2l-2.6 2.6-2.4-.6-.6-2.4z" fill="none" stroke="#2465DE" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>',
  chat: '<path d="M6 7h16v11H12l-5 4v-4H6z" fill="none" stroke="#2465DE" stroke-width="2" stroke-linejoin="round"/>',
  people: '<circle cx="10.5" cy="11" r="3" fill="none" stroke="#2465DE" stroke-width="2"/><circle cx="19" cy="12" r="2.5" fill="none" stroke="#2465DE" stroke-width="2"/><path d="M4.5 21c.5-3.5 3-5 6-5s5.5 1.500 6 5M17.500 16.500c3 0 5 1.200 5.500 4.500" fill="none" stroke="#2465DE" stroke-width="2" stroke-linecap="round"/>',
};
for (const [n, p] of Object.entries(paths)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">${p}</svg>`;
  const icon = await sharp(Buffer.from(svg), { density: 600 }).resize(40, 40).png().toBuffer();
  await sharp({ create: { width: 96, height: 96, channels: 4, background: '#EBF0FA' } })
    .composite([{ input: Buffer.from(`<svg width="96" height="96"><rect width="96" height="96" rx="48" fill="#fff"/></svg>`), blend: 'dest-in' }, { input: await sharp(icon).resize(56,56).toBuffer(), gravity: 'center' }])
    .png().toFile(`emails/one-man-show-osome/img/icon-${n}.png`);
}
await sharp('emails/images/one-man-show/speakers.png').resize(1200).png({ quality: 90, compressionLevel: 9 }).toFile('emails/one-man-show-osome/img/hero.png');
