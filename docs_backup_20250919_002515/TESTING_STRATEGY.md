# WebUredno Phase 2 - Comprehensive Testing Strategy

## 🎯 Executive Summary

This document outlines the comprehensive testing strategy for WebUredno Phase 2, targeting **minimum 80% test coverage** across all layers with Croatian market-specific validation and GDPR compliance testing.

## 📊 Testing Pyramid Strategy

```
         ┌─────────────┐
         │    E2E      │ 10%
         │   Tests     │
         ├─────────────┤
         │Integration  │ 20%
         │   Tests     │
         ├─────────────┤
         │    API      │ 30%
         │   Tests     │
         ├─────────────┤
         │    Unit     │ 40%
         │   Tests     │
         └─────────────┘
```

### Distribution Targets
- **Unit Tests**: 40% - Fast, isolated component testing
- **API Tests**: 30% - Endpoint validation and business logic
- **Integration Tests**: 20% - Service interactions and workflows
- **E2E Tests**: 10% - Critical user journeys

## 🧪 1. Unit Testing Coverage

### 1.1 Component Testing (React Testing Library)

#### Core Components to Test
```typescript
// Priority 1 - Business Critical
├── BookingForm.tsx          // 95% coverage required
├── PricingCalculator.tsx    // 95% coverage required
├── ServiceSelector.tsx      // 90% coverage required
├── DateTimePicker.tsx       // 90% coverage required
└── PaymentForm.tsx          // 95% coverage required

// Priority 2 - User Experience
├── ServiceTiers.tsx         // 85% coverage
├── TrustBadges.tsx         // 80% coverage
├── TestimonialsCarousel.tsx // 80% coverage
└── MobileBookingFlow.tsx    // 90% coverage

// Priority 3 - Supporting Components
├── Navigation.tsx           // 75% coverage
├── Footer.tsx              // 70% coverage
└── LoadingStates.tsx       // 75% coverage
```

#### Test Cases Per Component

**BookingForm Component Tests**
```typescript
describe('BookingForm', () => {
  // Form Validation
  - validates Croatian phone numbers (+385 format)
  - validates Croatian postal codes (5 digits)
  - validates email format
  - validates minimum property size (20m²)

  // User Interactions
  - handles form submission correctly
  - shows validation errors in Croatian
  - calculates price on property size change
  - enables/disables submit based on validation

  // Croatian Localization
  - displays all labels in Croatian
  - formats dates in DD.MM.YYYY
  - formats currency in EUR with Croatian conventions
  - shows Croatian city suggestions

  // Accessibility
  - has proper ARIA labels
  - supports keyboard navigation
  - announces errors to screen readers
})
```

### 1.2 Business Logic Testing

#### Pricing Engine Tests
```typescript
describe('PricingEngine', () => {
  // Base Calculations
  - calculates standard cleaning price
  - calculates deep cleaning price (+50%)
  - calculates move-in/out cleaning (+75%)

  // Frequency Discounts
  - applies weekly discount (20%)
  - applies bi-weekly discount (15%)
  - applies monthly discount (10%)

  // Add-on Services
  - adds window cleaning (€15)
  - adds ironing service (€20/hour)
  - adds fridge cleaning (€25)

  // Croatian Market Rules
  - applies VAT correctly (25%)
  - handles Sunday surcharge (+30%)
  - applies holiday pricing
  - validates Zagreb zone pricing
})
```

#### Validation Logic Tests
```typescript
describe('ValidationRules', () => {
  // Croatian Phone Numbers
  - validates mobile numbers (09x)
  - validates landline numbers (01 for Zagreb)
  - accepts +385 international format

  // Croatian Addresses
  - validates postal codes by region
  - validates special characters (š,đ,č,ć,ž)
  - validates street name formats

  // Business Rules
  - validates minimum 48h advance booking
  - validates working hours (08:00-18:00)
  - validates service area (Zagreb + 30km)
})
```

### 1.3 Utility Function Tests

