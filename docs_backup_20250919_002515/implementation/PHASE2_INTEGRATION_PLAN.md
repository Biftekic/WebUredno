# Phase 2 Integration Implementation Plan - WebUredno

## Executive Summary

Phase 2 focuses on critical production integrations for WebUredno's cleaning service platform, building upon the completed Phase 1 foundation (UI/UX, APIs, Database). This plan details the implementation of email services, Google Calendar synchronization, monitoring/observability, and database migration strategies.

**Timeline**: 4 weeks (Sprint 5-8)
**Team Size**: 2-3 developers
**Risk Level**: Medium
**Dependencies**: Phase 1 completion, API credentials, production environment

---

## 1. Email Service Integration

### 1.1 Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Email Service Layer                │
├─────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │   SendGrid   │  │    Resend    │  │   SMTP   │  │
│  │   Provider   │  │   Provider   │  │ Fallback │  │
│  └──────┬───────┘  └──────┬───────┘  └─────┬────┘  │
│         └──────────────┬───────────────────┘        │
│                        ▼                             │
│            ┌──────────────────────┐                  │
│            │  Email Abstraction   │                  │
│            │      Service         │                  │
│            └──────────┬───────────┘                  │
│                       ▼                              │
│         ┌─────────────────────────────┐              │
│         │   Template Engine (React)   │              │
│         └─────────────────────────────┘              │
│                       ▼                              │
│         ┌─────────────────────────────┐              │
│         │  Queue (Bull/Redis/PG)      │              │
│         └─────────────────────────────┘              │
└─────────────────────────────────────────────────────┘
```

### 1.2 Implementation Components

#### A. Email Service Abstraction Layer

```typescript
// src/lib/email/types.ts
interface EmailProvider {
  send(email: Email): Promise<EmailResult>
  sendBatch(emails: Email[]): Promise<BatchResult>
  getStatus(messageId: string): Promise<EmailStatus>
}

interface Email {
  to: string | string[]
  subject: string
  template: EmailTemplate
  data: Record<string, any>
  locale: 'hr' | 'en'
  attachments?: Attachment[]
  scheduledFor?: Date
  priority?: 'high' | 'normal' | 'low'
}

enum EmailTemplate {
  BOOKING_CONFIRMATION = 'booking-confirmation',
  BOOKING_REMINDER = 'booking-reminder',
  BOOKING_COMPLETED = 'booking-completed',
  BOOKING_CANCELLED = 'booking-cancelled',
  BOOKING_RESCHEDULED = 'booking-rescheduled',
  PAYMENT_RECEIPT = 'payment-receipt',
  REVIEW_REQUEST = 'review-request',
  TEAM_ASSIGNMENT = 'team-assignment',
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password-reset'
}
```

#### B. Provider Configuration

```typescript
// src/lib/email/providers/sendgrid.ts
import sgMail from '@sendgrid/mail'

export class SendGridProvider implements EmailProvider {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!)
  }

  async send(email: Email): Promise<EmailResult> {
    const msg = {
      to: email.to,
      from: {
        email: process.env.EMAIL_FROM_ADDRESS!,
        name: 'Uredno Čišćenje'
      },
      subject: email.subject,
      html: await this.renderTemplate(email.template, email.data, email.locale),
      attachments: email.attachments,
      sendAt: email.scheduledFor ? Math.floor(email.scheduledFor.getTime() / 1000) : undefined,
      priority: this.mapPriority(email.priority)
    }

    try {
      const [response] = await sgMail.send(msg)
      return {
        success: true,
        messageId: response.headers['x-message-id'],
        provider: 'sendgrid'
      }
    } catch (error) {
      return this.handleError(error)
    }
  }
}
```

#### C. Croatian Email Templates

```tsx
// src/lib/email/templates/booking-confirmation.tsx
import { Html, Head, Body, Container, Text, Button, Hr } from '@react-email/components'

interface BookingConfirmationProps {
  customerName: string
  bookingNumber: string
  serviceType: string
  scheduledDate: string
  scheduledTime: string
  address: string
  price: string
  locale: 'hr' | 'en'
}

