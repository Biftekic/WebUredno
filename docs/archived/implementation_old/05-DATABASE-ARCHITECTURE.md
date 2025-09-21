# Database Architecture Implementation Guide

## Overview
Complete database architecture and implementation strategy for WebUredno cleaning service platform, designed for scalability, performance, and data integrity.

## 1. Database Schema Design

## 1.1 Complete Prisma Schema Implementation (Phase 1 Complete)

**Location**: `prisma/schema.prisma`  
**Status**: ✅ Fully Designed and Documented  
**Database**: PostgreSQL with Prisma ORM

### Core Models Overview

```prisma
// Customer Model - GDPR Compliant
model Customer {
  id                String   @id @default(cuid())
  email             String   @unique
  firstName         String
  lastName          String
  phone             String   // Croatian +385 format
  language          String   @default("hr")
  gdprConsent       Boolean  @default(false)
  gdprConsentDate   DateTime?
  marketingConsent  Boolean  @default(false)
  
  // Relations
  addresses         Address[]
  bookings          Booking[]
  reviews           Review[]
  preferences       CustomerPreference?
}

// Booking Model - Core Business Entity
model Booking {
  id                String   @id @default(cuid())
  bookingNumber     String   @unique // WU240115-0001 format
  customerId        String
  addressId         String
  serviceType       ServiceType
  propertySize      Float    // in m²
  scheduledDate     DateTime
  scheduledTime     String   // "10:00" format
  duration          Float    // hours
  frequency         Frequency
  status            BookingStatus @default(PENDING)
  
  // Pricing fields
  basePrice         Float
  discount          Float    @default(0)
  additionalCost    Float    @default(0)
  finalPrice        Float
  
  // Team assignment
  teamSize          Int
  assignedTeamId    String?
  
  // Relations
  customer          Customer @relation(fields: [customerId], references: [id])
  address           Address  @relation(fields: [addressId], references: [id])
  assignedTeam      Team?    @relation(fields: [assignedTeamId], references: [id])
  additionalServices BookingService[]
  checklist         QualityChecklist?
  review            Review?
  photos            BookingPhoto[]
}

// Team & Cleaner Models
model Team {
  id          String   @id @default(cuid())
  name        String
  leaderId    String
  isActive    Boolean  @default(true)
  
  leader      Cleaner  @relation("TeamLeader", fields: [leaderId], references: [id])
  members     Cleaner[] @relation("TeamMembers")
  bookings    Booking[]
}

model Cleaner {
  id              String   @id @default(cuid())
  email           String   @unique
  firstName       String
  lastName        String
  phone           String
  employeeId      String   @unique
  rating          Float    @default(0)
  totalJobs       Int      @default(0)
  languages       String[] @default(["hr"])
  
  ledTeams        Team[]   @relation("TeamLeader")
  memberOfTeams   Team[]   @relation("TeamMembers")
  availability    CleanerAvailability[]
}
```

### Enum Definitions

```prisma
enum ServiceType {
  STANDARD           // Standardno čišćenje
  STANDARD_PLUS      // Standard Plus
  DEEP_CLEAN         // Dubinsko čišćenje
  MOVING             // Čišćenje za selidbu
  POST_CONSTRUCTION  // Čišćenje poslije radova
}

enum Frequency {
  ONE_TIME    // Jednokratno
  WEEKLY      // Tjedno (15% popust)
  BI_WEEKLY   // Dvotjedno (10% popust)
  MONTHLY     // Mjesečno (5% popust)
}

enum BookingStatus {
  PENDING      // Čeka potvrdu
  CONFIRMED    // Potvrđeno
  IN_PROGRESS  // U tijeku
  COMPLETED    // Završeno
  CANCELLED    // Otkazano
  RESCHEDULED  // Ponovno zakazano
}

enum AdditionalService {
  WINDOW_CLEANING        // Pranje prozora
  IRONING                // Peglanje
  REFRIGERATOR_CLEANING  // Čišćenje hladnjaka
  OVEN_CLEANING          // Čišćenje pećnice
  CABINET_CLEANING       // Čišćenje ormarića
  BALCONY_CLEANING       // Čišćenje balkona
}
```

### Database Indexes for Performance

```prisma
// Customer indexes
@@index([email])      // Fast email lookups
@@index([phone])      // Phone number search

// Booking indexes  
@@index([bookingNumber])           // Quick booking retrieval
@@index([customerId])              // Customer history
@@index([scheduledDate, status])  // Daily schedule queries
@@index([assignedTeamId])         // Team assignments

// Availability indexes
@@index([date, isAvailable])      // Availability checks
```

### GDPR Compliance Features

```prisma
// Customer consent tracking
gdprConsent       Boolean  @default(false)
gdprConsentDate   DateTime?
marketingConsent  Boolean  @default(false)

// Data retention support
createdAt         DateTime @default(now())
updatedAt         DateTime @updatedAt

// Cascade deletion for data erasure
customer Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
```

## 1.2 Database Connection and Helper Functions

**Location**: `src/lib/db.ts`  
**Status**: ✅ Fully Implemented

### Prisma Client Singleton Pattern
```typescript
// Singleton pattern for development hot-reload
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error']
  });
};

const prisma = globalThis.prisma ?? prismaClientSingleton();
```

### Core Helper Functions

```typescript
// Check time slot availability
async function isTimeSlotAvailable(
  date: Date,
  time: string,
  duration: number,
  teamSize: number = 1
): Promise<boolean>

// Get or create customer
async function getOrCreateCustomer(data: {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}): Promise<Customer>

// Create booking with validation
async function createBooking(data: BookingInput): Promise<Booking>

// Get daily schedule
async function getBookingsForDate(date: Date): Promise<Booking[]>

// Update booking status
async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus
): Promise<Booking>

// Customer booking history
async function getCustomerBookings(
  customerId: string
): Promise<Booking[]>

// Create and verify review
async function createReview(data: {
  bookingId: string;
  customerId: string;
  rating: number;
  comment?: string;
}): Promise<Review>
```

### Booking Number Generation
```typescript
function generateBookingNumber(): string {
  // Format: WU[YY][MM][DD]-[XXXX]
  // Example: WU240115-0001
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `WU${year}${month}${day}-${random}`;
}
```

### 1.1 Core Tables

#### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    password_hash VARCHAR(255),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'customer',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    language VARCHAR(5) DEFAULT 'hr',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,

    CONSTRAINT chk_role CHECK (role IN ('customer', 'cleaner', 'admin', 'super_admin')),
    CONSTRAINT chk_status CHECK (status IN ('active', 'inactive', 'suspended', 'pending'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
```

#### addresses
```sql
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL DEFAULT 'service',
    label VARCHAR(100),
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(2) DEFAULT 'HR',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_primary BOOLEAN DEFAULT FALSE,
    access_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_type CHECK (type IN ('service', 'billing', 'business'))
);

CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_addresses_type ON addresses(type);
CREATE INDEX idx_addresses_city ON addresses(city);
CREATE INDEX idx_addresses_is_primary ON addresses(is_primary);
```

#### services
```sql
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name_hr VARCHAR(200) NOT NULL,
    name_en VARCHAR(200) NOT NULL,
    description_hr TEXT,
    description_en TEXT,
    category VARCHAR(50) NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    min_duration_minutes INT NOT NULL,
    max_duration_minutes INT,
    is_active BOOLEAN DEFAULT TRUE,
    requires_consultation BOOLEAN DEFAULT FALSE,
    max_area_sqm INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_category CHECK (category IN ('regular', 'deep', 'moving', 'special', 'addon')),
    CONSTRAINT chk_price CHECK (base_price >= 0),
    CONSTRAINT chk_duration CHECK (min_duration_minutes > 0)
);

