import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FLUX-DNA | AI-Native Psychometric Sanctuary",
  description: "The Phoenix Has Ascended. Zero-Knowledge Psychometric Assessment. A SAR 5,500 gift to the Saudi people.",
  keywords: "psychometric, assessment, AI, Saudi Arabia, mental health, HEXACO, DASS, emotional intelligence",
  authors: [{ name: "Yazeed Shaheen", url: "mailto:Yazeedx91@gmail.com" }],
  openGraph: {
    title: "FLUX-DNA | The Sovereign Sanctuary",
    description: "AI-Native Psychometric Assessment - A Gift to the People",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Structured Data for GEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "FLUX-DNA",
              "description": "AI-Native Psychometric Sanctuary",
              "applicationCategory": "HealthApplication",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "SAR"
              },
              "author": {
                "@type": "Person",
                "name": "Yazeed Shaheen",
                "email": "Yazeedx91@gmail.com"
              }
            })
          }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}