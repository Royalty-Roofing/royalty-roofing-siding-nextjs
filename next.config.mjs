// Google Tag Manager is the only tracking on this site, so never build without its container ID.
// The ID lives in .env (committed). A Vercel environment variable with the same name would override it.
if (!/^GTM-[A-Z0-9]+$/.test(process.env.NEXT_PUBLIC_GTM_ID || "")) {
  throw new Error("NEXT_PUBLIC_GTM_ID is missing or not a GTM container ID. It belongs in .env, for example NEXT_PUBLIC_GTM_ID=GTM-58MMMLBH")
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
