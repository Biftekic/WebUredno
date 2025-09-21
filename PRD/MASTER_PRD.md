# MASTER PRD - WebUredno
## Complete Product Requirements & Configuration
### Consolidation of FINAL_PRD_CONSOLIDATED.md + FINAL_CONFIGURATION.md + README Overview

---

## Table of Contents

1. [Executive Summary & Quick Reference](#1-executive-summary--quick-reference)
2. [Product Requirements Document](#2-product-requirements-document)
3. [Configuration & Setup](#3-configuration--setup)
4. [Documentation Index](#4-documentation-index)

---

# 1. Executive Summary & Quick Reference

## 🎯 Quick Reference - Key Business Details

| Detail | Value |
|--------|-------|
| **Company OIB** | 68964256322 |
| **Teams** | 3 cleaning teams |
| **Working Hours** | Monday-Saturday, 7:00-15:00 |
| **WhatsApp Business** | +385 92 450 2265 |
| **Google Calendar ID** | 02ff9b19d12ca44fda1dc9d4f6b628aa30663578b36f6c403d6f1b81e74e2664@group.calendar.google.com |
| **Domain** | uredno.eu |
| **Language** | Croatian only |
| **Payment** | On-site only (Cash, Card, Bank Transfer) |
| **Supplies Included** | Deep cleaning, Move in/out, Office cleaning |
| **Customer Supplies** | Standard cleaning only |
| **PerfexCRM** | Already integrated |
| **Google Workspace** | Full suite for management |
| **Emergency Service** | Available with +30% surcharge |
| **Discounts** | Weekly -10%, Bi-weekly -5% |

## 📋 Executive Summary

**Product**: WebUredno - Professional cleaning service website
**Goal**: Create a MyClean.com-inspired website adapted for Croatian market
**Target**: 150+ qualified leads per month
**Approach**: Mobile-first, WhatsApp-integrated, real-time availability

---

# 2. Product Requirements Document

## 1. Core Features Implementation

### 1.1 Homepage Structure
```
1. HERO SECTION
   - Headline: "Profesionalno Čišćenje u Zagrebu"
   - Subheadline: "Više vremena za ono što volite. Od 45€."
   - CTA: "Rezerviraj u 60 sekundi"
   - Trust badges: "10 godina iskustva" | "5000+ čišćenja" | "Osigurani"

2. INSTANT PRICE CALCULATOR
   - Service type selector
   - Apartment size dropdown
   - Location input (for distance calculation)
   - Live price display

3. SERVICES GRID (8 cards)
   - Standardno Čišćenje (60 točaka)
   - Dubinsko Čišćenje (75 točaka)
   - Čišćenje nakon Selidbe
   - Čišćenje Ureda
   - Airbnb Čišćenje
   - Airbnb Jednodnevni Najam Čišćenje
   - Održavanje Okućnice i Košnja Trave
   - Generalno Čišćenje (Useljenje/Iseljenje)

4. HOW IT WORKS (3 steps)
   - Odaberite uslugu i termin
   - Potvrdite preko WhatsApp
   - Opustite se dok mi čistimo

5. COVERAGE AREA MAP
   - Interactive map showing Zagreb + 70km
   - List of covered neighborhoods

6. TESTIMONIALS CAROUSEL
   - 5-10 customer reviews
   - Star ratings
   - Customer names and areas

7. FAQ SECTION
   - Searchable/expandable
   - 20+ common questions

8. FOOTER
   - Contact info
   - Service links
   - Legal pages
   - Social media
```

### 1.2 Booking Flow (3 Steps)

#### Step 1: Service Selection
```typescript
interface ServiceStep {
  serviceType: 'standard' | 'deep' | 'moving' | 'office' | 'airbnb' | 'moveinout';
  apartmentSize: 'garsonijera' | 'jednosoban' | 'dvosoban' | 'trosoban' | 'kuca';
  rooms: number; // 1-5+
  bathrooms: number; // 1-3+
  extras: {
    recurring: 'none' | 'weekly' | 'biweekly' | 'monthly';
    notes: string; // For recurring details
  };
}

// Price calculation
BASE_RATE = 15€/hour per person
MINIMUM_PRICES = {
  standard: 45€,
  deep: 60€,
  moving: 75€,
  office: 60€,
  airbnb: "od 25€", // Cijena ovisi o učestalosti i veličini prostora
  moveinout: 70€
}

// Airbnb Special Pricing
// Cijena se formira prema učestalosti čišćenja i veličini prostora
AIRBNB_PRICING = {
  // Od 25 EUR - cijena ovisi o učestalosti i veličini prostora
  // Konačna cijena se određuje prema:
  // - Broju čišćenja mjesečno
  // - Veličini prostora (garsonijera, 1-sobni, 2-sobni, itd.)
  // - Udaljenosti od centra
  starting_price: "od 25€"  // Početna cijena
}

// Duration estimates
DURATION_MATRIX = {
  standard: {
    garsonijera: 3h/1person,
    jednosoban: 3h/1person,
    dvosoban: 2.5h/2persons,
    trosoban: 3h/2persons,
    kuca: 4h/2persons
  },
  deep: {
    garsonijera: 4h/1person,
    jednosoban: 4h/1person,
    dvosoban: 3h/2persons,
    trosoban: 3.5h/2persons,
    kuca: 5h/2persons
  },
  moving: {
    garsonijera: 5h/1person,
    jednosoban: 5h/1person,
    dvosoban: 3.5h/2persons,
    trosoban: 4h/2persons,
    kuca: 5h/2persons
  },
  office: {
    garsonijera: 4h/1person,
    jednosoban: 4h/1person,
    dvosoban: 3h/2persons,
    trosoban: 3.5h/2persons,
    kuca: 5h/2persons
  },
  airbnb: {
    garsonijera: 3h/1person,
    jednosoban: 3h/1person,
    dvosoban: 2.5h/2persons,
    trosoban: 3h/2persons,
    kuca: 4h/2persons
  },
  moveinout: {
    garsonijera: 4.5h/1person,
    jednosoban: 4.5h/1person,
    dvosoban: 3.5h/2persons,
    trosoban: 4h/2persons,
    kuca: 5h/2persons
  }
}
```

#### Step 2: Date & Time Selection
```typescript
interface ScheduleStep {
  selectedDate: Date; // Max 30 days advance
  selectedTime: string; // 7:00-15:00 slots
  availability: {
    date: Date;
    slots: Array<{
      time: string;
      teamsAvailable: number; // Max 3
      available: boolean;
    }>;
  };
}

// Time slots
AVAILABLE_SLOTS = [
  '07:00-10:00',
  '08:00-11:00',
  '09:00-12:00',
  '10:00-13:00',
  '11:00-14:00',
  '12:00-15:00'
];
```

#### Step 3: Contact Information
```typescript
interface ContactStep {
  firstName: string;
  lastName: string;
  phone: string; // +385 validation
  email?: string; // Optional
  address: string;
  city: string;
  zipCode?: string;
  entrance?: string; // Building entrance details
  specialInstructions?: string;
  paymentMethod: 'cash' | 'card' | 'transfer';
}

// Distance calculation
DISTANCE_FEES = {
  '0-20km': 0€,
  '20-40km': +10€ per person,
  '40-60km': +20€ per person,
  '60-70km': +30€ per person
}
```

### 1.3 Real-time Calendar Integration

```javascript
// Google Calendar API Integration
const checkAvailability = async (date, time) => {
  const calendar = google.calendar({ version: 'v3', auth });

  const events = await calendar.events.list({
    calendarId: '02ff9b19d12ca44fda1dc9d4f6b628aa30663578b36f6c403d6f1b81e74e2664@group.calendar.google.com',
    timeMin: startTime,
    timeMax: endTime,
    singleEvents: true
  });

  const bookedTeams = events.data.items?.length || 0;
  const availableTeams = 3 - bookedTeams;

  return {
    available: availableTeams > 0,
    teamsAvailable: availableTeams,
    canBook: true
  };
};

// Create booking
const createBooking = async (bookingData) => {
  const event = {
    summary: `Čišćenje - ${bookingData.name}`,
    location: `${bookingData.address}, ${bookingData.city}`,
    description: `
      Usluga: ${bookingData.service}
      Telefon: ${bookingData.phone}
      Cijena: ${bookingData.price}€
      Napomene: ${bookingData.notes}
    `,
    start: { dateTime: bookingData.startTime },
    end: { dateTime: bookingData.endTime }
  };

  await calendar.events.insert({
    calendarId: CALENDAR_ID,
    resource: event
  });
};
```

### 1.4 WhatsApp Integration

```javascript
// WhatsApp Business Link Generation
const generateWhatsAppLink = (booking) => {
  const phone = '385924502265';
  const message = encodeURIComponent(`
🏠 NOVA REZERVACIJA - WebUredno
━━━━━━━━━━━━━━━━━━
📅 Datum: ${booking.date}
⏰ Vrijeme: ${booking.time}
🧹 Usluga: ${getServiceName(booking.service)}
📏 Veličina: ${booking.size}
💰 Cijena: ${booking.price}€
📍 Lokacija: ${booking.city} (${booking.distance}km od Zagreba)

KONTAKT:
👤 ${booking.name}
📞 ${booking.phone}
${booking.email ? `📧 ${booking.email}` : ''}
📍 ${booking.address}
💳 Plaćanje: ${booking.paymentMethod}

${booking.recurring !== 'none' ? `🔄 Želja za ponavljanjem: ${booking.recurring}` : ''}
${booking.notes ? `📝 Napomene: ${booking.notes}` : ''}
  `);

  return `https://wa.me/${phone}?text=${message}`;
};

// Auto-redirect after form submission
const handleBookingSubmit = async (data) => {
  // Save to calendar
  await createBooking(data);

  // Generate WhatsApp link
  const waLink = generateWhatsAppLink(data);

  // Track conversion
  gtag('event', 'booking_completed', {
    value: data.price,
    currency: 'EUR',
    service: data.service
  });

  // Redirect to WhatsApp
  window.location.href = waLink;
};
```

## 2. Design System Implementation

### 2.1 Color Scheme
```scss
// Primary Palette
$primary: #2563EB;        // MyClean-inspired blue
$primary-dark: #1E40AF;
$primary-light: #EFF6FF;

// Secondary
$success: #10B981;        // Available/confirmed
$warning: #F59E0B;        // Attention needed
$error: #EF4444;          // Errors/unavailable

// Neutrals
$gray-900: #111827;       // Main text
$gray-600: #4B5563;       // Secondary text
$gray-100: #F3F4F6;       // Backgrounds
```

### 2.2 Mobile-First Responsive
```scss
// Breakpoints
$mobile: 320px;
$tablet: 768px;
$desktop: 1024px;
$wide: 1280px;

// Mobile-first approach
.booking-form {
  padding: 1rem;

  @media (min-width: $tablet) {
    padding: 2rem;
    max-width: 600px;
    margin: 0 auto;
  }

  @media (min-width: $desktop) {
    max-width: 800px;
  }
}
```

## 3. Trust Building Elements

### 3.1 Social Proof
- "10 godina iskustva" badge
- "5000+ zadovoljnih klijenata" counter
- "4.9/5 prosječna ocjena" stars
- Customer testimonials with photos
- Before/after gallery
- Corporate clients showcase: Inter S.T.E.E.L., MGZ Muzej Grada Zagreba, Scardona, Ledeni Park, ArhiBau

### 3.2 Security & Trust
- "Osigurani do 100.000€" badge
- "Provjereni zaposlenici" icon
- "48h garancija zadovoljstva" guarantee
- SSL certificate badge
- Clear cancellation policy

### 3.3 Transparency
- Upfront pricing (no hidden fees)
- Clear service checklists
- Team arrival time guarantee
- Equipment/supplies clarity
- Distance fee calculator

### 3.4 Unique Advantages
- **Steam Cleaning Technology** - Parno čišćenje included (revolutionary deep cleaning)
- **100% Eco-Friendly** - Certificirani eko proizvodi standard
- **Emergency Service** - Same-day service available (+30% surcharge)
- **Real-time Calendar** - Google Calendar integration for live availability
- **Corporate Experience** - Trusted by leading Zagreb companies
- **Loyalty Discounts** - Weekly -10%, Bi-weekly -5%

## 4. SEO & Content Strategy

### 4.1 On-Page SEO
```html
<!-- Meta tags for each page -->
<title>Profesionalno Čišćenje Zagreb | WebUredno - Od 45€</title>
<meta name="description" content="Pouzdane usluge čišćenja u Zagrebu i okolici. ✓ 10 godina iskustva ✓ Osigurani ✓ Od 45€. Rezervirajte online u 60 sekundi.">
<meta name="keywords" content="čišćenje zagreb, profesionalno čišćenje, čistačica zagreb, dubinsko čišćenje, čišćenje stana">

<!-- Local Business Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "WebUredno",
  "image": "https://uredno.eu/logo.png",
  "telephone": "+385924502265",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Zagreb",
    "addressCountry": "HR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 45.8150,
    "longitude": 15.9819
  },
  "url": "https://uredno.eu",
  "openingHours": "Mo-Sa 07:00-15:00",
  "priceRange": "€€"
}
</script>
```

### 4.2 Content Pages (SEO)
1. `/ciscenje-zagreb` - Main service page
2. `/dubinsko-ciscenje` - Deep cleaning
3. `/ciscenje-nakon-selidbe` - Move-in/out
4. `/ciscenje-ureda` - Office cleaning
5. `/podrucja/[neighborhood]` - Area pages
6. `/cjenik` - Pricing page
7. `/o-nama` - About us
8. `/kontakt` - Contact
9. `/blog` - SEO articles

## 5. Analytics & Tracking

### 5.1 Key Events
```javascript
// Google Analytics 4 Events
gtag('event', 'view_item', {
  currency: 'EUR',
  value: price,
  items: [{
    item_name: serviceName,
    price: price,
    quantity: 1
  }]
});

gtag('event', 'begin_checkout', {
  currency: 'EUR',
  value: price,
  items: [{ item_name: serviceName }]
});

gtag('event', 'purchase', {
  transaction_id: bookingId,
  value: price,
  currency: 'EUR',
  items: [{ item_name: serviceName }]
});
```

### 5.2 Conversion Goals
- Primary: Booking completion
- Secondary: WhatsApp click
- Tertiary: Price calculator use
- Quaternary: FAQ engagement

## 6. PerfexCRM Integration

### 6.1 Data Flow
```
Website → Booking Form → Two Actions:
1. Google Calendar (availability/booking)
2. PerfexCRM (customer/invoice)
3. WhatsApp (customer notification)
```

### 6.2 CRM Fields Mapping
```javascript
const perfexPayload = {
  customer: {
    company: `${booking.firstName} ${booking.lastName}`,
    phonenumber: booking.phone,
    email: booking.email || '',
    address: booking.address,
    city: booking.city,
    state: 'Zagreb',
    country: 'Croatia'
  },
  invoice: {
    clientid: customerId,
    date: booking.date,
    duedate: booking.date,
    status: 'unpaid',
    items: [{
      description: `${booking.service} - ${booking.size}`,
      qty: 1,
      rate: booking.price
    }]
  }
};
```

## 7. Launch Checklist

### 7.1 Pre-Launch Requirements
- [ ] Collect 10+ customer testimonials
- [ ] Take before/after photos (20+ sets)
- [ ] Team photos in uniforms
- [ ] Company logo files
- [ ] Google Calendar API credentials
- [ ] WhatsApp Business account verified
- [ ] Domain DNS access
- [ ] SSL certificate
- [ ] Privacy policy written
- [ ] Terms of service written

### 7.2 Development Phases
```
PHASE 1 (Week 1-2): Core Development
- Next.js setup with shadcn/ui
- Homepage with all sections
- Booking form (3 steps)
- Calendar integration
- WhatsApp link generation
- Mobile optimization

PHASE 2 (Week 3): Integrations & Testing
- Google Calendar API testing
- PerfexCRM integration
- GA4 implementation
- Cross-browser testing
- Performance optimization
- SEO implementation

PHASE 3 (Week 4): Launch
- Content population
- Final testing
- DNS configuration
- Go-live
- Monitor & adjust
```

## 8. Technical Specifications

### 8.1 Tech Stack
```json
{
  "frontend": {
    "framework": "Next.js 14 App Router",
    "ui": "shadcn/ui",
    "styling": "Tailwind CSS",
    "animations": "Framer Motion"
  },
  "backend": {
    "api": "Next.js API Routes",
    "calendar": "Google Calendar API",
    "crm": "PerfexCRM API"
  },
  "deployment": {
    "hosting": "Vercel",
    "domain": "uredno.eu",
    "cdn": "Vercel Edge"
  }
}
```

### 8.2 Performance Targets
- Lighthouse Mobile: >90
- Page Load: <2s on 4G
- Time to Interactive: <3s
- Booking completion: <60s

## 9. Environment Variables

```env
# Google Calendar
GOOGLE_CALENDAR_ID=02ff9b19d12ca44fda1dc9d4f6b628aa30663578b36f6c403d6f1b81e74e2664@group.calendar.google.com
GOOGLE_SERVICE_ACCOUNT_EMAIL=[to be created]
GOOGLE_PRIVATE_KEY=[to be generated]

# WhatsApp
WHATSAPP_PHONE=385924502265

# PerfexCRM
PERFEX_API_URL=[your-perfex-url]
PERFEX_API_TOKEN=[to be generated]

# Analytics
NEXT_PUBLIC_GA_ID=[to be created]

# Site
NEXT_PUBLIC_SITE_URL=https://uredno.eu
```

## 10. Success Metrics

### 10.1 Month 1 Targets
- 50+ bookings
- 20% conversion rate
- 4.5+ average rating
- <30% bounce rate

### 10.2 Month 3 Targets
- 150+ bookings
- 30% conversion rate
- 30% recurring customers
- Top 3 Google rankings

### 10.3 Month 6 Targets
- 300+ bookings
- 40% conversion rate
- 50% recurring customers
- Market leader position

---

# 3. Configuration & Setup

## ✅ CONFIRMED BUSINESS DECISIONS

| Configuration | Decision | Implementation Notes |
|--------------|----------|---------------------|
| **Hosting** | Vercel | Production-ready, auto-scaling |
| **Error Tracking** | None | Use Vercel's built-in logging |
| **Holidays** | Croatian National | Block all bookings on holidays |
| **Admin Dashboard** | None | Use Google Calendar directly |
| **Email Backup** | Yes | SendGrid/Resend for failures |
| **Company Logo** | Exists | Ready for implementation |
| **Teams** | 3 teams | Max concurrent bookings |
| **Working Hours** | Mon-Sat 07:00-15:00 | Sunday closed |
| **Calendar ID** | `02ff9b19d12ca44fda1dc9d4f6b628aa30663578b36f6c403d6f1b81e74e2664@group.calendar.google.com` | |

## 1. Croatian Holiday Calendar

### 2025 Croatian National Holidays (Non-Working Days)
```typescript
// lib/croatian-holidays.ts
export const CROATIAN_HOLIDAYS_2025 = [
  { date: '2025-01-01', name: 'Nova godina', type: 'national' },
  { date: '2025-01-06', name: 'Sveta tri kralja', type: 'national' },
  { date: '2025-04-20', name: 'Uskrs', type: 'national' },
  { date: '2025-04-21', name: 'Uskršnji ponedjeljak', type: 'national' },
  { date: '2025-05-01', name: 'Praznik rada', type: 'national' },
  { date: '2025-05-30', name: 'Dan državnosti', type: 'national' },
  { date: '2025-06-19', name: 'Tijelovo', type: 'national' },
  { date: '2025-06-22', name: 'Dan antifašističke borbe', type: 'national' },
  { date: '2025-08-05', name: 'Dan pobjede i domovinske zahvalnosti', type: 'national' },
  { date: '2025-08-15', name: 'Velika Gospa', type: 'national' },
  { date: '2025-11-01', name: 'Svi sveti', type: 'national' },
  { date: '2025-11-18', name: 'Dan sjećanja na žrtve Domovinskog rata', type: 'national' },
  { date: '2025-12-25', name: 'Božić', type: 'national' },
  { date: '2025-12-26', name: 'Sveti Stjepan', type: 'national' }
];

// Holiday checking function
export function isHoliday(date: Date): boolean {
  const dateStr = format(date, 'yyyy-MM-dd');
  return CROATIAN_HOLIDAYS_2025.some(holiday => holiday.date === dateStr);
}

// Get holiday name
export function getHolidayName(date: Date): string | null {
  const dateStr = format(date, 'yyyy-MM-dd');
  const holiday = CROATIAN_HOLIDAYS_2025.find(h => h.date === dateStr);
  return holiday ? holiday.name : null;
}

// For calendar component
export function isDateAvailable(date: Date): boolean {
  // Check if Sunday
  if (date.getDay() === 0) return false;

  // Check if holiday
  if (isHoliday(date)) return false;

  // Check if within working days (30 days advance)
  const today = new Date();
  const maxDate = addDays(today, 30);
  if (date < today || date > maxDate) return false;

  return true;
}
```

### Holiday Display Component
```typescript
// components/holiday-notice.tsx
import { AlertCircle } from 'lucide-react';
import { getHolidayName } from '@/lib/croatian-holidays';

export function HolidayNotice({ date }: { date: Date }) {
  const holidayName = getHolidayName(date);

  if (!holidayName) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start">
      <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-yellow-800">
          {holidayName} - Ne radimo
        </p>
        <p className="text-xs text-yellow-600 mt-1">
          Molimo odaberite drugi datum
        </p>
      </div>
    </div>
  );
}
```

## 2. Email Backup System (SendGrid)

### SendGrid Configuration
```typescript
// lib/email-service.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(data: EmailData): Promise<boolean> {
  try {
    const msg = {
      to: data.to,
      from: {
        email: 'info@uredno.eu',
        name: 'WebUredno'
      },
      subject: data.subject,
      html: data.html,
      text: data.text || data.html.replace(/<[^>]*>/g, ''),
    };

    await sgMail.send(msg);
    console.log('Email sent successfully');
    return true;
  } catch (error) {
    console.error('Email send failed:', error);
    return false;
  }
}

