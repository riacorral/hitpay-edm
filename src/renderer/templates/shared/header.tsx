import React from 'react';
import { Img } from '@react-email/components';
import { BRAND } from '../../../brand/hitpay.js';

/**
 * Email header — flat HTML table with bgcolor on both <table> and <td>.
 * This ensures the deep blue background renders correctly in all email
 * clients and that Gmail dark mode detects it as a dark section (preserving
 * the white logo without inversion).
 */
export function Header() {
  return (
    <table
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      bgcolor="#002771"
      style={{ backgroundColor: BRAND.colors.deepBlue }}
    >
      <tbody>
        <tr>
          <td
            bgcolor="#002771"
            style={{
              backgroundColor: BRAND.colors.deepBlue,
              padding: `${BRAND.spacing.lg} ${BRAND.spacing.xl}`,
            }}
          >
            <Img
              src={BRAND.logo.white}
              alt="HitPay"
              width="120"
              height="32"
              style={{ display: 'block' }}
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
}
