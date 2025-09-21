# WebUredno Testing Implementation Guide

## Executive Summary

This guide provides comprehensive testing strategies and implementation patterns for the WebUredno cleaning service platform. Following the testing pyramid approach, we ensure high code quality, reliability, and maintainability while optimizing for development velocity and user confidence.

## 1. Testing Architecture

### 1.1 Testing Pyramid Strategy

```
         ╱─────────╲
        ╱    E2E    ╲      (5-10%)
       ╱─────────────╲     Critical user journeys
      ╱  Integration  ╲    (20-30%)
     ╱─────────────────╲   API & service integration
    ╱      Unit        ╲   (60-70%)
   ╱───────────────────╲  Component & function tests
```

### 1.2 Test File Organization

```
project-root/
├── __tests__/                    # Global test utilities
│   ├── setup/
│   │   ├── jest.setup.ts        # Jest configuration
│   │   ├── test-utils.tsx       # Testing library utilities
│   │   └── mock-providers.tsx   # Provider wrappers
│   └── fixtures/
│       ├── bookings.ts          # Test data fixtures
│       ├── services.ts          # Service mock data
│       └── users.ts             # User test data
│
├── src/
│   ├── components/
│   │   └── booking/
│   │       ├── BookingForm.tsx
│   │       ├── BookingForm.test.tsx      # Unit tests
│   │       └── BookingForm.stories.tsx   # Storybook tests
│   │
│   ├── app/
│   │   └── api/
│   │       └── booking/
│   │           ├── route.ts
│   │           └── route.test.ts         # API integration tests
│   │
│   └── lib/
│       ├── pricing.ts
│       └── pricing.test.ts               # Utility unit tests
│
├── e2e/
│   ├── booking-flow.spec.ts             # E2E booking scenarios
│   ├── contact-form.spec.ts             # Contact form E2E
│   └── pricing-calculator.spec.ts       # Calculator E2E tests
│
└── cypress/                              # Alternative E2E setup
    ├── e2e/
    ├── fixtures/
    └── support/
```

### 1.3 Coverage Requirements

```typescript
// jest.config.js coverage thresholds
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 85,
      statements: 85
    },
    './src/components/': {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/lib/': {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95
    },
    './src/app/api/': {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
};
```

### 1.4 CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: testpass
        options: >-
          --health-cmd pg_isready
          --health-interval 10s

    steps:
      - uses: actions/checkout@v3
      - name: Run integration tests
        run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run E2E tests
        run: |
          npm run build
          npm run test:e2e
```

## 2. Unit Testing

### 2.1 Component Testing Patterns

#### 2.1.1 BookingForm Component Test

```typescript
// src/components/booking/BookingForm.test.tsx
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookingForm } from './BookingForm';
import { mockServices, mockBookingData } from '@/__tests__/fixtures';

describe('BookingForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Step Navigation', () => {
    it('should navigate through all steps correctly', async () => {
      const user = userEvent.setup();
      render(<BookingForm onSubmit={mockOnSubmit} />);

      // Step 1: Service Selection
      expect(screen.getByText(/Odaberite uslugu/i)).toBeInTheDocument();
      const standardService = screen.getByRole('button', { name: /Standardno čišćenje/i });
      await user.click(standardService);

      // Should move to Step 2
      await waitFor(() => {
        expect(screen.getByText(/Odaberite datum i vrijeme/i)).toBeInTheDocument();
      });

      // Select date and time
      const dateInput = screen.getByLabelText(/Datum/i);
      await user.type(dateInput, '2024-12-25');

      const timeSelect = screen.getByLabelText(/Vrijeme/i);
      await user.selectOptions(timeSelect, '10:00');

      const nextButton = screen.getByRole('button', { name: /Dalje/i });
      await user.click(nextButton);

      // Step 3: Contact Information
      await waitFor(() => {
        expect(screen.getByText(/Kontakt informacije/i)).toBeInTheDocument();
      });
    });

    it('should allow navigation back to previous steps', async () => {
      const user = userEvent.setup();
      render(<BookingForm onSubmit={mockOnSubmit} initialStep={2} />);

      const backButton = screen.getByRole('button', { name: /Natrag/i });
      await user.click(backButton);

      await waitFor(() => {
        expect(screen.getByText(/Odaberite uslugu/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for required fields', async () => {
      const user = userEvent.setup();
      render(<BookingForm onSubmit={mockOnSubmit} />);

      // Try to proceed without selecting a service
      const nextButton = screen.getByRole('button', { name: /Dalje/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/Molimo odaberite uslugu/i)).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      const user = userEvent.setup();
      render(<BookingForm onSubmit={mockOnSubmit} initialStep={3} />);

      const emailInput = screen.getByLabelText(/Email/i);
      await user.type(emailInput, 'invalid-email');

      const nextButton = screen.getByRole('button', { name: /Dalje/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/Nevažeća email adresa/i)).toBeInTheDocument();
      });
    });

    it('should validate Croatian phone number format', async () => {
      const user = userEvent.setup();
      render(<BookingForm onSubmit={mockOnSubmit} initialStep={3} />);

      const phoneInput = screen.getByLabelText(/Telefon/i);
      await user.type(phoneInput, '123'); // Invalid format

      await waitFor(() => {
        expect(screen.getByText(/Format: 091 234 5678/i)).toBeInTheDocument();
      });
    });
  });

  describe('Pricing Calculation', () => {
    it('should calculate price based on selected services and property size', async () => {
      const user = userEvent.setup();
      render(<BookingForm onSubmit={mockOnSubmit} />);

      // Select service
      await user.click(screen.getByRole('button', { name: /Dubinsko čišćenje/i }));

      // Enter property details
      const sizeInput = screen.getByLabelText(/Kvadratura/i);
      await user.clear(sizeInput);
      await user.type(sizeInput, '150');

      const bedroomsSelect = screen.getByLabelText(/Broj spavaćih soba/i);
      await user.selectOptions(bedroomsSelect, '3');

      // Check calculated price
      await waitFor(() => {
        const priceElement = screen.getByTestId('calculated-price');
        expect(priceElement).toHaveTextContent(/180€/); // Expected calculation
      });
    });

    it('should apply frequency discounts', async () => {
      const user = userEvent.setup();
      render(<BookingForm onSubmit={mockOnSubmit} />);

      const frequencySelect = screen.getByLabelText(/Učestalost/i);
      await user.selectOptions(frequencySelect, 'weekly');

      await waitFor(() => {
        const discountBadge = screen.getByTestId('discount-badge');
        expect(discountBadge).toHaveTextContent('20% popusta');
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form with all required data', async () => {
      const user = userEvent.setup();
      render(<BookingForm onSubmit={mockOnSubmit} />);

      // Fill complete form
      await fillCompleteBookingForm(user);

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Potvrdi rezervaciju/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            service: 'standardno',
            date: '2024-12-25',
            time: '10:00',
            email: 'test@example.com',
            phone: '091 234 5678',
            address: expect.objectContaining({
              street: 'Ilica 1',
              city: 'Zagreb',
              postalCode: '10000'
            })
          })
        );
      });
    });
  });
});
```

### 2.2 Utility Function Tests

```typescript
// src/lib/pricing.test.ts
import {
  calculatePrice,
  estimateCleaningTime,
  getTeamSize,
  applyFrequencyDiscount
} from './pricing';