CREATE INDEX idx_services_code ON services(code);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_is_active ON services(is_active);
```

#### bookings
```sql
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_number VARCHAR(20) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES users(id),
    address_id UUID NOT NULL REFERENCES addresses(id),
    service_id UUID NOT NULL REFERENCES services(id),
    cleaner_id UUID REFERENCES users(id),
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    duration_minutes INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    frequency VARCHAR(20) NOT NULL DEFAULT 'one_time',
    total_price DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    final_price DECIMAL(10, 2) NOT NULL,
    cancellation_reason TEXT,
    cancellation_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    customer_notes TEXT,
    cleaner_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_status CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled')),
    CONSTRAINT chk_frequency CHECK (frequency IN ('one_time', 'weekly', 'biweekly', 'monthly')),
    CONSTRAINT chk_price CHECK (total_price >= 0 AND final_price >= 0),
    CONSTRAINT chk_cleaner_role CHECK (cleaner_id IS NULL OR EXISTS (
        SELECT 1 FROM users WHERE id = cleaner_id AND role IN ('cleaner', 'admin')
    ))
);

CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_cleaner_id ON bookings(cleaner_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_scheduled_date ON bookings(scheduled_date);
CREATE INDEX idx_bookings_booking_number ON bookings(booking_number);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);
```

#### booking_addons
```sql
CREATE TABLE booking_addons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id),
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_quantity CHECK (quantity > 0),
    CONSTRAINT chk_price CHECK (unit_price >= 0 AND total_price >= 0)
);

CREATE INDEX idx_booking_addons_booking_id ON booking_addons(booking_id);
```

#### payments
```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    transaction_id VARCHAR(100) UNIQUE,
    payment_method VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    gateway VARCHAR(50),
    gateway_response JSONB,
    paid_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    refund_amount DECIMAL(10, 2),
    refund_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_method CHECK (payment_method IN ('card', 'cash', 'bank_transfer', 'paypal')),
    CONSTRAINT chk_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'partial_refund')),
    CONSTRAINT chk_amount CHECK (amount > 0)
);

CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_payments_paid_at ON payments(paid_at);
```

#### reviews
```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    user_id UUID NOT NULL REFERENCES users(id),
    cleaner_id UUID REFERENCES users(id),
    rating INT NOT NULL,
    service_quality INT,
    punctuality INT,
    professionalism INT,
    comment TEXT,
    is_visible BOOLEAN DEFAULT TRUE,
    admin_response TEXT,
    admin_response_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_rating CHECK (rating >= 1 AND rating <= 5),
    CONSTRAINT chk_service_quality CHECK (service_quality IS NULL OR (service_quality >= 1 AND service_quality <= 5)),
    CONSTRAINT chk_punctuality CHECK (punctuality IS NULL OR (punctuality >= 1 AND punctuality <= 5)),
    CONSTRAINT chk_professionalism CHECK (professionalism IS NULL OR (professionalism >= 1 AND professionalism <= 5)),
    CONSTRAINT uk_booking_review UNIQUE(booking_id)
);

CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_cleaner_id ON reviews(cleaner_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_is_visible ON reviews(is_visible);
CREATE INDEX idx_reviews_created_at ON reviews(created_at);
```

#### cleaner_profiles
```sql
CREATE TABLE cleaner_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    experience_years INT,
    specializations TEXT[],
    languages TEXT[],
    availability JSONB,
    service_areas TEXT[],
    equipment_owned BOOLEAN DEFAULT FALSE,
    background_check_date DATE,
    background_check_status VARCHAR(20),
    insurance_number VARCHAR(100),
    insurance_expiry DATE,
    rating_average DECIMAL(3, 2),
    total_reviews INT DEFAULT 0,
    total_bookings INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_experience CHECK (experience_years >= 0),
    CONSTRAINT chk_rating CHECK (rating_average IS NULL OR (rating_average >= 0 AND rating_average <= 5)),
    CONSTRAINT uk_user_profile UNIQUE(user_id)
);

CREATE INDEX idx_cleaner_profiles_user_id ON cleaner_profiles(user_id);
CREATE INDEX idx_cleaner_profiles_rating ON cleaner_profiles(rating_average);
CREATE INDEX idx_cleaner_profiles_areas ON cleaner_profiles USING GIN(service_areas);
```

#### availability_schedules
```sql
CREATE TABLE availability_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cleaner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_day CHECK (day_of_week >= 0 AND day_of_week <= 6),
    CONSTRAINT chk_time CHECK (end_time > start_time),
    CONSTRAINT uk_cleaner_day UNIQUE(cleaner_id, day_of_week)
);

CREATE INDEX idx_availability_cleaner_id ON availability_schedules(cleaner_id);
CREATE INDEX idx_availability_day ON availability_schedules(day_of_week);
```

#### promotions
```sql
CREATE TABLE promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    min_order_value DECIMAL(10, 2),
    max_discount DECIMAL(10, 2),
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    usage_limit INT,
    usage_count INT DEFAULT 0,
    per_user_limit INT DEFAULT 1,
    applicable_services TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_discount_type CHECK (discount_type IN ('percentage', 'fixed')),
    CONSTRAINT chk_discount_value CHECK (discount_value > 0),
    CONSTRAINT chk_dates CHECK (valid_until > valid_from)
);

CREATE INDEX idx_promotions_code ON promotions(code);
CREATE INDEX idx_promotions_active ON promotions(is_active);
CREATE INDEX idx_promotions_dates ON promotions(valid_from, valid_until);
```

#### user_promotions
```sql
CREATE TABLE user_promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    promotion_id UUID NOT NULL REFERENCES promotions(id),
    booking_id UUID REFERENCES bookings(id),
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_user_promotion_booking UNIQUE(user_id, promotion_id, booking_id)
);

CREATE INDEX idx_user_promotions_user_id ON user_promotions(user_id);
CREATE INDEX idx_user_promotions_promotion_id ON user_promotions(promotion_id);
CREATE INDEX idx_user_promotions_booking_id ON user_promotions(booking_id);
```

#### notifications
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_channel CHECK (channel IN ('email', 'sms', 'push', 'in_app')),
    CONSTRAINT chk_status CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed'))
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

#### audit_logs
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_action CHECK (action IN ('create', 'update', 'delete', 'login', 'logout', 'view', 'export'))
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

### 1.2 Supporting Tables

#### password_reset_tokens
```sql
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
```

#### email_verifications
```sql
CREATE TABLE email_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_verifications_token ON email_verifications(token);
CREATE INDEX idx_email_verifications_user_id ON email_verifications(user_id);
```

#### sessions
```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

### 1.3 Views

#### v_booking_summary
```sql
CREATE VIEW v_booking_summary AS
SELECT
    b.id,
    b.booking_number,
    b.scheduled_date,
    b.scheduled_time,
    b.status,
    b.final_price,
    u.first_name || ' ' || u.last_name AS customer_name,
    u.email AS customer_email,
    c.first_name || ' ' || c.last_name AS cleaner_name,
    s.name_hr AS service_name,
    a.street || ', ' || a.city AS address,
    r.rating,
    p.status AS payment_status
FROM bookings b
JOIN users u ON b.user_id = u.id
LEFT JOIN users c ON b.cleaner_id = c.id
JOIN services s ON b.service_id = s.id
JOIN addresses a ON b.address_id = a.id
LEFT JOIN reviews r ON b.id = r.booking_id
LEFT JOIN payments p ON b.id = p.booking_id;
```

