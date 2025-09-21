# Frontend Implementation Guide - WebUredno

## Table of Contents
1. [Component Architecture](#1-component-architecture)
2. [Page Implementations](#2-page-implementations)
3. [Styling System](#3-styling-system)
4. [Forms & Validation](#4-forms--validation)
5. [Performance Optimizations](#5-performance-optimizations)
6. [Implementation Checklist](#6-implementation-checklist)

---

## 1. Component Architecture

### 1.1 Component Hierarchy

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx           # Main navigation header
│   │   ├── Footer.tsx           # Site footer with links
│   │   ├── Navigation.tsx       # Desktop/mobile navigation
│   │   └── MobileMenu.tsx       # Mobile hamburger menu
│   │
│   ├── booking/
│   │   ├── BookingForm.tsx      # Multi-step booking wizard [✅ Exists]
│   │   ├── ServiceStep.tsx      # Step 1: Service selection
│   │   ├── DateTimeStep.tsx     # Step 2: Date/time picker
│   │   ├── ContactStep.tsx      # Step 3: Contact info
│   │   ├── AddressStep.tsx      # Step 4: Address details
│   │   ├── ReviewStep.tsx       # Step 5: Review & confirm
│   │   ├── SuccessStep.tsx      # Step 6: Confirmation
│   │   └── PricingDisplay.tsx   # Real-time pricing component
│   │
│   ├── ui/
│   │   ├── Button.tsx           # Button component variants
│   │   ├── Card.tsx             # Card container component
│   │   ├── Input.tsx            # Form input component
│   │   ├── Select.tsx           # Dropdown select component
│   │   ├── Checkbox.tsx         # Checkbox component
│   │   ├── Radio.tsx            # Radio button component
│   │   ├── Modal.tsx            # Modal dialog component
│   │   ├── Toast.tsx            # Toast notification
│   │   ├── Skeleton.tsx         # Loading skeleton
│   │   ├── Spinner.tsx          # Loading spinner
│   │   ├── Badge.tsx            # Status/label badge
│   │   ├── Accordion.tsx        # Accordion/collapsible
│   │   └── Tabs.tsx             # Tab navigation component
│   │
│   ├── home/
│   │   ├── HeroSection.tsx      # Homepage hero banner
│   │   ├── ServicesGrid.tsx     # Service cards display
│   │   ├── HowItWorks.tsx       # 3-step process
│   │   ├── Testimonials.tsx     # Customer reviews
│   │   ├── FAQ.tsx              # Frequently asked questions
│   │   └── CTASection.tsx       # Call-to-action sections
│   │
│   ├── services/
│   │   ├── ServiceCard.tsx      # Individual service card
│   │   ├── ServiceDetails.tsx   # Service detail view
│   │   ├── PricingTable.tsx     # Service pricing table
│   │   └── AddOnsList.tsx       # Add-on services list
│   │
│   ├── pricing/
│   │   ├── PricingCalculator.tsx # Interactive price calculator
│   │   ├── FrequencySelector.tsx # Frequency discount selector
│   │   ├── PropertyInputs.tsx    # Size/rooms inputs
│   │   └── PriceSummary.tsx      # Price breakdown display
│   │
│   ├── contact/
│   │   ├── ContactForm.tsx       # Contact form component
│   │   ├── ContactInfo.tsx       # Contact details display
│   │   ├── BusinessHours.tsx     # Operating hours display
│   │   └── LocationMap.tsx       # Google Maps embed
│   │
│   └── common/
│       ├── SEOHead.tsx           # SEO meta tags component
│       ├── ErrorBoundary.tsx     # Error boundary wrapper
│       ├── LoadingState.tsx      # Loading state component
│       └── BackToTop.tsx         # Scroll to top button
```

### 1.2 Reusable UI Components

#### Button Component Variants
```typescript
// components/ui/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size: 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
  loading?: boolean
  disabled?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

// Usage examples:
<Button variant="primary" size="lg">Rezerviraj čišćenje</Button>
<Button variant="outline" leftIcon={<PhoneIcon />}>Nazovi nas</Button>
<Button variant="ghost" loading>Učitavanje...</Button>
```

#### Card Component System
```typescript
// components/ui/Card.tsx
interface CardProps {
  variant?: 'default' | 'bordered' | 'elevated' | 'interactive'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
}

// Composition pattern:
<Card variant="elevated">
  <Card.Header>
    <Card.Title>Standardno čišćenje</Card.Title>
    <Card.Badge>Najpopularnije</Card.Badge>
  </Card.Header>
  <Card.Body>
    <Card.Description>Redovito održavanje...</Card.Description>
    <Card.Price>€15/sat po osobi</Card.Price>
  </Card.Body>
  <Card.Footer>
    <Button fullWidth>Rezerviraj</Button>
  </Card.Footer>
</Card>
```

### 1.3 Component Composition Patterns

#### Multi-Step Form Pattern
```typescript
// Shared step wrapper for consistency
interface StepWrapperProps {
  title: string
  description: string
  stepNumber: number
  totalSteps: number
  children: React.ReactNode
  onNext: () => void
  onBack?: () => void
}

const StepWrapper: React.FC<StepWrapperProps> = ({
  title,
  description,
  stepNumber,
  totalSteps,
  children,
  onNext,
  onBack
}) => (
  <div className="min-h-[500px] flex flex-col">
    {/* Progress indicator */}
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-600">
          Korak {stepNumber} od {totalSteps}
        </span>
        <span className="text-sm font-medium">
          {Math.round((stepNumber / totalSteps) * 100)}%
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
        />
      </div>
    </div>

    {/* Step content */}
    <div className="flex-1">
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-gray-600 mb-6">{description}</p>
      {children}
    </div>

    {/* Navigation buttons */}
    <div className="flex justify-between mt-8">
      {onBack && (
        <Button variant="outline" onClick={onBack}>
          Natrag
        </Button>
      )}
      <Button
        variant="primary"
        onClick={onNext}
        className={!onBack ? 'ml-auto' : ''}
      >
        Dalje
      </Button>
    </div>
  </div>
)
```

### 1.4 State Management Approach

#### Local State Management

### 1.5 Recently Implemented Components (Phase 1 Complete)

#### Trust Signals & Social Proof Components
**Location**: `src/components/ui/trust-badges.tsx`
**Status**: ✅ Fully Implemented
```typescript
// Component Features:
export function TrustBadges({ variant }: { variant?: 'default' | 'compact' | 'detailed' }) {
  // Displays: 1,247+ reviews, 4.9★ rating, €100,000 insurance, Best of Zagreb 2024
  // Three display variants for different contexts
  // Fully responsive with mobile optimization
}

export function GuaranteeBadge({ size }: { size?: 'sm' | 'md' | 'lg' }) {
  // "Garancija Izvrsnosti ili vraćamo novac" with green accent
  // Three size variants for different placements
  // Eye-catching gradient background
}

export function SocialProof() {
  // Customer testimonials with 5-star ratings
  // Croatian customer names and quotes
  // Grid layout responsive to screen size
}
```

#### Service Tier Presentation System
**Location**: `src/components/services/service-tiers.tsx`
**Status**: ✅ Fully Implemented
```typescript
// MyClean-style Service Tiers:
const serviceTiers = [
  { id: 'standard', name: 'Standardno čišćenje', price: '€60', qualityPoints: 60 },
  { id: 'standard-plus', name: 'Standard Plus', price: '€90', qualityPoints: 75 },
  { id: 'deep-clean', name: 'Dubinsko čišćenje', price: '€120', qualityPoints: 85 },
  { id: 'moving', name: 'Čišćenje za selidbu', price: '€100', qualityPoints: 80 }
]

// Components:
- ServiceTierCard: Individual tier with icon, features, pricing
- ServiceTiersGrid: Responsive 4-column grid (stacks on mobile)
- ServiceComparison: Feature comparison table with checkmarks
```

#### Mobile-Optimized Booking Flow
**Location**: `src/components/booking/mobile-booking-flow.tsx`
**Status**: ✅ Fully Implemented
```typescript
// 3-Step Simplified Process:
const steps = [
  { id: 'service', title: 'Odaberi uslugu', icon: Home },
  { id: 'schedule', title: 'Odaberi termin', icon: Calendar },
  { id: 'confirm', title: 'Potvrdi', icon: Check }
]

// Mobile-First Features:
- Sticky progress bar at top
- Bottom action bar for thumb access
- 44px minimum tap targets throughout
- Real-time price display
- Touch-friendly date/time selection
- Instant visual feedback on interactions
```

#### Enhanced Hero Section
**Location**: `src/components/home/hero-section.tsx`
**Status**: ✅ Fully Implemented
```typescript
// Desktop Version Features:
- Gradient background (blue to green)
- Croatian headline: "Čistimo. Vi se opustite."
- Trust badges: 4.9★ from 1,247+ reviews
- Pricing badge: €15/sat, Min €45
- Dual CTAs: Online booking + Phone call
- Floating customer testimonial
- Stats display: 1,247+ clients, 4.9★ rating, 100% guarantee

// Mobile Version (HeroSectionMobile):
- Simplified vertical layout
- Full-width CTAs with large tap targets
- Condensed trust indicators
- Centered content alignment
- Optimized for <768px screens
```
```typescript
// For component-specific state
const [isOpen, setIsOpen] = useState(false)
const [selectedService, setSelectedService] = useState<ServiceType>('standardno')

// For form state - using React Hook Form
const form = useForm<BookingFormData>({
  resolver: zodResolver(bookingSchema),
  defaultValues: {
    serviceType: 'standardno',
    frequency: 'jednokratno'
  }
})

// For complex state - useReducer pattern
interface BookingState {
  step: number
  data: Partial<BookingFormData>
  pricing: PricingResult
  errors: Record<string, string>
}

const bookingReducer = (state: BookingState, action: BookingAction) => {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload }
    case 'UPDATE_DATA':
      return {
        ...state,
        data: { ...state.data, ...action.payload },
        pricing: calculatePrice(/* updated data */)
      }
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.message }
      }
    default:
      return state
  }
}
```

#### Global State (Context API)
```typescript
// contexts/BookingContext.tsx
interface BookingContextType {
  bookingData: Partial<BookingFormData>
  updateBooking: (data: Partial<BookingFormData>) => void
  resetBooking: () => void
  pricing: PricingResult
}

const BookingContext = createContext<BookingContextType>()

export const BookingProvider: React.FC = ({ children }) => {
  const [bookingData, setBookingData] = useState<Partial<BookingFormData>>({})

  const pricing = useMemo(() =>
    calculatePrice(bookingData),
    [bookingData]
  )

  const updateBooking = (data: Partial<BookingFormData>) => {
    setBookingData(prev => ({ ...prev, ...data }))
  }

  const resetBooking = () => setBookingData({})

  return (
    <BookingContext.Provider value={{
      bookingData,
      updateBooking,
      resetBooking,
      pricing
    }}>
      {children}
    </BookingContext.Provider>
  )
}
```

---

## 2. Page Implementations

### 2.1 Complete Page Structure

```
src/app/
├── page.tsx                    # Homepage [✅ Implemented]
├── booking/
│   └── page.tsx               # Booking wizard [✅ Implemented]
├── services/
│   ├── page.tsx               # Services listing
│   ├── standardno/
│   │   └── page.tsx          # Standard cleaning detail
│   ├── dubinsko/
│   │   └── page.tsx          # Deep cleaning detail
│   ├── useljenje/
│   │   └── page.tsx          # Move-in cleaning detail
│   ├── iseljenje/
│   │   └── page.tsx          # Move-out cleaning detail
│   └── poslije-radova/
│       └── page.tsx          # Post-construction detail
├── pricing/
│   └── page.tsx               # Pricing calculator
├── contact/
│   └── page.tsx               # Contact page
├── about/
│   └── page.tsx               # About us
├── privacy/
│   └── page.tsx               # Privacy policy
├── terms/
│   └── page.tsx               # Terms of service
└── api/
    ├── booking/
    │   └── route.ts           # Booking API [✅ Implemented]
    ├── contact/
    │   └── route.ts           # Contact form API
    └── newsletter/
        └── route.ts           # Newsletter signup API
```

### 2.2 Page-Specific Components

#### Homepage Components
```typescript
// app/page.tsx structure
export default function HomePage() {
  return (
    <>
      <HeroSection />           // Hero with CTA
      <TrustIndicators />       // Social proof badges
      <ServicesGrid />          // Service cards
      <HowItWorks />           // 3-step process
      <PricingCTA />           // Calculator teaser
      <Testimonials />         // Customer reviews
      <FAQ />                  // Common questions
      <ContactCTA />           // Contact options
    </>
  )
}
```

#### Service Detail Page Template
```typescript
// app/services/[service]/page.tsx
interface ServicePageProps {
  params: {
    service: 'standardno' | 'dubinsko' | 'useljenje' | 'iseljenje' | 'poslije-radova'
  }
}

export default function ServicePage({ params }: ServicePageProps) {
  const serviceData = getServiceData(params.service)

  return (
    <>
      <ServiceHero
        title={serviceData.title}
        description={serviceData.description}
        price={serviceData.price}
        duration={serviceData.duration}
      />
      <WhatIsIncluded items={serviceData.included} />
      <QualityChecklist points={serviceData.qualityPoints} />
      <BeforeAfterGallery images={serviceData.gallery} />
      <PricingTable service={params.service} />
      <AddOnsSection />
      <BookingCTA service={params.service} />
      <RelatedServices exclude={params.service} />
    </>
  )
}
```

### 2.3 Routing Structure

```typescript
// Routing configuration
const routes = {
  home: '/',
  booking: '/booking',
  services: {
    index: '/services',
    standard: '/services/standardno',
    deep: '/services/dubinsko',
    moveIn: '/services/useljenje',
    moveOut: '/services/iseljenje',
    postConstruction: '/services/poslije-radova'
  },
  pricing: '/pricing',
  contact: '/contact',
  about: '/about',
  legal: {
    privacy: '/privacy',
    terms: '/terms'
  }
}

// Navigation component
const navigationItems = [
  { label: 'Početna', href: routes.home },
  {
    label: 'Usluge',
    href: routes.services.index,
    dropdown: [
      { label: 'Standardno čišćenje', href: routes.services.standard },
      { label: 'Dubinsko čišćenje', href: routes.services.deep },
      { label: 'Čišćenje za useljenje', href: routes.services.moveIn },
      { label: 'Čišćenje za iseljenje', href: routes.services.moveOut },
      { label: 'Čišćenje poslije radova', href: routes.services.postConstruction }
    ]
  },
  { label: 'Cijene', href: routes.pricing },
  { label: 'Kontakt', href: routes.contact }
]
```

### 2.4 SEO Considerations

#### Page Metadata Configuration
```typescript
// app/services/standardno/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Standardno čišćenje - Uredno.eu | €15/sat po osobi',
  description: 'Redovito održavanje vašeg doma. 60 točaka kvalitete, eko proizvodi, fleksibilni termini. Zagreb i okolica.',
  keywords: 'standardno čišćenje, redovito čišćenje, čišćenje stana zagreb',
  openGraph: {
    title: 'Standardno čišćenje - Uredno.eu',
    description: 'Profesionalno standardno čišćenje u Zagrebu',
    images: ['/images/standardno-ciscenje.jpg'],
    url: 'https://uredno.eu/services/standardno'
  },
  alternates: {
    canonical: 'https://uredno.eu/services/standardno'
  }
}
```

#### Structured Data Implementation
```typescript
// components/common/StructuredData.tsx
export function LocalBusinessSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Uredno.eu',
    description: 'Profesionalne usluge čišćenja u Zagrebu',
    image: 'https://uredno.eu/logo.png',
    '@id': 'https://uredno.eu',
    url: 'https://uredno.eu',
    telephone: '+385924502265',
    priceRange: '€€',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Zagreb',
      addressCountry: 'HR'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 45.8150,
      longitude: 15.9819
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '08:00',
      closes: '20:00'
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

---

## 3. Styling System

### 3.1 Tailwind CSS Configuration

```typescript
// tailwind.config.ts extensions
const config = {
  theme: {
    extend: {
      // Brand colors
      colors: {
        brand: {
          blue: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',  // Primary
            600: '#2563eb',  // Primary hover
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a'
          },
          green: {
            500: '#10b981',  // Success
            600: '#059669'   // Success hover
          },
          gray: {
            50: '#f9fafb',
            100: '#f3f4f6',
            200: '#e5e7eb',
            300: '#d1d5db',
            400: '#9ca3af',
            500: '#6b7280',
            600: '#4b5563',
            700: '#374151',
            800: '#1f2937',
            900: '#111827'
          }
        }
      },
      // Spacing system
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem'
      },
      // Typography
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        'hero': ['3.5rem', { lineHeight: '1.1' }]
      },
      // Animations
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite'
      }
    }
  }
}
```

### 3.2 Design Tokens

```typescript
// lib/design-tokens.ts
export const tokens = {
  colors: {
    // Primary palette
    primary: {
      50: 'rgb(239, 246, 255)',
      100: 'rgb(219, 234, 254)',
      200: 'rgb(191, 219, 254)',
      300: 'rgb(147, 197, 253)',
      400: 'rgb(96, 165, 250)',
      500: 'rgb(59, 130, 246)',   // Main brand color
      600: 'rgb(37, 99, 235)',    // Hover state
      700: 'rgb(29, 78, 216)',    // Active state
      800: 'rgb(30, 64, 175)',
      900: 'rgb(30, 58, 138)'
    },

    // Semantic colors
    semantic: {
      success: 'rgb(16, 185, 129)',
      warning: 'rgb(251, 191, 36)',
      error: 'rgb(239, 68, 68)',
      info: 'rgb(59, 130, 246)'
    },

    // Surface colors
    surface: {
      background: 'rgb(255, 255, 255)',
      foreground: 'rgb(17, 24, 39)',
      muted: 'rgb(249, 250, 251)',
      border: 'rgb(229, 231, 235)'
    }
  },

  spacing: {
    xs: '0.5rem',    // 8px
    sm: '0.75rem',   // 12px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
    '5xl': '8rem'    // 128px
  },

  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, sans-serif',
      display: 'Inter, system-ui, sans-serif'
    },
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
      '6xl': '3.75rem'   // 60px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75
    }
  },

  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    '2xl': '1rem',   // 16px
    '3xl': '1.5rem', // 24px
    full: '9999px'
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
  }
}
```

### 3.3 Responsive Breakpoints

```typescript
// lib/breakpoints.ts
export const breakpoints = {
  xs: '320px',   // Mobile small
  sm: '640px',   // Mobile large
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Desktop large
  '2xl': '1536px' // Desktop extra large
}

// Responsive utilities
export const mediaQueries = {
  xs: `@media (min-width: ${breakpoints.xs})`,
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`
}

