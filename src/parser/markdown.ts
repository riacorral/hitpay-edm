import matter from 'gray-matter';
import { EdmFrontmatter, type EdmSection, type ParsedEdm } from '../schema/edm.js';

/**
 * Parse a markdown EDM file into structured frontmatter + body sections.
 *
 * Frontmatter is validated via Zod discriminated union.
 * Body is parsed into typed sections: headings, paragraphs, bullets,
 * blockquotes (with optional attribution), CTAs, dividers, images, metrics.
 */
function normalizeKeys(data: Record<string, unknown>): Record<string, unknown> {
  // Convert snake_case keys to camelCase so AI-generated frontmatter parses cleanly
  // e.g. preview_text → previewText, cta_url → ctaUrl
  const snakeToCamel = (s: string) => s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
  return Object.fromEntries(Object.entries(data).map(([k, v]) => [snakeToCamel(k), v]));
}

function normalizeNumberedLists(content: string): string {
  // Split inline numbered lists onto separate lines.
  // e.g. "1. Item A 2. Item B 3. Item C" → "1. Item A\n2. Item B\n3. Item C"
  const lines = content.split('\n');
  const normalized = lines.flatMap(line => {
    const trimmed = line.trim();
    if (!/^\d+\.\s+/.test(trimmed)) return [line];
    if (!/\s\d+\.\s/.test(trimmed)) return [line]; // no inline continuation
    const parts = trimmed.split(/\s+(?=\d+\.\s)/);
    return parts.length > 1 ? parts : [line];
  });
  return normalized.join('\n');
}

export function parseEdm(markdown: string): ParsedEdm {
  const { data, content } = matter(markdown);
  const frontmatter = EdmFrontmatter.parse(normalizeKeys(data));
  const sections = parseBody(normalizeNumberedLists(content));
  return { frontmatter, sections };
}