```typescript
describe('UtilityFunctions', () => {
  // Date Utilities
  - formats dates for Croatian locale
  - calculates working days excluding holidays
  - handles Croatian public holidays

  // String Utilities
  - handles Croatian diacritics
  - normalizes search queries
  - validates Croatian OIB numbers

  // Number Utilities
  - formats currency with Croatian conventions
  - calculates surface area correctly
  - rounds prices to nearest 0.50 EUR
})
```

## 🔗 2. Integration Testing

### 2.1 API Integration Tests

#### Booking Flow Integration
```typescript
describe('Booking API Integration', () => {
  // Complete Booking Flow
  - validates booking data
  - calculates pricing correctly
  - sends confirmation email
  - creates calendar event
  - stores in database
  - returns booking ID

  // Error Scenarios
  - handles validation failures
  - handles email service failures
  - handles calendar API failures
  - handles database failures
  - maintains data consistency
})
```

#### Email Service Integration
```typescript
describe('Email Service Integration', () => {
  // Customer Emails
  - sends booking confirmation
  - sends reminder 24h before
  - sends feedback request after service

  // Admin Emails
  - sends new booking notification
  - sends daily schedule summary
  - sends weekly performance report

  // Croatian Content
  - uses correct Croatian templates
  - personalizes with customer name
  - includes all booking details
  - formats dates/times correctly
})
```

#### Calendar Integration
```typescript
describe('Google Calendar Integration', () => {
  // Event Creation
  - creates event with correct details
  - sets Zagreb timezone (Europe/Zagreb)
  - adds team members as attendees
  - sets appropriate reminders

  // Event Management
  - updates event on reschedule
  - cancels event on booking cancellation
  - handles conflict detection
  - manages recurring bookings
})
```

### 2.2 Database Integration Tests

```typescript
describe('Database Operations', () => {
  // Booking Operations
  - creates booking with all fields
  - updates booking status
  - handles concurrent bookings
  - maintains referential integrity

  // Customer Operations
  - creates customer profile
  - updates customer preferences
  - tracks booking history
  - manages GDPR consent

  // Reporting Queries
  - calculates daily revenue
  - tracks team utilization
  - generates customer reports
  - performs efficiently at scale
})
```

## 🌐 3. End-to-End Testing

### 3.1 Critical User Journeys

#### Journey 1: First-Time Booking
```typescript
test('Complete booking flow - new customer', async ({ page }) => {
  // 1. Landing page
  - verify hero section loads
  - check trust badges display

  // 2. Service selection
  - select standard cleaning
  - enter 75m² apartment
  - add window cleaning

  // 3. Date/time selection
  - select next Tuesday
  - choose 10:00 time slot

  // 4. Personal details
  - enter Croatian phone number
  - enter Zagreb address
  - accept GDPR terms

  // 5. Confirmation
  - verify price calculation
  - submit booking
  - check confirmation message
})
```

#### Journey 2: Recurring Booking Setup
```typescript
test('Setup weekly cleaning subscription', async ({ page }) => {
  // Similar flow with frequency selection
  - select weekly cleaning
  - verify discount applied
  - set preferred day/time
  - confirm recurring schedule
})
```

#### Journey 3: Mobile Booking Flow
```typescript
test('Mobile-optimized booking', async ({ page, viewport }) => {
  // Test on mobile viewport
  - verify responsive layout
  - test touch interactions
  - validate form usability
  - check loading performance
})
```

### 3.2 Cross-Browser Testing

```yaml
browsers:
  - Chrome (latest, latest-1)
  - Firefox (latest, latest-1)
  - Safari (latest)
  - Edge (latest)

devices:
  - iPhone 13 Pro
  - iPhone SE
  - Samsung Galaxy S21
  - iPad Pro
  - Desktop 1920x1080
  - Desktop 1366x768
```

## ⚡ 4. Performance Testing

### 4.1 Load Testing Scenarios

#### Scenario 1: Normal Load
```yaml
scenario: normal_load
  vus: 50  # Virtual users
  duration: 10m
  targets:
    - API response time < 200ms (p95)
    - Page load time < 2s
    - Error rate < 0.1%
```

