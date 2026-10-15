// Centralized lead-tracking for the landing page.
//
// Pushes "generate_lead" events to GTM/gtag (Google dataLayer) and fires the
// Google Ads conversions. Leads themselves are sent to GHL by the Royalty booking
// widget (components/royalty-booking.tsx); see components/BookingConversions.tsx.

// Google Ads conversion for "Submit lead form" (siding.royaltyroofing.org).
// The base gtag.js tag for AW-931355603 is loaded in app/layout.tsx; this is
// the per-conversion send_to label fired when the lead form is submitted.
const GOOGLE_ADS_FORM_CONVERSION = "AW-931355603/4kKWCLv58MccENO3jbwD";

// Google Ads conversion for "Click to call" — fired when a tel: link is clicked.
const GOOGLE_ADS_CALL_CONVERSION = "AW-931355603/uVslCNmV3c0cENO3jbwD";

// "form" covers any form submission; the specific form instance (hero,
// bottom_form, …) is passed through so leads can be attributed by source.
type LeadMethod = "form" | "call" | "text" | (string & {});

interface LeadDetails {
  firstName?: string;
  lastName?: string;
  phone?: string;
  [key: string]: unknown;
}

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
  }
}

// De-dupe guard: remembers the last time each Ads conversion label was sent so
// a double-bound handler, React re-render, or rapid re-click can't fire the
// same conversion twice. Any repeat within the window is dropped.
const CONVERSION_DEDUPE_MS = 2000;
const sentConversions = new Map<string, number>();

/**
 * Fire a Google Ads conversion exactly once per de-dupe window. Guarded so it
 * can never double-count from duplicate calls or re-bound handlers.
 */
function reportAdsConversion(sendTo: string): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  const now = Date.now();
  const last = sentConversions.get(sendTo);
  if (last && now - last < CONVERSION_DEDUPE_MS) return;
  sentConversions.set(sendTo, now);

  window.gtag("event", "conversion", {
    send_to: sendTo,
    value: 1.0,
    currency: "USD",
  });
}

/**
 * Fire a single "generate_lead" event into the Google dataLayer (works with
 * both gtag.js and GTM). This is analytics only — it does NOT send an Ads
 * conversion. Safe to call on the client only.
 */
export function trackLead(method: LeadMethod, details: LeadDetails = {}): void {
  if (typeof window === "undefined") return;

  const payload = {
    event: "generate_lead",
    method,
    ...details,
  };

  // dataLayer (GTM)
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);

  // gtag.js (direct)
  if (typeof window.gtag === "function") {
    window.gtag("event", "generate_lead", { method, ...details });
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("[v0] generate_lead", payload);
  }
}

/**
 * Record a successful lead-form submission: pushes the generate_lead event AND
 * fires the Google Ads form conversion exactly once. Call only on success.
 */
export function trackFormConversion(source: string, details: LeadDetails = {}): void {
  trackLead(source, details);
  reportAdsConversion(GOOGLE_ADS_FORM_CONVERSION);
}

/**
 * Convenience helper for tel:/sms: links. Attach to onClick on any phone/text
 * link so calls and texts are counted as leads too.
 */
export function trackContactClick(method: "call" | "text"): void {
  trackLead(method);
}

/**
 * Attach to onClick of any tel: link. Pushes the generate_lead event AND fires
 * the Google Ads click-to-call conversion exactly once per click (guarded).
 * `location` records where it was clicked.
 */
export function trackCall(location?: string): void {
  trackLead("call", location ? { location } : {});
  reportAdsConversion(GOOGLE_ADS_CALL_CONVERSION);
}

/** Attach to onClick of any sms: link. `location` records where it was clicked. */
export function trackText(location?: string): void {
  trackLead("text", location ? { location } : {});
}

/**
 * Fire a lightweight CTA-click event (e.g. "Free Estimate" buttons that scroll
 * to the form). Not a lead yet, but useful for funnel analysis.
 */
export function trackCTA(label: string): void {
  if (typeof window === "undefined") return;
  const payload = { event: "cta_click", label };
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
  if (typeof window.gtag === "function") {
    window.gtag("event", "cta_click", { label });
  }
  if (process.env.NODE_ENV !== "production") {
    console.log("[v0] cta_click", payload);
  }
}
