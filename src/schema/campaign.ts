import { z } from 'zod';
import { TemplateType } from './edm.js';

export const CampaignMetadataSchema = z.object({
  version: z.literal(1),
  slug: z.string(),
  title: z.string(),
  subject: z.string(),
  template: TemplateType,
  createdAt: z.string(),
  inputFile: z.string(),
  htmlFile: z.string(),
  loopsId: z.string().optional(),
  loopsUrl: z.string().optional(),
});

export type CampaignMetadata = z.infer<typeof CampaignMetadataSchema>;
