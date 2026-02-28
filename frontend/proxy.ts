import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const handle = createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'ar'],

  // Used when no locale matches
  defaultLocale: 'ar',

  // Geolocation-based locale detection
  localeDetection: true,

  // Saudi Arabia IP detection - default to Arabic
  alternateLinks: false,
  
  // Path strategy
  localePrefix: 'always'
});

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Normalize trailing slashes for locale routes to avoid /ar/ and /ar/landing/ 404s
  if ((pathname.startsWith('/ar/') || pathname.startsWith('/en/')) && pathname.length > 1 && pathname.endsWith('/')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(0, -1);
    return NextResponse.redirect(url);
  }
  return handle(request);
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/__proxy_disabled__']
};