// Responsive component example
<div className="
  px-4 sm:px-6 lg:px-8           // Responsive padding
  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  // Responsive grid
  text-sm md:text-base lg:text-lg // Responsive text
">
```

### 3.4 Animation Patterns

```css
/* styles/animations.css */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Stagger animation for lists */
.stagger-animation > * {
  animation: slideUp 0.4s ease-out both;
}

.stagger-animation > *:nth-child(1) { animation-delay: 0.1s; }
.stagger-animation > *:nth-child(2) { animation-delay: 0.2s; }
.stagger-animation > *:nth-child(3) { animation-delay: 0.3s; }
.stagger-animation > *:nth-child(4) { animation-delay: 0.4s; }
```

```typescript
// Framer Motion animations
import { motion } from 'framer-motion'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
}

// Usage
<motion.div
  variants={staggerContainer}
  initial="initial"
  animate="animate"
  className="grid grid-cols-3 gap-6"
>
  {services.map(service => (
    <motion.div key={service.id} variants={staggerItem}>
      <ServiceCard {...service} />
    </motion.div>
  ))}
</motion.div>
```

---

## 4. Forms & Validation

### 4.1 Form Component Architecture

```typescript
// components/forms/FormField.tsx
interface FormFieldProps {
  label: string
  name: string
  error?: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  error,
  required,
  hint,
  children
}) => (
  <div className="mb-6">
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 mb-2"
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {hint && !error && (
      <p className="mt-1 text-sm text-gray-500">{hint}</p>
    )}
    {error && (
      <p className="mt-1 text-sm text-red-600" role="alert">
        {error}
      </p>
    )}
  </div>
)
```

### 4.2 Zod Schema Implementations

```typescript
// lib/validations/booking.ts
import { z } from 'zod'

