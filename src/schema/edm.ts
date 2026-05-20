import { z } from 'zod';

export const TemplateType = z.enum([
  'product-launch',
  'feature-update',
  'newsletter',
  'promotional',
  'event-invitation',
  'partner-spotlight',
  'important-announcement',
  'app-changes',
  'rate-changes',
  'compliance',
]);
export type TemplateType = z.infer<typeof TemplateType>;

// Shared base frontmatter fields
const BaseFrontmatter = z.object({
  template: TemplateType,
  subject: z.string(),
  previewText: z.string().optional(),
});

// Template-specific frontmatter
export const ProductLaunchFrontmatter = BaseFrontmatter.extend({
  template: z.literal('product-launch'),
  productName: z.string(),
  heroImage: z.string().optional(),
  ctaText: z.string().default('Get Started'),
  ctaUrl: z.string().url(),
  secondaryCtaText: z.string().optional(),
  secondaryCtaUrl: z.string().optional(),
});

export const FeatureUpdateFrontmatter = BaseFrontmatter.extend({
  template: z.literal('feature-update'),
  versionBadge: z.string().optional(),
  ctaText: z.string().default('Learn More'),
  ctaUrl: z.string().url().optional(),
});

export const NewsletterFrontmatter = BaseFrontmatter.extend({
  template: z.literal('newsletter'),
  issueNumber: z.number().optional(),
  date: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
});

export const PromotionalFrontmatter = BaseFrontmatter.extend({
  template: z.literal('promotional'),
  promoCode: z.string().optional(),
  expiryDate: z.string().optional(),
  discountText: z.string().optional(),
  ctaText: z.string().default('Claim Offer'),
  ctaUrl: z.string().url(),
});

export const EventInvitationFrontmatter = BaseFrontmatter.extend({
  template: z.literal('event-invitation'),
  eventName: z.string().optional(),
  eventSubtitle: z.string().optional(),
  eventDate: z.string().optional(),
  eventLocation: z.string().optional(),
  eventTime: z.string().optional(),
  partnerLogo: z.string().optional(),
  partnerName: z.string().optional(),
  heroImage: z.string().optional(),
  eyebrowText: z.string().optional(),
  primaryCtaText: z.string().optional(),
  primaryCtaUrl: z.string().optional(),
  testimonialTopImage: z.string().optional(),
  testimonialBottomImage: z.string().optional(),
  secondaryCtaText: z.string().optional(),
  secondaryCtaUrl: z.string().optional(),
  ctaText: z.string().default('Register Now'),
  ctaUrl: z.string().url(),
});

export const PartnerSpotlightFrontmatter = BaseFrontmatter.extend({
  template: z.literal('partner-spotlight'),
  partnerName: z.string(),
  partnerLogo: z.string().url().optional(),
  heroImage: z.string().optional(),
  ctaText: z.string().default('Read More'),
  ctaUrl: z.string().url(),
});

export const ImportantAnnouncementFrontmatter = BaseFrontmatter.extend({
  template: z.literal('important-announcement'),
  badgeText: z.string().default('Important Notice'),
  heroImage: z.string().optional(),
  ctaText: z.string().default('Learn More'),
  ctaUrl: z.string().url().optional(),
});

export const AppChangesFrontmatter = BaseFrontmatter.extend({
  template: z.literal('app-changes'),
  versionBadge: z.string().optional(),
  effectiveDate: z.string().optional(),
  heroImage: z.string().optional(),
  ctaText: z.string().default('View Changes'),
  ctaUrl: z.string().url().optional(),
});

export const RateChangesFrontmatter = BaseFrontmatter.extend({
  template: z.literal('rate-changes'),
  effectiveDate: z.string(),
  rateDescription: z.string().optional(),
  heroImage: z.string().optional(),
  ctaText: z.string().default('View Details'),
  ctaUrl: z.string().url().optional(),
});

