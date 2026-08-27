"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ShoppingBag, GraduationCap, UtensilsCrossed, Dumbbell, Sparkles, HeartHandshake,
  Store, Plane, Scale, Network, FileText, Printer, Save, FolderOpen, X, Check,
  RotateCcw, Info, Trash2, Mail, Phone, Globe, ExternalLink, ChevronDown, CreditCard, Volume2,
  Smartphone, Tablet, Monitor
} from "lucide-react";

// Consistent device icons for every hardware line item
const HW_ICON = {
  terminal: CreditCard, soundbox: Volume2, ttp: Smartphone,
  wisepad: CreditCard, flexipos: Tablet, allinone: Tablet, posmax: Monitor,
};

// Brand logos (from HitPay's payment-logo set) shown next to each method in the pricing table
const METHOD_LOGOS = {
  card: ["visa", "master", "american_express"], card_ip: ["visa", "master", "american_express"],
  intlcard: ["visa", "master", "american_express"], intlcard_ip: ["visa", "master", "american_express"],
  gcash: ["gcash"], gcash_ip: ["gcash"],
  qrph: ["qrph"], qrph_ip: ["qrph"],
  paynow: ["paynow"], paynow_ip: ["paynow"],
  grabpay: ["grabpay"], grabpay_ip: ["grabpay"],
  shopeepay: ["shopeepay"], shopeepay_ip: ["shopeepay"],
  wechat: ["wechatpay"], wechat_ip: ["wechatpay"],
  billease: ["billease"], unionbank: ["ubp"], atome: ["atome"],
  fpx: ["fpx"], tng: ["touchngo"], tng_ip: ["touchngo"],
  maybankqr: ["maybankqrpay"], alipay: ["alipay"],
};

// ---- HitPay brand tokens (official brand guidelines,blue-led) ----
const COLORS = {
  navy: "#0E2859",      // Dark Blue,logo, headers
  navyDeep: "#002771",  // Blue 800,deepest bg, gradient start
  blue: "#2465DE",      // Action Blue,links, highlights, recommended states
  blueSoft: "#E5EEFF",  // Blue 50,accent tint backgrounds
  ice: "#D6EFFF",       // brand light-gradient stop,header tint
  paper: "#F9F9F6",     // Beige,document background
  panel: "#EFEFEA",     // zebra row / soft section background (warm neutral)
  line: "#E3E8F0",
  slate: "#5B6472",
};

// Homepage-matched hero wash (hitpayapp.com): a near-white field with delicate
// pale-blue glows (top-left + right) and a faint warm glow lower-left,subtle,
// not a heavy blue→cream sweep. Layered radial gradients over a near-white base.
// Homepage-matched hero wash: soft blue (top) -> near-white -> warm cream
// (lower-left), per hitpayapp.com. Opaque stops (no alpha) so print-to-PDF
// renders it faithfully instead of Chromium's transparent-gradient pink bug.
const HEADER_GRADIENT = "linear-gradient(160deg, #E3EDFA 0%, #EFF4FB 40%, #F9F9F2 68%, #FAF5E2 100%)";
const PRIMARY_GRADIENT = `linear-gradient(135deg, ${COLORS.navyDeep}, ${COLORS.blue})`;
// hitpayapp.com sets big display headlines in near-black, reserving navy for
// the logo/wordmark. INK gives the proposal the same near-black display voice.
const INK = "#03102F";

// ---- Verified HitPay pricing per market (official /ph /sg /my pricing pages) ----
// HitPay tools (Payment Links, POS, Invoicing, Online Store) are free; merchants
// pay only the per-transaction fee, so there are no software add-on surcharges.
const COUNTRIES = {
  ph: {
    label: "Philippines", currency: "₱",
    online: [
      { id: "card", label: "Local Cards (Visa/Mastercard)", rate: "3% + ₱15" },
      { id: "intlcard", label: "International Cards", rate: "4% + ₱15" },
      { id: "gcash", label: "GCash", rate: "2.3%" },
      { id: "qrph", label: "QRPh", rate: "1% or ₱20 (higher)" },
      { id: "grabpay", label: "GrabPay", rate: "2.2%" },
      { id: "shopeepay", label: "ShopeePay", rate: "2.5%" },
      { id: "billease", label: "BillEase", rate: "1.5%" },
      { id: "unionbank", label: "UnionBank Online", rate: "1% or ₱20 (higher)" },
      { id: "instapay", label: "InstaPay", rate: "1.5% or ₱35 (higher)" },
      { id: "pesonet", label: "PESONet", rate: "1.5% or ₱35 (higher)" },
      { id: "otc", label: "Over-the-Counter", rate: "1.5% or ₱30 (higher)" },
      { id: "wechat", label: "WeChat Pay", rate: "1.5%" },
    ],
    inperson: [
      { id: "card_ip", label: "Domestic Cards", rate: "3%" },
      { id: "intlcard_ip", label: "International Cards", rate: "4%" },
      { id: "qrph_ip", label: "QRPh", rate: "1% or ₱20 (higher)" },
      { id: "gcash_ip", label: "GCash", rate: "2%" },
      { id: "wechat_ip", label: "WeChat Pay", rate: "1.5%" },
    ],
    crossborder: [
      { id: "xb_sg", label: "Singapore (SGD)", rate: "0.65%–0.9%" },
      { id: "xb_my", label: "Malaysia (MYR)", rate: "1.9%–2.3%" },
      { id: "xb_th", label: "Thailand (THB)", rate: "2.5%–3.4%" },
      { id: "xb_id", label: "Indonesia (IDR)", rate: "2%" },
    ],
    hardware: [
      { id: "terminal", label: "HitPay All-in-One Terminal", rate: "₱10,500 (one-time)" },
      { id: "soundbox", label: "HitPay SoundBox", rate: "₱2,500 (one-time)" },
    ],
    payouts: { nonCard: "T+1", onlineCards: "T+7", inpersonCards: "T+2" },
    tapToPay: false, recurringCards: false,
    core: { online: ["card", "gcash", "qrph"], inperson: ["card_ip", "gcash_ip", "qrph_ip"] },
  },
  sg: {
    label: "Singapore", currency: "S$",
    online: [
      { id: "paynow", label: "PayNow", rate: "0.65% + S$0.30" },
      { id: "card", label: "Domestic Cards", rate: "2.8% + S$0.50" },
      { id: "intlcard", label: "International Cards", rate: "3.65% + S$0.50" },
      { id: "grabpay", label: "GrabPay", rate: "3%" },
      { id: "shopeepay", label: "ShopeePay", rate: "3%" },
      { id: "atome", label: "Atome", rate: "5.5%" },
      { id: "wechat", label: "WeChat Pay", rate: "1.5%" },
    ],
    inperson: [
      { id: "card_ip", label: "Domestic Cards", rate: "2.5% + S$0.50" },
      { id: "intlcard_ip", label: "International Cards", rate: "3.2% + S$0.50" },
      { id: "paynow_ip", label: "PayNow", rate: "0.4%" },
      { id: "grabpay_ip", label: "GrabPay", rate: "2.2%" },
      { id: "shopeepay_ip", label: "ShopeePay", rate: "1.8%" },
      { id: "wechat_ip", label: "WeChat Pay", rate: "1.5%" },
    ],
    crossborder: [
      { id: "xb_my", label: "Malaysia (DuitNow)", rate: "2.3%" },
      { id: "xb_ph", label: "Philippines (QR / GCash)", rate: "1%–2.3%" },
      { id: "xb_th", label: "Thailand", rate: "2.5%" },
      { id: "xb_id", label: "Indonesia (QRIS)", rate: "2%" },
    ],
    hardware: [
      { id: "ttp", label: "Tap to Pay on iPhone", rate: "Free" },
      { id: "soundbox", label: "HitPay SoundBox", rate: "S$30 (one-time)" },
      { id: "wisepad", label: "WisePad 3", rate: "S$85 (one-time)" },
      { id: "flexipos", label: "FlexiPOS", rate: "S$500 (one-time)" },
      { id: "allinone", label: "HitPay All-in-One", rate: "S$680 (one-time)" },
      { id: "posmax", label: "HitPay POS MAX", rate: "S$700 (one-time)" },
    ],
    payouts: { nonCard: "T+1", onlineCards: "T+1", inpersonCards: "T+1" },
    tapToPay: true, recurringCards: true,
    core: { online: ["paynow", "card"], inperson: ["card_ip", "paynow_ip"] },
  },
  my: {
    label: "Malaysia", currency: "RM",
    online: [
      { id: "card", label: "Domestic Cards", rate: "1.2% + RM1" },
      { id: "intlcard", label: "International Cards", rate: "3% + RM1" },
      { id: "duitnow", label: "DuitNow", rate: "1.2%" },
      { id: "fpx", label: "FPX", rate: "1.8% + RM0.40" },
      { id: "tng", label: "Touch 'n Go", rate: "1.9%" },
      { id: "grabpay", label: "GrabPay", rate: "2%" },
      { id: "shopeepay", label: "ShopeePay", rate: "2.2%" },
      { id: "maybankqr", label: "Maybank QRPay", rate: "2.1%" },
      { id: "alipay", label: "Alipay+", rate: "2.7%" },
      { id: "wechat", label: "WeChat Pay", rate: "1.5%" },
    ],
    inperson: [
      { id: "card_ip", label: "Domestic Cards", rate: "1.2% + RM1" },
      { id: "intlcard_ip", label: "International Cards", rate: "3% + RM1" },
      { id: "duitnow_ip", label: "DuitNow", rate: "1.2%" },
      { id: "tng_ip", label: "Touch 'n Go", rate: "1.6%" },
      { id: "grabpay_ip", label: "GrabPay", rate: "2%" },
      { id: "shopeepay_ip", label: "ShopeePay", rate: "2%" },
      { id: "wechat_ip", label: "WeChat Pay", rate: "1.5%" },
    ],
    crossborder: [
      { id: "xb_sg", label: "Singapore (SGD)", rate: "0.65%–0.9%" },
      { id: "xb_ph", label: "Philippines (PHP)", rate: "1%–2.3%" },
      { id: "xb_th", label: "Thailand (THB)", rate: "2.5%–3.4%" },
      { id: "xb_id", label: "Indonesia (IDR)", rate: "2%" },
    ],
    hardware: [
      { id: "ttp", label: "Tap to Pay (app)", rate: "Free" },
      { id: "wisepad", label: "WisePad 3", rate: "RM310 (one-time)" },
      { id: "allinone", label: "HitPay All-in-One", rate: "RM850 (one-time)" },
      { id: "flexipos", label: "FlexiPOS", rate: "RM1,750 (one-time)" },
    ],
    payouts: { nonCard: "T+2", onlineCards: "T+1", inpersonCards: "T+1" },
    tapToPay: true, recurringCards: true,
    core: { online: ["duitnow", "fpx", "card"], inperson: ["card_ip", "duitnow_ip"] },
  },
};