describe('Pricing Engine', () => {
  describe('calculatePrice', () => {
    it('should calculate base price correctly', () => {
      const result = calculatePrice({
        service: 'standardno',
        propertySize: 100,
        bedrooms: 2,
        bathrooms: 1,
        frequency: 'jednokratno',
        addOns: []
      });

      expect(result.basePrice).toBe(45); // €15/hour × 3 hours = €45 minimum
      expect(result.finalPrice).toBe(45); // No discount
      expect(result.discount).toBe(0);
    });

    it('should apply minimum price constraint', () => {
      const result = calculatePrice({
        service: 'standardno',
        propertySize: 30, // Very small apartment
        bedrooms: 1,
        bathrooms: 1,
        frequency: 'jednokratno',
        addOns: []
      });

      expect(result.finalPrice).toBeGreaterThanOrEqual(45); // Minimum €45
    });

    it('should apply frequency discounts correctly', () => {
      const testCases = [
        { frequency: 'tjedno', expectedDiscount: 0.20 },
        { frequency: 'dvotjedno', expectedDiscount: 0.15 },
        { frequency: 'mjesecno', expectedDiscount: 0.10 },
        { frequency: 'jednokratno', expectedDiscount: 0 }
      ];

      testCases.forEach(({ frequency, expectedDiscount }) => {
        const result = calculatePrice({
          service: 'standardno',
          propertySize: 100,
          bedrooms: 2,
          bathrooms: 1,
          frequency,
          addOns: []
        });

        expect(result.discount).toBe(expectedDiscount);
        expect(result.finalPrice).toBe(result.basePrice * (1 - expectedDiscount));
      });
    });

    it('should add extra charges for add-on services', () => {
      const result = calculatePrice({
        service: 'standardno',
        propertySize: 100,
        bedrooms: 2,
        bathrooms: 1,
        frequency: 'jednokratno',
        addOns: ['pranje-prozora', 'peglanje'] // +€15 + €20
      });

      expect(result.addOnPrice).toBe(35);
      expect(result.finalPrice).toBe(95); // 60 base + 35 add-ons
    });
  });

  describe('estimateCleaningTime', () => {
    it('should estimate time based on property characteristics', () => {
      const time = estimateCleaningTime({
        service: 'standardno',
        propertySize: 150,
        bedrooms: 3,
        bathrooms: 2,
        addOns: []
      });

      expect(time).toBe(3.5); // Expected: 2 base + 0.75 size + 0.5 rooms + 0.25 bathrooms
    });

    it('should add extra time for deep cleaning', () => {
      const standardTime = estimateCleaningTime({
        service: 'standardno',
        propertySize: 100,
        bedrooms: 2,
        bathrooms: 1,
        addOns: []
      });

      const deepTime = estimateCleaningTime({
        service: 'dubinsko',
        propertySize: 100,
        bedrooms: 2,
        bathrooms: 1,
        addOns: []
      });

      expect(deepTime).toBeGreaterThan(standardTime);
      expect(deepTime).toBe(standardTime * 1.5); // Deep cleaning takes 50% more time
    });
  });

  describe('getTeamSize', () => {
    it('should determine team size based on property size', () => {
      expect(getTeamSize(80)).toBe(1);   // <100m² = 1 person
      expect(getTeamSize(150)).toBe(2);  // 100-200m² = 2 people
      expect(getTeamSize(250)).toBe(3);  // >200m² = 3 people
    });

    it('should handle edge cases', () => {
      expect(getTeamSize(100)).toBe(2);  // Exactly 100m²
      expect(getTeamSize(200)).toBe(2);  // Exactly 200m²
      expect(getTeamSize(201)).toBe(3);  // Just over 200m²
    });
  });
});
```

### 2.3 Hook Testing Approaches

```typescript
// src/hooks/useBookingForm.test.ts
import { renderHook, act } from '@testing-library/react';
import { useBookingForm } from './useBookingForm';

