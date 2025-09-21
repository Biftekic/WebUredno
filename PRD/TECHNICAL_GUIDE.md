# TECHNICAL GUIDE - WebUredno
## Complete Technical Documentation & Implementation
### Consolidation of TECHNICAL_SPECIFICATIONS.md + API_DOCUMENTATION.md + INTEGRATION_DETAILS.md + COMPONENT_LIBRARY.md

---

## Table of Contents

1. [Technical Architecture](#1-technical-architecture)
2. [API Documentation](#2-api-documentation)
3. [Integration Details](#3-integration-details)
4. [Component Library](#4-component-library)

---

# 1. Technical Architecture

## 🏗️ Architecture Overview

### **Tech Stack**
```yaml
Frontend:
  - Framework: React 18+ with TypeScript
  - Styling: Tailwind CSS (mobile-first utilities)
  - State: Zustand (lightweight state management)
  - Forms: React Hook Form + Zod validation
  - Calendar: Custom mobile-optimized component
  - Maps: Google Maps API (coverage area)

Backend:
  - Runtime: Node.js 20+
  - Framework: Express.js
  - Database: PostgreSQL (Supabase hosted)
  - Caching: Redis (for availability)
  - Queue: BullMQ (for WhatsApp messages)

Integrations:
  - WhatsApp Business API
  - Google Calendar API
  - Google Maps Distance Matrix API
  - Resend (email service)
  - Cloudinary (image optimization)

Infrastructure:
  - Hosting: Vercel (frontend) + Railway (backend)
  - CDN: Cloudflare
  - Analytics: Google Analytics 4 + Hotjar
```

## 📱 Mobile-First Components

### **1. Mobile Navigation**
```typescript
interface MobileNav {
  type: 'bottom-fixed';
  items: [
    { icon: 'home', label: 'Početna', path: '/' },
    { icon: 'calendar', label: 'Rezerviraj', path: '/booking' },
    { icon: 'services', label: 'Usluge', path: '/services' },
    { icon: 'whatsapp', label: 'WhatsApp', action: 'open-whatsapp' }
  ];
  height: '60px';
  zIndex: 1000;
}
```

### **2. Service Card Component**
```tsx
interface ServiceCard {
  service: {
    id: string;
    name: string;
    icon: string;
    basePrice: number;
    duration: string;
    description: string;
    popular?: boolean;
  };
  onClick: () => void;
  variant: 'compact' | 'detailed';
}

// Mobile touch optimizations
const ServiceCard = ({ service, onClick, variant }) => (
  <motion.div
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="touch-manipulation"
  >
    {/* 44px minimum touch target */}
  </motion.div>
);
```

### **3. Time Slot Selector**
```tsx
interface TimeSlotSelector {
  availableSlots: TimeSlot[];
  onSelect: (slot: TimeSlot) => void;
  selectedDate: Date;
}

interface TimeSlot {
  id: string;
  startTime: string; // "09:00"
  endTime: string;   // "11:00"
  available: boolean;
  teamsAvailable: number;
  displayText: string; // "Između 09:00 - 11:00"
}

// Visual representation
<div className="grid grid-cols-2 gap-3 p-4">
  {slots.map(slot => (
    <button
      className={`
        h-16 rounded-lg font-medium
        ${slot.available
          ? 'bg-green-50 text-green-700 border-green-200'
          : 'bg-gray-50 text-gray-400 cursor-not-allowed'}
      `}
      disabled={!slot.available}
    >
      <div className="text-sm">{slot.displayText}</div>
      <div className="text-xs mt-1">
        {slot.available ? `${slot.teamsAvailable} tim dostupan` : 'Zauzeto'}
      </div>
    </button>
  ))}
</div>
```

### **4. Progressive Booking Form**
```tsx
interface BookingStep {
  id: number;
  title: string;
  component: React.FC;
  validation: ZodSchema;
}

const bookingSteps: BookingStep[] = [
  {
    id: 1,
    title: 'Odaberite uslugu',
    component: ServiceSelection,
    validation: serviceSchema
  },
  {
    id: 2,
    title: 'Veličina prostora',
    component: SpaceDetails,
    validation: spaceSchema
  },
  {
    id: 3,
    title: 'Datum i vrijeme',
    component: DateTimeSelection,
    validation: dateTimeSchema
  },
  {
    id: 4,
    title: 'Vaši podaci',
    component: ContactInfo,
    validation: contactSchema
  }
];

// Mobile-optimized stepper
<div className="fixed top-0 left-0 right-0 bg-white z-50">
  <div className="h-1 bg-gray-200">
    <div
      className="h-full bg-green-500 transition-all"
      style={{ width: `${(currentStep / totalSteps) * 100}%` }}
    />
  </div>
</div>
```

### **5. Instant Price Calculator**
```typescript
class PriceCalculator {
  private baseRates = {
    standard: 45,
    deep: 60,
    moving: 75,
    office: 60,
    construction: 100,
    airbnb: 50,
    moveinout: 70
  };

  private sizeMultipliers = {
    garsonijera: 1.0,
    jednosoban: 1.0,
    dvosoban: 1.3,
    trosoban: 1.6,
    kuca: 2.0
  };

  private distanceFees = [
    { maxKm: 20, fee: 0 },
    { maxKm: 40, fee: 10 },
    { maxKm: 60, fee: 20 },
    { maxKm: 70, fee: 30 }
  ];

  private discounts = {
    weekly: 0.10,
    biweekly: 0.05,
    monthly: 0.03
  };

  calculate(params: BookingParams): PriceBreakdown {
    let basePrice = this.baseRates[params.service];
    let sizeMultiplier = this.sizeMultipliers[params.size];
    let distanceFee = this.getDistanceFee(params.distance);
    let discount = this.discounts[params.frequency] || 0;

    let subtotal = basePrice * sizeMultiplier;
    let discountAmount = subtotal * discount;
    let total = subtotal - discountAmount + distanceFee;

    return {
      base: basePrice,
      sizeAdjustment: (sizeMultiplier - 1) * basePrice,
      subtotal,
      discount: discountAmount,
      distanceFee,
      total: Math.round(total),
      breakdown: this.generateBreakdown(params)
    };
  }
}
```

## 📊 Database Schema

```sql
-- Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255),
  whatsapp_opted_in BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Addresses
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  street VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  zip_code VARCHAR(10),
  entrance_code VARCHAR(50),
  coordinates POINT,
  distance_from_base DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services
CREATE TABLE services (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  min_duration INTEGER NOT NULL, -- minutes
  requires_supplies BOOLEAN DEFAULT false,
  checklist_points INTEGER,
  active BOOLEAN DEFAULT true
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  confirmation_code VARCHAR(10) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  address_id UUID REFERENCES addresses(id),
  service_id VARCHAR(50) REFERENCES services(id),

  -- Schedule
  scheduled_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  arrival_window_start TIME NOT NULL,
  arrival_window_end TIME NOT NULL,

  -- Details
  apartment_size VARCHAR(20),
  rooms INTEGER,
  bathrooms INTEGER,
  team_assigned INTEGER,

  -- Pricing
  base_price DECIMAL(10,2) NOT NULL,
  distance_fee DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(20),
  paid BOOLEAN DEFAULT false,

  -- Status
  status VARCHAR(20) DEFAULT 'pending',
  calendar_event_id VARCHAR(255),
  notes TEXT,
  special_instructions TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_bookings_date ON bookings(scheduled_date);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_addresses_coordinates ON addresses USING GIST(coordinates);
```

## 🚀 Performance Optimizations

### **Mobile Performance Targets**
```yaml
Core Web Vitals:
  LCP: < 2.5s  # Largest Contentful Paint
  FID: < 100ms # First Input Delay
  CLS: < 0.1   # Cumulative Layout Shift

Lighthouse Scores:
  Performance: > 90
  Accessibility: > 95
  Best Practices: > 95
  SEO: > 95

Bundle Size:
  Initial JS: < 100KB
  Initial CSS: < 20KB
  Total: < 200KB (gzipped)
```

### **Optimization Techniques**
```typescript
// 1. Code Splitting
const ServiceDetails = lazy(() => import('./pages/ServiceDetails'));
const BookingFlow = lazy(() => import('./pages/BookingFlow'));

// 2. Image Optimization
<Image
  src="/cleaning-hero.webp"
  alt="Professional cleaning"
  loading="lazy"
  width={800}
  height={400}
  sizes="(max-width: 768px) 100vw, 50vw"
/>

// 3. Critical CSS
<style dangerouslySetInnerHTML={{ __html: criticalCSS }} />

// 4. Service Worker for PWA
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then(cache => {
      return cache.addAll([
        '/',
        '/manifest.json',
        '/offline.html',
        '/styles/critical.css'
      ]);
    })
  );
});

// 5. Prefetching
<link rel="prefetch" href="/api/services" />
<link rel="preconnect" href="https://maps.googleapis.com" />
```

## 🔒 Security Measures

```typescript
// Rate Limiting
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests
}));

// Input Validation
const bookingSchema = z.object({
  service: z.enum(['standard', 'deep', 'moving', 'office', 'construction', 'airbnb', 'moveinout']),
  phone: z.string().regex(/^\+385\d{8,9}$/),
  email: z.string().email().optional(),
  date: z.string().refine(isValidFutureDate),
  // ... more validations
});

// CSRF Protection
app.use(csrf({ cookie: true }));

// Content Security Policy
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://maps.googleapis.com"],
      // ... more policies
    }
  }
}));
```

---

# 2. API Documentation

## 1. API Endpoints Overview

### Base URL Structure
```
Production: https://uredno.eu/api
Development: http://localhost:3000/api
```

### Authentication
```javascript
// No authentication for public endpoints (MVP)
// Future: JWT for admin endpoints

headers: {
  'Content-Type': 'application/json',
  'Accept-Language': 'hr' // Croatian responses
}
```

## 2. Price Calculation API

### Endpoint: `POST /api/price`

#### Request
```typescript
interface PriceRequest {
  service: 'standard' | 'deep' | 'moving' | 'office' | 'airbnb' | 'moveinout';
  size: 'garsonijera' | 'jednosoban' | 'dvosoban' | 'trosoban' | 'kuca';
  city: string; // For distance calculation
  recurring?: 'none' | 'weekly' | 'biweekly' | 'monthly';
  airbnbFrequency?: number; // Monthly cleaning frequency for Airbnb (e.g., 15, 20)
}
```

#### Response
```typescript
interface PriceResponse {
  success: boolean;
  data: {
    basePrice: number;
    distanceFee: number;
    recurringDiscount: number;
    totalPrice: number;
    duration: string; // "3 sata"
    teamSize: number; // 1 or 2
    distance: number; // km from Zagreb
    priceBreakdown: {
      hourlyRate: number;
      hours: number;
      workers: number;
    };
  };
  error?: string;
}
```

#### Implementation
```typescript
// app/api/price/route.ts
import { NextRequest, NextResponse } from 'next/server';

const PRICING_MATRIX = {
  standard: {
    garsonijera: { hours: 3, workers: 1, minPrice: 45 },
    jednosoban: { hours: 3, workers: 1, minPrice: 45 },
    dvosoban: { hours: 2.5, workers: 2, minPrice: 45 },
    trosoban: { hours: 3, workers: 2, minPrice: 45 },
    kuca: { hours: 4, workers: 2, minPrice: 45 }
  },
  deep: {
    garsonijera: { hours: 4, workers: 1, minPrice: 60 },
    jednosoban: { hours: 4, workers: 1, minPrice: 60 },
    dvosoban: { hours: 3, workers: 2, minPrice: 60 },
    trosoban: { hours: 3.5, workers: 2, minPrice: 60 },
    kuca: { hours: 5, workers: 2, minPrice: 60 }
  },
  // ... other services
};

const DISTANCE_FEES = [
  { min: 0, max: 20, fee: 0 },
  { min: 20, max: 40, fee: 10 },
  { min: 40, max: 60, fee: 20 },
  { min: 60, max: 70, fee: 30 }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { service, size, city, recurring, airbnbFrequency } = body;

    // Get base pricing
    const config = PRICING_MATRIX[service][size];

    // Special Airbnb pricing - od 25€
    // Konačna cijena ovisi o učestalosti čišćenja i veličini prostora
    let basePrice;
    if (service === 'airbnb') {
      // Početna cijena od 25€, prilagođava se prema:
      // - učestalosti (broj čišćenja mjesečno)
      // - veličini prostora (m²)
      // - udaljenosti od centra
      const startingPrice = 25;
      const sizeMultiplier = size === 'garsonijera' ? 1 :
                             size === '1sobni' ? 1.2 :
                             size === '2sobni' ? 1.4 :
                             size === '3sobni' ? 1.6 : 1.8;

      const frequencyMultiplier = airbnbFrequency && airbnbFrequency >= 15 ? 1 :
                                  airbnbFrequency && airbnbFrequency >= 8 ? 1.1 :
                                  airbnbFrequency && airbnbFrequency >= 4 ? 1.2 : 1.5;

      basePrice = Math.round(startingPrice * sizeMultiplier * frequencyMultiplier);
    } else {
      basePrice = Math.max(
        config.hours * config.workers * 15,
        config.minPrice
      );
    }

    // Calculate distance
    const distance = await calculateDistance(city);
    const distanceFee = getDistanceFee(distance) * config.workers;

    // Apply recurring discount (not for Airbnb with frequency pricing)
    const recurringDiscount = (service === 'airbnb' && airbnbFrequency >= 4) ? 0 :
                             recurring === 'weekly' ? 0.1 :
                             recurring === 'biweekly' ? 0.05 : 0;

    const totalPrice = (basePrice + distanceFee) * (1 - recurringDiscount);

    return NextResponse.json({
      success: true,
      data: {
        basePrice,
        distanceFee,
        recurringDiscount: recurringDiscount * 100,
        totalPrice: Math.round(totalPrice),
        duration: `${config.hours} ${config.hours === 1 ? 'sat' : 'sata'}`,
        teamSize: config.workers,
        distance,
        priceBreakdown: {
          hourlyRate: 15,
          hours: config.hours,
          workers: config.workers
        }
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Greška pri izračunu cijene'
    }, { status: 500 });
  }
}
```

## 3. Availability Check API

### Endpoint: `GET /api/availability`

#### Request
```typescript
interface AvailabilityParams {
  date: string; // YYYY-MM-DD
  service: string;
  duration: number; // hours
}
```

#### Response
```typescript
interface AvailabilityResponse {
  success: boolean;
  data: {
    date: string;
    availableSlots: Array<{
      startTime: string; // "09:00"
      endTime: string;   // "12:00"
      available: boolean;
      teamsAvailable: number; // 0-3
    }>;
    fullyBooked: boolean;
  };
  error?: string;
}
```

#### Implementation
```typescript
// app/api/availability/route.ts
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;
const MAX_TEAMS = 3;
const WORK_HOURS = { start: 7, end: 15 };

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const date = searchParams.get('date');
  const duration = parseInt(searchParams.get('duration') || '3');

  try {
    // Initialize Google Calendar
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/calendar.readonly']
    });

    const calendar = google.calendar({ version: 'v3', auth });

    // Get events for the date
    const startOfDay = new Date(`${date}T07:00:00`);
    const endOfDay = new Date(`${date}T15:00:00`);

    const response = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    });

    const events = response.data.items || [];

    // Generate time slots
    const slots = generateTimeSlots(date, duration);

    // Check availability for each slot
    const availableSlots = slots.map(slot => {
      const overlappingEvents = events.filter(event => {
        const eventStart = new Date(event.start?.dateTime || event.start?.date);
        const eventEnd = new Date(event.end?.dateTime || event.end?.date);
        const slotStart = new Date(`${date}T${slot.startTime}`);
        const slotEnd = new Date(`${date}T${slot.endTime}`);

        return (slotStart < eventEnd && slotEnd > eventStart);
      });

      const teamsAvailable = MAX_TEAMS - overlappingEvents.length;

      return {
        ...slot,
        available: teamsAvailable > 0,
        teamsAvailable
      };
    });

    const fullyBooked = availableSlots.every(slot => !slot.available);

    return NextResponse.json({
      success: true,
      data: {
        date,
        availableSlots,
        fullyBooked
      }
    });

  } catch (error) {
    console.error('Calendar error:', error);
    return NextResponse.json({
      success: false,
      error: 'Greška pri provjeri dostupnosti'
    }, { status: 500 });
  }
}

function generateTimeSlots(date: string, duration: number) {
  const slots = [];
  const dayOfWeek = new Date(date).getDay();

  // No Sunday service
  if (dayOfWeek === 0) return [];

  for (let hour = WORK_HOURS.start; hour <= WORK_HOURS.end - duration; hour++) {
    slots.push({
      startTime: `${hour.toString().padStart(2, '0')}:00`,
      endTime: `${(hour + duration).toString().padStart(2, '0')}:00`
    });
  }

  return slots;
}
```

## 4. Booking Submission API

### Endpoint: `POST /api/booking`

#### Request
```typescript
interface BookingRequest {
  // Service details
  service: 'standard' | 'deep' | 'moving' | 'office' | 'airbnb' | 'moveinout';
  size: string;
  date: string;
  time: string;
  duration: number;

  // Customer details
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;

  // Additional
  notes?: string;
  recurring?: string;
  paymentMethod: 'cash' | 'card' | 'transfer';
  price: number;
}
```

#### Response
```typescript
interface BookingResponse {
  success: boolean;
  data?: {
    bookingId: string;
    whatsappLink: string;
    confirmationMessage: string;
    calendarEventId?: string;
  };
  error?: string;
}
```

## 5. Distance Calculation API

### Endpoint: `POST /api/distance`

```typescript
// Predefined distances for major cities
const CITY_DISTANCES = {
  'Zagreb': 0,
  'Velika Gorica': 16,
  'Zaprešić': 18,
  'Samobor': 20,
  'Sveta Nedelja': 12,
  'Dugo Selo': 18,
  'Sesvete': 10,
  // ... more cities
};

export async function POST(request: NextRequest) {
  try {
    const { city } = await request.json();

    const distance = CITY_DISTANCES[city] || calculateByZip(city);
    const feePerPerson = getDistanceFee(distance);

    return NextResponse.json({
      success: true,
      data: {
        city,
        distance,
        fee: feePerPerson * 2, // Assuming 2 person team
        feePerPerson
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Greška pri izračunu udaljenosti'
    }, { status: 500 });
  }
}
```

## 6. Error Handling

### Standard Error Response
```typescript
interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
}

// Error codes
const ERROR_CODES = {
  INVALID_INPUT: 'INVALID_INPUT',
  CALENDAR_ERROR: 'CALENDAR_ERROR',
  FULLY_BOOKED: 'FULLY_BOOKED',
  OUT_OF_AREA: 'OUT_OF_AREA',
  PAYMENT_ERROR: 'PAYMENT_ERROR',
  CRM_ERROR: 'CRM_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR'
};
```

## 7. Rate Limiting

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
});

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api')) {
    const ip = request.ip ?? '127.0.0.1';
    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json({
        success: false,
        error: 'Previše zahtjeva. Pokušajte ponovno za nekoliko sekundi.'
      }, { status: 429 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

---

# 3. Integration Details

## 🚀 Quick Start Integration Checklist

- [ ] WhatsApp Business account verified
- [ ] Google Cloud Console project created
- [ ] SendGrid account with API key
- [ ] Environment variables configured
- [ ] Webhook endpoints deployed
- [ ] Error logging implemented

## 1. WhatsApp Business Integration (Simplified)

### **Approach: Click-to-WhatsApp URL Method**
Since we're not storing customer data, we'll use the simplest WhatsApp integration:

```typescript
// lib/whatsapp.ts

export const WHATSAPP_NUMBER = '385924502265'; // Without + sign

export function generateWhatsAppUrl(booking: BookingData): string {
  const message = encodeURIComponent(
    `🏠 *Nova Rezervacija*\n\n` +
    `📅 Datum: ${booking.date}\n` +
    `⏰ Vrijeme: ${booking.timeWindow}\n` +
    `🏡 Tip: ${booking.apartmentType}\n` +
    `🧹 Usluga: ${booking.serviceType}\n` +
    `📍 Lokacija: ${booking.city}\n` +
    `💰 Cijena: ${booking.price}€\n\n` +
    `👤 Ime: ${booking.firstName} ${booking.lastName}\n` +
    `📱 Telefon: ${booking.phone}\n` +
    `✉️ Email: ${booking.email}\n` +
    `${booking.address ? `📍 Adresa: ${booking.address}\n` : ''}` +
    `${booking.notes ? `📝 Napomene: ${booking.notes}\n` : ''}\n` +
    `✅ Molimo potvrdite rezervaciju!`
  );

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}

// For mobile detection
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

// Direct WhatsApp opening
export function sendToWhatsApp(booking: BookingData): void {
  const url = generateWhatsAppUrl(booking);

  if (isMobileDevice()) {
    // On mobile, try to open WhatsApp app directly
    window.location.href = url;
  } else {
    // On desktop, open WhatsApp Web in new tab
    window.open(url, '_blank');
  }
}
```

### **Implementation in Booking Flow**

```typescript
// app/api/booking/route.ts

export async function POST(request: NextRequest) {
  try {
    const booking = await request.json();

    // 1. Create calendar event
    const calendarEvent = await createCalendarEvent(booking);

    // 2. Generate WhatsApp URL
    const whatsappUrl = generateWhatsAppUrl(booking);

    // 3. Send email backup
    const emailSent = await sendBookingEmail(booking);

    // 4. Return success with WhatsApp URL
    return NextResponse.json({
      success: true,
      whatsappUrl,
      calendarEventId: calendarEvent.id,
      emailSent,
      message: 'Rezervacija uspješna! Preusmjeravanje na WhatsApp...'
    });

  } catch (error) {
    console.error('Booking error:', error);

    // Fallback to email only
    await sendBookingEmail(booking);

    return NextResponse.json({
      success: false,
      error: 'Dogodila se greška. Email poslan.',
      fallbackEmail: true
    });
  }
}
```

### **Client-Side Handling**

```typescript
// components/booking/confirmation.tsx

const handleBookingSubmit = async () => {
  const response = await fetch('/api/booking', {
    method: 'POST',
    body: JSON.stringify(bookingData)
  });

  const result = await response.json();

  if (result.success && result.whatsappUrl) {
    // Show success message
    toast.success('Rezervacija uspješna! Otvaramo WhatsApp...');

    // Small delay for user to see message
    setTimeout(() => {
      if (isMobileDevice()) {
        window.location.href = result.whatsappUrl;
      } else {
        window.open(result.whatsappUrl, '_blank');
      }
    }, 1500);

    // Redirect to confirmation page
    setTimeout(() => {
      router.push('/rezervacija/potvrda');
    }, 3000);
  }
};
```

## 2. Google Calendar API Integration

### **Service Account Setup**

#### Step 1: Create Service Account
```bash
# 1. Go to Google Cloud Console
# https://console.cloud.google.com

# 2. Create new project or select existing
# Project name: "WebUredno"

# 3. Enable Google Calendar API
# APIs & Services > Library > Search "Google Calendar API" > Enable

# 4. Create Service Account
# APIs & Services > Credentials > Create Credentials > Service Account
# Name: "weburedno-calendar"
# Role: "Editor"

# 5. Create Key
# Click on service account > Keys > Add Key > JSON
# Download and save as 'google-service-account.json'
```

#### Step 2: Share Calendar with Service Account
```
1. Open Google Calendar (with business account)
2. Settings > Settings for my calendars
3. Select the WebUredno calendar
4. Share with specific people
5. Add service account email: weburedno-calendar@PROJECT_ID.iam.gserviceaccount.com
6. Permission: "Make changes to events"
```

### **Implementation**

```typescript
// lib/google-calendar.ts
import { google } from 'googleapis';

const CALENDAR_ID = '02ff9b19d12ca44fda1dc9d4f6b628aa30663578b36f6c403d6f1b81e74e2664@group.calendar.google.com';

// Initialize auth
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/calendar'],
});

const calendar = google.calendar({ version: 'v3', auth });

// Check availability
export async function checkCalendarAvailability(
  date: string,
  duration: number
): Promise<AvailabilityResponse> {
  const startOfDay = new Date(`${date}T07:00:00`);
  const endOfDay = new Date(`${date}T15:00:00`);

  const response = await calendar.events.list({
    calendarId: CALENDAR_ID,
    timeMin: startOfDay.toISOString(),
    timeMax: endOfDay.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });

  const events = response.data.items || [];
  const maxTeams = 3;

  // Calculate available slots based on existing bookings
  // ... implementation
}

// Create booking
export async function createCalendarBooking(
  booking: BookingData
): Promise<string> {
  const event = {
    summary: `Čišćenje - ${booking.firstName} ${booking.lastName}`,
    location: `${booking.address}, ${booking.city}`,
    description: formatBookingDescription(booking),
    start: {
      dateTime: booking.startTime,
      timeZone: 'Europe/Zagreb',
    },
    end: {
      dateTime: booking.endTime,
      timeZone: 'Europe/Zagreb',
    },
    colorId: getServiceColor(booking.service),
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 60 },
        { method: 'email', minutes: 1440 }, // 24 hours
      ],
    },
  };

  const response = await calendar.events.insert({
    calendarId: CALENDAR_ID,
    requestBody: event,
  });

  return response.data.id || '';
}
```

## 3. SendGrid Email Integration

```typescript
// lib/email-templates.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// Booking confirmation for customer
export async function sendCustomerConfirmation(booking: BookingData) {
  const msg = {
    to: booking.email,
    from: 'info@uredno.eu',
    subject: 'Potvrda rezervacije - WebUredno',
    html: generateCustomerEmailHTML(booking),
    text: generateCustomerEmailText(booking),
  };

  try {
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('Email send failed:', error);
    return false;
  }
}

// Admin notification
export async function sendAdminNotification(booking: BookingData) {
  const msg = {
    to: 'info@uredno.eu',
    from: 'noreply@uredno.eu',
    subject: `Nova rezervacija - ${booking.firstName} ${booking.lastName}`,
    html: generateAdminEmailHTML(booking),
  };

  try {
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('Admin notification failed:', error);
    return false;
  }
}

// 24-hour reminder
export async function send24HourReminder(booking: BookingData) {
  const msg = {
    to: booking.email,
    from: 'info@uredno.eu',
    subject: '🔔 Podsjetnik - Sutra dolazimo!',
    html: generateReminderEmailHTML(booking),
  };

  try {
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('Reminder send failed:', error);
    return false;
  }
}
```

---

# 4. Component Library

## 1. Design System Foundation

### Colors
```typescript
// lib/design-tokens.ts
export const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',  // Main brand color
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a',  // Available slots
  },
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',  // Errors
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  }
};
```

### Typography
```typescript
// lib/typography.ts
export const typography = {
  fonts: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
  },
  sizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  }
};
```

## 2. Core Components

### Button Component
```typescript
// components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-full font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50',
        ghost: 'text-blue-600 hover:bg-blue-50',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
        whatsapp: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-400',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
        xl: 'px-8 py-4 text-xl',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export const Button = ({
  children,
  variant,
  size,
  fullWidth,
  disabled,
  loading,
  className,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};
```

### Input Component
```typescript
// components/ui/input.tsx
interface InputProps {
  label?: string;
  error?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export const Input = ({
  label,
  error,
  required,
  type = 'text',
  placeholder,
  value,
  onChange,
  ...props
}: InputProps) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2',
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:ring-blue-500'
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
```

### Service Card Component
```typescript
// components/service-card.tsx
interface ServiceCardProps {
  title: string;
  price: string;
  duration: string;
  checklist: number;
  description: string;
  popular?: boolean;
  onSelect: () => void;
}

export const ServiceCard = ({
  title,
  price,
  duration,
  checklist,
  description,
  popular,
  onSelect,
}: ServiceCardProps) => {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'relative p-6 border-2 rounded-xl cursor-pointer transition-all',
        'hover:shadow-lg hover:border-blue-500',
        popular && 'border-blue-500 shadow-md'
      )}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
            Najpopularnije
          </span>
        </div>
      )}

      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-3xl font-bold text-blue-600">{price}</span>
        <span className="text-gray-600">od</span>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{duration}</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span>{checklist} točaka čišćenja</span>
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-700">{description}</p>

      <Button
        variant="primary"
        size="md"
        fullWidth
        className="mt-6"
      >
        Odaberi
      </Button>
    </div>
  );
};
```

### Calendar Component
```typescript
// components/calendar.tsx
interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  availableDates: Date[];
  minDate?: Date;
  maxDate?: Date;
}

export const Calendar = ({
  selectedDate,
  onDateSelect,
  availableDates,
  minDate = new Date(),
  maxDate = addDays(new Date(), 30),
}: CalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const isDateAvailable = (date: Date) => {
    return availableDates.some(d => isSameDay(d, date));
  };

  const isDateSelectable = (date: Date) => {
    return (
      isDateAvailable(date) &&
      isAfter(date, minDate) &&
      isBefore(date, maxDate) &&
      getDay(date) !== 0 // Not Sunday
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <h3 className="font-semibold">
          {format(currentMonth, 'MMMM yyyy', { locale: hr })}
        </h3>

        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {eachDayOfInterval({
          start: startOfMonth(currentMonth),
          end: endOfMonth(currentMonth),
        }).map(date => (
          <button
            key={date.toString()}
            onClick={() => isDateSelectable(date) && onDateSelect(date)}
            disabled={!isDateSelectable(date)}
            className={cn(
              'aspect-square rounded-lg text-sm font-medium',
              'transition-all duration-200',
              isDateSelectable(date)
                ? 'hover:bg-blue-100 cursor-pointer'
                : 'cursor-not-allowed opacity-50',
              selectedDate && isSameDay(date, selectedDate)
                ? 'bg-blue-600 text-white'
                : 'text-gray-900',
              !isDateAvailable(date) && 'bg-gray-100 text-gray-400'
            )}
          >
            {format(date, 'd')}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-600 rounded" />
          <span>Odabrano</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border border-gray-300 rounded" />
          <span>Dostupno</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 rounded" />
          <span>Nedostupno</span>
        </div>
      </div>
    </div>
  );
};
```

---

*Technical Guide v1.0*
*Complete Implementation Documentation*
*Production-Ready Architecture*
*Last Updated: January 2025*