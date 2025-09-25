# Pricing Page (Cjenik) Implementation Plan

## Overview
Implementation of a mobile-first pricing page (`/cjenik`) that displays transparent service pricing with minimum prices and per-square-meter rates. The page will be accessible via the bottom navigation bar on mobile devices.

## Current State Analysis

### ✅ Existing Assets
- **Pricing Data**: Complete pricing structure in `lib/mock-services.ts`
  - `price_per_sqm`: Price per square meter for each service
  - `min_price`: Minimum price for each service
  - Service categories and descriptions

- **Bottom Navigation**: Link already exists in `MobileBottomNav.tsx` (line 41)
  ```tsx
  { href: '/cjenik', label: 'Cjenik', icon: Euro }
  ```

- **Price Calculator**: Advanced calculation logic in `lib/booking-utils-enhanced.ts`
  - Property type multipliers
  - Frequency discounts
  - Distance fees

### ❌ Missing Components
- No `/app/cjenik/page.tsx` file
- No dedicated pricing display component
- No mobile-optimized price cards

## Design Requirements

### Mobile-First Approach
1. **Primary Target**: Mobile devices (bottom nav users)
2. **Screen Sizes**: 320px minimum width
3. **Touch Targets**: Minimum 44x44px for interactive elements
4. **Scrolling**: Vertical only, no horizontal scroll
5. **Performance**: Lazy loading for images, minimal JavaScript

### Pricing Display Format
```
Service Name
━━━━━━━━━━━━━━━━━━━━━
Od: 35 €        (minimum price)
Po m²: 0.80 €   (if applicable)
```

## Implementation Structure

### File Structure
```
app/
├── cjenik/
│   └── page.tsx                 # Main pricing page
components/
├── pricing/
│   ├── PricingCard.tsx         # Individual service price card
│   ├── PricingGrid.tsx         # Grid container for cards
│   ├── PricingHeader.tsx       # Page hero section
│   └── PricingFAQ.tsx          # Common pricing questions
```

## Detailed Implementation Plan

### Phase 1: Basic Page Structure (Priority: HIGH)

#### 1.1 Create Main Page (`app/cjenik/page.tsx`)
```tsx
// Key features:
- Server component for SEO
- Import services from mock-services
- Mobile-first responsive layout
- Metadata for SEO
```

#### 1.2 Page Sections
1. **Hero Section**
   - Title: "Cjenik Usluga"
   - Subtitle: "Transparentne cijene bez skrivenih troškova"
   - Coverage note: "Pokrivamo Zagreb i okolicu do 70km"

2. **Service Categories**
   - Redovno čišćenje
   - Dubinsko čišćenje
   - Posebne usluge
   - Najam nekretnina

3. **Price Cards Layout**
   - Mobile: 1 column
   - Tablet: 2 columns
   - Desktop: 3 columns

### Phase 2: Component Development

#### 2.1 PricingCard Component
```tsx
interface PricingCardProps {
  service: {
    name: string;
    category: string;
    min_price: number;
    price_per_sqm?: number;
    description: string;
    features: string[];
    duration_hours: number;
  }
}

// Display elements:
- Service name (prominent)
- Category badge
- Minimum price (od X €)
- Price per m² (if applicable)
- Duration estimate
- Key features (collapsible on mobile)
- "Rezerviraj" CTA button
```

#### 2.2 Mobile Optimizations
- **Card Design**: Full width on mobile with padding
- **Typography**:
  - Service name: 18px bold
  - Prices: 16px medium
  - Description: 14px regular
- **Spacing**: Generous touch targets
- **Interactions**: Tap to expand features

### Phase 3: Pricing Display Logic

#### 3.1 Service Grouping
```typescript
const serviceGroups = {
  'Osnovno': ['regular', 'standard'],
  'Dubinsko': ['deep', 'post-renovation'],
  'Selidbe': ['move-in-out'],
  'Najam': ['daily_rental', 'vacation_rental'],
  'Posebno': ['windows', 'office']
}
```

