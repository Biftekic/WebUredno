# 📊 Booking Calculator Improvement Plan

## 🎯 Overview
Comprehensive improvements to the booking page calculator to provide better UX, more accurate pricing, and additional services.

## 🔍 Current Issues Identified

### 1. **Limited Extra Service Selection**
- Currently only ON/OFF toggle for extras
- No quantity selection (e.g., 5 windows, 2 ovens)
- Fixed price regardless of amount needed

### 2. **Calculation Logic Issues**
- Base price calculation too simplistic
- Missing property type multipliers
- No minimum price enforcement
- Frequency discount only applies to base price, not total

### 3. **Missing Services**
- No landscaping options
- No lawn mowing service
- Limited outdoor services
- No AirBnB/vacation rental cleaning
- No daily rental (jednodnevni najam) cleaning

## 🚀 Proposed Improvements

### 1. **Enhanced Extra Services UI**

#### Current State:
```
[✓] Window Cleaning        +120 EUR
[ ] Oven Cleaning          +100 EUR
```

#### Improved State:
```
Window Cleaning     [-] 0 [+]    0 EUR
(per window)        @7 EUR each

Oven Cleaning       [-] 1 [+]    30 EUR
(deep clean)        @30 EUR each

Balcony/Terrace     [-] 2 [+]    60 EUR
(per balcony)       @30 EUR each

Ironing             [-] 3 [+]    45 EUR
(hours)             @15 EUR/hour
```

### 2. **New Service Categories**

#### A. **Rental Property Cleaning Services**
```typescript
const RENTAL_SERVICES = [
  {
    id: 'airbnb_cleaning',
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
    id: 'vacation_rental_deep',
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
```

#### B. **Landscaping Services** (charged by m²)
```typescript
const LANDSCAPING_SERVICES = [
  {
    id: 'lawn_mowing',
    name: 'Košnja travnjaka',
    icon: '🌱',
    price_per_sqm: 0.5,
    min_price: 30,
    unit: 'm²',
    description: 'Redovna košnja i održavanje travnjaka'
  },
  {
    id: 'garden_maintenance',
    name: 'Održavanje vrta',
    icon: '🌿',
    price_per_sqm: 0.8,
    min_price: 50,
    unit: 'm²',
    description: 'Kompleto održavanje vrta, grmlja i cvijeća'
  },
  {
    id: 'leaf_removal',
    name: 'Uklanjanje lišća',
    icon: '🍂',
    price_per_sqm: 0.3,
    min_price: 25,
    unit: 'm²',
    description: 'Sezonsko čišćenje lišća'
  },
  {
    id: 'hedge_trimming',
    name: 'Šišanje živice',
    icon: '✂️',
    price_per_meter: 5,
    min_price: 40,
    unit: 'm',
    description: 'Oblikovanje i održavanje živice'
  }
];
```

#### C. **Quantifiable Indoor Extras**
```typescript
const QUANTIFIABLE_EXTRAS = [
  {
    id: 'windows',
    name: 'Pranje prozora',
    icon: '🪟',
    price_per_unit: 7,
    unit: 'prozor',
    default_quantity: 5,
    max_quantity: 30
  },
  {
    id: 'oven',
    name: 'Čišćenje pećnice',
    icon: '🔥',
    price_per_unit: 30,
    unit: 'pećnica',
    default_quantity: 1,
    max_quantity: 3
  },
  {
    id: 'fridge',
    name: 'Čišćenje hladnjaka',
    icon: '❄️',
    price_per_unit: 30,
    unit: 'hladnjak',
    default_quantity: 1,
    max_quantity: 3
  },
  {
    id: 'balcony',
    name: 'Čišćenje balkona',
    icon: '🏡',
    price_per_unit: 30,
    unit: 'balkon',
    default_quantity: 1,
    max_quantity: 5
  },
  {
    id: 'ironing',
    name: 'Glačanje',
    icon: '👔',
    price_per_unit: 15,
    unit: 'sat',
    default_quantity: 1,
    max_quantity: 8
  },
  {
    id: 'cabinet_interior',
    name: 'Čišćenje unutrašnjosti ormara',
    icon: '🚪',
    price_per_unit: 20,
    unit: 'ormar',
    default_quantity: 2,
    max_quantity: 10
  }
];
```

### 3. **Improved Price Calculation Logic**