export const BookingConfirmationTemplate = ({
  customerName,
  bookingNumber,
  serviceType,
  scheduledDate,
  scheduledTime,
  address,
  price,
  locale
}: BookingConfirmationProps) => {
  const t = translations[locale]

  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.heading}>{t.title}</Text>
          <Text style={styles.greeting}>
            {t.greeting} {customerName},
          </Text>
          <Text style={styles.paragraph}>
            {t.confirmation}
          </Text>

          <Container style={styles.detailsBox}>
            <Text style={styles.detailLabel}>{t.bookingNumber}:</Text>
            <Text style={styles.detailValue}>{bookingNumber}</Text>

            <Text style={styles.detailLabel}>{t.service}:</Text>
            <Text style={styles.detailValue}>{serviceType}</Text>

            <Text style={styles.detailLabel}>{t.dateTime}:</Text>
            <Text style={styles.detailValue}>
              {scheduledDate} u {scheduledTime}
            </Text>

            <Text style={styles.detailLabel}>{t.address}:</Text>
            <Text style={styles.detailValue}>{address}</Text>

            <Hr style={styles.divider} />

            <Text style={styles.detailLabel}>{t.totalPrice}:</Text>
            <Text style={styles.price}>{price}</Text>
          </Container>

          <Button href={`https://uredno.eu/booking/${bookingNumber}`} style={styles.button}>
            {t.viewBooking}
          </Button>

          <Text style={styles.footer}>
            {t.questions}<br />
            {t.contact}: kontakt@uredno.eu | +385 91 234 5678
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const translations = {
  hr: {
    title: 'Potvrda rezervacije',
    greeting: 'Poštovani/a',
    confirmation: 'Vaša rezervacija usluge čišćenja je uspješno potvrđena.',
    bookingNumber: 'Broj rezervacije',
    service: 'Usluga',
    dateTime: 'Datum i vrijeme',
    address: 'Adresa',
    totalPrice: 'Ukupna cijena',
    viewBooking: 'Pogledajte detalje rezervacije',
    questions: 'Imate pitanja?',
    contact: 'Kontaktirajte nas'
  },
  en: {
    title: 'Booking Confirmation',
    greeting: 'Dear',
    confirmation: 'Your cleaning service booking has been successfully confirmed.',
    bookingNumber: 'Booking Number',
    service: 'Service',
    dateTime: 'Date & Time',
    address: 'Address',
    totalPrice: 'Total Price',
    viewBooking: 'View Booking Details',
    questions: 'Have questions?',
    contact: 'Contact us'
  }
}
```

### 1.3 Implementation Tasks

#### Sprint 5 - Week 1: Email Infrastructure

**Day 1-2: Provider Setup**
- [ ] Configure SendGrid account and API keys
- [ ] Set up Resend as backup provider
- [ ] Configure domain authentication (SPF, DKIM, DMARC)
- [ ] Set up email subdomains (transactional.uredno.eu)

**Day 3-4: Service Abstraction**
- [ ] Implement EmailProvider interface
- [ ] Create SendGrid provider implementation
- [ ] Create Resend provider implementation
- [ ] Implement provider failover logic

**Day 5: Queue System**
- [ ] Set up Bull queue with Redis
- [ ] Implement email job processor
- [ ] Add retry logic with exponential backoff
- [ ] Create dead letter queue for failed emails

#### Sprint 6 - Week 2: Template System

**Day 1-2: Template Engine**
- [ ] Set up React Email components
- [ ] Create base email layout
- [ ] Implement template rendering system
- [ ] Add inline CSS processing

**Day 3-5: Croatian Templates**
- [ ] Create booking confirmation template
- [ ] Create reminder templates (24h, 2h before)
- [ ] Create completion and review request templates
- [ ] Create cancellation and rescheduling templates
- [ ] Implement bilingual support (HR/EN)

### 1.4 Error Handling & Retry Mechanism

```typescript
// src/lib/email/queue/processor.ts
import { Queue, Worker } from 'bullmq'

const emailQueue = new Queue('emails', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: true,
    removeOnFail: false
  }
})

const worker = new Worker('emails', async (job) => {
  const { email } = job.data

  try {
    // Try primary provider
    const result = await primaryProvider.send(email)
    if (result.success) return result

    // Failover to secondary
    console.warn(`Primary provider failed, switching to backup`)
    return await backupProvider.send(email)

  } catch (error) {
    // Log to monitoring
    await sentry.captureException(error, {
      extra: { email, attempt: job.attemptsMade }
    })

    // If final attempt, move to dead letter queue
    if (job.attemptsMade >= job.opts.attempts!) {
      await deadLetterQueue.add('failed-email', { email, error })
    }

    throw error
  }
}, {
  connection: redis,
  concurrency: 10
})
```

---

## 2. Google Calendar Integration

### 2.1 Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│              Google Calendar Integration             │
├─────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────┐   │
│  │         Service Account Authentication        │   │
│  └────────────────────┬─────────────────────────┘   │
│                       ▼                              │
│  ┌──────────────────────────────────────────────┐   │
│  │          Calendar Service Layer               │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐   │   │
│  │  │  Events  │  │Availability│ │ Conflicts│   │   │
│  │  │ Manager  │  │   Checker  │ │ Resolver │   │   │
│  │  └──────────┘  └──────────┘  └──────────┘   │   │
│  └────────────────────┬─────────────────────────┘   │
│                       ▼                              │
│  ┌──────────────────────────────────────────────┐   │
│  │          Sync Engine (Webhooks/Polling)       │   │
│  └──────────────────────────────────────────────┘   │
│                       ▼                              │
│  ┌──────────────────────────────────────────────┐   │
│  │             Local Cache (Redis/DB)            │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 2.2 Service Account Setup

```typescript
// src/lib/calendar/google-calendar.ts
import { google } from 'googleapis'
import { JWT } from 'google-auth-library'

