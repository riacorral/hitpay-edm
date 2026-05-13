# HitPay EDM Creator

CLI tool to create HitPay-branded email campaigns (EDMs) from markdown and push to Loops.so.

## Stack

- **Node.js CLI** — Commander.js, TypeScript (ESM, strict), Zod
- **React Email** — compose emails as React components, render to HTML
- **gray-matter** — parse YAML frontmatter from markdown input
- **Loops** — draft campaign creation (official API + internal dashboard API)
- **Vitest** — unit + snapshot tests

## Key Conventions

- Always say **"partners"** — never "customers", "clients", or "merchants"
- Brand colors: Logo Blue `#0E2859`, Action Blue `#2465DE`, Deep Blue `#002771`, Beige `#F9F9F6`
- Fonts: Manrope (Google Fonts, closest to Hauora), Arial fallback
- Email max-width: 600px
- All templates use React Email components
- ESM modules throughout (`"type": "module"` in package.json)

## Commands

```bash
# Create EDM from markdown
npx tsx src/cli.ts create emails/sample.md --preview

# List available templates
npx tsx src/cli.ts templates

# Preview existing campaign
npx tsx src/cli.ts preview <slug-or-file>

# Upload to Loops as draft
npx tsx src/cli.ts upload <slug-or-file>

# Set up Loops credentials
npx tsx src/cli.ts init

# Run tests
npm test
```

## Content Format

Markdown files with YAML frontmatter specifying template type and metadata. Body uses standard markdown (headings, bullets, blockquotes, links with `{.cta}` class for buttons).

## Templates

1. **product-launch** — hero image, product name, feature bullets, CTA
2. **feature-update** — version badge, feature list, CTA
3. **newsletter** — multiple sections with dividers, metrics
4. **promotional** — offer highlight, promo code, expiry, CTA
5. **event-invitation** — event details, speakers, agenda, register CTA
6. **partner-spotlight** — partner logo, quote, metrics, read-more CTA

## Campaign System

Campaigns are saved to `campaigns/YYYY-MM-DD-slugified-title/` with:
- `index.html` — rendered email HTML
- `campaign.json` — metadata (template, subject, dates)
- `input.md` — copy of source markdown
