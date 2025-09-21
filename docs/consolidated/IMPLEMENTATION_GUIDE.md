# Implementation Guide - WebUredno Platform

## Table of Contents

1. [Development Environment Setup](#development-environment-setup)
2. [Frontend Implementation](#frontend-implementation)
3. [Backend Implementation](#backend-implementation)
4. [Component Specifications](#component-specifications)
5. [Feature Implementation](#feature-implementation)
6. [Integration Implementation](#integration-implementation)
7. [Implementation Roadmap](#implementation-roadmap)
8. [Code Examples](#code-examples)

## Development Environment Setup

### Prerequisites Installation

```bash
# Install Node.js 18+ LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL 15
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt-get update
sudo apt-get -y install postgresql-15

# Install Redis
sudo apt-get install redis-server

# Install global tools
npm install -g pnpm typescript ts-node prisma
```

### Project Initialization

```bash
# Clone repository
git clone https://github.com/uredno/weburedno.git
cd weburedno

# Install dependencies
npm install

# Setup database
createdb weburedno_dev
npm run db:migrate
npm run db:seed

# Configure environment
cp .env.example .env.local
# Edit .env.local with your configurations
```

### Environment Configuration

```env
# Application Settings
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Uredno
NEXT_PUBLIC_DEFAULT_LOCALE=hr

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/weburedno_dev
SHADOW_DATABASE_URL=postgresql://user:password@localhost:5432/weburedno_shadow

# Redis Cache
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
ADMIN_PASSWORD_HASH=$2b$10$YourBcryptHashHere
SESSION_SECRET=your-session-secret-min-32-chars

# Google Calendar API
GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}
GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com

# Email Service (SendGrid)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@uredno.eu
SENDGRID_FROM_NAME=Uredno Čišćenje

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+385xxxxxxxxx

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Sentry Error Tracking
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# Feature Flags
FEATURE_ONLINE_PAYMENT=false
FEATURE_CUSTOMER_PORTAL=false
FEATURE_MOBILE_APP=false
```

### Development Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,md}\"",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "analyze": "ANALYZE=true next build",
    "postinstall": "prisma generate"
  }
}
```

## Frontend Implementation

### Component Architecture

#### Directory Structure

```
src/
├── app/                        # Next.js App Router
│   ├── (public)/              # Public routes
│   │   ├── layout.tsx         # Public layout
│   │   ├── page.tsx           # Homepage
│   │   ├── booking/           # Booking flow
│   │   │   ├── page.tsx       # Booking start
│   │   │   ├── [step]/        # Dynamic steps
│   │   │   └── confirmation/  # Confirmation page
│   │   ├── services/          # Service pages
│   │   │   ├── page.tsx       # Services list
│   │   │   └── [slug]/        # Service details
│   │   └── contact/           # Contact page
│   ├── (auth)/                # Protected routes
│   │   ├── layout.tsx         # Auth layout
│   │   ├── admin/             # Admin dashboard
│   │   └── customer/          # Customer portal
│   ├── api/                   # API routes
│   │   ├── auth/              # Auth endpoints
│   │   ├── bookings/          # Booking endpoints
│   │   └── webhooks/          # External webhooks
│   ├── globals.css            # Global styles
│   └── layout.tsx             # Root layout
├── components/                 # React components
│   ├── ui/                    # Base UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   └── select.tsx
│   ├── forms/                 # Form components
│   │   ├── BookingForm.tsx
│   │   ├── ContactForm.tsx
│   │   └── LoginForm.tsx
│   ├── booking/               # Booking components
│   │   ├── ServiceSelector.tsx
│   │   ├── DateTimePicker.tsx
│   │   ├── PricingCalculator.tsx
│   │   └── BookingSummary.tsx
│   ├── layout/                # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Navigation.tsx
│   │   └── MobileMenu.tsx
│   └── common/                # Shared components
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       └── SEO.tsx
├── lib/                       # Utilities & logic
│   ├── api/                  # API client
│   ├── auth/                 # Auth utilities
│   ├── hooks/                # Custom hooks
│   ├── utils/                # Helper functions
│   └── validations/          # Zod schemas
├── types/                     # TypeScript types
└── styles/                    # Additional styles
```

### Core Component Implementation

#### HomePage Component

```tsx
// app/(public)/page.tsx
import { Hero } from '@/components/sections/Hero';
import { Services } from '@/components/sections/Services';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { Testimonials } from '@/components/sections/Testimonials';
import { PricingCalculator } from '@/components/booking/PricingCalculator';
import { TrustBadges } from '@/components/common/TrustBadges';

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBadges />
      <Services />
      <HowItWorks />
      <PricingCalculator />
      <Testimonials />
    </>
  );
}

// components/sections/Hero.tsx
export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-white py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold mb-6">
              Čistimo. Vi se opustite.
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Transparentne cijene, online rezervacija u 60 sekundi,
              profesionalni tim za čišćenje vašeg doma.
            </p>
            <div className="flex gap-4 mb-8">
              <Link href="/booking">
                <Button size="lg" className="shadow-lg">
                  Rezerviraj Odmah
                </Button>
              </Link>
              <Link href="#pricing">
                <Button variant="outline" size="lg">
                  Izračunaj Cijenu
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Badge>€15/sat po osobi • Min. €45</Badge>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400" />
                4.9 od 1000+ recenzija
              </span>
            </div>
          </div>
          <div className="relative">
            <Image
              src="/images/hero-cleaning.jpg"
              alt="Profesionalno čišćenje"
              width={600}
              height={400}
              className="rounded-lg shadow-2xl"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
```

#### BookingForm Component

```tsx
// components/booking/BookingForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookingSchema, type BookingData } from '@/lib/validations/booking';
import { ServiceSelector } from './ServiceSelector';
import { PropertyDetails } from './PropertyDetails';
import { DateTimeSelector } from './DateTimeSelector';
import { ContactInfo } from './ContactInfo';
import { BookingSummary } from './BookingSummary';

const STEPS = [
  { id: 'service', title: 'Odabir Usluge' },
  { id: 'property', title: 'Detalji Nekretnine' },
  { id: 'datetime', title: 'Datum i Vrijeme' },
  { id: 'contact', title: 'Kontakt Podaci' },
  { id: 'summary', title: 'Pregled i Potvrda' },
];

export function BookingForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BookingData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceType: 'standard',
      frequency: 'once',
      propertySize: 80,
      addons: [],
    },
  });

  const onSubmit = async (data: BookingData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Booking failed');

      const result = await response.json();
      router.push(`/booking/confirmation/${result.data.bookingReference}`);
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Greška pri rezervaciji. Molimo pokušajte ponovno.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                'flex-1 text-center pb-2',
                index <= currentStep ? 'border-b-2 border-blue-600' : 'border-b border-gray-300'
              )}
            >
              <span className={cn(
                'text-sm font-medium',
                index <= currentStep ? 'text-blue-600' : 'text-gray-500'
              )}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Steps */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {currentStep === 0 && <ServiceSelector form={form} />}
          {currentStep === 1 && <PropertyDetails form={form} />}
          {currentStep === 2 && <DateTimeSelector form={form} />}
          {currentStep === 3 && <ContactInfo form={form} />}
          {currentStep === 4 && <BookingSummary form={form} />}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              Nazad
            </Button>

            {currentStep < STEPS.length - 1 ? (
              <Button type="button" onClick={nextStep}>
                Dalje
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Obrađujemo...' : 'Potvrdi Rezervaciju'}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
```

#### PricingCalculator Component

```tsx
// components/booking/PricingCalculator.tsx
'use client';

import { useState, useMemo } from 'react';
import { calculatePrice } from '@/lib/pricing';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function PricingCalculator() {
  const [serviceType, setServiceType] = useState('standard');
  const [propertySize, setPropertySize] = useState(80);
  const [frequency, setFrequency] = useState('once');
  const [addons, setAddons] = useState<string[]>([]);

  const pricing = useMemo(() => {
    return calculatePrice({
      serviceType,
      propertySize,
      frequency,
      addons,
    });
  }, [serviceType, propertySize, frequency, addons]);

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Izračunajte Cijenu</h2>

      {/* Service Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3">
          Tip Usluge
        </label>
        <RadioGroup value={serviceType} onValueChange={setServiceType}>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <RadioGroupItem value="standard" />
              <span>Standardno čišćenje</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <RadioGroupItem value="deep" />
              <span>Dubinsko čišćenje (+50%)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <RadioGroupItem value="move_in" />
              <span>Čišćenje za useljenje (+30%)</span>
            </label>
          </div>
        </RadioGroup>
      </div>

      {/* Property Size */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3">
          Veličina nekretnine: {propertySize}m²
        </label>
        <Slider
          value={[propertySize]}
          onValueChange={([value]) => setPropertySize(value)}
          min={20}
          max={300}
          step={10}
          className="w-full"
        />
      </div>

      {/* Frequency */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3">
          Učestalost čišćenja
        </label>
        <RadioGroup value={frequency} onValueChange={setFrequency}>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <RadioGroupItem value="once" />
              <span>Jednokratno</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <RadioGroupItem value="weekly" />
              <span>Tjedno (-15%)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <RadioGroupItem value="biweekly" />
              <span>Dvotjedno (-10%)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <RadioGroupItem value="monthly" />
              <span>Mjesečno (-5%)</span>
            </label>
          </div>
        </RadioGroup>
      </div>

      {/* Price Display */}
      <div className="border-t pt-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Osnovna cijena:</span>
            <span>€{pricing.basePrice}</span>
          </div>
          {pricing.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Popust:</span>
              <span>-€{pricing.discount}</span>
            </div>
          )}
          <div className="flex justify-between text-xl font-bold">
            <span>Ukupno:</span>
            <span>€{pricing.totalPrice}</span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-gray-600">
            <p>⏱ Trajanje: {pricing.duration} sati</p>
            <p>👥 Tim: {pricing.teamSize} {pricing.teamSize === 1 ? 'osoba' : 'osobe'}</p>
          </div>
        </div>

        <Button className="w-full mt-6" size="lg">
          Rezerviraj Sada
        </Button>
      </div>
    </Card>
  );
}
```

## Backend Implementation

### API Route Structure

#### Authentication API

```typescript
// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { JWTService } from '@/lib/auth/jwt';

const registerSchema = z.object({
  email: z.string().email('Neispravan email'),
  password: z.string().min(8, 'Lozinka mora imati najmanje 8 znakova'),
  firstName: z.string().min(2, 'Ime je obavezno'),
  lastName: z.string().min(2, 'Prezime je obavezno'),
  phone: z.string().regex(/^(\+385|0)[0-9]{8,9}$/, 'Neispravan broj telefona'),
  marketingConsent: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = registerSchema.parse(body);

    // Check if user exists
    const existingUser = await prisma.customer.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email već postoji' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 12);

    // Create user
    const customer = await prisma.customer.create({
      data: {
        email: validated.email,
        passwordHash: hashedPassword,
        firstName: validated.firstName,
        lastName: validated.lastName,
        phone: validated.phone,
        marketingConsent: validated.marketingConsent || false,
      },
    });

    // Generate JWT
    const jwtService = new JWTService();
    const token = jwtService.generateToken({
      id: customer.id,
      email: customer.email,
      role: 'customer',
    });

    // Set cookie
    const response = NextResponse.json({
      success: true,
      data: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
      },
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Greška pri registraciji' },
      { status: 500 }
    );
  }
}
```

#### Booking API

```typescript
// app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bookingSchema } from '@/lib/validations/booking';
import { GoogleCalendarService } from '@/lib/integrations/google-calendar';
import { EmailService } from '@/lib/integrations/email';
import { generateBookingReference } from '@/lib/utils/booking';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = bookingSchema.parse(body);

    // Calculate pricing
    const pricing = calculatePrice({
      serviceType: validated.serviceType,
      propertySize: validated.propertySize,
      frequency: validated.frequency,
      addons: validated.addons,
    });

    // Check availability
    const calendar = new GoogleCalendarService();
    const isAvailable = await calendar.checkAvailability(
      new Date(validated.date + ' ' + validated.timeSlot),
      pricing.duration * 60
    );

    if (!isAvailable) {
      return NextResponse.json(
        { error: 'Termin nije dostupan' },
        { status: 400 }
      );
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        bookingReference: generateBookingReference(),
        serviceId: validated.serviceType,
        scheduledDate: validated.date,
        scheduledTime: validated.timeSlot,
        duration: pricing.duration * 60,
        teamSize: pricing.teamSize,
        basePrice: pricing.basePrice,
        discountAmount: pricing.discount,
        totalPrice: pricing.totalPrice,
        frequency: validated.frequency,
        specialInstructions: validated.specialInstructions,
        status: 'pending',
        customer: {
          connectOrCreate: {
            where: { email: validated.customer.email },
            create: validated.customer,
          },
        },
        address: {
          create: validated.address,
        },
      },
      include: {
        customer: true,
        address: true,
        service: true,
      },
    });

    // Create calendar event
    const eventId = await calendar.createBookingEvent(booking);

    // Update booking with calendar event ID
    await prisma.booking.update({
      where: { id: booking.id },
      data: { googleEventId: eventId },
    });

    // Send confirmation email
    const emailService = new EmailService();
    await emailService.sendBookingConfirmation(booking);

    return NextResponse.json({
      success: true,
      data: {
        id: booking.id,
        bookingReference: booking.bookingReference,
        status: booking.status,
        scheduledDate: booking.scheduledDate,
        scheduledTime: booking.scheduledTime,
        totalPrice: booking.totalPrice,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }

    console.error('Booking error:', error);
    return NextResponse.json(
      { error: 'Greška pri kreiranju rezervacije' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where = {
      ...(status && { status }),
      ...(from && to && {
        scheduledDate: {
          gte: new Date(from),
          lte: new Date(to),
        },
      }),
    };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: {
          scheduledDate: 'desc',
        },
        include: {
          customer: true,
          service: true,
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        bookings,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { error: 'Greška pri dohvaćanju rezervacija' },
      { status: 500 }
    );
  }
}
```

### Business Logic Implementation

#### Pricing Engine

```typescript
// lib/pricing/engine.ts
export interface PricingParams {
  serviceType: 'standard' | 'deep' | 'move_in' | 'move_out' | 'post_construction';
  propertySize: number;
  frequency: 'once' | 'weekly' | 'biweekly' | 'monthly';
  addons?: string[];
}

export interface PricingResult {
  basePrice: number;
  discount: number;
  addonsPrice: number;
  totalPrice: number;
  duration: number; // hours
  teamSize: number;
  breakdown: {
    hourlyRate: number;
    hours: number;
    frequencyDiscount: number;
    serviceMultiplier: number;
  };
}

const HOURLY_RATE = 15;
const MINIMUM_CHARGE = 45;

const SERVICE_MULTIPLIERS = {
  standard: 1.0,
  deep: 1.5,
  move_in: 1.3,
  move_out: 1.3,
  post_construction: 2.0,
};

const FREQUENCY_DISCOUNTS = {
  once: 0,
  weekly: 0.15,
  biweekly: 0.10,
  monthly: 0.05,
};

const ADDON_PRICES = {
  windows: 15,
  ironing: 22.5,
  oven: 11.25,
  refrigerator: 7.5,
  cabinets: 15,
  balcony: 7.5,
  garage: 15,
  laundry: 15,
};

export function calculatePrice(params: PricingParams): PricingResult {
  // Calculate base hours based on property size
  const baseHours = calculateBaseHours(params.propertySize);

  // Determine team size
  const teamSize = calculateTeamSize(params.propertySize);

  // Apply service type multiplier
  const serviceMultiplier = SERVICE_MULTIPLIERS[params.serviceType];
  const adjustedHours = baseHours * serviceMultiplier;

  // Calculate base price
  const basePrice = adjustedHours * HOURLY_RATE * teamSize;

  // Calculate addons price
  const addonsPrice = calculateAddonsPrice(params.addons || [], teamSize);

  // Apply frequency discount
  const frequencyDiscount = FREQUENCY_DISCOUNTS[params.frequency];
  const subtotal = basePrice + addonsPrice;
  const discount = subtotal * frequencyDiscount;

  // Calculate final price (respecting minimum)
  const finalPrice = Math.max(subtotal - discount, MINIMUM_CHARGE);

  return {
    basePrice: Math.round(basePrice * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    addonsPrice: Math.round(addonsPrice * 100) / 100,
    totalPrice: Math.round(finalPrice * 100) / 100,
    duration: adjustedHours,
    teamSize,
    breakdown: {
      hourlyRate: HOURLY_RATE,
      hours: adjustedHours,
      frequencyDiscount,
      serviceMultiplier,
    },
  };
}

function calculateBaseHours(propertySize: number): number {
  if (propertySize <= 50) return 2;
  if (propertySize <= 80) return 2.5;
  if (propertySize <= 120) return 3;
  if (propertySize <= 180) return 3.5;
  if (propertySize <= 250) return 4;
  return 4.5;
}

function calculateTeamSize(propertySize: number): number {
  if (propertySize <= 100) return 1;
  if (propertySize <= 200) return 2;
  return 3;
}

function calculateAddonsPrice(addons: string[], teamSize: number): number {
  return addons.reduce((total, addon) => {
    const price = ADDON_PRICES[addon] || 0;
    return total + (price * teamSize);
  }, 0);
}
```

#### Validation Schemas

```typescript
// lib/validations/booking.ts
import { z } from 'zod';

// Croatian-specific validations
const croatianPhone = z.string().regex(
  /^(\+385|0)[0-9]{8,9}$/,
  'Unesite ispravan hrvatski broj telefona'
);

const croatianPostalCode = z.string().regex(
  /^[0-9]{5}$/,
  'Unesite ispravan poštanski broj'
);

export const customerSchema = z.object({
  firstName: z.string()
    .min(2, 'Ime mora imati najmanje 2 znaka')
    .max(50, 'Ime može imati najviše 50 znakova'),
  lastName: z.string()
    .min(2, 'Prezime mora imati najmanje 2 znaka')
    .max(50, 'Prezime može imati najviše 50 znakova'),
  email: z.string()
    .email('Unesite ispravnu email adresu'),
  phone: croatianPhone,
});

export const addressSchema = z.object({
  street: z.string()
    .min(5, 'Ulica mora imati najmanje 5 znakova'),
  city: z.string()
    .min(2, 'Grad je obavezan'),
  postalCode: croatianPostalCode,
  apartmentNumber: z.string().optional(),
  floor: z.number().optional(),
  notes: z.string().max(500).optional(),
});

export const bookingSchema = z.object({
  serviceType: z.enum(['standard', 'deep', 'move_in', 'move_out', 'post_construction']),
  propertySize: z.number()
    .min(20, 'Minimalna veličina je 20m²')
    .max(500, 'Maksimalna veličina je 500m²'),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Neispravan format datuma'),
  timeSlot: z.string()
    .regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, 'Neispravan format vremena'),
  frequency: z.enum(['once', 'weekly', 'biweekly', 'monthly']),
  addons: z.array(z.string()).optional(),
  customer: customerSchema,
  address: addressSchema,
  specialInstructions: z.string().max(1000).optional(),
  paymentMethod: z.enum(['card', 'cash', 'bank_transfer']),
});

export type BookingData = z.infer<typeof bookingSchema>;
```

## Component Specifications

### UI Component Library

#### Button Component

```tsx
// components/ui/button.tsx
import { cn } from '@/lib/utils';
import { VariantProps, cva } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white hover:bg-blue-700',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
```

#### Form Components

```tsx
// components/ui/form.tsx
import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Label } from './label';

export interface FormFieldProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  children: React.ReactElement;
}

