// @ts-check
import { fileURLToPath } from 'node:url'
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
if (!process.env.SKIP_ENV_VALIDATION) await import('./src/env/server.mjs')

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  outputFileTracingRoot: fileURLToPath(new URL('../../', import.meta.url)),
  // Turbopack traces the native addon but misses native-core's runtime imports
  // through pnpm symlinks. Include that small dependency tree for this route.
  outputFileTracingIncludes: {
    '/api/pdf': [
      '../../node_modules/.pnpm/@muhammara+native-core@*/node_modules/**/*',
      '../../node_modules/.pnpm/@xmldom+xmldom@*/node_modules/**/*',
      '../../node_modules/.pnpm/linebreak@*/node_modules/**/*',
      '../../node_modules/.pnpm/unicode-trie@*/node_modules/**/*',
      '../../node_modules/.pnpm/pako@*/node_modules/**/*',
      '../../node_modules/.pnpm/tiny-inflate@*/node_modules/**/*',
      '../../node_modules/.pnpm/base64-js@*/node_modules/**/*',
    ],
  },
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
    ]
  },
}
export default config
