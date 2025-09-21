import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';

// Validation schemas
const checkAvailabilitySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Datum mora biti u formatu YYYY-MM-DD'),
  time_slot: z.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, 'Vrijeme mora biti u formatu HH:MM-HH:MM'),
  duration_hours: z.number().min(1).max(8).optional().default(2),
  service_type: z.string().optional()
});

const createEventSchema = z.object({
  booking_id: z.string().uuid(),
  title: z.string(),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time_slot: z.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/),
  location: z.object({
    address: z.string(),
    city: z.string().optional(),
    postal_code: z.string().optional()
  }).optional(),
  attendees: z.array(z.object({
    email: z.string().email(),
    name: z.string().optional()
  })).optional()
});

// Google Calendar configuration
const CALENDAR_CONFIG = {
  CALENDAR_ID: process.env.GOOGLE_CALENDAR_ID || 'primary',
  TIME_ZONE: 'Europe/Zagreb',
  BUSINESS_HOURS: {
    start: '08:00',
    end: '18:00'
  },
  SLOT_DURATION: 2, // hours
  BUFFER_TIME: 30, // minutes between bookings
  MAX_TEAMS: 3,
  COLORS: {
    confirmed: '2', // green
    pending: '5', // yellow
    cancelled: '11' // red
  }
};

// Mock Google Calendar API client (replace with actual implementation)
// In production, use @googleapis/calendar or similar
class GoogleCalendarService {
  private accessToken: string | null = null;

  constructor() {
    // In production, initialize with OAuth2 credentials
    this.accessToken = process.env.GOOGLE_CALENDAR_ACCESS_TOKEN || null;
  }

  // Check if credentials are configured
  isConfigured(): boolean {
    return Boolean(
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      (process.env.GOOGLE_REFRESH_TOKEN || this.accessToken)
    );
  }

  // Get available time slots for a date
  async getAvailableSlots(date: string): Promise<any[]> {
    // In production, this would query Google Calendar API
    // For now, return mock data based on database

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('time_slot, team_number, status')
      .eq('booking_date', date)
      .neq('status', 'cancelled');

    if (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }

    // Generate all possible time slots
    const allSlots = [
      '08:00-10:00',
      '10:00-12:00',
      '12:00-14:00',
      '14:00-16:00',
      '16:00-18:00'
    ];

    // Calculate availability for each slot
    const availability = allSlots.map(slot => {
      const slotBookings = bookings?.filter(b => b.time_slot === slot) || [];
      const bookedTeams = slotBookings.map(b => b.team_number);
      const availableTeams = [];

      for (let team = 1; team <= CALENDAR_CONFIG.MAX_TEAMS; team++) {
        if (!bookedTeams.includes(team)) {
          availableTeams.push(team);
        }
      }

      return {
        time_slot: slot,
        available: availableTeams.length > 0,
        available_teams: availableTeams.length,
        team_numbers: availableTeams
      };
    });

    return availability;
  }

  // Create calendar event
  async createEvent(eventData: any): Promise<any> {
    // In production, this would create an event via Google Calendar API

    if (!this.isConfigured()) {
      console.warn('Google Calendar not configured, skipping event creation');
      return {
        id: `mock_${Date.now()}`,
        status: 'mock',
        htmlLink: '#'
      };
    }

    // Mock implementation
    const mockEvent = {
      id: `gcal_${eventData.booking_id}`,
      summary: eventData.title,
      description: eventData.description,
      start: {
        dateTime: `${eventData.date}T${eventData.time_slot.split('-')[0]}:00`,
        timeZone: CALENDAR_CONFIG.TIME_ZONE
      },
      end: {
        dateTime: `${eventData.date}T${eventData.time_slot.split('-')[1]}:00`,
        timeZone: CALENDAR_CONFIG.TIME_ZONE
      },
      location: eventData.location ?
        `${eventData.location.address}, ${eventData.location.city} ${eventData.location.postal_code}` :
        undefined,
      attendees: eventData.attendees,
      colorId: CALENDAR_CONFIG.COLORS.confirmed,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 60 } // 1 hour before
        ]
      },
      status: 'confirmed',
      created: new Date().toISOString()
    };

    // Store event reference in database
    await supabase
      .from('calendar_events')
      .upsert([{
        booking_id: eventData.booking_id,
        google_event_id: mockEvent.id,
        event_data: mockEvent,
        created_at: new Date().toISOString()
      }]);

    return mockEvent;
  }

  // Update calendar event
  async updateEvent(eventId: string, updates: any): Promise<any> {
    // In production, this would update via Google Calendar API

    if (!this.isConfigured()) {
      console.warn('Google Calendar not configured, skipping event update');
      return { id: eventId, status: 'mock_updated' };
    }

    // Update in database
    await supabase
      .from('calendar_events')
      .update({
        event_data: updates,
        updated_at: new Date().toISOString()
      })
      .eq('google_event_id', eventId);

    return { ...updates, id: eventId };
  }

  // Delete calendar event
  async deleteEvent(eventId: string): Promise<void> {
    // In production, this would delete via Google Calendar API

    if (!this.isConfigured()) {
      console.warn('Google Calendar not configured, skipping event deletion');
      return;
    }

    // Mark as deleted in database
    await supabase
      .from('calendar_events')
      .update({
        deleted_at: new Date().toISOString()
      })
      .eq('google_event_id', eventId);
  }
}