// Backup notification when WhatsApp fails
export async function sendBookingNotificationEmail(booking: any): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; border-radius: 10px 10px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px; }
        .info-row { margin: 10px 0; }
        .label { font-weight: bold; color: #374151; }
        .value { color: #111827; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">Nova Rezervacija - WebUredno</h2>
        </div>
        <div class="content">
          <div class="info-row">
            <span class="label">Datum:</span>
            <span class="value">${booking.date}</span>
          </div>
          <div class="info-row">
            <span class="label">Vrijeme:</span>
            <span class="value">${booking.time}</span>
          </div>
          <div class="info-row">
            <span class="label">Usluga:</span>
            <span class="value">${booking.service}</span>
          </div>
          <div class="info-row">
            <span class="label">Ime:</span>
            <span class="value">${booking.firstName} ${booking.lastName}</span>
          </div>
          <div class="info-row">
            <span class="label">Telefon:</span>
            <span class="value">${booking.phone}</span>
          </div>
          <div class="info-row">
            <span class="label">Adresa:</span>
            <span class="value">${booking.address}, ${booking.city}</span>
          </div>
          <div class="info-row">
            <span class="label">Cijena:</span>
            <span class="value">${booking.price}€</span>
          </div>
          ${booking.notes ? `
          <div class="info-row">
            <span class="label">Napomene:</span>
            <span class="value">${booking.notes}</span>
          </div>
          ` : ''}
          <div class="footer">
            <p>Molimo potvrdite rezervaciju pozivom na ${booking.phone}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: 'info@uredno.eu', // Your business email
    subject: `Nova Rezervacija - ${booking.firstName} ${booking.lastName} - ${booking.date}`,
    html
  });
}