export function FormField({
  name,
  label,
  description,
  required,
  children,
}: FormFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className="space-y-2">
          {label && (
            <Label htmlFor={name} className={cn(required && 'required')}>
              {label}
            </Label>
          )}
          {React.cloneElement(children, {
            ...field,
            id: name,
            'aria-invalid': !!error,
            'aria-describedby': error ? `${name}-error` : undefined,
            className: cn(
              children.props.className,
              error && 'border-red-500 focus:border-red-500'
            ),
          })}
          {description && !error && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
          {error && (
            <p id={`${name}-error`} className="text-sm text-red-500">
              {error.message}
            </p>
          )}
        </div>
      )}
    />
  );
}
```

## Feature Implementation

### Booking System Implementation

```typescript
// features/booking/BookingWizard.tsx
'use client';

import { useState } from 'react';
import { useBookingStore } from '@/stores/booking';
import { ServiceStep } from './steps/ServiceStep';
import { PropertyStep } from './steps/PropertyStep';
import { ScheduleStep } from './steps/ScheduleStep';
import { ContactStep } from './steps/ContactStep';
import { ReviewStep } from './steps/ReviewStep';
import { PaymentStep } from './steps/PaymentStep';

const STEPS = [
  { component: ServiceStep, title: 'Usluga' },
  { component: PropertyStep, title: 'Nekretnina' },
  { component: ScheduleStep, title: 'Termin' },
  { component: ContactStep, title: 'Kontakt' },
  { component: ReviewStep, title: 'Pregled' },
  { component: PaymentStep, title: 'Plaćanje' },
];