```typescript
interface PriceCalculation {
  // Service Type
  serviceType: 'regular' | 'deep' | 'airbnb' | 'daily_rental' | 'vacation_rental';
  // Base calculation
  basePrice: number;           // Service base price
  sizeMultiplier: number;      // Based on property size
  propertyTypeMultiplier: number; // Apartment: 1.0, House: 1.15, Office: 1.1

  // Rental-specific features
  rentalFeatures?: {
    turnaroundTime: '2-3h' | '4-6h' | 'same-day';
    laundryService: boolean;
    suppliesRefill: boolean;
    inventoryCheck: boolean;
    guestWelcomeSetup: boolean;
    emergencyAvailable: boolean; // 24/7 availability
  };

  // Extras calculation
  indoorExtras: {
    windows: { quantity: number; unitPrice: 7; total: number };
    ovens: { quantity: number; unitPrice: 30; total: number };
    fridges: { quantity: number; unitPrice: 30; total: number };
    balconies: { quantity: number; unitPrice: 30; total: number };
    ironing: { hours: number; hourlyRate: 15; total: number };
    cabinets: { quantity: number; unitPrice: 20; total: number };
  };

  // Outdoor services (area-based)
  outdoorServices: {
    lawnMowing: { area: number; pricePerSqm: 0.5; total: number };
    gardenMaintenance: { area: number; pricePerSqm: 0.8; total: number };
    leafRemoval: { area: number; pricePerSqm: 0.3; total: number };
    hedgeTrimming: { length: number; pricePerMeter: 5; total: number };
  };

  // Adjustments
  distanceFee: number;         // Based on km from center
  frequencyDiscount: number;    // Applied to TOTAL, not just base

  // Final
  subtotal: number;
  discount: number;
  total: number;
}
```

### 4. **UI Component Structure**

```tsx
// Service Type Selector with Special Categories
<ServiceTypeSelector>
  <Tab label="Redovno čišćenje" value="regular" />
  <Tab label="Dubinsko čišćenje" value="deep" />
  <Tab label="AirBnB" value="airbnb" icon="🏠" highlighted />
  <Tab label="Jednodnevni najam" value="daily_rental" icon="🔑" />
</ServiceTypeSelector>

// Rental-Specific Options
{(serviceType === 'airbnb' || serviceType === 'daily_rental') && (
  <RentalOptions>
    <TurnaroundTime>
      <Option value="urgent" label="Hitno (2-3h)" price="+30€" />
      <Option value="standard" label="Standard (4-6h)" price="included" />
      <Option value="flexible" label="Fleksibilno" price="-10€" />
    </TurnaroundTime>

    <RentalExtras>
      <Checkbox label="Pranje posteljine" price="20€" />
      <Checkbox label="Dopuna potrepština" price="15€" />
      <Checkbox label="Priprema dobrodošlice" price="10€" />
      <Checkbox label="24/7 dostupnost" price="50€/mjesec" />
    </RentalExtras>
  </RentalOptions>
)}

// New QuantitySelector Component
<QuantitySelector
  label="Pranje prozora"
  unit="prozor"
  unitPrice={7}
  min={0}
  max={30}
  value={quantity}
  onChange={(newQuantity) => updateExtra('windows', newQuantity)}
  helperText="7 EUR po prozoru"
/>

// New AreaInput Component for Outdoor Services
<AreaInput
  label="Košnja travnjaka"
  unit="m²"
  pricePerUnit={0.5}
  minPrice={30}
  value={lawnArea}
  onChange={(area) => updateOutdoorService('lawn_mowing', area)}
  helperText="0.50 EUR po m² (min. 30 EUR)"
/>
```

### 5. **Responsive Price Display**

