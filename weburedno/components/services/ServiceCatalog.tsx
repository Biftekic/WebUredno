'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import ServiceGrid from './ServiceGrid';
import ServiceFilters from './ServiceFilters';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';
import { supabase } from '@/lib/supabase';
import { mockServices } from '@/lib/mock-services';

// Service interface
export interface Service {
  id: string;
  name: string;
  slug: string;
  category: string;
  base_price: number;
  price_per_sqm?: number;
  min_price?: number;
  duration_hours: number;
  description: string;
  features: string[];
  popular: boolean;
  active: boolean;
  display_order: number;
}

// Categories with Croatian labels
export const SERVICE_CATEGORIES = {
  all: 'Sve usluge',
  regular: 'Redovito čišćenje',
  deep: 'Dubinsko čišćenje',
  moving: 'Selidbe',
  construction: 'Građevinski radovi',
  windows: 'Prozori',
  office: 'Uredi',
  general: 'Generalno',
  disinfection: 'Dezinfekcija',
};

// Fetcher function for SWR
const fetcher = async () => {
  // Check if Supabase is configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
    // Use mock data for demo purposes
    return mockServices as Service[];
  }

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('active', true)
    .order('display_order', { ascending: true });

  if (error) throw error;

  // Parse features from JSON
  return (data || []).map(service => ({
    ...service,
    features: service.features || []
  })) as Service[];
};

export default function ServiceCatalog() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'price' | 'popular' | 'name'>('popular');

  // Fetch services with SWR
  const { data: services, error, isLoading } = useSWR('/api/services', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  // Filter and sort services
  const filteredServices = useMemo(() => {
    if (!services) return [];

    let filtered = [...services];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.features.some(feature => feature.toLowerCase().includes(query))
      );
    }

    // Sorting
    switch (sortBy) {
      case 'price':
        filtered.sort((a, b) => a.base_price - b.base_price);
        break;
      case 'popular':
        filtered.sort((a, b) => {
          if (a.popular === b.popular) return a.display_order - b.display_order;
          return b.popular ? 1 : -1;
        });
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name, 'hr'));
        break;
    }

    return filtered;
  }, [services, selectedCategory, searchQuery, sortBy]);

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <LoadingState message="Učitavanje usluga..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <ErrorState
          title="Greška pri učitavanju"
          message="Nije moguće učitati usluge. Molimo pokušajte ponovno."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Filters */}
      <ServiceFilters
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        serviceCount={filteredServices.length}
      />

      {/* Results */}
      <AnimatePresence mode="wait">
        {filteredServices.length > 0 ? (
          <motion.div
            key="services"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ServiceGrid services={filteredServices} />
          </motion.div>
        ) : (
          <motion.div
            key="no-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nema rezultata
              </h3>
              <p className="text-gray-600">
                Pokušajte s drugom kategorijom ili pojmom za pretraživanje
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}