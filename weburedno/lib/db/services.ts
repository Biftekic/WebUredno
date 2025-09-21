import { supabase } from '@/lib/supabase';
import type { Service } from '@/types/database';

/**
 * Fetch all active services
 */
export async function getServices() {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching services:', error);
    throw error;
  }

  return data as Service[];
}

/**
 * Fetch popular services
 */
export async function getPopularServices() {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('active', true)
    .eq('popular', true)
    .order('display_order', { ascending: true })
    .limit(3);

  if (error) {
    console.error('Error fetching popular services:', error);
    throw error;
  }

  return data as Service[];
}

/**
 * Fetch a single service by slug
 */
export async function getServiceBySlug(slug: string) {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .single();

  if (error) {
    console.error('Error fetching service:', error);
    throw error;
  }

  return data as Service;
}

/**
 * Fetch services by category
 */
export async function getServicesByCategory(category: string) {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('category', category)
    .eq('active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching services by category:', error);
    throw error;
  }

  return data as Service[];
}

/**
 * Search services by name or description
 */
export async function searchServices(query: string) {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('active', true)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order('popular', { ascending: false })
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error searching services:', error);
    throw error;
  }

  return data as Service[];
}

/**
 * Calculate price for a service
 */
export async function calculateServicePrice(
  serviceId: string,
  propertySize?: number,
  extras?: Array<{ name: string; price: number }>
) {
  const { data, error } = await supabase
    .rpc('calculate_price', {
      p_service_id: serviceId,
      p_property_size: propertySize || null,
      p_extras: extras ? JSON.stringify(extras) : '[]'
    });

  if (error) {
    console.error('Error calculating price:', error);
    throw error;
  }

  return data[0] as {
    base_price: number;
    extras_cost: number;
    total_price: number;
  };
}