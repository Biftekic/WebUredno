# Technical Documentation - WebUredno Platform

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [API Documentation](#api-documentation)
4. [Database Architecture](#database-architecture)
5. [Integration Specifications](#integration-specifications)
6. [Security Architecture](#security-architecture)
7. [Performance Optimization](#performance-optimization)
8. [Development Standards](#development-standards)

## System Architecture

### High-Level Architecture

```
┌───────────────────────────────────────────────────────────┐
│                     Client Layer                          │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Web App    │  │  Mobile Web  │  │  Admin Panel │    │
│  │  (Next.js)  │  │  (Responsive)│  │  (Next.js)   │    │
│  └──────┬──────┘  └──────┬───────┘  └──────┬───────┘    │
└─────────┼─────────────────┼──────────────────┼────────────┘
          │                 │                  │
          └─────────────────▼──────────────────┘
                            │
┌───────────────────────────▼────────────────────────────────┐
│                   API Gateway Layer                        │
│  ┌──────────────────────────────────────────────────┐    │
│  │            Next.js API Routes                     │    │
│  │  - Authentication & Authorization                 │    │
│  │  - Rate Limiting & Throttling                    │    │
│  │  - Request Validation                            │    │
│  │  - Response Caching                              │    │
│  └─────────────────────┬────────────────────────────┘    │
└────────────────────────┼───────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  Business Logic Layer                       │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Booking   │  │   Pricing    │  │   Customer   │     │
│  │   Service   │  │   Engine     │  │   Service    │     │
│  └─────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
└────────┼──────────────────┼──────────────────┼─────────────┘
         │                  │                  │
         └──────────────────▼──────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                  Integration Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Google  │  │  Email   │  │  Payment │  │  SMS     │  │
│  │ Calendar │  │  Service │  │  Gateway │  │  Service │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└──────────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    Data Layer                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              PostgreSQL Database                      │  │
│  │  - Customers, Bookings, Services                     │  │
│  │  - Audit Logs, Analytics                             │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Redis Cache                              │  │
│  │  - Session Storage, Rate Limiting                    │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Component Architecture

#### Frontend Architecture

```typescript
// Component hierarchy
src/
├── app/                           // Next.js App Router
│   ├── (public)/                 // Public routes
│   │   ├── page.tsx              // Homepage
│   │   ├── booking/              // Booking flow
│   │   ├── services/             // Service descriptions
│   │   └── contact/              // Contact page
│   ├── (auth)/                   // Protected routes
│   │   ├── admin/                // Admin dashboard
│   │   └── customer/             // Customer portal
│   ├── api/                      // API routes
│   └── layout.tsx                // Root layout
├── components/
│   ├── ui/                       // Base UI components
│   ├── forms/                    // Form components
│   ├── booking/                  // Booking-specific
│   └── admin/                    // Admin components
├── lib/                          // Business logic
│   ├── services/                 // Service layer
│   ├── utils/                    // Utilities
│   └── validations/              // Schemas
└── types/                        // TypeScript types
```

#### Backend Services Architecture

```typescript
// Service layer structure
interface ServiceArchitecture {
  // Core Services
  BookingService: {
    create: (data: BookingData) => Promise<Booking>
    update: (id: string, data: Partial<BookingData>) => Promise<Booking>
    cancel: (id: string, reason: string) => Promise<void>
    reschedule: (id: string, newDate: Date) => Promise<Booking>
  }

  CustomerService: {
    register: (data: CustomerData) => Promise<Customer>
    authenticate: (credentials: Credentials) => Promise<AuthToken>
    getProfile: (id: string) => Promise<CustomerProfile>
    updateProfile: (id: string, data: Partial<CustomerData>) => Promise<CustomerProfile>
  }

  PricingService: {
    calculate: (params: PricingParams) => Promise<PricingResult>
    getDiscounts: (customerId: string) => Promise<Discount[]>
    applyPromoCode: (code: string, price: number) => Promise<number>
  }

  NotificationService: {
    sendEmail: (template: string, data: EmailData) => Promise<void>
    sendSMS: (phone: string, message: string) => Promise<void>
    scheduleReminder: (booking: Booking) => Promise<void>
  }
}
```

## Technology Stack

### Core Technologies

#### Frontend
- **Framework**: Next.js 14.2.5 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.4.x
- **UI Library**: shadcn/ui
- **State Management**: React Context + Zustand
- **Forms**: React Hook Form 7.x + Zod 3.x
- **Animation**: Framer Motion 11.x
- **Icons**: Lucide React

#### Backend
- **Runtime**: Node.js 18.x LTS
- **Framework**: Next.js API Routes
- **ORM**: Prisma 5.x
- **Validation**: Zod
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer + Sharp
- **Queue**: Bull MQ
- **Cache**: Redis

#### Database
- **Primary**: PostgreSQL 15
- **Cache**: Redis 7
- **File Storage**: AWS S3 / Cloudinary
- **Search**: PostgreSQL Full Text Search

#### Infrastructure
- **Hosting**: Vercel (Frontend) + Railway (Database)
- **CDN**: Vercel Edge Network
- **DNS**: Cloudflare
- **SSL**: Let's Encrypt
- **Monitoring**: Vercel Analytics + Sentry
- **Logging**: Datadog / LogRocket

### Development Tools

```json
{
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0",
    "prettier": "^3.0.0",
    "husky": "^8.0.0",
    "lint-staged": "^14.0.0",
    "jest": "^29.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "playwright": "^1.40.0",
    "msw": "^2.0.0"
  }
}
```

## API Documentation

### RESTful API Design

#### Base URL Structure
```
Production: https://api.uredno.eu/v1
Staging: https://staging-api.uredno.eu/v1
Development: http://localhost:3000/api/v1
```

### Authentication Endpoints

#### POST /api/auth/register
Register a new customer account.

**Request:**
```typescript
{
  email: string           // Valid email address
  password: string        // Min 8 chars, 1 uppercase, 1 number
  firstName: string       // 2-50 characters
  lastName: string        // 2-50 characters
  phone: string          // Croatian format: +385XXXXXXXXX
  marketingConsent: boolean
}
```

**Response (201):**
```typescript
{
  success: true,
  data: {
    id: string
    email: string
    firstName: string
    lastName: string
    createdAt: string
  },
  token: string          // JWT token
}
```

#### POST /api/auth/login
Authenticate user and receive JWT token.

**Request:**
```typescript
{
  email: string
  password: string
  rememberMe?: boolean   // Default: false
}
```

**Response (200):**
```typescript
{
  success: true,
  data: {
    user: {
      id: string
      email: string
      firstName: string
      lastName: string
      role: 'customer' | 'admin'
    },
    token: string
    expiresIn: number    // Seconds until expiration
  }
}
```

### Booking Endpoints

#### POST /api/bookings
Create a new booking.

**Request:**
```typescript
{
  serviceType: 'standard' | 'deep' | 'move_in' | 'move_out' | 'post_construction'
  propertySize: number    // Square meters
  date: string           // ISO 8601 format
  timeSlot: string       // Format: "09:00-11:00"
  frequency?: 'once' | 'weekly' | 'biweekly' | 'monthly'
  addons?: string[]      // Array of addon IDs
  address: {
    street: string
    city: string
    postalCode: string
    apartmentNumber?: string
    notes?: string       // Access instructions
  }
  customer: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  specialInstructions?: string
  paymentMethod: 'card' | 'cash' | 'bank_transfer'
}
```

**Response (201):**
```typescript
{
  success: true,
  data: {
    id: string
    bookingReference: string  // Format: WU2024-ABC123
    status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
    serviceDetails: {
      type: string
      date: string
      timeSlot: string
      duration: number        // Minutes
      teamSize: number
    },
    pricing: {
      basePrice: number
      discount: number
      addonsPrice: number
      totalPrice: number
      currency: 'EUR'
    },
    customer: CustomerInfo,
    address: AddressInfo,
    createdAt: string
  }
}
```

#### GET /api/bookings
Retrieve bookings (requires authentication).

**Query Parameters:**
```
status?: pending|confirmed|completed|cancelled
from?: ISO date string
to?: ISO date string
limit?: number (default: 20, max: 100)
offset?: number (default: 0)
sort?: created_asc|created_desc|date_asc|date_desc
```

**Response (200):**
```typescript
{
  success: true,
  data: {
    bookings: Booking[],
    pagination: {
      total: number
      limit: number
      offset: number
      hasMore: boolean
    }
  }
}
```

#### GET /api/bookings/:id
Get specific booking details.

**Response (200):**
```typescript
{
  success: true,
  data: Booking
}
```

#### PATCH /api/bookings/:id
Update booking (reschedule, modify services).

**Request:**
```typescript
{
  date?: string
  timeSlot?: string
  addons?: string[]
  specialInstructions?: string
}
```

#### DELETE /api/bookings/:id
Cancel a booking.

**Request:**
```typescript
{
  reason: string
  requestRefund?: boolean
}
```

### Pricing Endpoints

#### POST /api/pricing/calculate
Calculate service pricing.

**Request:**
```typescript
{
  serviceType: string
  propertySize: number
  frequency?: string
  addons?: string[]
  promoCode?: string
}
```

**Response (200):**
```typescript
{
  success: true,
  data: {
    basePrice: number
    frequencyDiscount: number
    promoDiscount: number
    addonsPrice: number
    totalPrice: number
    savings: number
    breakdown: {
      hours: number
      teamSize: number
      hourlyRate: number
    }
  }
}
```

### Admin Endpoints

#### GET /api/admin/dashboard
Admin dashboard statistics (requires admin auth).

**Response (200):**
```typescript
{
  success: true,
  data: {
    stats: {
      totalBookings: number
      activeCustomers: number
      monthlyRevenue: number
      averageRating: number
    },
    recentBookings: Booking[],
    upcomingBookings: Booking[],
    performance: {
      bookingTrend: DataPoint[],
      revenueTrend: DataPoint[]
    }
  }
}
```

### Error Responses

All endpoints follow consistent error format:

```typescript
{
  success: false,
  error: {
    code: string           // Error code for client handling
    message: string        // Human-readable message (Croatian)
    field?: string         // Field name for validation errors
    details?: any          // Additional error context
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR`: Invalid input data
- `AUTHENTICATION_REQUIRED`: Missing or invalid token
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_SERVER_ERROR`: Server-side error

## Database Architecture

### PostgreSQL Schema

#### Core Tables

```sql
-- Customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  phone_verified BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  marketing_consent BOOLEAN DEFAULT false,
  language_preference VARCHAR(5) DEFAULT 'hr',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,

  INDEX idx_customers_email (email),
  INDEX idx_customers_phone (phone)
);

-- Addresses table
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  label VARCHAR(50),
  street VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(10) NOT NULL,
  apartment_number VARCHAR(20),
  floor INTEGER,
  building_entrance VARCHAR(20),
  access_instructions TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_addresses_customer (customer_id),
  INDEX idx_addresses_postal (postal_code)
);

-- Services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name_hr VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  description_hr TEXT,
  description_en TEXT,
  base_duration INTEGER NOT NULL, -- minutes
  price_multiplier DECIMAL(3, 2) DEFAULT 1.0,
  min_property_size INTEGER,
  max_property_size INTEGER,
  quality_points INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference VARCHAR(20) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  address_id UUID REFERENCES addresses(id),
  service_id UUID REFERENCES services(id),
  status VARCHAR(20) NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration INTEGER NOT NULL, -- minutes
  team_size INTEGER NOT NULL DEFAULT 1,

  -- Pricing
  base_price DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  addons_price DECIMAL(10, 2) DEFAULT 0,
  total_price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',

  -- Frequency
  frequency VARCHAR(20),
  frequency_discount_percent INTEGER,

  -- Additional info
  special_instructions TEXT,
  internal_notes TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES customers(id),

  -- Tracking
  confirmed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_bookings_customer (customer_id),
  INDEX idx_bookings_date (scheduled_date),
  INDEX idx_bookings_status (status),
  INDEX idx_bookings_reference (booking_reference)
);

-- Booking addons junction table
CREATE TABLE booking_addons (
  booking_id UUID REFERENCES bookings(id),
  addon_id UUID REFERENCES addons(id),
  quantity INTEGER DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (booking_id, addon_id)
);

-- Addons table
CREATE TABLE addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name_hr VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  description_hr TEXT,
  description_en TEXT,
  duration INTEGER NOT NULL, -- additional minutes
  price DECIMAL(10, 2) NOT NULL,
  max_quantity INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Staff members table
CREATE TABLE staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_code VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) NOT NULL,
  role VARCHAR(50) NOT NULL,

  -- Employment details
  hire_date DATE NOT NULL,
  termination_date DATE,
  hourly_rate DECIMAL(10, 2),

  -- Availability
  is_active BOOLEAN DEFAULT true,
  max_hours_per_week INTEGER DEFAULT 40,

  -- Performance
  rating DECIMAL(3, 2),
  completed_jobs INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Booking assignments table
CREATE TABLE booking_assignments (
  booking_id UUID REFERENCES bookings(id),
  staff_member_id UUID REFERENCES staff_members(id),
  is_lead BOOLEAN DEFAULT false,
  assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (booking_id, staff_member_id)
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) UNIQUE,
  customer_id UUID REFERENCES customers(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_published BOOLEAN DEFAULT false,

  -- Detailed ratings
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
  professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),

  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_reviews_customer (customer_id),
  INDEX idx_reviews_rating (rating)
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  method VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,

  -- Payment gateway info
  gateway VARCHAR(50),
  gateway_transaction_id VARCHAR(255),
  gateway_response JSONB,

  -- Refund info
  refunded_amount DECIMAL(10, 2) DEFAULT 0,
  refund_reason TEXT,
  refunded_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMPTZ,

  INDEX idx_payments_booking (booking_id),
  INDEX idx_payments_status (status)
);

-- Audit logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_type VARCHAR(20),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_audit_user (user_id),
  INDEX idx_audit_entity (entity_type, entity_id),
  INDEX idx_audit_created (created_at)
);
```

### Data Migration Strategy

```sql
-- Migration versioning
CREATE TABLE schema_migrations (
  version VARCHAR(14) PRIMARY KEY,
  executed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Example migration
BEGIN;
  -- Add GDPR compliance fields
  ALTER TABLE customers
    ADD COLUMN gdpr_consent_date TIMESTAMPTZ,
    ADD COLUMN gdpr_consent_ip INET,
    ADD COLUMN data_retention_period INTEGER DEFAULT 1095; -- 3 years in days

  INSERT INTO schema_migrations (version) VALUES ('20240315120000');
COMMIT;
```

### Database Indexes Strategy

```sql
-- Performance-critical indexes
CREATE INDEX CONCURRENTLY idx_bookings_upcoming
  ON bookings(scheduled_date, scheduled_time)
  WHERE status IN ('pending', 'confirmed');

CREATE INDEX CONCURRENTLY idx_customers_active
  ON customers(created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY idx_bookings_customer_history
  ON bookings(customer_id, scheduled_date DESC)
  WHERE status = 'completed';

-- Full-text search
ALTER TABLE customers ADD COLUMN search_vector tsvector;
UPDATE customers SET search_vector =
  to_tsvector('simple', coalesce(first_name, '') || ' ' ||
              coalesce(last_name, '') || ' ' ||
              coalesce(email, '') || ' ' ||
              coalesce(phone, ''));
CREATE INDEX idx_customers_search ON customers USING GIN(search_vector);
```

## Integration Specifications

### Google Calendar Integration

#### Service Account Setup

```javascript
// lib/integrations/google-calendar.ts
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

class GoogleCalendarService {
  private auth: JWT;
  private calendar: any;

  constructor() {
    this.auth = new google.auth.JWT(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      null,
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
      ['https://www.googleapis.com/auth/calendar']
    );

    this.calendar = google.calendar({ version: 'v3', auth: this.auth });
  }

  async createBookingEvent(booking: Booking): Promise<string> {
    const event = {
      summary: `Čišćenje - ${booking.customer.lastName}`,
      location: this.formatAddress(booking.address),
      description: this.formatDescription(booking),
      start: {
        dateTime: booking.scheduledDateTime,
        timeZone: 'Europe/Zagreb'
      },
      end: {
        dateTime: this.calculateEndTime(booking),
        timeZone: 'Europe/Zagreb'
      },
      attendees: [
        { email: booking.customer.email },
        ...booking.assignedStaff.map(s => ({ email: s.email }))
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 60 }
        ]
      },
      colorId: this.getColorByServiceType(booking.serviceType)
    };

    const response = await this.calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      resource: event
    });

    return response.data.id;
  }

  async updateBookingEvent(eventId: string, booking: Booking): Promise<void> {
    await this.calendar.events.update({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId: eventId,
      resource: this.buildEventObject(booking)
    });
  }

  async deleteBookingEvent(eventId: string): Promise<void> {
    await this.calendar.events.delete({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId: eventId
    });
  }

  async checkAvailability(date: Date, duration: number): Promise<boolean> {
    const timeMin = date.toISOString();
    const timeMax = new Date(date.getTime() + duration * 60000).toISOString();

    const response = await this.calendar.freebusy.query({
      resource: {
        timeMin,
        timeMax,
        timeZone: 'Europe/Zagreb',
        items: [{ id: process.env.GOOGLE_CALENDAR_ID }]
      }
    });

    const busy = response.data.calendars[process.env.GOOGLE_CALENDAR_ID].busy;
    return busy.length === 0;
  }
}
```

### Email Service Integration

#### Email Provider Architecture

```typescript
// lib/integrations/email/provider.ts
interface EmailProvider {
  send(email: Email): Promise<EmailResult>;
  validateConfiguration(): Promise<boolean>;
}

// lib/integrations/email/sendgrid.ts
import sgMail from '@sendgrid/mail';

export class SendGridProvider implements EmailProvider {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async send(email: Email): Promise<EmailResult> {
    try {
      const msg = {
        to: email.to,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL,
          name: 'Uredno Čišćenje'
        },
        subject: email.subject,
        html: email.html,
        text: email.text,
        trackingSettings: {
          clickTracking: { enable: true },
          openTracking: { enable: true }
        }
      };

      const [response] = await sgMail.send(msg);

      return {
        success: true,
        messageId: response.headers['x-message-id'],
        provider: 'sendgrid'
      };
    } catch (error) {
      console.error('SendGrid error:', error);
      throw new EmailProviderError('SendGrid failed', error);
    }
  }

  async validateConfiguration(): Promise<boolean> {
    // Validate API key and sender
    return true;
  }
}

// lib/integrations/email/templates.tsx
import { render } from '@react-email/render';
import BookingConfirmation from '@/emails/BookingConfirmation';

export class EmailTemplateService {
  async renderBookingConfirmation(booking: Booking): Promise<string> {
    return render(
      <BookingConfirmation
        customerName={booking.customer.firstName}
        bookingReference={booking.reference}
        date={booking.scheduledDate}
        time={booking.scheduledTime}
        service={booking.service.name}
        address={booking.address}
        totalPrice={booking.totalPrice}
      />
    );
  }

  async renderBookingReminder(booking: Booking): Promise<string> {
    // Render reminder template
  }

  async renderBookingCancellation(booking: Booking): Promise<string> {
    // Render cancellation template
  }
}

// lib/integrations/email/queue.ts
import Bull from 'bull';
import { EmailService } from './service';

export class EmailQueue {
  private queue: Bull.Queue;
  private emailService: EmailService;

  constructor() {
    this.queue = new Bull('email-queue', {
      redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD
      }
    });

    this.emailService = new EmailService();
    this.processQueue();
  }

  async addToQueue(email: Email, priority: number = 0): Promise<void> {
    await this.queue.add('send-email', email, {
      priority,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    });
  }

  private processQueue(): void {
    this.queue.process('send-email', async (job) => {
      const email = job.data;
      return await this.emailService.send(email);
    });

    this.queue.on('failed', (job, err) => {
      console.error(`Email job ${job.id} failed:`, err);
      // Log to monitoring service
    });
  }
}
```

### SMS Integration

```typescript
// lib/integrations/sms.ts
import twilio from 'twilio';

export class SMSService {
  private client: twilio.Twilio;

  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  async sendBookingConfirmation(phone: string, booking: Booking): Promise<void> {
    const message = this.formatConfirmationMessage(booking);
    await this.send(phone, message);
  }

  async sendReminder(phone: string, booking: Booking): Promise<void> {
    const message = `Podsjetnik: Vaš termin čišćenja je sutra u ${booking.scheduledTime}. Tim Uredno`;
    await this.send(phone, message);
  }

  private async send(to: string, message: string): Promise<void> {
    try {
      await this.client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: this.formatPhoneNumber(to)
      });
    } catch (error) {
      console.error('SMS send error:', error);
      // Fallback to email notification
    }
  }

  private formatPhoneNumber(phone: string): string {
    // Ensure Croatian format
    if (!phone.startsWith('+')) {
      return '+385' + phone.replace(/^0/, '');
    }
    return phone;
  }

  private formatConfirmationMessage(booking: Booking): string {
    return `Potvrda rezervacije ${booking.reference}. ` +
           `Datum: ${booking.scheduledDate}, ` +
           `Vrijeme: ${booking.scheduledTime}. ` +
           `Cijena: €${booking.totalPrice}. ` +
           `Tim Uredno`;
  }
}
```

## Security Architecture

### Authentication & Authorization

#### JWT Implementation

```typescript
// lib/auth/jwt.ts
import jwt from 'jsonwebtoken';
import { User } from '@/types';

export class JWTService {
  private readonly secret: string;
  private readonly issuer: string;
  private readonly audience: string;

  constructor() {
    this.secret = process.env.JWT_SECRET;
    this.issuer = 'uredno.eu';
    this.audience = 'uredno-api';
  }

  generateToken(user: User, rememberMe: boolean = false): string {
    const expiresIn = rememberMe ? '30d' : '24h';

    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        iat: Math.floor(Date.now() / 1000)
      },
      this.secret,
      {
        expiresIn,
        issuer: this.issuer,
        audience: this.audience,
        algorithm: 'HS256'
      }
    );
  }

  verifyToken(token: string): any {
    return jwt.verify(token, this.secret, {
      issuer: this.issuer,
      audience: this.audience,
      algorithms: ['HS256']
    });
  }

  refreshToken(token: string): string {
    const decoded = this.verifyToken(token);
    const user = { id: decoded.sub, email: decoded.email, role: decoded.role };
    return this.generateToken(user);
  }
}

// middleware/auth.ts
import { NextRequest, NextResponse } from 'next/server';
import { JWTService } from '@/lib/auth/jwt';

export async function authMiddleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const jwtService = new JWTService();
    const decoded = jwtService.verifyToken(token);

    // Add user to request headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.sub);
    requestHeaders.set('x-user-role', decoded.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}
```

### Input Validation & Sanitization

```typescript
// lib/security/validation.ts
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

export class ValidationService {
  // Croatian-specific validators
  static croatianPhone = z.string().regex(
    /^(\+385|0)[0-9]{8,9}$/,
    'Neispravan broj telefona'
  );

  static croatianPostalCode = z.string().regex(
    /^[0-9]{5}$/,
    'Neispravan poštanski broj'
  );

  static croatianOIB = z.string().regex(
    /^[0-9]{11}$/,
    'Neispravan OIB'
  );

  // Sanitization
  static sanitizeHTML(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
  }

  static sanitizeForSQL(input: string): string {
    // Prisma handles this, but for raw queries:
    return input.replace(/['";\\]/g, '');
  }

  // XSS Prevention
  static escapeHTML(input: string): string {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };
    return input.replace(/[&<>"'/]/g, (char) => map[char]);
  }
}

// Example usage in API route
export async function POST(request: Request) {
  const body = await request.json();

  // Validate input
  const schema = z.object({
    email: z.string().email(),
    phone: ValidationService.croatianPhone,
    message: z.string().max(1000)
  });

  const validated = schema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      { error: validated.error.errors },
      { status: 400 }
    );
  }

  // Sanitize text inputs
  const sanitized = {
    ...validated.data,
    message: ValidationService.sanitizeHTML(validated.data.message)
  };

  // Process request...
}
```

### CSRF Protection

```typescript
// lib/security/csrf.ts
import crypto from 'crypto';
import { cookies } from 'next/headers';

export class CSRFProtection {
  static generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static async validateToken(request: Request): Promise<boolean> {
    const token = request.headers.get('x-csrf-token');
    const cookieToken = cookies().get('csrf-token')?.value;

    if (!token || !cookieToken) {
      return false;
    }

    return crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(cookieToken)
    );
  }

  static setTokenCookie(token: string): void {
    cookies().set('csrf-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24 hours
    });
  }
}

// middleware/csrf.ts
export async function csrfMiddleware(request: NextRequest) {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    const isValid = await CSRFProtection.validateToken(request);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}
```

### Rate Limiting

```typescript
// lib/security/rate-limit.ts
import { Redis } from 'ioredis';
import { NextRequest } from 'next/server';

export class RateLimiter {
  private redis: Redis;
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 60) {
    this.redis = new Redis(process.env.REDIS_URL);
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  async checkLimit(identifier: string): Promise<boolean> {
    const key = `rate_limit:${identifier}`;
    const current = await this.redis.incr(key);

    if (current === 1) {
      await this.redis.expire(key, Math.ceil(this.windowMs / 1000));
    }

    return current <= this.maxRequests;
  }

  async getRemainingRequests(identifier: string): Promise<number> {
    const key = `rate_limit:${identifier}`;
    const current = await this.redis.get(key);
    const used = current ? parseInt(current) : 0;
    return Math.max(0, this.maxRequests - used);
  }
}

// middleware/rate-limit.ts
export async function rateLimitMiddleware(request: NextRequest) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const rateLimiter = new RateLimiter();

  const allowed = await rateLimiter.checkLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': '60',
          'X-RateLimit-Remaining': '0'
        }
      }
    );
  }

  const remaining = await rateLimiter.getRemainingRequests(ip);

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', '60');
  response.headers.set('X-RateLimit-Remaining', remaining.toString());

  return response;
}
```

### Security Headers

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://www.google-analytics.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

## Performance Optimization

### Frontend Optimization

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['uredno.eu', 'res.cloudinary.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    minimumCacheTTL: 60,
  },

  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui'],
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  swcMinify: true,

  compress: true,

  poweredByHeader: false,

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test(module) {
              return module.size() > 160000 &&
                /node_modules[/\\]/.test(module.identifier());
            },
            name(module) {
              const hash = crypto.createHash('sha1');
              hash.update(module.identifier());
              return hash.digest('hex').substring(0, 8);
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 20,
          },
        },
      };
    }
    return config;
  },
};
```

### Database Query Optimization

```typescript
// lib/db/optimizations.ts
import { PrismaClient } from '@prisma/client';

export class OptimizedQueries {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
    });
  }

  // Use select to fetch only needed fields
  async getBookingList(customerId: string) {
    return this.prisma.booking.findMany({
      where: { customerId },
      select: {
        id: true,
        bookingReference: true,
        scheduledDate: true,
        scheduledTime: true,
        status: true,
        totalPrice: true,
        service: {
          select: {
            name: true,
            code: true
          }
        }
      },
      orderBy: {
        scheduledDate: 'desc'
      },
      take: 20
    });
  }

  // Use pagination for large datasets
  async getCustomersPaginated(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      this.prisma.customer.count()
    ]);

    return {
      data: customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Use database-level aggregation
  async getBookingStatistics(startDate: Date, endDate: Date) {
    return this.prisma.booking.groupBy({
      by: ['status'],
      where: {
        scheduledDate: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        _all: true
      },
      _sum: {
        totalPrice: true
      }
    });
  }

  // Use connection pooling
  async executeWithConnection<T>(
    callback: (prisma: PrismaClient) => Promise<T>
  ): Promise<T> {
    try {
      return await callback(this.prisma);
    } finally {
      // Connection automatically returned to pool
    }
  }
}
```

### Caching Strategy

```typescript
// lib/cache/redis-cache.ts
import { Redis } from 'ioredis';