#### v_cleaner_performance
```sql
CREATE VIEW v_cleaner_performance AS
SELECT
    cp.user_id,
    u.first_name || ' ' || u.last_name AS cleaner_name,
    cp.rating_average,
    cp.total_reviews,
    cp.total_bookings,
    COUNT(CASE WHEN b.status = 'completed' THEN 1 END) AS completed_bookings,
    COUNT(CASE WHEN b.status = 'cancelled' THEN 1 END) AS cancelled_bookings,
    AVG(r.rating) AS actual_rating,
    AVG(r.service_quality) AS avg_service_quality,
    AVG(r.punctuality) AS avg_punctuality,
    AVG(r.professionalism) AS avg_professionalism
FROM cleaner_profiles cp
JOIN users u ON cp.user_id = u.id
LEFT JOIN bookings b ON b.cleaner_id = u.id
LEFT JOIN reviews r ON r.cleaner_id = u.id
GROUP BY cp.user_id, u.first_name, u.last_name, cp.rating_average, cp.total_reviews, cp.total_bookings;
```

## 2. Data Migration Strategy

### 2.1 Initial Setup Scripts

#### create_database.sql
```sql
-- Create database
CREATE DATABASE weburedno
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schema
CREATE SCHEMA IF NOT EXISTS app;
GRANT ALL ON SCHEMA app TO postgres;
```

#### create_functions.sql
```sql
-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Generate booking number function
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS VARCHAR AS $$
DECLARE
    booking_number VARCHAR;
    exists_flag BOOLEAN;
BEGIN
    LOOP
        booking_number := 'WU' || TO_CHAR(CURRENT_DATE, 'YYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

        SELECT EXISTS(SELECT 1 FROM bookings WHERE booking_number = booking_number) INTO exists_flag;

        EXIT WHEN NOT exists_flag;
    END LOOP;

    RETURN booking_number;
END;
$$ LANGUAGE plpgsql;

-- Calculate booking price function
CREATE OR REPLACE FUNCTION calculate_booking_price(
    p_service_id UUID,
    p_duration_minutes INT,
    p_addon_ids UUID[]
)
RETURNS TABLE(base_price DECIMAL, addon_price DECIMAL, total_price DECIMAL) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.base_price * (p_duration_minutes::DECIMAL / 60),
        COALESCE(SUM(sa.base_price), 0),
        s.base_price * (p_duration_minutes::DECIMAL / 60) + COALESCE(SUM(sa.base_price), 0)
    FROM services s
    LEFT JOIN services sa ON sa.id = ANY(p_addon_ids)
    WHERE s.id = p_service_id
    GROUP BY s.base_price;
END;
$$ LANGUAGE plpgsql;
```

#### create_triggers.sql
```sql
-- Add update triggers to all tables
DO $$
DECLARE
    t record;
BEGIN
    FOR t IN
        SELECT table_name
        FROM information_schema.columns
        WHERE column_name = 'updated_at'
        AND table_schema = 'public'
    LOOP
        EXECUTE format('
            CREATE TRIGGER update_%s_updated_at
            BEFORE UPDATE ON %s
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();',
            t.table_name, t.table_name);
    END LOOP;
END $$;

-- Booking number trigger
CREATE TRIGGER set_booking_number
    BEFORE INSERT ON bookings
    FOR EACH ROW
    WHEN (NEW.booking_number IS NULL)
    EXECUTE FUNCTION generate_booking_number();

-- Update cleaner stats trigger
CREATE OR REPLACE FUNCTION update_cleaner_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE cleaner_profiles
        SET
            rating_average = (
                SELECT AVG(rating)
                FROM reviews
                WHERE cleaner_id = NEW.cleaner_id
            ),
            total_reviews = (
                SELECT COUNT(*)
                FROM reviews
                WHERE cleaner_id = NEW.cleaner_id
            )
        WHERE user_id = NEW.cleaner_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cleaner_stats_trigger
    AFTER INSERT OR UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_cleaner_stats();
```

### 2.2 Seed Data

#### seed_services.sql
```sql
-- Regular cleaning services
INSERT INTO services (code, name_hr, name_en, description_hr, description_en, category, base_price, min_duration_minutes, max_duration_minutes) VALUES
('REGULAR_SMALL', 'Redovito čišćenje - mali stan', 'Regular cleaning - small apartment', 'Redovito čišćenje za stanove do 50m²', 'Regular cleaning for apartments up to 50m²', 'regular', 30.00, 60, 90),
('REGULAR_MEDIUM', 'Redovito čišćenje - srednji stan', 'Regular cleaning - medium apartment', 'Redovito čišćenje za stanove 50-80m²', 'Regular cleaning for apartments 50-80m²', 'regular', 45.00, 90, 120),
('REGULAR_LARGE', 'Redovito čišćenje - veliki stan', 'Regular cleaning - large apartment', 'Redovito čišćenje za stanove preko 80m²', 'Regular cleaning for apartments over 80m²', 'regular', 60.00, 120, 180),
('DEEP_CLEAN', 'Dubinsko čišćenje', 'Deep cleaning', 'Temeljito čišćenje svih prostorija', 'Thorough cleaning of all rooms', 'deep', 80.00, 180, 300),
('MOVING_IN', 'Čišćenje za useljenje', 'Move-in cleaning', 'Priprema prostora za useljenje', 'Preparing space for moving in', 'moving', 100.00, 240, 360),
('MOVING_OUT', 'Čišćenje za iseljenje', 'Move-out cleaning', 'Čišćenje nakon iseljenja', 'Cleaning after moving out', 'moving', 100.00, 240, 360);

-- Addon services
INSERT INTO services (code, name_hr, name_en, description_hr, description_en, category, base_price, min_duration_minutes) VALUES
('ADDON_WINDOWS', 'Pranje prozora', 'Window cleaning', 'Pranje prozora iznutra i izvana', 'Window cleaning inside and outside', 'addon', 15.00, 30),
('ADDON_FRIDGE', 'Čišćenje hladnjaka', 'Refrigerator cleaning', 'Dubinsko čišćenje hladnjaka', 'Deep cleaning of refrigerator', 'addon', 20.00, 30),
('ADDON_OVEN', 'Čišćenje pećnice', 'Oven cleaning', 'Dubinsko čišćenje pećnice', 'Deep cleaning of oven', 'addon', 25.00, 45),
('ADDON_LAUNDRY', 'Pranje rublja', 'Laundry', 'Pranje i slaganje rublja', 'Washing and folding laundry', 'addon', 20.00, 60),
('ADDON_IRONING', 'Glačanje', 'Ironing', 'Glačanje odjeće', 'Ironing clothes', 'addon', 15.00, 60);
```

#### seed_test_users.sql
```sql
-- Test admin user
INSERT INTO users (email, phone, password_hash, first_name, last_name, role, status, email_verified, phone_verified)
VALUES
('admin@weburedno.hr', '+385911234567', '$2b$10$YourHashedPasswordHere', 'Admin', 'User', 'admin', 'active', true, true);

-- Test cleaners
INSERT INTO users (email, phone, password_hash, first_name, last_name, role, status, email_verified, phone_verified)
VALUES
('ana.cleaner@weburedno.hr', '+385911234568', '$2b$10$YourHashedPasswordHere', 'Ana', 'Horvat', 'cleaner', 'active', true, true),
('marko.cleaner@weburedno.hr', '+385911234569', '$2b$10$YourHashedPasswordHere', 'Marko', 'Kovačić', 'cleaner', 'active', true, true);

-- Test customers
INSERT INTO users (email, phone, password_hash, first_name, last_name, role, status, email_verified)
VALUES
('ivan.test@example.com', '+385911234570', '$2b$10$YourHashedPasswordHere', 'Ivan', 'Novak', 'customer', 'active', true),
('petra.test@example.com', '+385911234571', '$2b$10$YourHashedPasswordHere', 'Petra', 'Babić', 'customer', 'active', true);

-- Add cleaner profiles
INSERT INTO cleaner_profiles (user_id, bio, experience_years, specializations, languages, equipment_owned, rating_average, total_reviews, total_bookings)
SELECT
    id,
    'Iskusna čistačica s 5 godina iskustva',
    5,
    ARRAY['deep_cleaning', 'regular_cleaning'],
    ARRAY['hr', 'en'],
    true,
    4.8,
    25,
    150
FROM users WHERE email = 'ana.cleaner@weburedno.hr';
```

