// CTA click events for the landing page.
//
// Leads and calls are tracked in lib/gtm.ts. This file only pushes a
// "cta_click" event (e.g. "Free Estimate" buttons that open the booking
// widget). Not a lead yet, but useful for funnel analysis in GTM.

/** Push a lightweight CTA-click event into the dataLayer. */
export function trackCTA(label: string): void {
  if (typeof window === "undefined") return;
  const payload = { event: "cta_click", label };
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
  if (process.env.NODE_ENV !== "production") {
    console.log("[v0] cta_click", payload);
  }
}
