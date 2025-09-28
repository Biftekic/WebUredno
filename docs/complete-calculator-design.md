# Complete Price Calculator Design Specification

## Overview
Comprehensive design for supporting all 9 cleaning service types with specialized pricing logic, UI components, and calculation methods.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Booking Page (Entry Point)                 │
│  - Service type detection from URL/selection            │
│  - Route to appropriate calculator configuration        │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴───────────┐
        │                        │
        v                        v
┌───────────────┐        ┌──────────────────┐
│  Service      │        │  Calculator      │
│  Selectors    │        │  Router          │
│               │        │                  │
│  - Standard   │        │  Routes to:      │
│  - Windows    │◄───────┤  - Standard calc │
│  - Office     │        │  - Windows calc  │
│  - Rental     │        │  - Office calc   │
└───────────────┘        │  - Rental calc   │
                         └──────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    v            v            v
           ┌────────────┐ ┌──────────┐ ┌──────────┐
           │  Standard  │ │ Windows  │ │  Office  │
           │  Pricing   │ │ Pricing  │ │ Pricing  │
           │  Logic     │ │ Logic    │ │ Logic    │
           └────────────┘ └──────────┘ └──────────┘
                    │            │            │
                    └────────────┼────────────┘
                                 │
                                 v
                    ┌────────────────────────┐
                    │  Unified Price         │
                    │  Breakdown Display     │
                    └────────────────────────┘
```

## Service Type Matrix

| Service Type | Category | Input Model | Pricing Model | Complexity |
|--------------|----------|-------------|---------------|------------|
| regular | Standard | Area (m²) | Per m² + min | Low |
| standard | Standard | Area (m²) | Per m² + min + multipliers | Medium |
| deep | Standard | Area (m²) + last cleaned | Per m² + min + multipliers | Medium |
| post-renovation | Standard | Area (m²) | Per m² + min | Medium |
| move-in-out | Standard | Area (m²) | Per m² + min | Medium |
| **windows** | Specialized | Window count + floors | Per window + floor surcharge | **High** |
| **office** | Specialized | Area (m²) + features | Per m² + commercial multipliers | **High** |
| daily_rental | Rental | Area (m²) + features | Per m² + rental extras | High |
| vacation_rental | Rental | Area (m²) + features | Per m² + rental extras | High |

## Detailed Service Specifications

### 1. Standard Services (regular, standard, deep, post-renovation, move-in-out)

**Current Implementation:** ✅ Complete

**Inputs:**
- Property size (m²)
- Property type (apartment/house/office)
- Indoor extras (quantifiable)
- Outdoor services (area-based)
- Frequency
- Distance

**Pricing:**
```typescript
basePrice = propertySize * pricePerSqm * propertyTypeMultiplier
+ indoorExtras
+ outdoorServices
+ distanceFee
- frequencyDiscount
= total
```

### 2. Windows Service ⚠️ NEEDS IMPLEMENTATION

**Inputs Required:**
```typescript
interface WindowsBookingInput {
  // Core
  windowCount: number;              // 1-50 windows
  serviceType: 'interior' | 'exterior' | 'both';

  // Property details
  floorLevel: 'ground' | 'first' | 'second_plus';
  framesCleaning: boolean;
  sillsCleaning: boolean;

  // Optional
  balconyDoors: number;             // Glass doors (count as 2 windows)
  skylights: number;                // Roof windows (+50% per skylight)

