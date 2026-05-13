import React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Font,
  Preview,
} from '@react-email/components';
import { BRAND } from '../../../brand/hitpay.js';

interface WrapperProps {
  previewText?: string;
  children: React.ReactNode;
}

export function Wrapper({ previewText, children }: WrapperProps) {
  return (
    <Html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Opt out of dark-mode auto-inversion on Apple Mail / Outlook */}
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        {/* Google Fonts for Gmail fallback — Gmail supports @import but not woff2 @font-face */}
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&display=swap');`}</style>
        {/* Mobile responsiveness */}
        <style>{`
  @media only screen and (max-width: 480px) {
    img { max-width: 100% !important; height: auto !important; }
  }
`}</style>
        <Font
          fontFamily="Hauora"
          fallbackFontFamily={['Manrope', 'Arial', 'Helvetica', 'sans-serif']}
          webFont={{
            url: BRAND.fontUrls.regular,
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Hauora"
          fallbackFontFamily={['Manrope', 'Arial', 'Helvetica', 'sans-serif']}
          webFont={{
            url: BRAND.fontUrls.semibold,
            format: 'woff2',
          }}
          fontWeight={600}
          fontStyle="normal"
        />
        <Font
          fontFamily="Hauora"
          fallbackFontFamily={['Manrope', 'Arial', 'Helvetica', 'sans-serif']}
          webFont={{
            url: BRAND.fontUrls.bold,
            format: 'woff2',
          }}
          fontWeight={700}
          fontStyle="normal"
        />
      </Head>
      {previewText && <Preview>{previewText}</Preview>}
      <Body
        style={{
          backgroundColor: BRAND.colors.neutral100,
          fontFamily: BRAND.fonts.body,
          margin: '0',
          padding: '0',
        }}
      >
        <Container
          style={{
            maxWidth: `${BRAND.email.maxWidth}px`,
            margin: '0 auto',
            backgroundColor: BRAND.colors.white,
          }}
        >
          {children}
        </Container>
      </Body>
    </Html>
  );
}
