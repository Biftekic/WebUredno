// Enhanced Booking Types and Constants for Improved Calculator

export type ServiceTypeEnum = 'regular' | 'deep' | 'airbnb' | 'daily_rental' | 'vacation_rental';

export type PropertyTypeEnum = 'apartment' | 'house' | 'office';

// Quantifiable Indoor Extra Service
export interface QuantifiableExtra {
  id: string;
  name: string;
  icon: string;
  price_per_unit: number;
  unit: string;
  default_quantity: number;
  max_quantity: number;
  min_quantity?: number;
}

// Outdoor Service (Area/Length based)
export interface OutdoorService {
  id: string;
  name: string;
  icon: string;
  price_per_unit: number;
  min_price: number;
  unit: 'm²' | 'm';
  description: string;
}

// Rental Service Configuration
export interface RentalServiceConfig {
  id: ServiceTypeEnum;
  name: string;
  icon: string;
  base_price: number;
  price_per_sqm: number;
  min_price: number;
  description: string;
  includes: string[];
  extras?: RentalExtra[];
  turnaround_time?: string;
  availability?: string;
}

export interface RentalExtra {
  id: string;
  name: string;
  price: number;
}

export interface RentalFeatures {
  turnaroundTime: '2-3h' | '4-6h' | 'same-day' | 'flexible';
  laundryService: boolean;
  suppliesRefill: boolean;
  inventoryCheck: boolean;
  guestWelcomeSetup: boolean;
  emergencyAvailable: boolean;
}

// Price Calculation Interface
export interface EnhancedPriceCalculation {
  serviceType: ServiceTypeEnum;
  basePrice: number;
  sizeMultiplier: number;
  propertyTypeMultiplier: number;

  // Rental-specific features
  rentalFeatures?: RentalFeatures;

  // Extras calculation
  indoorExtras: {
    [key: string]: {
      quantity: number;
      unitPrice: number;
      total: number;
    };
  };

  // Outdoor services (area-based)
  outdoorServices: {
    [key: string]: {
      area: number;
      pricePerUnit: number;
      total: number;
    };
  };

  // Adjustments
  distanceFee: number;
  frequencyDiscount: number;
  weekendSurcharge?: number;
  holidaySurcharge?: number;

  // Final calculations
  subtotal: number;
  discount: number;
  total: number;
}

// Turnaround Time Options
export interface TurnaroundTimeOption {
  value: '2-3h' | '4-6h' | 'same-day' | 'flexible';
  label: string;
  price_adjustment: number;
}

// Constants
export const PROPERTY_TYPE_MULTIPLIERS: Record<PropertyTypeEnum, number> = {
  apartment: 1.0,
  house: 1.15,
  office: 1.1,
};

export const TURNAROUND_TIME_OPTIONS: TurnaroundTimeOption[] = [
  { value: '2-3h', label: 'Hitno (2-3h)', price_adjustment: 30 },
  { value: '4-6h', label: 'Standard (4-6h)', price_adjustment: 0 },
  { value: 'same-day', label: 'Isti dan', price_adjustment: -5 },
  { value: 'flexible', label: 'Fleksibilno', price_adjustment: -10 },
];

// Rental Services
export const RENTAL_SERVICES: RentalServiceConfig[] = [
  {
    id: 'airbnb',
    name: 'AirBnB čišćenje',
    icon: '🏠',
    base_price: 60,
    price_per_sqm: 1.2,
    min_price: 60,
    description: 'Profesionalno čišćenje između gostiju',
    includes: [
      'Kompletno čišćenje prostora',
      'Promjena posteljine',
      'Dopuna potrepština',
      'Dezinfekcija površina',
      'Priprema dobrodošlice'
    ],
    extras: [
      { id: 'laundry', name: 'Pranje posteljine', price: 20 },
      { id: 'supplies', name: 'Dopuna potrepština', price: 15 },
      { id: 'deep_bathroom', name: 'Dubinsko čišćenje kupaonice', price: 25 },
      { id: 'check_inventory', name: 'Provjera inventara', price: 10 }
    ]
  },
  {
    id: 'daily_rental',
    name: 'Jednodnevni najam čišćenje',
    icon: '🔑',
    base_price: 80,
    price_per_sqm: 1.0,
    min_price: 80,
    description: 'Čišćenje za kratkoročni najam',
    includes: [
      'Brzo i efikasno čišćenje',
      'Osvježavanje prostora',
      'Osnovno usisavanje i brisanje',
      'Čišćenje kuhinje i kupaonice',
      'Iznošenje smeća'
    ],
    turnaround_time: '2-3 sata',
    availability: '24/7 usluga'
  },
  {
    id: 'vacation_rental',
    name: 'Dubinsko čišćenje najma',
    icon: '✨',
    base_price: 120,
    price_per_sqm: 1.5,
    min_price: 120,
    description: 'Mjesečno dubinsko čišćenje za dugoročni najam',
    includes: [
      'Kompletno dubinsko čišćenje',
      'Čišćenje tepiha i namještaja',
      'Dezinfekcija svih površina',
      'Čišćenje prozora',
      'Poliranje površina'
    ]
  }
];

