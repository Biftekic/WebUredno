// API Types for Uredno.eu Backend

// Price Calculator API
export interface PriceCalculationRequest {
  service_id?: string;
  service_type: 'regular' | 'deep' | 'construction' | 'moving' | 'windows' | 'office' | 'general' | 'disinfection';
  property_size: number;
  property_type: 'apartment' | 'house' | 'office';
  bedrooms?: number;
  bathrooms?: number;
  frequency?: 'one-time' | 'weekly' | 'biweekly' | 'monthly';
  extras?: Array<{
    name: string;
    price: number;
    quantity?: number;
  }>;
  address?: string;
  postal_code?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface PriceCalculationResponse {
  success: boolean;
  data: {
    base_price: number;
    property_multiplier: number;
    frequency_discount: {
      percentage: number;
      amount: number;
    };
    price_after_discount: number;
    extras_cost: number;
    distance_fee: number;
    total_price: number;
    service_details: {
      type: string;
      base_rate_per_sqm: number;
      minimum_price: number;
      property_type: string;
      property_size: number;
      frequency: string;
      name?: string;
      description?: string;
    };
    messages: {
      base: string;
      discount: string | null;
      extras: string | null;
      distance: string | null;
      total: string;
    };
  };
}

// Contact Form API
export interface ContactFormRequest {
  name: string;
  email?: string | null;
  phone?: string | null;
  message: string;
  inquiry_type?: 'general' | 'quote' | 'support';
  service_interest?: string;
  source?: 'website' | 'whatsapp';
  consent?: boolean;
  recaptcha_token?: string;
}

export interface ContactFormResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    reference_number: string;
    estimated_response_time: string;
  };
}

// Calendar API
export interface CalendarAvailabilityRequest {
  date: string;
  service_type?: string;
}

export interface CalendarSlot {
  time_slot: string;
  available: boolean;
  available_teams: number;
  team_numbers: number[];
  label: string;
  status_text: string;
}

export interface CalendarAvailabilityResponse {
  success: boolean;
  data: {
    date: string;
    day_name: string;
    slots: CalendarSlot[];
    summary: {
      total_slots: number;
      available_slots: number;
      fully_booked: boolean;
    };
  };
}

export interface CalendarEventRequest {
  booking_id: string;
  title: string;
  description?: string;
  date: string;
  time_slot: string;
  location?: {
    address: string;
    city?: string;
    postal_code?: string;
  };
  attendees?: Array<{
    email: string;
    name?: string;
  }>;
}

export interface CalendarEventResponse {
  success: boolean;
  message: string;
  data: {
    event_id: string;
    booking_id: string;
    calendar_link: string;
  };
}

// WhatsApp API
export interface WhatsAppMessageRequest {
  to: string;
  message: string;
  template?: 'booking_confirmation' | 'reminder' | 'custom';
}

export interface WhatsAppMessageResponse {
  success: boolean;
  message: string;
  data: {
    message_id: string;
    recipient: string;
  };
}

export interface WhatsAppWebhookPayload {
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        messages?: Array<{
          from: string;
          id: string;
          timestamp: number;
          type: string;
          text?: {
            body: string;
          };
        }>;
        statuses?: Array<{
          id: string;
          status: string;
          timestamp: number;
          recipient_id: string;
        }>;
      };
      field: string;
    }>;
  }>;
}

// Distance Calculator API
export interface DistanceCalculationRequest {
  address: string;
  postal_code?: string;
  city?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface DistanceCalculationResponse {
  success: boolean;
  message?: string;
  data: {
    location: {
      address: string;
      postal_code?: string;
      city: string;
      district: string;
      coordinates: {
        lat: number;
        lng: number;
      };
    };
    distance: {
      from_center_km: number;
      within_free_zone: boolean;
      within_service_area: boolean;
    };
    fee: {
      distance_km: number;
      free_radius_km: number;
      billable_distance_km: number;
      fee_per_km: number;
      total_fee: number;
      currency: string;
    };
    messages: {
      distance: string;
      fee: string;
      zone: string;
    };
  };
}

export interface ServiceZone {
  name: string;
  radius_km: number | string;
  fee: number;
  fee_unit?: string;
  color: string;
  districts: string[];
}

export interface ServiceZonesResponse {
  success: boolean;
  data: {
    center: {
      name: string;
      coordinates: {
        lat: number;
        lng: number;
      };
    };
    zones: ServiceZone[];
    max_service_distance_km: number;
    supported_postal_codes: string[];
  };
}

// Common Error Response
export interface ApiErrorResponse {
  error: string;
  message?: string;
  details?: any;
}

// API Client Helper Types
export type ApiResponse<T> = Promise<T | ApiErrorResponse>;

export interface ApiRequestConfig {
  headers?: HeadersInit;
  signal?: AbortSignal;
  cache?: RequestCache;
  credentials?: RequestCredentials;
}

// Webhook Types
export interface WebhookVerification {
  'hub.mode': string;
  'hub.verify_token': string;
  'hub.challenge': string;
}

// Rate Limiting
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

// Pagination
export interface PaginatedRequest {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// Status Types
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type InquiryStatus = 'new' | 'responded' | 'closed';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

// Notification Types
export interface NotificationRequest {
  type: 'email' | 'sms' | 'whatsapp';
  recipient: string;
  subject?: string;
  message: string;
  template?: string;
  variables?: Record<string, any>;
}

export interface NotificationResponse {
  success: boolean;
  message_id: string;
  status: 'sent' | 'queued' | 'failed';
  error?: string;
}