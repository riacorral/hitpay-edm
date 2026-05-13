import chalk from 'chalk';

const TEMPLATES = [
  {
    name: 'product-launch',
    description: 'Hero image, product name, feature bullets, CTA',
    requiredFields: 'productName, ctaUrl',
  },
  {
    name: 'feature-update',
    description: 'Version badge, feature list with icons, CTA',
    requiredFields: 'ctaUrl',
  },
  {
    name: 'newsletter',
    description: 'Multiple sections with dividers, metrics, spotlight',
    requiredFields: '(none beyond subject)',
  },
  {
    name: 'promotional',
    description: 'Offer highlight, promo code, expiry date, CTA',
    requiredFields: 'ctaUrl',
  },
  {
    name: 'event-invitation',
    description: 'Event details, speakers, agenda, register CTA',
    requiredFields: 'eventName, eventDate, ctaUrl',
  },
  {
    name: 'partner-spotlight',
    description: 'Partner logo, quote, metrics, read-more CTA',
    requiredFields: 'partnerName, ctaUrl',
  },
];

export function templatesCommand(): void {
  console.log(chalk.bold('\nAvailable Templates\n'));

  for (const t of TEMPLATES) {
    console.log(`  ${chalk.blue(t.name)}`);
    console.log(`  ${chalk.dim(t.description)}`);
    console.log(`  ${chalk.dim(`Required: ${t.requiredFields}`)}`);
    console.log('');
  }

  console.log(
    chalk.dim('Usage: hitpay-edm create <file.md> where frontmatter specifies template'),
  );
}