  // Location
  distanceKm: number;
  frequency: FrequencyEnum;
}
```

**Pricing Logic:**
```typescript
function calculateWindowsPrice(input: WindowsBookingInput) {
  // Base per-window price
  const basePerWindow = 7; // EUR

  // Service type multiplier
  const serviceMultiplier = {
    'interior': 1.0,
    'exterior': 1.2,   // +20% for exterior (harder access)
    'both': 1.8,       // Both sides (not just 2x, efficiency gain)
  }[input.serviceType];

  // Floor surcharge
  const floorSurcharge = {
    'ground': 0,
    'first': 2,        // +2 EUR per window
    'second_plus': 5,  // +5 EUR per window
  }[input.floorLevel];

  // Calculate window costs
  let windowsTotal = input.windowCount * (basePerWindow * serviceMultiplier + floorSurcharge);

  // Balcony doors (count as 2 windows)
  windowsTotal += input.balconyDoors * 2 * (basePerWindow * serviceMultiplier + floorSurcharge);

  // Skylights (harder access, +50%)
  windowsTotal += input.skylights * (basePerWindow * 1.5 * serviceMultiplier + floorSurcharge * 1.5);

  // Optional extras
  const framesCost = input.framesCleaning ? input.windowCount * 1.5 : 0;
  const sillsCost = input.sillsCleaning ? input.windowCount * 1.0 : 0;

  // Subtotal
  const subtotal = windowsTotal + framesCost + sillsCost;

  // Minimum price enforcement
  const minPrice = 25;
  const subtotalWithMin = Math.max(subtotal, minPrice);

  // Distance fee (same as other services)
  const distanceFee = input.distanceKm > 10 ? (input.distanceKm - 10) * 1.5 : 0;

  // Frequency discount
  const frequencyDiscount = calculateFrequencyDiscount(subtotalWithMin, input.frequency);

  // Final total
  const total = subtotalWithMin + distanceFee - frequencyDiscount;

  return {
    breakdown: {
      windowsBase: windowsTotal,
      balconyDoors: input.balconyDoors * 2 * (basePerWindow * serviceMultiplier + floorSurcharge),
      skylights: input.skylights * (basePerWindow * 1.5 * serviceMultiplier + floorSurcharge * 1.5),
      frames: framesCost,
      sills: sillsCost,
      subtotal: subtotalWithMin,
      distanceFee,
      frequencyDiscount,
      total
    },
    details: {
      windowCount: input.windowCount,
      pricePerWindow: basePerWindow * serviceMultiplier + floorSurcharge,
      serviceType: input.serviceType,
      floorLevel: input.floorLevel
    }
  };
}
```

**UI Component:**
```tsx
// components/booking/WindowsServiceSelector.tsx
interface WindowsServiceSelectorProps {
  onUpdate: (input: WindowsBookingInput) => void;
}

// Inputs:
// - Window count slider (1-50)
// - Service type radio: Interior / Exterior / Both Sides
// - Floor level selector
// - Checkboxes: Frames cleaning, Sills cleaning
// - Optional: Balcony doors count, Skylights count
```

### 3. Office Service ⚠️ NEEDS IMPLEMENTATION

**Inputs Required:**
```typescript
interface OfficeBookingInput {
  // Core
  propertySize: number;                    // Total office area (m²)
  officeType: 'single' | 'open_plan' | 'mixed';

  // Space breakdown
  privateOffices: number;                  // Count of private offices
  commonAreas: boolean;                    // Hallways, break rooms
  bathrooms: number;                       // Number of bathrooms
  kitchenette: boolean;

  // Schedule
  cleaningTime: 'business_hours' | 'after_hours' | 'weekend';
  frequency: FrequencyEnum;

  // Floors
  floorCount: number;                      // Multi-floor offices
  elevatorAccess: boolean;

  // Services
  supplies: 'client_provided' | 'we_provide';
  trashRemoval: boolean;
  recyclingManagement: boolean;

