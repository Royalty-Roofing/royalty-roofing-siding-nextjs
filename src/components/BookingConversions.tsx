"use client";
// Fires the lead-form conversions when the Royalty booking widget sends a lead.
// The widget dispatches "royalty-booking:info" on window once the lead is submitted.
import { useEffect } from "react";
import { trackFormConversion } from "@/lib/tracking";

export default function BookingConversions() {
  useEffect(() => {
    const counted = new Set<string>();
    const onLead = (e: Event) => {
      const d = ((e as CustomEvent).detail || {}) as Record<string, unknown>;
      const key = String(d.phone || d.email || "lead");
      if (counted.has(key)) return; // once per lead
      counted.add(key);
      trackFormConversion("booking_widget");
    };
    window.addEventListener("royalty-booking:info", onLead);
    return () => window.removeEventListener("royalty-booking:info", onLead);
  }, []);
  return null;
}
