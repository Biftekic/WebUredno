# Phase 2: Service Catalog Implementation Workflow

## Overview
Implement the service catalog with mobile-optimized cards and dynamic pricing display.

## Prerequisites
- Database schema implemented
- Component library set up
- Supabase client configured

## Workflow Steps

### 1. Create Service Types
```typescript
// types/service.ts
export interface ServiceExtra {
  id: string;
  name: string;
  price: number;
  icon: string;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  category: 'regular' | 'deep' | 'construction' | 'moving' | 'windows' | 'office';
  basePrice: number;
  pricePerSqm?: number;
  minPrice?: number;
  duration: number; // hours
  description: string;
  features: string[];
  popular: boolean;
  icon: string;
  availableExtras?: ServiceExtra[];
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  services: Service[];
}
```

### 2. Create Service Data
```typescript
// lib/constants/services.ts
import { Service, ServiceExtra } from '@/types/service';

export const SERVICE_EXTRAS: ServiceExtra[] = [
  { id: 'balcony', name: 'Čišćenje balkona', price: 15, icon: 'home' },
  { id: 'windows', name: 'Pranje prozora', price: 20, icon: 'window' },
  { id: 'fridge', name: 'Čišćenje hladnjaka', price: 15, icon: 'refrigerator' },
  { id: 'oven', name: 'Čišćenje pećnice', price: 20, icon: 'oven' },
  { id: 'cabinets', name: 'Čišćenje ormarića', price: 25, icon: 'cabinet' },
];

export const SERVICES: Service[] = [
  {
    id: '1',
    name: 'Osnovno čišćenje',
    slug: 'osnovno-ciscenje',
    category: 'regular',
    basePrice: 35,
    pricePerSqm: 0.50,
    minPrice: 35,
    duration: 2,
    description: 'Redovito održavanje čistoće vašeg doma',
    features: [
      'Usisavanje svih prostorija',
      'Brisanje prašine',
      'Čišćenje sanitarija',
      'Pranje podova',
    ],
    popular: true,
    icon: 'sparkles',
    availableExtras: SERVICE_EXTRAS,
  },
  {
    id: '2',
    name: 'Dubinsko čišćenje',
    slug: 'dubinsko-ciscenje',
    category: 'deep',
    basePrice: 50,
    pricePerSqm: 0.75,
    minPrice: 50,
    duration: 3,
    description: 'Temeljito čišćenje svih površina i teško dostupnih mjesta',
    features: [
      'Sve iz osnovnog čišćenja',
      'Čišćenje ispod namještaja',
      'Pranje svih površina',
      'Dezinfekcija prostorija',
      'Čišćenje ventilacijskih otvora',
    ],
    popular: true,
    icon: 'shield-check',
    availableExtras: SERVICE_EXTRAS,
  },
  // Add more services...
];
```

### 3. Create Service Card Component
```tsx
// components/services/ServiceCard.tsx
'use client';

import { Service } from '@/types/service';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Home, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface ServiceCardProps {
  service: Service;
  onSelect: (service: Service) => void;
  variant?: 'compact' | 'detailed';
}

export function ServiceCard({
  service,
  onSelect,
  variant = 'compact'
}: ServiceCardProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="relative bg-white rounded-xl shadow-sm border border-gray-100 p-4 touch-manipulation"
    >
      {service.popular && (
        <Badge className="absolute -top-2 right-4 bg-green-500">
          Popularno
        </Badge>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">
            {service.name}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {service.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{service.duration}h</span>
        </div>
        <div className="flex items-center gap-1">
          <Home className="w-4 h-4" />
          <span>od {service.minPrice}€</span>
        </div>
      </div>

      {variant === 'detailed' && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Uključeno:
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            {service.features.slice(0, 3).map((feature, i) => (
              <li key={i} className="flex items-start">
                <Star className="w-3 h-3 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-lg font-bold text-gray-900">
          {formatPrice(service.basePrice)}
        </div>
        <Button
          onClick={() => onSelect(service)}
          className="bg-green-600 hover:bg-green-700 text-white"
          size="sm"
        >
          Odaberi
        </Button>
      </div>
    </motion.div>
  );
}
```