class GoogleCalendarService {
  private auth: JWT
  private calendar: any

  constructor() {
    const serviceAccount = JSON.parse(
      fs.readFileSync(process.env.GOOGLE_SERVICE_ACCOUNT_PATH!)
    )

    this.auth = new JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
      ],
      subject: process.env.GOOGLE_CALENDAR_OWNER_EMAIL
    })

    this.calendar = google.calendar({ version: 'v3', auth: this.auth })
  }

  async createBookingEvent(booking: Booking): Promise<CalendarEvent> {
    const event = {
      summary: `Čišćenje - ${booking.customer.lastName}`,
      description: this.formatEventDescription(booking),
      location: booking.address.fullAddress,
      start: {
        dateTime: booking.scheduledDateTime.toISOString(),
        timeZone: 'Europe/Zagreb'
      },
      end: {
        dateTime: this.calculateEndTime(booking).toISOString(),
        timeZone: 'Europe/Zagreb'
      },
      attendees: [
        { email: booking.customer.email },
        ...booking.team.members.map(m => ({ email: m.email }))
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 24h before
          { method: 'popup', minutes: 60 }       // 1h before
        ]
      },
      extendedProperties: {
        private: {
          bookingId: booking.id,
          bookingNumber: booking.bookingNumber,
          serviceType: booking.serviceType,
          teamId: booking.teamId
        }
      }
    }

    const response = await this.calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      resource: event,
      sendNotifications: true
    })

    return {
      id: response.data.id,
      htmlLink: response.data.htmlLink,
      status: response.data.status
    }
  }
}
```

### 2.3 Availability Synchronization

```typescript
// src/lib/calendar/availability.ts
class AvailabilityService {
  async checkTimeSlot(date: Date, duration: number): Promise<AvailabilityResult> {
    const startTime = date
    const endTime = addMinutes(date, duration)

    // Check Google Calendar
    const events = await this.calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      timeMin: startTime.toISOString(),
      timeMax: endTime.toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    })

    // Check team availability
    const availableTeams = await this.getAvailableTeams(startTime, endTime)

    // Check for conflicts
    const conflicts = this.detectConflicts(events.data.items, availableTeams)

    return {
      isAvailable: conflicts.length === 0,
      conflicts,
      availableTeams,
      alternativeSlots: await this.findAlternativeSlots(date, duration)
    }
  }

  async syncWithDatabase(): Promise<void> {
    // Fetch all future events from Google Calendar
    const events = await this.calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      timeMin: new Date().toISOString(),
      maxResults: 500,
      singleEvents: true,
      orderBy: 'startTime'
    })

    // Update local cache
    for (const event of events.data.items) {
      if (event.extendedProperties?.private?.bookingId) {
        await this.updateBookingStatus(
          event.extendedProperties.private.bookingId,
          event.status
        )
      }
    }
  }
}
```

### 2.4 Conflict Resolution

```typescript
// src/lib/calendar/conflict-resolver.ts
class ConflictResolver {
  async handleConflict(
    booking: Booking,
    conflict: CalendarConflict
  ): Promise<ResolutionResult> {
    const strategy = this.determineStrategy(conflict)

    switch (strategy) {
      case 'RESCHEDULE':
        return await this.rescheduleBooking(booking, conflict)

      case 'ASSIGN_DIFFERENT_TEAM':
        return await this.reassignTeam(booking, conflict)

      case 'SPLIT_BOOKING':
        return await this.splitBooking(booking, conflict)

      case 'NOTIFY_CUSTOMER':
        return await this.notifyAndWaitForDecision(booking, conflict)

      default:
        throw new Error(`Unknown conflict resolution strategy: ${strategy}`)
    }
  }