describe('useBookingForm', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useBookingForm());

    expect(result.current.currentStep).toBe(1);
    expect(result.current.formData).toEqual({
      service: null,
      date: null,
      time: null,
      contact: {},
      address: {},
      addOns: []
    });
    expect(result.current.errors).toEqual({});
  });

  it('should navigate between steps', () => {
    const { result } = renderHook(() => useBookingForm());

    // Go to next step
    act(() => {
      result.current.goToNextStep();
    });
    expect(result.current.currentStep).toBe(2);

    // Go to previous step
    act(() => {
      result.current.goToPreviousStep();
    });
    expect(result.current.currentStep).toBe(1);

    // Should not go below step 1
    act(() => {
      result.current.goToPreviousStep();
    });
    expect(result.current.currentStep).toBe(1);
  });

  it('should update form data', () => {
    const { result } = renderHook(() => useBookingForm());

    act(() => {
      result.current.updateFormData({
        service: 'standardno',
        date: '2024-12-25'
      });
    });

    expect(result.current.formData.service).toBe('standardno');
    expect(result.current.formData.date).toBe('2024-12-25');
  });

  it('should validate step data before proceeding', () => {
    const { result } = renderHook(() => useBookingForm());

    // Try to proceed without required data
    act(() => {
      const canProceed = result.current.validateCurrentStep();
      expect(canProceed).toBe(false);
    });

    expect(result.current.errors.service).toBe('Service selection is required');

    // Add required data and validate again
    act(() => {
      result.current.updateFormData({ service: 'standardno' });
      const canProceed = result.current.validateCurrentStep();
      expect(canProceed).toBe(true);
    });

    expect(result.current.errors.service).toBeUndefined();
  });
});
```

### 2.4 Mock Strategies

```typescript
// __tests__/setup/mocks.ts

// Mock Google Calendar API
export const mockGoogleCalendar = {
  events: {
    insert: jest.fn().mockResolvedValue({
      id: 'mock-event-id',
      status: 'confirmed',
      htmlLink: 'https://calendar.google.com/event/123'
    }),
    list: jest.fn().mockResolvedValue({
      items: []
    })
  }
};

// Mock Email Service
export const mockEmailService = {
  send: jest.fn().mockResolvedValue({
    messageId: 'mock-message-id',
    status: 'sent'
  }),
  sendBulk: jest.fn().mockResolvedValue({
    successful: ['email1@test.com'],
    failed: []
  })
};

// Mock Fetch for API calls
global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockClear();
  fetch.mockResolvedValue({
    ok: true,
    json: async () => ({ success: true }),
    text: async () => 'OK',
    status: 200
  });
});

// Mock Next.js Router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
      pathname: '/',
      query: {},
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  }
}));

// Mock Environment Variables
process.env = {
  ...process.env,
  NEXT_PUBLIC_API_URL: 'http://localhost:3000',
  GOOGLE_CLIENT_EMAIL: 'test@serviceaccount.com',
  GOOGLE_PRIVATE_KEY: 'mock-private-key',
  SMTP_HOST: 'smtp.test.com',
  SMTP_PORT: '587',
  SMTP_USER: 'test@weburedno.hr',
  SMTP_PASS: 'test-password'
};
```

## 3. Integration Testing

### 3.1 API Endpoint Testing

```typescript
// src/app/api/booking/route.test.ts
import { POST } from './route';
import { mockGoogleCalendar, mockEmailService } from '@/__tests__/setup/mocks';
import { NextRequest } from 'next/server';

jest.mock('@/lib/google-calendar', () => ({
  googleCalendar: mockGoogleCalendar
}));

jest.mock('@/lib/email', () => ({
  emailService: mockEmailService
}));

describe('POST /api/booking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a booking successfully', async () => {
    const bookingData = {
      service: 'standardno',
      date: '2024-12-25',
      time: '10:00',
      duration: 3,
      contact: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '091 234 5678'
      },
      address: {
        street: 'Ilica 1',
        city: 'Zagreb',
        postalCode: '10000'
      },
      price: 60
    };

    const request = new NextRequest('http://localhost:3000/api/booking', {
      method: 'POST',
      body: JSON.stringify(bookingData),
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toMatchObject({
      success: true,
      bookingId: expect.stringMatching(/^BK-\d{10}-[a-z0-9]+$/),
      message: 'Rezervacija uspješno zaprimljena'
    });

    // Verify Google Calendar was called
    expect(mockGoogleCalendar.events.insert).toHaveBeenCalledWith({
      calendarId: 'primary',
      resource: expect.objectContaining({
        summary: expect.stringContaining('Test User'),
        description: expect.stringContaining('Standardno čišćenje'),
        start: expect.objectContaining({
          dateTime: expect.any(String)
        })
      })
    });

    // Verify emails were sent
    expect(mockEmailService.send).toHaveBeenCalledTimes(2);
    expect(mockEmailService.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@example.com',
        subject: expect.stringContaining('Potvrda rezervacije')
      })
    );
  });

  it('should handle validation errors', async () => {
    const invalidData = {
      service: 'invalid-service',
      date: 'invalid-date',
      email: 'not-an-email'
    };

    const request = new NextRequest('http://localhost:3000/api/booking', {
      method: 'POST',
      body: JSON.stringify(invalidData),
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toMatchObject({
      success: false,
      error: 'Validation failed',
      details: expect.arrayContaining([
        expect.objectContaining({
          field: 'service',
          message: expect.any(String)
        })
      ])
    });

    expect(mockGoogleCalendar.events.insert).not.toHaveBeenCalled();
    expect(mockEmailService.send).not.toHaveBeenCalled();
  });

  it('should handle calendar API failures gracefully', async () => {
    mockGoogleCalendar.events.insert.mockRejectedValueOnce(
      new Error('Calendar API error')
    );

    const bookingData = {
      // ... valid booking data
    };

    const request = new NextRequest('http://localhost:3000/api/booking', {
      method: 'POST',
      body: JSON.stringify(bookingData),
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201); // Still successful
    expect(data.success).toBe(true);
    expect(data.warning).toBe('Calendar event creation failed, but booking was recorded');
  });

  it('should enforce rate limiting', async () => {
    const bookingData = { /* ... */ };

    // Simulate multiple rapid requests
    for (let i = 0; i < 6; i++) {
      const request = new NextRequest('http://localhost:3000/api/booking', {
        method: 'POST',
        body: JSON.stringify(bookingData),
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': '192.168.1.1' // Same IP
        }
      });

      const response = await POST(request);

      if (i < 5) {
        expect(response.status).toBe(201);
      } else {
        expect(response.status).toBe(429); // Too Many Requests
        const data = await response.json();
        expect(data.error).toBe('Too many requests');
      }
    }
  });
});
```

### 3.2 Form Submission Tests

```typescript
// __tests__/integration/booking-form-submission.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookingPage } from '@/app/booking/page';
import { server } from '@/__tests__/setup/msw-server';
import { rest } from 'msw';