const COUNTRY_KEYS = Object.keys(COUNTRIES);
const GROUP_ORDER = ["online", "inperson", "crossborder", "hardware"];
const GROUP_LABELS = { online: "Online", inperson: "In-person", crossborder: "Cross-border", hardware: "Hardware" };

// Look up a rate item by id within the selected country
const rateFor = (countryKey, id) => {
  const c = COUNTRIES[countryKey] || COUNTRIES.ph;
  for (const g of GROUP_ORDER) {
    const hit = (c[g] || []).find((x) => x.id === id);
    if (hit) return hit;
  }
  return null;
};

// Where the "Book a call" button points when no custom link is set
const CONTACT_URL = "https://www.hitpayapp.com/contact-us";

const VERTICALS = {
  ecommerce: {
    label: "Ecommerce", icon: ShoppingBag,
    summary: "This proposal outlines how HitPay's Online Store, Payment Links, and ecommerce plugins can power {merchantName}'s checkout, with lower fees on local payment methods than most alternatives.",
    props: [
      "Launch a hosted Online Store, or plug straight into Shopify, WooCommerce, Wix, or Xero",
      "Send Payment Links for orders taken over chat, social media, or phone",
      "Accept cards, local e-wallets, and QR in one checkout",
      "Accept international customers via Cross-Border Payments at lower fees than standard international cards",
      "Built-in fraud monitoring and dispute management at no extra cost",
      "One dashboard to reconcile online and marketplace sales",
    ],
    methods: { online: ["card", "gcash", "qrph"], inperson: [], addons: ["links", "store"] },
  },
  education: {
    label: "Educational Services", icon: GraduationCap,
    summary: "This proposal outlines how HitPay's Invoicing and Payment Links can simplify tuition, module fees, and installment collection for {merchantName}.",
    props: [
      "Send Invoices for tuition and one-off fees with automatic payment tracking",
      "Collect installments and module fees through Payment Links",
      "Accept cards, local e-wallets, and QR so parents and students can pay whichever way is convenient",
      "No setup fees or monthly fees, pay only when a payment goes through",
      "Payment Links for enrollment fees, activities, or field trip collections",
      "Clean transaction records that simplify reconciliation with the registrar's office",
    ],
    methods: { online: ["card", "gcash", "qrph"], inperson: [], addons: ["invoice"] },
  },
  fnb: {
    label: "F&B", icon: UtensilsCrossed,
    summary: "This proposal outlines how HitPay's Point of Sale and Static QR can speed up payment collection at the counter and across branches for {merchantName}.",
    props: [
      "Accept {tapToPay}cards, local e-wallets, and QR at the counter with HitPay POS",
      "Static QR at tables or counters for fast, contactless payment",
      "Send Payment Links for delivery, pre-orders, or catering deposits",
      "Consolidated reporting across every branch in one dashboard",
      "HitPay SoundBox gives instant audio payment confirmation at busy counters",
      "Fast settlement on non-card payments to support daily cash flow",
    ],
    methods: { online: ["card", "gcash"], inperson: ["card_ip", "gcash_ip", "qrph_ip"], addons: ["pos", "links"] },
  },
  fitness: {
    label: "Fitness & Gym", icon: Dumbbell,
    summary: "This proposal outlines how HitPay's Payment Links and Invoicing can simplify membership and class payments for {merchantName}.",
    props: [
      "Sell memberships, class packs, and day passes through Payment Links",
      "Set up recurring billing{recurringVia} for monthly memberships",
      "Accept {tapToPay}cards, local e-wallets, and QR at the front desk",
      "One dashboard for online sign-ups and in-person payments",
      "Send Invoices for corporate or bulk membership deals",
      "No lock-in contracts, adjust or cancel plans anytime with no penalty",
    ],
    methods: { online: ["card", "gcash"], inperson: ["card_ip", "gcash_ip"], addons: ["links"] },
  },
  beauty: {
    label: "Health, Beauty & Spa", icon: Sparkles,
    summary: "This proposal outlines how HitPay can simplify appointment deposits, packages, and in-store payments for {merchantName}.",
    props: [
      "Collect appointment deposits or package payments via Payment Links",
      "Set up recurring billing{recurringVia} for membership or subscription packages",
      "Accept {tapToPay}cards, local e-wallets, and QR in-store",
      "Send Invoices for larger treatment packages",
      "Reduce no-shows by collecting a deposit upfront before the appointment",
      "Fraud monitoring and dispute handling fully covered, so you are not chasing chargebacks",
    ],
    methods: { online: ["card", "gcash"], inperson: ["card_ip", "gcash_ip"], addons: ["links"] },
  },
  nonprofit: {
    label: "Non-Profit & Donations", icon: HeartHandshake,
    summary: "This proposal outlines how HitPay can help {merchantName} collect donations online and on-site, with no setup or monthly fees eating into funds raised.",
    props: [
      "Static QR and Payment Links make on-site and social media giving effortless",
      "Recurring giving{recurringVia} for monthly donors",
      "No setup fees or monthly fees, more of every donation goes to your cause",
      "Accept cards, local e-wallets, and QR from individual donors",
      "Transparent, exportable transaction records for donor reporting and audits",
      "No extra fees on refunds if a donor ever needs to reverse a gift",
    ],
    methods: { online: ["card", "gcash", "qrph"], inperson: [], addons: ["links"] },
  },
  retail: {
    label: "Retail", icon: Store,
    summary: "This proposal outlines how HitPay's Point of Sale and Online Store give {merchantName} one consistent system across every till and channel.",
    props: [
      "Accept {tapToPay}cards, local e-wallets, and QR at every till with HitPay POS",
      "Sync in-store and online sales through Shopify, WooCommerce, or Wix",
      "Static QR for quick self-checkout at any counter",
      "Multi-branch reporting without separate merchant accounts",
      "HitPay SoundBox gives instant audio confirmation on the sales floor",
      "One processing partner across every branch, so onboarding new stores is fast",
    ],
    methods: { online: ["card", "gcash"], inperson: ["card_ip", "gcash_ip", "qrph_ip"], addons: ["pos", "store"] },
  },
  travel: {
    label: "Travel, Agencies & Tour Operators", icon: Plane,
    summary: "This proposal outlines how HitPay's Invoicing and Cross-Border Payments can simplify bookings and deposits for {merchantName}'s local and international customers.",
    props: [
      "Send Invoices for tour packages and bookings with automatic tracking",
      "Collect deposits and installments via Payment Links",
      "Accept Cross-Border Payments from international travelers at lower fees than standard international cards",
      "Accept cards, local e-wallets, and QR for local customers",
      "Mid-market FX rates on cross-border transactions, with no markup passed to your guest",
      "Lower chargeback and dispute risk versus accepting raw international card payments",
    ],
    methods: { online: ["card", "intlcard", "gcash", "qrph"], inperson: [], addons: ["invoice"] },
  },
  law: {
    label: "Law Firm & Professional Services", icon: Scale,
    summary: "This proposal outlines a simpler way for {merchantName} to collect retainers, billables, and professional fees, without chasing bank transfers or manual receipts.",
    props: [
      "Send secure Payment Links for retainers and billables",
      "Use Invoicing for professional fees with automatic receipts",
      "No physical terminal needed, fully remote-friendly",
      "Clean, exportable transaction records for bookkeeping and audit",
      "PCI DSS certified, so client payment data stays secure",
      "No setup or monthly fees, well suited to firms with variable monthly billing volume",
    ],
    methods: { online: ["card", "gcash"], inperson: [], addons: ["links", "invoice"] },
  },
  franchise: {
    label: "Franchise & Multi-location", icon: Network,
    summary: "This proposal outlines how HitPay gives {merchantName} one consistent payment system across every franchise location, with centralized reporting.",
    props: [
      "Standardize payment acceptance with HitPay POS across every location",
      "Centralized reporting with location-level breakdowns",
      "Static QR and contactless cards for fast counter transactions",
      "Simple onboarding for new franchise locations",
      "One processing partner instead of negotiating separate merchant accounts per branch",
      "Consistent settlement schedule across all locations for predictable cash flow",
    ],
    methods: { online: ["card", "gcash"], inperson: ["card_ip", "gcash_ip"], addons: ["pos"] },
  },
  custom: {
    label: "Custom / Other", icon: FileText,
    summary: "This proposal outlines how HitPay can simplify payment collection for {merchantName}, tailored to your specific operations.",
    props: [
      "Accept cards, e-wallets, and bank transfers in one integration",
      "Payment Links, QR, or terminal, whichever fits your workflow",
      "No setup fees or monthly fees, pay only per transaction",
      "One dashboard for all transactions and reporting",
      "Built-in fraud monitoring and dispute management at no extra cost",
      "PCI DSS certified for peace of mind",
    ],
    methods: { online: ["card", "gcash"], inperson: [], addons: [] },
  },
};