### 2.3 Migration Versioning

#### migrations/001_initial_schema.sql
```sql
-- Migration: 001_initial_schema
-- Created: 2024-01-01
-- Description: Initial database schema

BEGIN;

-- Create all tables
-- [Include all CREATE TABLE statements from section 1.1]

-- Create indexes
-- [Include all CREATE INDEX statements]

-- Create views
-- [Include all CREATE VIEW statements]

-- Insert migration record
INSERT INTO schema_migrations (version, name, executed_at)
VALUES ('001', 'initial_schema', CURRENT_TIMESTAMP);

COMMIT;
```

#### migrations/002_add_functions_triggers.sql
```sql
-- Migration: 002_add_functions_triggers
-- Created: 2024-01-02
-- Description: Add functions and triggers

BEGIN;

-- Create functions
-- [Include all function definitions]

-- Create triggers
-- [Include all trigger definitions]

-- Insert migration record
INSERT INTO schema_migrations (version, name, executed_at)
VALUES ('002', 'add_functions_triggers', CURRENT_TIMESTAMP);

COMMIT;
```

### 2.4 Rollback Procedures

#### rollback_template.sql
```sql
-- Rollback template
CREATE OR REPLACE FUNCTION rollback_migration(p_version VARCHAR)
RETURNS VOID AS $$
DECLARE
    v_rollback_script TEXT;
BEGIN
    -- Get rollback script for version
    SELECT rollback_script INTO v_rollback_script
    FROM schema_migrations
    WHERE version = p_version;

    IF v_rollback_script IS NOT NULL THEN
        EXECUTE v_rollback_script;

        -- Mark migration as rolled back
        UPDATE schema_migrations
        SET rolled_back_at = CURRENT_TIMESTAMP
        WHERE version = p_version;

        RAISE NOTICE 'Migration % rolled back successfully', p_version;
    ELSE
        RAISE EXCEPTION 'No rollback script found for version %', p_version;
    END IF;
END;
$$ LANGUAGE plpgsql;
```

## 3. Query Patterns

### 3.1 Common Query Optimizations

#### Booking Search with Filters
```sql
-- Optimized booking search with multiple filters
CREATE OR REPLACE FUNCTION search_bookings(
    p_user_id UUID DEFAULT NULL,
    p_status VARCHAR[] DEFAULT NULL,
    p_date_from DATE DEFAULT NULL,
    p_date_to DATE DEFAULT NULL,
    p_limit INT DEFAULT 20,
    p_offset INT DEFAULT 0
)
RETURNS TABLE(
    id UUID,
    booking_number VARCHAR,
    scheduled_date DATE,
    scheduled_time TIME,
    status VARCHAR,
    service_name VARCHAR,
    cleaner_name VARCHAR,
    total_price DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        b.id,
        b.booking_number,
        b.scheduled_date,
        b.scheduled_time,
        b.status,
        s.name_hr,
        u.first_name || ' ' || u.last_name,
        b.final_price
    FROM bookings b
    JOIN services s ON s.id = b.service_id
    LEFT JOIN users u ON u.id = b.cleaner_id
    WHERE
        (p_user_id IS NULL OR b.user_id = p_user_id)
        AND (p_status IS NULL OR b.status = ANY(p_status))
        AND (p_date_from IS NULL OR b.scheduled_date >= p_date_from)
        AND (p_date_to IS NULL OR b.scheduled_date <= p_date_to)
    ORDER BY b.scheduled_date DESC, b.scheduled_time DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;
```

#### Available Cleaners Query
```sql
-- Find available cleaners for specific date/time
CREATE OR REPLACE FUNCTION find_available_cleaners(
    p_date DATE,
    p_time TIME,
    p_duration_minutes INT,
    p_city VARCHAR DEFAULT NULL
)
RETURNS TABLE(
    cleaner_id UUID,
    cleaner_name VARCHAR,
    rating DECIMAL,
    total_bookings INT,
    distance_km DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH busy_cleaners AS (
        SELECT DISTINCT cleaner_id
        FROM bookings
        WHERE
            scheduled_date = p_date
            AND status NOT IN ('cancelled', 'completed')
            AND (
                (scheduled_time <= p_time AND scheduled_time + (duration_minutes || ' minutes')::INTERVAL > p_time)
                OR (scheduled_time < p_time + (p_duration_minutes || ' minutes')::INTERVAL AND scheduled_time > p_time)
            )
    ),
    available_schedule AS (
        SELECT cleaner_id
        FROM availability_schedules
        WHERE
            day_of_week = EXTRACT(DOW FROM p_date)
            AND start_time <= p_time
            AND end_time >= p_time + (p_duration_minutes || ' minutes')::INTERVAL
            AND is_available = true
    )
    SELECT
        u.id,
        u.first_name || ' ' || u.last_name,
        cp.rating_average,
        cp.total_bookings,
        0::DECIMAL AS distance_km -- Placeholder for distance calculation
    FROM users u
    JOIN cleaner_profiles cp ON cp.user_id = u.id
    JOIN available_schedule av ON av.cleaner_id = u.id
    WHERE
        u.role = 'cleaner'
        AND u.status = 'active'
        AND u.id NOT IN (SELECT cleaner_id FROM busy_cleaners WHERE cleaner_id IS NOT NULL)
        AND (p_city IS NULL OR p_city = ANY(cp.service_areas))
    ORDER BY cp.rating_average DESC NULLS LAST, cp.total_bookings DESC;
END;
$$ LANGUAGE plpgsql;
```

### 3.2 Transaction Handling

