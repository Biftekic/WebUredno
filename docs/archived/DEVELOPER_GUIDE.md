# Developer Guide - WebUredno Platform

## Quick Start

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager
- Git for version control

### Installation
```bash
git clone <repository-url>
cd WebUredno
npm install
```

### Environment Setup
Create `.env.local` file:
```env
# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Uredno
NEXT_PUBLIC_DEFAULT_LOCALE=hr

# Google Calendar API
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALENDAR_ID=your_calendar_id@group.calendar.google.com

# Email Service (Development)
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=kontakt@uredno.eu
SMTP_PASSWORD=your_app_specific_password
EMAIL_FROM_ADDRESS=kontakt@uredno.eu

# Development Settings
NODE_ENV=development
RATE_LIMIT_PER_MINUTE=60
```

### Development Server
```bash
npm run dev
# Open http://localhost:3000
```

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   │   └── booking/    # Booking endpoints
│   ├── booking/        # Booking flow pages
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Homepage
├── components/         # React components
│   ├── ui/            # Base UI components (shadcn/ui)
│   ├── booking/       # Booking-specific components
│   ├── layout/        # Layout components
│   └── forms/         # Form components
├── lib/               # Utilities and helpers
│   ├── pricing.ts     # Pricing calculations
│   ├── validations.ts # Zod schemas
│   ├── google-calendar.ts # Calendar integration
│   ├── email.ts       # Email service
│   └── utils.ts       # General utilities
├── types/             # TypeScript definitions
│   ├── booking.ts     # Booking types
│   └── index.ts       # Shared types
└── middleware.ts      # Security and routing middleware
```

## Core Development Tasks

### 1. Working with the Booking System

#### BookingForm Component
Location: `src/components/booking/BookingForm.tsx`

Multi-step wizard structure:
```tsx
// Step flow
1. Service Selection → 2. Date/Time → 3. Contact Info → 4. Address → 5. Review
```

Key features:
- Real-time pricing calculation
- Form validation with Zod
- Progress tracking
- Error handling with Croatian translations

#### Adding New Service Types
1. Update `serviceTypes` in `src/lib/validations.ts`
2. Add pricing logic in `src/lib/pricing.ts`
3. Update UI labels in components
4. Add Croatian translations

### 2. Pricing System

#### Calculation Engine
Location: `src/lib/pricing.ts`

Core formula:
```typescript
const calculatePrice = (params: PricingParams) => {
  const baseHours = getServiceHours(serviceType, propertySize)
  const teamSize = getTeamSize(propertySize)
  const totalHours = baseHours + calculateAddons(addons)

  const basePrice = totalHours * HOURLY_RATE * teamSize
  const discount = getFrequencyDiscount(frequency)
  const finalPrice = Math.max(basePrice * (1 - discount), MINIMUM_CHARGE)

  return { basePrice, finalPrice, teamSize, totalHours }
}
```

#### Adding New Pricing Logic
1. Update calculation functions in `pricing.ts`
2. Add unit tests in `__tests__/pricing.test.ts`
3. Update validation schema if needed
4. Test with booking form

### 3. API Development

#### Booking API Route
Location: `src/app/api/booking/route.ts`

Process flow:
```typescript
1. Validate request with Zod schema
2. Generate unique booking ID
3. Create Google Calendar event
4. Send confirmation email
5. Return success response
```

#### Adding New API Endpoints
```typescript
// Example: GET /api/bookings
export async function GET(request: Request) {
  try {
    // Validate authentication if needed
    // Query data source
    // Return structured response
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { error: "Error message in Croatian" },
      { status: 400 }
    )
  }
}
```

### 4. Form Validation

#### Zod Schemas
Location: `src/lib/validations.ts`

Main schemas:
- `bookingSchema` - Complete booking validation
- `contactSchema` - Contact information
- `pricingSchema` - Pricing parameters

#### Croatian-Specific Validation
```typescript
// Phone number validation
phone: z.string()
  .regex(/^(\+385|0)[0-9]{8,9}$/, "Unesite ispravni broj telefona")

// Postal code validation
postalCode: z.string()
  .regex(/^[0-9]{5}$/, "Unesite ispravni poštanski broj")
```

### 5. Testing

#### Unit Tests
```bash
npm run test           # Run all tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
```

Test structure:
```javascript
// __tests__/pricing.test.ts
describe('calculatePrice', () => {
  it('should apply frequency discount correctly', () => {
    const result = calculatePrice({
      serviceType: 'standardno',
      propertySize: 100,
      frequency: 'tjedno'
    })
    expect(result.finalPrice).toBe(/* expected value */)
  })
})
```

#### E2E Testing
```bash
npm run test:e2e       # Playwright tests
```

### 6. Deployment

#### Build Process
```bash
npm run build          # Production build
npm run start          # Production server
npm run lint           # ESLint check
npm run type-check     # TypeScript check
```

#### Vercel Deployment
1. Connect GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

## Common Development Workflows

### Adding a New Feature
1. Create feature branch: `git checkout -b feature/new-feature`
2. Implement changes with tests
3. Run linting and type checking
4. Test locally with different scenarios
5. Create pull request with description

### Debugging Issues
1. Check browser console for client-side errors
2. Check server logs for API issues
3. Use React DevTools for component debugging
4. Check network tab for API call issues

### Performance Optimization
1. Use Next.js Image component for images
2. Implement lazy loading for heavy components
3. Monitor bundle size with `npm run analyze`
4. Use React.memo for expensive components

## Key Libraries & Tools

### Core Dependencies
- **Next.js 14.2.5**: React framework with App Router
- **TypeScript**: Type safety and better DX
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality React components
- **React Hook Form**: Form state management
- **Zod**: Runtime type validation

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Husky**: Git hooks
- **Jest**: Unit testing
- **Playwright**: E2E testing

## Coding Standards

### TypeScript
- Use strict mode
- Define interfaces for all data structures
- Prefer `type` over `interface` for unions
- Use proper return types for functions

### React Components
```tsx
// Preferred component structure
interface ComponentProps {
  title: string
  optional?: boolean
}

export function Component({ title, optional = false }: ComponentProps) {
  return (
    <div className="component-class">
      <h1>{title}</h1>
    </div>
  )
}
```

### CSS/Styling
- Use Tailwind utility classes
- Create custom components for repeated patterns
- Use CSS modules for component-specific styles
- Follow responsive-first approach

## Troubleshooting

### Common Issues

#### Environment Variables
- Ensure `.env.local` is not committed to git
- Check variable names match exactly (case-sensitive)
- Restart dev server after env changes

#### Google Calendar Integration
- Verify service account has calendar access
- Check calendar ID format
- Ensure proper key formatting (no extra spaces)

#### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Clear node modules
rm -rf node_modules package-lock.json
npm install
```

### Development Server Issues
```bash
# Kill process on port 3000
npx kill-port 3000

# Check port usage
lsof -i :3000
```

## Additional Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [React Hook Form](https://react-hook-form.com/)

### Development Links
- Repository: [GitHub URL]
- Staging: [Vercel Preview URL]
- Production: https://uredno.eu

---

*For detailed implementation guides, see the `/docs/impl/` folder.*