  // Location
  distanceKm: number;
}
```

**Pricing Logic:**
```typescript
function calculateOfficePrice(input: OfficeBookingInput) {
  // Base commercial rate
  const basePricePerSqm = 0.4; // EUR/m² (lower than residential)

  // Office type multiplier
  const officeTypeMultiplier = {
    'single': 1.0,           // Single office, simpler
    'open_plan': 0.9,        // Open plan, easier access
    'mixed': 1.05,           // Mixed layout, more complex
  }[input.officeType];

  // Time slot surcharge
  const timeSlotMultiplier = {
    'business_hours': 1.0,
    'after_hours': 1.3,      // +30% for evenings
    'weekend': 1.5,          // +50% for weekends
  }[input.cleaningTime];

  // Multi-floor multiplier
  const floorMultiplier = input.floorCount > 1
    ? 1 + ((input.floorCount - 1) * 0.05) // +5% per additional floor
    : 1.0;

  // No elevator penalty
  const elevatorPenalty = !input.elevatorAccess && input.floorCount > 1
    ? 1.1  // +10% if no elevator and multi-floor
    : 1.0;

  // Calculate base price
  let basePrice = input.propertySize
    * basePricePerSqm
    * officeTypeMultiplier
    * timeSlotMultiplier
    * floorMultiplier
    * elevatorPenalty;

  // Private offices extra care
  const privateOfficesExtra = input.privateOffices * 5; // +5 EUR per private office

  // Common areas extra
  const commonAreasExtra = input.commonAreas ? 15 : 0;

  // Bathroom cleaning (per bathroom)
  const bathroomsExtra = input.bathrooms * 10;

  // Kitchenette cleaning
  const kitchenetteExtra = input.kitchenette ? 15 : 0;

  // Supply provision
  const suppliesExtra = input.supplies === 'we_provide' ? 20 : 0;

  // Trash & recycling
  const trashExtra = input.trashRemoval ? 5 : 0;
  const recyclingExtra = input.recyclingManagement ? 5 : 0;

  // Subtotal
  const subtotal = basePrice
    + privateOfficesExtra
    + commonAreasExtra
    + bathroomsExtra
    + kitchenetteExtra
    + suppliesExtra
    + trashExtra
    + recyclingExtra;

  // Minimum price for commercial (higher than residential)
  const minPrice = 45;
  const subtotalWithMin = Math.max(subtotal, minPrice);

  // Distance fee
  const distanceFee = input.distanceKm > 10 ? (input.distanceKm - 10) * 1.5 : 0;

  // Commercial frequency discounts (more generous for recurring)
  const frequencyDiscountRate = {
    'one-time': 0,
    'daily': 0.20,      // -20% for daily
    'weekly': 0.15,     // -15% for weekly
    'biweekly': 0.10,   // -10% for biweekly
    'monthly': 0.05,    // -5% for monthly
  }[input.frequency] || 0;

  const frequencyDiscount = subtotalWithMin * frequencyDiscountRate;

  // Final total
  const total = subtotalWithMin + distanceFee - frequencyDiscount;

  return {
    breakdown: {
      basePrice,
      privateOfficesExtra,
      commonAreasExtra,
      bathroomsExtra,
      kitchenetteExtra,
      suppliesExtra,
      trashExtra,
      recyclingExtra,
      subtotal: subtotalWithMin,
      distanceFee,
      frequencyDiscount,
      total
    },
    details: {
      propertySize: input.propertySize,
      pricePerSqm: basePricePerSqm,
      officeType: input.officeType,
      timeSlot: input.cleaningTime,
      totalMultiplier: officeTypeMultiplier * timeSlotMultiplier * floorMultiplier * elevatorPenalty
    }
  };
}
```

**UI Component:**
```tsx
// components/booking/OfficeServiceSelector.tsx
interface OfficeServiceSelectorProps {
  onUpdate: (input: OfficeBookingInput) => void;
}

