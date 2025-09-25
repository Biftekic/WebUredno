# Pricing Page Implementation Plan - Updated

## Current Pricing Architecture Analysis

### ✅ GOOD: Centralized Pricing Structure
All service prices are centrally defined in two main files:

1. **`/lib/mock-services.ts`** - Main service pricing
   - Contains all service definitions with `price_per_sqm` and `min_price`
   - This is the single source of truth for service pricing
   - Already used by booking calculator and service pages

2. **`/lib/booking-types-enhanced.ts`** - Extra services pricing
   - Indoor extras (windows, oven, fridge, etc.)
   - Outdoor services (lawn, garden, etc.)
   - Property type multipliers
   - Frequency discounts

### ⚠️ Issues to Fix
1. **Outdated SEO prices** in `/config/seo.ts` - shows hourly rates instead of per-m²
2. **Outdated FAQ prices** in `/components/SEO/FAQSchema.tsx` - shows hourly rates
3. **No dedicated pricing page** at `/app/cjenik/page.tsx`

## Implementation Strategy

### Phase 1: Create Pricing Page Using Existing Data

#### 1.1 Create Main Pricing Page
```typescript
// app/cjenik/page.tsx
import { mockServices } from '@/lib/mock-services';
import { QUANTIFIABLE_EXTRAS, LANDSCAPING_SERVICES } from '@/lib/booking-types-enhanced';
```

#### 1.2 Data Flow
```
mock-services.ts → cjenik/page.tsx → PricingCard components
                ↓
    booking-types-enhanced.ts
```

### Phase 2: Component Structure

```typescript
// components/pricing/PricingCard.tsx
interface PricingCardProps {
  service: {
    name: string;
    min_price: number;
    price_per_sqm?: number;
    description: string;
    features: string[];
    category: string;
  }
}
```

### Phase 3: Price Display Format

#### Service Pricing Display
```typescript
// For each service from mock-services.ts
const formatServicePrice = (service) => ({
  minPrice: `od ${service.min_price} €`,
  perSqm: service.price_per_sqm ? `${service.price_per_sqm} €/m²` : null,
  example: service.price_per_sqm ?
    `Primjer: 50m² = ${(service.price_per_sqm * 50).toFixed(0)} €` : null
});
```

#### Extras Pricing Display
```typescript
// From booking-types-enhanced.ts
const formatExtraPrice = (extra) => ({
  name: extra.name,
  price: `${extra.price_per_unit} € po ${extra.unit}`,
  icon: extra.icon
});
```

## File Structure

```
app/
├── cjenik/
│   └── page.tsx                    # Main pricing page
components/
├── pricing/
│   ├── PricingCard.tsx            # Service price card
│   ├── ExtrasCard.tsx             # Extras pricing card
│   ├── PricingGrid.tsx            # Grid layout
│   └── PricingCalculator.tsx      # Quick calculator widget
```

## Implementation Code Structure

### Main Page (`app/cjenik/page.tsx`)
```typescript
import { mockServices } from '@/lib/mock-services';
import {
  QUANTIFIABLE_EXTRAS,
  LANDSCAPING_SERVICES,
  PROPERTY_TYPE_MULTIPLIERS,
  FREQUENCY_OPTIONS
} from '@/lib/booking-types-enhanced';

export default function PricingPage() {
  // Group services by category
  const servicesByCategory = {
    'Redovno': mockServices.filter(s => ['regular', 'standard'].includes(s.category)),
    'Dubinsko': mockServices.filter(s => ['deep', 'post-renovation'].includes(s.category)),
    'Selidbe': mockServices.filter(s => s.category === 'move-in-out'),
    'Najam': mockServices.filter(s => ['daily_rental', 'vacation_rental'].includes(s.category)),
    'Ostalo': mockServices.filter(s => ['windows', 'office'].includes(s.category))
  };

  return (
    <main>
      {/* Hero Section */}
      {/* Service Pricing Cards */}
      {/* Extras Section */}
      {/* Pricing Info */}
    </main>
  );
}
```

## Data Sources Summary

| Data Type | Source File | Import Path |
|-----------|------------|-------------|
| Service Prices | `mock-services.ts` | `@/lib/mock-services` |
| Indoor Extras | `booking-types-enhanced.ts` | `@/lib/booking-types-enhanced` |
| Outdoor Services | `booking-types-enhanced.ts` | `@/lib/booking-types-enhanced` |
| Property Multipliers | `booking-types-enhanced.ts` | `@/lib/booking-types-enhanced` |
| Frequency Discounts | `booking-utils-enhanced.ts` | `@/lib/booking-utils-enhanced` |

## Price Update Workflow

When prices need to be updated:
1. Update `/lib/mock-services.ts` for service prices
2. Update `/lib/booking-types-enhanced.ts` for extras
3. All pages automatically reflect new prices:
   - Booking calculator
   - Services page
   - New pricing page
   - Service cards

## Mobile-First Design Specs

### Card Layout
```
Mobile (320px+): 1 column, full width cards
Tablet (768px+): 2 columns
Desktop (1024px+): 3 columns
```

### Price Display Hierarchy
```
1. Service Name (18px bold)
2. Minimum Price (24px bold, green)
3. Per m² Price (14px, gray)
4. Example Calculation (12px, gray italic)
```

## Implementation Steps

1. **Create `/app/cjenik/page.tsx`** (30 min)
   - Import data from mock-services
   - Group by categories
   - Add metadata for SEO

2. **Create PricingCard component** (20 min)
   - Display min_price and price_per_sqm
   - Mobile-optimized layout
   - Expandable features list

3. **Create ExtrasCard component** (20 min)
   - Display indoor extras
   - Display outdoor services
   - Group by type

4. **Add pricing information section** (15 min)
   - Property type multipliers
   - Frequency discounts
   - Distance fees

5. **Test and optimize** (15 min)
   - Mobile responsiveness
   - Performance
   - Accessibility

## Total Time: ~1.5 hours

## Benefits of This Approach

1. **No Data Duplication**: Uses existing centralized pricing
2. **Automatic Updates**: Changes in mock-services reflect everywhere
3. **Consistent Pricing**: Single source of truth
4. **Easy Maintenance**: Update prices in one place
5. **Type Safety**: TypeScript interfaces ensure consistency

## Next Steps After Implementation

1. **Fix Outdated Prices**:
   - Update `/config/seo.ts` to use data from mock-services
   - Update FAQ schema to reflect current pricing

2. **Add Database Support**:
   - When Supabase is connected, prices come from database
   - Mock services remain as fallback

3. **Future Enhancements**:
   - Interactive calculator on pricing page
   - Seasonal pricing adjustments
   - Bundle deals