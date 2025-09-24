// Database Types for Uredno.eu

export interface Service {
  id: string;
  name: string;
  slug: string;
  category: 'regular' | 'standard' | 'deep' | 'post-renovation' | 'move-in-out' | 'daily_rental' | 'vacation_rental' | 'windows' | 'office' | 'general' | 'disinfection';
  base_price: number;
  price_per_sqm?: number | null;
  min_price?: number | null;
  duration_hours: number;
  description?: string | null;
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
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  coordinates?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  } | null;
  notes?: string | null;
  source?: 'website' | 'whatsapp' | 'referral' | null;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  booking_number: string;
  customer_id: string;
  service_id?: string | null;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  booking_date: string; // YYYY-MM-DD
  time_slot: string; // e.g., '09:00-11:00'
  team_number?: number | null;

  // Service details
  service_type: string;
  frequency?: 'one-time' | 'weekly' | 'biweekly' | 'monthly' | null;

  // Property details
  property_type?: 'apartment' | 'house' | 'office' | null;
  property_size?: number | null; // in sqm
  bedrooms?: number | null;
  bathrooms?: number | null;

  // Pricing
  base_price?: number | null;
  extras: BookingExtra[];
  extras_cost: number;
  distance_fee: number;
  total_price: number;

  // Additional info
  special_requests?: string | null;
  internal_notes?: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
  confirmed_at?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;

  // Relations (when joined)
  customer?: Customer;
  service?: Service;
}

export interface BookingExtra {
  name: string;
  price: number;
  quantity?: number;
}

export interface Availability {
  id: string;
  date: string; // YYYY-MM-DD
  time_slot: string; // e.g., '09:00-11:00'
  team_number: 1 | 2 | 3;
  is_available: boolean;
  booking_id?: string | null;
  created_at: string;
  updated_at: string;

  // Relations (when joined)
  booking?: Booking;
}

export interface PricingRule {
  id: string;
  rule_type: 'distance' | 'size' | 'frequency' | 'custom';
  service_id?: string | null;
  conditions: {
    distance_km?: {
      min?: number;
      max?: number;
    };
    property_size?: {
      min?: number;
      max?: number;
    };
    frequency?: string;
    [key: string]: any;
  };
  adjustment_type: 'fixed' | 'percentage';
  adjustment_value: number;
  priority: number;
  active: boolean;
  created_at: string;
  updated_at: string;

  // Relations (when joined)
  service?: Service;
}

export interface Review {
  id: string;
  booking_id?: string | null;
  customer_id?: string | null;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;

  // Relations (when joined)
  booking?: Booking;
  customer?: Customer;
}

export interface Inquiry {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  message: string;
  inquiry_type?: 'general' | 'quote' | 'support' | null;
  status: 'new' | 'responded' | 'closed';
  source?: 'website' | 'whatsapp' | null;
  created_at: string;
  responded_at?: string | null;
}

// Helper types for form inputs and API requests

export interface CreateBookingInput {
  customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>;
  service_id: string;
  booking_date: string;
  time_slot: string;
  team_number?: number;
  service_type: string;
  frequency?: 'one-time' | 'weekly' | 'biweekly' | 'monthly';
  property_type?: 'apartment' | 'house' | 'office';
  property_size?: number;
  bedrooms?: number;
  bathrooms?: number;
  extras?: BookingExtra[];
  special_requests?: string;
}

export interface CreateInquiryInput {
  name: string;
  email?: string;
  phone?: string;
  message: string;
  inquiry_type?: 'general' | 'quote' | 'support';
  source?: 'website' | 'whatsapp';
}

export interface AvailabilitySlot {
  date: string;
  time_slot: string;
  available_teams: number;
  team_numbers: number[];
}

export interface TimeSlot {
  value: string;
  label: string;
  available: boolean;
}

// Database function return types

export interface PriceCalculation {
  base_price: number;
  extras_cost: number;
  total_price: number;
}

export interface AvailabilityCheck {
  team_number: number;
  is_available: boolean;
}

// Aggregate types for analytics

export interface BookingStats {
  total_bookings: number;
  pending_bookings: number;
  confirmed_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  total_revenue: number;
}