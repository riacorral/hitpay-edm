# HitPay EDM Creator

CLI tool to create HitPay-branded email campaigns (EDMs) from markdown and push to Loops.so.

## Stack

- **Node.js CLI** — Commander.js, TypeScript (ESM, strict), Zod
- **React Email** — compose emails as React components, render to HTML
- **gray-matter** — parse YAML frontmatter from markdown input
- **Loops** — draft campaign creation (official API + internal dashboard API)
- **Vitest** — unit + snapshot tests

## Key Conventions

- Refer to HitPay's audience as **"partners"**, **"merchant partners"**, or **"merchants"** — all fine; vary them so copy doesn't read stiff (always "partners" sounds forced). Avoid "clients". "customers" is fine when it means a *partner's own shoppers* (e.g. "your customers can now pay with…")
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

## Body Structure (Impactful EDM Pattern)

`emails/adaptive-pricing-checkout.md` is the reference structure for a full feature-launch EDM — default to this shape whenever the campaign has enough substance to carry it (a new capability, a meaningful behavior change, something with a clear "who's this for" split). Copy-to-section mapping:

1. **Greeting** — `Hi {firstName},`
2. **Hook** — one bold sentence right after the greeting, stating the single biggest partner-facing benefit. Never throat-clearing ("We're excited to announce...") and never just the feature name — lead with the outcome.
3. **3 bullets, bold lead-in** — `- **Benefit phrase** — supporting clause.` Each bullet a distinct value prop (what/why it matters), not a setup step.
4. **Optional metric callout** — `**+10%** Average lift in...` — only when there's a real, defensible number. Renders as a stat card. Don't manufacture a stat to fill this slot.
5. Divider (`---`)
6. **"Getting Started" section** — `### Getting Started` heading, numbered steps written as dashboard paths (`Go to **Settings > X > Y**...`), an optional screenshot of the exact setting, then a `{.cta}` link. This is the how-to-turn-it-on block.
7. Divider
8. **"Key Benefits" section** — `### Key Benefits` heading, a longer bullet list (4-6 items) each leading with a bold short benefit title, going deeper than the hook bullets (more proof, more specificity). Followed by another `{.cta}` link.
9. Divider
10. **"Suitable For" / "Who Is This For?" section** — one sentence framing the ideal partner, then a `:::columns` block with exactly 3 segments (icon + bold segment name/stat + one-line description). Followed by another `{.cta}` link.
11. Divider
12. **"Availability" section** — plain statement of what channels/products it works with (hosted checkout, POS, API, etc.). Sets expectations up front and heads off support questions.
13. Divider
14. **Sign-off** — "Questions? Reply to this email and we will help you out." then `**The HitPay Team**`.

Design notes:
- The CTA repeats after each major section (steps 6, 8, 10) — not just once at the bottom — each with its own `utm_content` position/slug (see UTM convention below). This reinforces the action at every point of persuasion instead of making the reader scroll back to one link.
- `###` headings break the body into scannable chunks — don't run the whole email as one undifferentiated stream of paragraphs.
- Use `:::columns` for audience/use-case segmentation (3 cards: icon + short bold title + one-line description) — the clearest way to make "who this is for" concrete and skimmable.
- Inline screenshots go right after the step(s) they illustrate, not bunched at the top or bottom of the email.

When to scale down: a minor update or single-feature tweak (see `emails/checkout-customization-updates.md`) doesn't need the full arc — hook, 1-2 feature blocks with inline screenshots, one CTA, sign-off is enough. Ask the user if unsure whether a campaign warrants the full structure vs. a lighter one.

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
