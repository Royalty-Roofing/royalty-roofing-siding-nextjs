// Royalty Roofing booking widget. DO NOT REMOVE. Leads from this landing page depend on this.
// Managed by Nexus Advantage. The widget is loaded live from the main site
// (https://royaltyroofing.org/booking-widget.js), so fixes there reach this page automatically.
// Never copy booking-widget.js into this repo.
//
// <RoyaltyBookingScript siteType="Landing Page" siteName="..." />  goes once in the root layout.
//   siteName shows in Slack ("Came From: ...") and GHL, so keep it exactly as set.
// <RoyaltyBookingForm />    goes wherever an estimate form should appear (replaces the old estimate forms).
//   theme="light" for white sections, title="..." to change the heading.
// Any button can open the popup: add data-royalty-booking-open to it.
// Conversions: listen for the window event "royalty-booking:info" (fires once per submitted lead).
"use client";

import Script from "next/script";

export const BOOKING_WIDGET_SRC = "https://royaltyroofing.org/booking-widget.js";

type ScriptProps = {
  /** "Landing Page" on every landing page. */
  siteType: string;
  /** Exact landing page name, e.g. "Siding Landing Page". */
  siteName: string;
  /** false hides the floating corner button. */
  launcher?: boolean;
  /** true = preview mode, nothing is sent to GHL. Never leave on in production. */
  mock?: boolean;
};

export function RoyaltyBookingScript({ siteType, siteName, launcher = true, mock = false }: ScriptProps) {
  return (
    <Script
      id="royalty-booking-widget"
      src={BOOKING_WIDGET_SRC}
      strategy="afterInteractive"
      data-launcher={launcher ? undefined : "false"}
      data-mock={mock ? "true" : undefined}
      data-site-type={siteType}
      data-site-name={siteName}
    />
  );
}

export function RoyaltyBookingForm({ theme, title }: { theme?: "dark" | "light"; title?: string }) {
  return (
    <div
      data-royalty-booking=""
      data-theme={theme}
      data-title={title}
      suppressHydrationWarning
      style={{ width: "100%" }}
    />
  );
}