// Service selection schema
export const serviceSchema = z.object({
  serviceType: z.enum([
    'standardno',
    'dubinsko',
    'useljenje',
    'iseljenje',
    'poslije-radova'
  ]),
  propertySize: z.number()
    .min(20, 'Minimalna površina je 20m²')
    .max(1000, 'Za veće površine kontaktirajte nas'),
  bedrooms: z.number()
    .min(0)
    .max(20),
  bathrooms: z.number()
    .min(1)
    .max(10),
  addons: z.array(z.enum([
    'prozori',
    'pegla',
    'frizider',
    'pecnica',
    'ormari',
    'balkon'
  ])).optional()
})

// Date time schema
export const dateTimeSchema = z.object({
  date: z.string()
    .refine(date => {
      const selected = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return selected >= today
    }, 'Datum ne može biti u prošlosti')
    .refine(date => {
      const selected = new Date(date)
      const maxDate = new Date()
      maxDate.setMonth(maxDate.getMonth() + 3)
      return selected <= maxDate
    }, 'Možete rezervirati maksimalno 3 mjeseca unaprijed'),
  time: z.enum(['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']),
  frequency: z.enum(['jednokratno', 'tjedno', 'dvotjedno', 'mjesecno'])
})

// Contact schema
export const contactSchema = z.object({
  name: z.string()
    .min(2, 'Ime mora imati najmanje 2 znaka')
    .max(100, 'Ime ne smije biti duže od 100 znakova')
    .regex(/^[a-zA-ZšđčćžŠĐČĆŽ\s\-']+$/, 'Ime smije sadržavati samo slova'),
  email: z.string()
    .email('Unesite ispravnu email adresu')
    .max(255),
  phone: z.string()
    .regex(/^(\+385|0)[1-9]\d{7,8}$/, 'Unesite ispravan hrvatski broj telefona'),
  marketingConsent: z.boolean().optional()
})

// Address schema
export const addressSchema = z.object({
  address: z.string()
    .min(5, 'Adresa mora imati najmanje 5 znakova')
    .max(255)
    .regex(/^[a-zA-Z0-9šđčćžŠĐČĆŽ\s\-,./]+$/, 'Adresa sadrži nedozvoljene znakove'),
  city: z.string()
    .min(2, 'Naziv grada mora imati najmanje 2 znaka')
    .max(100),
  postalCode: z.string()
    .regex(/^\d{5}$/, 'Poštanski broj mora imati 5 znamenki'),
  specialInstructions: z.string()
    .max(500, 'Posebne napomene ne smiju biti duže od 500 znakova')
    .optional()
})

// Combined booking schema
export const bookingSchema = serviceSchema
  .merge(dateTimeSchema)
  .merge(contactSchema)
  .merge(addressSchema)
  .extend({
    gdprConsent: z.boolean()
      .refine(val => val === true, 'Morate prihvatiti uvjete korištenja')
  })
```

### 4.3 Error Handling Patterns

```typescript
// hooks/useFormError.ts
export function useFormError() {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const setFieldError = (field: string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }))
  }

  const clearFieldError = (field: string) => {
    setErrors(prev => {
      const { [field]: _, ...rest } = prev
      return rest
    })
  }

  const clearAllErrors = () => setErrors({})

  const hasErrors = Object.keys(errors).length > 0

  return {
    errors,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    hasErrors
  }
}

