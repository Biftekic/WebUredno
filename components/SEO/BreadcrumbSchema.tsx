import Script from 'next/script';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export default function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://uredno.eu';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`
    }))
  };

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Helper function to generate breadcrumb items
export function generateBreadcrumbs(path: string): BreadcrumbItem[] {
  const segments = path.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Početna', url: '/' }
  ];

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;

    // Map URL segments to proper names
    let name = segment;
    switch (segment) {
      case 'services':
        name = 'Usluge';
        break;
      case 'booking':
        name = 'Rezervacija';
        break;
      case 'about':
        name = 'O Nama';
        break;
      case 'contact':
        name = 'Kontakt';
        break;
      case 'dubinsko-ciscenje':
        name = 'Dubinsko Čišćenje';
        break;
      case 'redovito-ciscenje':
        name = 'Redovito Čišćenje';
        break;
      case 'ciscenje-ureda':
        name = 'Čišćenje Ureda';
        break;
      case 'ciscenje-nakon-gradnje':
        name = 'Čišćenje Nakon Gradnje';
        break;
      case 'ciscenje-prozora':
        name = 'Čišćenje Prozora';
        break;
      case 'dodatne-usluge':
        name = 'Dodatne Usluge';
        break;
      default:
        // Capitalize first letter of each word
        name = segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
    }

    breadcrumbs.push({ name, url: currentPath });
  });

  return breadcrumbs;
}