  private async rescheduleBooking(
    booking: Booking,
    conflict: CalendarConflict
  ): Promise<ResolutionResult> {
    // Find next available slot
    const alternatives = await this.findAlternativeSlots(
      booking.scheduledDate,
      booking.duration,
      {
        maxDays: 7,
        preferredTime: booking.scheduledTime,
        teamId: booking.teamId
      }
    )

    if (alternatives.length === 0) {
      return {
        success: false,
        action: 'NO_ALTERNATIVES',
        requiresCustomerInput: true
      }
    }

    // Update booking
    await this.updateBooking(booking.id, {
      scheduledDate: alternatives[0].date,
      scheduledTime: alternatives[0].time,
      status: 'RESCHEDULED'
    })

    // Update calendar
    await this.updateCalendarEvent(booking.calendarEventId, alternatives[0])

    // Notify customer
    await this.emailService.send({
      template: EmailTemplate.BOOKING_RESCHEDULED,
      to: booking.customer.email,
      data: {
        originalDate: booking.scheduledDate,
        newDate: alternatives[0].date,
        reason: conflict.reason
      }
    })

    return {
      success: true,
      action: 'RESCHEDULED',
      newDate: alternatives[0].date
    }
  }
}
```

---

## 3. Monitoring & Observability

### 3.1 Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│            Monitoring & Observability Stack          │
├─────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────┐   │
│  │           Application Layer                   │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐   │   │
│  │  │   APM    │  │  Errors  │  │  Custom  │   │   │
│  │  │ (Sentry) │  │ Tracking │  │  Metrics │   │   │
│  │  └──────────┘  └──────────┘  └──────────┘   │   │
│  └────────────────────┬─────────────────────────┘   │
│                       ▼                              │
│  ┌──────────────────────────────────────────────┐   │
│  │          Collection & Aggregation             │   │
│  │    (Prometheus / CloudWatch / Datadog)       │   │
│  └────────────────────┬─────────────────────────┘   │
│                       ▼                              │
│  ┌──────────────────────────────────────────────┐   │
│  │        Visualization & Alerting               │   │
│  │         (Grafana / Custom Dashboard)          │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 3.2 Sentry Configuration

```typescript
// src/lib/monitoring/sentry.ts
import * as Sentry from '@sentry/nextjs'

export function initSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    beforeSend(event, hint) {
      // Filter out sensitive data
      if (event.request?.cookies) {
        delete event.request.cookies
      }

      // Add custom context
      event.tags = {
        ...event.tags,
        service: 'weburedno',
        region: 'croatia'
      }

      return event
    },

    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Prisma({ client: prisma }),
      new BrowserTracing({
        routingInstrumentation: Sentry.nextRouterInstrumentation
      })
    ]
  })
}

// Error boundary wrapper
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>
) {
  return Sentry.withErrorBoundary(Component, {
    fallback: ({ error, resetError }) => (
      <ErrorFallback error={error} resetError={resetError} />
    ),
    showDialog: process.env.NODE_ENV === 'production'
  })
}
```

### 3.3 Business Metrics Dashboard

```typescript
// src/lib/monitoring/metrics.ts
class MetricsCollector {
  private metrics = {
    bookings: new Counter({
      name: 'bookings_total',
      help: 'Total number of bookings',
      labelNames: ['status', 'service_type', 'frequency']
    }),

    revenue: new Gauge({
      name: 'revenue_total_eur',
      help: 'Total revenue in EUR',
      labelNames: ['period', 'service_type']
    }),

    customerSatisfaction: new Histogram({
      name: 'customer_satisfaction_score',
      help: 'Customer satisfaction ratings',
      buckets: [1, 2, 3, 4, 5],
      labelNames: ['service_type']
    }),

    teamUtilization: new Gauge({
      name: 'team_utilization_percent',
      help: 'Team utilization percentage',
      labelNames: ['team_id', 'day_of_week']
    }),

    apiLatency: new Histogram({
      name: 'api_latency_ms',
      help: 'API endpoint latency',
      buckets: [10, 50, 100, 500, 1000, 5000],
      labelNames: ['method', 'endpoint', 'status']
    })
  }