#### Scenario 2: Peak Load (Monday Morning)
```yaml
scenario: peak_load
  vus: 200
  duration: 30m
  ramp_up: 5m
  targets:
    - API response time < 500ms (p95)
    - Page load time < 3s
    - Error rate < 1%
    - No database locks
```

#### Scenario 3: Stress Test
```yaml
scenario: stress_test
  vus: 500
  duration: 15m
  targets:
    - System remains operational
    - Graceful degradation
    - Recovery after load
```

### 4.2 Performance Benchmarks

#### API Performance
```yaml
endpoints:
  GET /api/availability:
    p50: < 50ms
    p95: < 150ms
    p99: < 300ms

  POST /api/booking:
    p50: < 100ms
    p95: < 300ms
    p99: < 500ms

  GET /api/pricing:
    p50: < 30ms
    p95: < 100ms
    p99: < 200ms
```

#### Frontend Performance (Core Web Vitals)
```yaml
metrics:
  LCP: < 2.5s  # Largest Contentful Paint
  FID: < 100ms # First Input Delay
  CLS: < 0.1   # Cumulative Layout Shift

  lighthouse_scores:
    performance: > 90
    accessibility: > 95
    best_practices: > 95
    seo: > 95
```

### 4.3 Database Performance

```sql
-- Query performance requirements
-- All times for 100k+ records

-- Availability check
SELECT * FROM time_slots
WHERE date = ? AND team_id = ?
-- Target: < 10ms

-- Booking creation
INSERT INTO bookings (...) VALUES (...)
-- Target: < 50ms

-- Daily schedule
SELECT * FROM bookings
WHERE date = ? ORDER BY time
-- Target: < 100ms

-- Customer history
SELECT * FROM bookings
WHERE customer_id = ?
ORDER BY date DESC LIMIT 10
-- Target: < 50ms
```

## 🔐 5. Security Testing

### 5.1 OWASP Top 10 Coverage

#### A01: Broken Access Control
```typescript
describe('Access Control Tests', () => {
  - test admin endpoints require authentication
  - test customer can only access own bookings
  - test rate limiting on sensitive endpoints
  - test CORS configuration
})
```

#### A02: Cryptographic Failures
```typescript
describe('Cryptography Tests', () => {
  - test passwords are hashed with bcrypt
  - test sensitive data encrypted in transit
  - test PII encrypted at rest
  - test secure session management
})
```

#### A03: Injection
```typescript
describe('Injection Prevention', () => {
  - test SQL injection prevention
  - test XSS prevention
  - test command injection prevention
  - test Croatian special characters handling
})
```

### 5.2 API Security Testing

```typescript
describe('API Security', () => {
  // Authentication
  - requires valid JWT tokens
  - validates token expiration
  - handles token refresh

  // Authorization
  - enforces role-based access
  - validates resource ownership
  - prevents privilege escalation

  // Input Validation
  - validates all input fields
  - prevents oversized payloads
  - sanitizes special characters

  // Rate Limiting
  - limits requests per IP
  - implements exponential backoff
  - prevents brute force attacks
})
```

### 5.3 GDPR Compliance Testing

```typescript
describe('GDPR Compliance', () => {
  // Consent Management
  - requires explicit consent for data processing
  - allows consent withdrawal
  - tracks consent history

  // Data Rights
  - implements data export (GDPR Art. 20)
  - implements data deletion (GDPR Art. 17)
  - implements data correction (GDPR Art. 16)

  // Data Protection
  - encrypts personal data
  - implements data minimization
  - enforces retention policies

  // Croatian DPA Requirements
  - includes Croatian privacy notice
  - logs data processing activities
  - implements breach notification
})
```

## 🌍 6. Croatian Market-Specific Tests

### 6.1 Localization Testing

```typescript
describe('Croatian Localization', () => {
  // Language
  - all UI text in Croatian
  - proper use of diacritics (š,đ,č,ć,ž)
  - correct grammatical cases

  // Formatting
  - dates: DD.MM.YYYY
  - time: 24-hour format
  - currency: EUR with Croatian format
  - phone: +385 format

  // Cultural Appropriateness
  - appropriate imagery
  - local testimonials
  - Croatian holidays recognized
})
```

