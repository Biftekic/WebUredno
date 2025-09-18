# Google Calendar Integration

## Overview
Integration with Google Calendar API for automated booking management and scheduling.

## Architecture

```
┌──────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│   User Books     │────▶│  Next.js API    │────▶│ Google Calendar  │
│   on Website     │     │   Routes        │     │      API         │
└──────────────────┘     └─────────────────┘     └──────────────────┘
         │                        │                        │
         │                        ▼                        ▼
         │               ┌─────────────────┐     ┌──────────────────┐
         └──────────────▶│   Database      │     │  Staff Calendar  │
                        │   (Optional)    │     │   (Read/Write)   │
                        └─────────────────┘     └──────────────────┘
```

## Google Calendar API Setup

### 1. Prerequisites
```
- Google Cloud Platform account
- Project with Calendar API enabled
- Service account for server-to-server auth
- OAuth 2.0 for user calendar access (optional)
```

### 2. API Configuration
```typescript
// lib/google-calendar/config.ts
export const GOOGLE_CALENDAR_CONFIG = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
  serviceAccount: {
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
  },
  calendarId: process.env.GOOGLE_CALENDAR_ID, // Main business calendar
};
```

### 3. Authentication Flow

#### Service Account (Recommended)
```typescript
// lib/google-calendar/auth.ts
import { google } from 'googleapis';

export async function getCalendarClient() {
  const auth = new google.auth.JWT({
    email: GOOGLE_CALENDAR_CONFIG.serviceAccount.email,
    key: GOOGLE_CALENDAR_CONFIG.serviceAccount.privateKey,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });

  await auth.authorize();

  return google.calendar({ version: 'v3', auth });
}
```

## Booking System Implementation

### 1. Check Availability
```typescript
// app/api/availability/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const serviceType = searchParams.get('service');

  const calendar = await getCalendarClient();

  // Get busy times
  const response = await calendar.freebusy.query({
    requestBody: {
      timeMin: startOfDay(date),
      timeMax: endOfDay(date),
      items: [{ id: GOOGLE_CALENDAR_CONFIG.calendarId }],
    },
  });

  // Calculate available slots
  const availableSlots = calculateAvailableSlots(
    response.data.calendars[calendarId].busy,
    serviceType
  );

  return NextResponse.json({ availableSlots });
}
```

### 2. Create Booking
```typescript
// app/api/bookings/route.ts
export async function POST(request: Request) {
  const bookingData = await request.json();

  const calendar = await getCalendarClient();

  const event = {
    summary: `Čišćenje - ${bookingData.customerName}`,
    description: formatBookingDescription(bookingData),
    location: bookingData.address,
    start: {
      dateTime: bookingData.startTime,
      timeZone: 'Europe/Zagreb',
    },
    end: {
      dateTime: bookingData.endTime,
      timeZone: 'Europe/Zagreb',
    },
    attendees: [
      { email: bookingData.customerEmail },
    ],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 1 day before
        { method: 'email', minutes: 60 },      // 1 hour before
      ],
    },
    extendedProperties: {
      private: {
        bookingId: bookingData.id,
        serviceType: bookingData.serviceType,
        price: bookingData.price,
        status: 'confirmed',
      },
    },
  };

  const response = await calendar.events.insert({
    calendarId: GOOGLE_CALENDAR_CONFIG.calendarId,
    requestBody: event,
    sendUpdates: 'all', // Send email to attendees
  });

  return NextResponse.json({
    success: true,
    eventId: response.data.id,
    htmlLink: response.data.htmlLink,
  });
}
```

### 3. Update/Cancel Booking
```typescript
// app/api/bookings/[id]/route.ts
export async function PATCH(request: Request, { params }) {
  const { id } = params;
  const updates = await request.json();

  const calendar = await getCalendarClient();

  if (updates.status === 'cancelled') {
    await calendar.events.delete({
      calendarId: GOOGLE_CALENDAR_CONFIG.calendarId,
      eventId: id,
      sendUpdates: 'all',
    });
  } else {
    await calendar.events.patch({
      calendarId: GOOGLE_CALENDAR_CONFIG.calendarId,
      eventId: id,
      requestBody: formatEventUpdate(updates),
      sendUpdates: 'all',
    });
  }

  return NextResponse.json({ success: true });
}
```

## Availability Management

### Business Hours Configuration
```typescript
const BUSINESS_HOURS = {
  monday: { start: '08:00', end: '20:00' },
  tuesday: { start: '08:00', end: '20:00' },
  wednesday: { start: '08:00', end: '20:00' },
  thursday: { start: '08:00', end: '20:00' },
  friday: { start: '08:00', end: '20:00' },
  saturday: { start: '09:00', end: '18:00' },
  sunday: { start: '10:00', end: '16:00' },
};

const SLOT_DURATION = {
  'standard': 120,        // 2 hours
  'deep-clean': 240,      // 4 hours
  'move-in-out': 300,     // 5 hours
  'airbnb': 90,          // 1.5 hours
  'commercial': 180,      // 3 hours
};
```

### Slot Calculation
```typescript
function calculateAvailableSlots(
  busyTimes: BusyTime[],
  serviceType: string,
  date: Date
): TimeSlot[] {
  const dayOfWeek = format(date, 'EEEE').toLowerCase();
  const businessHours = BUSINESS_HOURS[dayOfWeek];
  const slotDuration = SLOT_DURATION[serviceType];

  // Generate all possible slots
  const allSlots = generateTimeSlots(
    businessHours.start,
    businessHours.end,
    slotDuration
  );

  // Filter out busy times
  return allSlots.filter(slot =>
    !isSlotBusy(slot, busyTimes)
  );
}
```

## Webhook Integration

### Calendar Watch for Updates
```typescript
// app/api/webhooks/calendar/route.ts
export async function POST(request: Request) {
  const notification = await request.json();

  if (notification.resourceState === 'exists') {
    // Handle calendar event updates
    const event = await getCalendarEvent(notification.resourceId);

    switch (notification.changeType) {
      case 'created':
        await handleNewBooking(event);
        break;
      case 'updated':
        await handleBookingUpdate(event);
        break;
      case 'deleted':
        await handleBookingCancellation(event);
        break;
    }
  }

  return NextResponse.json({ received: true });
}
```

## Email Notifications

### Booking Confirmation Template
```html
Subject: Potvrda rezervacije - WebUredno

Poštovani/a {{customerName}},

Vaša rezervacija je potvrđena!

Detalji rezervacije:
- Usluga: {{serviceType}}
- Datum: {{date}}
- Vrijeme: {{time}}
- Adresa: {{address}}
- Cijena: {{price}} €

Kalendarski događaj je automatski dodan u vaš Google kalendar.

Možete upravljati svojom rezervacijom putem linka:
{{managementLink}}

Hvala vam na povjerenju!
Tim WebUredno
```

## Security Considerations

1. **API Key Security**
   - Store in environment variables
   - Never expose in client-side code
   - Rotate regularly

2. **Rate Limiting**
   - Implement request throttling
   - Cache availability queries
   - Batch calendar operations

3. **Data Privacy**
   - Minimal data in calendar events
   - Encrypt sensitive information
   - GDPR compliance for EU customers

## Error Handling

```typescript
class CalendarError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message);
  }
}

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1 || !isRetryable(error)) {
        throw error;
      }
      await sleep(Math.pow(2, i) * 1000); // Exponential backoff
    }
  }
}
```

## Testing Strategy

1. **Unit Tests**: Mock Google Calendar API responses
2. **Integration Tests**: Use test calendar
3. **E2E Tests**: Full booking flow with real calendar
4. **Load Tests**: Concurrent booking handling