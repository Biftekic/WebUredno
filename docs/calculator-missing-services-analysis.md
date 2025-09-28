# Price Calculator - Missing Service Types Analysis

## Executive Summary
The enhanced price calculator (`PriceCalculatorEnhanced.tsx`) is missing support for **2 out of 9** cleaning service types that are actively promoted on the website.

## Current State

### Services Defined in System (mock-services.ts)
1. ✅ `regular` - Redovno čišćenje
2. ✅ `deep` - Dubinsko čišćenje
3. ✅ `post-renovation` - Čišćenje nakon renovacije
4. ✅ `move-in-out` - Čišćenje za useljenje/iseljenje
5. ❌ **`windows`** - Pranje prozora (MISSING)
6. ❌ **`office`** - Čišćenje ureda (MISSING)
7. ✅ `standard` - Standardno čišćenje
8. ✅ `daily_rental` - Jednodnevni najam
9. ✅ `vacation_rental` - Dubinsko čišćenje najma

### Calculator Support (booking-types-enhanced.ts)
```typescript
export type ServiceTypeEnum =
  | 'regular'
  | 'standard'
  | 'deep'
  | 'post-renovation'
  | 'move-in-out'
  | 'daily_rental'
  | 'vacation_rental';
  // Missing: 'windows' and 'office'
```

## Impact Analysis

### 1. Windows Cleaning Service (`windows`)
**Service Details:**
- Name: Pranje prozora
- Slug: `pranje-prozora`
- Base Price: 0 EUR
- Price per m²: undefined (windows are typically priced per window)
- Min Price: 25 EUR
- Duration: 2 hours

**Current Pricing Logic:**
- Listed as a quantifiable extra: 7 EUR per window
- **Problem:** Should be a standalone bookable service, not just an extra

**Impact:**
- Users cannot book window cleaning as a primary service
- Calculator doesn't handle windows-specific pricing model
- Missing from booking flow service selection

### 2. Office Cleaning Service (`office`)
**Service Details:**
- Name: Čišćenje ureda
- Slug: `ciscenje-ureda`
- Base Price: 0 EUR
- Price per m²: 0.4 EUR/m²
- Min Price: 45 EUR
- Duration: 2 hours

**Current Implementation:**
- Partially handled through PropertyTypeEnum: `'office'` property type exists
- **Problem:** Office cleaning is both a service type AND property type
- Missing dedicated service type logic

**Impact:**
- Office cleaning treated as residential with office property type
- May not apply correct commercial cleaning pricing rules
- Missing office-specific features (recurring schedules, multi-floor handling)

## Missing Features

### Windows Service Should Support:
1. **Per-window pricing** (currently 7 EUR/window as extra)
2. **Interior/exterior options** (single-side vs both sides)
3. **Frame cleaning** included/optional
4. **Minimum service charge** (25 EUR baseline)
5. **Window count selector** (not just quantity)
6. **Multi-story surcharge** (ground floor vs higher floors)

### Office Service Should Support:
1. **Commercial property multiplier** (different from residential office)
2. **After-hours surcharge** (evening/night cleaning)
3. **Recurring schedules** (daily, weekly, monthly contracts)
4. **Multi-floor pricing** (elevator access, stairs)
5. **Common areas** vs private offices
6. **Janitorial supplies** included/provided by client

## Recommended Solution

### Phase 1: Add Missing Service Types
```typescript
// booking-types-enhanced.ts
export type ServiceTypeEnum =
  | 'regular'
  | 'standard'
  | 'deep'
  | 'post-renovation'
  | 'move-in-out'
  | 'windows'        // ADD
  | 'office'         // ADD
  | 'daily_rental'
  | 'vacation_rental';
```

### Phase 2: Implement Windows-Specific Pricing
```typescript
export interface WindowsServiceConfig {
  id: 'windows';
  name: string;
  base_price: number;
  price_per_window: number;
  min_price: number;

  options: {
    interior_only: boolean;
    exterior_only: boolean;
    both_sides: boolean;
    frame_cleaning: boolean;
  };

  floors: {
    ground_floor: number;        // 0 EUR surcharge
    first_floor: number;          // +2 EUR per window
    second_floor_plus: number;    // +5 EUR per window
  };
}
```

### Phase 3: Implement Office-Specific Pricing
```typescript
export interface OfficeServiceConfig {
  id: 'office';
  name: string;
  base_price: number;
  price_per_sqm: number;
  min_price: number;

  multipliers: {
    commercial_property: number;  // 1.2x for business premises
    after_hours: number;          // 1.3x for evening/night
    multi_floor: number;          // 1.1x per additional floor
  };

  recurring_discounts: {
    daily: number;     // -15%
    weekly: number;    // -10%
    biweekly: number;  // -5%
    monthly: number;   // -3%
  };
}
```

### Phase 4: Update Calculator Logic
1. **Add service type detection** in `calculateEnhancedPrice()`
2. **Route to specialized pricing** for windows/office
3. **Display appropriate input fields** (window count, floor level, after-hours toggle)
4. **Show service-specific breakdowns** in calculator display

## Files That Need Updates

### Core Type Definitions
- [ ] `lib/booking-types-enhanced.ts` - Add 'windows' and 'office' to ServiceTypeEnum
- [ ] `lib/booking-types-enhanced.ts` - Add WindowsServiceConfig interface
- [ ] `lib/booking-types-enhanced.ts` - Add OfficeServiceConfig interface

### Calculation Logic
- [ ] `lib/booking-utils-enhanced.ts` - Add calculateWindowsPrice()
- [ ] `lib/booking-utils-enhanced.ts` - Add calculateOfficePrice()
- [ ] `lib/booking-utils-enhanced.ts` - Update calculateEnhancedPrice() routing

### UI Components
- [ ] `components/booking/PriceCalculatorEnhanced.tsx` - Add windows/office display logic
- [ ] `components/booking/WindowsServiceSelector.tsx` - CREATE NEW
- [ ] `components/booking/OfficeServiceSelector.tsx` - CREATE NEW
- [ ] `app/booking/page.tsx` - Add service type selection for windows/office

### Database/API
- [ ] `lib/mock-services.ts` - Verify windows/office service definitions
- [ ] `types/database.ts` - Ensure Service type supports all categories

## Priority & Effort Estimate

| Task | Priority | Effort | Impact |
|------|----------|--------|--------|
| Add service types to enum | P0 | 30 min | High |
| Windows calculator logic | P1 | 2 hours | Medium |
| Office calculator logic | P1 | 2 hours | Medium |
| Windows UI selector | P1 | 1 hour | Medium |
| Office UI selector | P2 | 1 hour | Low |
| Integration testing | P1 | 1 hour | High |

**Total Estimated Effort:** 7.5 hours

## Testing Checklist
- [ ] Windows service bookable from service page
- [ ] Windows pricing accurate (per-window, floor surcharges)
- [ ] Office service bookable with commercial pricing
- [ ] Office recurring schedules apply correct discounts
- [ ] Calculator displays correct breakdowns for both
- [ ] All 9 service types now supported
- [ ] No regression in existing service types

## Notes
- Windows service currently exists as a quantifiable extra (7 EUR/window)
- Consider deprecating windows extra when windows service is implemented
- Office property type exists; service type adds commercial-specific logic
- Both services are actively promoted on homepage and service pages