```tsx
// Enhanced PriceCalculator Display
<div className="price-breakdown">
  {/* Service Type Badge */}
  {isRentalService && (
    <ServiceBadge type={serviceType}>
      {serviceType === 'airbnb' ? '🏠 AirBnB Cleaning' : '🔑 Daily Rental'}
    </ServiceBadge>
  )}
  {/* Base Service */}
  <PriceRow
    label={`${service.name} (${propertySize}m²)`}
    amount={basePrice}
    type="base"
  />

  {/* Rental-Specific Services */}
  {rentalFeatures && (
    <>
      {rentalFeatures.laundryService && (
        <PriceRow label="Pranje posteljine" amount={20} type="rental" />
      )}
      {rentalFeatures.suppliesRefill && (
        <PriceRow label="Dopuna potrepština" amount={15} type="rental" />
      )}
      {rentalFeatures.emergencyAvailable && (
        <PriceRow label="24/7 Hitna dostupnost" amount={50} type="rental" />
      )}
    </>
  )}

  {/* Indoor Extras with Quantities */}
  {indoorExtras.map(extra => extra.quantity > 0 && (
    <PriceRow
      label={`${extra.name} (${extra.quantity} ${extra.unit})`}
      amount={extra.total}
      type="extra"
      detail={`${extra.quantity} × ${extra.unitPrice} EUR`}
    />
  ))}

  {/* Outdoor Services */}
  {outdoorServices.map(service => service.area > 0 && (
    <PriceRow
      label={`${service.name} (${service.area}m²)`}
      amount={service.total}
      type="outdoor"
      detail={`${service.area}m² × ${service.pricePerSqm} EUR/m²`}
    />
  ))}

  {/* Subtotal */}
  <Divider />
  <PriceRow label="Međuzbroj" amount={subtotal} type="subtotal" />

  {/* Frequency Discount on Total */}
  {discount > 0 && (
    <PriceRow
      label={`Popust za ${frequencyLabel} (-${discountPercent}%)`}
      amount={-discount}
      type="discount"
    />
  )}

  {/* Distance Fee */}
  {distanceFee > 0 && (
    <PriceRow
      label={`Naknada za udaljenost (${distance}km)`}
      amount={distanceFee}
      type="fee"
    />
  )}

  {/* Final Total */}
  <Divider bold />
  <PriceRow
    label="UKUPNO"
    amount={total}
    type="total"
    size="large"
  />
</div>
```

### 6. **Data Structure Updates**

```typescript
// Service Type Enum
enum ServiceType {
  REGULAR = 'regular',
  DEEP = 'deep',
  AIRBNB = 'airbnb',
  DAILY_RENTAL = 'daily_rental',
  VACATION_RENTAL = 'vacation_rental'
}

// Rental Service Configuration
interface RentalServiceConfig {
  turnaroundTime: {
    urgent: { hours: 2-3, price: 30 },
    standard: { hours: 4-6, price: 0 },
    flexible: { hours: 24, price: -10 }
  };
  requiredExtras: string[];  // Always included services
  optionalExtras: string[];  // Can be added
  pricing: {
    base: number;
    perSqm: number;
    minimum: number;
    weekendSurcharge: number;  // +20% for weekends
    holidaySurcharge: number;  // +30% for holidays
  };
}
```

```typescript
// Updated BookingExtra Interface
interface BookingExtra {
  id: string;
  name: string;
  quantity: number;    // Now supports quantities
  unitPrice: number;   // Price per unit
  unit: string;        // 'piece', 'hour', 'sqm', 'meter'
  category: 'indoor' | 'outdoor';
  total: number;       // quantity × unitPrice
}

// New OutdoorService Interface
interface OutdoorService {
  id: string;
  name: string;
  area?: number;       // For area-based services
  length?: number;     // For linear services (hedge)
  pricePerUnit: number;
  minPrice: number;
  total: number;
}
```

## 📋 Implementation Steps

### Phase 1: Core UI Improvements (Day 1-2)
1. ✅ Create QuantitySelector component
2. ✅ Update extras selection UI with +/- buttons
3. ✅ Add visual quantity indicators
4. ✅ Implement min/max constraints

### Phase 2: Calculation Logic (Day 2-3)
1. ✅ Refactor price calculation function
2. ✅ Add property type multipliers
3. ✅ Fix frequency discount to apply on total
4. ✅ Implement minimum price enforcement

### Phase 3: New Services (Day 3-4)
1. ✅ Add daily rental (jednodnevni najam) cleaning service
2. ✅ Add landscaping service types
3. ✅ Create area input components
4. ✅ Create rental-specific UI components
5. ✅ Integrate all new services in calculator
6. ✅ Update database schema if needed

### Phase 4: Testing & Polish (Day 4-5)
1. ✅ Test all calculation scenarios
2. ✅ Mobile responsiveness
3. ✅ Accessibility improvements
4. ✅ Performance optimization

## 🎨 Visual Mockup

