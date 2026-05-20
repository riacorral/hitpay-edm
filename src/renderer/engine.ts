import React from 'react';
import { render } from '@react-email/render';
import { ProductLaunchEmail } from './templates/product-launch.js';
import { FeatureUpdateEmail } from './templates/feature-update.js';
import { NewsletterEmail } from './templates/newsletter.js';
import { PromotionalEmail } from './templates/promotional.js';
import { EventInvitationEmail } from './templates/event-invitation.js';
import { PartnerSpotlightEmail } from './templates/partner-spotlight.js';
import { ImportantAnnouncementEmail } from './templates/important-announcement.js';
import { AppChangesEmail } from './templates/app-changes.js';
import { RateChangesEmail } from './templates/rate-changes.js';
import { ComplianceEmail } from './templates/compliance.js';
import type { ParsedEdm, EdmFrontmatter, EdmSection } from '../schema/edm.js';

/**
 * Render a parsed EDM to HTML string.
 * Selects the correct React Email template based on frontmatter.template,
 * passes frontmatter + body sections, and renders to static HTML.
 */
export async function renderEdm(edm: ParsedEdm): Promise<string> {
  const element = createEmailElement(edm.frontmatter, edm.sections);
  const html = await render(element);
  return html;
}

function createEmailElement(
  frontmatter: EdmFrontmatter,
  sections: EdmSection[],
): React.ReactElement {
  switch (frontmatter.template) {
    case 'product-launch':
      return React.createElement(ProductLaunchEmail, { frontmatter, sections });
    case 'feature-update':
      return React.createElement(FeatureUpdateEmail, { frontmatter, sections });
    case 'newsletter':
      return React.createElement(NewsletterEmail, { frontmatter, sections });
    case 'promotional':
      return React.createElement(PromotionalEmail, { frontmatter, sections });
    case 'event-invitation':
      return React.createElement(EventInvitationEmail, { frontmatter, sections });
    case 'partner-spotlight':
      return React.createElement(PartnerSpotlightEmail, { frontmatter, sections });
    case 'important-announcement':
      return React.createElement(ImportantAnnouncementEmail, { frontmatter, sections });
    case 'app-changes':
      return React.createElement(AppChangesEmail, { frontmatter, sections });
    case 'rate-changes':
      return React.createElement(RateChangesEmail, { frontmatter, sections });
    case 'compliance':
      return React.createElement(ComplianceEmail, { frontmatter, sections });
  }
}