#### Booking Creation Transaction
```typescript
// TypeScript example with transaction
async function createBooking(bookingData: BookingInput): Promise<Booking> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Create booking
    const bookingResult = await client.query(
      `INSERT INTO bookings (
        user_id, address_id, service_id, scheduled_date,
        scheduled_time, duration_minutes, status, frequency,
        total_price, discount_amount, final_price, customer_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        bookingData.userId,
        bookingData.addressId,
        bookingData.serviceId,
        bookingData.scheduledDate,
        bookingData.scheduledTime,
        bookingData.durationMinutes,
        'pending',
        bookingData.frequency,
        bookingData.totalPrice,
        bookingData.discountAmount,
        bookingData.finalPrice,
        bookingData.customerNotes
      ]
    );

    const booking = bookingResult.rows[0];

    // 2. Add booking addons
    if (bookingData.addons && bookingData.addons.length > 0) {
      for (const addon of bookingData.addons) {
        await client.query(
          `INSERT INTO booking_addons (
            booking_id, service_id, quantity, unit_price, total_price
          ) VALUES ($1, $2, $3, $4, $5)`,
          [
            booking.id,
            addon.serviceId,
            addon.quantity,
            addon.unitPrice,
            addon.totalPrice
          ]
        );
      }
    }

    // 3. Apply promotion if provided
    if (bookingData.promotionCode) {
      await client.query(
        `INSERT INTO user_promotions (
          user_id, promotion_id, booking_id, used_at
        ) VALUES ($1, (SELECT id FROM promotions WHERE code = $2), $3, CURRENT_TIMESTAMP)`,
        [bookingData.userId, bookingData.promotionCode, booking.id]
      );

      // Update promotion usage count
      await client.query(
        `UPDATE promotions
         SET usage_count = usage_count + 1
         WHERE code = $1`,
        [bookingData.promotionCode]
      );
    }

    // 4. Create initial payment record
    await client.query(
      `INSERT INTO payments (
        booking_id, payment_method, amount, currency, status
      ) VALUES ($1, $2, $3, $4, $5)`,
      [
        booking.id,
        bookingData.paymentMethod,
        booking.final_price,
        'EUR',
        'pending'
      ]
    );

    // 5. Create notification
    await client.query(
      `INSERT INTO notifications (
        user_id, type, channel, title, message, data
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        bookingData.userId,
        'booking_created',
        'email',
        'Booking Confirmation',
        `Your booking ${booking.booking_number} has been created`,
        JSON.stringify({ bookingId: booking.id })
      ]
    );

    await client.query('COMMIT');
    return booking;

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

### 3.3 Batch Operations

#### Batch Status Update
```sql
-- Batch update booking statuses
CREATE OR REPLACE FUNCTION batch_update_booking_status(
    p_booking_ids UUID[],
    p_new_status VARCHAR,
    p_reason TEXT DEFAULT NULL
)
RETURNS INT AS $$
DECLARE
    v_updated_count INT;
BEGIN
    WITH updated AS (
        UPDATE bookings
        SET
            status = p_new_status,
            updated_at = CURRENT_TIMESTAMP,
            cancellation_reason = CASE
                WHEN p_new_status = 'cancelled' THEN p_reason
                ELSE cancellation_reason
            END,
            cancellation_date = CASE
                WHEN p_new_status = 'cancelled' THEN CURRENT_TIMESTAMP
                ELSE cancellation_date
            END
        WHERE
            id = ANY(p_booking_ids)
            AND status != p_new_status
        RETURNING id
    )
    SELECT COUNT(*) INTO v_updated_count FROM updated;

    -- Log batch operation
    INSERT INTO audit_logs (action, entity_type, new_values)
    VALUES (
        'batch_update',
        'booking',
        jsonb_build_object(
            'booking_ids', p_booking_ids,
            'new_status', p_new_status,
            'updated_count', v_updated_count
        )
    );

    RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql;
```

#### Batch Notification Send
```sql
-- Batch send notifications
CREATE OR REPLACE FUNCTION batch_send_notifications(
    p_user_ids UUID[],
    p_type VARCHAR,
    p_channel VARCHAR,
    p_title VARCHAR,
    p_message TEXT
)
RETURNS INT AS $$
DECLARE
    v_inserted_count INT;
BEGIN
    WITH inserted AS (
        INSERT INTO notifications (
            user_id, type, channel, title, message, status
        )
        SELECT
            unnest(p_user_ids),
            p_type,
            p_channel,
            p_title,
            p_message,
            'pending'
        RETURNING id
    )
    SELECT COUNT(*) INTO v_inserted_count FROM inserted;

    RETURN v_inserted_count;
END;
$$ LANGUAGE plpgsql;
```

### 3.4 Performance Considerations

#### Query Performance Analysis
```sql
-- Analyze slow queries
CREATE OR REPLACE VIEW v_slow_queries AS
SELECT
    query,
    calls,
    total_time,
    mean_time,
    min_time,
    max_time
FROM pg_stat_statements
WHERE mean_time > 100 -- queries taking more than 100ms
ORDER BY mean_time DESC
LIMIT 50;

-- Table statistics
CREATE OR REPLACE VIEW v_table_stats AS
SELECT
    schemaname,
    tablename,
    n_live_tup AS live_rows,
    n_dead_tup AS dead_rows,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

-- Index usage statistics
CREATE OR REPLACE VIEW v_index_usage AS
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan AS index_scans,
    idx_tup_read AS tuples_read,
    idx_tup_fetch AS tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

## 4. Data Management

### 4.1 Backup and Recovery Procedures

#### backup.sh
```bash
#!/bin/bash
# Automated backup script

# Configuration
DB_NAME="weburedno"
DB_USER="postgres"
BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${DATE}.sql.gz"
RETENTION_DAYS=30

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Perform backup
echo "Starting backup of $DB_NAME..."
pg_dump -U $DB_USER -d $DB_NAME | gzip > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "Backup completed successfully: $BACKUP_FILE"

    # Upload to cloud storage (optional)
    # aws s3 cp $BACKUP_FILE s3://your-bucket/backups/

    # Remove old backups
    find $BACKUP_DIR -name "${DB_NAME}_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    echo "Old backups removed (older than $RETENTION_DAYS days)"
else
    echo "Backup failed!"
    exit 1
fi
```

#### restore.sh
```bash
#!/bin/bash
# Database restore script

# Configuration
DB_NAME="weburedno"
DB_USER="postgres"
BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: ./restore.sh <backup_file>"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "WARNING: This will drop and recreate the database $DB_NAME"
echo "Are you sure? (yes/no)"
read CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled"
    exit 0
fi

# Drop existing database
echo "Dropping existing database..."
dropdb -U $DB_USER $DB_NAME

# Create new database
echo "Creating new database..."
createdb -U $DB_USER $DB_NAME

# Restore from backup
echo "Restoring from backup..."
gunzip -c $BACKUP_FILE | psql -U $DB_USER -d $DB_NAME

if [ $? -eq 0 ]; then
    echo "Restore completed successfully"
else
    echo "Restore failed!"
    exit 1
fi
```

### 4.2 Data Retention Policies

#### retention_policy.sql
```sql
-- Data retention policy implementation
CREATE OR REPLACE FUNCTION apply_retention_policies()
RETURNS VOID AS $$
BEGIN
    -- Delete old audit logs (keep 1 year)
    DELETE FROM audit_logs
    WHERE created_at < CURRENT_DATE - INTERVAL '1 year';

    -- Delete old notifications (keep 6 months)
    DELETE FROM notifications
    WHERE created_at < CURRENT_DATE - INTERVAL '6 months'
    AND status IN ('sent', 'delivered', 'read');

    -- Archive completed bookings older than 2 years
    INSERT INTO bookings_archive
    SELECT * FROM bookings
    WHERE status = 'completed'
    AND completed_at < CURRENT_DATE - INTERVAL '2 years';

    DELETE FROM bookings
    WHERE status = 'completed'
    AND completed_at < CURRENT_DATE - INTERVAL '2 years';

    -- Delete expired sessions
    DELETE FROM sessions
    WHERE expires_at < CURRENT_TIMESTAMP;

    -- Delete unused password reset tokens
    DELETE FROM password_reset_tokens
    WHERE expires_at < CURRENT_TIMESTAMP - INTERVAL '30 days';

    -- Delete unverified email tokens
    DELETE FROM email_verifications
    WHERE expires_at < CURRENT_TIMESTAMP - INTERVAL '30 days'
    AND verified_at IS NULL;

    RAISE NOTICE 'Retention policies applied successfully';
END;
$$ LANGUAGE plpgsql;

-- Schedule retention policy execution
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
    'apply-retention-policies',
    '0 2 * * *', -- Run at 2 AM daily
    'SELECT apply_retention_policies();'
);
```

### 4.3 GDPR Compliance

#### gdpr_compliance.sql
```sql
-- User data export function
CREATE OR REPLACE FUNCTION export_user_data(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    v_user_data JSON;
BEGIN
    SELECT json_build_object(
        'user', (
            SELECT row_to_json(u)
            FROM users u
            WHERE u.id = p_user_id
        ),
        'addresses', (
            SELECT json_agg(row_to_json(a))
            FROM addresses a
            WHERE a.user_id = p_user_id
        ),
        'bookings', (
            SELECT json_agg(row_to_json(b))
            FROM bookings b
            WHERE b.user_id = p_user_id
        ),
        'reviews', (
            SELECT json_agg(row_to_json(r))
            FROM reviews r
            WHERE r.user_id = p_user_id
        ),
        'payments', (
            SELECT json_agg(row_to_json(p))
            FROM payments p
            JOIN bookings b ON b.id = p.booking_id
            WHERE b.user_id = p_user_id
        )
    ) INTO v_user_data;

    -- Log data export
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
    VALUES (p_user_id, 'export', 'user_data', p_user_id);

    RETURN v_user_data;
END;
$$ LANGUAGE plpgsql;

-- User data deletion (right to be forgotten)
CREATE OR REPLACE FUNCTION delete_user_data(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Anonymize bookings instead of deleting
    UPDATE bookings
    SET
        user_id = '00000000-0000-0000-0000-000000000000'::UUID,
        customer_notes = NULL,
        notes = NULL
    WHERE user_id = p_user_id;

    -- Anonymize reviews
    UPDATE reviews
    SET
        user_id = '00000000-0000-0000-0000-000000000000'::UUID,
        comment = 'Deleted'
    WHERE user_id = p_user_id;

    -- Delete personal data
    DELETE FROM addresses WHERE user_id = p_user_id;
    DELETE FROM notifications WHERE user_id = p_user_id;
    DELETE FROM user_promotions WHERE user_id = p_user_id;
    DELETE FROM sessions WHERE user_id = p_user_id;
    DELETE FROM password_reset_tokens WHERE user_id = p_user_id;
    DELETE FROM email_verifications WHERE user_id = p_user_id;

    -- Anonymize user record
    UPDATE users
    SET
        email = 'deleted_' || id || '@deleted.com',
        phone = NULL,
        password_hash = NULL,
        first_name = 'Deleted',
        last_name = 'User',
        status = 'inactive',
        deleted_at = CURRENT_TIMESTAMP
    WHERE id = p_user_id;

    -- Log deletion
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
    VALUES (p_user_id, 'delete', 'user_data', p_user_id);
END;
$$ LANGUAGE plpgsql;
```

### 4.4 Archival Strategies

#### archival_tables.sql
```sql
-- Create archive tables
CREATE TABLE bookings_archive (
    LIKE bookings INCLUDING ALL,
    archived_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments_archive (
    LIKE payments INCLUDING ALL,
    archived_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews_archive (
    LIKE reviews INCLUDING ALL,
    archived_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Archive old data function
CREATE OR REPLACE FUNCTION archive_old_data()
RETURNS VOID AS $$
DECLARE
    v_cutoff_date DATE;
    v_archived_bookings INT;
    v_archived_payments INT;
    v_archived_reviews INT;
BEGIN
    -- Set cutoff date (2 years ago)
    v_cutoff_date := CURRENT_DATE - INTERVAL '2 years';

    -- Archive bookings
    WITH archived AS (
        INSERT INTO bookings_archive
        SELECT *, CURRENT_TIMESTAMP
        FROM bookings
        WHERE status = 'completed'
        AND completed_at < v_cutoff_date
        RETURNING id
    )
    SELECT COUNT(*) INTO v_archived_bookings FROM archived;

    -- Archive related payments
    WITH archived AS (
        INSERT INTO payments_archive
        SELECT p.*, CURRENT_TIMESTAMP
        FROM payments p
        JOIN bookings_archive ba ON ba.id = p.booking_id
        WHERE ba.archived_at = CURRENT_TIMESTAMP
        RETURNING id
    )
    SELECT COUNT(*) INTO v_archived_payments FROM archived;

    -- Archive related reviews
    WITH archived AS (
        INSERT INTO reviews_archive
        SELECT r.*, CURRENT_TIMESTAMP
        FROM reviews r
        JOIN bookings_archive ba ON ba.id = r.booking_id
        WHERE ba.archived_at = CURRENT_TIMESTAMP
        RETURNING id
    )
    SELECT COUNT(*) INTO v_archived_reviews FROM archived;

    -- Delete archived data from main tables
    DELETE FROM reviews WHERE booking_id IN (
        SELECT id FROM bookings_archive WHERE archived_at = CURRENT_TIMESTAMP
    );

    DELETE FROM payments WHERE booking_id IN (
        SELECT id FROM bookings_archive WHERE archived_at = CURRENT_TIMESTAMP
    );

    DELETE FROM bookings WHERE id IN (
        SELECT id FROM bookings_archive WHERE archived_at = CURRENT_TIMESTAMP
    );

    RAISE NOTICE 'Archived % bookings, % payments, % reviews',
        v_archived_bookings, v_archived_payments, v_archived_reviews;
END;
$$ LANGUAGE plpgsql;
```

## 5. Integration Patterns

### 5.1 ORM Setup (Prisma)

#### schema.prisma
```prisma
// Prisma schema for WebUredno

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                  String    @id @default(uuid())
  email               String    @unique
  phone               String?
  passwordHash        String?   @map("password_hash")
  firstName           String    @map("first_name")
  lastName            String    @map("last_name")
  role                UserRole  @default(CUSTOMER)
  status              UserStatus @default(ACTIVE)
  emailVerified       Boolean   @default(false) @map("email_verified")
  phoneVerified       Boolean   @default(false) @map("phone_verified")
  language            String    @default("hr")
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")
  deletedAt           DateTime? @map("deleted_at")
  lastLoginAt         DateTime? @map("last_login_at")
  failedLoginAttempts Int       @default(0) @map("failed_login_attempts")
  lockedUntil         DateTime? @map("locked_until")

  addresses           Address[]
  bookings            Booking[] @relation("CustomerBookings")
  cleanerBookings     Booking[] @relation("CleanerBookings")
  reviews             Review[]  @relation("UserReviews")
  cleanerReviews      Review[]  @relation("CleanerReviews")
  cleanerProfile      CleanerProfile?
  notifications       Notification[]
  sessions            Session[]
  auditLogs           AuditLog[]

  @@map("users")
}

model Address {
  id                  String    @id @default(uuid())
  userId              String    @map("user_id")
  type                AddressType @default(SERVICE)
  label               String?
  street              String
  city                String
  postalCode          String    @map("postal_code")
  country             String    @default("HR")
  latitude            Decimal?  @db.Decimal(10, 8)
  longitude           Decimal?  @db.Decimal(11, 8)
  isPrimary           Boolean   @default(false) @map("is_primary")
  accessInstructions  String?   @map("access_instructions")
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  user                User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  bookings            Booking[]

  @@map("addresses")
}

model Service {
  id                  String    @id @default(uuid())
  code                String    @unique
  nameHr              String    @map("name_hr")
  nameEn              String    @map("name_en")
  descriptionHr       String?   @map("description_hr")
  descriptionEn       String?   @map("description_en")
  category            ServiceCategory
  basePrice           Decimal   @map("base_price") @db.Decimal(10, 2)
  minDurationMinutes  Int       @map("min_duration_minutes")
  maxDurationMinutes  Int?      @map("max_duration_minutes")
  isActive            Boolean   @default(true) @map("is_active")
  requiresConsultation Boolean  @default(false) @map("requires_consultation")
  maxAreaSqm          Int?      @map("max_area_sqm")
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  bookings            Booking[]
  bookingAddons       BookingAddon[]

  @@map("services")
}

model Booking {
  id                  String    @id @default(uuid())
  bookingNumber       String    @unique @map("booking_number")
  userId              String    @map("user_id")
  addressId           String    @map("address_id")
  serviceId           String    @map("service_id")
  cleanerId           String?   @map("cleaner_id")
  scheduledDate       DateTime  @map("scheduled_date") @db.Date
  scheduledTime       DateTime  @map("scheduled_time") @db.Time
  durationMinutes     Int       @map("duration_minutes")
  status              BookingStatus @default(PENDING)
  frequency           BookingFrequency @default(ONE_TIME)
  totalPrice          Decimal   @map("total_price") @db.Decimal(10, 2)
  discountAmount      Decimal   @default(0) @map("discount_amount") @db.Decimal(10, 2)
  finalPrice          Decimal   @map("final_price") @db.Decimal(10, 2)
  cancellationReason  String?   @map("cancellation_reason")
  cancellationDate    DateTime? @map("cancellation_date")
  completedAt         DateTime? @map("completed_at")
  notes               String?
  customerNotes       String?   @map("customer_notes")
  cleanerNotes        String?   @map("cleaner_notes")
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  customer            User      @relation("CustomerBookings", fields: [userId], references: [id])
  cleaner             User?     @relation("CleanerBookings", fields: [cleanerId], references: [id])
  address             Address   @relation(fields: [addressId], references: [id])
  service             Service   @relation(fields: [serviceId], references: [id])
  addons              BookingAddon[]
  payments            Payment[]
  review              Review?

  @@map("bookings")
}

model BookingAddon {
  id                  String    @id @default(uuid())
  bookingId           String    @map("booking_id")
  serviceId           String    @map("service_id")
  quantity            Int       @default(1)
  unitPrice           Decimal   @map("unit_price") @db.Decimal(10, 2)
  totalPrice          Decimal   @map("total_price") @db.Decimal(10, 2)
  createdAt           DateTime  @default(now()) @map("created_at")

  booking             Booking   @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  service             Service   @relation(fields: [serviceId], references: [id])

  @@map("booking_addons")
}

model Payment {
  id                  String    @id @default(uuid())
  bookingId           String    @map("booking_id")
  transactionId       String?   @unique @map("transaction_id")
  paymentMethod       PaymentMethod @map("payment_method")
  amount              Decimal   @db.Decimal(10, 2)
  currency            String    @default("EUR")
  status              PaymentStatus @default(PENDING)
  gateway             String?
  gatewayResponse     Json?     @map("gateway_response")
  paidAt              DateTime? @map("paid_at")
  refundedAt          DateTime? @map("refunded_at")
  refundAmount        Decimal?  @map("refund_amount") @db.Decimal(10, 2)
  refundReason        String?   @map("refund_reason")
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  booking             Booking   @relation(fields: [bookingId], references: [id])

  @@map("payments")
}

model Review {
  id                  String    @id @default(uuid())
  bookingId           String    @unique @map("booking_id")
  userId              String    @map("user_id")
  cleanerId           String?   @map("cleaner_id")
  rating              Int
  serviceQuality      Int?      @map("service_quality")
  punctuality         Int?
  professionalism     Int?
  comment             String?
  isVisible           Boolean   @default(true) @map("is_visible")
  adminResponse       String?   @map("admin_response")
  adminResponseAt     DateTime? @map("admin_response_at")
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  booking             Booking   @relation(fields: [bookingId], references: [id])
  user                User      @relation("UserReviews", fields: [userId], references: [id])
  cleaner             User?     @relation("CleanerReviews", fields: [cleanerId], references: [id])

  @@map("reviews")
}

model CleanerProfile {
  id                  String    @id @default(uuid())
  userId              String    @unique @map("user_id")
  bio                 String?
  experienceYears     Int?      @map("experience_years")
  specializations     String[]
  languages           String[]
  availability        Json?
  serviceAreas        String[]  @map("service_areas")
  equipmentOwned      Boolean   @default(false) @map("equipment_owned")
  backgroundCheckDate DateTime? @map("background_check_date") @db.Date
  backgroundCheckStatus String? @map("background_check_status")
  insuranceNumber     String?   @map("insurance_number")
  insuranceExpiry     DateTime? @map("insurance_expiry") @db.Date
  ratingAverage       Decimal?  @map("rating_average") @db.Decimal(3, 2)
  totalReviews        Int       @default(0) @map("total_reviews")
  totalBookings       Int       @default(0) @map("total_bookings")
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  user                User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("cleaner_profiles")
}

model Notification {
  id                  String    @id @default(uuid())
  userId              String    @map("user_id")
  type                String
  channel             NotificationChannel
  title               String
  message             String
  data                Json?
  status              NotificationStatus @default(PENDING)
  sentAt              DateTime? @map("sent_at")
  readAt              DateTime? @map("read_at")
  errorMessage        String?   @map("error_message")
  retryCount          Int       @default(0) @map("retry_count")
  createdAt           DateTime  @default(now()) @map("created_at")

  user                User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("notifications")
}

model Session {
  id                  String    @id @default(uuid())
  userId              String    @map("user_id")
  token               String    @unique
  ipAddress           String?   @map("ip_address")
  userAgent           String?   @map("user_agent")
  expiresAt           DateTime  @map("expires_at")
  lastActivityAt      DateTime? @map("last_activity_at")
  createdAt           DateTime  @default(now()) @map("created_at")

  user                User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model AuditLog {
  id                  String    @id @default(uuid())
  userId              String?   @map("user_id")
  action              String
  entityType          String    @map("entity_type")
  entityId            String?   @map("entity_id")
  oldValues           Json?     @map("old_values")
  newValues           Json?     @map("new_values")
  ipAddress           String?   @map("ip_address")
  userAgent           String?   @map("user_agent")
  sessionId           String?   @map("session_id")
  createdAt           DateTime  @default(now()) @map("created_at")

  user                User?     @relation(fields: [userId], references: [id])

  @@map("audit_logs")
}

// Enums
enum UserRole {
  CUSTOMER @map("customer")
  CLEANER  @map("cleaner")
  ADMIN    @map("admin")
  SUPER_ADMIN @map("super_admin")
}

enum UserStatus {
  ACTIVE   @map("active")
  INACTIVE @map("inactive")
  SUSPENDED @map("suspended")
  PENDING  @map("pending")
}

enum AddressType {
  SERVICE  @map("service")
  BILLING  @map("billing")
  BUSINESS @map("business")
}

enum ServiceCategory {
  REGULAR  @map("regular")
  DEEP     @map("deep")
  MOVING   @map("moving")
  SPECIAL  @map("special")
  ADDON    @map("addon")
}

enum BookingStatus {
  PENDING     @map("pending")
  CONFIRMED   @map("confirmed")
  IN_PROGRESS @map("in_progress")
  COMPLETED   @map("completed")
  CANCELLED   @map("cancelled")
  RESCHEDULED @map("rescheduled")
}

enum BookingFrequency {
  ONE_TIME  @map("one_time")
  WEEKLY    @map("weekly")
  BIWEEKLY  @map("biweekly")
  MONTHLY   @map("monthly")
}

enum PaymentMethod {
  CARD          @map("card")
  CASH          @map("cash")
  BANK_TRANSFER @map("bank_transfer")
  PAYPAL        @map("paypal")
}

enum PaymentStatus {
  PENDING        @map("pending")
  PROCESSING     @map("processing")
  COMPLETED      @map("completed")
  FAILED         @map("failed")
  REFUNDED       @map("refunded")
  PARTIAL_REFUND @map("partial_refund")
}

enum NotificationChannel {
  EMAIL   @map("email")
  SMS     @map("sms")
  PUSH    @map("push")
  IN_APP  @map("in_app")
}

enum NotificationStatus {
  PENDING   @map("pending")
  SENT      @map("sent")
  DELIVERED @map("delivered")
  READ      @map("read")
  FAILED    @map("failed")
}
```

### 5.2 Connection Pooling

#### database.config.ts
```typescript
import { Pool, PoolConfig } from 'pg';
import { PrismaClient } from '@prisma/client';

// PostgreSQL connection pool configuration
const poolConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'weburedno',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,

  // Pool settings
  max: 20, // Maximum number of clients in the pool
  min: 2,  // Minimum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return error after 2 seconds if connection cannot be established

  // Statement timeout
  statement_timeout: 30000, // 30 seconds
  query_timeout: 30000,
};

// Create pool instance
export const pool = new Pool(poolConfig);

// Pool event handlers
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

pool.on('connect', (client) => {
  console.log('New client connected to the pool');
});

pool.on('acquire', (client) => {
  console.log('Client acquired from the pool');
});

pool.on('remove', (client) => {
  console.log('Client removed from the pool');
});

// Prisma client with connection pooling
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'stdout',
      level: 'error',
    },
    {
      emit: 'stdout',
      level: 'info',
    },
    {
      emit: 'stdout',
      level: 'warn',
    },
  ],
});

// Connection pool monitoring
export async function getPoolStats() {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  };
}

// Graceful shutdown
export async function closeConnections() {
  await prisma.$disconnect();
  await pool.end();
}

process.on('SIGINT', closeConnections);
process.on('SIGTERM', closeConnections);
```

### 5.3 Query Builders

#### queryBuilder.ts
```typescript
import { pool } from './database.config';

export class QueryBuilder {
  private query: string = '';
  private values: any[] = [];
  private paramCounter: number = 0;

  select(columns: string[] | string = '*'): this {
    const cols = Array.isArray(columns) ? columns.join(', ') : columns;
    this.query = `SELECT ${cols}`;
    return this;
  }

  from(table: string): this {
    this.query += ` FROM ${table}`;
    return this;
  }

  join(type: 'INNER' | 'LEFT' | 'RIGHT', table: string, on: string): this {
    this.query += ` ${type} JOIN ${table} ON ${on}`;
    return this;
  }

  where(condition: string, value?: any): this {
    if (this.query.includes('WHERE')) {
      this.query += ` AND ${condition}`;
    } else {
      this.query += ` WHERE ${condition}`;
    }

    if (value !== undefined) {
      this.paramCounter++;
      this.query = this.query.replace('?', `$${this.paramCounter}`);
      this.values.push(value);
    }

    return this;
  }

  whereIn(column: string, values: any[]): this {
    const placeholders = values.map((_, i) => `$${this.paramCounter + i + 1}`).join(', ');
    this.paramCounter += values.length;
    this.values.push(...values);

    if (this.query.includes('WHERE')) {
      this.query += ` AND ${column} IN (${placeholders})`;
    } else {
      this.query += ` WHERE ${column} IN (${placeholders})`;
    }

    return this;
  }

  orderBy(column: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    if (this.query.includes('ORDER BY')) {
      this.query += `, ${column} ${direction}`;
    } else {
      this.query += ` ORDER BY ${column} ${direction}`;
    }
    return this;
  }

  limit(limit: number): this {
    this.query += ` LIMIT ${limit}`;
    return this;
  }

  offset(offset: number): this {
    this.query += ` OFFSET ${offset}`;
    return this;
  }

  async execute<T>(): Promise<T[]> {
    const result = await pool.query(this.query, this.values);
    return result.rows;
  }

  async first<T>(): Promise<T | null> {
    this.limit(1);
    const result = await this.execute<T>();
    return result[0] || null;
  }

  getSQL(): { query: string; values: any[] } {
    return { query: this.query, values: this.values };
  }
}

// Usage example
export async function findActiveBookings(userId: string, limit = 10) {
  return new QueryBuilder()
    .select(['b.*', 's.name_hr as service_name'])
    .from('bookings b')
    .join('INNER', 'services s', 's.id = b.service_id')
    .where('b.user_id = ?', userId)
    .where('b.status != ?', 'cancelled')
    .orderBy('b.scheduled_date', 'DESC')
    .limit(limit)
    .execute();
}
```

### 5.4 Database Monitoring

#### monitoring.sql
```sql
-- Real-time query monitoring
CREATE OR REPLACE VIEW v_active_queries AS
SELECT
    pid,
    usename,
    application_name,
    client_addr,
    backend_start,
    xact_start,
    query_start,
    state,
    query,
    wait_event_type,
    wait_event
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY query_start;

-- Connection statistics
CREATE OR REPLACE VIEW v_connection_stats AS
SELECT
    datname,
    numbackends AS active_connections,
    xact_commit AS committed_transactions,
    xact_rollback AS rolled_back_transactions,
    blks_read AS blocks_read,
    blks_hit AS blocks_hit,
    tup_returned AS rows_returned,
    tup_fetched AS rows_fetched,
    tup_inserted AS rows_inserted,
    tup_updated AS rows_updated,
    tup_deleted AS rows_deleted
FROM pg_stat_database
WHERE datname = 'weburedno';

-- Table bloat monitoring
CREATE OR REPLACE VIEW v_table_bloat AS
WITH constants AS (
    SELECT current_setting('block_size')::numeric AS bs,
           23 AS hdr, 4 AS ma
),
bloat_info AS (
    SELECT
        schemaname,
        tablename,
        cc.relpages,
        bs,
        CEIL((cc.reltuples*((datahdr+ma-
            (CASE WHEN datahdr%ma=0 THEN ma ELSE datahdr%ma END))+nullhdr2+4))/(bs-20::float)) AS otta
    FROM (
        SELECT
            schemaname,
            tablename,
            (datawidth+(hdr+ma-(case when hdr%ma=0 then ma else hdr%ma end)))::numeric AS datahdr,
            (maxfracsum*(nullhdr+ma-(case when nullhdr%ma=0 then ma else nullhdr%ma end))) AS nullhdr2
        FROM (
            SELECT
                schemaname,
                tablename,
                hdr,
                ma,
                bs,
                SUM((1-null_frac)*avg_width) AS datawidth,
                MAX(null_frac) AS maxfracsum,
                hdr+(
                    SELECT 1+count(*)/8
                    FROM pg_stats s2
                    WHERE null_frac<>0 AND s2.schemaname = s.schemaname AND s2.tablename = s.tablename
                ) AS nullhdr
            FROM pg_stats s, constants
            GROUP BY 1,2,3,4,5
        ) AS foo
    ) AS rs
    JOIN pg_class cc ON cc.relname = rs.tablename
    JOIN constants ON 1=1
)
SELECT
    schemaname,
    tablename,
    pg_size_pretty(bs*relpages::bigint) AS table_size,
    ROUND(100 * (relpages-otta)::float/relpages) AS bloat_pct
FROM bloat_info
WHERE relpages > 10
ORDER BY (relpages-otta) DESC;

-- Performance metrics dashboard function
CREATE OR REPLACE FUNCTION get_performance_metrics()
RETURNS TABLE(
    metric_name VARCHAR,
    metric_value TEXT,
    metric_unit VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    -- Cache hit ratio
    SELECT
        'cache_hit_ratio'::VARCHAR,
        ROUND(100.0 * blks_hit / NULLIF(blks_hit + blks_read, 0), 2)::TEXT,
        '%'::VARCHAR
    FROM pg_stat_database
    WHERE datname = current_database()

    UNION ALL

    -- Active connections
    SELECT
        'active_connections'::VARCHAR,
        COUNT(*)::TEXT,
        'connections'::VARCHAR
    FROM pg_stat_activity
    WHERE datname = current_database()

    UNION ALL

    -- Database size
    SELECT
        'database_size'::VARCHAR,
        pg_size_pretty(pg_database_size(current_database()))::TEXT,
        ''::VARCHAR

    UNION ALL

    -- Slow queries count
    SELECT
        'slow_queries'::VARCHAR,
        COUNT(*)::TEXT,
        'queries'::VARCHAR
    FROM pg_stat_statements
    WHERE mean_time > 100

    UNION ALL

    -- Transaction rate
    SELECT
        'transaction_rate'::VARCHAR,
        (xact_commit + xact_rollback)::TEXT,
        'transactions'::VARCHAR
    FROM pg_stat_database
    WHERE datname = current_database();
END;
$$ LANGUAGE plpgsql;
```

## Conclusion

This comprehensive database architecture provides a robust foundation for WebUredno's cleaning service platform. The design emphasizes:

1. **Data Integrity**: Comprehensive constraints, foreign keys, and trigger-based validation
2. **Performance**: Strategic indexing, query optimization, and connection pooling
3. **Scalability**: Archival strategies, partitioning support, and efficient query patterns
4. **Security**: GDPR compliance, audit logging, and data encryption support
5. **Maintainability**: Clear migration strategies, monitoring tools, and documentation

The implementation follows PostgreSQL best practices and provides both raw SQL and ORM-based approaches for flexibility in development.