export class CacheService {
  private redis: Redis;
  private defaultTTL: number;

  constructor(defaultTTL: number = 3600) {
    this.redis = new Redis(process.env.REDIS_URL);
    this.defaultTTL = defaultTTL;
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    await this.redis.set(key, serialized, 'EX', ttl || this.defaultTTL);
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  async remember<T>(
    key: string,
    callback: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const fresh = await callback();
    await this.set(key, fresh, ttl);
    return fresh;
  }
}

// Usage example
const cache = new CacheService();

export async function getPricingData(serviceType: string) {
  return cache.remember(
    `pricing:${serviceType}`,
    async () => {
      // Expensive calculation or database query
      return calculatePricing(serviceType);
    },
    3600 // Cache for 1 hour
  );
}
```

## Development Standards

### Code Style Guide

```typescript
// TypeScript Configuration (tsconfig.json)
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"]
    }
  }
}

// ESLint Configuration (.eslintrc.json)
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "react/prop-types": "off",
    "react-hooks/exhaustive-deps": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}

// Prettier Configuration (.prettierrc)
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### Git Workflow

```bash
# Branch naming convention
feature/booking-system
bugfix/calendar-sync-issue
hotfix/security-patch
refactor/database-optimization

# Commit message format
# Type: subject (max 50 chars)
#
# Body (optional, wrap at 72 chars)
#
# Footer (optional)

# Examples:
feat: add booking confirmation email
fix: resolve calendar sync timeout issue
refactor: optimize database queries for booking list
docs: update API documentation for v2 endpoints
```

### Testing Standards

```typescript
// Example test structure
describe('BookingService', () => {
  describe('createBooking', () => {
    it('should create a booking with valid data', async () => {
      // Arrange
      const bookingData = mockBookingData();

      // Act
      const result = await bookingService.createBooking(bookingData);

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe('confirmed');
      expect(result.bookingReference).toMatch(/^WU\d{4}-[A-Z0-9]{6}$/);
    });

    it('should throw error for invalid date', async () => {
      // Arrange
      const bookingData = {
        ...mockBookingData(),
        scheduledDate: '2020-01-01' // Past date
      };

      // Act & Assert
      await expect(bookingService.createBooking(bookingData))
        .rejects
        .toThrow('Invalid booking date');
    });
  });
});
```

---

*Technical Documentation Version 2.0 | Last Updated: 2024*