  async collectBusinessMetrics() {
    // Booking metrics
    const bookingStats = await prisma.booking.groupBy({
      by: ['status', 'serviceType', 'frequency'],
      _count: true,
      where: {
        createdAt: {
          gte: startOfDay(new Date())
        }
      }
    })

    bookingStats.forEach(stat => {
      this.metrics.bookings.inc({
        status: stat.status,
        service_type: stat.serviceType,
        frequency: stat.frequency
      }, stat._count)
    })

    // Revenue metrics
    const revenue = await prisma.booking.aggregate({
      _sum: { finalPrice: true },
      where: {
        status: 'COMPLETED',
        completedAt: {
          gte: startOfMonth(new Date())
        }
      }
    })

    this.metrics.revenue.set(
      { period: 'monthly', service_type: 'all' },
      revenue._sum.finalPrice || 0
    )

    // Customer satisfaction
    const reviews = await prisma.review.findMany({
      where: {
        createdAt: {
          gte: subDays(new Date(), 30)
        }
      },
      include: {
        booking: {
          select: { serviceType: true }
        }
      }
    })

    reviews.forEach(review => {
      this.metrics.customerSatisfaction.observe(
        { service_type: review.booking.serviceType },
        review.rating
      )
    })
  }
}
```

### 3.4 Alert Configuration

```yaml
# monitoring/alerts.yml
groups:
  - name: business_alerts
    rules:
      - alert: LowBookingRate
        expr: rate(bookings_total[1h]) < 0.5
        for: 2h
        labels:
          severity: warning
        annotations:
          summary: "Low booking rate detected"
          description: "Booking rate is {{ $value }} per hour"

      - alert: HighCancellationRate
        expr: |
          rate(bookings_total{status="CANCELLED"}[1d]) /
          rate(bookings_total[1d]) > 0.2
        for: 1h
        labels:
          severity: critical
        annotations:
          summary: "High cancellation rate"
          description: "{{ $value | humanizePercentage }} cancellation rate"

      - alert: LowCustomerSatisfaction
        expr: |
          histogram_quantile(0.5, customer_satisfaction_score) < 4
        for: 6h
        labels:
          severity: warning
        annotations:
          summary: "Customer satisfaction below threshold"
          description: "Median satisfaction score is {{ $value }}"

      - alert: TeamOverUtilized
        expr: team_utilization_percent > 95
        for: 30m
        labels:
          severity: warning
        annotations:
          summary: "Team {{ $labels.team_id }} over-utilized"
          description: "Utilization at {{ $value }}%"

  - name: technical_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate on {{ $labels.endpoint }}"
          description: "Error rate is {{ $value | humanizePercentage }}"

      - alert: SlowAPIResponse
        expr: |
          histogram_quantile(0.95, api_latency_ms) > 1000
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Slow API response times"
          description: "P95 latency is {{ $value }}ms"

      - alert: EmailDeliveryFailure
        expr: rate(email_send_failures_total[1h]) > 5
        for: 30m
        labels:
          severity: critical
        annotations:
          summary: "Email delivery failures"
          description: "{{ $value }} failures per hour"
```

---

## 4. Database Migration & Seeding

### 4.1 Migration Strategy

```typescript
// prisma/migrations/deploy.ts
import { execSync } from 'child_process'
import { PrismaClient } from '@prisma/client'

class MigrationManager {
  private prisma: PrismaClient

  async deploy() {
    console.log('Starting database migration...')

    try {
      // 1. Backup current database
      await this.backupDatabase()

      // 2. Run pending migrations
      execSync('npx prisma migrate deploy', { stdio: 'inherit' })

      // 3. Verify migration success
      await this.verifyMigration()

      // 4. Run post-migration scripts
      await this.runPostMigrationScripts()

      console.log('Migration completed successfully')
    } catch (error) {
      console.error('Migration failed:', error)

      // Attempt rollback
      await this.rollback()
      throw error
    }
  }

  private async backupDatabase() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFile = `backup-${timestamp}.sql`

    execSync(
      `pg_dump ${process.env.DATABASE_URL} > backups/${backupFile}`,
      { stdio: 'inherit' }
    )

