import React from 'react';
import { Hr } from '@react-email/components';
import { BRAND } from '../../../brand/hitpay.js';

export function Divider() {
  return (
    <Hr
      style={{
        borderColor: BRAND.colors.neutral200,
        margin: `${BRAND.spacing.lg} ${BRAND.spacing.xl}`,
      }}
    />
  );
}