### 6.2 Regional Validation

```typescript
describe('Croatian Regional Rules', () => {
  // Zagreb-specific
  - validates Zagreb postal codes (10000-10090)
  - calculates zone-based pricing
  - handles Zagreb city districts

  // Service Areas
  - validates 30km radius from Zagreb
  - calculates travel surcharges
  - validates supported cities

  // Legal Requirements
  - displays OIB number
  - includes required legal text
  - shows business registration
})
```

### 6.3 Payment Testing

```typescript
describe('Payment Processing', () => {
  // Croatian Payment Methods
  - accepts Croatian cards
  - handles SEPA transfers
  - supports invoice payment

  // VAT Handling
  - calculates 25% PDV correctly
  - generates valid R1 invoices
  - includes all required invoice fields

  // Currency
  - displays prices in EUR
  - handles currency conversion
  - rounds to Croatian standards
})
```

## 📋 7. Test Coverage Requirements

### Minimum Coverage Targets

```yaml
overall: 80%

by_category:
  business_critical: 95%  # Booking, Payment, Pricing
  user_facing: 85%        # UI Components, Forms
  api_endpoints: 90%      # All API routes
  utilities: 80%          # Helper functions
  admin: 75%              # Admin dashboard

by_type:
  unit_tests: 85%
  integration_tests: 75%
  e2e_tests: 60%         # Critical paths only

excluded_from_coverage:
  - configuration files
  - type definitions
  - test files
  - development tools
```

### Coverage Reporting

```json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      },
      "src/components/booking/": {
        "branches": 95,
        "functions": 95,
        "lines": 95,
        "statements": 95
      },
      "src/api/": {
        "branches": 90,
        "functions": 90,
        "lines": 90,
        "statements": 90
      }
    }
  }
}
```

## 🤖 8. Automated Testing Workflows

### 8.1 CI/CD Pipeline

```yaml
name: Test Pipeline

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
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:coverage

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
    steps:
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:e2e

  performance-tests:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - run: npm run test:performance

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - run: npm audit
      - run: npm run test:security
```

### 8.2 Pre-commit Hooks

```bash
#!/bin/bash
# .husky/pre-commit

# Run unit tests for changed files
npm run test:related

# Check test coverage
npm run test:coverage:check

# Run linting
npm run lint

# Type checking
npm run type-check
```

### 8.3 Scheduled Tests

```yaml
# Nightly regression tests
schedule:
  - cron: '0 2 * * *'  # 2 AM daily
  jobs:
    - full regression suite
    - performance baseline
    - security scan

# Weekly load tests
schedule:
  - cron: '0 3 * * 1'  # Monday 3 AM
  jobs:
    - load testing
    - stress testing
    - database performance
```

## 📊 9. Test Metrics and Reporting

### 9.1 Key Metrics

```yaml
quality_metrics:
  test_coverage: > 80%
  test_pass_rate: > 98%
  defect_escape_rate: < 2%
  mean_time_to_detect: < 30min
  mean_time_to_fix: < 4h

performance_metrics:
  api_response_p95: < 200ms
  page_load_time: < 2s
  error_rate: < 0.1%

automation_metrics:
  automation_coverage: > 70%
  test_execution_time: < 30min
  flaky_test_rate: < 5%
```

### 9.2 Reporting Dashboard

```typescript
// Test Report Structure
interface TestReport {
  summary: {
    total: number
    passed: number
    failed: number
    skipped: number
    duration: number
  }

  coverage: {
    lines: number
    functions: number
    branches: number
    statements: number
  }

  performance: {
    api: MetricsSummary
    frontend: CoreWebVitals
    database: QueryPerformance
  }

  security: {
    vulnerabilities: Vulnerability[]
    compliance: ComplianceCheck[]
  }
}
```

## 🗓️ 10. 4-Week Implementation Plan

### Week 1: Foundation Setup
**Days 1-3: Testing Infrastructure**
- Set up Jest and React Testing Library
- Configure Playwright for E2E
- Set up k6 for performance testing
- Configure coverage reporting

