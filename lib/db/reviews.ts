import { supabase } from '@/lib/supabase';
import type { Review } from '@/types/database';

/**
 * Get all reviews
 */
export async function getReviews(limit?: number): Promise<Review[]> {
  let query = supabase
    .from('reviews')
    .select(`
      *,
      customer:customers(first_name, last_name),
      booking:bookings(service_id, booking_date)
    `)
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }

  return data as Review[];
}

/**
 * Get featured reviews
 */
export async function getFeaturedReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      customer:customers(first_name, last_name),
      booking:bookings(service_id, booking_date)
    `)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(6);

  if (error) {
    console.error('Error fetching featured reviews:', error);
    throw error;
  }

  return data as Review[];
}

/**
 * Get reviews by rating
 */
export async function getReviewsByRating(rating: number): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      customer:customers(first_name, last_name),
      booking:bookings(service_id, booking_date)
    `)
    .eq('rating', rating)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews by rating:', error);
    throw error;
  }

  return data as Review[];
}

/**
 * Get reviews for a specific service
 */
export async function getServiceReviews(serviceId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      customer:customers(first_name, last_name),
      booking!inner(service_id, booking_date)
    `)
    .eq('booking.service_id', serviceId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching service reviews:', error);
    throw error;
  }

  return data as Review[];
}

/**
 * Create a new review
 */
export async function createReview(
  bookingId: string,
  customerId: string,
  rating: 1 | 2 | 3 | 4 | 5,
  comment?: string
): Promise<Review> {
  const { data, error } = await supabase
    .from('reviews')
    .insert([{
      booking_id: bookingId,
      customer_id: customerId,
      rating,
      comment: comment || null,
      is_featured: false
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating review:', error);
    throw error;
  }

  return data as Review;
}

/**
 * Update review
 */
export async function updateReview(
  id: string,
  updates: {
    rating?: 1 | 2 | 3 | 4 | 5;
    comment?: string;
  }
): Promise<Review> {
  const { data, error } = await supabase
    .from('reviews')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating review:', error);
    throw error;
  }

  return data as Review;
}

/**
 * Toggle featured status of a review
 */
export async function toggleReviewFeatured(id: string): Promise<Review> {
  // First get current status
  const { data: current } = await supabase
    .from('reviews')
    .select('is_featured')
    .eq('id', id)
    .single();

  const { data, error } = await supabase
    .from('reviews')
    .update({ is_featured: !current?.is_featured })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error toggling review featured status:', error);
    throw error;
  }

  return data as Review;
}

/**
 * Get review statistics
 */
export async function getReviewStats() {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating');

  if (error) {
    console.error('Error fetching review stats:', error);
    throw error;
  }

  const ratings = data.map(r => r.rating);
  const total = ratings.length;

  if (total === 0) {
    return {
      average: 0,
      total: 0,
      distribution: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
      }
    };
  }

  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  const average = sum / total;

  const distribution = {
    1: ratings.filter(r => r === 1).length,
    2: ratings.filter(r => r === 2).length,
    3: ratings.filter(r => r === 3).length,
    4: ratings.filter(r => r === 4).length,
    5: ratings.filter(r => r === 5).length
  };

  return {
    average: Math.round(average * 10) / 10, // Round to 1 decimal
    total,
    distribution
  };
}

/**
 * Check if customer can review a booking
 */
export async function canReviewBooking(
  bookingId: string,
  customerId: string
): Promise<boolean> {
  // Check if booking exists and is completed
  const { data: booking } = await supabase
    .from('bookings')
    .select('status, customer_id')
    .eq('id', bookingId)
    .eq('customer_id', customerId)
    .single();

  if (!booking || booking.status !== 'completed') {
    return false;
  }

  // Check if review already exists
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('booking_id', bookingId)
    .single();

  return !existingReview;
}