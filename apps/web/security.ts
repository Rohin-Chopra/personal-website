// The site's Content-Security-Policy header. Imported by the Pulumi program
// (CloudFront response headers policy) and the local preview server, so they
// can't drift. The build adds a stricter per-page <meta> policy with script
// hashes (scripts/postbuild.ts), which makes 'unsafe-inline' inert.
export const contentSecurityPolicy = (apiOrigin: string) =>
  [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src 'self' ${apiOrigin}`,
    "frame-src https://challenges.cloudflare.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");

export const API_ORIGIN = "https://api.rohinchopra.com";
