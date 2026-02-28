import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['en', 'ar'] as const;
export const defaultLocale = 'ar' as const;

export default getRequestConfig(async ({ locale }) => {
  // When the middleware/proxy is not active, `locale` can be undefined.
  // In that case, fall back to the default locale instead of returning a 404.
  if (locale != null && !locales.includes(locale as any)) notFound();
  const typedLocale = (locale ?? defaultLocale) as (typeof locales)[number];

  return {
    locale: typedLocale,
    messages: (await import(`../messages/${typedLocale}.json`)).default
  };
});
