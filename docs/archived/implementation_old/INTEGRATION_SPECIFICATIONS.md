# Integration Specifications - WebUredno Platform

## Overview
This document outlines the integration requirements and implementation specifications for third-party services in the WebUredno platform.

## 1. Email Service Integration

### Service Provider: SendGrid/Resend
**Status**: 🔄 Design Complete, Implementation Pending

### Email Templates Required

#### 1.1 Booking Confirmation Email
```typescript
interface BookingConfirmationEmail {
  to: string;
  customerName: string;
  bookingNumber: string;
  serviceType: string;
  scheduledDate: string;
  scheduledTime: string;
  address: string;
  price: number;
  teamSize: number;
  estimatedDuration: string;
}

// Croatian Template
Subject: Potvrda rezervacije - ${bookingNumber}
Body:
  Poštovani/a ${customerName},
  
  Vaša rezervacija je uspješno zaprimljena!
  
  Detalji rezervacije:
  - Broj rezervacije: ${bookingNumber}
  - Usluga: ${serviceType}
  - Datum: ${scheduledDate}
  - Vrijeme: ${scheduledTime}
  - Adresa: ${address}
  - Cijena: €${price}
  - Tim: ${teamSize} osoba/e
  - Trajanje: ${estimatedDuration}
  
  Podsjetnik ćete primiti 24 sata prije termina.
  
  S poštovanjem,
  WebUredno tim
```

#### 1.2 Reminder Email (24h before)
```typescript
interface ReminderEmail {
  to: string;
  customerName: string;
  bookingNumber: string;
  scheduledDate: string;
  scheduledTime: string;
  address: string;
  teamLeaderName?: string;
}

// Croatian Template
Subject: Podsjetnik - Sutra dolazimo na čišćenje
Body:
  Poštovani/a ${customerName},
  
  Podsjećamo vas da sutra imamo zakazano čišćenje.
  
  Termin: ${scheduledDate} u ${scheduledTime}
  Adresa: ${address}
  
  Molimo osigurajte pristup prostorima.
  
  Za otkazivanje nazovite: +385 92 450 2265
```

#### 1.3 Service Completed Email
```typescript
interface ServiceCompletedEmail {
  to: string;
  customerName: string;
  bookingNumber: string;
  reviewLink: string;
  nextBookingDate?: string;
}

// Croatian Template
Subject: Hvala vam na povjerenju - Ostavite recenziju
Body:
  Poštovani/a ${customerName},
  
  Nadamo se da ste zadovoljni našom uslugom!
  
  Podijelite svoje iskustvo: ${reviewLink}
  
  ${nextBookingDate ? `Sljedeći termin: ${nextBookingDate}` : ''}
  
  Hvala na povjerenju!
```

### Implementation Code Structure
```typescript
// src/lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBookingConfirmation(data: BookingConfirmationEmail) {
  const { data: email, error } = await resend.emails.send({
    from: 'WebUredno <noreply@uredno.eu>',
    to: [data.to],
    subject: `Potvrda rezervacije - ${data.bookingNumber}`,
    react: BookingConfirmationTemplate(data),
  });
  
  if (error) {
    console.error('Email send failed:', error);
    throw new Error('Failed to send confirmation email');
  }
  
  return email;
}
```

## 2. Google Calendar Integration

### Service: Google Calendar API
**Status**: 🔄 Design Complete, Implementation Pending

### Authentication Setup
```typescript
// Required OAuth2 Scopes
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly'
];

// Service Account Credentials
{
  "type": "service_account",
  "project_id": "weburedno",
  "private_key_id": "xxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\nxxx\n-----END PRIVATE KEY-----\n",
  "client_email": "weburedno-calendar@weburedno.iam.gserviceaccount.com",
  "client_id": "xxx"
}
```

### Calendar Event Creation
```typescript
// src/lib/google-calendar.ts
import { google } from 'googleapis';

interface CalendarEvent {
  bookingNumber: string;
  customerName: string;
  serviceType: string;
  address: string;
  phone: string;
  scheduledDate: string;
  duration: number;
  teamSize: number;
  specialInstructions?: string;
}

export async function createCalendarEvent(data: CalendarEvent) {
  const auth = new google.auth.GoogleAuth({
    keyFile: './credentials.json',
    scopes: SCOPES,
  });
  
  const calendar = google.calendar({ version: 'v3', auth });
  
  const event = {
    summary: `${data.bookingNumber} - ${data.customerName}`,
    description: `
      Usluga: ${data.serviceType}
      Tim: ${data.teamSize} osoba/e
      Telefon: ${data.phone}
      ${data.specialInstructions ? `Napomene: ${data.specialInstructions}` : ''}
    `,
    location: data.address,
    start: {
      dateTime: data.scheduledDate,
      timeZone: 'Europe/Zagreb',
    },
    end: {
      dateTime: addHours(data.scheduledDate, data.duration),
      timeZone: 'Europe/Zagreb',
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 24h before
        { method: 'popup', minutes: 60 },      // 1h before
      ],
    },
  };
  
  const response = await calendar.events.insert({
    calendarId: 'primary',
    resource: event,
  });
  
  return response.data;
}

// Check availability
export async function checkCalendarAvailability(
  date: string,
  duration: number
): Promise<boolean> {
  const auth = new google.auth.GoogleAuth({
    keyFile: './credentials.json',
    scopes: SCOPES,
  });
  
  const calendar = google.calendar({ version: 'v3', auth });
  
  const response = await calendar.freebusy.query({
    requestBody: {
      timeMin: date,
      timeMax: addHours(date, duration),
      timeZone: 'Europe/Zagreb',
      items: [{ id: 'primary' }],
    },
  });
  
  const busy = response.data.calendars?.primary?.busy || [];
  return busy.length === 0;
}
```

