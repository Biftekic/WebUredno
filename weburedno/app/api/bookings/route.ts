import { NextRequest, NextResponse } from 'next/server';
import { createBooking, getBookingByNumber } from '@/lib/db/bookings';
import { calculateBookingPrice } from '@/lib/db/bookings';
import type { CreateBookingInput } from '@/types/database';

// Create a new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'customer',
      'service_id',
      'booking_date',
      'time_slot',
      'service_type',
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate customer data
    const customerFields = ['first_name', 'last_name', 'email', 'phone'];
    for (const field of customerFields) {
      if (!body.customer[field]) {
        return NextResponse.json(
          { error: `Missing customer field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Calculate final price if not provided
    if (!body.total_price && body.service_id) {
      const priceData = await calculateBookingPrice(
        body.service_id,
        body.property_size,
        body.extras
      );
      body.total_price = priceData.total_price;
    }

    // Create the booking
    const booking = await createBooking(body as CreateBookingInput);

    return NextResponse.json(
      {
        success: true,
        booking,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating booking:', error);

    // Handle specific errors
    if (error.message?.includes('Odabrani termin više nije dostupan')) {
      return NextResponse.json(
        { error: 'Selected time slot is no longer available' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create booking' },
      { status: 500 }
    );
  }
}

// Get booking by booking number
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingNumber = searchParams.get('booking_number');

    if (!bookingNumber) {
      return NextResponse.json(
        { error: 'Booking number is required' },
        { status: 400 }
      );
    }

    const booking = await getBookingByNumber(bookingNumber);

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ booking });
  } catch (error: any) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}