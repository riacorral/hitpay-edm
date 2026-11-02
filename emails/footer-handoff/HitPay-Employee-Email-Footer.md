# HitPay employee email footer

The footer for HitPay staff emails. Separate from the EDM footer in `HitPay-EDM-footer.md`.

A rounded card with the HitPay logo on the left, a thin divider, then the title and subtitle. A navy bar underneath carries the award line.

| Part | Text | Font |
|---|---|---|
| Title | One platform to get paid and run your finances | MD Nichrome |
| Subtitle | Empowering 20,000+ businesses across Asia Pacific | Hauora |
| Bar | World's Top Fintech Companies 2026 by CNBC with Statista (CNBC and Statista as white logos) | Hauora |

The text is part of the images, so the fonts look the same in every email app.

## Files

| File | Use |
|---|---|
| `signature/hitpay-footer-680.png` | The signature image (680px wide, shown at about 340px so it stays sharp on retina) |
| `signature/hitpay-footer-340.png` | Same image at 340px |
| `signature/hitpay-footer-1260.png` | Full-size master (1300px wide) |
| `signature/signature.html` | Page to copy the footer from into Gmail (Settings > Signature) |
| `employee-footer-img/footer-card.png` | Card only (for the HTML version) |
| `employee-footer-img/bar-navy.png` | Bar only (for the HTML version) |
| `employee-footer.html` | Card + bar as HTML, for pasting into an email tool |

## Size

Displays at 340 to 400px wide and scales down on small phones (max-width 100%).

## Colors

- Logo Blue `#0E2859` for the title and the bar
- Divider `#9FB8DB`
- Card gradient: soft cream with yellow (top right) and light blue (bottom right), as in the EDM footer banner

## Setup

Email tools need images at a public URL. Replace `https://YOUR-HOSTED-URL/` in the HTML with where `footer-card.png` and `bar-navy.png` are uploaded. For a Gmail signature, copy it from `signature/signature.html` or upload `hitpay-footer-680.png` with the Insert image button.

Note: MD Nichrome here is the Trial version. Check the licence covers this use before wide rollout.

## HTML

```html
<table width="400" cellpadding="0" cellspacing="0" border="0" style="width:400px;max-width:100%;border-collapse:collapse;">
  <tr><td><a href="https://www.hitpayapp.com" style="text-decoration:none;"><img src="https://YOUR-HOSTED-URL/footer-card.png" width="400" alt="HitPay. One platform to get paid and run your finances. Empowering 20,000+ businesses across Asia Pacific." style="display:block;width:400px;max-width:100%;height:auto;border:0;border-radius:14px 14px 0 0;" /></a></td></tr>
  <tr><td><img src="https://YOUR-HOSTED-URL/bar-navy.png" width="400" alt="World's Top Fintech Companies 2026 by CNBC with Statista" style="display:block;width:400px;max-width:100%;height:auto;border:0;border-radius:0 0 14px 14px;" /></td></tr>
</table>
```
