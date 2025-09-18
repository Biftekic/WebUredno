# Component Specifications

## Tech Stack Selection

### UI Framework: shadcn/ui
- **Why**: Modern, accessible, customizable, TypeScript-first
- **Benefits**: Copy-paste components, full control, Tailwind-based
- **Performance**: Tree-shakable, minimal bundle size

### Supporting Libraries
```json
{
  "next": "14.x",
  "react": "18.x",
  "typescript": "5.x",
  "@radix-ui/react-*": "latest",
  "tailwindcss": "3.x",
  "lucide-react": "latest",
  "react-hook-form": "7.x",
  "zod": "3.x",
  "@tanstack/react-query": "5.x",
  "date-fns": "2.x"
}
```

## Reusable Components Specification

### 1. Hero Component
```typescript
// components/shared/Hero.tsx
interface HeroProps {
  title: string;
  subtitle?: string;
  ctaPrimary?: {
    text: string;
    href: string;
  };
  ctaSecondary?: {
    text: string;
    href: string;
  };
  backgroundImage?: string;
  overlay?: boolean;
  stats?: Array<{
    value: string;
    label: string;
  }>;
}

// Usage across pages:
// Homepage: Full hero with stats
// Service pages: Simpler hero without stats
// About page: Hero with team photo background
```

### 2. ServiceCard Component
```typescript
// components/shared/ServiceCard.tsx
interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  price: {
    amount: number;
    currency: string;
    period?: 'jednokratno' | 'mjesečno';
  };
  features: string[];
  highlighted?: boolean;
  badge?: string;
  onSelect?: () => void;
}

// Variants:
// - Grid layout (homepage)
// - List layout (services page)
// - Compact (booking flow)
```

### 3. BookingWizard Component
```typescript
// components/booking/BookingWizard.tsx
interface BookingWizardProps {
  steps: BookingStep[];
  onComplete: (data: BookingData) => Promise<void>;
  googleCalendarEnabled?: boolean;
}

interface BookingStep {
  id: string;
  title: string;
  component: React.ComponentType<StepProps>;
  validation?: ZodSchema;
}

// Steps:
// 1. ServiceSelection
// 2. LocationInput
// 3. DateTimePicker
// 4. ContactForm
// 5. Summary & Payment
```

### 4. TestimonialCard Component
```typescript
// components/shared/TestimonialCard.tsx
interface TestimonialCardProps {
  author: {
    name: string;
    location: string;
    avatar?: string;
  };
  rating: 1 | 2 | 3 | 4 | 5;
  content: string;
  serviceType: string;
  date: Date;
  verified?: boolean;
}

// Display modes:
// - Card (grid layout)
// - Carousel item
// - List item
```

### 5. PriceCalculator Component
```typescript
// components/shared/PriceCalculator.tsx
interface PriceCalculatorProps {
  basePrice: number;
  factors: Array<{
    id: string;
    label: string;
    type: 'multiplier' | 'addition';
    value: number;
  }>;
  onCalculate: (total: number) => void;
}

// Features:
// - Real-time calculation
// - Factor toggles
// - Breakdown display
```

### 6. FAQSection Component
```typescript
// components/shared/FAQSection.tsx
interface FAQSectionProps {
  title?: string;
  items: Array<{
    question: string;
    answer: string;
    category?: string;
  }>;
  defaultOpenIndex?: number;
  allowMultiple?: boolean;
}

// Uses Accordion from shadcn/ui
// Searchable/filterable option
```

### 7. ContactForm Component
```typescript
// components/shared/ContactForm.tsx
interface ContactFormProps {
  fields?: ContactField[];
  onSubmit: (data: ContactData) => Promise<void>;
  successMessage?: string;
  context?: 'booking' | 'inquiry' | 'quote';
}

// Validation with Zod
// React Hook Form integration
// Success/error toasts
```

### 8. LocationSelector Component
```typescript
// components/booking/LocationSelector.tsx
interface LocationSelectorProps {
  areas: Area[];
  onSelect: (area: Area) => void;
  multiple?: boolean;
}

interface Area {
  id: string;
  name: string;
  district?: string;
  available: boolean;
}

// Zagreb districts data
// Interactive map option
```

### 9. CalendarPicker Component
```typescript
// components/booking/CalendarPicker.tsx
interface CalendarPickerProps {
  availableSlots: TimeSlot[];
  onSelect: (slot: TimeSlot) => void;
  minDate?: Date;
  maxDate?: Date;
  googleCalendarIntegration?: boolean;
}

// Features:
// - Available/unavailable dates
// - Time slot selection
// - Google Calendar sync
```

### 10. ServiceChecklist Component
```typescript
// components/shared/ServiceChecklist.tsx
interface ServiceChecklistProps {
  title: string;
  items: Array<{
    text: string;
    included: boolean;
    tooltip?: string;
  }>;
  columns?: 1 | 2 | 3;
}

// Visual indicators
// Tooltips for details
// Responsive columns
```

## Layout Components

### 1. Header/Navigation
```typescript
// components/layout/Header.tsx
- Sticky navigation
- Mobile hamburger menu
- Language switcher (HR/EN)
- CTA button always visible
```

### 2. Footer
```typescript
// components/layout/Footer.tsx
- Service links
- Contact information
- Social media links
- Newsletter signup
- Legal links
```

### 3. Section Wrapper
```typescript
// components/layout/Section.tsx
interface SectionProps {
  variant?: 'default' | 'alternate' | 'gradient';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}
```

## Utility Components

### 1. SEO Component
```typescript
// components/utils/SEO.tsx
interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  openGraph?: OpenGraphData;
  structuredData?: any;
}
```

### 2. Analytics Wrapper
```typescript
// components/utils/Analytics.tsx
- Google Analytics 4
- Event tracking
- Conversion tracking
```

### 3. Loading States
```typescript
// components/utils/LoadingStates.tsx
- Skeleton loaders
- Spinners
- Progress bars
```

## Component Usage Matrix

| Page | Components Used |
|------|----------------|
| Homepage | Hero, ServiceCard (6x), TestimonialCard (3x), FAQSection, ContactForm |
| Services | Hero, ServiceCard (detail), PriceCalculator, ServiceChecklist, CTA |
| Booking | BookingWizard, CalendarPicker, LocationSelector, PriceCalculator |
| About | Hero, TeamCard, Timeline, TestimonialCard |
| Contact | ContactForm, Map, InfoCards, FAQSection |

## Performance Considerations
- Lazy load below-fold components
- Use Next.js Image for all images
- Implement virtual scrolling for long lists
- Cache API responses with React Query
- Code split booking wizard steps