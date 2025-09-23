import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'latin-ext'] });

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://uredno.eu';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Uredno.eu - Profesionalno Čišćenje Zagreb | Čišćenje Stanova i Ureda',
    template: '%s | Uredno.eu'
  },
  description: 'Profesionalne usluge čišćenja u Zagrebu. Čišćenje stanova, kuća, ureda i poslovnih prostora. Dubinsko čišćenje, redovito održavanje, čišćenje nakon gradnje. Povoljne cijene, fleksibilni termini. ☎ +385 92 450 2265',
  keywords: 'čišćenje Zagreb, profesionalno čišćenje, čišćenje stanova, čišćenje kuća, čišćenje ureda, dubinsko čišćenje, redovito čišćenje, čišćenje nakon gradnje, čistačica Zagreb, usluge čišćenja, Uredno.eu',
  authors: [{ name: 'Uredno.eu', url: baseUrl }],
  creator: 'Uredno.eu',
  publisher: 'Uredno.eu',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: baseUrl,
    languages: {
      'hr-HR': baseUrl,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'hr_HR',
    url: baseUrl,
    siteName: 'Uredno.eu',
    title: 'Uredno.eu - Profesionalno Čišćenje u Zagrebu',
    description: 'Profesionalne usluge čišćenja za domove i urede u Zagrebu. Pouzdano, efikasno i pristupačno. Besplatna procjena cijena.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Uredno.eu - Profesionalno čišćenje',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Uredno.eu - Profesionalno Čišćenje Zagreb',
    description: 'Profesionalne usluge čišćenja za domove i urede. Povoljne cijene, fleksibilni termini.',
    images: ['/og-image.jpg'],
    creator: '@uredno',
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#22c55e' },
    ],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  category: 'business',
};

// JSON-LD Structured Data for Local Business
const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Uredno.eu',
  description: 'Profesionalne usluge čišćenja u Zagrebu',
  url: baseUrl,
  telephone: '+385924502265',
  email: 'kontakt@uredno.eu',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Zagreb',
    addressRegion: 'Zagreb',
    addressCountry: 'HR',
    postalCode: '10000'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 45.8150,
    longitude: 15.9819
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '20:00'
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '09:00',
      closes: '18:00'
    }
  ],
  priceRange: '€€',
  image: `${baseUrl}/og-image.jpg`,
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '127',
    bestRating: '5',
    worstRating: '1'
  },
  areaServed: {
    '@type': 'City',
    name: 'Zagreb'
  },
  serviceArea: {
    '@type': 'GeoCircle',
    geoMidpoint: {
      '@type': 'GeoCoordinates',
      latitude: 45.8150,
      longitude: 15.9819
    },
    geoRadius: '20000'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hr" className="scroll-smooth">
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body className={inter.className}>
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>

        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}