const todayStr = () => new Date().toISOString().slice(0, 10);
const fmtDate = (s) => {
  if (!s) return "";
  const d = new Date(s + "T00:00:00");
  if (isNaN(d)) return s;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};
const slugify = (s) => (s || "untitled").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// ---- Draft storage: localStorage (keys prefixed "proposal:") ----
const STORE_PREFIX = "proposal:";
const draftStore = {
  list: () => {
    try {
      return Object.keys(localStorage).filter((k) => k.startsWith(STORE_PREFIX)).sort();
    } catch (e) { return []; }
  },
  get: (key) => {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  },
  set: (key, value) => {
    try { localStorage.setItem(key, value); return true; } catch (e) { return false; }
  },
  del: (key) => {
    try { localStorage.removeItem(key); return true; } catch (e) { return false; }
  },
};

const defaultForm = () => ({
  merchantName: "", contactPerson: "", contactEmail: "",
  preparedBy: "", preparedByRole: "Growth and Partnership Manager", preparedByPhone: "",
  proposalDate: todayStr(), validityDays: "14",
  country: "ph",
  vertical: "fnb",
  headline: "A faster way for {merchantName} to get paid.",
  summary: VERTICALS.fnb.summary,
  props: [...VERTICALS.fnb.props],
  perks: "",
  bookingLink: "",
});
// Default method selection for a vertical + country: the vertical's channels
// (inferred from its template) applied to the country's core methods.
const methodsFromVertical = (vKey, cKey = "ph") => {
  const m = VERTICALS[vKey].methods || {};
  const c = COUNTRIES[cKey] || COUNTRIES.ph;
  const wantOnline = (m.online || []).length > 0;
  const wantInperson = (m.inperson || []).length > 0;
  return {
    online: wantOnline ? [...(c.core.online || [])] : [],
    inperson: wantInperson ? [...(c.core.inperson || [])] : [],
    crossborder: vKey === "travel" ? (c.crossborder || []).map((x) => x.id) : [],
    hardware: wantInperson && c.tapToPay && (c.hardware || []).some((h) => h.id === "ttp") ? ["ttp"] : [],
    customPricing: false,
  };
};

