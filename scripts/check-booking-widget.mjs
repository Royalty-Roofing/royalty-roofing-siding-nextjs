// Build guard for the Royalty Roofing booking widget (landing page version).
// Runs before every build (package.json "prebuild"). If an edit (for example from v0) removed the
// widget script, its site name, or the form spots, the build fails, so Vercel keeps the
// last good version live instead of shipping a landing page with no lead form.
// Landing pages load the widget from the main site, so there is no local public/booking-widget.js.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = ["app", "src", "components", "pages"].filter((d) => existsSync(join(ROOT, d)));
const EXT = new Set([".tsx", ".ts", ".jsx", ".js", ".mdx"]);
const WIDGET_SRC = "https://royaltyroofing.org/booking-widget.js";

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (EXT.has(extname(name))) out.push(p);
  }
  return out;
}

const all = SCAN_DIRS.flatMap((d) => walk(join(ROOT, d)));
const componentFile = all.find((f) => /royalty-booking\.(t|j)sx?$/.test(f));
// Only count real usage on pages and layouts, not the component file that defines it.
const files = all.filter((f) => f !== componentFile);
// Strip comments so a comment that mentions the widget can't count as using it.
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1").replace(/\{\s*\}/g, "");
const text = files.map((f) => strip(readFileSync(f, "utf8"))).join("\n");
const layouts = files.filter((f) => /[\\/]app[\\/]layout\.(t|j)sx?$/.test(f) || /[\\/]pages[\\/]_app\.(t|j)sx?$/.test(f));
const layoutText = layouts.map((f) => strip(readFileSync(f, "utf8"))).join("\n");
const componentText = componentFile ? strip(readFileSync(componentFile, "utf8")) : "";
const problems = [];

if (!componentFile) problems.push("components/royalty-booking.tsx is missing.");
else if (!componentText.includes(`"${WIDGET_SRC}"`)) problems.push(`components/royalty-booking.tsx no longer loads ${WIDGET_SRC}.`);

if (existsSync(join(ROOT, "public", "booking-widget.js")))
  problems.push("public/booking-widget.js exists. Landing pages must load the widget from royaltyroofing.org, not a copy. Delete it.");

const tag = layoutText.match(/<RoyaltyBookingScript\b[^>]*>/);
if (!tag) problems.push("<RoyaltyBookingScript /> is missing from the root layout (app/layout.tsx), so nothing loads the widget.");
else {
  if (!/siteType="Landing Page"/.test(tag[0])) problems.push('<RoyaltyBookingScript /> in the root layout needs siteType="Landing Page".');
  if (!/siteName="[^"]+"/.test(tag[0])) problems.push('<RoyaltyBookingScript /> in the root layout needs a siteName (for example siteName="Siding Landing Page").');
  if (/\bmock\b/.test(tag[0])) problems.push("<RoyaltyBookingScript /> still has the mock prop, so no leads would be sent. Remove it.");
}
if (!/<RoyaltyBookingForm\b|data-royalty-booking[\s=>]/.test(text)) problems.push("No booking form spot found on any page (<RoyaltyBookingForm />).");

if (problems.length) {
  console.error("\n[booking-widget guard] BUILD STOPPED. The Royalty booking widget was removed or broken:\n");
  for (const p of problems) console.error("  * " + p);
  console.error("\nThis usually means an edit (often v0) rewrote the layout or form section from an old version.");
  console.error("Restore it from main, or ask Kaiden at Nexus Advantage. The live site stays on the last good deploy.\n");
  process.exit(1);
}
console.log("[booking-widget guard] OK");
