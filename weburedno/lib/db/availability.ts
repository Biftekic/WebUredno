import { supabase } from '@/lib/supabase';
import type { Availability, AvailabilitySlot, TimeSlot } from '@/types/database';
import { format, addDays, startOfDay, parseISO } from 'date-fns';

/**
 * Check availability for a specific date and time slot
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

  return data as Array<{
    team_number: number;
    is_available: boolean;
  }>;
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
    console.error('Error fetching available slots:', error);
    throw error;
  }

  // Transform the data to include team numbers
  const slotsWithTeams = await Promise.all(
    (data || []).map(async (slot: any) => {
      const teams = await checkAvailability(date, slot.time_slot);
      return {
        date,
        time_slot: slot.time_slot,
        available_teams: slot.available_teams,
        team_numbers: teams
          .filter(t => t.is_available)
          .map(t => t.team_number)
      };
    })
  );

  return slotsWithTeams;
}

/**
 * Get all availability for a date range
 */
export async function getAvailabilityRange(
  startDate: Date,
  endDate: Date
): Promise<Availability[]> {
  const start = format(startDate, 'yyyy-MM-dd');
  const end = format(endDate, 'yyyy-MM-dd');

  const { data, error } = await supabase
    .from('availability')
    .select('*')
    .gte('date', start)
    .lte('date', end)
    .eq('is_available', true)
    .order('date', { ascending: true })
    .order('time_slot', { ascending: true })
    .order('team_number', { ascending: true });

  if (error) {
    console.error('Error fetching availability range:', error);
    throw error;
  }

  return data as Availability[];
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
    console.error('Error fetching next available slot:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    return null;
  }

  return data[0] as {
    date: string;
    time_slot: string;
    team_number: number;
  };
}

/**
 * Get available dates for the next N days
 */
export async function getAvailableDates(days: number = 30): Promise<string[]> {
  const today = startOfDay(new Date());
  const endDate = addDays(today, days);

  const { data, error } = await supabase
    .from('availability')
    .select('date')
    .gte('date', format(today, 'yyyy-MM-dd'))
    .lte('date', format(endDate, 'yyyy-MM-dd'))
    .eq('is_available', true)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching available dates:', error);
    throw error;
  }

  // Get unique dates
  const uniqueDates = [...new Set(data?.map(item => item.date) || [])];
  return uniqueDates;
}

/**
 * Reserve a time slot (mark as unavailable)
 */
export async function reserveTimeSlot(
  date: string,
  timeSlot: string,
  teamNumber: number,
  bookingId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('availability')
    .update({
      is_available: false,
      booking_id: bookingId
    })
    .eq('date', date)
    .eq('time_slot', timeSlot)
    .eq('team_number', teamNumber)
    .eq('is_available', true) // Ensure it's still available
    .select();

  if (error) {
    console.error('Error reserving time slot:', error);
    throw error;
  }

  return data && data.length > 0;
}

/**
 * Release a time slot (mark as available)
 */
export async function releaseTimeSlot(bookingId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('availability')
    .update({
      is_available: true,
      booking_id: null
    })
    .eq('booking_id', bookingId)
    .select();

  if (error) {
    console.error('Error releasing time slot:', error);
    throw error;
  }

  return data && data.length > 0;
}

/**
 * Get formatted time slots for display
 */
export function getTimeSlotOptions(): TimeSlot[] {
  return [
    { value: '07:00-09:00', label: '07:00 - 09:00', available: true },
    { value: '09:00-11:00', label: '09:00 - 11:00', available: true },
    { value: '11:00-13:00', label: '11:00 - 13:00', available: true },
    { value: '13:00-15:00', label: '13:00 - 15:00', available: true },
    { value: '15:00-17:00', label: '15:00 - 17:00', available: true },
    { value: '17:00-19:00', label: '17:00 - 19:00', available: true }
  ];
}

/**
 * Check if a specific date is fully booked
 */
export async function isDateFullyBooked(date: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('availability')
    .select('id')
    .eq('date', date)
    .eq('is_available', true)
    .limit(1);

  if (error) {
    console.error('Error checking if date is fully booked:', error);
    throw error;
  }

  return !data || data.length === 0;
}