function parseBody(body: string): EdmSection[] {
  const lines = body.split('\n');
  const sections: EdmSection[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) {
      i++;
      continue;
    }

    // Bullet-list block: ::: bullets
    // Format:
    //   ::: bullets
    //   **Title**
    //   Body text...
    //   :::
    if (trimmed === '::: bullets') {
      i++;
      const blockLines: string[] = [];
      while (i < lines.length && lines[i].trim() !== ':::') {
        const blockLine = lines[i].trim();
        if (blockLine) blockLines.push(blockLine);
        i++;
      }
      i++; // skip closing :::

      const items: { title: string; body: string }[] = [];
      let j = 0;
      while (j < blockLines.length) {
        const titleMatch = blockLines[j].match(/^\*\*(.+?)\*\*\.?$/);
        if (titleMatch && j + 1 < blockLines.length) {
          items.push({ title: titleMatch[1].replace(/\.$/, ''), body: blockLines[j + 1] });
          j += 2;
        } else {
          j++;
        }
      }

      if (items.length > 0) {
        sections.push({ type: 'bullet_list', items });
      }
      continue;
    }

    // Image row block: ::: image-row
    // Format:
    //   ::: image-row
    //   /path/to/image1.png
    //   /path/to/image2.png | optional alt text
    //   :::
    if (trimmed === '::: image-row') {
      i++;
      const images: { src: string; alt?: string }[] = [];
      while (i < lines.length && lines[i].trim() !== ':::') {
        const imgLine = lines[i].trim();
        if (imgLine) {
          const pipeIdx = imgLine.indexOf(' | ');
          if (pipeIdx !== -1) {
            images.push({ src: imgLine.slice(0, pipeIdx).trim(), alt: imgLine.slice(pipeIdx + 3).trim() });
          } else {
            images.push({ src: imgLine });
          }
        }
        i++;
      }
      i++; // skip closing :::
      if (images.length > 0) {
        sections.push({ type: 'image_row', images });
      }
      continue;
    }

    // Image-text block: ::: image-left /path/to/img.jpg or ::: image-right
    // Format:
    //   ::: image-left /path/to/image.jpg
    //   ### Optional heading
    //   Body text content...
    //   :::
    const imageTextMatch = trimmed.match(/^:::\s+image-(left|right)\s+(.+)$/);
    if (imageTextMatch) {
      const imagePosition = imageTextMatch[1] as 'left' | 'right';
      const src = imageTextMatch[2].trim();
      i++;
      let heading: string | undefined;
      const blockLines: string[] = [];
      while (i < lines.length && lines[i].trim() !== ':::') {
        const blockLine = lines[i].trim();
        if (blockLine.startsWith('### ')) {
          heading = blockLine.replace(/^###\s+/, '');
        } else {
          blockLines.push(blockLine);
        }
        i++;
      }
      i++; // skip closing :::

      // Detect title+body pairs: **Title** followed by non-bold line
      const items: { title: string; body: string }[] = [];
      let j = 0;
      while (j < blockLines.length) {
        const titleMatch = blockLines[j].match(/^\*\*(.+?)\*\*\.?$/);
        if (titleMatch && j + 1 < blockLines.length && !blockLines[j + 1].match(/^\*\*/)) {
          items.push({ title: titleMatch[1].replace(/\.$/, ''), body: blockLines[j + 1] });
          j += 2;
        } else {
          j++;
        }
      }

      sections.push({
        type: 'image_text',
        src,
        imagePosition,
        heading,
        ...(items.length > 0
          ? { items }
          : { text: blockLines.filter(Boolean).join(' ') }),
      });
      continue;
    }

    // Feature card block: ::: feature-right /path or ::: feature-left /path
    // Format:
    //   ::: feature-right /path/to/image.jpg
    //   ### Heading
    //   Paragraph text...
    //   - bullet 1
    //   - bullet 2
    //   Closing text.
    //   [CTA text](url)
    //   :::
    const featureCardMatch = trimmed.match(/^:::\s+feature-(left|right)\s+(.+)$/);
    if (featureCardMatch) {
      const imagePosition = featureCardMatch[1] as 'left' | 'right';
      const src = featureCardMatch[2].trim();
      i++;

      const blockLines: string[] = [];
      while (i < lines.length && lines[i].trim() !== ':::') {
        blockLines.push(lines[i]);
        i++;
      }
      i++; // skip closing :::

      let heading = '';
      const paragraphs: string[] = [];
      const youGet: string[] = [];
      const postBulletLines: string[] = [];
      let ctaText = '';
      let ctaUrl = '';
      let seenBullets = false;

      for (const blockLine of blockLines) {
        const bt = blockLine.trim();
        if (!bt) continue;

        if (bt.startsWith('### ')) {
          heading = bt.replace(/^###\s+/, '');
        } else if (/^[-*]\s+/.test(bt)) {
          seenBullets = true;
          youGet.push(bt.replace(/^[-*]\s+/, ''));
        } else {
          const linkMatch = bt.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
          if (linkMatch) {
            ctaText = linkMatch[1];
            ctaUrl = linkMatch[2];
          } else if (seenBullets) {
            postBulletLines.push(bt);
          } else {
            paragraphs.push(bt);
          }
        }
      }

      sections.push({
        type: 'feature_card',
        heading,
        paragraphs,
        youGet,
        closingText: postBulletLines.length > 0 ? postBulletLines.join(' ') : undefined,
        ctaText,
        ctaUrl,
        src,
        imagePosition,
      });
      continue;
    }

    // Horizontal rule → divider
    if (/^---+$/.test(trimmed) || /^\*\*\*+$/.test(trimmed)) {
      sections.push({ type: 'divider' });
      i++;
      continue;
    }

    // Heading
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      sections.push({
        type: 'heading',
        level: headingMatch[1].length,
        text: headingMatch[2],
      });
      i++;
      continue;
    }

    // Image: ![alt](src) or ![alt](src){width=120}
    const imageMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)(?:\{width=(\d+)\})?$/);
    if (imageMatch) {
      sections.push({
        type: 'image',
        alt: imageMatch[1] || undefined,
        src: imageMatch[2],
        ...(imageMatch[3] ? { width: parseInt(imageMatch[3], 10) } : {}),
      });
      i++;
      continue;
    }

    // CTA link: [text](url){.cta}
    const ctaMatch = trimmed.match(/^\[([^\]]+)\]\(([^)]+)\)\{\.cta\}$/);
    if (ctaMatch) {
      sections.push({
        type: 'cta',
        text: ctaMatch[1],
        url: ctaMatch[2],
      });
      i++;
      continue;
    }

    // Blockquote (may span multiple lines, with optional attribution)
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s*/, ''));
        i++;
      }
      const fullQuote = quoteLines.join(' ').trim();

      // Check for attribution: "quote text" — Attribution
      const attrMatch = fullQuote.match(/^[""](.+?)[""]\s*[—–-]\s*(.+)$/);
      if (attrMatch) {
        sections.push({
          type: 'blockquote',
          text: `"${attrMatch[1]}"`,
          attribution: attrMatch[2],
        });
      } else {
        sections.push({ type: 'blockquote', text: fullQuote });
      }
      continue;
    }

    // Ordered list (1. 2. 3.)
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      sections.push({ type: 'bullets', items, ordered: true });
      continue;
    }

    // Bullet list (- or *)
    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ''));
        i++;
      }
      sections.push({ type: 'bullets', items });
      continue;
    }

    // Metric block: lines like **$4.2M** Monthly Revenue
    const metricMatch = trimmed.match(/^\*\*(.+?)\*\*\s+(.+)$/);
    if (metricMatch) {
      const items: { value: string; label: string }[] = [];
      while (i < lines.length) {
        const mLine = lines[i].trim();
        const m = mLine.match(/^\*\*(.+?)\*\*\s+(.+)$/);
        if (!m) break;
        items.push({ value: m[1], label: m[2] });
        i++;
      }
      // Only treat as metric if values look numeric-ish (start with $, digit, or %)
      if (items.length > 0 && items.every(it => /^[\d$%+]/.test(it.value))) {
        sections.push({ type: 'metric', items });
      } else {
        // Treat as paragraph with bold text
        for (const item of items) {
          sections.push({
            type: 'paragraph',
            text: `**${item.value}** ${item.label}`,
          });
        }
      }
      continue;
    }

    // Regular paragraph — collect consecutive non-empty, non-special lines
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('>') &&
      !/^---+$/.test(lines[i].trim()) &&
      !/^\*\*\*+$/.test(lines[i].trim()) &&
      !/^[-*]\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim()) &&
      !/^!\[/.test(lines[i].trim()) &&
      !/^\[.+\]\(.+\)\{\.cta\}$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }
    if (paraLines.length > 0) {
      sections.push({ type: 'paragraph', text: paraLines.join(' ') });
    }
  }

  return sections;
}
