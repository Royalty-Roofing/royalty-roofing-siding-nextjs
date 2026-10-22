// dataLayer events for Google Tag Manager. The site only pushes events; GTM decides where they go.

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    CallTrk?: { swap: () => void };
  }
}

// Value sent as form_name with every lead from this site.
const FORM_NAME = "siding";

// "(402) 555-0100" -> "+14025550100". Returns "" if it isn't a usable US number.
export function toE164(phone: string): string {
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.length === 10) return "+1" + digits;
  if (digits.length === 11 && digits.startsWith("1")) return "+" + digits;
  return "";
}

// Leads already pushed in this browser tab, so one lead is never counted twice.
const SENT_KEY = "gtm_leads_sent";
const sentThisPage = new Set<string>();

function alreadySent(key: string): boolean {
  if (sentThisPage.has(key)) return true;
  try {
    const list: string[] = JSON.parse(sessionStorage.getItem(SENT_KEY) || "[]");
    return list.includes(key);
  } catch {
    return false;
  }
}

function markSent(key: string) {
  sentThisPage.add(key);
  try {
    const list: string[] = JSON.parse(sessionStorage.getItem(SENT_KEY) || "[]");
    list.push(key);
    sessionStorage.setItem(SENT_KEY, JSON.stringify(list));
  } catch {}
}

// Call this once, at the moment the lead is saved to the CRM.
export function pushGenerateLead(email: string, phone: string) {
  if (typeof window === "undefined") return;
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanPhone = toE164(phone);
  const key = cleanEmail + "|" + cleanPhone;
  if (key === "|" || alreadySent(key)) return;
  markSent(key);
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "generate_lead",
    form_name: FORM_NAME,
    page_hostname: window.location.hostname,
    user_data: { email: cleanEmail, phone_number: cleanPhone },
  });
}

export function pushTelClick() {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: "tel_click", page_hostname: window.location.hostname });
}
