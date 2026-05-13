import React from 'react';
import { BRAND } from '../../../brand/hitpay.js';

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

/**
 * Table-based email button — works reliably across Gmail, Apple Mail, Outlook,
 * and when passed through MJML mj-raw. Uses bgcolor attribute on <td> for
 * maximum compatibility. No VML/MSO conditional comments.
 */
export function Button({ href, children, variant = 'primary' }: ButtonProps) {
  const isPrimary = variant === 'primary';
  const bgColor = isPrimary ? BRAND.colors.actionBlue : 'transparent';
  const textColor = isPrimary ? '#FFFFFF' : BRAND.colors.actionBlue;
  const border = isPrimary ? 'none' : `2px solid ${BRAND.colors.actionBlue}`;

  return (
    <table
      cellPadding={0}
      cellSpacing={0}
      border={0}
      style={{ margin: '0 auto', borderCollapse: 'collapse' as const }}
    >
      <tbody>
        <tr>
          <td
            align="center"
            bgcolor={isPrimary ? '#2465DE' : undefined}
            style={{
              backgroundColor: bgColor,
              borderRadius: BRAND.email.buttonRadius,
              border,
            }}
          >
            <a
              href={href}
              target="_blank"
              style={{
                display: 'inline-block',
                padding: '14px 28px',
                color: textColor,
                fontFamily: BRAND.fonts.body,
                fontSize: BRAND.fontSizes.body,
                fontWeight: 600,
                textDecoration: 'none',
                lineHeight: '1',
                whiteSpace: 'nowrap' as const,
              }}
            >
              <span style={{ color: textColor }}>{children}</span>
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