#### 3.2 Price Formatting
```typescript
// Minimum price display
const formatMinPrice = (price: number) => `od ${price} €`

// Per m² price display
const formatPerSqm = (price: number) => `${price.toFixed(2)} €/m²`

// Example calculation display
const exampleCalc = (pricePerSqm: number, size: number = 50) =>
  `Primjer: ${size}m² = ${(pricePerSqm * size).toFixed(0)} €`
```

### Phase 4: Additional Features

#### 4.1 Pricing Information Section
- Property type multipliers explanation
- Frequency discounts table
- Distance fees breakdown
- Payment methods accepted

#### 4.2 FAQ Section
Common questions:
1. "Kako se izračunava cijena?"
2. "Što je uključeno u cijenu?"
3. "Postoje li popusti za redovite klijente?"
4. "Kako funkcionira naplata po kvadratu?"
5. "Dodatne usluge i troškovi"

#### 4.3 Call-to-Action
- Floating "Rezerviraj Termin" button on mobile
- Link to booking page with calculator
- WhatsApp quick contact

## Component Specifications

### PricingCard Design
```
┌─────────────────────────────┐
│ [Category Badge]            │
│                             │
│ Service Name                │
│ ─────────────               │
│                             │
│ 💰 Od: 35 €                │
│ 📐 Po m²: 0.80 €          │
│ ⏱️ Trajanje: ~2 sata       │
│                             │
│ [▼ Što uključuje]          │
│                             │
│ ┌─────────────────────┐    │
│ │   Rezerviraj →     │    │
│ └─────────────────────┘    │
└─────────────────────────────┘
```

### Mobile Layout (320px - 768px)
```
[Header]
[Hero Section]
[Service Cards - 1 col]
[Info Section]
[FAQ]
[CTA]
[Footer]
```

### Tablet/Desktop (768px+)
```
[Header]
[Hero Section]
[Service Cards - 2/3 cols]
[Info Section - 2 cols]
[FAQ - Accordion]
[Footer]
```

## Technical Implementation

### Data Flow
1. Import services from `lib/mock-services.ts`
2. Group by category
3. Sort by `display_order`
4. Render cards with pricing info

### SEO Optimization
```tsx
export const metadata: Metadata = {
  title: 'Cjenik - Uredno.eu | Cijene Čišćenja u Zagrebu',
  description: 'Transparentan cjenik usluga čišćenja. Od 35€ za redovno čišćenje. Bez skrivenih troškova. Zagreb i okolica do 70km.',
  keywords: 'cjenik čišćenja, cijene čišćenja zagreb, koliko košta čišćenje',
}
```

### Performance Considerations
- Static generation for pricing page
- Lazy load service descriptions
- Optimize for Core Web Vitals
- Minimize JavaScript bundle

## Implementation Steps

### Step 1: Create Basic Page (30 min)
- [ ] Create `/app/cjenik/page.tsx`
- [ ] Add metadata and basic structure
- [ ] Import mock services data

### Step 2: Build Components (45 min)
- [ ] Create `PricingCard.tsx`
- [ ] Create `PricingGrid.tsx`
- [ ] Implement responsive layout

### Step 3: Add Pricing Logic (30 min)
- [ ] Format prices correctly
- [ ] Group services by category
- [ ] Add calculation examples

### Step 4: Mobile Optimization (30 min)
- [ ] Test on various devices
- [ ] Optimize touch targets
- [ ] Ensure smooth scrolling

### Step 5: Final Polish (30 min)
- [ ] Add FAQ section
- [ ] Implement CTA buttons
- [ ] Test navigation flow

## Success Metrics
- Page loads in < 2 seconds on 3G
- All prices clearly visible without horizontal scroll
- Touch targets meet 44x44px minimum
- SEO score > 90 in Lighthouse
- Zero CLS (Cumulative Layout Shift)

## Future Enhancements (Phase 2)
- Interactive price calculator widget
- Comparison table for service types
- Seasonal pricing adjustments
- Bundle deals display
- Customer reviews integration
- Online booking integration

## Notes
- Keep design consistent with existing brand
- Use existing color scheme (green primary)
- Ensure accessibility (WCAG 2.1 AA)
- Test with real device bottom navigation
- Consider adding schema markup for local business pricing