import useSWR from 'swr';
import { supabase } from '@/lib/supabase';

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

const fetcher = async () => {
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

export function useServices() {
  const { data, error, isLoading, mutate } = useSWR('/api/services', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000, // 1 minute
  });

  return {
    services: data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

// Hook for fetching a single service by slug
export function useService(slug: string) {
  const { data, error, isLoading } = useSWR(
    slug ? `/api/services/${slug}` : null,
    async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('slug', slug)
        .eq('active', true)
        .single();

      if (error) throw error;

      return {
        ...data,
        features: data.features || []
      } as Service;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    service: data,
    isLoading,
    error,
  };
}

// Hook for fetching popular services
export function usePopularServices() {
  const { data, error, isLoading } = useSWR('/api/services/popular',
    async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('active', true)
        .eq('popular', true)
        .order('display_order', { ascending: true })
        .limit(3);

      if (error) throw error;

      return (data || []).map(service => ({
        ...service,
        features: service.features || []
      })) as Service[];
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    services: data || [],
    isLoading,
    error,
  };
}