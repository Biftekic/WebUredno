import { supabase } from '@/lib/supabase';
import type { Booking, CreateBookingInput, Customer } from '@/types/database';
import { reserveTimeSlot, releaseTimeSlot } from './availability';

/**
 * Create a new booking
 */
export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  // Start a Supabase transaction-like operation
  try {
    // 1. Create or find customer
    let customerId: string;

    // Check if customer exists
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', input.customer.email)
      .single();

    if (existingCustomer) {
      customerId = existingCustomer.id;

      // Update customer details
      await supabase
        .from('customers')
        .update({
          ...input.customer,
          updated_at: new Date().toISOString()
        })
        .eq('id', customerId);
    } else {
      // Create new customer
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert([input.customer])
        .select()
        .single();

      if (customerError) throw customerError;
      customerId = newCustomer.id;
    }

    // 2. Calculate pricing
    const { data: pricing } = await supabase
      .rpc('calculate_price', {
        p_service_id: input.service_id,
        p_property_size: input.property_size || null,
        p_extras: input.extras ? JSON.stringify(input.extras) : '[]'
      });

    const priceData = pricing[0];

    // 3. Create booking
    const bookingData = {
      customer_id: customerId,
      service_id: input.service_id,
      status: 'pending',
      booking_date: input.booking_date,
      time_slot: input.time_slot,
      team_number: input.team_number || null,
      service_type: input.service_type,
      frequency: input.frequency || 'one-time',
      property_type: input.property_type || null,
      property_size: input.property_size || null,
      bedrooms: input.bedrooms || null,
      bathrooms: input.bathrooms || null,
      base_price: priceData.base_price,
      extras: input.extras || [],
      extras_cost: priceData.extras_cost,
      distance_fee: 0, // Calculate based on address if needed
      total_price: priceData.total_price,
      special_requests: input.special_requests || null
    };

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select()
      .single();

    if (bookingError) throw bookingError;

    // 4. Reserve time slot if team number is specified
    if (input.team_number) {
      await reserveTimeSlot(
        input.booking_date,
        input.time_slot,
        input.team_number,
        booking.id
      );
    }

    return booking as Booking;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
}

/**
 * Get booking by ID
 */
export async function getBookingById(id: string): Promise<Booking | null> {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      customer:customers(*),
      service:services(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching booking:', error);
    throw error;
  }

  return data as Booking;
}

/**
 * Get booking by booking number
 */
export async function getBookingByNumber(bookingNumber: string): Promise<Booking | null> {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      customer:customers(*),
      service:services(*)
    `)
    .eq('booking_number', bookingNumber)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching booking:', error);
    throw error;
  }

  return data as Booking;
}

/**
 * Get bookings by customer email
 */
export async function getBookingsByEmail(email: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      customer:customers!inner(*),
      service:services(*)
    `)
    .eq('customers.email', email)
    .order('booking_date', { ascending: false });

  if (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }

  return data as Booking[];
}

/**
 * Update booking status
 */
export async function updateBookingStatus(
  id: string,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }

  // If cancelling, release the time slot
  if (status === 'cancelled') {
    await releaseTimeSlot(id);
  }

  return data as Booking;
}

/**
 * Cancel booking
 */
export async function cancelBooking(id: string): Promise<boolean> {
  try {
    await updateBookingStatus(id, 'cancelled');
    return true;
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return false;
  }
}

/**
 * Get upcoming bookings
 */
export async function getUpcomingBookings(limit: number = 10): Promise<Booking[]> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      customer:customers(*),
      service:services(*)
    `)
    .gte('booking_date', today)
    .in('status', ['pending', 'confirmed'])
    .order('booking_date', { ascending: true })
    .order('time_slot', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching upcoming bookings:', error);
    throw error;
  }

  return data as Booking[];
}

/**
 * Get bookings for a specific date
 */
export async function getBookingsByDate(date: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      customer:customers(*),
      service:services(*)
    `)
    .eq('booking_date', date)
    .order('time_slot', { ascending: true })
    .order('team_number', { ascending: true });

  if (error) {
    console.error('Error fetching bookings by date:', error);
    throw error;
  }

  return data as Booking[];
}

/**
 * Confirm booking with team assignment
 */
export async function confirmBooking(
  id: string,
  teamNumber: number
): Promise<Booking> {
  // First get the booking details
  const booking = await getBookingById(id);
  if (!booking) {
    throw new Error('Booking not found');
  }

  // Reserve the time slot
  const reserved = await reserveTimeSlot(
    booking.booking_date,
    booking.time_slot,
    teamNumber,
    id
  );

  if (!reserved) {
    throw new Error('Time slot is no longer available');
  }

  // Update booking with team number and status
  const { data, error } = await supabase
    .from('bookings')
    .update({
      status: 'confirmed',
      team_number: teamNumber,
      confirmed_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    // If update fails, release the time slot
    await releaseTimeSlot(id);
    console.error('Error confirming booking:', error);
    throw error;
  }

  return data as Booking;
}