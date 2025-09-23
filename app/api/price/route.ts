import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';

// Validation schema for price calculation request
const priceCalculationSchema = z.object({
  service_id: z.string().optional(), // Allow both UUID and string IDs for mock data
  service_type: z.enum(['regular', 'deep', 'construction', 'moving', 'windows', 'office', 'general', 'disinfection']),
  property_size: z.number().min(10).max(500),
  property_type: z.enum(['apartment', 'house', 'office']),
  bedrooms: z.number().min(0).max(10).optional(),
  bathrooms: z.number().min(0).max(5).optional(),
  frequency: z.enum(['one-time', 'weekly', 'biweekly', 'monthly']).optional(),
  extras: z.array(z.object({
    name: z.string(),
    price: z.number().positive(),
    quantity: z.number().positive().optional()
  })).optional(),
  address: z.string().optional(),
  postal_code: z.string().optional(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional()
});

// Pricing constants
const PRICING_CONFIG = {
  // Base prices per service type (EUR per sqm)
  BASE_RATES: {
    regular: 0.8,
    deep: 1.5,
    construction: 2.0,
    moving: 1.2,
    windows: 0.6,
    office: 0.7,
    general: 0.8,
    disinfection: 1.0
  },

  // Minimum prices per service type (EUR)
  MINIMUM_PRICES: {
    regular: 40,
    deep: 60,
    construction: 100,
    moving: 80,
    windows: 30,
    office: 50,
    general: 40,
    disinfection: 50
  },

  // Property type multipliers
  PROPERTY_MULTIPLIERS: {
    apartment: 1.0,
    house: 1.15,
    office: 1.1
  },

  // Frequency discounts (percentage)
  FREQUENCY_DISCOUNTS: {
    'one-time': 0,
    'weekly': 15,
    'biweekly': 10,
    'monthly': 5
  },

  // Distance fee (from Zagreb center)
  DISTANCE_FEE_PER_KM: 0.5, // EUR per km after 10km
  FREE_DISTANCE_KM: 10,
  ZAGREB_CENTER: { lat: 45.8150, lng: 15.9819 },

  // Extra services
  COMMON_EXTRAS: {
    'balcony_cleaning': { name: 'Čišćenje balkona', price: 15 },
    'inside_oven': { name: 'Čišćenje pećnice iznutra', price: 20 },
    'inside_fridge': { name: 'Čišćenje hladnjaka iznutra', price: 15 },
    'ironing': { name: 'Glačanje', price: 20 },
    'window_blinds': { name: 'Čišćenje roletni', price: 25 },
    'pet_hair_removal': { name: 'Uklanjanje dlaka kućnih ljubimaca', price: 15 },
    'laundry': { name: 'Pranje rublja', price: 15 }
  }
};

// Calculate distance from Zagreb center using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Calculate distance fee
function calculateDistanceFee(coordinates?: { lat: number; lng: number }): number {
  if (!coordinates) return 0;

  const distance = calculateDistance(
    PRICING_CONFIG.ZAGREB_CENTER.lat,
    PRICING_CONFIG.ZAGREB_CENTER.lng,
    coordinates.lat,
    coordinates.lng
  );

  if (distance <= PRICING_CONFIG.FREE_DISTANCE_KM) {
    return 0;
  }

  const extraDistance = distance - PRICING_CONFIG.FREE_DISTANCE_KM;
  return Math.round(extraDistance * PRICING_CONFIG.DISTANCE_FEE_PER_KM * 100) / 100;
}

// Main price calculation function
function calculatePrice(data: z.infer<typeof priceCalculationSchema>) {
  const {
    service_type,
    property_size,
    property_type,
    frequency = 'one-time',
    extras = [],
    coordinates
  } = data;

  // 1. Calculate base price
  const baseRate = PRICING_CONFIG.BASE_RATES[service_type];
  const propertyMultiplier = PRICING_CONFIG.PROPERTY_MULTIPLIERS[property_type];
  const minimumPrice = PRICING_CONFIG.MINIMUM_PRICES[service_type];

  let basePrice = property_size * baseRate * propertyMultiplier;

  // Apply minimum price
  basePrice = Math.max(basePrice, minimumPrice);

  // 2. Apply frequency discount
  const frequencyDiscount = PRICING_CONFIG.FREQUENCY_DISCOUNTS[frequency];
  const discountAmount = basePrice * (frequencyDiscount / 100);
  const priceAfterDiscount = basePrice - discountAmount;

  // 3. Calculate extras cost
  const extrasCost = extras.reduce((total, extra) => {
    const quantity = extra.quantity || 1;
    return total + (extra.price * quantity);
  }, 0);

  // 4. Calculate distance fee
  const distanceFee = calculateDistanceFee(coordinates);

  // 5. Calculate total price
  const totalPrice = priceAfterDiscount + extrasCost + distanceFee;

  // Return detailed breakdown
  return {
    base_price: Math.round(basePrice * 100) / 100,
    property_multiplier: propertyMultiplier,
    frequency_discount: {
      percentage: frequencyDiscount,
      amount: Math.round(discountAmount * 100) / 100
    },
    price_after_discount: Math.round(priceAfterDiscount * 100) / 100,
    extras_cost: Math.round(extrasCost * 100) / 100,
    distance_fee: distanceFee,
    total_price: Math.round(totalPrice * 100) / 100,

    // Additional info
    service_details: {
      type: service_type,
      base_rate_per_sqm: baseRate,
      minimum_price: minimumPrice,
      property_type: property_type,
      property_size: property_size,
      frequency: frequency
    },

    // Croatian messages for display
    messages: {
      base: `Osnovna cijena za ${property_size}m²: €${basePrice.toFixed(2)}`,
      discount: frequencyDiscount > 0
        ? `Popust za ${frequency === 'weekly' ? 'tjedni' : frequency === 'biweekly' ? 'dvotjedni' : 'mjesečni'} raspored: -${frequencyDiscount}%`
        : null,
      extras: extrasCost > 0 ? `Dodatne usluge: €${extrasCost.toFixed(2)}` : null,
      distance: distanceFee > 0 ? `Naknada za udaljenost: €${distanceFee.toFixed(2)}` : null,
      total: `Ukupna cijena: €${totalPrice.toFixed(2)}`
    }
  };
}

// POST /api/price - Calculate price for service
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = priceCalculationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Neispravni podaci za izračun cijene',
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    // If service_id is provided, fetch service details from database
    let serviceData = null;
    if (validationResult.data.service_id) {
      const { data: service, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', validationResult.data.service_id)
        .single();

      if (error) {
        console.error('Error fetching service:', error);
      } else {
        serviceData = service;
      }
    }

    // Calculate price
    const priceBreakdown = calculatePrice(validationResult.data);

    // If we have service data, include additional information
    if (serviceData) {
      (priceBreakdown as any).service_info = {
        name: serviceData.name,
        description: serviceData.description,
        category: serviceData.category
      };
    }

    return NextResponse.json({
      success: true,
      data: priceBreakdown
    });

  } catch (error) {
    console.error('Price calculation error:', error);
    return NextResponse.json(
      {
        error: 'Greška pri izračunu cijene',
        message: error instanceof Error ? error.message : 'Nepoznata greška'
      },
      { status: 500 }
    );
  }
}

// GET /api/price/extras - Get available extras
export async function GET() {
  return NextResponse.json({
    success: true,
    data: Object.entries(PRICING_CONFIG.COMMON_EXTRAS).map(([key, value]) => ({
      id: key,
      ...value
    }))
  });
}