    console.log(`Database backed up to ${backupFile}`)
  }

  private async verifyMigration() {
    // Check critical tables exist
    const tables = await this.prisma.$queryRaw`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
    `

    const requiredTables = [
      'Customer', 'Booking', 'Team', 'Cleaner',
      'Address', 'Review', 'QualityChecklist'
    ]

    for (const table of requiredTables) {
      if (!tables.find(t => t.tablename === table)) {
        throw new Error(`Required table ${table} not found`)
      }
    }

    console.log('Migration verification passed')
  }

  private async rollback() {
    console.log('Attempting rollback...')

    try {
      // Find latest backup
      const latestBackup = this.findLatestBackup()

      if (latestBackup) {
        execSync(
          `psql ${process.env.DATABASE_URL} < ${latestBackup}`,
          { stdio: 'inherit' }
        )
        console.log('Rollback successful')
      }
    } catch (error) {
      console.error('Rollback failed:', error)
    }
  }
}
```

### 4.2 Seed Data Strategy

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

class DataSeeder {
  async seed(environment: 'development' | 'staging' | 'production') {
    console.log(`Seeding database for ${environment}...`)

    switch (environment) {
      case 'development':
        await this.seedDevelopmentData()
        break
      case 'staging':
        await this.seedStagingData()
        break
      case 'production':
        await this.seedProductionData()
        break
    }
  }

  private async seedDevelopmentData() {
    // Create test customers
    const customers = await Promise.all(
      Array.from({ length: 50 }).map(() =>
        prisma.customer.create({
          data: {
            email: faker.internet.email(),
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            phone: faker.phone.number('+385 91 ### ####'),
            language: faker.helpers.arrayElement(['hr', 'en']),
            gdprConsent: true,
            gdprConsentDate: new Date(),
            addresses: {
              create: {
                street: faker.location.streetAddress(),
                city: faker.helpers.arrayElement([
                  'Zagreb', 'Split', 'Rijeka', 'Osijek'
                ]),
                postalCode: faker.location.zipCode('10###'),
                isDefault: true
              }
            }
          }
        })
      )
    )

    // Create cleaners and teams
    const cleaners = await Promise.all(
      Array.from({ length: 20 }).map((_, i) =>
        prisma.cleaner.create({
          data: {
            email: `cleaner${i + 1}@uredno.eu`,
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            phone: faker.phone.number('+385 91 ### ####'),
            employeeId: `EMP${String(i + 1).padStart(4, '0')}`,
            hireDate: faker.date.past({ years: 2 }),
            certifications: ['Basic Cleaning', 'Safety Training'],
            languages: ['hr', 'en']
          }
        })
      )
    )

    // Create teams
    const teams = await Promise.all(
      Array.from({ length: 5 }).map((_, i) =>
        prisma.team.create({
          data: {
            name: `Tim ${i + 1}`,
            leaderId: cleaners[i * 4].id,
            members: {
              connect: cleaners
                .slice(i * 4, (i + 1) * 4)
                .map(c => ({ id: c.id }))
            }
          }
        })
      )
    )

    // Create bookings with various statuses
    const bookingStatuses = [
      'PENDING', 'CONFIRMED', 'IN_PROGRESS',
      'COMPLETED', 'CANCELLED'
    ]

    const bookings = await Promise.all(
      Array.from({ length: 200 }).map(async (_, i) => {
        const customer = faker.helpers.arrayElement(customers)
        const team = faker.helpers.arrayElement(teams)
        const status = faker.helpers.arrayElement(bookingStatuses)

        return prisma.booking.create({
          data: {
            bookingNumber: `BK${String(i + 1).padStart(6, '0')}`,
            customerId: customer.id,
            addressId: customer.addresses[0].id,
            serviceType: faker.helpers.arrayElement([
              'STANDARD', 'STANDARD_PLUS', 'DEEP_CLEAN'
            ]),
            propertySize: faker.number.int({ min: 30, max: 200 }),
            numberOfRooms: faker.number.int({ min: 1, max: 5 }),
            scheduledDate: faker.date.future({ years: 0.5 }),
            scheduledTime: faker.helpers.arrayElement([
              '08:00', '10:00', '12:00', '14:00', '16:00'
            ]),
            duration: faker.helpers.arrayElement([2, 3, 4, 5]),
            frequency: faker.helpers.arrayElement([
              'ONE_TIME', 'WEEKLY', 'BI_WEEKLY', 'MONTHLY'
            ]),
            status,
            basePrice: faker.number.float({ min: 50, max: 300, precision: 0.01 }),
            finalPrice: faker.number.float({ min: 50, max: 300, precision: 0.01 }),
            teamSize: team.members.length,
            assignedTeamId: team.id,
            ...(status === 'COMPLETED' && {
              completedAt: faker.date.recent({ days: 30 })
            })
          }
        })
      })
    )

    // Add reviews for completed bookings
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED')

    await Promise.all(
      completedBookings.slice(0, 50).map(booking =>
        prisma.review.create({
          data: {
            bookingId: booking.id,
            customerId: booking.customerId,
            rating: faker.number.int({ min: 3, max: 5 }),
            comment: faker.helpers.arrayElement([
              'Izvrsna usluga, vrlo zadovoljan!',
              'Sve je bilo super čisto.',
              'Profesionalan tim, preporučujem.',
              'Odličan posao, vratit ću se sigurno.',
              null
            ]),
            isVerified: true
          }
        })
      )
    )

    console.log('Development data seeded successfully')
  }

  private async seedStagingData() {
    // Minimal realistic data for testing
    await this.seedBaseData()

    // Add some test bookings
    const testCustomer = await prisma.customer.create({
      data: {
        email: 'test@uredno.eu',
        firstName: 'Test',
        lastName: 'Korisnik',
        phone: '+385 91 000 0000',
        language: 'hr',
        gdprConsent: true,
        gdprConsentDate: new Date()
      }
    })

    console.log('Staging data seeded successfully')
  }

  private async seedProductionData() {
    // Only seed essential configuration data
    await this.seedBaseData()

    console.log('Production base data seeded successfully')
  }

  private async seedBaseData() {
    // Seed service configuration
    const serviceTypes = [
      { code: 'STANDARD', name: 'Standardno čišćenje', basePrice: 25 },
      { code: 'STANDARD_PLUS', name: 'Standardno Plus', basePrice: 35 },
      { code: 'DEEP_CLEAN', name: 'Dubinsko čišćenje', basePrice: 45 },
      { code: 'MOVING', name: 'Čišćenje pri selidbi', basePrice: 50 },
      { code: 'POST_CONSTRUCTION', name: 'Čišćenje nakon radova', basePrice: 60 }
    ]

    // Store in configuration table or as constants
    console.log('Base configuration seeded')
  }
}

// Execute seeding
async function main() {
  const environment = (process.env.NODE_ENV || 'development') as any
  const seeder = new DataSeeder()

  try {
    await seeder.seed(environment)
    console.log('Seeding completed successfully')
  } catch (error) {
    console.error('Seeding failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
```

