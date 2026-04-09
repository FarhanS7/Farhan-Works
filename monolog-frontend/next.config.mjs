/** @type {import('next').NextConfig} */

// API origin used in CSP connect-src — falls back to localhost for dev
const apiOrigin = process.env.NEXT_PUBLIC_API_URL
  ? new URL(process.env.NEXT_PUBLIC_API_URL).origin
  : 'http://localhost:5000';

const ContentSecurityPolicy = [
  "default-src 'self'",
  // Next.js App Router requires 'unsafe-inline' for hydration scripts and styles.
  // Remove 'unsafe-eval' once you move to production and verify it isn't needed.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  // Allow same-origin images plus data-URIs and blob-URLs for future image usage
  "img-src 'self' data: blob: https:",
  // Only allow XHR/fetch to our own app and the backend API
  `connect-src 'self' ${apiOrigin}`,
  // Block every embedding context — belt-and-suspenders on top of X-Frame-Options
  "frame-ancestors 'none'",
  // Disallow Flash/Java/PDF plugins
  "object-src 'none'",
  // Prevent base-tag hijacking
  "base-uri 'self'",
  // Restrict form submissions to same origin
  "form-action 'self'",
].join('; ');

const nextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent MIME-type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Clickjacking protection (belt-and-suspenders with frame-ancestors CSP)
          { key: 'X-Frame-Options', value: 'DENY' },
          // Limit Referer header leakage
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Enforce HTTPS for 2 years, include subdomains, opt into preload list
          // (only takes effect over HTTPS — ignored on plain HTTP)
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // Disable browser APIs the blog has no use for
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()',
          },
          // Content Security Policy
          { key: 'Content-Security-Policy', value: ContentSecurityPolicy },
        ],
      },
    ]
  },
}

export default nextConfig
