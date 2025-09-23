# Phase 1: Database Schema Setup Workflow

## Overview
Setup PostgreSQL database schema with Supabase for the Uredno.eu platform.

## Prerequisites
- Supabase account created
- Project initialized in Supabase
- Database credentials obtained

## Workflow Steps

### 1. Connect to Supabase
```bash
# Install Supabase CLI
npm install -D supabase

# Login to Supabase
npx supabase login

# Initialize Supabase in project
npx supabase init

# Link to your project
npx supabase link --project-ref [your-project-ref]
```

### 2. Create Migration Files
```bash
# Create migrations directory
mkdir -p supabase/migrations

# Create initial schema migration
touch supabase/migrations/001_initial_schema.sql
```

### 3. Define Core Tables

```sql
-- supabase/migrations/001_initial_schema.sql

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Services table
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    price_per_sqm DECIMAL(10,2),
    min_price DECIMAL(10,2),
    duration_hours INTEGER NOT NULL DEFAULT 2,
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    popular BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(10),
    coordinates GEOGRAPHY(POINT),
    notes TEXT,
    source VARCHAR(50), -- 'website', 'whatsapp', 'referral'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_number VARCHAR(20) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id),
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, completed, cancelled
    booking_date DATE NOT NULL,
    time_slot VARCHAR(20) NOT NULL, -- '09:00-11:00'
    team_number INTEGER, -- 1, 2, or 3

    -- Service details
    service_type VARCHAR(50) NOT NULL,
    frequency VARCHAR(20), -- 'one-time', 'weekly', 'biweekly', 'monthly'

    -- Property details
    property_type VARCHAR(50), -- 'apartment', 'house', 'office'
    property_size INTEGER, -- in sqm
    bedrooms INTEGER,
    bathrooms INTEGER,

    -- Pricing
    base_price DECIMAL(10,2),
    extras JSONB DEFAULT '[]'::jsonb,
    extras_cost DECIMAL(10,2) DEFAULT 0,
    distance_fee DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL,

    -- Additional info
    special_requests TEXT,
    internal_notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ
);

-- Availability table
CREATE TABLE availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    time_slot VARCHAR(20) NOT NULL, -- '09:00-11:00'
    team_number INTEGER NOT NULL CHECK (team_number BETWEEN 1 AND 3),
    is_available BOOLEAN DEFAULT true,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, time_slot, team_number)
);

-- Pricing rules table
CREATE TABLE pricing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_type VARCHAR(50) NOT NULL, -- 'distance', 'size', 'frequency'
    service_id UUID REFERENCES services(id),
    conditions JSONB NOT NULL,
    adjustment_type VARCHAR(20), -- 'fixed', 'percentage'
    adjustment_value DECIMAL(10,2),
    priority INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact inquiries table
CREATE TABLE inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    message TEXT NOT NULL,
    inquiry_type VARCHAR(50), -- 'general', 'quote', 'support'
    status VARCHAR(20) DEFAULT 'new', -- 'new', 'responded', 'closed'
    source VARCHAR(50), -- 'website', 'whatsapp'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ
);
```

### 4. Create Indexes
```sql
-- supabase/migrations/002_indexes.sql

-- Performance indexes
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_availability_date ON availability(date);
CREATE INDEX idx_availability_slot ON availability(time_slot);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_services_slug ON services(slug);
CREATE INDEX idx_services_active ON services(active);

-- Full text search
CREATE INDEX idx_services_search ON services USING gin(
    to_tsvector('croatian', name || ' ' || COALESCE(description, ''))
);
```

### 5. Create Functions & Triggers
```sql
-- supabase/migrations/003_functions.sql

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to all tables
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Generate booking number function
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TEXT AS $$
DECLARE
    booking_num TEXT;
BEGIN
    booking_num := 'WU' || TO_CHAR(NOW(), 'YYMMDD') ||
                   LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    RETURN booking_num;
END;
$$ LANGUAGE plpgsql;

-- Check availability function
CREATE OR REPLACE FUNCTION check_availability(
    p_date DATE,
    p_time_slot VARCHAR
) RETURNS TABLE(
    team_number INTEGER,
    is_available BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT a.team_number, a.is_available
    FROM availability a
    WHERE a.date = p_date
    AND a.time_slot = p_time_slot
    ORDER BY a.team_number;
END;
$$ LANGUAGE plpgsql;
```

