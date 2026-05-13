const CDN = 'https://3cse8uwfv1q9zblo.public.blob.vercel-storage.com/hitpay-edm';

export const BRAND = {
  colors: {
    logoBlue: '#0E2859',
    actionBlue: '#2465DE',
    deepBlue: '#002771',
    beige: '#F9F9F6',
    white: '#FFFFFF',
    black: '#000501',
    textPrimary: '#03102F',
    textSecondary: '#61667C',
    textTertiary: '#9295A5',
    success: '#4DAB80',
    warning: '#F4B840',
    error: '#DC3545',
    neutral100: '#F0F2F5',
    neutral200: '#D4D9E0',
    neutral400: '#8B95A5',
    lightBlue: '#EBF0FA',
    paleBlue: '#F5F7FC',
  },

  fonts: {
    headline: 'Hauora, Manrope, Arial, Helvetica, sans-serif',
    body: 'Hauora, Manrope, Arial, Helvetica, sans-serif',
    fallback: 'Manrope, Arial, Helvetica, sans-serif',
  },

  fontUrls: {
    regular: `${CDN}/Hauora-Regular.woff2`,
    semibold: `${CDN}/Hauora-SemiBold.woff2`,
    bold: `${CDN}/Hauora-Bold.woff2`,
  },

  fontSizes: {
    heroTitle: '28px',
    headline: '24px',
    subheadline: '20px',
    body: '16px',
    bodySmall: '14px',
    caption: '12px',
    eyebrow: '11px',
    metricValue: '36px',
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },

  email: {
    maxWidth: 600,
    borderRadius: '8px',
    buttonRadius: '6px',
    cardRadius: '8px',
  },

  logo: {
    dark: `${CDN}/logo-dark%402x.png`,
    white: `${CDN}/logo-white%402x.png`,
  },

  social: {
    logogram: `${CDN}/hitpay-logogram.svg`,
    icons: {
      instagram: `${CDN}/social-instagram.png`,
      facebook:  `${CDN}/social-facebook.png`,
      linkedin:  `${CDN}/social-linkedin.png`,
      tiktok:    `${CDN}/social-tiktok.png`,
      youtube:   `${CDN}/social-youtube.png`,
    },
    links: {
      instagram: 'https://www.instagram.com/hitpayapp',
      facebook:  'https://www.facebook.com/hitpayapp',
      linkedin:  'https://www.linkedin.com/company/hit-pay/',
      tiktok:    'https://www.tiktok.com/@hitpayapp',
      youtube:   'https://www.youtube.com/@hitpayapp',
    },
  },

  defaults: {
    tagline: 'Enabling growing businesses to get paid with confidence',
    website: 'https://www.hitpayapp.com',
    unsubscribeText: 'Unsubscribe',
    companyAddress: 'HitPay Payment Solutions Pte Ltd, Singapore',
  },
} as const;

export const GRADIENT = `linear-gradient(135deg, ${BRAND.colors.deepBlue} 0%, ${BRAND.colors.actionBlue} 100%)`;