export function BookingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const { bookingData, updateBookingData } = useBookingStore();

  const CurrentStepComponent = STEPS[currentStep].component;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) throw new Error('Booking failed');

      const result = await response.json();
      router.push(`/booking/success/${result.data.bookingReference}`);
    } catch (error) {
      console.error('Booking error:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center">
          {STEPS.map((step, index) => (
            <React.Fragment key={index}>
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full',
                  index <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                )}
              >
                {index + 1}
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-1',
                    index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {STEPS.map((step, index) => (
            <span
              key={index}
              className={cn(
                'text-sm',
                index <= currentStep ? 'text-blue-600' : 'text-gray-500'
              )}
            >
              {step.title}
            </span>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <CurrentStepComponent
          data={bookingData}
          updateData={updateBookingData}
          onNext={handleNext}
          onBack={handleBack}
          onComplete={handleComplete}
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          Natrag
        </Button>

        {currentStep === STEPS.length - 1 ? (
          <Button onClick={handleComplete}>
            Završi Rezervaciju
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Dalje
          </Button>
        )}
      </div>
    </div>
  );
}
```

### Admin Dashboard Implementation

```tsx
// app/(auth)/admin/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { BookingList } from '@/components/admin/BookingList';
import { DashboardStats } from '@/components/admin/DashboardStats';
import { CalendarView } from '@/components/admin/CalendarView';
import { RevenueChart } from '@/components/admin/RevenueChart';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      const data = await response.json();
      setStats(data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Učitavanje...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <h3 className="text-sm text-gray-500">Ukupno Rezervacija</h3>
          <p className="text-2xl font-bold">{stats.totalBookings}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm text-gray-500">Aktivni Korisnici</h3>
          <p className="text-2xl font-bold">{stats.activeCustomers}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm text-gray-500">Mjesečni Prihod</h3>
          <p className="text-2xl font-bold">€{stats.monthlyRevenue}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm text-gray-500">Prosječna Ocjena</h3>
          <p className="text-2xl font-bold">{stats.averageRating}/5</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Nedavne Rezervacije</h2>
          <BookingList bookings={stats.recentBookings} />
        </Card>

        {/* Revenue Chart */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Prihod po Mjesecima</h2>
          <RevenueChart data={stats.revenueTrend} />
        </Card>
      </div>

      {/* Calendar View */}
      <Card className="p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Kalendar Rezervacija</h2>
        <CalendarView bookings={stats.upcomingBookings} />
      </Card>
    </div>
  );
}
```

## Integration Implementation

### Google Calendar Integration

```typescript
// lib/integrations/google-calendar/setup.ts
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

export class GoogleCalendarSetup {
  private auth: JWT;

  constructor() {
    const serviceAccountKey = JSON.parse(
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY
    );

    this.auth = new google.auth.JWT(
      serviceAccountKey.client_email,
      null,
      serviceAccountKey.private_key,
      ['https://www.googleapis.com/auth/calendar'],
      null
    );
  }

  async initialize() {
    await this.auth.authorize();
    const calendar = google.calendar({ version: 'v3', auth: this.auth });

    // Set up calendar with Croatian timezone
    await calendar.calendars.patch({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      requestBody: {
        timeZone: 'Europe/Zagreb',
        summary: 'Uredno Čišćenje - Raspored',
        description: 'Kalendar za praćenje rezervacija čišćenja',
      },
    });

    // Create color-coded event types
    const eventColors = {
      standard: '9', // Blue
      deep: '10', // Green
      move_in: '11', // Red
      move_out: '6', // Orange
      post_construction: '5', // Yellow
    };

    return { calendar, eventColors };
  }

  async createWorkingHours() {
    const calendar = google.calendar({ version: 'v3', auth: this.auth });

    const workingHours = [
      { day: 'MO', start: '08:00', end: '20:00' },
      { day: 'TU', start: '08:00', end: '20:00' },
      { day: 'WE', start: '08:00', end: '20:00' },
      { day: 'TH', start: '08:00', end: '20:00' },
      { day: 'FR', start: '08:00', end: '20:00' },
      { day: 'SA', start: '09:00', end: '18:00' },
      { day: 'SU', start: '10:00', end: '16:00' },
    ];

    // Implementation of working hours setup
    return workingHours;
  }
}
```

### Email Template System

```tsx
// emails/BookingConfirmation.tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface BookingConfirmationProps {
  customerName: string;
  bookingReference: string;
  date: string;
  time: string;
  service: string;
  address: string;
  totalPrice: number;
}

export default function BookingConfirmation({
  customerName,
  bookingReference,
  date,
  time,
  service,
  address,
  totalPrice,
}: BookingConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>Potvrda rezervacije - {bookingReference}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://uredno.eu/logo.png"
            width="150"
            height="50"
            alt="Uredno"
            style={logo}
          />

          <Heading style={h1}>Rezervacija Potvrđena!</Heading>

          <Text style={text}>
            Poštovani/a {customerName},
          </Text>

          <Text style={text}>
            Hvala vam što ste odabrali Uredno za vaše potrebe čišćenja.
            Vaša rezervacija je uspješno potvrđena.
          </Text>

          <Section style={infoBox}>
            <Text style={infoTitle}>Detalji Rezervacije</Text>
            <Text style={infoItem}>
              <strong>Broj rezervacije:</strong> {bookingReference}
            </Text>
            <Text style={infoItem}>
              <strong>Datum:</strong> {date}
            </Text>
            <Text style={infoItem}>
              <strong>Vrijeme:</strong> {time}
            </Text>
            <Text style={infoItem}>
              <strong>Usluga:</strong> {service}
            </Text>
            <Text style={infoItem}>
              <strong>Adresa:</strong> {address}
            </Text>
            <Text style={infoItem}>
              <strong>Ukupna cijena:</strong> €{totalPrice}
            </Text>
          </Section>

          <Text style={text}>
            Naš tim će doći na navedenu adresu u dogovoreno vrijeme.
            Molimo vas da osigurate pristup prostorima koji trebaju biti očišćeni.
          </Text>

          <Section style={reminderBox}>
            <Text style={reminderTitle}>Podsjetnik</Text>
            <Text style={text}>
              Primit ćete SMS podsjetnik 24 sata prije termina čišćenja.
              Ako trebate promijeniti ili otkazati termin, molimo učinite to
              najmanje 24 sata unaprijed.
            </Text>
          </Section>

          <Text style={text}>
            Ako imate bilo kakvih pitanja, slobodno nas kontaktirajte:
          </Text>

          <Text style={contactInfo}>
            📧 kontakt@uredno.eu<br />
            📱 +385 92 450 2265<br />
            🌐 <Link href="https://uredno.eu">uredno.eu</Link>
          </Text>

          <Text style={footer}>
            S poštovanjem,<br />
            Tim Uredno
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const logo = {
  margin: '0 auto',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '30px 0',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const infoBox = {
  backgroundColor: '#f4f4f5',
  borderRadius: '8px',
  padding: '24px',
  margin: '32px 0',
};

const infoTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  marginBottom: '12px',
};

const infoItem = {
  fontSize: '14px',
  margin: '8px 0',
};

const reminderBox = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
};

const reminderTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#92400e',
  marginBottom: '8px',
};

const contactInfo = {
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 0',
};

const footer = {
  color: '#666',
  fontSize: '14px',
  marginTop: '32px',
};
```

## Implementation Roadmap

### Phase 1: Foundation (Week 1)

#### Day 1-2: Project Setup
- [ ] Initialize Next.js project with TypeScript
- [ ] Configure Tailwind CSS and shadcn/ui
- [ ] Set up ESLint, Prettier, and Husky
- [ ] Create project structure
- [ ] Configure environment variables

#### Day 3-4: Database Setup
- [ ] Install and configure PostgreSQL
- [ ] Set up Prisma ORM
- [ ] Create database schema
- [ ] Generate Prisma client
- [ ] Create seed data

#### Day 5: Core Components
- [ ] Implement UI component library
- [ ] Create layout components
- [ ] Build navigation system
- [ ] Implement responsive design
- [ ] Add loading states

### Phase 2: Core Features (Week 2)

#### Day 6-7: Homepage
- [ ] Implement Hero section
- [ ] Create Service cards
- [ ] Build Trust badges
- [ ] Add Testimonials section
- [ ] Implement SEO optimization

#### Day 8-9: Booking System
- [ ] Create booking wizard
- [ ] Implement service selection
- [ ] Build date/time picker
- [ ] Add pricing calculator
- [ ] Create booking summary

#### Day 10: API Development
- [ ] Implement authentication endpoints
- [ ] Create booking API
- [ ] Add pricing endpoints
- [ ] Implement validation
- [ ] Add error handling

### Phase 3: Integrations (Week 3)

#### Day 11-12: Google Calendar
- [ ] Set up service account
- [ ] Implement calendar integration
- [ ] Create event management
- [ ] Add availability checking
- [ ] Test synchronization

#### Day 13-14: Email System
- [ ] Configure SendGrid
- [ ] Create email templates
- [ ] Implement email queue
- [ ] Add notification triggers
- [ ] Test email delivery

#### Day 15: Payment Integration
- [ ] Set up payment gateway
- [ ] Implement payment flow
- [ ] Add invoice generation
- [ ] Create refund logic
- [ ] Test transactions

### Phase 4: Admin & Security (Week 4)

#### Day 16-17: Admin Dashboard
- [ ] Create admin authentication
- [ ] Build dashboard layout
- [ ] Implement booking management
- [ ] Add customer management
- [ ] Create reporting tools

#### Day 18-19: Security Implementation
- [ ] Implement JWT authentication
- [ ] Add CSRF protection
- [ ] Configure rate limiting
- [ ] Set up security headers
- [ ] Implement input validation

#### Day 20: Testing
- [ ] Write unit tests
- [ ] Create integration tests
- [ ] Implement E2E tests
- [ ] Perform security audit
- [ ] Load testing

### Phase 5: Deployment (Week 5)

#### Day 21-22: Production Prep
- [ ] Optimize performance
- [ ] Configure production environment
- [ ] Set up monitoring
- [ ] Create backup strategy
- [ ] Document deployment process

#### Day 23-24: Deployment
- [ ] Deploy to Vercel
- [ ] Configure domain
- [ ] Set up SSL
- [ ] Deploy database
- [ ] Configure CDN

#### Day 25: Launch
- [ ] Final testing
- [ ] Go-live checklist
- [ ] Monitor performance
- [ ] Address issues
- [ ] Celebrate launch!

## Code Examples

### Custom Hooks

```typescript
// hooks/useBooking.ts
import { useState, useCallback } from 'react';
import { BookingData } from '@/types/booking';

export function useBooking() {
  const [booking, setBooking] = useState<Partial<BookingData>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateBooking = useCallback((data: Partial<BookingData>) => {
    setBooking(prev => ({ ...prev, ...data }));
  }, []);

  const submitBooking = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking),
      });

      if (!response.ok) {
        throw new Error('Booking submission failed');
      }

      const result = await response.json();
      return result.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [booking]);

  return {
    booking,
    updateBooking,
    submitBooking,
    loading,
    error,
  };
}
```

### Utility Functions

```typescript
// lib/utils/croatian.ts
export function formatCroatianDate(date: Date): string {
  return new Intl.DateTimeFormat('hr-HR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatCroatianCurrency(amount: number): string {
  return new Intl.NumberFormat('hr-HR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export function validateOIB(oib: string): boolean {
  if (!/^\d{11}$/.test(oib)) return false;

  let sum = 10;
  for (let i = 0; i < 10; i++) {
    sum = ((sum + parseInt(oib[i])) % 10 || 10) * 2 % 11;
  }

  return (11 - sum) % 10 === parseInt(oib[10]);
}

export function parsePhoneNumber(phone: string): string {
  // Convert to international format
  if (phone.startsWith('0')) {
    return '+385' + phone.substring(1);
  }
  return phone;
}
```

### Database Queries

```typescript
// lib/db/queries.ts
import { prisma } from '@/lib/prisma';

export async function getAvailableTimeSlots(date: Date) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const bookings = await prisma.booking.findMany({
    where: {
      scheduledDate: {
        gte: dayStart,
        lte: dayEnd,
      },
      status: {
        in: ['pending', 'confirmed'],
      },
    },
    select: {
      scheduledTime: true,
      duration: true,
      teamSize: true,
    },
  });

  // Calculate available slots based on team capacity
  const timeSlots = generateTimeSlots();
  const availableSlots = timeSlots.filter(slot => {
    const slotTeamsInUse = bookings.reduce((total, booking) => {
      if (isTimeOverlap(slot, booking)) {
        return total + booking.teamSize;
      }
      return total;
    }, 0);

    return slotTeamsInUse < MAX_TEAMS;
  });

  return availableSlots;
}

export async function getCustomerBookingHistory(customerId: string) {
  return prisma.booking.findMany({
    where: {
      customerId,
      status: 'completed',
    },
    include: {
      service: true,
      reviews: true,
    },
    orderBy: {
      scheduledDate: 'desc',
    },
    take: 10,
  });
}
```

---

*Implementation Guide Version 2.0 | Last Updated: 2024*