### 4. Create Service Grid Component
```tsx
// components/services/ServiceGrid.tsx
'use client';

import { useState } from 'react';
import { Service } from '@/types/service';
import { ServiceCard } from './ServiceCard';
import { ServiceFilter } from './ServiceFilter';
import { SERVICES } from '@/lib/constants/services';
import { useRouter } from 'next/navigation';

export function ServiceGrid() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [services] = useState<Service[]>(SERVICES);

  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter(s => s.category === selectedCategory);

  const handleServiceSelect = (service: Service) => {
    // Store selected service in state/context
    localStorage.setItem('selectedService', JSON.stringify(service));
    router.push(`/booking?service=${service.slug}`);
  };

  return (
    <div className="space-y-6">
      <ServiceFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onSelect={handleServiceSelect}
            variant="detailed"
          />
        ))}
      </div>
    </div>
  );
}
```

### 5. Create Service Filter Component
```tsx
// components/services/ServiceFilter.tsx
'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ServiceFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CATEGORIES = [
  { id: 'all', name: 'Sve usluge', icon: '🏠' },
  { id: 'regular', name: 'Redovito', icon: '✨' },
  { id: 'deep', name: 'Dubinsko', icon: '🧹' },
  { id: 'construction', name: 'Građevinski', icon: '🔨' },
  { id: 'moving', name: 'Selidba', icon: '📦' },
  { id: 'office', name: 'Ured', icon: '🏢' },
];

export function ServiceFilter({
  selectedCategory,
  onCategoryChange
}: ServiceFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {CATEGORIES.map((category) => (
        <Button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          variant={selectedCategory === category.id ? 'default' : 'outline'}
          className={cn(
            'flex items-center gap-2 whitespace-nowrap',
            selectedCategory === category.id &&
            'bg-green-600 hover:bg-green-700 text-white'
          )}
        >
          <span>{category.icon}</span>
          {category.name}
        </Button>
      ))}
    </div>
  );
}
```

### 6. Create Services Page
```tsx
// app/services/page.tsx
import { Metadata } from 'next';
import { ServiceGrid } from '@/components/services/ServiceGrid';
import { ServiceHero } from '@/components/services/ServiceHero';

export const metadata: Metadata = {
  title: 'Naše usluge - WebUredno',
  description: 'Profesionalne usluge čišćenja za vaš dom i ured',
};

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <ServiceHero />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Naše usluge čišćenja
        </h1>
        <p className="text-gray-600 mb-8">
          Odaberite uslugu koja najbolje odgovara vašim potrebama
        </p>

        <ServiceGrid />
      </div>

      {/* Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t md:hidden">
        <a
          href="https://wa.me/385924502265"
          className="block w-full bg-green-600 text-white text-center py-3 rounded-lg font-medium"
        >
          Kontaktirajte nas na WhatsApp
        </a>
      </div>
    </main>
  );
}
```

### 7. Create Service API Endpoints
```typescript
// app/api/services/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .eq('active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json(services);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

// app/api/services/[slug]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { data: service, error } = await supabase
      .from('services')
      .select('*')
      .eq('slug', params.slug)
      .single();

    if (error) throw error;

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(service);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    );
  }
}
```

### 8. Add Service State Management
```typescript
// hooks/useServices.ts
import useSWR from 'swr';
import { Service } from '@/types/service';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useServices() {
  const { data, error, isLoading } = useSWR<Service[]>(
    '/api/services',
    fetcher
  );

  return {
    services: data || [],
    isLoading,
    isError: error,
  };
}

export function useService(slug: string) {
  const { data, error, isLoading } = useSWR<Service>(
    slug ? `/api/services/${slug}` : null,
    fetcher
  );

  return {
    service: data,
    isLoading,
    isError: error,
  };
}
```

## Verification Checklist

- [ ] Service cards display correctly on mobile
- [ ] Touch targets are at least 44x44px
- [ ] Category filtering works
- [ ] Services load from database
- [ ] Popular services show badge
- [ ] Prices display in EUR format
- [ ] Navigation to booking works
- [ ] Service details are accessible

## Next Steps
- Proceed to [Price Calculator](./02-price-calculator.md)
- Add service search functionality
- Implement service comparison

## Performance Targets
- Service grid loads < 1 second
- Smooth animations on mobile
- No layout shift on load
- Images optimized and lazy loaded