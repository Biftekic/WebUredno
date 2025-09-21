export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      services: {
        Row: {
          id: string
          name: string
          slug: string
          category: string
          base_price: number
          price_per_sqm: number | null
          min_price: number | null
          duration_hours: number
          description: string | null
          features: Json
          popular: boolean
          active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          category: string
          base_price: number
          price_per_sqm?: number | null
          min_price?: number | null
          duration_hours?: number
          description?: string | null
          features?: Json
          popular?: boolean
          active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          category?: string
          base_price?: number
          price_per_sqm?: number | null
          min_price?: number | null
          duration_hours?: number
          description?: string | null
          features?: Json
          popular?: boolean
          active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone: string
          address: string | null
          city: string | null
          postal_code: string | null
          coordinates: unknown | null
          notes: string | null
          source: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          phone: string
          address?: string | null
          city?: string | null
          postal_code?: string | null
          coordinates?: unknown | null
          notes?: string | null
          source?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          address?: string | null
          city?: string | null
          postal_code?: string | null
          coordinates?: unknown | null
          notes?: string | null
          source?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          booking_number: string
          customer_id: string | null
          service_id: string | null
          status: string
          booking_date: string
          time_slot: string
          team_number: number | null
          service_type: string
          frequency: string | null
          property_type: string | null
          property_size: number | null
          bedrooms: number | null
          bathrooms: number | null
          base_price: number | null
          extras: Json
          extras_cost: number
          distance_fee: number
          total_price: number
          special_requests: string | null
          internal_notes: string | null
          created_at: string
          updated_at: string
          confirmed_at: string | null
          completed_at: string | null
          cancelled_at: string | null
        }
        Insert: {
          id?: string
          booking_number?: string
          customer_id?: string | null
          service_id?: string | null
          status?: string
          booking_date: string
          time_slot: string
          team_number?: number | null
          service_type: string
          frequency?: string | null
          property_type?: string | null
          property_size?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          base_price?: number | null
          extras?: Json
          extras_cost?: number
          distance_fee?: number
          total_price: number
          special_requests?: string | null
          internal_notes?: string | null
          created_at?: string
          updated_at?: string
          confirmed_at?: string | null
          completed_at?: string | null
          cancelled_at?: string | null
        }
        Update: {
          id?: string
          booking_number?: string
          customer_id?: string | null
          service_id?: string | null
          status?: string
          booking_date?: string
          time_slot?: string
          team_number?: number | null
          service_type?: string
          frequency?: string | null
          property_type?: string | null
          property_size?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          base_price?: number | null
          extras?: Json
          extras_cost?: number
          distance_fee?: number
          total_price?: number
          special_requests?: string | null
          internal_notes?: string | null
          created_at?: string
          updated_at?: string
          confirmed_at?: string | null
          completed_at?: string | null
          cancelled_at?: string | null
        }
      }
      availability: {
        Row: {
          id: string
          date: string
          time_slot: string
          team_number: number
          is_available: boolean
          booking_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          time_slot: string
          team_number: number
          is_available?: boolean
          booking_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          time_slot?: string
          team_number?: number
          is_available?: boolean
          booking_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      pricing_rules: {
        Row: {
          id: string
          rule_type: string
          service_id: string | null
          conditions: Json
          adjustment_type: string | null
          adjustment_value: number | null
          priority: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          rule_type: string
          service_id?: string | null
          conditions: Json
          adjustment_type?: string | null
          adjustment_value?: number | null
          priority?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          rule_type?: string
          service_id?: string | null
          conditions?: Json
          adjustment_type?: string | null
          adjustment_value?: number | null
          priority?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          booking_id: string | null
          customer_id: string | null
          rating: number | null
          comment: string | null
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id?: string | null
          customer_id?: string | null
          rating?: number | null
          comment?: string | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string | null
          customer_id?: string | null
          rating?: number | null
          comment?: string | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      inquiries: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          message: string
          inquiry_type: string | null
          status: string
          source: string | null
          created_at: string
          responded_at: string | null
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          message: string
          inquiry_type?: string | null
          status?: string
          source?: string | null
          created_at?: string
          responded_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          message?: string
          inquiry_type?: string | null
          status?: string
          source?: string | null
          created_at?: string
          responded_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_price: {
        Args: {
          p_service_id: string
          p_property_size?: number
          p_extras?: Json
        }
        Returns: {
          base_price: number
          extras_cost: number
          total_price: number
        }[]
      }
      check_availability: {
        Args: {
          p_date: string
          p_time_slot: string
        }
        Returns: {
          team_number: number
          is_available: boolean
        }[]
      }
      generate_booking_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_available_slots: {
        Args: {
          p_date: string
        }
        Returns: {
          time_slot: string
          available_teams: number
        }[]
      }
      get_next_available_slot: {
        Args: {
          p_service_id?: string
        }
        Returns: {
          date: string
          time_slot: string
          team_number: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}