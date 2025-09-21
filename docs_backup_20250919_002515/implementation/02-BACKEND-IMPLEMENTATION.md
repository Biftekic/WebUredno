# WebUredno Backend Implementation Guide

## Table of Contents

1. [API Architecture](#1-api-architecture)
2. [Data Models](#2-data-models)
3. [Business Logic Implementation](#3-business-logic-implementation)
4. [Integration Points](#4-integration-points)
5. [Security Implementation](#5-security-implementation)

---

## 1. API Architecture

### 1.1 RESTful Endpoint Design

#### Booking API Structure
```typescript
// Base URL: https://weburedno.hr/api

// Booking Endpoints
POST   /api/booking                 // Create new booking
GET    /api/booking/availability    // Check available time slots
POST   /api/booking/validate        // Validate booking data
GET    /api/booking/quote           // Get price quote

// Contact Endpoints
POST   /api/contact                 // Submit contact form
POST   /api/newsletter              // Newsletter subscription
DELETE /api/newsletter              // Unsubscribe

// Utility Endpoints
GET    /api/services                // List all services
GET    /api/pricing                 // Get pricing structure
POST   /api/pricing/calculate       // Calculate custom price
```

### 1.2 Request/Response Patterns

#### Standard Request Headers
```typescript
interface RequestHeaders {
  'Content-Type': 'application/json';
  'X-Request-ID': string;           // Unique request identifier
  'X-Client-Version': string;       // Client app version
  'Accept-Language': 'hr' | 'en';   // Preferred language
}
```

#### Standard Response Structure
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    message_en?: string;
    details?: ValidationError[];
    timestamp: string;
  };
  metadata: {
    requestId: string;
    processingTime: number;
    version: string;
  };
}

interface ValidationError {
  field: string;
  code: string;
  message: string;
}
```

### 1.3 Error Handling Standards

#### Error Response Format
```typescript
class ApiError {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number,
    public details?: any
  ) {}

  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
        timestamp: new Date().toISOString()
      }
    };
  }
}
```

#### Error Codes Dictionary
```typescript
const ERROR_CODES = {
  // Validation Errors (400)
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_DATE_TIME: 'INVALID_DATE_TIME',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_PHONE: 'INVALID_PHONE',

  // Business Logic Errors (422)
  SLOT_NOT_AVAILABLE: 'SLOT_NOT_AVAILABLE',
  PRICE_MISMATCH: 'PRICE_MISMATCH',
  SERVICE_NOT_AVAILABLE: 'SERVICE_NOT_AVAILABLE',
  OUTSIDE_SERVICE_AREA: 'OUTSIDE_SERVICE_AREA',
  MINIMUM_NOTICE_REQUIRED: 'MINIMUM_NOTICE_REQUIRED',

  // Rate Limiting (429)
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Server Errors (500)
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  CALENDAR_SYNC_FAILED: 'CALENDAR_SYNC_FAILED',
  EMAIL_SEND_FAILED: 'EMAIL_SEND_FAILED'
};
```

### 1.4 Status Codes Usage

```typescript
const HTTP_STATUS = {
  // Success
  OK: 200,                    // GET requests
  CREATED: 201,               // POST creating resource
  ACCEPTED: 202,              // Async processing
  NO_CONTENT: 204,            // DELETE success

  // Client Errors
  BAD_REQUEST: 400,           // Invalid syntax
  UNAUTHORIZED: 401,          // Auth required
  FORBIDDEN: 403,             // No permission
  NOT_FOUND: 404,             // Resource not found
  METHOD_NOT_ALLOWED: 405,    // Wrong HTTP method
  CONFLICT: 409,              // Resource conflict
  UNPROCESSABLE_ENTITY: 422,  // Business logic error
  TOO_MANY_REQUESTS: 429,     // Rate limited

  // Server Errors
  INTERNAL_SERVER_ERROR: 500, // Generic server error
};
```

## 1.5 Recently Implemented API Endpoints (Phase 1 Complete)

### Booking Management API
**Location**: `src/app/api/bookings/route.ts`  
**Status**: ✅ Fully Implemented

#### GET /api/bookings - List bookings with filters
```typescript
// Query Parameters:
?date=2024-01-15        // Filter by date
?status=confirmed       // Filter by status  
?customerId=xxx         // Filter by customer

// Response:
{
  bookings: [
    {
      id: '1',
      bookingNumber: 'WU240115-0001',
      serviceType: 'standard',
      scheduledDate: '2024-01-15T10:00:00Z',
      status: 'confirmed',
      customer: { firstName: 'Ana', lastName: 'Marić' },
      price: { finalPrice: 60 }
    }
  ],
  total: 1
}
```

#### POST /api/bookings - Create new booking
```typescript
// Request Body:
{
  serviceType: 'standard',
  propertySize: 80,
  numberOfRooms: 3,
  scheduledDate: '2024-01-15T10:00:00Z',
  frequency: 'weekly',
  customer: {
    firstName: 'Ana',
    lastName: 'Marić',
    email: 'ana@example.com',
    phone: '+38591234567',  // Croatian +385 validation
    address: {
      street: 'Ilica 1',
      city: 'Zagreb',
      postalCode: '10000'
    }
  }
}

// Response:
{
  success: true,
  booking: {
    bookingNumber: 'WU240115-0001',
    pricing: {
      basePrice: 90,
      discount: 13.50,
      finalPrice: 76.50,
      teamSize: 2,
      estimatedDuration: 3
    },
    status: 'pending'
  }
}
```

### Availability Checking API
**Location**: `src/app/api/availability/route.ts`  
**Status**: ✅ Fully Implemented

```typescript
// GET /api/availability
?date=2024-01-15&serviceType=standard&duration=3

// Response:
{
  date: '2024-01-15',
  available: true,
  slots: [
    { time: '08:00', available: true, teamSize: 3 },
    { time: '09:00', available: true, teamSize: 2 },
    { time: '10:00', available: false }
  ],
  businessHours: { start: '08:00', end: '20:00' }
}

// Croatian Business Hours:
Monday-Friday: 08:00-20:00
Saturday: 09:00-18:00  
Sunday: 10:00-16:00

// Croatian Holidays (auto-blocked):
- Nova godina (Jan 1)
- Sveta tri kralja (Jan 6)
- Uskrs (Easter Monday)
- Praznik rada (May 1)
- Dan državnosti (May 30)
- Velika Gospa (Aug 15)
- Božić (Dec 25-26)
```

### Dynamic Pricing API
**Location**: `src/app/api/pricing/route.ts`  
**Status**: ✅ Fully Implemented

```typescript
// GET /api/pricing
?serviceType=standard&propertySize=100&frequency=weekly

