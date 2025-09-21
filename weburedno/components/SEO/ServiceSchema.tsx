import Script from 'next/script';

interface ServiceSchemaProps {
  serviceName: string;
  description: string;
  price: string;
  areaServed: string;
  provider: string;
  url: string;
}

export default function ServiceSchema({
  serviceName,
  description,
  price,
  areaServed,
  provider,
  url,
}: ServiceSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: serviceName,
    description: description,
    provider: {
      '@type': 'LocalBusiness',
      name: provider,
      telephone: '+385958581508',
      email: 'info@weburedno.hr',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Zagreb',
        addressCountry: 'HR'
      }
    },
    areaServed: {
      '@type': 'City',
      name: areaServed
    },
    priceRange: price,
    url: url,
    serviceType: 'Cleaning Service',
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: url,
      servicePhone: '+385958581508',
      availableLanguage: {
        '@type': 'Language',
        name: 'Croatian',
        alternateName: 'hr'
      }
    },
    potentialAction: {
      '@type': 'ReserveAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://weburedno.hr/booking',
        actionPlatform: [
          'http://schema.org/DesktopWebPlatform',
          'http://schema.org/MobileWebPlatform'
        ]
      },
      result: {
        '@type': 'Reservation',
        name: 'Rezervacija termina čišćenja'
      }
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '127',
      bestRating: '5'
    }
  };

  return (
    <Script
      id={`service-schema-${serviceName.replace(/\s+/g, '-').toLowerCase()}`}
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}