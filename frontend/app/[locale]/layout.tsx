import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Inter } from 'next/font/google';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';

// Font Configuration
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans-arabic',
});

// The Sovereign Switch - Dynamic Layout
export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  console.log('[locale]/layout resolved locale:', locale);
  // RTL/LTR Direction Logic
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const font = locale === 'ar' ? ibmPlexArabic.variable : inter.variable;

  // Validate locale
  if (!['en', 'ar'].includes(locale)) {
    notFound();
  }

  let messages;
  try {
    messages = await getMessages({ locale });
  } catch (error) {
    console.error('[locale]/layout getMessages error:', error);
    throw error;
  }

  return (
    <div dir={dir} className={`${font} antialiased font-sans`}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </div>
  );
}

// Generate static params for all locales
export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ar' }];
}

// Metadata configuration
export const metadata = {
  title: 'OMEGA-1 - القلعة الرقمية',
  description: 'Level 3 AI-Native Agentic System - نظام الوكيل من المستوى الثالث',
};