// Response:
{
  service: {
    type: 'standard',
    name: 'Standardno čišćenje',
    qualityPoints: 60
  },
  calculation: {
    baseHours: 3,
    teamSize: 2,
    hourlyRate: 15,
    basePrice: 90,
    frequencyDiscount: 0.15,
    discountAmount: 13.50,
    finalPrice: 76.50
  },
  summary: {
    estimatedDuration: '3-4 sati',
    savingsPerMonth: 54
  }
}
  SERVICE_UNAVAILABLE: 503,   // Maintenance mode
  GATEWAY_TIMEOUT: 504        // External service timeout
};
```

---

## 2. Data Models

### 2.1 Booking Data Structure

```typescript
interface Booking {
  // Identifiers
  id: string;                      // BK-{timestamp}-{random}
  bookingNumber: string;           // Human-readable: 2024-0001

  // Customer Information
  customer: {
    id?: string;
    name: string;
    email: string;
    phone: string;
    preferredLanguage: 'hr' | 'en';
    marketingConsent: boolean;
    gdprConsent: boolean;
    consentTimestamp: Date;
  };

  // Service Details
  service: {
    type: ServiceType;
    addons: ServiceAddon[];
    specialInstructions?: string;
    urgencyLevel: 'normal' | 'urgent' | 'flexible';
  };

  // Property Information
  property: {
    address: string;
    city: string;
    postalCode: string;
    floor?: number;
    hasElevator?: boolean;
    parkingInstructions?: string;
    accessInstructions?: string;
    propertyType: 'apartment' | 'house' | 'office' | 'other';
    size: number;                 // m²
    bedrooms: number;
    bathrooms: number;
  };

  // Scheduling
  schedule: {
    date: Date;
    timeSlot: string;              // "09:00-11:00"
    estimatedDuration: number;    // minutes
    frequency: FrequencyType;
    recurringDetails?: {
      startDate: Date;
      endDate?: Date;
      skipDates?: Date[];
      preferredDay?: number;       // 0-6 (Sunday-Saturday)
      preferredTime?: string;
    };
  };

  // Pricing
  pricing: {
    basePrice: number;
    addonCharges: number;
    frequencyDiscount: number;
    discountPercentage: number;
    subtotal: number;
    tax: number;
    finalPrice: number;
    currency: 'EUR';
    paymentStatus: 'pending' | 'paid' | 'refunded';
    paymentMethod?: 'cash' | 'transfer' | 'card';
  };

  // Team Assignment
  team: {
    size: number;
    assignedTeam?: string;
    assignedMembers?: string[];
    vehicleRequired: boolean;
    equipmentNotes?: string;
  };

  // Status Tracking
  status: {
    current: BookingStatus;
    history: StatusHistory[];
    cancellationReason?: string;
    rescheduledFrom?: string;     // Previous booking ID
  };

  // Integration References
  external: {
    calendarEventId?: string;
    invoiceId?: string;
    paymentId?: string;
    emailThreadId?: string;
  };

  // Metadata
  metadata: {
    source: 'website' | 'phone' | 'email' | 'partner';
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
    utmParams?: Record<string, string>;
    createdAt: Date;
    updatedAt: Date;
    version: number;
  };
}

type BookingStatus =
  | 'draft'
  | 'pending_confirmation'
  | 'confirmed'
  | 'reminder_sent'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rescheduled'
  | 'no_show';

interface StatusHistory {
  status: BookingStatus;
  timestamp: Date;
  changedBy: 'system' | 'customer' | 'admin';
  reason?: string;
}
```

### 2.2 Customer Information Model

```typescript
interface Customer {
  id: string;