// Error display component
export const ErrorSummary: React.FC<{ errors: Record<string, string> }> = ({ errors }) => {
  if (Object.keys(errors).length === 0) return null

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <h3 className="text-red-800 font-semibold mb-2">
        Molimo ispravite sljedeće greške:
      </h3>
      <ul className="list-disc list-inside text-red-700 text-sm">
        {Object.entries(errors).map(([field, message]) => (
          <li key={field}>{message}</li>
        ))}
      </ul>
    </div>
  )
}
```

### 4.4 Multi-Step Form Management

```typescript
// hooks/useMultiStepForm.ts
interface UseMultiStepFormProps<T> {
  steps: number
  initialData?: Partial<T>
  onComplete: (data: T) => Promise<void>
}

export function useMultiStepForm<T>({
  steps,
  initialData = {},
  onComplete
}: UseMultiStepFormProps<T>) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Partial<T>>(initialData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const updateFormData = (data: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const goToStep = (step: number) => {
    if (step >= 1 && step <= steps) {
      setCurrentStep(step)
    }
  }

  const nextStep = () => {
    setCompletedSteps(prev => new Set(prev).add(currentStep))
    if (currentStep < steps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const submitForm = async () => {
    setIsSubmitting(true)
    try {
      await onComplete(formData as T)
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = (currentStep / steps) * 100
  const canGoBack = currentStep > 1
  const canGoForward = currentStep < steps
  const isLastStep = currentStep === steps

  return {
    currentStep,
    formData,
    updateFormData,
    goToStep,
    nextStep,
    prevStep,
    submitForm,
    isSubmitting,
    completedSteps,
    progress,
    canGoBack,
    canGoForward,
    isLastStep
  }
}
```

---

## 5. Performance Optimizations

### 5.1 Code Splitting Strategy

```typescript
// Dynamic imports for route-based splitting
import dynamic from 'next/dynamic'

// Lazy load heavy components
const BookingForm = dynamic(
  () => import('@/components/booking/BookingForm'),
  {
    loading: () => <BookingFormSkeleton />,
    ssr: false // Client-side only for forms
  }
)

const PricingCalculator = dynamic(
  () => import('@/components/pricing/PricingCalculator'),
  {
    loading: () => <PricingCalculatorSkeleton />
  }
)

// Conditional loading
const ContactMap = dynamic(
  () => import('@/components/contact/LocationMap'),
  {
    loading: () => <div className="h-96 bg-gray-100 animate-pulse" />,
    ssr: false
  }
)
```

### 5.2 Lazy Loading Approach

```typescript
// components/common/LazyImage.tsx
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className,
  priority = false
}) => {
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (priority) {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [priority])

  return (
    <div ref={imgRef} className={className}>
      {isInView ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : (
        <div className="w-full h-full bg-gray-200 animate-pulse" />
      )}
    </div>
  )
}
```

### 5.3 Image Optimization

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['uredno.eu', 'images.unsplash.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 420, 640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  }
}

// Image component usage
<Image
  src="/hero-cleaning.jpg"
  alt="Profesionalno čišćenje"
  width={1920}
  height={1080}
  priority // For above-the-fold images
  placeholder="blur"
  blurDataURL={blurDataUrl}
  sizes="(max-width: 640px) 100vw,
         (max-width: 1024px) 50vw,
         1200px"
/>
```

### 5.4 Bundle Size Management

```typescript
// Bundle analysis setup
// package.json scripts
{
  "scripts": {
    "analyze": "ANALYZE=true next build",
    "analyze:server": "BUNDLE_ANALYZE=server next build",
    "analyze:browser": "BUNDLE_ANALYZE=browser next build"
  }
}

// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // Tree shaking optimizations
  webpack: (config, { dev, isServer }) => {
    // Replace large libraries with lighter alternatives
    config.resolve.alias = {
      ...config.resolve.alias,
      'moment': 'date-fns',
      'lodash': 'lodash-es'
    }

    // Minimize bundle in production
    if (!dev && !isServer) {
      config.optimization.usedExports = true
      config.optimization.sideEffects = false
    }

    return config
  }
})

// Component-level optimizations
// Use specific imports instead of barrel imports
import { format } from 'date-fns' // Good
// import * as dateFns from 'date-fns' // Bad

// Dynamic import for heavy libraries
const loadChart = async () => {
  const { Chart } = await import('chart.js')
  return Chart
}
```

### 5.5 Performance Monitoring

```typescript
// lib/performance.ts
export const measurePageLoad = () => {
  if (typeof window !== 'undefined' && window.performance) {
    const perfData = window.performance.timing
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
    const connectTime = perfData.responseEnd - perfData.requestStart
    const renderTime = perfData.domComplete - perfData.domLoading

    console.log('Performance Metrics:', {
      pageLoadTime: `${pageLoadTime}ms`,
      connectTime: `${connectTime}ms`,
      renderTime: `${renderTime}ms`
    })

    // Send to analytics
    if (window.gtag) {
      window.gtag('event', 'page_load_time', {
        value: pageLoadTime,
        page_location: window.location.href
      })
    }
  }
}

// Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

function sendToAnalytics(metric: any) {
  // Send to Google Analytics or custom endpoint
  const body = JSON.stringify(metric)

  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics', body)
  }
}

getCLS(sendToAnalytics)
getFID(sendToAnalytics)
getFCP(sendToAnalytics)
getLCP(sendToAnalytics)
getTTFB(sendToAnalytics)
```

---

## 6. Implementation Checklist

### Phase 1: Core Components (Week 1)
- [ ] **Layout Components**
  - [ ] Header with navigation
  - [ ] Mobile menu
  - [ ] Footer
  - [ ] SEO component

- [ ] **UI Component Library**
  - [ ] Button variants
  - [ ] Form inputs
  - [ ] Cards
  - [ ] Modals
  - [ ] Loading states

- [ ] **Homepage Components**
  - [ ] Hero section enhancement
  - [ ] Services grid
  - [ ] Testimonials
  - [ ] FAQ accordion

### Phase 2: Pages (Week 2)
- [ ] **Service Pages**
  - [ ] Services listing
  - [ ] Individual service pages (5)
  - [ ] Service comparison

- [ ] **Pricing Page**
  - [ ] Interactive calculator
  - [ ] Pricing table
  - [ ] Discount display

- [ ] **Contact Page**
  - [ ] Contact form
  - [ ] Location map
  - [ ] Business hours

- [ ] **Legal Pages**
  - [ ] Privacy policy
  - [ ] Terms of service
  - [ ] Cookie policy

### Phase 3: Forms & Validation (Week 3)
- [ ] **Booking Form Enhancement**
  - [ ] Step components separation
  - [ ] Progress indicator
  - [ ] Data persistence
  - [ ] Error handling

- [ ] **Contact Form**
  - [ ] Form validation
  - [ ] API integration
  - [ ] Success handling

- [ ] **Newsletter Signup**
  - [ ] Email validation
  - [ ] GDPR consent
  - [ ] API endpoint

### Phase 4: Performance (Week 4)
- [ ] **Code Optimization**
  - [ ] Dynamic imports
  - [ ] Bundle analysis
  - [ ] Tree shaking
  - [ ] Minification

- [ ] **Image Optimization**
  - [ ] Next/Image implementation
  - [ ] Lazy loading
  - [ ] WebP/AVIF formats
  - [ ] Responsive images

- [ ] **SEO Implementation**
  - [ ] Meta tags
  - [ ] Structured data
  - [ ] Sitemap
  - [ ] Robots.txt

### Phase 5: Testing & Polish (Week 5)
- [ ] **Cross-browser Testing**
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge

- [ ] **Mobile Testing**
  - [ ] iOS Safari
  - [ ] Android Chrome
  - [ ] Responsive breakpoints

- [ ] **Accessibility**
  - [ ] Keyboard navigation
  - [ ] Screen reader testing
  - [ ] WCAG compliance
  - [ ] Focus management

- [ ] **Performance Testing**
  - [ ] Lighthouse audit
  - [ ] Core Web Vitals
  - [ ] Bundle size check
  - [ ] Load testing

### Deployment Ready Checklist
- [ ] All pages implemented and tested
- [ ] Forms validated and working
- [ ] SEO meta tags in place
- [ ] Performance optimized (Lighthouse >90)
- [ ] Mobile responsive
- [ ] Cross-browser compatible
- [ ] Accessibility compliant (WCAG 2.1 AA)
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Analytics configured
- [ ] Security headers configured
- [ ] SSL certificate active
- [ ] Domain configured
- [ ] Environment variables set
- [ ] Monitoring in place

## Success Metrics

### Performance Targets
- **Lighthouse Score**: >90 for all categories
- **Core Web Vitals**:
  - LCP: <2.5s
  - FID: <100ms
  - CLS: <0.1
- **Bundle Size**: <200KB initial JS
- **Time to Interactive**: <3.5s

### Quality Metrics
- **Mobile Score**: >95
- **Accessibility Score**: >95
- **SEO Score**: >95
- **Best Practices**: 100

### Business Metrics
- **Booking Conversion**: >25%
- **Form Completion**: >60%
- **Page Load Time**: <2s
- **Bounce Rate**: <40%
- **Mobile Usage**: >50%

---

## Notes

This implementation guide provides a complete roadmap for building the WebUredno frontend. Follow the component architecture patterns, implement proper SEO, ensure accessibility, and maintain performance targets throughout development.

Key technologies:
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- React Hook Form + Zod for forms
- Framer Motion for animations
- Next/Image for optimization

Remember to:
1. Test on real devices
2. Validate with actual users
3. Monitor performance metrics
4. Maintain code quality
5. Document components