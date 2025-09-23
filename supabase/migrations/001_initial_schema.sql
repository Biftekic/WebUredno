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