  // Personal Information
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    emailVerified: boolean;
    phone: string;
    phoneVerified: boolean;
    alternatePhone?: string;
    preferredContactMethod: 'email' | 'phone' | 'whatsapp';
    language: 'hr' | 'en';
  };

  // Addresses
  addresses: Address[];
  defaultAddressId?: string;

  // Service Preferences
  preferences: {
    preferredDay?: number;
    preferredTimeSlots?: string[];
    preferredTeam?: string;
    specialRequirements?: string;
    petFriendly?: boolean;
    ecoFriendly?: boolean;
    allergies?: string[];
  };

  // Billing
  billing: {
    companyName?: string;
    vatNumber?: string;
    billingAddress?: Address;
    preferredPaymentMethod?: PaymentMethod;
    invoiceEmail?: string;
  };

  // Subscription Status
  subscription: {
    isSubscribed: boolean;
    frequency?: FrequencyType;
    nextService?: Date;
    discount?: number;
    loyaltyPoints?: number;
    tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  };

  // Communication
  communication: {
    marketingConsent: boolean;
    marketingConsentDate?: Date;
    smsConsent: boolean;
    newsletterSubscribed: boolean;
    unsubscribeToken?: string;
    communicationHistory: CommunicationLog[];
  };

  // Statistics
  statistics: {
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    totalSpent: number;
    averageRating?: number;
    lastServiceDate?: Date;
    customerSince: Date;
    lifetimeValue: number;
  };

  // Metadata
  metadata: {
    source: 'organic' | 'referral' | 'advertising' | 'partner';
    referralCode?: string;
    referredBy?: string;
    tags?: string[];
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

interface Address {
  id: string;
  label?: string;                  // "Dom", "Ured", etc.
  street: string;
  houseNumber: string;
  apartment?: string;
  city: string;
  postalCode: string;
  county?: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  instructions?: string;
  isDefault: boolean;
}
```

### 2.3 Service Definitions

```typescript
interface ServiceDefinition {
  id: string;
  code: ServiceType;

  // Basic Information
  name: {
    hr: string;
    en: string;
  };

  description: {
    hr: string;
    en: string;
  };

  category: 'regular' | 'deep' | 'special';

  // Pricing
  pricing: {
    baseRate: number;              // EUR per hour
    minimumCharge: number;          // EUR
    minimumHours: number;
    estimatedHours: {
      small: number;                // <100m²
      medium: number;               // 100-200m²
      large: number;                // >200m²
    };
  };

  // What's Included
  includedTasks: ServiceTask[];
  excludedTasks?: string[];
  requiredEquipment: string[];
  providedMaterials: string[];

  // Scheduling
  scheduling: {
    availableDays: number[];       // 0-6
    availableHours: {
      start: string;                // "08:00"
      end: string;                  // "18:00"
    };
    minimumNotice: number;          // hours
    bufferTime: number;             // minutes between bookings
    maxDuration: number;            // hours
  };

  // Constraints
  constraints: {
    minPropertySize?: number;
    maxPropertySize?: number;
    serviceAreas: string[];         // postal codes
    requiresInspection?: boolean;
    notAvailableWith?: ServiceType[];
  };

  // Add-ons
  availableAddons: ServiceAddon[];

  // Metadata
  isActive: boolean;
  isPromoted: boolean;
  popularityScore: number;
  averageRating: number;
  completedCount: number;
  tags: string[];
}

interface ServiceTask {
  id: string;
  name: { hr: string; en: string; };
  estimatedMinutes: number;
  isRequired: boolean;
  order: number;
}

interface ServiceAddon {
  code: string;
  name: { hr: string; en: string; };
  price: number;
  estimatedMinutes: number;
  requiresEquipment?: string[];
  maxQuantity?: number;
}
```

### 2.4 Pricing Calculations

```typescript
interface PricingCalculation {
  // Input Parameters
  input: {
    serviceType: ServiceType;
    propertySize: number;
    bedrooms: number;
    bathrooms: number;
    frequency: FrequencyType;
    addons: string[];
    date: Date;
    urgency?: 'normal' | 'urgent';
    promoCode?: string;
  };

  // Calculation Steps
  calculation: {
    // Step 1: Base Calculation
    baseHours: number;
    sizeAdjustment: number;
    roomAdjustment: number;
    totalHours: number;

    // Step 2: Team Size
    teamSize: number;
    teamMultiplier: number;

    // Step 3: Base Price
    hourlyRate: number;
    basePrice: number;

    // Step 4: Add-ons
    addonDetails: Array<{
      code: string;
      name: string;
      price: number;
      hours: number;
    }>;
    addonTotal: number;

    // Step 5: Discounts
    frequencyDiscount: {
      percentage: number;
      amount: number;
    };
    promoDiscount?: {
      code: string;
      percentage: number;
      amount: number;
    };

    // Step 6: Urgency Surcharge
    urgencySurcharge?: {
      percentage: number;
      amount: number;
    };

    // Step 7: Final Price
    subtotal: number;
    totalDiscount: number;
    tax: number;
    finalPrice: number;
  };

  // Output
  result: {
    price: number;
    estimatedHours: number;
    teamSize: number;
    savings: number;
    validUntil: Date;
    bookingUrl: string;
  };

  // Metadata
  metadata: {
    calculatedAt: Date;
    version: string;
    currency: 'EUR';
    exchangeRate?: number;
  };
}
```

---

## 3. Business Logic Implementation

### 3.1 Booking Workflow Logic

```typescript
class BookingWorkflow {
  // Step 1: Validate Availability
  async validateAvailability(
    date: Date,
    timeSlot: string,
    duration: number
  ): Promise<AvailabilityResult> {
    // Check business hours
    if (!this.isWithinBusinessHours(date, timeSlot)) {
      throw new BusinessError('OUTSIDE_BUSINESS_HOURS');
    }

    // Check minimum notice period (48 hours)
    const minimumNoticeHours = 48;
    const hoursUntilService = this.calculateHoursUntil(date);
    if (hoursUntilService < minimumNoticeHours) {
      throw new BusinessError('MINIMUM_NOTICE_REQUIRED', {
        required: minimumNoticeHours,
        provided: hoursUntilService
      });
    }

    // Check calendar availability
    const isAvailable = await this.checkCalendarAvailability(
      date,
      timeSlot,
      duration
    );

    if (!isAvailable) {
      const alternatives = await this.findAlternativeSlots(
        date,
        duration
      );

      return {
        available: false,
        reason: 'SLOT_OCCUPIED',
        alternatives
      };
    }

    // Check team availability
    const availableTeams = await this.checkTeamAvailability(
      date,
      timeSlot,
      duration
    );

    if (availableTeams.length === 0) {
      throw new BusinessError('NO_TEAM_AVAILABLE');
    }

    return {
      available: true,
      teams: availableTeams,
      confirmBy: new Date(Date.now() + 30 * 60 * 1000) // 30 min hold
    };
  }

  // Step 2: Create Booking
  async createBooking(data: BookingRequest): Promise<Booking> {
    const booking = await this.db.transaction(async (trx) => {
      // Generate booking ID
      const bookingId = this.generateBookingId();

      // Calculate pricing
      const pricing = await this.calculatePricing(data);

      // Verify price match (prevent manipulation)
      if (Math.abs(pricing.finalPrice - data.pricing.finalPrice) > 0.01) {
        throw new BusinessError('PRICE_MISMATCH');
      }

      // Create customer record if new
      const customer = await this.findOrCreateCustomer(data.customer, trx);

      // Create booking record
      const booking = await trx('bookings').insert({
        id: bookingId,
        customerId: customer.id,
        ...this.mapToBookingRecord(data, pricing),
        status: 'pending_confirmation',
        createdAt: new Date()
      });

      // Reserve calendar slot
      const calendarEventId = await this.reserveCalendarSlot(
        booking,
        'tentative'
      );

      // Update booking with calendar reference
      await trx('bookings')
        .where({ id: bookingId })
        .update({ calendarEventId });

      return booking;
    });

    // Send confirmation email (async, don't wait)
    this.sendBookingConfirmation(booking).catch(this.handleEmailError);

    // Schedule reminder
    this.scheduleReminder(booking);

    return booking;
  }

  // Step 3: Confirm Booking
  async confirmBooking(bookingId: string): Promise<void> {
    const booking = await this.db('bookings')
      .where({ id: bookingId })
      .first();

    if (!booking) {
      throw new BusinessError('BOOKING_NOT_FOUND');
    }

    if (booking.status !== 'pending_confirmation') {
      throw new BusinessError('INVALID_BOOKING_STATUS');
    }

    await this.db.transaction(async (trx) => {
      // Update booking status
      await trx('bookings')
        .where({ id: bookingId })
        .update({
          status: 'confirmed',
          confirmedAt: new Date()
        });

      // Confirm calendar event
      await this.updateCalendarEvent(
        booking.calendarEventId,
        'confirmed'
      );

      // Assign team
      const team = await this.assignTeam(booking, trx);

      await trx('bookings')
        .where({ id: bookingId })
        .update({
          assignedTeamId: team.id,
          assignedMembers: team.members
        });
    });

    // Send confirmation to team
    await this.notifyTeam(booking);
  }

  // Step 4: Handle Cancellation
  async cancelBooking(
    bookingId: string,
    reason: string,
    cancelledBy: 'customer' | 'admin' | 'system'
  ): Promise<void> {
    const booking = await this.db('bookings')
      .where({ id: bookingId })
      .first();

    if (!booking) {
      throw new BusinessError('BOOKING_NOT_FOUND');
    }

    // Check cancellation policy
    const hoursUntilService = this.calculateHoursUntil(booking.date);
    const cancellationFee = this.calculateCancellationFee(
      booking,
      hoursUntilService
    );

    await this.db.transaction(async (trx) => {
      // Update booking status
      await trx('bookings')
        .where({ id: bookingId })
        .update({
          status: 'cancelled',
          cancellationReason: reason,
          cancelledBy,
          cancelledAt: new Date(),
          cancellationFee
        });

      // Remove calendar event
      if (booking.calendarEventId) {
        await this.deleteCalendarEvent(booking.calendarEventId);
      }

      // Release team assignment
      await this.releaseTeamAssignment(booking.id, trx);

      // Process refund if paid
      if (booking.paymentStatus === 'paid' && cancellationFee < booking.finalPrice) {
        await this.processRefund(
          booking,
          booking.finalPrice - cancellationFee
        );
      }
    });

    // Send cancellation confirmation
    await this.sendCancellationConfirmation(booking, reason);
  }
}
```

### 3.2 Pricing Engine Details

```typescript
class PricingEngine {
  private readonly config = {
    baseRates: {
      standardno: 25,      // EUR/hour
      dubinsko: 30,
      useljenje: 35,
      iseljenje: 35,
      'poslije-radova': 40
    },

    minimumCharge: 45,     // EUR

    frequencyDiscounts: {
      jednokratno: 0,
      tjedno: 0.20,        // 20% discount
      dvotjedno: 0.15,     // 15% discount
      mjesecno: 0.10       // 10% discount
    },

    addonPrices: {
      prozori: { price: 15, hours: 0.75 },
      pegla: { price: 20, hours: 1.5 },
      frizider: { price: 10, hours: 0.5 },
      pecnica: { price: 15, hours: 0.75 },
      ormari: { price: 10, hours: 0.5 },
      balkon: { price: 10, hours: 0.5 }
    },

    urgencySurcharge: 0.25,  // 25% for same/next day
    weekendSurcharge: 0.15   // 15% for weekends
  };

  calculatePrice(request: PricingRequest): PricingResult {
    // Step 1: Calculate base hours
    const baseHours = this.calculateBaseHours(request.serviceType);

    // Step 2: Apply size adjustments
    const sizeHours = this.calculateSizeAdjustment(request.propertySize);

    // Step 3: Apply room adjustments
    const roomHours = this.calculateRoomAdjustment(
      request.bedrooms,
      request.bathrooms
    );

    // Step 4: Calculate total hours
    let totalHours = baseHours + sizeHours + roomHours;

    // Step 5: Add addon hours
    const addonDetails = this.calculateAddons(request.addons);
    totalHours += addonDetails.totalHours;

    // Step 6: Determine team size
    const teamSize = this.calculateTeamSize(
      request.propertySize,
      request.serviceType
    );

    // Step 7: Calculate base price
    const hourlyRate = this.config.baseRates[request.serviceType];
    let basePrice = totalHours * hourlyRate * teamSize;

    // Step 8: Add addon prices
    basePrice += addonDetails.totalPrice;

    // Step 9: Apply frequency discount
    const frequencyDiscount = this.config.frequencyDiscounts[request.frequency];
    const discountAmount = basePrice * frequencyDiscount;
    let finalPrice = basePrice - discountAmount;

    // Step 10: Apply surcharges if applicable
    if (this.isUrgentBooking(request.date)) {
      finalPrice *= (1 + this.config.urgencySurcharge);
    }

    if (this.isWeekend(request.date)) {
      finalPrice *= (1 + this.config.weekendSurcharge);
    }

    // Step 11: Ensure minimum charge
    finalPrice = Math.max(finalPrice, this.config.minimumCharge);

    // Step 12: Round to nearest euro
    finalPrice = Math.round(finalPrice);

    return {
      basePrice,
      discountAmount,
      discountPercentage: frequencyDiscount * 100,
      finalPrice,
      estimatedHours: totalHours,
      teamSize,
      breakdown: {
        serviceHours: baseHours + sizeHours + roomHours,
        addonHours: addonDetails.totalHours,
        addonCharges: addonDetails.totalPrice,
        surcharges: finalPrice - (basePrice - discountAmount)
      }
    };
  }

  private calculateBaseHours(serviceType: ServiceType): number {
    const baseHours = {
      standardno: 2,
      dubinsko: 3,
      useljenje: 4,
      iseljenje: 4,
      'poslije-radova': 5
    };

    return baseHours[serviceType] || 2;
  }

  private calculateSizeAdjustment(size: number): number {
    // Add 0.5 hours per 100m²
    return (size / 100) * 0.5;
  }

  private calculateRoomAdjustment(bedrooms: number, bathrooms: number): number {
    // Add 0.25 hours per bedroom over 2
    const bedroomAdjustment = Math.max(0, (bedrooms - 2) * 0.25);

    // Add 0.25 hours per bathroom over 1
    const bathroomAdjustment = Math.max(0, (bathrooms - 1) * 0.25);

    return bedroomAdjustment + bathroomAdjustment;
  }

  private calculateTeamSize(size: number, serviceType: ServiceType): number {
    // Special services always require 2+ people
    if (['dubinsko', 'poslije-radova'].includes(serviceType)) {
      return size > 150 ? 3 : 2;
    }

    // Standard calculation based on size
    if (size < 100) return 1;
    if (size < 200) return 2;
    return 3;
  }
}
```

### 3.3 Team Size Calculations

```typescript
class TeamAssignment {
  calculateOptimalTeamSize(booking: Booking): TeamRequirement {
    const factors = {
      size: this.getSizeFactor(booking.property.size),
      service: this.getServiceFactor(booking.service.type),
      urgency: this.getUrgencyFactor(booking.schedule.date),
      complexity: this.getComplexityFactor(booking)
    };

    // Base calculation
    let teamSize = Math.ceil(
      factors.size * factors.service * factors.urgency * factors.complexity
    );

    // Apply constraints
    teamSize = Math.max(1, Math.min(teamSize, 4));

    // Special cases
    if (booking.property.size > 300) {
      teamSize = Math.max(teamSize, 3);
    }

    if (booking.service.type === 'poslije-radova') {
      teamSize = Math.max(teamSize, 2);
    }

    return {
      size: teamSize,
      reasoning: this.generateReasoning(factors),
      estimatedCompletion: this.estimateCompletionTime(booking, teamSize),
      requiredSkills: this.determineRequiredSkills(booking)
    };
  }

  private getSizeFactor(size: number): number {
    if (size < 50) return 0.5;
    if (size < 100) return 1.0;
    if (size < 150) return 1.5;
    if (size < 200) return 2.0;
    if (size < 300) return 2.5;
    return 3.0;
  }

  private getServiceFactor(type: ServiceType): number {
    const factors = {
      standardno: 1.0,
      dubinsko: 1.5,
      useljenje: 1.3,
      iseljenje: 1.3,
      'poslije-radova': 2.0
    };

    return factors[type] || 1.0;
  }
}
```

### 3.4 Availability Management

```typescript
class AvailabilityManager {
  private readonly workingHours = {
    monday: { start: '08:00', end: '18:00' },
    tuesday: { start: '08:00', end: '18:00' },
    wednesday: { start: '08:00', end: '18:00' },
    thursday: { start: '08:00', end: '18:00' },
    friday: { start: '08:00', end: '18:00' },
    saturday: { start: '09:00', end: '14:00' },
    sunday: null // Closed
  };

  async getAvailableSlots(
    date: Date,
    duration: number,
    serviceType: ServiceType
  ): Promise<TimeSlot[]> {
    const dayOfWeek = this.getDayName(date);
    const workingHour = this.workingHours[dayOfWeek];

    if (!workingHour) {
      return []; // Closed on this day
    }

    // Get all bookings for this date
    const existingBookings = await this.getBookingsForDate(date);

    // Get team availability
    const availableTeams = await this.getAvailableTeams(date);

    // Generate possible time slots
    const slots = this.generateTimeSlots(
      workingHour.start,
      workingHour.end,
      duration
    );

    // Filter out occupied slots
    const availableSlots = slots.filter(slot => {
      return this.isSlotAvailable(
        slot,
        existingBookings,
        availableTeams,
        duration
      );
    });

    return availableSlots.map(slot => ({
      start: slot.start,
      end: slot.end,
      available: true,
      teams: this.getTeamsForSlot(slot, availableTeams)
    }));
  }

  private generateTimeSlots(
    startTime: string,
    endTime: string,
    duration: number
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const start = this.parseTime(startTime);
    const end = this.parseTime(endTime);
    const slotDuration = Math.ceil(duration / 60) * 60; // Round up to hour

    let current = start;
    while (current + slotDuration <= end) {
      slots.push({
        start: this.formatTime(current),
        end: this.formatTime(current + slotDuration)
      });
      current += 30; // 30-minute increments
    }

    return slots;
  }

  private isSlotAvailable(
    slot: TimeSlot,
    bookings: Booking[],
    teams: Team[],
    duration: number
  ): boolean {
    // Check for conflicts with existing bookings
    const hasConflict = bookings.some(booking => {
      return this.timeSlotsOverlap(slot, booking.timeSlot);
    });

    if (hasConflict) return false;

    // Check if we have enough teams available
    const requiredTeamSize = this.estimateTeamSize(duration);
    const availableTeamCount = teams.filter(team =>
      team.isAvailableAt(slot)
    ).length;

    return availableTeamCount >= requiredTeamSize;
  }
}
```

---

## 4. Integration Points

### 4.1 Google Calendar Integration Details

```typescript
class GoogleCalendarService {
  private calendar: calendar_v3.Calendar;
  private auth: JWT;

  constructor() {
    this.auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/calendar']
    });

    this.calendar = google.calendar({ version: 'v3', auth: this.auth });
  }

  async createBookingEvent(booking: Booking): Promise<string> {
    const event: calendar_v3.Schema$Event = {
      summary: this.generateEventTitle(booking),
      description: this.generateEventDescription(booking),
      location: this.formatAddress(booking.property),

      start: {
        dateTime: booking.schedule.date.toISOString(),
        timeZone: 'Europe/Zagreb'
      },

      end: {
        dateTime: this.calculateEndTime(
          booking.schedule.date,
          booking.schedule.estimatedDuration
        ).toISOString(),
        timeZone: 'Europe/Zagreb'
      },

      attendees: [
        {
          email: booking.customer.email,
          displayName: booking.customer.name,
          responseStatus: 'accepted'
        }
      ],

      colorId: this.getEventColor(booking.status.current),

      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 24 hours before
          { method: 'popup', minutes: 60 }        // 1 hour before
        ]
      },

      extendedProperties: {
        private: {
          bookingId: booking.id,
          serviceType: booking.service.type,
          teamSize: String(booking.team.size),
          price: String(booking.pricing.finalPrice),
          paymentStatus: booking.pricing.paymentStatus
        }
      }
    };

    try {
      const response = await this.calendar.events.insert({
        calendarId: process.env.GOOGLE_CALENDAR_ID,
        requestBody: event,
        sendUpdates: 'all'
      });

      return response.data.id!;
    } catch (error) {
      throw new IntegrationError('CALENDAR_CREATE_FAILED', error);
    }
  }

  async checkAvailability(
    date: Date,
    duration: number
  ): Promise<boolean> {
    const timeMin = date.toISOString();
    const timeMax = new Date(
      date.getTime() + duration * 60 * 1000
    ).toISOString();

    try {
      const response = await this.calendar.freebusy.query({
        requestBody: {
          timeMin,
          timeMax,
          timeZone: 'Europe/Zagreb',
          items: [{ id: process.env.GOOGLE_CALENDAR_ID }]
        }
      });

      const busy = response.data.calendars![
        process.env.GOOGLE_CALENDAR_ID!
      ].busy || [];

      return busy.length === 0;
    } catch (error) {
      throw new IntegrationError('CALENDAR_CHECK_FAILED', error);
    }
  }

  private generateEventTitle(booking: Booking): string {
    const statusEmoji = {
      pending_confirmation: '⏳',
      confirmed: '✅',
      in_progress: '🧹',
      completed: '✓'
    };

    const emoji = statusEmoji[booking.status.current] || '📅';
    const serviceLabel = this.getServiceLabel(booking.service.type);

    return `${emoji} ${serviceLabel} - ${booking.customer.name}`;
  }

  private generateEventDescription(booking: Booking): string {
    const lines = [
      `📍 Adresa: ${booking.property.address}, ${booking.property.city}`,
      `📞 Telefon: ${booking.customer.phone}`,
      `📧 Email: ${booking.customer.email}`,
      '',
      `🏠 Veličina: ${booking.property.size}m²`,
      `🛏️ Spavaće sobe: ${booking.property.bedrooms}`,
      `🚿 Kupaonice: ${booking.property.bathrooms}`,
      '',
      `👥 Tim: ${booking.team.size} ${booking.team.size === 1 ? 'osoba' : 'osobe'}`,
      `⏱️ Procijenjeno trajanje: ${booking.schedule.estimatedDuration / 60}h`,
      `💰 Cijena: €${booking.pricing.finalPrice}`,
      `💳 Status plaćanja: ${this.getPaymentStatusLabel(booking.pricing.paymentStatus)}`
    ];

    if (booking.service.addons.length > 0) {
      lines.push('', '➕ Dodatne usluge:');
      booking.service.addons.forEach(addon => {
        lines.push(`  • ${this.getAddonLabel(addon)}`);
      });
    }

    if (booking.service.specialInstructions) {
      lines.push('', `📝 Posebne napomene: ${booking.service.specialInstructions}`);
    }

    if (booking.property.accessInstructions) {
      lines.push('', `🔑 Pristup: ${booking.property.accessInstructions}`);
    }

    return lines.join('\n');
  }

  private getEventColor(status: BookingStatus): string {
    const colors = {
      pending_confirmation: '8',  // Gray
      confirmed: '2',             // Green
      in_progress: '5',          // Yellow
      completed: '10',           // Green
      cancelled: '11',           // Red
      rescheduled: '6'          // Orange
    };

    return colors[status] || '7'; // Default: Blue
  }
}
```

### 4.2 Email Service Implementation

```typescript
class EmailService {
  private transporter: Transporter;