// Customer confirmation email
export async function sendCustomerConfirmation(booking: any): Promise<boolean> {
  if (!booking.email) return false;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { background-color: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 25px; margin: 20px 0; }
        .details { background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Hvala na rezervaciji!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Vaš termin je zaprimljen</p>
        </div>
        <div class="content">
          <p>Poštovani/a ${booking.firstName},</p>
          <p>Zahvaljujemo na povjerenju! Vaša rezervacija za profesionalno čišćenje je uspješno zaprimljena.</p>

          <div class="details">
            <h3 style="margin-top: 0;">Detalji rezervacije:</h3>
            <p><strong>Datum:</strong> ${booking.date}</p>
            <p><strong>Vrijeme:</strong> ${booking.time}</p>
            <p><strong>Usluga:</strong> ${booking.service}</p>
            <p><strong>Adresa:</strong> ${booking.address}, ${booking.city}</p>
            <p><strong>Cijena:</strong> ${booking.price}€</p>
            <p><strong>Plaćanje:</strong> ${booking.paymentMethod}</p>
          </div>

          <h3>Što dalje?</h3>
          <ul>
            <li>Naš tim će doći u dogovoreno vrijeme</li>
            <li>Dan prije ćemo vas podsjetiti putem WhatsApp</li>
            <li>Molimo osigurajte pristup prostoru</li>
            <li>Plaćanje je nakon obavljene usluge</li>
          </ul>

          <p><strong>Trebate promijeniti termin?</strong><br>
          Javite nam najmanje 24 sata prije na WhatsApp: +385 92 450 2265</p>

          <center>
            <a href="https://wa.me/385924502265" class="button">Kontaktirajte nas na WhatsApp</a>
          </center>

          <div class="footer">
            <p>WebUredno - Profesionalno čišćenje<br>
            10 godina iskustva | 5000+ zadovoljnih klijenata<br>
            Tel: +385 92 450 2265 | Email: info@uredno.eu<br>
            <a href="https://uredno.eu" style="color: #2563eb;">uredno.eu</a></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: booking.email,
    subject: 'Potvrda rezervacije - WebUredno',
    html
  });
}

