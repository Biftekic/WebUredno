import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WebUredno - Profesionalne Usluge Čišćenja u Zagrebu',
  description: 'WebUredno pruža vrhunske usluge čišćenja za domove i urede u Zagrebu. Pouzdano, efikasno i pristupačno čišćenje prilagođeno vašim potrebama.',
  keywords: 'čišćenje, Zagreb, profesionalno čišćenje, čišćenje doma, čišćenje ureda',
  authors: [{ name: 'WebUredno' }],
  creator: 'WebUredno',
  openGraph: {
    type: 'website',
    locale: 'hr_HR',
    url: 'https://weburedno.hr',
    siteName: 'WebUredno',
    title: 'WebUredno - Profesionalne Usluge Čišćenja',
    description: 'Vrhunske usluge čišćenja za vaš dom ili ured',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'WebUredno',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WebUredno - Profesionalne Usluge Čišćenja',
    description: 'Vrhunske usluge čišćenja za vaš dom ili ured',
    images: ['/og-image.jpg'],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hr" className="scroll-smooth">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}