### 6. Create Row Level Security (RLS) Policies
```sql
-- supabase/migrations/004_rls.sql

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Public read access to services
CREATE POLICY "Services are viewable by everyone"
    ON services FOR SELECT
    USING (active = true);

-- Public can check availability
CREATE POLICY "Availability is viewable by everyone"
    ON availability FOR SELECT
    USING (true);

-- Public can create bookings and inquiries
CREATE POLICY "Anyone can create bookings"
    ON bookings FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can create inquiries"
    ON inquiries FOR INSERT
    WITH CHECK (true);

-- Customers can view their own data
CREATE POLICY "Customers can view own bookings"
    ON bookings FOR SELECT
    USING (auth.uid()::text = customer_id::text);
```

### 7. Seed Initial Data
```sql
-- supabase/migrations/005_seed_data.sql

-- Insert services
INSERT INTO services (name, slug, category, base_price, price_per_sqm, min_price, duration_hours, description, popular, display_order) VALUES
('Osnovno čišćenje', 'osnovno-ciscenje', 'regular', 35, 0.50, 35, 2, 'Redovito održavanje vašeg doma', true, 1),
('Dubinsko čišćenje', 'dubinsko-ciscenje', 'deep', 50, 0.75, 50, 3, 'Temeljito čišćenje svih površina', true, 2),
('Čišćenje nakon građevinskih radova', 'gradjevinski-radovi', 'construction', 80, 1.00, 80, 4, 'Specijalizirano čišćenje nakon renovacije', false, 3),
('Selidba - čišćenje', 'selidba', 'moving', 60, 0.60, 60, 3, 'Priprema prostora za useljenje/iseljenje', false, 4),
('Pranje prozora', 'pranje-prozora', 'windows', 25, null, 25, 2, 'Profesionalno pranje prozora', false, 5),
('Čišćenje ureda', 'ciscenje-ureda', 'office', 45, 0.40, 45, 2, 'Održavanje poslovnih prostora', false, 6);

-- Insert sample time slots for next 30 days
DO $$
DECLARE
    v_date DATE;
    v_slot TEXT;
    v_team INTEGER;
BEGIN
    FOR v_date IN SELECT generate_series(CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', '1 day')::date
    LOOP
        -- Skip Sundays
        IF EXTRACT(DOW FROM v_date) != 0 THEN
            FOREACH v_slot IN ARRAY ARRAY['07:00-09:00', '09:00-11:00', '11:00-13:00', '13:00-15:00']
            LOOP
                FOR v_team IN 1..3
                LOOP
                    INSERT INTO availability (date, time_slot, team_number, is_available)
                    VALUES (v_date, v_slot, v_team, true)
                    ON CONFLICT (date, time_slot, team_number) DO NOTHING;
                END LOOP;
            END LOOP;
        END IF;
    END LOOP;
END $$;
```

### 8. Apply Migrations
```bash
# Run migrations
npx supabase db push

# Verify migrations
npx supabase db status
```

### 9. Create Database Types for TypeScript
```typescript
// types/database.ts
export interface Service {
  id: string;
  name: string;
  slug: string;
  category: string;
  base_price: number;
  price_per_sqm?: number;
  min_price?: number;
  duration_hours: number;
  description?: string;
  features: string[];
  popular: boolean;
  active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  postal_code?: string;
  coordinates?: { lat: number; lng: number };
  notes?: string;
  source?: 'website' | 'whatsapp' | 'referral';
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  booking_number: string;
  customer_id: string;
  service_id?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  booking_date: string;
  time_slot: string;
  team_number?: number;
  service_type: string;
  frequency?: 'one-time' | 'weekly' | 'biweekly' | 'monthly';
  property_type?: string;
  property_size?: number;
  bedrooms?: number;
  bathrooms?: number;
  base_price?: number;
  extras: any[];
  extras_cost: number;
  distance_fee: number;
  total_price: number;
  special_requests?: string;
  internal_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Availability {
  id: string;
  date: string;
  time_slot: string;
  team_number: number;
  is_available: boolean;
  booking_id?: string;
  created_at: string;
  updated_at: string;
}
```

### 10. Create Supabase Client
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
```

## Verification Checklist

- [ ] Supabase project is created
- [ ] Database tables are created
- [ ] Indexes are applied
- [ ] Functions and triggers work
- [ ] RLS policies are enabled
- [ ] Initial data is seeded
- [ ] TypeScript types match schema
- [ ] Supabase client connects successfully

## Next Steps
- Proceed to [Mobile-First Layout](./03-mobile-layout.md)
- Test database queries
- Set up database backups

## Troubleshooting

### Common Issues
1. **Migration fails**: Check SQL syntax and dependencies
2. **Connection issues**: Verify environment variables
3. **RLS blocking**: Check policy definitions
4. **Type mismatches**: Regenerate types from schema