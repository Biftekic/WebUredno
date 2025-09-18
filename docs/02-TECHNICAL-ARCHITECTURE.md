# Technical Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                 │
│  ┌─────────────┐  ┌──────────┐  ┌──────────────┐  │
│  │   Pages     │  │   API    │  │  Components  │  │
│  │  - Home     │  │  Routes  │  │  - Reusable  │  │
│  │  - Services │  │  - Book  │  │  - Shared    │  │
│  │  - Booking  │  │  - Email │  │  - Layout    │  │
│  │  - About    │  │  - Cal   │  │              │  │
│  └─────────────┘  └──────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────┐
│                   External Services                  │
│  ┌──────────────┐  ┌────────────┐  ┌────────────┐ │
│  │ Google       │  │   Email    │  │    SEO     │ │
│  │ Calendar API │  │   Service  │  │  Services  │ │
│  └──────────────┘  └────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────┘
```

## Project Structure

```
WebUredno/
├── docs/                    # Documentation
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (marketing)/    # Marketing pages
│   │   │   ├── page.tsx    # Homepage
│   │   │   ├── usluge/     # Services
│   │   │   ├── o-nama/     # About
│   │   │   └── kontakt/    # Contact
│   │   ├── rezervacija/    # Booking flow
│   │   ├── api/           # API routes
│   │   └── layout.tsx     # Root layout
│   ├── components/
│   │   ├── ui/           # shadcn/ui components
│   │   ├── shared/       # Shared components
│   │   ├── booking/      # Booking components
│   │   └── layout/       # Layout components
│   ├── lib/
│   │   ├── utils/        # Utility functions
│   │   ├── hooks/        # Custom React hooks
│   │   └── constants/    # Constants & config
│   ├── styles/          # Global styles
│   └── types/           # TypeScript types
├── public/             # Static assets
├── tests/              # Test files
└── package.json

```

## Component Architecture

### Reusable Components
1. **Hero Section** - Customizable hero with CTA
2. **Service Card** - Display service with pricing
3. **Testimonial Card** - Customer reviews
4. **Booking Form** - Multi-step booking wizard
5. **Price Calculator** - Dynamic pricing component
6. **FAQ Accordion** - Expandable Q&A sections
7. **Contact Form** - General inquiry form
8. **Newsletter Signup** - Email subscription
9. **Service Checklist** - Service details display

### Page Components
1. **Homepage** - Hero, services, testimonials, CTA
2. **Services Page** - Detailed service listings
3. **Booking Page** - Booking wizard with calendar
4. **About Page** - Company info, team, values
5. **Contact Page** - Contact form, map, info

## Data Flow

### Booking Process
1. User selects service type
2. Chooses date/time from available slots
3. Enters contact information
4. Reviews and confirms booking
5. System creates Google Calendar event
6. Sends confirmation email to customer
7. Sends notification to service team

## Performance Optimizations
- Static Site Generation (SSG) for marketing pages
- Image optimization with Next.js Image
- Code splitting and lazy loading
- Edge caching with Vercel
- Minified CSS/JS bundles
- Font optimization with next/font

## SEO Strategy
- Server-side rendering for all public pages
- Structured data (JSON-LD) for local business
- Meta tags optimization
- Sitemap generation
- Croatian language hreflang tags
- Local SEO optimization for Zagreb