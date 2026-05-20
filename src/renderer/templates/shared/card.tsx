import React from 'react';
import { Section, Text } from '@react-email/components';
import { BRAND } from '../../../brand/hitpay.js';

interface CardProps {
  children: React.ReactNode;
  backgroundColor?: string;
}

export function Card({ children, backgroundColor }: CardProps) {
  return (
    <Section
      style={{
        backgroundColor: backgroundColor || BRAND.colors.paleBlue,
        borderRadius: BRAND.email.cardRadius,
        padding: BRAND.spacing.lg,
        margin: `${BRAND.spacing.sm} 0`,
      }}
    >
      {children}
    </Section>
  );
}

interface MetricCardProps {
  value: string;
  label: string;
  solo?: boolean;
}

export function MetricCard({ value, label, solo }: MetricCardProps) {
  return (
    <Section
      style={{
        backgroundColor: BRAND.colors.paleBlue,
        borderRadius: BRAND.email.cardRadius,
        padding: BRAND.spacing.lg,
        textAlign: 'center' as const,
        ...(solo ? {} : { display: 'inline-block', width: '44%', verticalAlign: 'top' as const }),
        margin: solo ? '0 0 12px' : '0 2% 12px',
      }}
    >
      <Text
        style={{
          fontFamily: BRAND.fonts.headline,
          fontSize: BRAND.fontSizes.metricValue,
          fontWeight: 700,
          color: BRAND.colors.deepBlue,
          margin: '0 0 4px 0',
          lineHeight: '1.1',
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontFamily: BRAND.fonts.body,
          fontSize: BRAND.fontSizes.bodySmall,
          color: BRAND.colors.textSecondary,
          margin: '0',
          lineHeight: '1.3',
        }}
      >
        {label}
      </Text>
    </Section>
  );
}
