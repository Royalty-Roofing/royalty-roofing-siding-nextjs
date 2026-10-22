"use client";

// Sends lead and call events to Google Tag Manager, and asks CallRail to swap numbers after
// client side page changes. Rendered once in the root layout.
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { pushGenerateLead, pushTelClick } from "@/lib/gtm";

export default function GtmEvents() {
  const pathname = usePathname();
  const firstRender = useRef(true);

  useEffect(() => {
    // The booking widget fires "royalty-booking:info" after the CRM has saved the lead's contact info.
    const onLead = (e: Event) => {
      const lead = (e as CustomEvent).detail || {};
      pushGenerateLead(lead.email, lead.phone);
    };

    // Any tel: link, including ones inside the booking widget.
    const onClick = (e: MouseEvent) => {
      for (const el of e.composedPath()) {
        if (el instanceof HTMLAnchorElement && el.getAttribute("href")?.startsWith("tel:")) {
          pushTelClick();
          return;
        }
      }
    };

    window.addEventListener("royalty-booking:info", onLead);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("royalty-booking:info", onLead);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  // Client side page change: let CallRail swap the numbers on the new page.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.CallTrk && window.CallTrk.swap();
  }, [pathname]);

  return null;
}
