/*
 NEXT.JS INTERNATIONALIZATION CONFIGURATION
Complete i18n setup for OMEGA-1 Bilingual Citadel
*/

import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['en', 'ar'] as const;
export const defaultLocale = 'ar' as const;

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();
  const typedLocale = locale as (typeof locales)[number];

  return {
    locale: typedLocale,
    messages: (await import(`./messages/${typedLocale}.json`)).default
  };
});

// Saudi Arabia detection for automatic locale selection
export function getSaudiLocale(request: Request) {
  const acceptLanguage = request.headers.get('accept-language') || '';
  const userAgent = request.headers.get('user-agent') || '';
  
  // Check for Saudi Arabia IP or Arabic browser language
  if (acceptLanguage.includes('ar') || 
      acceptLanguage.includes('sa') ||
      userAgent.includes('ar')) {
    return 'ar';
  }
  
  return defaultLocale;
}