**Days 4-5: CI/CD Integration**
- GitHub Actions workflow setup
- Pre-commit hooks configuration
- Test reporting pipeline
- Coverage threshold enforcement

### Week 2: Unit & Component Tests
**Days 6-8: Critical Components**
- BookingForm tests (95% coverage)
- PricingCalculator tests (95% coverage)
- Payment integration tests (95% coverage)

**Days 9-10: Supporting Components**
- Service selection tests
- Date/time picker tests
- Validation utilities tests

### Week 3: Integration & API Tests
**Days 11-13: API Testing**
- Booking API tests
- Pricing API tests
- Availability API tests
- Email service tests

**Days 14-15: Integration Tests**
- Database integration tests
- Calendar integration tests
- End-to-end booking flow tests

### Week 4: Performance & Security
**Days 16-17: Performance Testing**
- Load testing scenarios
- Performance benchmarking
- Database query optimization
- Frontend performance tests

**Days 18-19: Security Testing**
- OWASP vulnerability scanning
- GDPR compliance validation
- Croatian data protection tests
- API security testing

**Day 20: Final Review**
- Coverage analysis
- Test report generation
- Documentation update
- Handover and training

## 📚 11. Testing Best Practices

### 11.1 Test Writing Guidelines

```typescript
// Good Test Example
describe('BookingForm', () => {
  // Arrange
  const mockUser = createMockUser({
    name: 'Ana Horvat',
    phone: '+385912345678'
  })

  // Act & Assert
  it('should validate Croatian phone number', () => {
    const { getByLabelText, getByText } = render(
      <BookingForm user={mockUser} />
    )

    const phoneInput = getByLabelText(/telefon/i)
    fireEvent.change(phoneInput, {
      target: { value: '091-234-5678' }
    })

    expect(getByText(/ispravan format/i)).toBeInTheDocument()
  })
})
```

### 11.2 Test Data Management

```typescript
// Test data factories
export const factories = {
  booking: Factory.define<Booking>(() => ({
    id: faker.datatype.uuid(),
    customerName: faker.name.findName(),
    phone: `+38591${faker.datatype.number({ min: 1000000, max: 9999999 })}`,
    address: `${faker.address.streetAddress()}, Zagreb`,
    postalCode: faker.helpers.arrayElement(['10000', '10010', '10020']),
    serviceType: faker.helpers.arrayElement(['standardno', 'dubinsko']),
    date: faker.date.future(),
    time: faker.helpers.arrayElement(['09:00', '10:00', '11:00'])
  }))
}
```

### 11.3 Error Scenarios

```typescript
// Comprehensive error testing
describe('Error Handling', () => {
  const errorScenarios = [
    { input: '', error: 'Polje je obavezno' },
    { input: 'a', error: 'Prekratko' },
    { input: '123', error: 'Samo slova' },
    { input: 'test@', error: 'Neispravan email' }
  ]

  errorScenarios.forEach(({ input, error }) => {
    it(`should show "${error}" for input "${input}"`, () => {
      // Test implementation
    })
  })
})
```

## 🎯 Success Criteria

### Phase 2 Testing Goals

✅ **Coverage**: Achieve minimum 80% overall test coverage
✅ **Quality**: Zero critical bugs in production
✅ **Performance**: All APIs respond < 200ms (p95)
✅ **Security**: Pass OWASP security audit
✅ **Compliance**: 100% GDPR compliance validation
✅ **Automation**: 70% test automation coverage
✅ **Croatian Market**: All localization tests passing
✅ **User Experience**: Core Web Vitals in green

## 📞 Support and Resources

### Testing Resources
- Jest Documentation: https://jestjs.io/
- React Testing Library: https://testing-library.com/react
- Playwright: https://playwright.dev/
- k6 Performance: https://k6.io/

### Croatian Compliance
- GDPR Croatia: https://azop.hr/
- Croatian VAT Rules: https://www.porezna-uprava.hr/
- Zagreb Business Registry: https://sudreg.pravosudje.hr/

---

*Document Version: 1.0*
*Last Updated: 2025*
*Next Review: After Phase 2 Implementation*