## 3. SMS Notification Service

### Service Provider: Twilio/Infobip (Croatian)
**Status**: 📋 Planned

### SMS Templates

```typescript
interface SMSTemplate {
  to: string;  // +385 format
  message: string;
  type: 'reminder' | 'confirmation' | 'cancellation';
}

// Templates
const SMS_TEMPLATES = {
  confirmation: (bookingNumber: string, date: string, time: string) => 
    `WebUredno: Rezervacija ${bookingNumber} potvrđena za ${date} u ${time}. Info: 092 450 2265`,
  
  reminder: (time: string) =>
    `WebUredno: Podsjetnik - sutra u ${time} dolazimo na čišćenje. Za otkazivanje nazovite 092 450 2265`,
  
  cancellation: (bookingNumber: string) =>
    `WebUredno: Rezervacija ${bookingNumber} je otkazana. Za novo zakazivanje: uredno.eu`
};
```

## 4. Payment Processing Integration

### Service Provider: Stripe/PayPal + Croatian Banks
**Status**: 📋 Planned for Phase 2

### Supported Payment Methods
1. **Online Payments**
   - Credit/Debit cards (Visa, Mastercard, Maestro)
   - PayPal
   - Bank transfer (SEPA)

2. **Croatian-Specific**
   - Cash on delivery
   - Invoice for companies (R1 račun)
   - Standing order for recurring services

### Implementation Structure
```typescript
// src/lib/payment.ts
interface PaymentIntent {
  amount: number;
  currency: 'EUR';
  customerId: string;
  bookingId: string;
  paymentMethod: 'card' | 'bank_transfer' | 'cash';
  metadata: {
    bookingNumber: string;
    serviceType: string;
  };
}

export async function createPaymentIntent(data: PaymentIntent) {
  // Stripe implementation for cards
  if (data.paymentMethod === 'card') {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    return await stripe.paymentIntents.create({
      amount: data.amount * 100, // Convert to cents
      currency: data.currency,
      metadata: data.metadata,
    });
  }
  
  // Cash on delivery - just mark as pending
  if (data.paymentMethod === 'cash') {
    return {
      id: `cash_${data.bookingId}`,
      status: 'pending_cash',
      amount: data.amount,
    };
  }
}
```

## 5. WhatsApp Business API

### Service Provider: WhatsApp Business API
**Status**: 📋 Planned for Phase 2

### Message Templates
```typescript
interface WhatsAppMessage {
  to: string;  // +385 format
  template: 'booking_confirmation' | 'reminder' | 'review_request';
  parameters: Record<string, any>;
}

// Croatian templates (require WhatsApp approval)
const WHATSAPP_TEMPLATES = {
  booking_confirmation: {
    name: 'booking_confirmation_hr',
    language: 'hr',
    components: [{
      type: 'body',
      text: 'Poštovani {{1}}, vaša rezervacija {{2}} je potvrđena za {{3}} u {{4}}.'
    }]
  }
};
```

## 6. Integration Environment Variables

```env
# Email Service
RESEND_API_KEY=re_xxx
SENDGRID_API_KEY=SG.xxx

# Google Calendar
GOOGLE_CALENDAR_CLIENT_ID=xxx
GOOGLE_CALENDAR_CLIENT_SECRET=xxx
GOOGLE_CALENDAR_REFRESH_TOKEN=xxx

# SMS Service (Twilio/Infobip)
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+385xxx
INFOBIP_API_KEY=xxx

# Payment Processing
STRIPE_PUBLIC_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# WhatsApp Business
WHATSAPP_API_KEY=xxx
WHATSAPP_PHONE_NUMBER=+385xxx
```

## 7. Integration Testing Checklist

### Email Integration
- [ ] Booking confirmation sends within 1 minute
- [ ] Croatian characters (č, ć, ž, š, đ) display correctly
- [ ] Links in emails are clickable and correct
- [ ] Unsubscribe link works (GDPR compliance)

### Calendar Integration
- [ ] Events created with correct timezone (Europe/Zagreb)
- [ ] Availability checking returns accurate results
- [ ] Recurring bookings create series properly
- [ ] Cancellations remove calendar events

### SMS Integration
- [ ] Croatian phone numbers (+385) validated
- [ ] SMS delivered within 30 seconds
- [ ] Character limit respected (160 chars)
- [ ] Opt-out mechanism works

### Payment Integration
- [ ] Test cards work in sandbox
- [ ] Croatian bank integration tested
- [ ] Refunds process correctly
- [ ] Invoice generation for businesses

## 8. Error Handling & Fallbacks

```typescript
// Retry logic for critical integrations
async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

// Fallback for email failures
async function sendEmailWithFallback(email: EmailData) {
  try {
    // Try primary service (Resend)
    return await sendWithResend(email);
  } catch (error) {
    console.error('Resend failed, trying SendGrid:', error);
    try {
      // Fallback to SendGrid
      return await sendWithSendGrid(email);
    } catch (fallbackError) {
      // Log to database for manual processing
      await logFailedEmail(email);
      throw new Error('All email services failed');
    }
  }
}
```

---

*This document serves as the complete integration specification for the WebUredno platform. Each integration should be implemented following these specifications to ensure consistency and reliability.*