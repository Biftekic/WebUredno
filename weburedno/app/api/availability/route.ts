import { NextRequest, NextResponse } from 'next/server';
import { getAvailableSlots, checkAvailability, getNextAvailableSlot } from '@/lib/db/bookings';
import { format, addDays } from 'date-fns';

// Get availability for a specific date or date range
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const timeSlot = searchParams.get('time_slot');
    const days = searchParams.get('days');
    const serviceId = searchParams.get('service_id');

    // Get next available slot
    if (searchParams.get('next') === 'true') {
      const nextSlot = await getNextAvailableSlot(serviceId || undefined);
      return NextResponse.json({ nextSlot });
    }

    // Check specific time slot availability
    if (date && timeSlot) {
      const availability = await checkAvailability(date, timeSlot);
      return NextResponse.json({ availability });
    }

    // Get available slots for a specific date
    if (date && !timeSlot) {
      const slots = await getAvailableSlots(date);
      return NextResponse.json({ slots });
    }

    // Get availability for multiple days
    if (days) {
      const numDays = parseInt(days, 10);
      if (isNaN(numDays) || numDays < 1 || numDays > 30) {
        return NextResponse.json(
          { error: 'Days must be between 1 and 30' },
          { status: 400 }
        );
      }

      const dates = [];
      const today = new Date();
      for (let i = 1; i <= numDays; i++) {
        const date = addDays(today, i);
        // Skip Sundays
        if (date.getDay() !== 0) {
          dates.push(format(date, 'yyyy-MM-dd'));
        }
      }

      const availability: Record<string, any> = {};
      for (const dateStr of dates) {
        availability[dateStr] = await getAvailableSlots(dateStr);
      }

      return NextResponse.json({ availability });
    }

    return NextResponse.json(
      { error: 'Please provide date or days parameter' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}