// ---- Real HitPay logo mark, traced from brand SVG ----
const HitPayLogo = ({ height = 30, color = COLORS.navy }) => (
  <svg height={height} viewBox="0 0 200 50" xmlns="http://www.w3.org/2000/svg">
    <path d="M25.8084 0.639281C26.4473 0.712286 27.0884 0.761929 27.7229 0.858296C29.6368 1.14302 31.5258 1.55331 33.2989 2.33957C34.6489 2.93748 36.0062 3.55291 37.2622 4.32019C39.6374 5.77255 41.7364 7.63504 43.4617 9.82113C45.0769 11.8417 46.3635 14.1047 47.2741 16.5267C48.3835 19.4834 48.8648 22.5518 48.7759 25.7027C48.7048 28.6701 48.0773 31.5978 46.9262 34.3333C46.0251 36.4701 44.829 38.4697 43.3728 40.2738C41.9819 42.0055 40.3577 43.5357 38.5466 44.8205C36.6359 46.1782 34.5421 47.2573 32.3281 48.0254C27.2127 49.7951 21.6539 49.8071 16.5309 48.0597C14.9229 47.5121 13.3761 46.7987 11.9155 45.9309C10.3751 45.0067 8.90109 43.9715 7.64587 42.6734C6.68676 41.6813 5.72473 40.6782 4.88597 39.5868C4.11504 38.5822 3.47029 37.4733 2.83648 36.3745C1.94958 34.8334 1.33108 33.1703 0.861372 31.4591C0.453833 30.0219 0.189728 28.5478 0.0729359 27.0584C0.0583487 26.854 0.0240688 26.651 0 26.448V23.5286C0.0189633 23.4096 0.0481374 23.2913 0.0561604 23.1716C0.219537 20.7938 0.758533 18.5029 1.60459 16.2762C3.13452 12.3062 5.67382 8.80491 8.97111 6.11905C12.4207 3.30209 16.5732 1.48133 20.9807 0.853181C21.5912 0.762654 22.2075 0.707175 22.8216 0.63855L25.8084 0.639281ZM24.3759 2.38411C11.8455 2.38411 1.74171 12.526 1.74681 25.1274C1.75192 37.4769 11.8586 47.448 24.0608 47.5925C36.9602 47.7451 46.854 37.4959 47.0254 25.2026C47.2019 12.5194 36.7568 2.37462 24.3759 2.38411Z" fill={color}/>
    <path d="M3.49142 24.5594C3.4338 22.059 3.91882 19.6279 4.85605 17.2976C5.50419 15.7003 6.36271 14.197 7.4088 12.8275C8.63996 11.2009 10.0608 9.76929 11.6165 8.46104C12.1752 7.99161 12.7834 8.023 13.1299 8.54645C13.3487 8.88008 13.3312 9.22466 13.0402 9.49551C12.2634 10.2256 11.4524 10.9235 10.6975 11.6769C8.69466 13.675 7.18197 15.9842 6.24329 18.6723C5.40088 21.0814 5.1281 23.5541 5.29512 26.0918C5.41888 28.1545 5.85135 30.187 6.57806 32.1212C7.09607 33.482 7.78004 34.7735 8.61443 35.9664C9.52286 37.2547 10.5964 38.4178 11.8076 39.4261C12.9736 40.396 14.2388 41.2397 15.582 41.9434C16.9495 42.6734 18.3733 43.2472 19.8816 43.5969C23.0244 44.327 26.1672 44.3021 29.2903 43.4911C33.4179 42.3934 37.064 39.9537 39.6552 36.5556C41.1488 34.5764 42.2475 32.3277 42.8914 29.9326C43.3035 28.4177 43.3924 26.8715 43.5208 25.3252C43.5318 25.1916 43.5405 25.058 43.5646 24.9266C43.6681 24.3688 44.0088 24.0805 44.5091 24.1235C44.9883 24.163 45.2961 24.4966 45.2778 25.0558C45.2523 25.8194 45.1925 26.5831 45.113 27.3438C44.8672 29.7753 44.2045 32.1462 43.1539 34.3523C42.4439 35.8299 41.5422 37.2072 40.4721 38.4486C38.9098 40.2781 37.0514 41.7441 34.9895 42.9516C32.1093 44.6394 29 45.6418 25.6625 45.8718C23.354 46.0287 21.0835 45.7601 18.8495 45.1497C17.4382 44.7643 16.0656 44.2686 14.7892 43.5699C13.6879 42.9676 12.6449 42.25 11.6121 41.5323C10.3904 40.6833 9.35546 39.6211 8.39417 38.4909C7.37164 37.2903 6.49672 35.9711 5.78817 34.5618C5.06683 33.1441 4.51503 31.6461 4.14419 30.099C3.71679 28.2863 3.45276 26.4488 3.49142 24.5594Z" fill={color}/>
    <path d="M8.72947 25.0843C8.68206 27.2014 9.16709 29.3047 10.0584 31.3138C10.927 33.2708 12.1871 35.0289 13.7609 36.4796C15.3347 37.9302 17.1889 39.0426 19.2089 39.7481C19.4041 39.8153 19.59 39.9068 19.7625 40.0204C20.0907 40.2394 20.1848 40.6132 20.0447 41.0249C19.9288 41.3644 19.6385 41.5937 19.2563 41.5309C18.8266 41.4609 18.4065 41.3409 18.0047 41.1731C16.2404 40.4314 14.5884 39.4882 13.1027 38.277C11.8167 37.2432 10.7038 36.0104 9.80601 34.6253C7.70472 31.3481 6.84116 27.7453 7.00746 23.8848C7.10227 21.6903 7.67044 19.6082 8.59819 17.6137C9.59047 15.4702 11.0163 13.556 12.7854 11.9923C13.9748 10.9363 15.3038 10.0492 16.7349 9.35608C18.9077 8.2975 21.1949 7.75726 23.5996 7.61636C25.555 7.50101 27.4463 7.81274 29.3156 8.32597C31.82 9.00847 34.1243 10.2823 36.0352 12.0405C37.6835 13.5535 39.0456 15.3517 40.0562 17.3487C40.399 18.0174 40.1502 18.4357 39.6557 18.6927C39.2181 18.919 38.7484 18.6861 38.499 18.1729C37.5238 16.1682 36.1555 14.4715 34.4663 13.0253C32.4817 11.3069 30.078 10.145 27.4995 9.65758C24.628 9.10712 21.7894 9.27942 19.0309 10.2825C16.9347 11.0333 15.0247 12.2272 13.4307 13.783C11.8367 15.3388 10.5962 17.22 9.79361 19.2986C9.06399 21.1389 8.70244 23.1046 8.72947 25.0843V25.0843Z" fill={color}/>
    <path d="M31.2345 33.7019H29.1704V26.6204H21.2314V33.6975H19.1812V17.9722H21.219V24.9362H29.1624V17.9525C29.8188 17.9525 30.4461 17.9474 31.0741 17.9605C31.1346 17.9605 31.2199 18.0679 31.2447 18.1409C31.2632 18.2484 31.2666 18.358 31.255 18.4665C31.255 23.3855 31.255 28.3044 31.255 33.223C31.2542 33.377 31.2418 33.5303 31.2345 33.7019Z" fill={color}/>
    <path d="M70.364 27.0754V38.9292H64.7997C64.7939 38.7949 64.7822 38.6664 64.7822 38.5379C64.7822 29.5855 64.7798 20.6327 64.7749 11.6793C64.7749 11.3347 64.8588 11.223 65.2169 11.2274C66.7962 11.2459 68.3765 11.2459 69.9577 11.2274C70.2735 11.2274 70.3698 11.3055 70.3684 11.6326C70.3567 15.1916 70.3611 18.7513 70.3611 22.3103V22.779C70.5317 22.787 70.674 22.7987 70.8155 22.7987C74.4965 22.7987 78.182 22.7987 81.8594 22.8075C82.2131 22.8075 82.305 22.7082 82.3043 22.3592C82.2919 18.8126 82.2963 15.2653 82.297 11.718C82.297 11.2362 82.297 11.2347 82.7726 11.2347C84.3516 11.2347 85.9314 11.2435 87.5134 11.2274C87.8394 11.2274 87.9189 11.3245 87.9189 11.6414C87.9111 20.6185 87.9089 29.5957 87.9123 38.5729V38.9219H82.2963V27.5718C82.2963 27.0754 82.2963 27.0754 81.8054 27.0754H70.364V27.0754Z" fill={color}/>
    <path d="M166.224 20.2617C166.233 20.0617 166.244 19.9463 166.244 19.831C166.244 18.9688 166.25 18.1059 166.244 17.2437C166.244 17.0298 166.302 16.9414 166.531 16.9422C168.208 16.9495 169.886 16.9495 171.564 16.9422C171.782 16.9422 171.882 17.0101 171.863 17.2342C171.854 17.3306 171.863 17.4284 171.863 17.5262V38.9291H166.255V35.4752C165.724 36.0724 165.242 36.6762 164.695 37.2135C163.296 38.5889 161.569 39.2124 159.632 39.2868C158.208 39.3488 156.787 39.1072 155.463 38.578C153.818 37.9209 152.473 36.8521 151.368 35.4665C149.38 32.9726 148.811 30.0824 148.975 26.9877C149.044 25.6853 149.267 24.412 149.753 23.1914C150.246 21.9364 150.97 20.7846 151.886 19.7952C153.039 18.5446 154.413 17.6365 156.031 17.1429C158.122 16.5056 160.246 16.4275 162.337 17.1254C163.917 17.6525 165.137 18.6958 166.087 20.0573L166.224 20.2617ZM166.274 28.0003C166.236 27.5294 166.212 27.0563 166.158 26.5869C165.884 24.1777 163.964 22.0766 161.591 21.6225C160.051 21.3261 158.591 21.5546 157.277 22.4548C155.933 23.3747 155.076 24.6238 154.797 26.2437C154.354 28.8369 154.693 31.2008 156.794 33.0515C157.671 33.8335 158.777 34.3108 159.947 34.4123C161.289 34.54 162.526 34.1984 163.635 33.4355C164.405 32.9198 165.04 32.2259 165.486 31.4125C166.06 30.351 166.274 29.2019 166.274 28.001V28.0003Z" fill={color}/>
    <path d="M130.858 27.9331V38.9189H125.187V38.5327C125.187 29.5823 125.185 20.6313 125.181 11.6799C125.181 11.3361 125.264 11.2258 125.618 11.2273C128.901 11.2405 132.178 11.22 135.457 11.2412C137.29 11.2529 139.089 11.4952 140.782 12.2632C141.708 12.6912 142.545 13.2912 143.248 14.0314C144.042 14.8505 144.689 15.7763 145.042 16.864C145.698 18.8855 145.553 20.8793 144.731 22.8337C144.293 23.8791 143.688 24.8201 142.851 25.5662C142.271 26.0787 141.623 26.5095 140.926 26.8467C139.317 27.6279 137.578 27.9009 135.802 27.9272C134.296 27.9499 132.789 27.9316 131.28 27.9323L130.858 27.9331ZM130.858 23.5674C130.919 23.5951 130.941 23.6133 130.962 23.6133C132.746 23.5987 134.536 23.6623 136.31 23.5447C138.21 23.4184 139.459 22.1642 139.71 20.2923C140.04 17.8313 138.736 15.7032 136.052 15.6003C134.368 15.5361 132.679 15.5755 130.992 15.5704C130.945 15.5792 130.9 15.5957 130.858 15.6193V23.5674Z" fill={color}/>
    <path d="M180.404 49.3324C181.44 46.9087 182.462 44.5258 183.476 42.14C183.95 41.0244 184.415 39.905 184.869 38.7817C184.925 38.6265 184.925 38.4566 184.869 38.3013C184.162 36.5091 183.437 34.7241 182.722 32.9347C182.205 31.6404 181.701 30.3409 181.182 29.0472C180.335 26.9301 179.476 24.8202 178.629 22.7045C178.13 21.4554 177.649 20.199 177.154 18.9484C176.901 18.3074 176.635 17.6716 176.352 16.9773C176.498 16.9627 176.6 16.9437 176.7 16.9437C178.571 16.9437 180.442 16.9437 182.317 16.9386C182.535 16.9386 182.652 16.9853 182.734 17.2218C183.281 18.79 183.849 20.3508 184.412 21.9124C185.063 23.7135 185.725 25.5116 186.369 27.3148C186.906 28.8092 187.43 30.308 187.963 31.8032C188.036 32.0171 188.135 32.2244 188.255 32.5113C188.441 32.0485 188.602 31.6666 188.748 31.279C189.268 29.8919 189.778 28.5048 190.302 27.1228C190.997 25.2867 191.703 23.455 192.403 21.6204C192.968 20.1369 193.527 18.6506 194.1 17.1671C194.137 17.0715 194.274 16.9481 194.366 16.9481C196.2 16.9364 198.034 16.9408 199.869 16.9437C199.914 16.9539 199.958 16.9701 200 16.9919C199.946 17.1423 199.902 17.2898 199.843 17.4299C199.272 18.7815 198.7 20.1321 198.125 21.4817C197.435 23.0966 196.733 24.7078 196.047 26.3249C194.977 28.8465 193.918 31.3724 192.85 33.8948C191.872 36.2051 190.891 38.5143 189.908 40.8222C189.032 42.8737 188.157 44.9241 187.282 46.9736C186.99 47.665 186.698 48.3607 186.415 49.055C186.343 49.2324 186.27 49.3623 186.033 49.3616C184.21 49.3514 182.387 49.3558 180.563 49.3543C180.51 49.3504 180.457 49.3431 180.404 49.3324Z" fill={color}/>
    <path d="M119.081 16.943V17.4219C119.081 18.6362 119.081 19.8505 119.081 21.0648C119.081 21.5452 119.081 21.5459 118.615 21.5459C117.291 21.5459 115.967 21.5459 114.643 21.5459H114.173C114.165 21.7043 114.152 21.8321 114.152 21.9599C114.152 25.397 114.142 28.834 114.163 32.2711C114.166 32.6913 114.256 33.1062 114.428 33.4896C114.684 34.0466 115.252 34.1853 115.809 34.2109C116.767 34.2547 117.726 34.2693 118.685 34.2627C119.037 34.2627 119.14 34.3671 119.135 34.7168C119.117 35.9915 119.129 37.2668 119.127 38.5422C119.127 38.6612 119.116 38.7795 119.11 38.8825C119.066 38.9102 119.046 38.9336 119.027 38.9336C117.195 38.9277 115.357 39.0737 113.535 38.7912C112.096 38.5678 110.808 38.0137 109.832 36.8836C109.188 36.1367 108.843 35.2432 108.712 34.2795C108.597 33.5001 108.533 32.7142 108.519 31.9265C108.498 28.6355 108.51 25.3444 108.51 22.0533V21.5423C107.835 21.5423 107.205 21.5248 106.577 21.5496C106.242 21.5627 106.147 21.4605 106.152 21.1232C106.172 19.7515 106.16 18.3797 106.16 16.9619H108.498V11.5596H114.14V16.9422L119.081 16.943Z" fill={color}/>
    <path d="M100.785 38.9342H95.2423V16.975H100.785V38.9342Z" fill={color}/>
    <path d="M97.9822 14.7637C96.0289 14.7637 94.6271 13.3087 94.6111 11.3325C94.5965 9.45623 96.1974 7.90122 98.0529 7.95086C99.9361 7.99978 101.396 9.47375 101.408 11.3821C101.423 13.2415 99.8595 14.8637 97.9822 14.7637Z" fill={color}/>
  </svg>
);