// 24h reminder email
export async function send24HourReminder(booking: any): Promise<boolean> {
  if (!booking.email) return false;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #10b981; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">Podsjetnik - Sutra dolazimo!</h2>
        </div>
        <div class="content">
          <p>Poštovani/a ${booking.firstName},</p>
          <p>Podsjećamo vas da sutra dolazi naš tim za čišćenje.</p>

          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>📅 Datum:</strong> ${booking.date}</p>
            <p><strong>⏰ Vrijeme:</strong> ${booking.time}</p>
            <p><strong>📍 Adresa:</strong> ${booking.address}</p>
          </div>

          <p><strong>Molimo pripremite:</strong></p>
          <ul>
            <li>Pristup svim prostorijama</li>
            <li>Sklonite vrijedne predmete</li>
            ${booking.service === 'standard' ? '<li>Sredstva za čišćenje (za standardno čišćenje)</li>' : ''}
          </ul>

          <p>Vidimo se sutra!</p>
          <p>Tim WebUredno</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: booking.email,
    subject: '🔔 Podsjetnik - Sutra čišćenje!',
    html
  });
}
```

## 3. Complete Environment Variables

```bash
# .env.local (Development)
# .env.production (Production)

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://uredno.eu
NEXT_PUBLIC_SITE_NAME=WebUredno

