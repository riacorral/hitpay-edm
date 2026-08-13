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
- Closing line before the sign-off should read "Questions? Reply to this email and we will help you out." — not a support.hitpay.com link.

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

Every email body must open with `Hi {firstName},` as the first line (Loops contact-property tag — no inline fallback syntax; fallback text is set via Loops' dynamic-content menu after upload, not written in the markdown).

## CTA URLs & UTM Tracking

Every CTA that links to a webpage (`ctaUrl` in frontmatter, `[text](url){.cta}` links, and secondary text links) must carry UTM parameters:

```
?utm_source=email&utm_medium=email&utm_campaign=<campaign-slug>&utm_content=<position>-<cta-slug>
```

- `utm_campaign` — kebab-case slug identifying the campaign/feature (e.g. `platforms-oauth`).
- `utm_content` — the CTA's 1-indexed position in the email, followed by a kebab-case slug of its label (e.g. `1-try-creating-oauth-app`, `2-read-the-docs`). Renumber if CTAs are reordered.
- Skip UTM params on non-`http(s)` links (`mailto:`, `tel:`) — they aren't read by web analytics, so the params are dead weight.

## Subject Lines & Preview Text

Optimize for open rate while staying accurate to the content:

- Front-load the first 3-5 words with the strongest hook — the biggest benefit, a pain point solved, or genuine curiosity. Never spend the opening words on the brand name or filler ("Introducing", "Announcing", "Newsletter").
- Keep subjects under ~60 characters (mobile inboxes typically show only the first 30-45).
- Prefer benefit/outcome-driven language over feature names (e.g. "Skip API Keys" over "OAuth Apps").
- Clarity over cleverness — never clickbait or imply something the email doesn't deliver.
- Preview text should complement the subject, not repeat it — add context or a supporting benefit, ~40-90 characters, no generic filler ("View in browser") and no trailing punctuation.
- When drafting a new campaign's subject/preview (and the user hasn't already supplied one), propose ~5 options covering different angles (pain point, benefit, feature announcement, speed/convenience, security/trust, curiosity), ranked strongest-to-weakest, and let the user pick before locking one in.

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
