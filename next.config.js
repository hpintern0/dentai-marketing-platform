/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zmtjlpcgfaczbrqwhejk.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptdGpscGNnZmFjemJycXdoZWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MjAxNjUsImV4cCI6MjA5MTM5NjE2NX0.fmr8gu6ywI98jkB9fIBla4ApQ48Mh8W2fgzfw53Lef8",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "https://dentai-marketing-platform-production.up.railway.app",
  },
};

module.exports = nextConfig;