# WhatsApp
NEXT_PUBLIC_WHATSAPP_PHONE=3859245022655

# Google Calendar API
GOOGLE_CALENDAR_ID=02ff9b19d12ca44fda1dc9d4f6b628aa30663578b36f6c403d6f1b81e74e2664@group.calendar.google.com
GOOGLE_SERVICE_ACCOUNT_EMAIL=[to-be-created]@weburedno.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[your-key-here]\n-----END PRIVATE KEY-----"

# Email Service (SendGrid)
SENDGRID_API_KEY=SG.[your-sendgrid-key]
SENDGRID_FROM_EMAIL=info@uredno.eu
NOTIFICATION_EMAIL=info@uredno.eu

# PerfexCRM (Optional - can add later)
PERFEX_API_URL=https://[your-perfex-domain].com
PERFEX_API_TOKEN=[your-api-token]

# Google Analytics
NEXT_PUBLIC_GA_ID=G-[your-ga-id]

# Feature Flags
ENABLE_EMAIL_BACKUP=true
ENABLE_PERFEX_SYNC=false
ENABLE_SMS_NOTIFICATIONS=false
```

## 4. Application Configuration File

```typescript
// config/app.config.ts

export const APP_CONFIG = {
  // Business Information
  business: {
    name: 'WebUredno',
    established: 2015,
    phone: '+385924502265',
    email: 'info@uredno.eu',
    address: 'Zagreb, Hrvatska',
    vatNumber: '', // Add your OIB when ready
    insurance: '50000', // EUR
  },

  // Operational Settings
  operations: {
    maxTeams: 3,
    workingHours: {
      monday: { start: '07:00', end: '15:00' },
      tuesday: { start: '07:00', end: '15:00' },
      wednesday: { start: '07:00', end: '15:00' },
      thursday: { start: '07:00', end: '15:00' },
      friday: { start: '07:00', end: '15:00' },
      saturday: { start: '07:00', end: '15:00' },
      sunday: null, // Closed
    },
    maxAdvanceBookingDays: 30,
    minAdvanceBookingHours: 24,
  },

  // Service Configuration
  services: {
    standard: {
      name: 'Standardno Čišćenje',
      minPrice: 45,
      suppliesIncluded: false,
      checklist: 60,
    },
    deep: {
      name: 'Dubinsko Čišćenje',
      minPrice: 60,
      suppliesIncluded: true,
      checklist: 75,
    },
    moving: {
      name: 'Čišćenje nakon Selidbe',
      minPrice: 75,
      suppliesIncluded: true,
      checklist: 75,
    },
    office: {
      name: 'Čišćenje Ureda',
      minPrice: 60,
      suppliesIncluded: true,
      checklist: 60,
    },
  },

  // Pricing
  pricing: {
    hourlyRate: 15, // EUR per hour per person
    distanceFees: [
      { min: 0, max: 20, fee: 0 },
      { min: 20, max: 40, fee: 10 },
      { min: 40, max: 60, fee: 20 },
      { min: 60, max: 70, fee: 30 },
    ],
    discounts: {
      weekly: 0.10,    // 10% off
      biweekly: 0.05,  // 5% off
      monthly: 0,      // No discount
    },
  },

  // Cancellation Policy
  cancellation: {
    freeHours: 24,           // Hours before free cancellation
    lateFeePercentage: 50,   // % charged for late cancellation
    noShowFeePercentage: 100, // % charged for no-show
  },

  // Features
  features: {
    emailBackup: true,
    smsNotifications: false,
    adminDashboard: false,
    customerAccounts: false,
    onlinePayment: false,
    loyaltyProgram: false,
    referralSystem: false,
  },

  // SEO
  seo: {
    defaultTitle: 'Profesionalno Čišćenje Zagreb | WebUredno',
    titleTemplate: '%s | WebUredno',
    defaultDescription: 'Pouzdane usluge čišćenja u Zagrebu i okolici. 10 godina iskustva, preko 5000 zadovoljnih klijenata. Rezervirajte online u 60 sekundi.',
    siteUrl: 'https://uredno.eu',
    defaultOgImage: '/og-image.jpg',
  },

  // Legal
  legal: {
    termsUrl: '/uvjeti-koristenja',
    privacyUrl: '/politika-privatnosti',
    cookiePolicy: '/kolacici',
    gdprCompliant: true,
  },

  // External Services
  external: {
    googleCalendar: {
      enabled: true,
      calendarId: process.env.GOOGLE_CALENDAR_ID,
    },
    whatsapp: {
      enabled: true,
      phone: process.env.NEXT_PUBLIC_WHATSAPP_PHONE,
    },
    sendgrid: {
      enabled: true,
      fromEmail: 'info@uredno.eu',
    },
    googleAnalytics: {
      enabled: true,
      measurementId: process.env.NEXT_PUBLIC_GA_ID,
    },
    perfexCRM: {
      enabled: false, // Enable when ready
      apiUrl: process.env.PERFEX_API_URL,
    },
  },
};
```

## 5. Logo Implementation

```typescript
// components/logo.tsx
import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  variant?: 'default' | 'white' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  linkToHome?: boolean;
}