// @font-face block for the exported standalone HTML,points fonts back at the
// live site's /fonts directory so the downloaded proposal keeps brand typography.
const standaloneFontCSS = (origin) => `
  @font-face { font-family: 'MD Nichrome'; src: url('${origin}/fonts/MDNichromeTrial-Regular.otf') format('opentype'); font-weight: 400; font-display: swap; }
  @font-face { font-family: 'MD Nichrome'; src: url('${origin}/fonts/MDNichromeTrial-Dark.otf') format('opentype'); font-weight: 700; font-display: swap; }
  @font-face { font-family: 'Hauora'; src: url('${origin}/fonts/Hauora-Regular.woff2') format('woff2'); font-weight: 400; font-display: swap; }
  @font-face { font-family: 'Hauora'; src: url('${origin}/fonts/Hauora-Medium.woff2') format('woff2'); font-weight: 500; font-display: swap; }
  @font-face { font-family: 'Hauora'; src: url('${origin}/fonts/Hauora-SemiBold.woff2') format('woff2'); font-weight: 600; font-display: swap; }
  @font-face { font-family: 'Hauora'; src: url('${origin}/fonts/Hauora-Bold.woff2') format('woff2'); font-weight: 700; font-display: swap; }
`;

// Collapsible editor card. Module-level so inputs keep focus across re-renders.
function Section({ title, hint, open, onToggle, children }) {
  return (
    <div className="section-card">
      <button type="button" className="sec-head" onClick={onToggle}>
        <span className="field-label" style={{ margin: 0 }}>{title}{hint && <span style={{ textTransform: "none", fontWeight: 400 }}> {hint}</span>}</span>
        <ChevronDown size={15} style={{ color: COLORS.slate, transform: open ? "rotate(180deg)" : "none", transition: "transform .15s", flexShrink: 0 }} />
      </button>
      {open && <div style={{ marginTop: 10 }}>{children}</div>}
    </div>
  );
}

export default function ProposalGenerator() {
  const [form, setForm] = useState(defaultForm());
  const [sectionOpen, setSectionOpen] = useState({});
  const [aiInstruction, setAiInstruction] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [methods, setMethods] = useState(methodsFromVertical("fnb", "ph"));
  const [savedList, setSavedList] = useState([]);
  const [status, setStatus] = useState("");
  const [showLoad, setShowLoad] = useState(false);
  const [openGroups, setOpenGroups] = useState({});
  const paperRef = useRef(null);

  const toggleGroup = (k) => setOpenGroups((g) => ({ ...g, [k]: !g[k] }));
  const secOpen = (id, def = true) => (sectionOpen[id] === undefined ? def : sectionOpen[id]);
  const secToggle = (id, def = true) => setSectionOpen((s) => ({ ...s, [id]: !(s[id] === undefined ? def : s[id]) }));

  // Rewrite the proposal copy (headline, summary, value props) from a plain instruction
  const runAiEdit = async () => {
    if (!aiInstruction.trim() || aiBusy) return;
    setAiBusy(true);
    try {
      const res = await fetch("/api/proposals/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline: form.headline, summary: form.summary, props: form.props,
          instruction: aiInstruction,
          market: COUNTRIES[form.country].label, vertical: VERTICALS[form.vertical].label,
        }),
      });
      if (!res.ok) { flash(res.status === 401 ? "Sign in to use AI" : "AI edit unavailable"); setAiBusy(false); return; }
      const data = await res.json();
      setForm((f) => ({
        ...f,
        headline: typeof data.headline === "string" ? data.headline : f.headline,
        summary: typeof data.summary === "string" ? data.summary : f.summary,
        props: Array.isArray(data.props) && data.props.length ? data.props : f.props,
      }));
      flash("Copy updated by AI");
    } catch (e) { flash("AI edit failed"); }
    setAiBusy(false);
  };

  useEffect(() => {
    refreshList();
  }, []);


  const refreshList = useCallback(() => {
    setSavedList(draftStore.list());
  }, []);

  const flash = (msg) => { setStatus(msg); setTimeout(() => setStatus(""), 2200); };

  const updateField = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const updateProp = (i, val) => setForm((f) => { const props = [...f.props]; props[i] = val; return { ...f, props }; });
  const addProp = () => setForm((f) => ({ ...f, props: [...f.props, ""] }));
  const removeProp = (i) => setForm((f) => ({ ...f, props: f.props.filter((_, idx) => idx !== i) }));

  // Selecting a vertical instantly applies its template copy + pricing
  const selectVertical = (key) => {
    const t = VERTICALS[key];
    setForm((f) => ({ ...f, vertical: key, summary: t.summary, props: [...t.props] }));
    setMethods(methodsFromVertical(key, form.country));
    flash(`${t.label} template + pricing applied`);
  };

  // Switching country re-derives pricing + default methods for that market
  const selectCountry = (cKey) => {
    setForm((f) => ({ ...f, country: cKey }));
    setMethods(methodsFromVertical(form.vertical, cKey));
    flash(`${COUNTRIES[cKey].label} pricing applied`);
  };

  const toggleMethod = (group, id) => setMethods((m) => {
    const list = m[group];
    const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
    return { ...m, [group]: next };
  });
  const toggleCustomPricing = () => setMethods((m) => ({ ...m, customPricing: !m.customPricing }));

  const resetAll = () => {
    if (window.confirm("Start a new blank proposal? Unsaved changes will be lost.")) {
      setForm(defaultForm());
      setMethods(methodsFromVertical("fnb", "ph"));
    }
  };

  const saveProposal = () => {
    if (!form.merchantName.trim()) { flash("Add a merchant name before saving"); return; }
    const key = `${STORE_PREFIX}${slugify(form.merchantName)}`;
    if (draftStore.set(key, JSON.stringify({ form, methods }))) { flash("Saved"); refreshList(); }
    else { flash("Save failed"); }
  };

  const loadProposal = (key) => {
    const value = draftStore.get(key);
    if (value) {
      try {
        const data = JSON.parse(value);
        setForm(data.form || defaultForm());
        setMethods(data.methods || methodsFromVertical("fnb", "ph"));
        flash("Loaded");
      } catch (e) { flash("Could not load"); }
    }
    setShowLoad(false);
  };

  const deleteProposal = (key, e) => {
    e.stopPropagation();
    draftStore.del(key);
    refreshList();
  };

  const replaceTokens = (text) => {
    const c = COUNTRIES[form.country] || COUNTRIES.ph;
    const tapToPay = c.tapToPay ? "Tap to Pay, " : "";
    const recurringVia = c.recurringCards ? "" : " on ShopeePay";
    return (text || "")
      .replaceAll("{merchantName}", form.merchantName || "your business")
      .replaceAll("{tapToPay}", tapToPay)
      .replaceAll("{recurringVia}", recurringVia);
  };

  const buildStandaloneHTML = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${(form.merchantName || "HitPay Proposal").replace(/</g, "")}</title>
