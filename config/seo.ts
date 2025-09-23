export const seoConfig = {
  siteName: 'WebUredno',
  siteUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://weburedno.hr',
  siteDescription: 'Profesionalne usluge čišćenja u Zagrebu. Čišćenje stanova, kuća, ureda i poslovnih prostora. Povoljne cijene, fleksibilni termini.',
  siteKeywords: [
    'čišćenje Zagreb',
    'profesionalno čišćenje',
    'čišćenje stanova',
    'čišćenje kuća',
    'čišćenje ureda',
    'dubinsko čišćenje',
    'redovito čišćenje',
    'čišćenje nakon gradnje',
    'čistačica Zagreb',
    'usluge čišćenja',
    'WebUredno',
    'čišćenje poslovnih prostora',
    'održavanje higijene',
    'ekološko čišćenje'
  ],
  author: 'WebUredno',
  twitterHandle: '@weburedno',
  ogImage: '/og-image.jpg',

  // Contact info
  phone: '+385958581508',
  email: 'info@weburedno.hr',

  // Social media
  social: {
    facebook: 'https://facebook.com/weburedno',
    instagram: 'https://instagram.com/weburedno',
    linkedin: 'https://linkedin.com/company/weburedno'
  },

  // Business hours
  businessHours: {
    weekdays: '08:00-20:00',
    saturday: '09:00-18:00',
    sunday: 'Po dogovoru'
  },

  // Service areas
  serviceAreas: [
    'Zagreb',
    'Črnomerec',
    'Maksimir',
    'Novi Zagreb',
    'Trešnjevka',
    'Dubrava',
    'Stenjevec',
    'Peščenica',
    'Gornji Grad',
    'Donji Grad',
    'Medveščak',
    'Podsljeme',
    'Podsused',
    'Brezovica',
    'Sesvete'
  ],

  // Service types for structured data
  services: [
    {
      name: 'Dubinsko Čišćenje',
      slug: 'dubinsko-ciscenje',
      description: 'Temeljito čišćenje svih površina uključujući teško dostupna mjesta',
      price: 'od 20€/sat'
    },
    {
      name: 'Redovito Čišćenje',
      slug: 'redovito-ciscenje',
      description: 'Tjedno ili mjesečno održavanje čistoće vašeg prostora',
      price: 'od 15€/sat'
    },
    {
      name: 'Čišćenje Ureda',
      slug: 'ciscenje-ureda',
      description: 'Profesionalno čišćenje poslovnih prostora',
      price: 'po dogovoru'
    },
    {
      name: 'Čišćenje Nakon Gradnje',
      slug: 'ciscenje-nakon-gradnje',
      description: 'Detaljno čišćenje nakon građevinskih radova',
      price: 'od 25€/sat'
    },
    {
      name: 'Čišćenje Prozora',
      slug: 'ciscenje-prozora',
      description: 'Profesionalno čišćenje prozora i staklenih površina',
      price: 'od 2€/m²'
    },
    {
      name: 'Dodatne Usluge',
      slug: 'dodatne-usluge',
      description: 'Pranje tepiha, čišćenje namještaja i druge specijalizirane usluge',
      price: 'po dogovoru'
    }
  ]
};

// Generate meta tags for a page
export function generateMetaTags(
  title: string,
  description: string,
  path: string = '',
  image?: string
) {
  const url = `${seoConfig.siteUrl}${path}`;
  const ogImage = image || seoConfig.ogImage;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: seoConfig.siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'hr_HR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: seoConfig.twitterHandle,
    },
  };
}