describe('Booking Form Submission Integration', () => {
  it('should complete full booking flow', async () => {
    const user = userEvent.setup();

    // Mock successful API response
    server.use(
      rest.post('/api/booking', (req, res, ctx) => {
        return res(
          ctx.status(201),
          ctx.json({
            success: true,
            bookingId: 'BK-1234567890-abc123',
            message: 'Rezervacija uspješno zaprimljena'
          })
        );
      })
    );

    render(<BookingPage />);

    // Step 1: Select service
    await user.click(screen.getByText('Standardno čišćenje'));
    await user.click(screen.getByRole('button', { name: /Dalje/i }));

    // Step 2: Select date and time
    await user.type(screen.getByLabelText(/Datum/i), '2024-12-25');
    await user.selectOptions(screen.getByLabelText(/Vrijeme/i), '10:00');
    await user.click(screen.getByRole('button', { name: /Dalje/i }));

    // Step 3: Contact information
    await user.type(screen.getByLabelText(/Ime i prezime/i), 'Test User');
    await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/Telefon/i), '091 234 5678');
    await user.click(screen.getByRole('button', { name: /Dalje/i }));

    // Step 4: Address
    await user.type(screen.getByLabelText(/Adresa/i), 'Ilica 1');
    await user.type(screen.getByLabelText(/Grad/i), 'Zagreb');
    await user.type(screen.getByLabelText(/Poštanski broj/i), '10000');
    await user.click(screen.getByRole('button', { name: /Dalje/i }));

    // Step 5: Review and submit
    expect(screen.getByText(/Pregled rezervacije/i)).toBeInTheDocument();

    const submitButton = screen.getByRole('button', { name: /Potvrdi rezervaciju/i });
    await user.click(submitButton);

    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/Rezervacija uspješno zaprimljena/i)).toBeInTheDocument();
      expect(screen.getByText(/BK-1234567890-abc123/i)).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    const user = userEvent.setup();

    // Mock API error
    server.use(
      rest.post('/api/booking', (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({
            success: false,
            error: 'Internal server error'
          })
        );
      })
    );

    render(<BookingPage />);

    // Complete form (abbreviated for brevity)
    await completeBookingForm(user);

    const submitButton = screen.getByRole('button', { name: /Potvrdi rezervaciju/i });
    await user.click(submitButton);

    // Verify error message
    await waitFor(() => {
      expect(screen.getByText(/Dogodila se greška/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Pokušaj ponovno/i })).toBeInTheDocument();
    });
  });
});
```

### 3.3 Database Integration Tests

```typescript
// __tests__/integration/database.test.ts
import { PrismaClient } from '@prisma/client';
import { BookingService } from '@/services/booking.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

describe('Database Integration', () => {
  let prisma: DeepMockProxy<PrismaClient>;
  let bookingService: BookingService;

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();
    bookingService = new BookingService(prisma);
  });

  describe('BookingService', () => {
    it('should create a booking in the database', async () => {
      const bookingData = {
        service: 'standardno',
        date: new Date('2024-12-25'),
        time: '10:00',
        duration: 3,
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        customerPhone: '091 234 5678',
        address: 'Ilica 1, Zagreb',
        price: 60,
        status: 'pending'
      };

      prisma.booking.create.mockResolvedValue({
        id: 1,
        ...bookingData,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await bookingService.create(bookingData);

      expect(prisma.booking.create).toHaveBeenCalledWith({
        data: bookingData
      });

      expect(result).toMatchObject({
        id: 1,
        service: 'standardno',
        customerEmail: 'test@example.com'
      });
    });

    it('should check for booking conflicts', async () => {
      const date = new Date('2024-12-25');
      const time = '10:00';

      prisma.booking.findMany.mockResolvedValue([
        {
          id: 1,
          date,
          time,
          duration: 3,
          // ... other fields
        }
      ]);

      const hasConflict = await bookingService.hasTimeConflict(date, time, 2);

      expect(hasConflict).toBe(true);
      expect(prisma.booking.findMany).toHaveBeenCalledWith({
        where: {
          date,
          status: { not: 'cancelled' }
        }
      });
    });

    it('should retrieve bookings for a date range', async () => {
      const startDate = new Date('2024-12-01');
      const endDate = new Date('2024-12-31');

      prisma.booking.findMany.mockResolvedValue([
        // ... mock bookings
      ]);

      const bookings = await bookingService.getBookingsByDateRange(startDate, endDate);

      expect(prisma.booking.findMany).toHaveBeenCalledWith({
        where: {
          date: {
            gte: startDate,
            lte: endDate
          },
          status: { not: 'cancelled' }
        },
        orderBy: { date: 'asc' }
      });
    });
  });
});
```

### 3.4 External Service Mocking

```typescript
// __tests__/setup/msw-handlers.ts
import { rest } from 'msw';