### Standard Services View:
```
┌─────────────────────────────────────────┐
│       💰 Kalkulator Cijene              │
├─────────────────────────────────────────┤
│ [Redovno] [Dubinsko] [🏠AirBnB] [🔑Najam]│
├─────────────────────────────────────────┤
│                                         │
│ 🏠 Osnovna Usluga                      │
│ Dubinsko čišćenje (80m²)    240 EUR   │
│                                         │
│ ➕ Dodatne Usluge                      │
│ ┌─────────────────────────────────┐   │
│ │ 🪟 Prozori      [-] 5 [+]  35€  │   │
│ │    @7€/kom                       │   │
│ └─────────────────────────────────┘   │
│ ┌─────────────────────────────────┐   │
│ │ 🔥 Pećnice      [-] 1 [+]  30€  │   │
│ │    @30€/kom                      │   │
│ └─────────────────────────────────┘   │
│ ┌─────────────────────────────────┐   │
│ │ 👔 Glačanje     [-] 2 [+]  30€  │   │
│ │    @15€/sat                      │   │
│ └─────────────────────────────────┘   │
│                                         │
│ 🌿 Vanjski Radovi                      │
│ ┌─────────────────────────────────┐   │
│ │ 🌱 Košnja travnjaka               │   │
│ │    [___100___] m²         50€    │   │
│ │    @0.50€/m² (min. 30€)          │   │
│ └─────────────────────────────────┘   │
│                                         │
│ ─────────────────────────────────────  │
│ Međuzbroj:                   495 EUR   │
│ Popust (tjedno, -10%):        -49 EUR  │
│ Udaljenost (15km):            +25 EUR  │
│ ─────────────────────────────────────  │
│ 💶 UKUPNO:                   471 EUR   │
│                         po čišćenju    │
└─────────────────────────────────────────┘
```

### AirBnB Cleaning View:
```
┌─────────────────────────────────────────┐
│       💰 AirBnB Kalkulator              │
├─────────────────────────────────────────┤
│ [Redovno] [Dubinsko] [🏠AirBnB✓] [🔑Najam]│
├─────────────────────────────────────────┤
│                                         │
│ 🏠 AirBnB Čišćenje                     │
│ Profesionalno između gostiju           │
│ Stan 60m² × 1.2€/m²          132 EUR   │
│                                         │
│ ⏱️ Vrijeme izvršenja                   │
│ ○ Hitno (2-3h)              +30 EUR    │
│ ● Standard (4-6h)         uključeno    │
│ ○ Fleksibilno (24h)         -10 EUR    │
│                                         │
│ ✅ Uključene usluge:                   │
│ • Kompletno čišćenje                   │
│ • Promjena posteljine                  │
│ • Dezinfekcija površina                │
│                                         │
│ ➕ Dodatne usluge                      │
│ ┌─────────────────────────────────┐   │
│ │ [✓] Pranje posteljine     20€   │   │
│ │ [✓] Dopuna potrepština    15€   │   │
│ │ [ ] Provjera inventara    10€   │   │
│ │ [ ] 24/7 Dostupnost    50€/mj   │   │
│ └─────────────────────────────────┘   │
│                                         │
│ ─────────────────────────────────────  │
│ Osnovna cijena:              132 EUR   │
│ Dodatne usluge:               35 EUR   │
│ Vikend nadoplata (+20%):     +33 EUR   │
│ ─────────────────────────────────────  │
│ 💶 UKUPNO:                   200 EUR   │
│               po čišćenju između gostiju│
└─────────────────────────────────────────┘
```

## 🚦 Success Metrics
- Support for AirBnB and rental property cleaning
- Turnaround time options for urgent cleaning needs
- User can select exact quantities for each extra service
- Outdoor services can be calculated by area/length
- Price calculation is transparent and accurate
- Mobile-friendly interface with touch-optimized controls
- Reduced customer questions about pricing
- Increased conversion rate on booking page

## 🔧 Technical Requirements
- TypeScript for type safety
- React hooks for state management
- Tailwind CSS for styling
- Framer Motion for micro-interactions
- Zod for validation
- React Hook Form for form management

## 📝 Notes
- All prices should be clearly displayed with units
- Minimum prices must be enforced for area-based services
- Consider adding preset packages (e.g., "Standard Package" with common extras)
- Add tooltips explaining what each service includes
- Consider seasonal pricing adjustments for outdoor services
- AirBnB/rental services should have:
  - Weekend and holiday surcharges
  - Turnaround time options
  - Emergency 24/7 availability option
  - Package deals for regular clients
  - Integration with booking calendars