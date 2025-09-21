import { supabase } from '@/lib/supabase';
import type { Booking, CreateBookingInput, AvailabilitySlot, Customer } from '@/types/database';
import { generateBookingNumber } from '@/lib/booking-utils';

/**
 * Check availability for a specific date and time
 */
export async function checkAvailability(date: string, timeSlot: string) {
  const { data, error } = await supabase
    .rpc('check_availability', {
      p_date: date,
      p_time_slot: timeSlot
    });

  if (error) {
    console.error('Error checking availability:', error);
    throw error;
  }

  return data as Array<{ team_number: number; is_available: boolean }>;
}

/**
 * Get available time slots for a specific date
 */
export async function getAvailableSlots(date: string): Promise<AvailabilitySlot[]> {
  const { data, error } = await supabase
    .rpc('get_available_slots', {
      p_date: date
    });

  if (error) {
    console.error('Error getting available slots:', error);
    throw error;
  }

  // Transform the data to include team numbers
  const slots = data as Array<{ time_slot: string; available_teams: number }>;

  // For each slot, get the available team numbers
  const slotsWithTeams = await Promise.all(
    slots.map(async (slot) => {
      const teams = await checkAvailability(date, slot.time_slot);
      const availableTeamNumbers = teams
        .filter(t => t.is_available)
        .map(t => t.team_number);

      return {
        date,
        time_slot: slot.time_slot,
        available_teams: slot.available_teams,
        team_numbers: availableTeamNumbers
      };
    })
  );

  return slotsWithTeams;
}

/**
 * Get availability for multiple dates
 */
export async function getAvailabilityForDates(dates: string[]): Promise<Map<string, AvailabilitySlot[]>> {
  const availabilityMap = new Map<string, AvailabilitySlot[]>();

  await Promise.all(
    dates.map(async (date) => {
      const slots = await getAvailableSlots(date);
      availabilityMap.set(date, slots);
    })
  );

  return availabilityMap;
}

/**
 * Create or find a customer
 */
async function createOrFindCustomer(customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
  // First, try to find existing customer by email
  const { data: existingCustomer, error: findError } = await supabase
    .from('customers')
    .select('id')
    .eq('email', customerData.email)
    .single();

  if (existingCustomer && !findError) {
    // Update existing customer data
    await supabase
      .from('customers')
      .update({
        ...customerData,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingCustomer.id);

    return existingCustomer.id;
  }

  // Create new customer
  const { data: newCustomer, error: createError } = await supabase
    .from('customers')
    .insert({
      ...customerData,
      source: 'website'
    })
    .select('id')
    .single();

  if (createError) {
    console.error('Error creating customer:', createError);
    throw createError;
  }

  return newCustomer.id;
}

/**
 * Create a new booking
 */
export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  // Create or find customer
  const customerId = await createOrFindCustomer(input.customer);

  // Generate booking number
  const bookingNumber = generateBookingNumber();

  // Calculate total price (simplified for now)
  const extrasTotal = input.extras?.reduce((sum, extra) =>
    sum + (extra.price * (extra.quantity || 1)), 0
  ) || 0;

  // Reserve availability slot
  const availableTeams = await checkAvailability(input.booking_date, input.time_slot);
  const availableTeam = availableTeams.find(t => t.is_available);

  if (!availableTeam) {
    throw new Error('Odabrani termin više nije dostupan');
  }

  // Create booking
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      booking_number: bookingNumber,
      customer_id: customerId,
      service_id: input.service_id,
      status: 'pending',
      booking_date: input.booking_date,
      time_slot: input.time_slot,
      team_number: availableTeam.team_number,
      service_type: input.service_type,
      frequency: input.frequency,
      property_type: input.property_type,
      property_size: input.property_size,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      extras: input.extras || [],
      extras_cost: extrasTotal,
      distance_fee: 0, // Will be calculated based on address
      total_price: 0, // Will be calculated
      special_requests: input.special_requests
    })
    .select('*')
    .single();

  if (bookingError) {
    console.error('Error creating booking:', bookingError);
    throw bookingError;
  }

  // Update availability
  await supabase
    .from('availability')
    .update({
      is_available: false,
      booking_id: booking.id
    })
    .eq('date', input.booking_date)
    .eq('time_slot', input.time_slot)
    .eq('team_number', availableTeam.team_number);

  return booking as Booking;
}

/**
 * Get booking by ID
 */
export async function getBooking(bookingId: string): Promise<Booking | null> {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      customer:customers(*),
      service:services(*)
    `)
    .eq('id', bookingId)
    .single();

  if (error) {
    console.error('Error fetching booking:', error);
    return null;
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
    console.error('Error fetching booking:', error);
    return null;
  }

  return data as Booking;
}

/**
 * Update booking status
 */
export async function updateBookingStatus(
  bookingId: string,
  status: 'confirmed' | 'completed' | 'cancelled'
): Promise<void> {
  const updateData: any = {
    status,
    updated_at: new Date().toISOString()
  };

  // Add timestamp based on status
  if (status === 'confirmed') {
    updateData.confirmed_at = new Date().toISOString();
  } else if (status === 'completed') {
    updateData.completed_at = new Date().toISOString();
  } else if (status === 'cancelled') {
    updateData.cancelled_at = new Date().toISOString();

    // Release the availability slot
    const { data: booking } = await supabase
      .from('bookings')
      .select('booking_date, time_slot, team_number')
      .eq('id', bookingId)
      .single();

    if (booking) {
      await supabase
        .from('availability')
        .update({
          is_available: true,
          booking_id: null
        })
        .eq('date', booking.booking_date)
        .eq('time_slot', booking.time_slot)
        .eq('team_number', booking.team_number);
    }
  }

  const { error } = await supabase
    .from('bookings')
    .update(updateData)
    .eq('id', bookingId);

  if (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
}

/**
 * Get next available slot
 */
export async function getNextAvailableSlot(serviceId?: string) {
  const { data, error } = await supabase
    .rpc('get_next_available_slot', {
      p_service_id: serviceId || null
    });

  if (error) {
    console.error('Error getting next available slot:', error);
    throw error;
  }

  return data[0] as {
    date: string;
    time_slot: string;
    team_number: number;
  } | null;
}

/**
 * Calculate booking price
 */
export async function calculateBookingPrice(
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