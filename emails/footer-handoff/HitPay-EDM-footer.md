# HitPay EDM footer

Standard footer used at the end of every HitPay EDM (MJML, built for Loops). It has three parts, top to bottom:

1. Logogram and social icons row
2. Banner image ("Empowering 20,000+ Businesses Across Asia Pacific")
3. Legal line and unsubscribe link

Background is beige `#F9F9F6`, full width of the 600px email.

## Links

| Item | Link |
|---|---|
| HitPay logo | https://www.hitpayapp.com |
| Instagram | https://www.instagram.com/hitpayapp |
| Facebook | https://www.facebook.com/hitpayapp |
| LinkedIn | https://www.linkedin.com/company/hit-pay/ |
| TikTok | https://www.tiktok.com/@hitpayapp |
| YouTube | https://www.youtube.com/@hitpayapp |
| Unsubscribe | `{unsubscribe_link}` (Loops fills this in at send time, do not replace it) |

Legal line: **HitPay Payment Solutions Pte Ltd**

## Images (in `img/`)

| File | Size | Used for |
|---|---|---|
| `logogram.png` | 24×24, round (file is 96×96 for retina) | HitPay logogram, left of the icons |
| `icon-instagram.png` | 24×24, round (file is 96×96 for retina) | Social icon |
| `icon-facebook.png` | 24×24, round (file is 96×96 for retina) | Social icon |
| `icon-linkedin.png` | 24×24, round (file is 96×96 for retina) | Social icon |
| `icon-tiktok.png` | 24×24, round (file is 96×96 for retina) | Social icon |
| `icon-youtube.png` | 24×24, round (file is 96×96 for retina) | Social icon |
| `footer-banner.png` | 600px wide, full width | Banner under the icons |

When uploading as MJML to Loops, keep the images in an `img/` folder inside the zip and reference them as `img/<file>`. Loops rehosts them at send time.

## Design notes

- Fonts: Manrope, with Arial as fallback
- Text colour on the legal line `#9295A5`, divider `#D4D9E0`, unsubscribe `#D4D9E0`
- Footer banners can be market-specific (e.g. SG, MY, PH). The banner above is the default.

## MJML (copy and paste before `</mj-body>`)

```xml
<!-- Footer: logo + socials -->
<mj-section background-color="#F9F9F6" padding="24px 32px 16px">
  <mj-column>
    <mj-text align="center" padding="0">
      <a href="https://www.hitpayapp.com" style="display:inline-block;vertical-align:middle;margin-right:14px;"><img src="img/logogram.png" width="24" height="24" alt="HitPay" style="display:inline-block;border-radius:50%;vertical-align:middle;" /></a><a href="https://www.instagram.com/hitpayapp" style="display:inline-block;vertical-align:middle;margin:0 3px;"><img src="img/icon-instagram.png" width="24" height="24" alt="Instagram" style="display:inline-block;border-radius:50%;vertical-align:middle;" /></a><a href="https://www.facebook.com/hitpayapp" style="display:inline-block;vertical-align:middle;margin:0 3px;"><img src="img/icon-facebook.png" width="24" height="24" alt="Facebook" style="display:inline-block;border-radius:50%;vertical-align:middle;" /></a><a href="https://www.linkedin.com/company/hit-pay/" style="display:inline-block;vertical-align:middle;margin:0 3px;"><img src="img/icon-linkedin.png" width="24" height="24" alt="LinkedIn" style="display:inline-block;border-radius:50%;vertical-align:middle;" /></a><a href="https://www.tiktok.com/@hitpayapp" style="display:inline-block;vertical-align:middle;margin:0 3px;"><img src="img/icon-tiktok.png" width="24" height="24" alt="TikTok" style="display:inline-block;border-radius:50%;vertical-align:middle;" /></a><a href="https://www.youtube.com/@hitpayapp" style="display:inline-block;vertical-align:middle;margin:0 3px;"><img src="img/icon-youtube.png" width="24" height="24" alt="YouTube" style="display:inline-block;border-radius:50%;vertical-align:middle;" /></a>
    </mj-text>
  </mj-column>
</mj-section>

<!-- Footer: banner -->
<mj-section background-color="#F9F9F6" padding="0">
  <mj-column padding="0">
    <mj-image src="img/footer-banner.png" alt="HitPay products" width="600px" padding="0" />
  </mj-column>
</mj-section>

<!-- Footer: legal + unsubscribe -->
<mj-section background-color="#F9F9F6" padding="12px 32px 24px">
  <mj-column>
    <mj-divider border-color="#D4D9E0" border-width="1px" padding="0 0 12px" />
    <mj-text align="center" font-size="11px" color="#9295A5" line-height="16px" padding="0 0 4px">HitPay Payment Solutions Pte Ltd</mj-text>
    <mj-text align="center" font-size="9px" color="#D4D9E0" line-height="14px" padding="0"><a href="{unsubscribe_link}" style="color:#D4D9E0;text-decoration:none;font-size:9px;">Unsubscribe</a></mj-text>
  </mj-column>
</mj-section>
```
