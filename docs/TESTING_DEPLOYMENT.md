# Testing & Deployment - WebUredno Platform

## Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Unit Testing](#unit-testing)
3. [Integration Testing](#integration-testing)
4. [End-to-End Testing](#end-to-end-testing)
5. [Performance Testing](#performance-testing)
6. [Security Testing](#security-testing)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Deployment Procedures](#deployment-procedures)
9. [Monitoring & Rollback](#monitoring-rollback)

## Testing Strategy

### Testing Pyramid Overview

```
         ┌─────────────┐
         │    E2E      │ 10% - Critical user paths
         │   Tests     │ ~20 test cases
         ├─────────────┤
         │Integration  │ 20% - API & service layer
         │   Tests     │ ~50 test cases
         ├─────────────┤
         │    API      │ 30% - Endpoint validation
         │   Tests     │ ~80 test cases
         ├─────────────┤
         │    Unit     │ 40% - Component & logic
         │   Tests     │ ~200 test cases
         └─────────────┘
```

### Coverage Requirements

| Layer | Minimum Coverage | Target Coverage | Critical Areas |
|-------|-----------------|-----------------|----------------|
| Business Logic | 90% | 95% | Pricing, Booking, Validation |
| API Endpoints | 85% | 90% | Auth, Bookings, Payments |
| UI Components | 80% | 85% | Forms, Critical Flows |
| Integration | 75% | 80% | Calendar, Email, SMS |
| E2E | N/A | N/A | Complete user journeys |

### Testing Environment Setup

```bash
# Install testing dependencies
npm install --save-dev \
  jest @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event @types/jest \
  playwright @playwright/test \
  msw supertest \
  @faker-js/faker

# Configure test databases
createdb weburedno_test
createdb weburedno_e2e

# Set test environment variables
cp .env.local .env.test.local
# Edit DATABASE_URL to point to test database
```

## Unit Testing

### Component Testing Setup

```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/**/index.ts',
  ],
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

// jest.setup.js
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock environment variables
process.env = {
  ...process.env,
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
};
```

### Component Test Examples

```typescript
// __tests__/components/BookingForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookingForm } from '@/components/booking/BookingForm';
import { server } from '@/mocks/server';

describe('BookingForm', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('Service Selection', () => {
    it('should display all service types', () => {
      render(<BookingForm />);

      expect(screen.getByText('Standardno čišćenje')).toBeInTheDocument();
      expect(screen.getByText('Dubinsko čišćenje')).toBeInTheDocument();
      expect(screen.getByText('Čišćenje za useljenje')).toBeInTheDocument();
    });

    it('should update price when service type changes', async () => {
      const user = userEvent.setup();
      render(<BookingForm />);

      const deepCleaningOption = screen.getByLabelText('Dubinsko čišćenje');
      await user.click(deepCleaningOption);

      await waitFor(() => {
        expect(screen.getByText(/€90/)).toBeInTheDocument(); // Deep cleaning price
      });
    });
  });

  describe('Croatian Validation', () => {
    it('should validate Croatian phone numbers', async () => {
      const user = userEvent.setup();
      render(<BookingForm />);

      const phoneInput = screen.getByLabelText('Telefon');
      await user.type(phoneInput, '123456789'); // Invalid format
      await user.tab();

      expect(screen.getByText('Unesite ispravan broj telefona')).toBeInTheDocument();

      await user.clear(phoneInput);
      await user.type(phoneInput, '0912345678'); // Valid format
      await user.tab();

      expect(screen.queryByText('Unesite ispravan broj telefona')).not.toBeInTheDocument();
    });

    it('should validate Croatian postal codes', async () => {
      const user = userEvent.setup();
      render(<BookingForm />);

      const postalInput = screen.getByLabelText('Poštanski broj');
      await user.type(postalInput, '1000'); // Invalid (4 digits)
      await user.tab();

      expect(screen.getByText('Unesite ispravan poštanski broj')).toBeInTheDocument();

      await user.clear(postalInput);
      await user.type(postalInput, '10000'); // Valid Zagreb postal code
      await user.tab();

      expect(screen.queryByText('Unesite ispravan poštanski broj')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should submit booking with valid data', async () => {
      const user = userEvent.setup();
      render(<BookingForm />);

      // Fill in the form
      await user.click(screen.getByLabelText('Standardno čišćenje'));
      await user.type(screen.getByLabelText('Ime'), 'Ivo');
      await user.type(screen.getByLabelText('Prezime'), 'Ivić');
      await user.type(screen.getByLabelText('Email'), 'ivo@example.com');
      await user.type(screen.getByLabelText('Telefon'), '0912345678');

      // Submit
      const submitButton = screen.getByRole('button', { name: /Potvrdi rezervaciju/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Rezervacija uspješno poslana/)).toBeInTheDocument();
      });
    });
  });
});
```

### Business Logic Testing

```typescript
// __tests__/lib/pricing.test.ts
import { calculatePrice, PricingParams } from '@/lib/pricing';

describe('Pricing Engine', () => {
  describe('Base Price Calculation', () => {
    it('should calculate standard cleaning price correctly', () => {
      const params: PricingParams = {
        serviceType: 'standard',
        propertySize: 80,
        frequency: 'once',
        addons: [],
      };

      const result = calculatePrice(params);

      expect(result.basePrice).toBe(45); // 3 hours * €15
      expect(result.totalPrice).toBe(45);
      expect(result.duration).toBe(3);
      expect(result.teamSize).toBe(1);
    });

    it('should apply minimum charge', () => {
      const params: PricingParams = {
        serviceType: 'standard',
        propertySize: 30, // Small property
        frequency: 'once',
        addons: [],
      };

      const result = calculatePrice(params);

      expect(result.basePrice).toBe(30); // 2 hours * €15
      expect(result.totalPrice).toBe(45); // Minimum charge applied
    });

    it('should calculate team size based on property size', () => {
      const largeProperty: PricingParams = {
        serviceType: 'standard',
        propertySize: 150,
        frequency: 'once',
        addons: [],
      };

      const result = calculatePrice(largeProperty);

      expect(result.teamSize).toBe(2);
      expect(result.basePrice).toBe(105); // 3.5 hours * €15 * 2 people
    });
  });

  describe('Service Multipliers', () => {
    it('should apply deep cleaning multiplier', () => {
      const params: PricingParams = {
        serviceType: 'deep',
        propertySize: 80,
        frequency: 'once',
        addons: [],
      };

      const result = calculatePrice(params);

      expect(result.basePrice).toBe(67.5); // 3 hours * 1.5 multiplier * €15
      expect(result.duration).toBe(4.5); // 3 hours * 1.5
    });

    it('should apply post-construction multiplier', () => {
      const params: PricingParams = {
        serviceType: 'post_construction',
        propertySize: 100,
        frequency: 'once',
        addons: [],
      };

      const result = calculatePrice(params);

      expect(result.duration).toBe(6); // 3 hours * 2.0 multiplier
      expect(result.basePrice).toBe(90); // 6 hours * €15
    });
  });

  describe('Frequency Discounts', () => {
    const baseParams: PricingParams = {
      serviceType: 'standard',
      propertySize: 100,
      frequency: 'once',
      addons: [],
    };

    it('should apply weekly discount (15%)', () => {
      const params = { ...baseParams, frequency: 'weekly' as const };
      const result = calculatePrice(params);

      expect(result.discount).toBe(6.75); // 15% of €45
      expect(result.totalPrice).toBe(45); // Minimum charge still applies
    });

    it('should apply biweekly discount (10%)', () => {
      const params = { ...baseParams, frequency: 'biweekly' as const };
      const result = calculatePrice(params);

      expect(result.discount).toBe(4.5); // 10% of €45
      expect(result.totalPrice).toBe(45); // Minimum charge
    });

    it('should apply monthly discount (5%)', () => {
      const params = { ...baseParams, frequency: 'monthly' as const };
      const result = calculatePrice(params);

      expect(result.discount).toBe(2.25); // 5% of €45
      expect(result.totalPrice).toBe(45); // Minimum charge
    });
  });

  describe('Add-on Services', () => {
    it('should calculate addon prices correctly', () => {
      const params: PricingParams = {
        serviceType: 'standard',
        propertySize: 80,
        frequency: 'once',
        addons: ['windows', 'ironing'],
      };

      const result = calculatePrice(params);

      expect(result.addonsPrice).toBe(37.5); // €15 + €22.5
      expect(result.totalPrice).toBe(82.5); // €45 base + €37.5 addons
    });

    it('should scale addon prices with team size', () => {
      const params: PricingParams = {
        serviceType: 'standard',
        propertySize: 150, // Large property = 2 people
        frequency: 'once',
        addons: ['windows'],
      };

      const result = calculatePrice(params);

      expect(result.teamSize).toBe(2);
      expect(result.addonsPrice).toBe(30); // €15 * 2 people
    });
  });
});
```

## Integration Testing

### API Integration Tests

```typescript
// __tests__/api/bookings.test.ts
import request from 'supertest';
import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/bookings/route';
import { prisma } from '@/lib/prisma';

describe('/api/bookings', () => {
  beforeEach(async () => {
    await prisma.booking.deleteMany();
    await prisma.customer.deleteMany();
  });

  describe('POST /api/bookings', () => {
    it('should create a booking with valid data', async () => {
      const bookingData = {
        serviceType: 'standard',
        propertySize: 80,
        date: '2024-12-20',
        timeSlot: '09:00-12:00',
        frequency: 'once',
        customer: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: '0912345678',
        },
        address: {
          street: 'Test Street 123',
          city: 'Zagreb',
          postalCode: '10000',
        },
        paymentMethod: 'cash',
      };

      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: bookingData,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);

      const response = JSON.parse(res._getData());
      expect(response.success).toBe(true);
      expect(response.data.bookingReference).toMatch(/^WU\d{4}-[A-Z0-9]{6}$/);
      expect(response.data.totalPrice).toBe(45);
    });

    it('should reject booking with invalid Croatian phone', async () => {
      const bookingData = {
        // ... other valid fields
        customer: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: '123456789', // Invalid Croatian phone
        },
        // ... rest of data
      };

      const { req, res } = createMocks({
        method: 'POST',
        body: bookingData,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);

      const response = JSON.parse(res._getData());
      expect(response.error).toContain('broj telefona');
    });

    it('should check calendar availability before booking', async () => {
      // Create existing booking for same time slot
      await prisma.booking.create({
        data: {
          bookingReference: 'WU2024-EXIST1',
          scheduledDate: new Date('2024-12-20'),
          scheduledTime: '09:00',
          duration: 180,
          teamSize: 3, // All teams booked
          status: 'confirmed',
          // ... other required fields
        },
      });

      const bookingData = {
        date: '2024-12-20',
        timeSlot: '09:00-12:00',
        // ... rest of booking data
      };

      const { req, res } = createMocks({
        method: 'POST',
        body: bookingData,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);

      const response = JSON.parse(res._getData());
      expect(response.error).toContain('nije dostupan');
    });
  });

  describe('GET /api/bookings', () => {
    beforeEach(async () => {
      // Seed test data
      const customer = await prisma.customer.create({
        data: {
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          passwordHash: 'hash',
        },
      });

      await prisma.booking.createMany({
        data: [
          {
            bookingReference: 'WU2024-TEST01',
            customerId: customer.id,
            scheduledDate: new Date('2024-12-20'),
            scheduledTime: '09:00',
            status: 'confirmed',
            totalPrice: 60,
            // ... other fields
          },
          {
            bookingReference: 'WU2024-TEST02',
            customerId: customer.id,
            scheduledDate: new Date('2024-12-21'),
            scheduledTime: '14:00',
            status: 'pending',
            totalPrice: 75,
            // ... other fields
          },
        ],
      });
    });

    it('should return paginated bookings', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          limit: '10',
          offset: '0',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);

      const response = JSON.parse(res._getData());
      expect(response.success).toBe(true);
      expect(response.data.bookings).toHaveLength(2);
      expect(response.data.pagination.total).toBe(2);
    });

    it('should filter bookings by status', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          status: 'confirmed',
        },
      });

      await handler(req, res);

      const response = JSON.parse(res._getData());
      expect(response.data.bookings).toHaveLength(1);
      expect(response.data.bookings[0].status).toBe('confirmed');
    });

    it('should filter bookings by date range', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          from: '2024-12-20',
          to: '2024-12-20',
        },
      });

      await handler(req, res);

      const response = JSON.parse(res._getData());
      expect(response.data.bookings).toHaveLength(1);
      expect(response.data.bookings[0].bookingReference).toBe('WU2024-TEST01');
    });
  });
});
```

### Service Integration Tests

```typescript
// __tests__/integrations/google-calendar.test.ts
import { GoogleCalendarService } from '@/lib/integrations/google-calendar';
import { google } from 'googleapis';

jest.mock('googleapis');

describe('Google Calendar Integration', () => {
  let calendarService: GoogleCalendarService;
  let mockCalendar: any;

  beforeEach(() => {
    mockCalendar = {
      events: {
        insert: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      freebusy: {
        query: jest.fn(),
      },
    };

    (google.calendar as jest.Mock).mockReturnValue(mockCalendar);
    calendarService = new GoogleCalendarService();
  });

  describe('createBookingEvent', () => {
    it('should create calendar event with Croatian timezone', async () => {
      const booking = {
        id: 'booking-123',
        customer: {
          firstName: 'Ivo',
          lastName: 'Ivić',
          email: 'ivo@example.com',
        },
        scheduledDateTime: '2024-12-20T09:00:00',
        duration: 180,
        serviceType: 'standard',
        address: {
          street: 'Ilica 1',
          city: 'Zagreb',
          postalCode: '10000',
        },
      };

      mockCalendar.events.insert.mockResolvedValue({
        data: { id: 'event-123' },
      });

      const eventId = await calendarService.createBookingEvent(booking);

      expect(eventId).toBe('event-123');
      expect(mockCalendar.events.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          calendarId: expect.any(String),
          resource: expect.objectContaining({
            summary: 'Čišćenje - Ivić',
            location: 'Ilica 1, 10000 Zagreb',
            start: {
              dateTime: '2024-12-20T09:00:00',
              timeZone: 'Europe/Zagreb',
            },
            end: {
              dateTime: '2024-12-20T12:00:00',
              timeZone: 'Europe/Zagreb',
            },
          }),
        })
      );
    });
  });

  describe('checkAvailability', () => {
    it('should return true when time slot is available', async () => {
      mockCalendar.freebusy.query.mockResolvedValue({
        data: {
          calendars: {
            'calendar-id': {
              busy: [], // No busy times
            },
          },
        },
      });

      const isAvailable = await calendarService.checkAvailability(
        new Date('2024-12-20T09:00:00'),
        180
      );

      expect(isAvailable).toBe(true);
    });

    it('should return false when time slot is busy', async () => {
      mockCalendar.freebusy.query.mockResolvedValue({
        data: {
          calendars: {
            'calendar-id': {
              busy: [
                {
                  start: '2024-12-20T10:00:00',
                  end: '2024-12-20T11:00:00',
                },
              ],
            },
          },
        },
      });

      const isAvailable = await calendarService.checkAvailability(
        new Date('2024-12-20T09:00:00'),
        180
      );

      expect(isAvailable).toBe(false);
    });
  });
});
```

## End-to-End Testing

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Scenarios

```typescript
// e2e/booking-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Complete Booking Flow', () => {
  test('should complete booking from homepage to confirmation', async ({ page }) => {
    // Start at homepage
    await page.goto('/');

    // Click on booking CTA
    await page.click('text=Rezerviraj Odmah');

    // Step 1: Select Service
    await expect(page).toHaveURL('/booking');
    await page.click('text=Standardno čišćenje');
    await page.click('text=Dalje');

    // Step 2: Property Details
    await page.fill('input[name="propertySize"]', '80');
    await page.selectOption('select[name="propertyType"]', 'apartment');
    await page.click('text=Dalje');

    // Step 3: Date & Time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill('input[type="date"]', tomorrow.toISOString().split('T')[0]);
    await page.click('text=09:00 - 12:00');
    await page.click('text=Dalje');

    // Step 4: Contact Information
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'Korisnik');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '0912345678');
    await page.click('text=Dalje');

    // Step 5: Address
    await page.fill('input[name="street"]', 'Ilica 1');
    await page.fill('input[name="city"]', 'Zagreb');
    await page.fill('input[name="postalCode"]', '10000');
    await page.click('text=Dalje');

    // Step 6: Review & Confirm
    await expect(page.locator('text=€45')).toBeVisible();
    await page.click('text=Potvrdi Rezervaciju');

    // Confirmation Page
    await expect(page).toHaveURL(/\/booking\/confirmation/);
    await expect(page.locator('text=Rezervacija Potvrđena!')).toBeVisible();
    await expect(page.locator('text=WU2024-')).toBeVisible();
  });

  test('should validate Croatian phone numbers', async ({ page }) => {
    await page.goto('/booking');

    // Navigate to contact step
    await page.click('text=Standardno čišćenje');
    await page.click('text=Dalje');
    await page.fill('input[name="propertySize"]', '80');
    await page.click('text=Dalje');
    await page.click('text=09:00 - 12:00');
    await page.click('text=Dalje');

    // Enter invalid phone number
    await page.fill('input[name="phone"]', '123456789');
    await page.click('text=Dalje');

    // Should show validation error
    await expect(page.locator('text=Unesite ispravan broj telefona')).toBeVisible();

    // Enter valid Croatian phone
    await page.fill('input[name="phone"]', '0912345678');
    await page.click('text=Dalje');

    // Should proceed to next step
    await expect(page.locator('text=Adresa')).toBeVisible();
  });

  test('should calculate price dynamically', async ({ page }) => {
    await page.goto('/booking');

    // Select standard cleaning
    await page.click('text=Standardno čišćenje');
    await expect(page.locator('text=€45')).toBeVisible(); // Base price

    // Change to deep cleaning
    await page.click('text=Dubinsko čišćenje');
    await expect(page.locator('text=€67.50')).toBeVisible(); // 1.5x multiplier

    // Add frequency discount
    await page.click('text=Tjedno');
    await expect(page.locator('text=-15%')).toBeVisible();
    await expect(page.locator('text=€57.38')).toBeVisible(); // With discount
  });
});

// e2e/mobile-responsive.spec.ts
test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should display mobile menu', async ({ page }) => {
    await page.goto('/');

    // Mobile menu should be visible
    await expect(page.locator('[aria-label="Menu"]')).toBeVisible();

    // Click menu
    await page.click('[aria-label="Menu"]');

    // Menu items should be visible
    await expect(page.locator('text=Usluge')).toBeVisible();
    await expect(page.locator('text=Cijene')).toBeVisible();
    await expect(page.locator('text=Kontakt')).toBeVisible();
  });

  test('should adapt booking form for mobile', async ({ page }) => {
    await page.goto('/booking');

    // Form should be single column on mobile
    const formWidth = await page.locator('.booking-form').boundingBox();
    expect(formWidth?.width).toBeLessThan(400);

    // Steps should be scrollable horizontally
    const stepsContainer = page.locator('.steps-container');
    await expect(stepsContainer).toHaveCSS('overflow-x', 'auto');
  });
});
```

## Performance Testing

### Lighthouse CI Configuration

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run build && npm run start',
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/booking',
        'http://localhost:3000/services',
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
        'interactive': ['error', { maxNumericValue: 3500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

### Load Testing with k6

```javascript
// k6/booking-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    errors: ['rate<0.1'],              // Error rate under 10%
  },
};

export default function () {
  // Test homepage load
  const homeRes = http.get('https://uredno.eu');
  check(homeRes, {
    'Homepage loads successfully': (r) => r.status === 200,
    'Homepage loads quickly': (r) => r.timings.duration < 500,
  });
  errorRate.add(homeRes.status !== 200);

  sleep(1);

  // Test booking API
  const bookingData = JSON.stringify({
    serviceType: 'standard',
    propertySize: 80,
    date: '2024-12-25',
    timeSlot: '09:00-12:00',
    frequency: 'once',
    customer: {
      firstName: 'Load',
      lastName: 'Test',
      email: `test${__VU}@example.com`,
      phone: '0912345678',
    },
    address: {
      street: 'Test Street 123',
      city: 'Zagreb',
      postalCode: '10000',
    },
    paymentMethod: 'cash',
  });

  const bookingRes = http.post('https://uredno.eu/api/bookings', bookingData, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  check(bookingRes, {
    'Booking API responds': (r) => r.status === 201 || r.status === 400,
    'Booking API is fast': (r) => r.timings.duration < 1000,
  });
  errorRate.add(bookingRes.status >= 500);

  sleep(2);
}
```

## Security Testing

### Security Checklist

```markdown
## Application Security Checklist

### Authentication & Authorization
- [ ] JWT tokens properly signed and verified
- [ ] Passwords hashed with bcrypt (min 12 rounds)
- [ ] Session management implemented correctly
- [ ] Admin routes protected with authentication
- [ ] Rate limiting on auth endpoints
- [ ] Account lockout after failed attempts

### Input Validation
- [ ] All user inputs validated with Zod schemas
- [ ] SQL injection prevention via Prisma
- [ ] XSS protection on all outputs
- [ ] File upload restrictions implemented
- [ ] Croatian phone/postal validation

### CSRF Protection
- [ ] CSRF tokens on all state-changing operations
- [ ] SameSite cookie attributes set
- [ ] Double-submit cookie pattern implemented

### Security Headers
- [ ] Content-Security-Policy configured
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Strict-Transport-Security enabled
- [ ] Referrer-Policy configured

### Data Protection
- [ ] Sensitive data encrypted at rest
- [ ] HTTPS enforced in production
- [ ] PII data minimization
- [ ] GDPR compliance implemented
- [ ] Data retention policies enforced

### API Security
- [ ] Rate limiting per IP/user
- [ ] API key validation
- [ ] Request size limits
- [ ] Timeout configurations
- [ ] CORS properly configured

### Third-party Integrations
- [ ] Google Calendar API keys secured
- [ ] SendGrid API keys in env variables
- [ ] Webhook signatures validated
- [ ] External API calls use HTTPS
```

### Penetration Testing Script

```bash
#!/bin/bash
# security-test.sh

echo "Running Security Tests for WebUredno"

# 1. Check for exposed sensitive files
echo "Checking for exposed sensitive files..."
curl -s https://uredno.eu/.env && echo "WARNING: .env file exposed!" || echo "✓ .env protected"
curl -s https://uredno.eu/.git/config && echo "WARNING: Git directory exposed!" || echo "✓ Git protected"

# 2. Test SQL injection
echo "Testing SQL injection..."
curl -X POST https://uredno.eu/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com'\'' OR 1=1--"}' \
  | grep -q "error" && echo "✓ SQL injection protected" || echo "WARNING: Possible SQL injection"

# 3. Test XSS
echo "Testing XSS protection..."
curl -X POST https://uredno.eu/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"firstName":"<script>alert(1)</script>"}' \
  | grep -q "<script>" && echo "WARNING: XSS vulnerability!" || echo "✓ XSS protected"

# 4. Check security headers
echo "Checking security headers..."
curl -I https://uredno.eu 2>/dev/null | grep -q "X-Frame-Options" && echo "✓ X-Frame-Options present" || echo "WARNING: X-Frame-Options missing"
curl -I https://uredno.eu 2>/dev/null | grep -q "Content-Security-Policy" && echo "✓ CSP present" || echo "WARNING: CSP missing"

# 5. Test rate limiting
echo "Testing rate limiting..."
for i in {1..100}; do
  curl -s -o /dev/null -w "%{http_code}" https://uredno.eu/api/bookings
done | grep -q "429" && echo "✓ Rate limiting working" || echo "WARNING: No rate limiting detected"
```

## CI/CD Pipeline

### GitHub Actions Configuration

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18.x'
  DATABASE_URL: postgresql://test:test@localhost:5432/weburedno_test

jobs:
  lint:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run TypeScript check
        run: npm run type-check

  test:
    name: Unit & Integration Tests
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: weburedno_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Setup database
        run: |
          npx prisma migrate deploy
          npx prisma db seed

      - name: Run tests with coverage
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-results
          path: playwright-report/

  security:
    name: Security Scan
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Run security audit
        run: npm audit --audit-level=high

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

      - name: Run OWASP dependency check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'WebUredno'
          path: '.'
          format: 'HTML'

  performance:
    name: Performance Tests
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun

  deploy-staging:
    name: Deploy to Staging
    needs: [lint, test, e2e, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel Staging
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          alias-domains: staging.uredno.eu

  deploy-production:
    name: Deploy to Production
    needs: [lint, test, e2e, security, performance]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    environment:
      name: production
      url: https://uredno.eu

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel Production
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          alias-domains: uredno.eu,www.uredno.eu

      - name: Purge CDN cache
        run: |
          curl -X POST "https://api.cloudflare.com/client/v4/zones/${{ secrets.CLOUDFLARE_ZONE_ID }}/purge_cache" \
            -H "Authorization: Bearer ${{ secrets.CLOUDFLARE_API_TOKEN }}" \
            -H "Content-Type: application/json" \
            --data '{"purge_everything":true}'

      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Production deployment completed for WebUredno'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## Deployment Procedures

### Pre-Deployment Checklist

```markdown
## Production Deployment Checklist

### Code Preparation
- [ ] All tests passing (unit, integration, E2E)
- [ ] No console.log statements in production code
- [ ] Environment variables documented
- [ ] Database migrations tested
- [ ] Performance benchmarks met

### Security Review
- [ ] Security scan completed
- [ ] OWASP Top 10 checked
- [ ] Sensitive data not exposed
- [ ] API rate limiting configured
- [ ] HTTPS enforced

### Database
- [ ] Backup current production database
- [ ] Migration scripts tested on staging
- [ ] Rollback plan prepared
- [ ] Indexes optimized
- [ ] Connection pooling configured

### Infrastructure
- [ ] CDN configured
- [ ] SSL certificates valid
- [ ] DNS records updated
- [ ] Load balancer configured
- [ ] Monitoring alerts set

### Business Readiness
- [ ] Customer support briefed
- [ ] Documentation updated
- [ ] Marketing materials ready
- [ ] Legal compliance verified
- [ ] Analytics tracking confirmed
```

### Deployment Script

```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Starting WebUredno Production Deployment"

# 1. Run pre-deployment checks
echo "Running pre-deployment checks..."
npm run lint
npm run type-check
npm run test

# 2. Build application
echo "Building application..."
npm run build

# 3. Database backup
echo "Backing up production database..."
pg_dump $PROD_DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 4. Run migrations
echo "Running database migrations..."
npx prisma migrate deploy

# 5. Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod

# 6. Verify deployment
echo "Verifying deployment..."
curl -f https://uredno.eu/api/health || exit 1

# 7. Clear cache
echo "Clearing CDN cache..."
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'

# 8. Run smoke tests
echo "Running smoke tests..."
npm run test:smoke

# 9. Monitor for errors
echo "Monitoring for errors (5 minutes)..."
npm run monitor:errors -- --duration 300

echo "✅ Deployment completed successfully!"
```

### Database Migration Strategy

```sql
-- migrations/20240315_add_booking_features.sql

-- Start transaction
BEGIN;

-- Add new columns with defaults to avoid locks
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS google_event_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS quality_score INTEGER;

-- Create index concurrently (outside transaction)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_google_event
  ON bookings(google_event_id)
  WHERE google_event_id IS NOT NULL;

-- Update existing records in batches
DO $$
DECLARE
  batch_size INTEGER := 1000;
  offset_val INTEGER := 0;
  total_rows INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_rows FROM bookings WHERE quality_score IS NULL;

  WHILE offset_val < total_rows LOOP
    UPDATE bookings
    SET quality_score = 60
    WHERE id IN (
      SELECT id FROM bookings
      WHERE quality_score IS NULL
      LIMIT batch_size
    );

    offset_val := offset_val + batch_size;

    -- Pause to avoid overwhelming the database
    PERFORM pg_sleep(0.1);
  END LOOP;
END $$;

COMMIT;
```

## Monitoring & Rollback

### Health Check Endpoints

```typescript
// app/api/health/route.ts
export async function GET() {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      calendar: await checkGoogleCalendar(),
      email: await checkEmailService(),
    },
  };

  const isHealthy = Object.values(checks.checks).every(c => c.status === 'ok');

  return NextResponse.json(checks, {
    status: isHealthy ? 200 : 503,
  });
}

async function checkDatabase() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', latency: 0 };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}

// app/api/metrics/route.ts
export async function GET() {
  const metrics = {
    bookings: {
      today: await getBookingsToday(),
      week: await getBookingsThisWeek(),
      pending: await getPendingBookings(),
    },
    performance: {
      avgResponseTime: await getAvgResponseTime(),
      errorRate: await getErrorRate(),
      successRate: await getSuccessRate(),
    },
    system: {
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      nodeVersion: process.version,
    },
  };

  return NextResponse.json(metrics);
}
```

### Monitoring Setup

```javascript
// monitoring/sentry.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,

  beforeSend(event, hint) {
    // Filter out sensitive data
    if (event.request?.cookies) {
      delete event.request.cookies;
    }
    if (event.extra?.password) {
      delete event.extra.password;
    }
    return event;
  },

  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Postgres(),
  ],
});

// monitoring/datadog.js
import StatsD from 'node-dogstatsd';

const dogstatsd = new StatsD();

export function trackMetric(name: string, value: number, tags?: string[]) {
  dogstatsd.gauge(`weburedno.${name}`, value, tags);
}

export function trackEvent(name: string, tags?: string[]) {
  dogstatsd.increment(`weburedno.${name}`, 1, tags);
}

export function trackTiming(name: string, duration: number, tags?: string[]) {
  dogstatsd.histogram(`weburedno.${name}`, duration, tags);
}
```

### Rollback Procedures

```bash
#!/bin/bash
# rollback.sh

set -e

echo "🔙 Starting WebUredno Rollback Procedure"

# 1. Confirm rollback
read -p "Are you sure you want to rollback? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  exit 1
fi

# 2. Get previous deployment
PREVIOUS_DEPLOYMENT=$(vercel ls --json | jq -r '.[1].url')
echo "Rolling back to: $PREVIOUS_DEPLOYMENT"

# 3. Restore database backup
echo "Restoring database backup..."
LATEST_BACKUP=$(ls -t backup_*.sql | head -1)
psql $PROD_DATABASE_URL < $LATEST_BACKUP

# 4. Rollback Vercel deployment
echo "Rolling back Vercel deployment..."
vercel rollback $PREVIOUS_DEPLOYMENT --yes

# 5. Clear cache
echo "Clearing CDN cache..."
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'

# 6. Verify rollback
echo "Verifying rollback..."
curl -f https://uredno.eu/api/health || exit 1

# 7. Notify team
echo "Notifying team..."
curl -X POST $SLACK_WEBHOOK \
  -H 'Content-Type: application/json' \
  -d '{"text":"⚠️ Production rollback completed for WebUredno"}'

echo "✅ Rollback completed successfully!"
```

### Incident Response Plan

```markdown
## Incident Response Playbook

### Severity Levels

**SEV1 - Critical**
- Complete service outage
- Data breach or loss
- Payment system failure
- Response time: < 15 minutes

**SEV2 - High**
- Booking system degraded
- Partial outage
- Performance severely degraded
- Response time: < 30 minutes

**SEV3 - Medium**
- Non-critical feature failure
- Slow response times
- Minor data inconsistencies
- Response time: < 2 hours

### Response Steps

1. **Detect & Alert**
   - Automated monitoring triggers alert
   - On-call engineer acknowledged

2. **Assess**
   - Determine severity level
   - Identify affected systems
   - Estimate impact scope

3. **Communicate**
   - Update status page
   - Notify stakeholders via Slack
   - Create incident channel

4. **Mitigate**
   - Apply immediate fixes
   - Consider rollback if necessary
   - Scale resources if needed

5. **Resolve**
   - Implement permanent fix
   - Verify resolution
   - Monitor for recurrence

6. **Post-Mortem**
   - Document timeline
   - Identify root cause
   - Create action items
   - Share learnings

### Contact List

**On-Call Engineers**
- Primary: +385 XX XXX XXXX
- Secondary: +385 XX XXX XXXX

**Stakeholders**
- CTO: xxx@uredno.eu
- Customer Support: support@uredno.eu
- Marketing: marketing@uredno.eu
```

---

*Testing & Deployment Documentation Version 2.0 | Last Updated: 2024*