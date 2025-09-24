# Enhanced Price Calculator - Complete Specification

## Overview
Unified pricing calculator for all cleaning services with real-time updates, VAT separation, and advanced pricing factors based on property conditions and service frequency.

## Core Pricing Structure

### Base Pricing per m²

| Service Type | Price per m² | Base Price | Description |
|--------------|-------------|------------|-------------|
| **Redovno čišćenje** (Regular) | 0.80 €/m² | 35 € | Weekly/bi-weekly maintenance |
| **Standardno čišćenje** (Standard) | 1.00 €/m² | 35 € | Monthly thorough cleaning |
| **Dubinsko čišćenje** (Deep) | 3.00 €/m² | 50 € | Quarterly intensive cleaning |
| **Čišćenje nakon renovacije** (Post-renovation) | 5.00 €/m² | 75 € | Construction cleanup |
| **Čišćenje za useljenje/iseljenje** (Move-in/out) | 4.00 €/m² | 60 € | Complete property preparation |
| **Jednodnevni najam** (Daily rental) | 0.50-1.00 €/m² | 30 € | Based on frequency |
| **Dubinsko čišćenje najma** (Vacation rental deep) | 3.00 €/m² | 50 € | For rental properties |

### Daily Rental Frequency Pricing (Based on Monthly Bookings)
- **< 5 times per month**: 1.00 €/m²
- **5-14 times per month**: 0.80 €/m²
- **15+ times per month**: 0.50 €/m²

## Pricing Multipliers

### "Last Professionally Cleaned" Factor
Applied to **Standard** and **Deep Cleaning** only:

| Time Since Last Cleaned | Multiplier | Impact |
|------------------------|------------|---------|
| < 1 month | 1.00x | No change |
| 1-3 months | 1.15x | +15% |
| 3-6 months | 1.30x | +30% |
| 6-12 months | 1.50x | +50% |
| > 1 year / Never | 1.75x | +75% |

### Property Type Multipliers

| Property Type | Multiplier | Reasoning |
|--------------|------------|-----------|
| Apartment | 1.00x | Standard complexity |
| House | 1.15x | Multiple floors, larger area |
| Office | 1.10x | Commercial requirements |

### Frequency Discounts
Applied to **total price** including all extras:

| Frequency | Discount | Label |
|-----------|----------|-------|
| One-time | 0% | Jednokratno |
| Weekly | 20% | Tjedno |
| Bi-weekly | 15% | Dvotjedno |
| Monthly | 10% | Mjesečno |

## Extra Services Pricing

### Indoor Extras (Quantifiable)

| Service | Unit Price | Unit | Default Qty | Max Qty |
|---------|------------|------|-------------|---------|
| **Windows** | 7 € | per window | 5 | 20 |
| - With blinds | +3 € | per window | - | - |
| **Oven cleaning** | 30 € | per oven | 1 | 2 |
| **Fridge cleaning** | 30 € | per fridge | 1 | 3 |
| **Balcony cleaning** | 30 € | per balcony | 1 | 5 |
| **Ironing** | 15 € | per hour | 1 | 5 |
| **Cabinet interior** | 5 € | per cabinet | 2 | 20 |

### Outdoor Services (Area-based)

| Service | Price per m² | Min Price | Description |
|---------|-------------|-----------|-------------|
| **Lawn mowing** | 0.50 €/m² | 20 € | Regular grass cutting |
| **Garden maintenance** | 0.75 €/m² | 30 € | Weeding, trimming |
| **Leaf removal** | 0.40 €/m² | 15 € | Seasonal service |
| **Hedge trimming** | 1.00 €/m | 25 € | Per linear meter |

## Additional Fees

### Distance Fee
- **0-10 km**: No charge
- **10-20 km**: +10 €
- **20-30 km**: +20 €
- **30+ km**: +30 €

### Time-based Surcharges
- **Weekend (Saturday/Sunday)**: +20% on subtotal
- **Holiday**: +30% on subtotal
- **Same-day booking**: +25% on subtotal
- **Evening (after 18:00)**: +15% on subtotal

## VAT Calculation & Display

### VAT Rate: 25%

### Display Format (Option A):
```
Subtotal:     48.00 €
VAT (25%):    12.00 €
─────────────────────
TOTAL:        60.00 €
```

### Calculation Formula:
```javascript
netPrice = basePrice + extras + fees - discounts
vatAmount = netPrice * 0.25
totalPrice = netPrice + vatAmount
```

## Price Calculation Flow

### Step-by-Step Calculation:

1. **Base Service Price**
   ```
   basePrice = max(serviceFlatRate, propertySize * pricePerM2)
   ```

2. **Apply Property Type Multiplier**
   ```
   adjustedBase = basePrice * propertyTypeMultiplier
   ```

3. **Apply "Last Cleaned" Factor** (Standard/Deep only)
   ```
   cleaningFactorPrice = adjustedBase * lastCleanedMultiplier
   ```