---

## 5. Sprint Plan (4 Weeks)

### Sprint 5 - Week 1: Email Infrastructure
**Goal**: Complete email service setup with failover

**Tasks**:
- Day 1-2: Provider configuration and domain authentication
- Day 3-4: Service abstraction and failover logic
- Day 5: Queue system and retry mechanism

**Deliverables**:
- Working email service with SendGrid primary
- Failover to Resend backup
- Queue processing with retry logic

**Dependencies**:
- SendGrid account
- Domain DNS access
- Redis instance

### Sprint 6 - Week 2: Email Templates & Calendar Auth
**Goal**: Croatian templates and Google Calendar setup

**Tasks**:
- Day 1-2: Template engine and base layouts
- Day 3-4: All Croatian email templates
- Day 5: Google Calendar service account setup

**Deliverables**:
- 10+ Croatian email templates
- Bilingual support (HR/EN)
- Calendar authentication working

**Dependencies**:
- Design approval for templates
- Google Cloud project
- Service account credentials

### Sprint 7 - Week 3: Calendar Sync & Monitoring
**Goal**: Real-time calendar sync and monitoring setup

**Tasks**:
- Day 1-2: Calendar event management
- Day 3: Availability checking and sync
- Day 4-5: Sentry setup and metrics collection

**Deliverables**:
- Booking → Calendar event creation
- Availability checking system
- Error tracking and APM setup

**Dependencies**:
- Calendar API quotas
- Sentry account
- Metrics storage solution

### Sprint 8 - Week 4: Database & Testing
**Goal**: Production database setup and integration testing

**Tasks**:
- Day 1-2: Migration scripts and backup procedures
- Day 3: Seed data for all environments
- Day 4-5: Integration testing and monitoring dashboard

**Deliverables**:
- Automated migration process
- Environment-specific seeding
- Complete monitoring dashboard
- All integrations tested end-to-end

**Dependencies**:
- Production database instance
- Backup storage
- Staging environment

---

## 6. Risk Assessment & Mitigation

### High Risk Items

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Email delivery failures | High | Medium | Dual provider setup with automatic failover |
| Calendar API rate limits | High | Medium | Implement caching and batch operations |
| Data migration errors | Critical | Low | Automated backups before migration |
| Service account compromise | Critical | Low | Rotate keys quarterly, use secret manager |
| GDPR compliance issues | High | Low | Audit trail, encryption, consent management |

### Medium Risk Items

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Slow calendar sync | Medium | Medium | Implement webhooks instead of polling |
| Email template errors | Low | Medium | Comprehensive testing, preview system |
| Monitoring blind spots | Medium | Low | Multiple monitoring layers |
| Team availability conflicts | Medium | High | Conflict resolution system |

### Mitigation Strategies

1. **Technical Mitigation**
   - Implement circuit breakers for external services
   - Use queue systems for async operations
   - Add comprehensive error handling
   - Implement rate limiting

2. **Operational Mitigation**
   - Daily backup procedures
   - Monitoring alerts for critical paths
   - Runbooks for common issues
   - On-call rotation for production support

3. **Business Mitigation**
   - Clear SLAs with providers
   - Customer communication templates
   - Fallback manual processes
   - Regular security audits

---

## 7. Integration Testing Strategy

### 7.1 Email Service Testing

```typescript
// tests/integration/email.test.ts
describe('Email Service Integration', () => {
  it('should send booking confirmation email', async () => {
    const result = await emailService.send({
      template: EmailTemplate.BOOKING_CONFIRMATION,
      to: 'test@example.com',
      locale: 'hr',
      data: mockBookingData
    })

    expect(result.success).toBe(true)
    expect(result.messageId).toBeDefined()
  })

  it('should failover to backup provider', async () => {
    // Simulate primary provider failure
    jest.spyOn(sendGridProvider, 'send').mockRejectedValue(new Error())

    const result = await emailService.send(mockEmail)

    expect(result.provider).toBe('resend')
    expect(result.success).toBe(true)
  })

  it('should handle Croatian characters correctly', async () => {
    const email = {
      ...mockEmail,
      data: {
        customerName: 'Željko Čović',
        address: 'Ilica 1, Zagreb'
      }
    }

    const result = await emailService.send(email)
    expect(result.success).toBe(true)
  })
})
```