// Initialize calendar service
const calendarService = new GoogleCalendarService();

// GET /api/calendar/availability - Check calendar availability
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const service_type = searchParams.get('service_type');

    if (!date) {
      return NextResponse.json(
        {
          error: 'Datum je obavezan'
        },
        { status: 400 }
      );
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        {
          error: 'Neispravan format datuma',
          message: 'Koristite format YYYY-MM-DD'
        },
        { status: 400 }
      );
    }

    // Check if date is not in the past
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return NextResponse.json(
        {
          error: 'Neispravan datum',
          message: 'Ne možete odabrati datum u prošlosti'
        },
        { status: 400 }
      );
    }

    // Get available slots from calendar
    const availableSlots = await calendarService.getAvailableSlots(date);

    // Format response with Croatian labels
    const formattedSlots = availableSlots.map(slot => ({
      ...slot,
      label: slot.time_slot.replace('-', ' - '),
      status_text: slot.available ?
        `Dostupno (${slot.available_teams} ${slot.available_teams === 1 ? 'tim' : 'tima'})` :
        'Zauzeto'
    }));

    return NextResponse.json({
      success: true,
      data: {
        date,
        day_name: new Intl.DateTimeFormat('hr-HR', { weekday: 'long' }).format(selectedDate),
        slots: formattedSlots,
        summary: {
          total_slots: formattedSlots.length,
          available_slots: formattedSlots.filter(s => s.available).length,
          fully_booked: formattedSlots.every(s => !s.available)
        }
      }
    });

  } catch (error) {
    console.error('Calendar availability error:', error);
    return NextResponse.json(
      {
        error: 'Greška pri provjeri dostupnosti',
        message: error instanceof Error ? error.message : 'Nepoznata greška'
      },
      { status: 500 }
    );
  }
}

// POST /api/calendar/event - Create calendar event for booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = createEventSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Neispravni podaci',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const eventData = validationResult.data;

    // Fetch booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(*),
        service:services(*)
      `)
      .eq('id', eventData.booking_id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        {
          error: 'Rezervacija nije pronađena'
        },
        { status: 404 }
      );
    }

    // Prepare event details
    const calendarEvent = {
      booking_id: eventData.booking_id,
      title: eventData.title || `Čišćenje - ${booking.customer?.first_name} ${booking.customer?.last_name}`,
      description: eventData.description || `
        Usluga: ${booking.service?.name || booking.service_type}
        Klijent: ${booking.customer?.first_name} ${booking.customer?.last_name}
        Telefon: ${booking.customer?.phone}
        Email: ${booking.customer?.email || 'N/A'}
        Posebni zahtjevi: ${booking.special_requests || 'Nema'}
        Tim: ${booking.team_number || 'TBD'}
      `.trim(),
      date: eventData.date,
      time_slot: eventData.time_slot,
      location: eventData.location || {
        address: booking.customer?.address || '',
        city: booking.customer?.city || 'Zagreb',
        postal_code: booking.customer?.postal_code || ''
      },
      attendees: eventData.attendees || (booking.customer?.email ? [{
        email: booking.customer.email,
        name: `${booking.customer.first_name} ${booking.customer.last_name}`
      }] : [])
    };

    // Create calendar event
    const createdEvent = await calendarService.createEvent(calendarEvent);

    return NextResponse.json({
      success: true,
      message: 'Događaj uspješno kreiran u kalendaru',
      data: {
        event_id: createdEvent.id,
        booking_id: eventData.booking_id,
        calendar_link: createdEvent.htmlLink || '#'
      }
    });

  } catch (error) {
    console.error('Calendar event creation error:', error);
    return NextResponse.json(
      {
        error: 'Greška pri kreiranju događaja',
        message: error instanceof Error ? error.message : 'Nepoznata greška'
      },
      { status: 500 }
    );
  }
}

// PATCH /api/calendar/event/:id - Update calendar event
export async function PATCH(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const eventId = pathParts[pathParts.length - 1];

    if (!eventId) {
      return NextResponse.json(
        {
          error: 'ID događaja je obavezan'
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Update calendar event
    const updatedEvent = await calendarService.updateEvent(eventId, body);

    return NextResponse.json({
      success: true,
      message: 'Događaj uspješno ažuriran',
      data: updatedEvent
    });

  } catch (error) {
    console.error('Calendar update error:', error);
    return NextResponse.json(
      {
        error: 'Greška pri ažuriranju događaja',
        message: error instanceof Error ? error.message : 'Nepoznata greška'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/calendar/event/:id - Delete calendar event
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const eventId = pathParts[pathParts.length - 1];

    if (!eventId) {
      return NextResponse.json(
        {
          error: 'ID događaja je obavezan'
        },
        { status: 400 }
      );
    }

    // Delete calendar event
    await calendarService.deleteEvent(eventId);

    return NextResponse.json({
      success: true,
      message: 'Događaj uspješno obrisan'
    });

  } catch (error) {
    console.error('Calendar deletion error:', error);
    return NextResponse.json(
      {
        error: 'Greška pri brisanju događaja',
        message: error instanceof Error ? error.message : 'Nepoznata greška'
      },
      { status: 500 }
    );
  }
}