4. **Add Indoor Extras**
   ```
   indoorExtrasTotal = Σ(quantity * unitPrice)
   ```

5. **Add Outdoor Services**
   ```
   outdoorTotal = Σ(max(area * pricePerM2, minPrice))
   ```

6. **Add Distance Fee**
   ```
   distanceFee = calculateByZone(distanceKm)
   ```

7. **Calculate Subtotal**
   ```
   subtotal = cleaningFactorPrice + indoorExtrasTotal + outdoorTotal + distanceFee
   ```

8. **Apply Time Surcharges**
   ```
   surcharges = subtotal * (weekendRate + holidayRate + timingRate)
   ```

9. **Apply Frequency Discount**
   ```
   discount = (subtotal + surcharges) * frequencyDiscountRate
   ```

10. **Calculate VAT**
    ```
    netTotal = subtotal + surcharges - discount
    vat = netTotal * 0.25
    finalTotal = netTotal + vat
    ```

## UI/UX Features

### Real-time Updates
- Price recalculates instantly on any change
- Smooth animations for price changes
- Visual feedback for applied discounts/surcharges

### Price Tooltips
Each price component has explanatory tooltips:

- **Base price**: "Calculated as [size]m² × [rate]€/m²"
- **Last cleaned**: "Property hasn't been cleaned for [period], +[percentage]% adjustment"
- **Frequency discount**: "Save [amount]€ with [frequency] service"
- **VAT**: "25% VAT required by Croatian tax law"
- **Distance fee**: "Location is [distance]km from service center"

### Visual Indicators
- 🟢 Green: Discounts and savings
- 🟡 Yellow: Surcharges and fees
- 🔵 Blue: Informational items
- ⚫ Black: Base prices and totals

### Price Breakdown Sections
1. **Service & Property**
   - Base cleaning service
   - Property adjustments
   - Last cleaned factor

2. **Additional Services**
   - Indoor extras (with quantities)
   - Outdoor services (with areas)

3. **Fees & Adjustments**
   - Distance fee
   - Time-based surcharges

4. **Discounts**
   - Frequency discount
   - Promotional codes (future)

5. **Taxes**
   - Subtotal (net)
   - VAT amount
   - Total (gross)

## Component Architecture

### Main Component
`PriceCalculatorEnhanced.tsx`
- Handles all calculation logic
- Provides real-time updates
- Manages tooltip states

### Sub-components
- `PriceRow.tsx` - Individual price line display
- `PriceTooltip.tsx` - Explanatory tooltips
- `VATDisplay.tsx` - VAT calculation display
- `DiscountBadge.tsx` - Visual discount indicators

### Utilities
- `calculateEnhancedPrice()` - Main calculation function
- `getLastCleanedMultiplier()` - Returns multiplier based on period
- `calculateVAT()` - VAT calculation
- `formatCurrency()` - Consistent EUR formatting

## Implementation Notes

### State Management
```typescript
interface PriceState {
  basePrice: number
  propertyMultiplier: number
  lastCleanedMultiplier: number
  indoorExtras: ExtrasMap
  outdoorServices: ServicesMap
  distanceFee: number
  surcharges: SurchargesMap
  frequencyDiscount: number
  subtotal: number
  vatAmount: number
  total: number
}
```

### Validation Rules
- Minimum property size: 20 m²
- Maximum property size: 500 m²
- Minimum service total: 30 €
- Maximum single booking: 2000 €

### Currency Display
- Always show EUR symbol after amount
- Use 2 decimal places for all amounts
- Thousands separator for amounts > 999
- Example: "1,234.50 €"

## Future Enhancements (Phase 2)

### Predictive Pricing
- "Most [size]m² [type] properties pay between X-Y €"
- Based on historical booking data
- Confidence intervals shown

### Loyalty Program
- Bronze: 5% off after 5 bookings
- Silver: 10% off after 10 bookings
- Gold: 15% off after 20 bookings

### Dynamic Pricing
- Demand-based adjustments
- Seasonal variations
- Capacity optimization

### Multi-currency
- HRK conversion at current rate
- Currency selector
- Localized formatting

## Testing Scenarios

### Basic Calculation Test
- 60m² apartment, standard cleaning
- Expected: 60 € base + 15 € VAT = 75 € total

### Complex Calculation Test
- 100m² house, deep cleaning
- Not cleaned for 6 months (1.3x)
- 10 windows with blinds
- 2 ovens
- Weekly frequency (-20%)
- 15km distance (+10 €)
- Weekend service (+20%)

### Edge Cases
- Minimum size property (20m²)
- Maximum extras selection
- All discounts applied
- All surcharges applied

## Performance Requirements
- Calculation time: < 50ms
- UI update: < 100ms
- Smooth animations: 60 FPS
- Mobile responsive: Yes
- Accessibility: WCAG 2.1 AA

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers: iOS Safari, Chrome Mobile

## Localization
- Primary: Croatian (HR)
- Currency: EUR only
- Date format: DD.MM.YYYY
- Number format: 1.234,50 €