### 7.2 Calendar Integration Testing

```typescript
// tests/integration/calendar.test.ts
describe('Google Calendar Integration', () => {
  it('should create calendar event for booking', async () => {
    const booking = await createTestBooking()
    const event = await calendarService.createBookingEvent(booking)

    expect(event.id).toBeDefined()
    expect(event.htmlLink).toContain('calendar.google.com')
  })

  it('should detect scheduling conflicts', async () => {
    // Create overlapping bookings
    const booking1 = await createTestBooking({ time: '10:00' })
    const booking2 = await createTestBooking({ time: '10:30' })

    const result = await availabilityService.checkTimeSlot(
      booking2.scheduledDate,
      booking2.duration
    )

    expect(result.isAvailable).toBe(false)
    expect(result.conflicts).toHaveLength(1)
  })

  it('should sync calendar changes to database', async () => {
    // Create event in calendar
    const event = await calendarService.createEvent(mockEventData)

    // Run sync
    await availabilityService.syncWithDatabase()

    // Check database
    const booking = await prisma.booking.findUnique({
      where: { calendarEventId: event.id }
    })

    expect(booking).toBeDefined()
    expect(booking.status).toBe('CONFIRMED')
  })
})
```

### 7.3 End-to-End Testing

```typescript
// tests/e2e/booking-flow.test.ts
describe('Complete Booking Flow', () => {
  it('should handle booking from creation to confirmation', async () => {
    // 1. Customer creates booking
    const bookingRequest = await api.post('/api/bookings', {
      serviceType: 'STANDARD',
      scheduledDate: '2024-02-01',
      scheduledTime: '10:00',
      address: testAddress
    })

    expect(bookingRequest.status).toBe(201)
    const booking = bookingRequest.data

    // 2. Check calendar event created
    const calendar = await calendarService.getEvent(booking.calendarEventId)
    expect(calendar).toBeDefined()

    // 3. Verify confirmation email sent
    const emails = await getTestEmails()
    const confirmationEmail = emails.find(
      e => e.template === 'booking-confirmation'
    )
    expect(confirmationEmail).toBeDefined()

    // 4. Verify monitoring metrics
    const metrics = await metricsCollector.getMetrics()
    expect(metrics.bookings_total).toBeGreaterThan(0)
  })
})
```

---

## 8. Production Readiness Checklist

### Pre-Production
- [ ] All environment variables configured
- [ ] SSL certificates installed
- [ ] Domain authentication (SPF, DKIM, DMARC)
- [ ] Google service account created and configured
- [ ] Database backup strategy implemented
- [ ] Monitoring alerts configured
- [ ] Error tracking integrated
- [ ] Rate limiting implemented
- [ ] Security headers configured
- [ ] GDPR compliance verified

### Testing
- [ ] Unit tests passing (>80% coverage)
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Load testing completed
- [ ] Security scan completed
- [ ] Accessibility audit passed
- [ ] Croatian language verified
- [ ] Mobile responsiveness tested

### Documentation
- [ ] API documentation complete
- [ ] Runbook for common issues
- [ ] Deployment guide
- [ ] Rollback procedures
- [ ] Monitoring guide
- [ ] Security procedures

### Operations
- [ ] Deployment pipeline configured
- [ ] Rollback mechanism tested
- [ ] On-call rotation established
- [ ] Customer support trained
- [ ] Legal compliance verified
- [ ] Business metrics dashboard live
- [ ] SLA defined and agreed

---

## 9. Success Metrics

### Technical Metrics
- Email delivery rate >98%
- Calendar sync latency <2 seconds
- API response time P95 <500ms
- Error rate <1%
- Uptime >99.9%

### Business Metrics
- Booking conversion rate >20%
- Customer satisfaction >4.5/5
- Team utilization >80%
- Booking fulfillment rate >95%
- Response time to inquiries <1 hour

### Monitoring KPIs
- Mean time to detection <5 minutes
- Mean time to resolution <30 minutes
- Alert accuracy >90%
- False positive rate <10%

---

## Conclusion

This Phase 2 implementation plan provides a comprehensive roadmap for integrating critical services into the WebUredno platform. The focus on reliability, monitoring, and the Croatian market ensures a production-ready solution that can scale with business growth.

Key success factors:
1. Robust error handling and failover mechanisms
2. Comprehensive monitoring from day one
3. Croatian-first approach to all user communications
4. Thorough testing at every integration point
5. Clear rollback and recovery procedures

The 4-week timeline is aggressive but achievable with dedicated resources and clear priorities. Regular checkpoints and testing gates ensure quality while maintaining velocity.