export function Logo({
  variant = 'default',
  size = 'md',
  linkToHome = true
}: LogoProps) {
  const sizes = {
    sm: { width: 120, height: 40 },
    md: { width: 150, height: 50 },
    lg: { width: 180, height: 60 },
  };

  const logos = {
    default: '/logo/logo-color.svg',
    white: '/logo/logo-white.svg',
    dark: '/logo/logo-dark.svg',
  };

  const LogoImage = (
    <Image
      src={logos[variant]}
      alt="WebUredno"
      width={sizes[size].width}
      height={sizes[size].height}
      priority
      className="h-auto"
    />
  );

  if (linkToHome) {
    return (
      <Link href="/" className="inline-block">
        {LogoImage}
      </Link>
    );
  }

  return LogoImage;
}

// Usage examples:
// <Logo /> - Default logo linking to home
// <Logo variant="white" size="lg" /> - White large logo
// <Logo linkToHome={false} /> - Logo without link
```

### Logo File Structure
```
/public/logo/
├── logo-color.svg      # Primary colored logo
├── logo-white.svg      # White version for dark backgrounds
├── logo-dark.svg       # Dark version for light backgrounds
├── logo-icon.svg       # Icon only (for favicon)
├── favicon.ico         # Browser favicon
├── apple-touch-icon.png # iOS home screen
└── og-image.jpg        # Open Graph sharing image (1200x630)
```

## 6. Final Deployment Checklist

### Pre-Launch (1 Week Before)
- [x] Vercel account ready
- [x] Domain access confirmed
- [ ] Google Service Account created
- [ ] SendGrid account setup
- [ ] Logo files prepared (SVG + PNG)
- [ ] Collect minimum 5 testimonials
- [ ] Take/prepare 15+ photos
- [ ] Write privacy policy
- [ ] Write terms of service

### Launch Day
- [ ] Deploy to Vercel
- [ ] Configure domain DNS
- [ ] Set all environment variables
- [ ] Test booking flow completely
- [ ] Verify WhatsApp integration
- [ ] Test email backup
- [ ] Check holiday blocking
- [ ] Mobile testing
- [ ] Submit to Google Search Console
- [ ] Setup Google Analytics

### Post-Launch (First Week)
- [ ] Monitor for errors
- [ ] Check booking submissions
- [ ] Verify calendar sync
- [ ] Review performance metrics
- [ ] Gather initial feedback
- [ ] Fix any urgent issues
- [ ] Start SEO optimization
- [ ] Plan first blog posts

---

# 4. Documentation Index

## 📚 Documentation Structure

This folder contains all necessary documentation to build the WebUredno cleaning service website. The documentation is organized for efficient development and deployment.

## 🚀 Quick Start Guide

### For Developers:
1. Read **MASTER_PRD.md** for complete project understanding
2. Review **TECHNICAL_GUIDE.md** for implementation details
3. Set up environment using configuration section above
4. Follow **IMPLEMENTATION_ROADMAP.md** for development phases
5. Use **BUSINESS_OPERATIONS.md** for content and policies
6. Deploy using deployment guide section

### For Project Managers:
1. Track progress with **IMPLEMENTATION_ROADMAP.md**
2. Review requirements in this document
3. Verify deployment with technical specifications

## 📊 Project Overview

**Project**: WebUredno - Professional Cleaning Service Website
**Market**: Croatian (Zagreb + 70km radius)
**Language**: Croatian only
**Timeline**: 3-4 weeks development
**Tech Stack**: Next.js 14, shadcn/ui, Tailwind CSS
**Integrations**: Google Calendar, WhatsApp, SendGrid

## ✅ Key Features

- Real-time availability with 3 teams max
- 3-step booking flow
- WhatsApp integration
- Croatian holiday blocking
- Email backup system
- Mobile-first responsive design
- SEO optimized for Croatian market
- No admin dashboard (Google Calendar management)

## 📞 Configuration Summary

| Setting | Value |
|---------|-------|
| **Teams** | 3 cleaning teams |
| **Hours** | Mon-Sat 07:00-15:00 |
| **Phone** | +385 92 450 2265 |
| **Domain** | uredno.eu |
| **Hosting** | Vercel |
| **Calendar** | Google Calendar API |
| **Email** | SendGrid backup |

## 🔗 Important Links

- **Domain**: https://uredno.eu (to be configured)
- **WhatsApp**: +385 92 450 2265
- **Calendar ID**: `02ff9b19d12ca44fda1dc9d4f6b628aa30663578b36f6c403d6f1b81e74e2664@group.calendar.google.com`

---

*Final PRD Version: 3.0*
*Configuration Version: 1.0*
*Status: READY FOR DEVELOPMENT*
*Last Updated: January 2025*
*Contact: +385 92 450 2265*