  constructor() {
    // Using Resend/SendGrid/SMTP
    this.transporter = this.initializeTransporter();
  }

  async sendBookingConfirmation(booking: Booking): Promise<void> {
    const template = this.loadTemplate('booking-confirmation');

    const html = this.renderTemplate(template, {
      customerName: booking.customer.name,
      bookingId: booking.bookingNumber,
      serviceName: this.getServiceName(booking.service.type),
      date: this.formatDate(booking.schedule.date),
      time: booking.schedule.timeSlot,
      address: this.formatAddress(booking.property),
      price: booking.pricing.finalPrice,
      teamSize: booking.team.size,
      estimatedDuration: booking.schedule.estimatedDuration / 60,
      addons: booking.service.addons.map(a => this.getAddonName(a)),
      specialInstructions: booking.service.specialInstructions,
      cancellationPolicy: this.getCancellationPolicy(),
      contactPhone: '+385 99 123 4567',
      contactEmail: 'info@weburedno.hr'
    });

    const mailOptions = {
      from: {
        name: 'WebUredno',
        address: 'noreply@weburedno.hr'
      },
      to: booking.customer.email,
      subject: `Potvrda rezervacije #${booking.bookingNumber} - WebUredno`,
      html,
      text: this.htmlToText(html),
      headers: {
        'X-Booking-ID': booking.id,
        'X-Entity-Type': 'booking-confirmation'
      },
      attachments: [
        {
          filename: `rezervacija-${booking.bookingNumber}.ics`,
          content: this.generateICSFile(booking)
        }
      ]
    };

    try {
      await this.transporter.sendMail(mailOptions);

      // Log email sent
      await this.logEmailSent({
        bookingId: booking.id,
        emailType: 'booking-confirmation',
        recipient: booking.customer.email,
        sentAt: new Date()
      });
    } catch (error) {
      throw new IntegrationError('EMAIL_SEND_FAILED', error);
    }
  }

