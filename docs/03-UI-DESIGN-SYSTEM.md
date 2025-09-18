# UI Design System

## Brand Identity

### Color Palette
```css
/* Primary Colors */
--primary-blue: #1654D0;        /* Main brand color */
--primary-blue-dark: #0F3A8F;   /* Hover states */
--primary-blue-light: #E6EFFF;  /* Backgrounds */

/* Secondary Colors */
--accent-green: #10B981;        /* Success, CTAs */
--accent-yellow: #F59E0B;       /* Highlights */

/* Neutral Colors */
--gray-900: #111827;            /* Text primary */
--gray-700: #374151;            /* Text secondary */
--gray-500: #6B7280;            /* Text muted */
--gray-300: #D1D5DB;            /* Borders */
--gray-100: #F3F4F6;            /* Backgrounds */
--white: #FFFFFF;               /* Base white */
```

### Typography
```css
/* Font Family */
--font-primary: 'Inter', system-ui, sans-serif;
--font-heading: 'Plus Jakarta Sans', sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */
--text-5xl: 3rem;       /* 48px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing System
```css
/* 8px base unit */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

## Component Library (shadcn/ui)

### Base Components to Use
1. **Button** - Primary, Secondary, Outline, Ghost variants
2. **Card** - Content containers with shadows
3. **Input** - Form inputs with validation states
4. **Select** - Dropdowns for service selection
5. **Calendar** - Date picker for booking
6. **Dialog** - Modals for confirmations
7. **Tabs** - Service category navigation
8. **Accordion** - FAQ sections
9. **Badge** - Status indicators
10. **Toast** - Notifications

### Custom Components

#### Hero Section
```typescript
interface HeroProps {
  title: string;
  subtitle: string;
  ctaText: string;
  backgroundImage?: string;
  stats?: Array<{label: string; value: string}>;
}
```

#### Service Card
```typescript
interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  price: string;
  features: string[];
  ctaText: string;
  highlighted?: boolean;
}
```

#### Testimonial Card
```typescript
interface TestimonialProps {
  name: string;
  location: string;
  rating: number;
  comment: string;
  date: string;
  serviceType: string;
}
```

#### Booking Wizard
```typescript
interface BookingWizardProps {
  steps: Array<{
    id: string;
    title: string;
    component: React.ComponentType;
  }>;
  onComplete: (data: BookingData) => void;
}
```

## Layout Patterns

### Grid System
- 12-column grid on desktop
- 8-column grid on tablet
- 4-column grid on mobile
- Container max-width: 1280px
- Gutter: 24px (desktop), 16px (mobile)

### Breakpoints
```css
--breakpoint-sm: 640px;   /* Mobile landscape */
--breakpoint-md: 768px;   /* Tablet */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Large desktop */
--breakpoint-2xl: 1536px; /* Extra large */
```

### Page Sections
1. **Hero** - Full width, 60-80vh height
2. **Features** - 3-column grid
3. **Services** - Card grid layout
4. **Testimonials** - Carousel or grid
5. **CTA** - Centered with gradient background
6. **Footer** - 4-column layout

## Icons (Lucide React)
- Home, Calendar, Clock, MapPin
- Check, Star, Shield, Sparkles
- Phone, Mail, MessageCircle
- CreditCard, Euro, Clock
- Users, Building, Home
- ChevronRight, ArrowRight

## Animation & Interactions
```css
/* Transitions */
--transition-fast: 150ms ease-in-out;
--transition-base: 250ms ease-in-out;
--transition-slow: 350ms ease-in-out;

/* Hover Effects */
- Scale: 1.02 for cards
- Shadow elevation on hover
- Color transitions for buttons
- Smooth scrolling for navigation
```

## Accessibility Standards
- WCAG 2.1 AA compliance
- Keyboard navigation support
- ARIA labels for all interactive elements
- Color contrast ratios > 4.5:1
- Focus indicators on all interactive elements
- Screen reader optimized content