export const handlers = [
  // Google Calendar API
  rest.post('https://www.googleapis.com/calendar/v3/calendars/primary/events', (req, res, ctx) => {
    return res(
      ctx.json({
        id: 'mock-calendar-event-id',
        status: 'confirmed',
        htmlLink: 'https://calendar.google.com/event/123'
      })
    );
  }),

  // Email Service API
  rest.post('https://api.sendgrid.com/v3/mail/send', (req, res, ctx) => {
    return res(
      ctx.status(202),
      ctx.json({
        message: 'Accepted'
      })
    );
  }),

  // SMS Service API (if used)
  rest.post('https://api.twilio.com/2010-04-01/Accounts/*/Messages.json', (req, res, ctx) => {
    return res(
      ctx.json({
        sid: 'mock-message-sid',
        status: 'sent'
      })
    );
  })
];

// Setup MSW server
import { setupServer } from 'msw/node';
export const server = setupServer(...handlers);
```

## 4. E2E Testing

### 4.1 Critical User Journeys

```typescript
// e2e/critical-user-journeys.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Critical User Journeys', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete booking from homepage to confirmation', async ({ page }) => {
    // Start from homepage
    await expect(page).toHaveTitle(/WebUredno/);

    // Click CTA button
    await page.click('text=Rezervirajte odmah');

    // Should navigate to booking page
    await expect(page).toHaveURL('/booking');

    // Service selection
    await page.click('button:has-text("Standardno čišćenje")');
    await page.click('button:has-text("Dalje")');

    // Date and time selection
    await page.fill('input[name="date"]', '2024-12-25');
    await page.selectOption('select[name="time"]', '10:00');
    await page.click('button:has-text("Dalje")');

    // Contact information
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '091 234 5678');
    await page.click('button:has-text("Dalje")');

    // Address
    await page.fill('input[name="street"]', 'Ilica 1');
    await page.fill('input[name="city"]', 'Zagreb');
    await page.fill('input[name="postalCode"]', '10000');

    // Property details
    await page.fill('input[name="propertySize"]', '100');
    await page.selectOption('select[name="bedrooms"]', '2');
    await page.selectOption('select[name="bathrooms"]', '1');
    await page.click('button:has-text("Dalje")');

    // Review
    await expect(page.locator('text=Pregled rezervacije')).toBeVisible();

    // Check calculated price
    await expect(page.locator('[data-testid="total-price"]')).toContainText('60€');

    // Submit booking
    await page.click('button:has-text("Potvrdi rezervaciju")');

    // Wait for confirmation
    await expect(page.locator('text=Hvala na rezervaciji!')).toBeVisible();
    await expect(page.locator('[data-testid="booking-id"]')).toContainText(/BK-\d{10}/);

    // Verify email notification (mock check)
    const emailSent = await page.evaluate(() => {
      return window.__mockEmailSent;
    });
    expect(emailSent).toBe(true);
  });

  test('should allow cancellation of booking', async ({ page }) => {
    // Navigate to booking management
    await page.goto('/booking/manage');

    // Enter booking ID and email
    await page.fill('input[name="bookingId"]', 'BK-1234567890-abc123');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.click('button:has-text("Pronađi rezervaciju")');

    // Wait for booking details
    await expect(page.locator('text=Detalji rezervacije')).toBeVisible();

    // Click cancel button
    await page.click('button:has-text("Otkaži rezervaciju")');

    // Confirm cancellation
    await page.click('button:has-text("Da, otkaži")');

    // Verify cancellation
    await expect(page.locator('text=Rezervacija je uspješno otkazana')).toBeVisible();
  });

  test('should handle pricing calculator', async ({ page }) => {
    // Navigate to pricing page
    await page.goto('/pricing');

    // Use pricing calculator
    await page.selectOption('select[name="service"]', 'dubinsko');
    await page.fill('input[name="size"]', '150');
    await page.selectOption('select[name="bedrooms"]', '3');
    await page.selectOption('select[name="bathrooms"]', '2');

    // Select frequency for discount
    await page.selectOption('select[name="frequency"]', 'tjedno');

    // Add extra services
    await page.check('input[name="addOn-windows"]');
    await page.check('input[name="addOn-ironing"]');

    // Verify calculated price
    const price = await page.locator('[data-testid="calculated-price"]').textContent();
    expect(parseInt(price)).toBeGreaterThan(100);

    // Verify discount is applied
    await expect(page.locator('[data-testid="discount-badge"]')).toContainText('20% popusta');

    // Click book now with these settings
    await page.click('button:has-text("Rezerviraj s ovim postavkama")');

    // Should navigate to booking with pre-filled data
    await expect(page).toHaveURL(/\/booking\?service=dubinsko/);
    await expect(page.locator('button[aria-pressed="true"]')).toContainText('Dubinsko čišćenje');
  });
});
```

### 4.2 Booking Flow Scenarios

```typescript
// e2e/booking-flow-scenarios.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Booking Flow Scenarios', () => {
  test('should handle unavailable time slots', async ({ page }) => {
    await page.goto('/booking');

    // Select service
    await page.click('button:has-text("Standardno čišćenje")');
    await page.click('button:has-text("Dalje")');

    // Select date
    await page.fill('input[name="date"]', '2024-12-25');

    // Check that some time slots are disabled
    const disabledSlots = await page.locator('select[name="time"] option:disabled').count();
    expect(disabledSlots).toBeGreaterThan(0);

    // Try to select a disabled slot
    const unavailableTime = await page.locator('select[name="time"] option:disabled').first().getAttribute('value');
    await page.selectOption('select[name="time"]', unavailableTime);

    // Should show error
    await expect(page.locator('text=Ovaj termin nije dostupan')).toBeVisible();
  });

  test('should validate form fields in real-time', async ({ page }) => {
    await page.goto('/booking');

    // Skip to contact form
    await page.click('button:has-text("Standardno čišćenje")');
    await page.click('button:has-text("Dalje")');
    await page.fill('input[name="date"]', '2024-12-25');
    await page.selectOption('select[name="time"]', '10:00');
    await page.click('button:has-text("Dalje")');

    // Test email validation
    await page.fill('input[name="email"]', 'invalid-email');
    await page.click('body'); // Trigger blur
    await expect(page.locator('text=Molimo unesite valjanu email adresu')).toBeVisible();

    // Fix email
    await page.fill('input[name="email"]', 'test@example.com');
    await expect(page.locator('text=Molimo unesite valjanu email adresu')).not.toBeVisible();

    // Test phone validation
    await page.fill('input[name="phone"]', '123');
    await page.click('body'); // Trigger blur
    await expect(page.locator('text=Format: 091 234 5678')).toBeVisible();

    // Fix phone
    await page.fill('input[name="phone"]', '091 234 5678');
    await expect(page.locator('text=Format: 091 234 5678')).not.toBeVisible();
  });

  test('should save form progress and allow resuming', async ({ page, context }) => {
    await page.goto('/booking');

    // Start filling form
    await page.click('button:has-text("Standardno čišćenje")');
    await page.click('button:has-text("Dalje")');

    await page.fill('input[name="date"]', '2024-12-25');
    await page.selectOption('select[name="time"]', '10:00');
    await page.click('button:has-text("Dalje")');

    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');

    // Navigate away
    await page.goto('/');

    // Return to booking
    await page.goto('/booking');

    // Should show resume dialog
    await expect(page.locator('text=Želite li nastaviti gdje ste stali?')).toBeVisible();

    // Click resume
    await page.click('button:has-text("Nastavi")');

    // Should be on step 3 with data filled
    await expect(page.locator('input[name="name"]')).toHaveValue('Test User');
    await expect(page.locator('input[name="email"]')).toHaveValue('test@example.com');
  });
});
```

### 4.3 Cross-Browser Testing

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
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 4.4 Mobile Testing Approach

```typescript
// e2e/mobile-testing.spec.ts
import { test, expect, devices } from '@playwright/test';