  async sendAdminNotification(booking: Booking): Promise<void> {
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];

    const html = this.renderTemplate('admin-notification', {
      bookingId: booking.id,
      customerName: booking.customer.name,
      customerPhone: booking.customer.phone,
      customerEmail: booking.customer.email,
      service: booking.service,
      property: booking.property,
      schedule: booking.schedule,
      pricing: booking.pricing,
      dashboardUrl: `${process.env.ADMIN_URL}/bookings/${booking.id}`
    });

    await Promise.all(adminEmails.map(email =>
      this.transporter.sendMail({
        from: 'system@weburedno.hr',
        to: email,
        subject: `🆕 Nova rezervacija - ${booking.customer.name}`,
        html,
        priority: 'high'
      })
    ));
  }

  async sendReminder(booking: Booking): Promise<void> {
    const template = this.loadTemplate('service-reminder');

    const html = this.renderTemplate(template, {
      customerName: booking.customer.name,
      serviceName: this.getServiceName(booking.service.type),
      tomorrow: this.isTomorrow(booking.schedule.date),
      date: this.formatDate(booking.schedule.date),
      time: booking.schedule.timeSlot,
      address: this.formatAddress(booking.property),
      teamSize: booking.team.size,
      estimatedDuration: booking.schedule.estimatedDuration / 60,
      preparationTips: this.getPreparationTips(booking.service.type),
      contactPhone: '+385 99 123 4567'
    });

    await this.transporter.sendMail({
      from: {
        name: 'WebUredno',
        address: 'noreply@weburedno.hr'
      },
      to: booking.customer.email,
      subject: `Podsjetnik: Čišćenje ${this.isTomorrow(booking.schedule.date) ? 'sutra' : this.formatDate(booking.schedule.date)}`,
      html,
      headers: {
        'X-Booking-ID': booking.id,
        'X-Entity-Type': 'service-reminder'
      }
    });
  }

  private generateICSFile(booking: Booking): string {
    const event = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//WebUredno//Booking System//HR',
      'BEGIN:VEVENT',
      `UID:${booking.id}@weburedno.hr`,
      `DTSTAMP:${this.formatICSDate(new Date())}`,
      `DTSTART:${this.formatICSDate(booking.schedule.date)}`,
      `DTEND:${this.formatICSDate(this.calculateEndTime(booking))}`,
      `SUMMARY:WebUredno - ${this.getServiceName(booking.service.type)}`,
      `DESCRIPTION:${this.generateICSDescription(booking)}`,
      `LOCATION:${this.formatAddress(booking.property)}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT24H',
      'ACTION:DISPLAY',
      'DESCRIPTION:Podsjetnik za čišćenje sutra',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ];

    return event.join('\r\n');
  }
}
```

### 4.3 Database Schema Design

```sql
-- Customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  preferred_language VARCHAR(2) DEFAULT 'hr',
  marketing_consent BOOLEAN DEFAULT false,
  gdpr_consent BOOLEAN NOT NULL,
  gdpr_consent_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for email lookups
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);

-- Addresses table
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  label VARCHAR(50),
  street VARCHAR(255) NOT NULL,
  house_number VARCHAR(20) NOT NULL,
  apartment VARCHAR(20),
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  county VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Hrvatska',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  instructions TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name_hr VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  description_hr TEXT,
  description_en TEXT,
  category VARCHAR(50) NOT NULL,
  base_rate DECIMAL(10, 2) NOT NULL,
  minimum_charge DECIMAL(10, 2) NOT NULL,
  minimum_hours DECIMAL(4, 2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number VARCHAR(20) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  service_id UUID REFERENCES services(id),
  address_id UUID REFERENCES addresses(id),

  -- Schedule
  booking_date DATE NOT NULL,
  time_slot VARCHAR(20) NOT NULL,
  estimated_duration INTEGER NOT NULL, -- minutes
  frequency VARCHAR(20) NOT NULL,

  -- Property details
  property_size INTEGER NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  property_type VARCHAR(50),

  -- Pricing
  base_price DECIMAL(10, 2) NOT NULL,
  addon_charges DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  final_price DECIMAL(10, 2) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending',
  payment_method VARCHAR(20),

  -- Team assignment
  team_size INTEGER NOT NULL,
  assigned_team_id UUID,

  -- Status
  status VARCHAR(30) NOT NULL DEFAULT 'pending_confirmation',
  cancellation_reason TEXT,
  cancelled_by VARCHAR(20),
  cancelled_at TIMESTAMPTZ,

  -- External references
  calendar_event_id VARCHAR(255),
  invoice_id VARCHAR(255),

  -- Special instructions
  special_instructions TEXT,

  -- Metadata
  source VARCHAR(50) DEFAULT 'website',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_frequency CHECK (frequency IN ('jednokratno', 'tjedno', 'dvotjedno', 'mjesecno')),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'pending_confirmation', 'confirmed', 'reminder_sent', 'in_progress', 'completed', 'cancelled', 'rescheduled', 'no_show')),
  CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'paid', 'refunded'))
);

-- Create indexes for common queries
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created ON bookings(created_at);

-- Booking addons junction table
CREATE TABLE booking_addons (
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  addon_code VARCHAR(50) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (booking_id, addon_code)
);

-- Status history table
CREATE TABLE booking_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL,
  changed_by VARCHAR(20) NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email log table
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  customer_id UUID REFERENCES customers(id),
  email_type VARCHAR(50) NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  status VARCHAR(20) DEFAULT 'sent',
  error_message TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create view for booking summary
CREATE VIEW booking_summary AS
SELECT
  b.id,
  b.booking_number,
  c.first_name || ' ' || c.last_name as customer_name,
  c.email,
  c.phone,
  s.name_hr as service_name,
  b.booking_date,
  b.time_slot,
  b.final_price,
  b.status,
  b.created_at
FROM bookings b
JOIN customers c ON b.customer_id = c.id
JOIN services s ON b.service_id = s.id;

-- Function to generate booking number
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS VARCHAR AS $$
DECLARE
  year_month VARCHAR;
  sequence_num INTEGER;
  booking_num VARCHAR;
BEGIN
  year_month := TO_CHAR(NOW(), 'YYYY-MM');

  SELECT COUNT(*) + 1 INTO sequence_num
  FROM bookings
  WHERE booking_number LIKE year_month || '-%';

  booking_num := year_month || '-' || LPAD(sequence_num::TEXT, 4, '0');

  RETURN booking_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate booking number
CREATE OR REPLACE FUNCTION set_booking_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booking_number IS NULL THEN
    NEW.booking_number := generate_booking_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER booking_number_trigger
BEFORE INSERT ON bookings
FOR EACH ROW
EXECUTE FUNCTION set_booking_number();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON customers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
```

### 4.4 Third-party Service Connections

```typescript
// Payment Integration (Stripe - Future)
interface PaymentService {
  createPaymentIntent(amount: number, currency: string): Promise<PaymentIntent>;
  confirmPayment(paymentIntentId: string): Promise<Payment>;
  createRefund(paymentId: string, amount: number): Promise<Refund>;
  webhookHandler(event: StripeEvent): Promise<void>;
}

// SMS Service Integration (Twilio - Future)
interface SMSService {
  sendBookingConfirmation(phone: string, booking: Booking): Promise<void>;
  sendReminder(phone: string, booking: Booking): Promise<void>;
  sendTeamNotification(phones: string[], booking: Booking): Promise<void>;
}

// Maps/Geocoding Service
class GeocodingService {
  async geocodeAddress(address: Address): Promise<Coordinates> {
    // Using Google Maps Geocoding API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        `${address.street} ${address.houseNumber}, ${address.city}, ${address.postalCode}`
      )}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    const data = await response.json();

    if (data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng
      };
    }

    throw new Error('Address not found');
  }

  async calculateDistance(from: Coordinates, to: Coordinates): Promise<number> {
    // Haversine formula for distance calculation
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(to.lat - from.lat);
    const dLon = this.toRad(to.lng - from.lng);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(from.lat)) * Math.cos(this.toRad(to.lat)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}
```

---

## 5. Security Implementation

### 5.1 Input Validation Patterns

```typescript
import { z } from 'zod';

// Phone validation for Croatian numbers
const phoneSchema = z.string()
  .regex(/^(\+385|0)[1-9]\d{7,8}$/, 'Invalid Croatian phone number')
  .transform(val => {
    // Normalize to international format
    if (val.startsWith('0')) {
      return '+385' + val.slice(1);
    }
    return val;
  });

// Email validation with disposable email check
const emailSchema = z.string()
  .email()
  .toLowerCase()
  .refine(async (email) => {
    const disposableDomains = await loadDisposableDomains();
    const domain = email.split('@')[1];
    return !disposableDomains.includes(domain);
  }, 'Disposable email addresses are not allowed');

// Sanitization for text inputs
const sanitizeText = z.string()
  .trim()
  .min(1)
  .max(500)
  .transform(val => {
    // Remove potential XSS vectors
    return val
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  });

// Booking validation schema
export const bookingValidationSchema = z.object({
  customer: z.object({
    name: sanitizeText.min(2).max(100),
    email: emailSchema,
    phone: phoneSchema,
    gdprConsent: z.literal(true, {
      errorMap: () => ({ message: 'GDPR consent is required' })
    }),
    marketingConsent: z.boolean()
  }),

  service: z.object({
    type: z.enum(['standardno', 'dubinsko', 'useljenje', 'iseljenje', 'poslije-radova']),
    addons: z.array(z.enum(['prozori', 'pegla', 'frizider', 'pecnica', 'ormari', 'balkon'])),
    specialInstructions: sanitizeText.optional()
  }),

  property: z.object({
    address: sanitizeText,
    city: z.string().min(2).max(50),
    postalCode: z.string().regex(/^\d{5}$/, 'Invalid postal code'),
    size: z.number().min(20).max(1000),
    bedrooms: z.number().int().min(0).max(20),
    bathrooms: z.number().int().min(1).max(10)
  }),

  schedule: z.object({
    date: z.string().refine(val => {
      const date = new Date(val);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      return date >= tomorrow;
    }, 'Booking must be at least 24 hours in advance'),

    timeSlot: z.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, 'Invalid time slot format'),
    frequency: z.enum(['jednokratno', 'tjedno', 'dvotjedno', 'mjesecno'])
  }),

  pricing: z.object({
    finalPrice: z.number().positive().max(10000)
  })
}).strict(); // Reject unknown fields
```

### 5.2 Authentication Flow (if needed)

```typescript
// JWT-based authentication for admin/customer portals (future)
class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET!;
  private readonly REFRESH_SECRET = process.env.REFRESH_SECRET!;

  async generateTokens(userId: string): Promise<TokenPair> {
    const accessToken = jwt.sign(
      {
        userId,
        type: 'access',
        iat: Date.now()
      },
      this.JWT_SECRET,
      {
        expiresIn: '15m',
        algorithm: 'HS256'
      }
    );

    const refreshToken = jwt.sign(
      {
        userId,
        type: 'refresh',
        iat: Date.now()
      },
      this.REFRESH_SECRET,
      {
        expiresIn: '7d',
        algorithm: 'HS256'
      }
    );

    // Store refresh token hash in database
    await this.storeRefreshToken(userId, this.hashToken(refreshToken));

    return { accessToken, refreshToken };
  }

  async validateAccessToken(token: string): Promise<TokenPayload> {
    try {
      const payload = jwt.verify(token, this.JWT_SECRET) as TokenPayload;

      if (payload.type !== 'access') {
        throw new Error('Invalid token type');
      }

      return payload;
    } catch (error) {
      throw new AuthError('INVALID_ACCESS_TOKEN');
    }
  }

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    try {
      const payload = jwt.verify(refreshToken, this.REFRESH_SECRET) as TokenPayload;

      if (payload.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      // Verify refresh token exists in database
      const isValid = await this.verifyRefreshToken(
        payload.userId,
        this.hashToken(refreshToken)
      );

      if (!isValid) {
        throw new Error('Refresh token not found or expired');
      }

      // Revoke old refresh token
      await this.revokeRefreshToken(payload.userId, this.hashToken(refreshToken));

      // Generate new token pair
      return this.generateTokens(payload.userId);
    } catch (error) {
      throw new AuthError('INVALID_REFRESH_TOKEN');
    }
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
```

### 5.3 Rate Limiting Implementation

```typescript
class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private readonly limits: RateLimitConfig = {
    booking: { requests: 5, window: 3600000 },      // 5 per hour
    contact: { requests: 10, window: 3600000 },     // 10 per hour
    pricing: { requests: 30, window: 60000 },       // 30 per minute
    newsletter: { requests: 2, window: 86400000 },  // 2 per day
    api: { requests: 60, window: 60000 }            // 60 per minute (general)
  };

  async checkLimit(
    identifier: string,
    endpoint: string,
    ip: string
  ): Promise<RateLimitResult> {
    const key = `${endpoint}:${identifier || ip}`;
    const limit = this.limits[endpoint] || this.limits.api;
    const now = Date.now();

    let entry = this.store.get(key);

    if (!entry || now > entry.resetAt) {
      entry = {
        count: 0,
        resetAt: now + limit.window,
        firstRequestAt: now
      };
    }

    entry.count++;
    this.store.set(key, entry);

    // Clean up old entries periodically
    if (Math.random() < 0.01) {
      this.cleanup();
    }

    const remaining = Math.max(0, limit.requests - entry.count);
    const resetIn = Math.max(0, entry.resetAt - now);

    return {
      allowed: entry.count <= limit.requests,
      limit: limit.requests,
      remaining,
      resetAt: new Date(entry.resetAt),
      retryAfter: entry.count > limit.requests ? Math.ceil(resetIn / 1000) : undefined
    };
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetAt + 3600000) { // 1 hour grace period
        this.store.delete(key);
      }
    }
  }
}

// Rate limiting middleware
export async function rateLimitMiddleware(
  req: Request,
  endpoint: string
): Promise<void> {
  const rateLimiter = new RateLimiter();
  const ip = getClientIp(req);
  const identifier = req.headers.get('x-client-id') || ip;

  const result = await rateLimiter.checkLimit(identifier, endpoint, ip);

  // Set rate limit headers
  req.headers.set('X-RateLimit-Limit', String(result.limit));
  req.headers.set('X-RateLimit-Remaining', String(result.remaining));
  req.headers.set('X-RateLimit-Reset', result.resetAt.toISOString());

  if (!result.allowed) {
    throw new ApiError(
      'RATE_LIMIT_EXCEEDED',
      `Too many requests. Please retry after ${result.retryAfter} seconds.`,
      429,
      { retryAfter: result.retryAfter }
    );
  }
}
```

### 5.4 CORS Configuration

```typescript
export const corsConfig = {
  // Production configuration
  production: {
    origin: [
      'https://weburedno.hr',
      'https://www.weburedno.hr'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Request-ID',
      'X-Client-Version',
      'Accept-Language'
    ],
    exposedHeaders: [
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'X-Request-ID'
    ],
    maxAge: 86400 // 24 hours
  },

  // Development configuration
  development: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['*'],
    exposedHeaders: ['*'],
    maxAge: 3600
  }
};

// CORS middleware implementation
export function corsMiddleware(req: Request): Response | null {
  const env = process.env.NODE_ENV || 'development';
  const config = corsConfig[env];
  const origin = req.headers.get('origin');

  // Check if origin is allowed
  if (origin && config.origin.includes(origin)) {
    const headers = new Headers();

    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Credentials', String(config.credentials));
    headers.set('Access-Control-Max-Age', String(config.maxAge));

    if (req.method === 'OPTIONS') {
      // Preflight request
      headers.set('Access-Control-Allow-Methods', config.methods.join(', '));
      headers.set('Access-Control-Allow-Headers', config.allowedHeaders.join(', '));
      headers.set('Access-Control-Expose-Headers', config.exposedHeaders.join(', '));

      return new Response(null, { status: 204, headers });
    }

    // Add CORS headers to actual request
    headers.forEach((value, key) => {
      req.headers.set(key, value);
    });
  }

  return null;
}
```

---

## Implementation Notes

### Error Handling Best Practices
- Always use structured error responses with error codes
- Log all errors with context for debugging
- Implement retry logic for external service failures
- Use circuit breakers for third-party integrations

### Performance Considerations
- Implement connection pooling for database
- Cache frequently accessed data (services, pricing)
- Use batch operations where possible
- Implement pagination for list endpoints

### Security Checklist
- ✅ Input validation on all endpoints
- ✅ Rate limiting per endpoint and IP
- ✅ CORS properly configured
- ✅ SQL injection prevention via parameterized queries
- ✅ XSS prevention through input sanitization
- ✅ CSRF protection for state-changing operations
- ✅ Secure headers (HSTS, CSP, X-Frame-Options)
- ✅ Environment variables for sensitive data
- ✅ HTTPS enforcement in production
- ✅ Regular dependency updates

### Monitoring & Logging
- Log all API requests with correlation IDs
- Track response times and error rates
- Monitor third-party service health
- Set up alerts for critical failures
- Implement health check endpoints

### Testing Strategy
- Unit tests for business logic
- Integration tests for API endpoints
- Load testing for rate limiting
- Security testing for vulnerabilities
- End-to-end tests for critical paths

---

## Deployment Configuration

### Environment Variables
```bash
# Application
NODE_ENV=production
API_URL=https://weburedno.hr/api
NEXT_PUBLIC_API_URL=https://weburedno.hr/api

# Database
DATABASE_URL=postgresql://user:pass@host:5432/weburedno
DATABASE_POOL_SIZE=20

# Google Services
GOOGLE_SERVICE_ACCOUNT_EMAIL=weburedno@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
GOOGLE_CALENDAR_ID=calendar@group.calendar.google.com
GOOGLE_MAPS_API_KEY=AIza...

# Email Service
EMAIL_PROVIDER=resend # or sendgrid
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@weburedno.hr
ADMIN_EMAILS=admin@weburedno.hr,manager@weburedno.hr

# Security
JWT_SECRET=long-random-string
REFRESH_SECRET=another-long-random-string
ENCRYPTION_KEY=32-byte-hex-string

# Rate Limiting
RATE_LIMIT_BOOKING=5
RATE_LIMIT_WINDOW=3600000

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
LOG_LEVEL=info
```

### Health Check Endpoints
```typescript
// GET /api/health
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "checks": {
    "database": "ok",
    "calendar": "ok",
    "email": "ok"
  }
}

// GET /api/health/ready
{
  "ready": true,
  "services": {
    "database": true,
    "cache": true,
    "email": true
  }
}
```

---

This comprehensive backend implementation guide provides a complete blueprint for building the WebUredno backend system with production-ready patterns, security measures, and scalability considerations.