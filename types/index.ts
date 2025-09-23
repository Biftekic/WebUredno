export type ServiceType =
  | 'regular_cleaning'
  | 'deep_cleaning'
  | 'move_in_out'
  | 'post_construction'
  | 'office_cleaning'
  | 'window_cleaning';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  icon?: string;
}

export interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceType: ServiceType;
  date: Date;
  time: string;
  duration: number;
  address: string;
  notes?: string;
  status: BookingStatus;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface ContactForm {
  name: string;
  email: string;
  phone: string;
  message: string;
}