<style>
  ${standaloneFontCSS(origin)}
  * { box-sizing: border-box; }
  body { margin: 0; padding: 28px; background: #F0F0F2; font-family: 'Hauora', sans-serif; display: flex; justify-content: center; }
  .paper { background: #FFFFFF; max-width: 780px; width: 100%; border-radius: 16px; box-shadow: 0 12px 44px rgba(14,40,89,0.09); overflow: hidden; }
  .brand-head { font-family: 'MD Nichrome', sans-serif; font-weight: 700; }
  table { border-collapse: collapse; }
  .paper, .paper * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .hint { max-width: 780px; width: 100%; margin: 0 auto 14px; font-family: 'Hauora', sans-serif; font-size: 12.5px; color: ${COLORS.slate}; text-align: center; }
  @media print {
    .hint { display: none; }
    body { background: white; padding: 0; }
    .paper { box-shadow: none; max-width: 100%; border: none; border-radius: 0; }
    @page { size: A4; margin: 12mm; }
  }
</style>
</head>
<body>
  <div style="display:flex; flex-direction:column; align-items:center; width:100%;">
    <div class="hint">Press Ctrl/Cmd + P, then choose "Save as PDF" to export this proposal.</div>
    <div class="paper">${paperRef.current ? paperRef.current.innerHTML : ""}</div>
  </div>
</body>
</html>`;
  };

  // Downloading a real .html file sidesteps the pop-up block entirely,the file
  // opens as a normal, unsandboxed browser tab where print-to-PDF works natively.
  const downloadHTML = () => {
    if (!paperRef.current) return;
    try {
      const blob = new Blob([buildStandaloneHTML()], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slugify(form.merchantName) || "hitpay"}-proposal.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      flash("Downloaded,open the file, then press Ctrl/Cmd+P");
    } catch (e) { flash("Download failed"); }
  };

  const VerticalIcon = VERTICALS[form.vertical].icon;

  const MethodCheckbox = ({ group, id }) => {
    const item = rateFor(form.country, id);
    if (!item) return null;
    const checked = methods[group].includes(id);
    return (
      <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "5px 8px", borderRadius: 6, background: checked ? COLORS.blueSoft : "transparent", fontSize: 12.5, cursor: "pointer" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input type="checkbox" checked={checked} onChange={() => toggleMethod(group, id)} />
          {item.label}
        </span>
        <span style={{ fontFamily: "'Hauora', sans-serif", fontVariantNumeric: "tabular-nums", fontWeight: 700, color: COLORS.navy, fontSize: 12.5 }}>{item.rate}</span>
      </label>
    );
  };

  const selectedRateRows = (group) => (methods[group] || []).map((id) => rateFor(form.country, id)).filter(Boolean);

  // Accordion groups for the currently selected country
  const methodGroups = GROUP_ORDER.map((k) => ({ key: k, label: GROUP_LABELS[k], items: COUNTRIES[form.country][k] || [] }));

  // Unified pricing table sections (in order), only those with selected rows
  const PRICE_SECTIONS = [
    { key: "online", label: "Online", rateLabel: "Rate" },
    { key: "inperson", label: "In-person", rateLabel: "Rate" },
    { key: "crossborder", label: "Cross-border", rateLabel: "Rate" },
    { key: "hardware", label: "Hardware", rateLabel: "Price" },
  ];
  const pricingSections = PRICE_SECTIONS
    .map((s) => ({ ...s, rows: selectedRateRows(s.key) }))
    .filter((s) => s.rows.length > 0);
  const sectionLabel = { fontSize: 11, fontWeight: 700, color: COLORS.blue, textTransform: "uppercase", letterSpacing: ".12em" };
  const payouts = COUNTRIES[form.country].payouts;

  const renderPricingTable = (sections) => (
    <div style={{ border: `1px solid ${COLORS.line}`, borderRadius: 10, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <tbody>
          {sections.map((sec, sIdx) => (
            <React.Fragment key={sec.key}>
              <tr style={sIdx === 0 ? { background: COLORS.navy } : { background: "#F4F5F7" }}>
                <th style={{ textAlign: "left", padding: "9px 14px", fontWeight: 700, fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".08em", color: sIdx === 0 ? "white" : COLORS.blue }}>{sec.label}</th>
                <th style={{ textAlign: "right", padding: "9px 14px", fontWeight: 700, fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".08em", color: sIdx === 0 ? "white" : COLORS.slate }}>{sec.rateLabel}</th>
              </tr>
              {sec.rows.map((r) => {
                const HwIcon = sec.key === "hardware" ? HW_ICON[r.id] : null;
                const logos = sec.key === "hardware" ? null : METHOD_LOGOS[r.id];
                return (
                  <tr key={r.id} style={{ borderTop: `1px solid ${COLORS.line}` }}>
                    <td style={{ padding: "8px 14px", color: INK }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                        {HwIcon && <HwIcon size={14} color={COLORS.blue} style={{ flexShrink: 0 }} />}
                        <span>{r.label}</span>
                        {logos && logos.map((l) => (
                          <img key={l} src={`/payment-logos/${l}.svg`} alt="" style={{ height: 14, width: "auto", display: "block" }} />
                        ))}
                      </span>
                    </td>
                    <td style={{ padding: "8px 14px", textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums", color: INK }}>{r.rate}</td>
                  </tr>
                );
              })}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Split pricing into two balanced columns when the list is long (helps fit one A4 page)
  const priceUnits = pricingSections.reduce((n, s) => n + s.rows.length + 1, 0);
  const twoColPricing = priceUnits > 12 && pricingSections.length > 1;
  let priceColA = pricingSections, priceColB = [];
  if (twoColPricing) {
    priceColA = []; priceColB = [];
    let acc = 0; const half = priceUnits / 2;
    for (const s of pricingSections) {
      const u = s.rows.length + 1;
      if (acc + u / 2 <= half || priceColA.length === 0) { priceColA.push(s); acc += u; }
      else priceColB.push(s);
    }
  }

  return (
    <div style={{ fontFamily: "'Hauora', sans-serif", background: "#F0F0F2", minHeight: "100vh", color: COLORS.navy }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .app-shell { background: white !important; padding: 0 !important; }
          /* Collapse the editor's grid track so the document uses the full page width */
          .app-grid { display: block !important; max-width: 100% !important; margin: 0 !important; }
          /* Fill exactly one A4 page (100vh in print = the page box), footer pinned to bottom */
          .paper { box-sizing: border-box; box-shadow: none !important; border-radius: 0 !important; max-width: 100% !important; width: 100% !important; margin: 0 !important; min-height: 100vh; display: flex !important; flex-direction: column; }
          /* Force background colors/gradients (banner, table headers, footer, hero wash) to actually print */
          .paper, .paper * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          /* Keep whole blocks together so nothing splits mid-element; clean split if it runs to 2 pages */
          .pb-avoid { break-inside: avoid; }
          .paper tr { break-inside: avoid; }
          /* Tighter spacing in print to favour a single A4 page */
          .print-hero { padding: 24px 44px 18px !important; }
          .print-body { padding: 18px 44px 0 !important; flex: 1 1 auto; }
          .print-foot { padding: 22px 44px !important; }
          @page { size: A4; margin: 0; }
        }
        .field-label { font-size: 11px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; color: ${COLORS.slate}; display:block; margin-bottom:4px; }
        .field-input { width: 100%; border: 1px solid ${COLORS.line}; border-radius: 6px; padding: 8px 10px; font-size: 13.5px; font-family: 'Hauora', sans-serif; background: white; color: ${COLORS.navy}; }
        .field-input:focus { outline: 2px solid ${COLORS.blue}; outline-offset: 1px; }
        .section-card { background: white; border: 1px solid ${COLORS.line}; border-radius: 10px; padding: 16px; margin-bottom: 14px; }
        .sec-head { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 8px; background: transparent; border: none; padding: 0; cursor: pointer; }
        .btn { display:inline-flex; align-items:center; gap:6px; font-size:13px; font-weight:600; padding:8px 12px; border-radius:7px; cursor:pointer; border:1px solid transparent; transition: opacity .15s; font-family: 'Hauora', sans-serif; }
        .btn:hover { opacity: .85; }
        .btn-primary { background: ${COLORS.navy}; color: white; }
        .btn-accent { background: ${COLORS.blue}; color: white; }
        .btn-outline { background: white; color: ${COLORS.navy}; border-color: ${COLORS.line}; }
        .vbtn { display:flex; align-items:center; gap:8px; padding:8px 10px; border-radius:7px; border:1px solid ${COLORS.line}; background:white; cursor:pointer; font-size:12.5px; font-weight:500; text-align:left; color:${COLORS.navy}; font-family: 'Hauora', sans-serif; }
        .vbtn.active { border-color: ${COLORS.blue}; background: ${COLORS.blueSoft}; }
        .subhead { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:${COLORS.slate}; margin:10px 0 4px; }
        .brand-head { font-family: 'MD Nichrome', sans-serif; font-weight: 700; }
      `}</style>

      <div className="app-shell" style={{ padding: "20px" }}>
        <div className="no-print" style={{ maxWidth: 1240, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div className="brand-head" style={{ fontSize: 22 }}>Proposal Generator</div>
            <div style={{ fontSize: 12.5, color: COLORS.slate }}>Pick a vertical to auto-apply copy + pricing, then print.</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", position: "relative" }}>
            {status && <span style={{ fontSize: 12.5, color: COLORS.blue, fontWeight: 600 }}>{status}</span>}
            <button className="btn btn-outline" onClick={resetAll}><RotateCcw size={14} /> New</button>
            <div style={{ position: "relative" }}>
              <button className="btn btn-outline" onClick={() => { setShowLoad((s) => !s); refreshList(); }}><FolderOpen size={14} /> Load</button>
              {showLoad && (
                <div style={{ position: "absolute", top: 38, right: 0, background: "white", border: `1px solid ${COLORS.line}`, borderRadius: 8, width: 240, zIndex: 20, boxShadow: "0 6px 20px rgba(14,40,89,0.15)" }}>
                  {savedList.length === 0 && <div style={{ padding: 12, fontSize: 12.5, color: COLORS.slate }}>No saved proposals yet</div>}
                  {savedList.map((k) => (
                    <div key={k} onClick={() => loadProposal(k)} style={{ padding: "9px 12px", fontSize: 13, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${COLORS.line}` }}>
                      <span>{k.replace("proposal:", "").replace(/-/g, " ")}</span>
                      <Trash2 size={13} onClick={(e) => deleteProposal(k, e)} style={{ opacity: 0.5 }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="btn btn-outline" onClick={saveProposal}><Save size={14} /> Save</button>
            <button className="btn btn-accent" onClick={() => window.print()}><Printer size={14} /> Download PDF</button>
          </div>
        </div>

        <div className="app-grid" style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "380px 1fr", gap: 20, alignItems: "start" }}>
          {/* EDITOR */}
          <div className="no-print">
            <Section title="Market" hint="(sets pricing + available methods)" open={secOpen("market", false)} onToggle={() => secToggle("market", false)}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                {COUNTRY_KEYS.map((k) => (
                  <button key={k} className={`vbtn ${form.country === k ? "active" : ""}`} onClick={() => selectCountry(k)} style={{ justifyContent: "center" }}>
                    {COUNTRIES[k].label}
                  </button>
                ))}
              </div>
            </Section>

            <Section title="Business & date" open={secOpen("details")} onToggle={() => secToggle("details")}>
              <div className="field-label">Merchant name</div>
              <input className="field-input" value={form.merchantName} onChange={(e) => updateField("merchantName", e.target.value)} placeholder="e.g. Nast Fitness Center" style={{ marginBottom: 10 }} />
              <div className="field-label">Contact person</div>
              <input className="field-input" value={form.contactPerson} onChange={(e) => updateField("contactPerson", e.target.value)} placeholder="e.g. Corey Nast" style={{ marginBottom: 10 }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div><div className="field-label">Date</div><input type="date" className="field-input" value={form.proposalDate} onChange={(e) => updateField("proposalDate", e.target.value)} /></div>
                <div><div className="field-label">Valid for (days)</div><input className="field-input" value={form.validityDays} onChange={(e) => updateField("validityDays", e.target.value)} /></div>
              </div>
            </Section>

            <Section title="Vertical" hint="(auto-applies its copy + pricing)" open={secOpen("vertical", false)} onToggle={() => secToggle("vertical", false)}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {Object.entries(VERTICALS).map(([key, v]) => {
                  const Icon = v.icon;
                  return (
                    <button key={key} className={`vbtn ${form.vertical === key ? "active" : ""}`} onClick={() => selectVertical(key)}>
                      <Icon size={15} /> {v.label}
                    </button>
                  );
                })}
              </div>
            </Section>

            <Section title="Headline & summary" open={secOpen("copy", false)} onToggle={() => secToggle("copy", false)}>
              <div className="field-label">Headline <span style={{ textTransform: "none", fontWeight: 400 }}>(use {"{merchantName}"} to insert the name)</span></div>
              <input className="field-input" value={form.headline} onChange={(e) => updateField("headline", e.target.value)} style={{ marginBottom: 10 }} />
              <div className="field-label">Executive summary (subhead)</div>
              <textarea className="field-input" rows={4} value={form.summary} onChange={(e) => updateField("summary", e.target.value)} style={{ resize: "vertical" }} />
            </Section>

            <Section title="Edit with AI" hint="(rewrite the copy from an instruction)" open={secOpen("ai", false)} onToggle={() => secToggle("ai", false)}>
              <textarea className="field-input" rows={2} value={aiInstruction} onChange={(e) => setAiInstruction(e.target.value)} placeholder={'e.g. "make it punchier and shorter"'} style={{ resize: "vertical", marginBottom: 8 }} />
              <button className="btn btn-accent" onClick={runAiEdit} disabled={aiBusy || !aiInstruction.trim()} style={{ width: "100%", justifyContent: "center", opacity: aiBusy || !aiInstruction.trim() ? 0.6 : 1 }}>
                <Sparkles size={14} /> {aiBusy ? "Rewriting…" : "Rewrite headline, summary & value props"}
              </button>
              <div style={{ fontSize: 11, color: COLORS.slate, marginTop: 8 }}>Uses HitPay's AI. Edits the copy only, your pricing and methods stay as set.</div>
            </Section>

            <Section title="Value propositions" open={secOpen("valueprops", false)} onToggle={() => secToggle("valueprops", false)}>
              {form.props.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                  <input className="field-input" value={p} onChange={(e) => updateProp(i, e.target.value)} />
                  <button className="btn btn-outline" onClick={() => removeProp(i)} style={{ padding: "6px 8px" }}><X size={13} /></button>
                </div>
              ))}
              <button className="btn btn-outline" onClick={addProp} style={{ marginTop: 4 }}>+ Add point</button>
            </Section>

            <Section title="Payment methods" hint="(tap a group to pick methods)" open={secOpen("methods", false)} onToggle={() => secToggle("methods", false)}>
              {methodGroups.map((g) => {
                const open = !!openGroups[g.key];
                const count = (methods[g.key] || []).length;
                return (
                  <div key={g.key} style={{ borderTop: `1px solid ${COLORS.line}` }}>
                    <button
                      type="button"
                      onClick={() => toggleGroup(g.key)}
                      style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "transparent", border: "none", padding: "10px 2px", cursor: "pointer", fontFamily: "'Hauora', sans-serif", fontSize: 11.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: COLORS.slate }}
                    >
                      <span>{g.label}{count > 0 && <span style={{ color: COLORS.blue }}> · {count} selected</span>}</span>
                      <ChevronDown size={15} style={{ color: COLORS.slate, transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
                    </button>
                    {open && <div style={{ paddingBottom: 8 }}>{g.items.map((item) => <MethodCheckbox key={item.id} group={g.key} id={item.id} />)}</div>}
                  </div>
                );
              })}
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, marginTop: 12, padding: "6px 8px", background: COLORS.blueSoft, borderRadius: 6 }}>
                <input type="checkbox" checked={methods.customPricing} onChange={toggleCustomPricing} />
                Flag for custom / enterprise pricing (high monthly volume)
              </label>
            </Section>

            <Section title="Perks / next steps" hint="(optional)" open={secOpen("perks", false)} onToggle={() => secToggle("perks", false)}>
              <textarea className="field-input" rows={3} value={form.perks} onChange={(e) => updateField("perks", e.target.value)} placeholder="e.g. Onboarding support within 5 business days." style={{ resize: "vertical" }} />
            </Section>

            <Section title="Prepared by" hint="(shown in the footer)" open={secOpen("prepared", false)} onToggle={() => secToggle("prepared", false)}>
              <div className="field-label">Your name</div>
              <input className="field-input" value={form.preparedBy} onChange={(e) => updateField("preparedBy", e.target.value)} placeholder="Your name" style={{ marginBottom: 10 }} />
              <div className="field-label">Your role</div>
              <input className="field-input" value={form.preparedByRole} onChange={(e) => updateField("preparedByRole", e.target.value)} placeholder="e.g. Growth and Partnership Manager" style={{ marginBottom: 10 }} />
              <div className="field-label">Contact email</div>
              <input className="field-input" value={form.contactEmail} onChange={(e) => updateField("contactEmail", e.target.value)} placeholder="name@company.com" style={{ marginBottom: 10 }} />
              <div className="field-label">Your contact number</div>
              <input className="field-input" value={form.preparedByPhone} onChange={(e) => updateField("preparedByPhone", e.target.value)} placeholder="e.g. 0960 541 7099" style={{ marginBottom: 10 }} />
              <div className="field-label">Booking link <span style={{ textTransform: "none", fontWeight: 400 }}>("Book a call" button; blank = HitPay contact page)</span></div>
              <input className="field-input" value={form.bookingLink} onChange={(e) => updateField("bookingLink", e.target.value)} placeholder="https://calendly.com/your-link" />
            </Section>
          </div>

          {/* PREVIEW */}
          <div ref={paperRef} className="paper" style={{ background: "#FFFFFF", borderRadius: 16, boxShadow: "0 12px 44px rgba(14,40,89,0.09)", maxWidth: 780, margin: "0 auto", overflow: "hidden" }}>
            <div className="print-hero pb-avoid" style={{ background: HEADER_GRADIENT, padding: "40px 48px 34px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                <HitPayLogo height={30} />
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.blue, textTransform: "uppercase", letterSpacing: ".12em" }}>Proposal</div>
                  <div style={{ fontSize: 12, color: COLORS.slate, marginTop: 5 }}>{fmtDate(form.proposalDate)} · valid {form.validityDays || "14"} days</div>
                </div>
              </div>
              <h1 className="brand-head" style={{ fontSize: 34, lineHeight: 1.08, letterSpacing: "-0.02em", color: INK, margin: "26px 0 0", maxWidth: 430 }}>{replaceTokens(form.headline)}</h1>
              <p style={{ fontSize: 14.5, lineHeight: 1.6, color: COLORS.slate, margin: "14px 0 0", maxWidth: 470 }}>{replaceTokens(form.summary)}</p>
            </div>

            <div className="print-body" style={{ padding: "30px 48px 0" }}>
              <div style={sectionLabel}>Why HitPay</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 30px", marginTop: 12, marginBottom: 26 }}>
                {form.props.filter(Boolean).map((p, i) => (
                  <div key={i} className="pb-avoid" style={{ display: "flex", gap: 10, fontSize: 13.5, lineHeight: 1.5, alignItems: "flex-start" }}>
                    <span style={{ flexShrink: 0, width: 18, height: 18, borderRadius: 5, background: COLORS.blueSoft, display: "inline-flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                      <Check size={12} color={COLORS.blue} strokeWidth={3} />
                    </span>
                    <span style={{ color: INK }}>{replaceTokens(p)}</span>
                  </div>
                ))}
              </div>

              <div className="pb-avoid" style={{ background: COLORS.blue, color: "white", borderRadius: 10, padding: "13px 20px", fontSize: 13.5, marginBottom: 24, textAlign: "center" }}>
                <span style={{ fontWeight: 700 }}>No setup fees. No monthly fees.</span> <span style={{ opacity: 0.85 }}>Pay only per successful transaction.</span>
              </div>

              <div style={sectionLabel}>Pricing</div>

              {twoColPricing ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 12, marginBottom: 20, alignItems: "start" }}>
                  <div>{renderPricingTable(priceColA)}</div>
                  <div>{renderPricingTable(priceColB)}</div>
                </div>
              ) : (
                <div style={{ marginTop: 12, marginBottom: 20 }}>{renderPricingTable(pricingSections)}</div>
              )}

              {methods.customPricing && (
                <div style={{ display: "flex", gap: 8, background: COLORS.blueSoft, borderRadius: 8, padding: "11px 16px", fontSize: 13.5, marginBottom: 20 }}>
                  <Info size={15} color={COLORS.blue} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>Businesses with high monthly volume may qualify for custom enterprise pricing. Our team will follow up with tailored rates for {form.merchantName || "your business"}.</span>
                </div>
              )}

              <div className="pb-avoid" style={{ display: "flex", gap: 26, fontSize: 12.5, color: COLORS.slate, marginBottom: 20, flexWrap: "wrap" }}>
                <div><span style={{ fontWeight: 700, color: COLORS.navy }}>Non-card payout</span> {payouts.nonCard}</div>
                <div><span style={{ fontWeight: 700, color: COLORS.navy }}>In-person cards</span> {payouts.inpersonCards}</div>
                <div><span style={{ fontWeight: 700, color: COLORS.navy }}>Online cards</span> {payouts.onlineCards}</div>
                <div><span style={{ fontWeight: 700, color: COLORS.navy }}>Refunds</span> no extra fee</div>
              </div>

              {form.perks && (
                <div style={{ background: COLORS.blueSoft, borderRadius: 10, padding: "13px 18px", fontSize: 13.5, marginBottom: 22, color: COLORS.navy }}>
                  {replaceTokens(form.perks)}
                </div>
              )}
              <div style={{ height: 10 }} />
            </div>

            {/* Closing footer band */}
            <div className="print-foot pb-avoid" style={{ background: "#F5F5F2", padding: "26px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <div>
                <div className="brand-head" style={{ fontSize: 22, color: INK, letterSpacing: "-0.01em" }}>Let's find a time to talk.</div>
                <div style={{ fontSize: 13, marginTop: 10 }}><span style={{ fontWeight: 700, color: COLORS.navy }}>{form.preparedBy || "Your Name"}</span><span style={{ color: COLORS.slate }}> · {form.preparedByRole}, HitPay {COUNTRIES[form.country].label}</span></div>
                <div style={{ display: "flex", gap: 18, fontSize: 12, color: COLORS.slate, marginTop: 8, flexWrap: "wrap" }}>
                  {form.contactEmail && <span>{form.contactEmail}</span>}
                  {form.preparedByPhone && <span>{form.preparedByPhone}</span>}
                  <span>www.hitpayapp.com</span>
                </div>
              </div>
              <a href={form.bookingLink || CONTACT_URL} target="_blank" rel="noopener noreferrer" style={{ background: COLORS.blue, color: "white", borderRadius: 999, padding: "12px 22px", fontSize: 13.5, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap", textDecoration: "none" }}>
                Book a call <span style={{ fontSize: 15, lineHeight: 1 }}>→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