// Quantifiable Indoor Extras
export const QUANTIFIABLE_EXTRAS: QuantifiableExtra[] = [
  {
    id: 'windows',
    name: 'Pranje prozora',
    icon: '🪟',
    price_per_unit: 7,
    unit: 'prozor',
    default_quantity: 5,
    max_quantity: 30,
    min_quantity: 0
  },
  {
    id: 'oven',
    name: 'Čišćenje pećnice',
    icon: '🔥',
    price_per_unit: 30,
    unit: 'pećnica',
    default_quantity: 1,
    max_quantity: 3,
    min_quantity: 0
  },
  {
    id: 'fridge',
    name: 'Čišćenje hladnjaka',
    icon: '❄️',
    price_per_unit: 30,
    unit: 'hladnjak',
    default_quantity: 1,
    max_quantity: 3,
    min_quantity: 0
  },
  {
    id: 'balcony',
    name: 'Čišćenje balkona',
    icon: '🏡',
    price_per_unit: 30,
    unit: 'balkon',
    default_quantity: 1,
    max_quantity: 5,
    min_quantity: 0
  },
  {
    id: 'ironing',
    name: 'Glačanje',
    icon: '👔',
    price_per_unit: 15,
    unit: 'sat',
    default_quantity: 1,
    max_quantity: 8,
    min_quantity: 0
  },
  {
    id: 'cabinet_interior',
    name: 'Čišćenje unutrašnjosti ormara',
    icon: '🚪',
    price_per_unit: 20,
    unit: 'ormar',
    default_quantity: 2,
    max_quantity: 10,
    min_quantity: 0
  }
];

// Landscaping/Outdoor Services
export const LANDSCAPING_SERVICES: OutdoorService[] = [
  {
    id: 'lawn_mowing',
    name: 'Košnja travnjaka',
    icon: '🌱',
    price_per_unit: 0.5,
    min_price: 30,
    unit: 'm²',
    description: 'Redovna košnja i održavanje travnjaka'
  },
  {
    id: 'garden_maintenance',
    name: 'Održavanje vrta',
    icon: '🌿',
    price_per_unit: 0.8,
    min_price: 50,
    unit: 'm²',
    description: 'Kompleto održavanje vrta, grmlja i cvijeća'
  },
  {
    id: 'leaf_removal',
    name: 'Uklanjanje lišća',
    icon: '🍂',
    price_per_unit: 0.3,
    min_price: 25,
    unit: 'm²',
    description: 'Sezonsko čišćenje lišća'
  },
  {
    id: 'hedge_trimming',
    name: 'Šišanje živice',
    icon: '✂️',
    price_per_unit: 5,
    min_price: 40,
    unit: 'm',
    description: 'Oblikovanje i održavanje živice'
  }
];

// Enhanced frequency options with proper discount
export const ENHANCED_FREQUENCY_OPTIONS = [
  { value: 'one-time', label: 'Jednokratno', description: 'Jednokratno čišćenje', discount: 0 },
  { value: 'weekly', label: 'Tjedno', description: 'Svakih 7 dana', discount: 10 },
  { value: 'biweekly', label: 'Dvotjedno', description: 'Svakih 14 dana', discount: 5 },
  { value: 'monthly', label: 'Mjesečno', description: 'Jednom mjesečno', discount: 3 },
];