export const ComplianceFrontmatter = BaseFrontmatter.extend({
  template: z.literal('compliance'),
  complianceType: z.string().optional(),
  effectiveDate: z.string().optional(),
  requiredAction: z.string().optional(),
  ctaText: z.string().default('Read Update'),
  ctaUrl: z.string().url().optional(),
});

export type ProductLaunchFrontmatter = z.infer<typeof ProductLaunchFrontmatter>;
export type FeatureUpdateFrontmatter = z.infer<typeof FeatureUpdateFrontmatter>;
export type NewsletterFrontmatter = z.infer<typeof NewsletterFrontmatter>;
export type PromotionalFrontmatter = z.infer<typeof PromotionalFrontmatter>;
export type EventInvitationFrontmatter = z.infer<typeof EventInvitationFrontmatter>;
export type PartnerSpotlightFrontmatter = z.infer<typeof PartnerSpotlightFrontmatter>;
export type ImportantAnnouncementFrontmatter = z.infer<typeof ImportantAnnouncementFrontmatter>;
export type AppChangesFrontmatter = z.infer<typeof AppChangesFrontmatter>;
export type RateChangesFrontmatter = z.infer<typeof RateChangesFrontmatter>;
export type ComplianceFrontmatter = z.infer<typeof ComplianceFrontmatter>;

export const EdmFrontmatter = z.discriminatedUnion('template', [
  ProductLaunchFrontmatter,
  FeatureUpdateFrontmatter,
  NewsletterFrontmatter,
  PromotionalFrontmatter,
  EventInvitationFrontmatter,
  PartnerSpotlightFrontmatter,
  ImportantAnnouncementFrontmatter,
  AppChangesFrontmatter,
  RateChangesFrontmatter,
  ComplianceFrontmatter,
]);
export type EdmFrontmatter = z.infer<typeof EdmFrontmatter>;

// Body section types parsed from markdown
export const EdmSectionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('heading'), level: z.number(), text: z.string() }),
  z.object({ type: z.literal('paragraph'), text: z.string() }),
  z.object({ type: z.literal('bullets'), items: z.array(z.string()) }),
  z.object({ type: z.literal('blockquote'), text: z.string(), attribution: z.string().optional() }),
  z.object({ type: z.literal('cta'), text: z.string(), url: z.string() }),
  z.object({ type: z.literal('divider') }),
  z.object({ type: z.literal('image'), src: z.string(), alt: z.string().optional(), width: z.number().optional() }),
  z.object({
    type: z.literal('metric'),
    items: z.array(z.object({ value: z.string(), label: z.string() })),
  }),
  z.object({
    type: z.literal('bullet_list'),
    items: z.array(z.object({ title: z.string(), body: z.string() })),
  }),
  z.object({
    type: z.literal('image_text'),
    src: z.string(),
    alt: z.string().optional(),
    imagePosition: z.enum(['left', 'right']),
    heading: z.string().optional(),
    text: z.string().optional(),
    items: z.array(z.object({ title: z.string(), body: z.string() })).optional(),
  }),
  z.object({
    type: z.literal('feature_card'),
    heading: z.string(),
    paragraphs: z.array(z.string()),
    youGet: z.array(z.string()),
    closingText: z.string().optional(),
    ctaText: z.string(),
    ctaUrl: z.string(),
    src: z.string(),
    alt: z.string().optional(),
    imagePosition: z.enum(['left', 'right']),
  }),
  z.object({
    type: z.literal('image_row'),
    images: z.array(z.object({ src: z.string(), alt: z.string().optional() })),
  }),
]);
export type EdmSection = z.infer<typeof EdmSectionSchema>;

// Full parsed EDM
export const ParsedEdmSchema = z.object({
  frontmatter: EdmFrontmatter,
  sections: z.array(EdmSectionSchema),
});
export type ParsedEdm = z.infer<typeof ParsedEdmSchema>;