// Inputs:
// - Office size (m²)
// - Office type selector
// - Private offices count
// - Checkboxes: Common areas, Kitchenette, Trash removal, Recycling
// - Bathroom count
// - Floor count
// - Elevator access checkbox
// - Time slot selector (business hours / after hours / weekend)
// - Supply provision radio
```

## Calculator Router Logic

```typescript
// lib/booking-utils-enhanced.ts
export function calculateServicePrice(
  serviceType: ServiceTypeEnum,
  input: StandardInput | WindowsInput | OfficeInput | RentalInput
): PriceCalculation {
  switch (serviceType) {
    case 'regular':
    case 'standard':
    case 'deep':
    case 'post-renovation':
    case 'move-in-out':
      return calculateStandardPrice(input as StandardInput);

    case 'windows':
      return calculateWindowsPrice(input as WindowsInput);

    case 'office':
      return calculateOfficePrice(input as OfficeInput);

    case 'daily_rental':
    case 'vacation_rental':
      return calculateRentalPrice(serviceType, input as RentalInput);

    default:
      throw new Error(`Unsupported service type: ${serviceType}`);
  }
}
```

## Price Breakdown Display

```tsx
// components/booking/PriceCalculatorEnhanced.tsx
function renderPriceBreakdown(serviceType: ServiceTypeEnum, breakdown: PriceCalculation) {
  // Common sections for all services
  const commonSections = (
    <>
      {breakdown.distanceFee > 0 && (
        <PriceRow label="Naknada za udaljenost" amount={breakdown.distanceFee} type="fee" />
      )}
      {breakdown.frequencyDiscount > 0 && (
        <PriceRow label="Popust za učestalost" amount={breakdown.frequencyDiscount} type="discount" />
      )}
    </>
  );

  // Service-specific breakdown
  switch (serviceType) {
    case 'windows':
      return (
        <>
          <PriceRow label="Prozori" amount={breakdown.windowsBase} detail={`${breakdown.details.windowCount} × ${breakdown.details.pricePerWindow} EUR`} />
          {breakdown.frames > 0 && <PriceRow label="Čišćenje okvira" amount={breakdown.frames} type="extra" />}
          {breakdown.sills > 0 && <PriceRow label="Čišćenje prozorskih dasaka" amount={breakdown.sills} type="extra" />}
          {commonSections}
          <PriceRow label="UKUPNO" amount={breakdown.total} type="total" size="large" />
        </>
      );

    case 'office':
      return (
        <>
          <PriceRow label="Osnovno čišćenje" amount={breakdown.basePrice} detail={`${breakdown.details.propertySize}m² × ${breakdown.details.pricePerSqm} EUR/m² × ${breakdown.details.totalMultiplier.toFixed(2)}`} />
          {breakdown.privateOfficesExtra > 0 && <PriceRow label="Privatni uredi" amount={breakdown.privateOfficesExtra} type="extra" />}
          {breakdown.commonAreasExtra > 0 && <PriceRow label="Zajednički prostori" amount={breakdown.commonAreasExtra} type="extra" />}
          {breakdown.bathroomsExtra > 0 && <PriceRow label="Sanitarije" amount={breakdown.bathroomsExtra} type="extra" />}
          {breakdown.suppliesExtra > 0 && <PriceRow label="Proizvodi za čišćenje" amount={breakdown.suppliesExtra} type="extra" />}
          {commonSections}
          <PriceRow label="UKUPNO" amount={breakdown.total} type="total" size="large" />
        </>
      );

    // ... other service types
  }
}
```

## Implementation Plan

### Phase 1: Type Definitions (1 hour)
1. Add 'windows' and 'office' to ServiceTypeEnum
2. Create WindowsBookingInput interface
3. Create OfficeBookingInput interface
4. Create WindowsServiceConfig interface
5. Create OfficeServiceConfig interface

**Files:**
- `lib/booking-types-enhanced.ts`

### Phase 2: Calculation Logic (3 hours)
1. Implement calculateWindowsPrice()
2. Implement calculateOfficePrice()
3. Update calculateServicePrice() router
4. Add unit tests for both calculators

**Files:**
- `lib/booking-utils-enhanced.ts`
- `__tests__/booking-utils-enhanced.test.ts` (create)

### Phase 3: UI Components (3 hours)
1. Create WindowsServiceSelector component
2. Create OfficeServiceSelector component
3. Update PriceCalculatorEnhanced to display breakdowns
4. Add service type routing in booking page

**Files:**
- `components/booking/WindowsServiceSelector.tsx` (create)
- `components/booking/OfficeServiceSelector.tsx` (create)
- `components/booking/PriceCalculatorEnhanced.tsx`
- `app/booking/page.tsx`

### Phase 4: Integration & Testing (1.5 hours)
1. Test windows service booking flow
2. Test office service booking flow
3. Verify all 9 service types work
4. Cross-browser testing
5. Mobile responsiveness check

**Total Estimated Time:** 8.5 hours

## Testing Scenarios

### Windows Service Testing
- [ ] 5 windows, interior only, ground floor = 35 EUR
- [ ] 10 windows, both sides, ground floor = 126 EUR
- [ ] 8 windows, exterior, first floor = 112 EUR
- [ ] 3 windows + 1 balcony door + 2 skylights, both sides, second floor = ?
- [ ] Minimum price enforcement (1 window = 25 EUR)
- [ ] Weekly frequency discount applied correctly

### Office Service Testing
- [ ] 50m² single office, business hours, ground floor = 45 EUR (min)
- [ ] 200m² open plan, after hours, 3 floors, elevator = ?
- [ ] 150m² mixed, weekend, 2 floors, no elevator, supplies provided = ?
- [ ] Daily recurring discount (-20%) applied correctly
- [ ] Private offices and common areas extras calculated

## Migration Notes

**Windows Service:**
- Currently exists as quantifiable extra (7 EUR/window)
- After implementation, deprecate windows extra option
- Redirect /services/pranje-prozora to new calculator

**Office Service:**
- Currently handled as property type, not service type
- Property type 'office' remains for residential offices in commercial buildings
- New service type 'office' is for dedicated commercial cleaning

## Success Criteria
✅ All 9 service types bookable
✅ Each service has appropriate input fields
✅ Calculations are accurate and transparent
✅ Price breakdowns show all components
✅ No regression in existing services
✅ Mobile-responsive UI
✅ All tests passing