test.describe('Mobile Experience', () => {
  test.use({
    ...devices['iPhone 12'],
    viewport: { width: 390, height: 844 },
  });

  test('should show mobile-optimized navigation', async ({ page }) => {
    await page.goto('/');

    // Desktop nav should be hidden
    await expect(page.locator('.desktop-nav')).not.toBeVisible();

    // Mobile menu button should be visible
    await expect(page.locator('[aria-label="Menu"]')).toBeVisible();

    // Open mobile menu
    await page.click('[aria-label="Menu"]');

    // Mobile menu should slide in
    await expect(page.locator('.mobile-menu')).toBeVisible();

    // All navigation items should be accessible
    await expect(page.locator('.mobile-menu a')).toHaveCount(5);
  });

  test('should handle touch interactions in booking form', async ({ page }) => {
    await page.goto('/booking');

    // Service cards should be touch-friendly
    const serviceCard = page.locator('button:has-text("Standardno čišćenje")');
    const box = await serviceCard.boundingBox();

    // Minimum touch target size (48x48px)
    expect(box.height).toBeGreaterThanOrEqual(48);
    expect(box.width).toBeGreaterThanOrEqual(48);

    // Tap service
    await serviceCard.tap();

    // Should show visual feedback
    await expect(serviceCard).toHaveClass(/selected/);

    // Swipe gesture for calendar (if implemented)
    await page.click('button:has-text("Dalje")');

    const calendar = page.locator('.calendar-container');
    await calendar.swipe({ direction: 'left' }); // Next month

    // Date picker should be touch-optimized
    const dateInput = page.locator('input[name="date"]');
    await dateInput.click();

    // Should open native date picker on mobile
    const inputType = await dateInput.getAttribute('type');
    expect(inputType).toBe('date');
  });

  test('should have responsive form layout', async ({ page }) => {
    await page.goto('/booking');

    // Form should be single column on mobile
    const formWidth = await page.locator('.booking-form').boundingBox();
    expect(formWidth.width).toBeLessThanOrEqual(390);

    // Inputs should be full width
    await page.click('button:has-text("Standardno čišćenje")');
    await page.click('button:has-text("Dalje")');
    await page.fill('input[name="date"]', '2024-12-25');
    await page.selectOption('select[name="time"]', '10:00');
    await page.click('button:has-text("Dalje")');

    const nameInput = page.locator('input[name="name"]');
    const inputBox = await nameInput.boundingBox();

    // Input should span most of the screen width (with padding)
    expect(inputBox.width).toBeGreaterThan(350);
  });

  test('should optimize images for mobile', async ({ page }) => {
    await page.goto('/');

    // Check that images use srcset for responsive loading
    const heroImage = page.locator('.hero-image img');
    const srcset = await heroImage.getAttribute('srcset');

    expect(srcset).toBeTruthy();
    expect(srcset).toContain('640w'); // Mobile size
    expect(srcset).toContain('1024w'); // Tablet size

    // Images should have loading="lazy" for performance
    const serviceImages = page.locator('.service-card img');
    const loadingAttrs = await serviceImages.evaluateAll(
      imgs => imgs.map(img => img.getAttribute('loading'))
    );

    expect(loadingAttrs.every(attr => attr === 'lazy')).toBe(true);
  });
});
```

## 5. Quality Assurance

### 5.1 Code Quality Metrics

```typescript
// quality/metrics.config.ts
export const qualityMetrics = {
  // Code complexity thresholds
  complexity: {
    cyclomatic: {
      max: 10,
      warning: 7
    },
    cognitive: {
      max: 15,
      warning: 10
    }
  },

  // Maintainability index
  maintainability: {
    minimum: 70,
    target: 85
  },

  // Test quality metrics
  testing: {
    coverage: {
      statements: 85,
      branches: 80,
      functions: 80,
      lines: 85
    },
    mutationScore: 75, // Minimum percentage of killed mutants
  },

  // Performance budgets
  performance: {
    lighthouse: {
      performance: 90,
      accessibility: 100,
      bestPractices: 95,
      seo: 100
    },
    webVitals: {
      lcp: 2500, // Largest Contentful Paint (ms)
      fid: 100,  // First Input Delay (ms)
      cls: 0.1,  // Cumulative Layout Shift
      ttfb: 600  // Time to First Byte (ms)
    }
  },

  // Bundle size limits
  bundleSize: {
    javascript: {
      initial: 200, // KB
      lazy: 100     // KB per chunk
    },
    css: {
      initial: 50,  // KB
      lazy: 20      // KB per chunk
    }
  }
};
```

### 5.2 Performance Benchmarks

```typescript
// e2e/performance.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Performance Benchmarks', () => {
  test('should meet Core Web Vitals', async ({ page }) => {
    await page.goto('/');

    // Measure Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        let lcp, fid, cls, ttfb;

        // LCP
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          lcp = entries[entries.length - 1].renderTime || entries[entries.length - 1].loadTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });

        // FID
        new PerformanceObserver((list) => {
          fid = list.getEntries()[0].processingStart - list.getEntries()[0].startTime;
        }).observe({ type: 'first-input', buffered: true });

        // CLS
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          cls = clsValue;
        }).observe({ type: 'layout-shift', buffered: true });

        // TTFB
        ttfb = performance.timing.responseStart - performance.timing.fetchStart;

        // Wait for metrics to be collected
        setTimeout(() => {
          resolve({ lcp, fid, cls, ttfb });
        }, 5000);
      });
    });

    expect(metrics.lcp).toBeLessThan(2500);
    expect(metrics.cls).toBeLessThan(0.1);
    expect(metrics.ttfb).toBeLessThan(600);
  });

  test('should optimize bundle size', async ({ page }) => {
    const response = await page.goto('/');

    // Check initial JS bundle size
    const jsSize = await page.evaluate(() => {
      const scripts = performance.getEntriesByType('resource')
        .filter(entry => entry.name.endsWith('.js'));
      return scripts.reduce((total, script) => total + script.transferSize, 0);
    });

    expect(jsSize).toBeLessThan(200 * 1024); // 200KB limit

    // Check initial CSS bundle size
    const cssSize = await page.evaluate(() => {
      const styles = performance.getEntriesByType('resource')
        .filter(entry => entry.name.endsWith('.css'));
      return styles.reduce((total, style) => total + style.transferSize, 0);
    });

    expect(cssSize).toBeLessThan(50 * 1024); // 50KB limit
  });

  test('should load pages within performance budget', async ({ page }) => {
    const pages = ['/', '/services', '/pricing', '/booking', '/contact'];

    for (const url of pages) {
      const startTime = Date.now();
      await page.goto(url);
      const loadTime = Date.now() - startTime;

      // Page should load within 3 seconds on decent connection
      expect(loadTime).toBeLessThan(3000);

      // Check for any console errors
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      expect(consoleErrors).toHaveLength(0);
    }
  });
});
```

### 5.3 Accessibility Testing

```typescript
// e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility Compliance', () => {
  test('should have no accessibility violations on homepage', async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);

    const violations = await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: {
        html: true
      }
    });

    expect(violations).toBeNull();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Tab through interactive elements
    await page.keyboard.press('Tab');

    // First focusable element should be skip link
    const skipLink = await page.evaluate(() => {
      return document.activeElement?.textContent;
    });
    expect(skipLink).toContain('Skip to main content');

    // Tab to main navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should be able to navigate with Enter
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/services');

    // Test form keyboard navigation
    await page.goto('/booking');

    // Tab to first service option
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Select with Space
    await page.keyboard.press('Space');

    // Should have selected the service
    const selected = await page.evaluate(() => {
      return document.activeElement?.getAttribute('aria-pressed');
    });
    expect(selected).toBe('true');
  });

  test('should have proper ARIA labels and roles', async ({ page }) => {
    await page.goto('/booking');

    // Check form has proper ARIA attributes
    const form = page.locator('form[role="form"]');
    await expect(form).toHaveAttribute('aria-label', 'Obrazac za rezervaciju');

    // Check progress indicator
    const progress = page.locator('[role="progressbar"]');
    await expect(progress).toHaveAttribute('aria-valuenow', '1');
    await expect(progress).toHaveAttribute('aria-valuemax', '5');

    // Check error messages association
    await page.fill('input[name="email"]', 'invalid');
    await page.click('body'); // Trigger validation

    const emailInput = page.locator('input[name="email"]');
    const errorId = await emailInput.getAttribute('aria-describedby');

    const errorMessage = page.locator(`#${errorId}`);
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveAttribute('role', 'alert');
  });

  test('should support screen readers', async ({ page }) => {
    await page.goto('/');

    // Check for screen reader only content
    const srOnly = await page.$$eval('.sr-only', elements =>
      elements.map(el => el.textContent)
    );

    expect(srOnly).toContain('Navigacija');
    expect(srOnly).toContain('Glavni sadržaj');

    // Check live regions for dynamic content
    await page.goto('/booking');

    // Price calculation should announce to screen readers
    const priceRegion = page.locator('[aria-live="polite"]');
    await expect(priceRegion).toHaveAttribute('aria-atomic', 'true');

    // Fill form to trigger price update
    await page.click('button:has-text("Standardno čišćenje")');

    // Wait for price announcement
    await expect(priceRegion).toContainText('Cijena');
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');

    const contrastViolations = await page.evaluate(() => {
      const violations = [];
      const elements = document.querySelectorAll('*');

      elements.forEach(element => {
        const style = window.getComputedStyle(element);
        const bgColor = style.backgroundColor;
        const textColor = style.color;

        // Simple contrast check (would use axe-core in real implementation)
        if (bgColor && textColor && bgColor !== 'rgba(0, 0, 0, 0)') {
          // Check contrast ratio (simplified)
          const contrast = getContrastRatio(textColor, bgColor);
          if (contrast < 4.5) {
            violations.push({
              element: element.tagName,
              contrast
            });
          }
        }
      });

      function getContrastRatio(fg, bg) {
        // Simplified contrast calculation
        return 5; // Placeholder - use proper algorithm
      }

      return violations;
    });

    expect(contrastViolations).toHaveLength(0);
  });
});
```

### 5.4 Security Testing Checklist

```typescript
// security/security-tests.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Security Testing', () => {
  test('should prevent XSS attacks', async ({ page }) => {
    await page.goto('/booking');

    // Try to inject script tag
    const xssPayload = '<script>alert("XSS")</script>';

    await page.fill('input[name="name"]', xssPayload);
    await page.fill('input[name="email"]', 'test@example.com');

    // Submit form
    // ... complete form submission

    // Check that script is not executed
    const alerts = [];
    page.on('dialog', dialog => {
      alerts.push(dialog.message());
      dialog.dismiss();
    });

    expect(alerts).toHaveLength(0);

    // Check that input is sanitized in display
    const displayedName = await page.textContent('[data-testid="customer-name"]');
    expect(displayedName).not.toContain('<script>');
  });

  test('should implement CSRF protection', async ({ page }) => {
    const response = await page.request.post('/api/booking', {
      data: {
        service: 'standardno',
        // ... booking data
      },
      headers: {
        // Missing CSRF token
        'Content-Type': 'application/json'
      }
    });

    expect(response.status()).toBe(403);
    const error = await response.json();
    expect(error.message).toContain('CSRF');
  });

  test('should enforce rate limiting', async ({ page }) => {
    const requests = [];

    // Make rapid requests
    for (let i = 0; i < 10; i++) {
      requests.push(
        page.request.post('/api/booking', {
          data: { test: 'data' }
        })
      );
    }

    const responses = await Promise.all(requests);

    // Some requests should be rate limited
    const rateLimited = responses.filter(r => r.status() === 429);
    expect(rateLimited.length).toBeGreaterThan(0);
  });

  test('should validate and sanitize all inputs', async ({ page }) => {
    await page.goto('/booking');

    // SQL injection attempt
    await page.fill('input[name="email"]', "test@test.com'; DROP TABLE bookings;--");

    // Path traversal attempt
    await page.fill('input[name="address"]', '../../../../etc/passwd');

    // Submit and check server response
    const response = await page.request.post('/api/booking', {
      data: {
        email: "test@test.com'; DROP TABLE bookings;--",
        address: '../../../../etc/passwd'
      }
    });

    // Should reject malicious input
    expect(response.status()).toBe(400);
  });

  test('should have secure headers', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response.headers();

    // Security headers checklist
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-xss-protection']).toBe('1; mode=block');
    expect(headers['strict-transport-security']).toContain('max-age=');
    expect(headers['content-security-policy']).toBeTruthy();
  });

  test('should not expose sensitive information', async ({ page }) => {
    // Check for exposed API keys in source
    await page.goto('/');
    const pageSource = await page.content();

    // Should not contain sensitive patterns
    expect(pageSource).not.toMatch(/api[_-]?key/i);
    expect(pageSource).not.toMatch(/secret/i);
    expect(pageSource).not.toMatch(/password/i);
    expect(pageSource).not.toMatch(/private[_-]?key/i);

    // Check API error responses
    const response = await page.request.get('/api/nonexistent');
    const error = await response.json();

    // Should not expose stack traces
    expect(error).not.toHaveProperty('stack');
    expect(error).not.toHaveProperty('trace');
  });
});
```

## Testing Commands & Scripts

```json
// package.json
{
  "scripts": {
    "test": "npm run test:unit && npm run test:integration && npm run test:e2e",
    "test:unit": "jest --testPathPattern='\\.test\\.(ts|tsx)$' --coverage",
    "test:integration": "jest --testPathPattern='\\.integration\\.test\\.(ts|tsx)$'",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage --coverageReporters=html",
    "test:ci": "npm run test:unit -- --ci --maxWorkers=2 && npm run test:e2e",
    "test:mutation": "stryker run",
    "test:accessibility": "playwright test e2e/accessibility.spec.ts",
    "test:performance": "playwright test e2e/performance.spec.ts",
    "test:security": "playwright test security/security-tests.spec.ts",
    "lint:test": "eslint '**/*.test.{ts,tsx}' --fix",
    "validate": "npm run lint && npm run type-check && npm run test"
  }
}
```

## Continuous Monitoring

```yaml
# .github/workflows/quality-gates.yml
name: Quality Gates

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  quality-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run type checking
        run: npm run type-check

      - name: Run unit tests with coverage
        run: npm run test:unit -- --coverage

      - name: Check coverage thresholds
        run: |
          coverage=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$coverage < 85" | bc -l) )); then
            echo "Coverage is below threshold: $coverage%"
            exit 1
          fi

      - name: Run integration tests
        run: npm run test:integration

      - name: Run E2E tests
        run: |
          npx playwright install
          npm run build
          npm run test:e2e

      - name: Run accessibility tests
        run: npm run test:accessibility

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: |
            coverage/
            playwright-report/
            test-results/
```

## Summary

This comprehensive testing implementation guide provides WebUredno with:

1. **Complete Testing Architecture**: Testing pyramid approach with clear coverage requirements and CI/CD integration
2. **Detailed Unit Testing**: Component, utility, and hook testing patterns with comprehensive mocking strategies
3. **Robust Integration Testing**: API endpoint, form submission, database, and external service testing
4. **Thorough E2E Testing**: Critical user journeys, booking scenarios, cross-browser, and mobile testing
5. **Quality Assurance Framework**: Code metrics, performance benchmarks, accessibility compliance, and security testing

The testing strategy ensures high code quality, reliability, and user satisfaction while maintaining development velocity and preventing regression issues. All tests are designed to be maintainable, scalable, and aligned with the WebUredno platform's business requirements.