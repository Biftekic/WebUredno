# Email Service Implementation Guide

## Quick Start Implementation

### 1. Install Dependencies

```bash
# Email service providers
npm install @sendgrid/mail resend

# Email templating
npm install @react-email/components @react-email/render

# Queue management
npm install bullmq ioredis

# Email validation
npm install email-validator
```

### 2. Environment Configuration

```env
# Primary Email Provider (SendGrid)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@uredno.eu
SENDGRID_FROM_NAME=Uredno Čišćenje

# Backup Email Provider (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@uredno.eu

# Redis for Queue Management
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# Email Configuration
EMAIL_RATE_LIMIT=100
EMAIL_RETRY_ATTEMPTS=3
EMAIL_RETRY_DELAY=2000
```

### 3. Core Email Service Implementation

```typescript
// src/lib/email/service.ts
import { EmailProvider, Email, EmailResult } from './types'
import { SendGridProvider } from './providers/sendgrid'
import { ResendProvider } from './providers/resend'
import { EmailQueue } from './queue'
import { renderTemplate } from './templates'

export class EmailService {
  private primaryProvider: EmailProvider
  private backupProvider: EmailProvider
  private queue: EmailQueue

  constructor() {
    this.primaryProvider = new SendGridProvider()
    this.backupProvider = new ResendProvider()
    this.queue = new EmailQueue()
  }

  async send(email: Email): Promise<EmailResult> {
    // Add to queue for processing
    const job = await this.queue.add('send-email', email)

    // Wait for result if immediate sending required
    if (email.immediate) {
      return await this.processEmail(email)
    }

    return {
      success: true,
      queued: true,
      jobId: job.id
    }
  }

  private async processEmail(email: Email): Promise<EmailResult> {
    try {
      // Render template
      const html = await renderTemplate(
        email.template,
        email.data,
        email.locale
      )

      // Try primary provider
      const result = await this.primaryProvider.send({
        ...email,
        html
      })

      if (result.success) {
        await this.logSuccess(email, result)
        return result
      }

      // Failover to backup
      console.warn('Primary email provider failed, using backup')
      return await this.backupProvider.send({
        ...email,
        html
      })

    } catch (error) {
      await this.logError(email, error)
      throw error
    }
  }

  private async logSuccess(email: Email, result: EmailResult) {
    // Log to database
    await prisma.emailLog.create({
      data: {
        to: Array.isArray(email.to) ? email.to.join(',') : email.to,
        template: email.template,
        status: 'SENT',
        provider: result.provider,
        messageId: result.messageId,
        sentAt: new Date()
      }
    })
  }

  private async logError(email: Email, error: any) {
    await prisma.emailLog.create({
      data: {
        to: Array.isArray(email.to) ? email.to.join(',') : email.to,
        template: email.template,
        status: 'FAILED',
        error: error.message,
        failedAt: new Date()
      }
    })
  }
}
```

### 4. SendGrid Provider Implementation

```typescript
// src/lib/email/providers/sendgrid.ts
import sgMail from '@sendgrid/mail'
import { EmailProvider, Email, EmailResult } from '../types'

export class SendGridProvider implements EmailProvider {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!)
  }

  async send(email: Email & { html: string }): Promise<EmailResult> {
    const msg = {
      to: email.to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL!,
        name: process.env.SENDGRID_FROM_NAME!
      },
      subject: email.subject,
      html: email.html,
      categories: [email.template],
      customArgs: {
        template: email.template,
        locale: email.locale
      }
    }

    try {
      const [response] = await sgMail.send(msg)

      return {
        success: true,
        provider: 'sendgrid',
        messageId: response.headers['x-message-id'],
        statusCode: response.statusCode
      }
    } catch (error: any) {
      if (error.response) {
        const { body } = error.response
        throw new Error(`SendGrid error: ${body.errors?.[0]?.message || 'Unknown error'}`)
      }
      throw error
    }
  }

  async sendBatch(emails: Email[]): Promise<EmailResult[]> {
    const messages = emails.map(email => ({
      to: email.to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL!,
        name: process.env.SENDGRID_FROM_NAME!
      },
      subject: email.subject,
      html: email.html,
      categories: [email.template]
    }))

    try {
      const responses = await sgMail.send(messages)
      return responses.map((response, index) => ({
        success: true,
        provider: 'sendgrid',
        messageId: response[0].headers['x-message-id'],
        email: emails[index].to
      }))
    } catch (error) {
      throw new Error(`Batch send failed: ${error.message}`)
    }
  }
}
```

### 5. Resend Backup Provider

```typescript
// src/lib/email/providers/resend.ts
import { Resend } from 'resend'
import { EmailProvider, Email, EmailResult } from '../types'

export class ResendProvider implements EmailProvider {
  private resend: Resend

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY!)
  }

  async send(email: Email & { html: string }): Promise<EmailResult> {
    try {
      const result = await this.resend.emails.send({
        from: `${process.env.SENDGRID_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
        to: email.to,
        subject: email.subject,
        html: email.html,
        tags: [
          { name: 'template', value: email.template },
          { name: 'locale', value: email.locale }
        ]
      })

      return {
        success: true,
        provider: 'resend',
        messageId: result.id,
        statusCode: 200
      }
    } catch (error: any) {
      throw new Error(`Resend error: ${error.message}`)
    }
  }

  async sendBatch(emails: Email[]): Promise<EmailResult[]> {
    // Resend doesn't support true batch sending, process sequentially
    const results: EmailResult[] = []

    for (const email of emails) {
      try {
        const result = await this.send(email)
        results.push(result)
      } catch (error) {
        results.push({
          success: false,
          provider: 'resend',
          error: error.message,
          email: email.to
        })
      }
    }

    return results
  }
}
```

### 6. Queue Management System

```typescript
// src/lib/email/queue.ts
import { Queue, Worker, QueueEvents } from 'bullmq'
import IORedis from 'ioredis'
import { EmailService } from './service'

const connection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
  password: process.env.REDIS_PASSWORD
})

export class EmailQueue {
  private queue: Queue
  private worker: Worker
  private events: QueueEvents

  constructor() {
    this.queue = new Queue('emails', {
      connection,
      defaultJobOptions: {
        attempts: parseInt(process.env.EMAIL_RETRY_ATTEMPTS || '3'),
        backoff: {
          type: 'exponential',
          delay: parseInt(process.env.EMAIL_RETRY_DELAY || '2000')
        },
        removeOnComplete: true,
        removeOnFail: false
      }
    })

    this.setupWorker()
    this.setupEventHandlers()
  }

  async add(name: string, data: any, options?: any) {
    return await this.queue.add(name, data, options)
  }

  private setupWorker() {
    const emailService = new EmailService()

    this.worker = new Worker(
      'emails',
      async (job) => {
        const { email } = job.data

        try {
          const result = await emailService.processEmail(email)

          // Track metrics
          await this.trackMetrics('success', email.template)

          return result
        } catch (error) {
          // Track failure metrics
          await this.trackMetrics('failure', email.template)

          // If last attempt, move to dead letter queue
          if (job.attemptsMade >= job.opts.attempts!) {
            await this.moveToDeadLetter(job.data, error)
          }

          throw error
        }
      },
      {
        connection,
        concurrency: 10,
        limiter: {
          max: parseInt(process.env.EMAIL_RATE_LIMIT || '100'),
          duration: 60000 // per minute
        }
      }
    )
  }

  private setupEventHandlers() {
    this.events = new QueueEvents('emails', { connection })

    this.events.on('completed', ({ jobId, returnvalue }) => {
      console.log(`Email job ${jobId} completed`, returnvalue)
    })

    this.events.on('failed', ({ jobId, failedReason }) => {
      console.error(`Email job ${jobId} failed:`, failedReason)
    })

    this.events.on('stalled', ({ jobId }) => {
      console.warn(`Email job ${jobId} stalled`)
    })
  }

  private async moveToDeadLetter(data: any, error: any) {
    const dlq = new Queue('emails-dead-letter', { connection })

    await dlq.add('failed-email', {
      ...data,
      error: error.message,
      failedAt: new Date(),
      attempts: process.env.EMAIL_RETRY_ATTEMPTS
    })
  }

  private async trackMetrics(status: 'success' | 'failure', template: string) {
    // Increment metrics counter
    if (status === 'success') {
      metrics.emailsSent.inc({ template })
    } else {
      metrics.emailsFailed.inc({ template })
    }
  }

  async getQueueStatus() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount()
    ])

    return {
      waiting,
      active,
      completed,
      failed,
      total: waiting + active + completed + failed
    }
  }

  async retryFailed() {
    const failed = await this.queue.getFailed()

    for (const job of failed) {
      await job.retry()
    }

    return failed.length
  }

  async cleanCompleted(grace: number = 3600000) {
    // Clean jobs older than grace period (default 1 hour)
    const jobs = await this.queue.clean(grace, 100, 'completed')
    return jobs.length
  }
}
```

### 7. Croatian Email Templates

```tsx
// src/lib/email/templates/booking-reminder.tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Button
} from '@react-email/components'

interface BookingReminderProps {
  customerName: string
  bookingNumber: string
  serviceType: string
  scheduledDate: string
  scheduledTime: string
  address: string
  teamLeader: string
  reminderType: '24h' | '2h'
}

export function BookingReminderTemplate({
  customerName,
  bookingNumber,
  serviceType,
  scheduledDate,
  scheduledTime,
  address,
  teamLeader,
  reminderType
}: BookingReminderProps) {
  const isUrgent = reminderType === '2h'

  const previewText = isUrgent
    ? `Podsjetnik: Vaše čišćenje počinje za 2 sata!`
    : `Podsjetnik: Sutra stižemo čistiti vaš prostor`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Img
              src="https://uredno.eu/logo.png"
              width="150"
              height="50"
              alt="Uredno Logo"
            />
          </Section>

          {/* Header */}
          <Heading style={isUrgent ? urgentHeading : heading}>
            {isUrgent ? '⏰ Stižemo za 2 sata!' : '📅 Podsjetnik za sutra'}
          </Heading>

          {/* Greeting */}
          <Text style={paragraph}>
            Poštovani/a {customerName},
          </Text>

          <Text style={paragraph}>
            {isUrgent
              ? 'Ovo je podsjetnik da naš tim stiže za 2 sata.'
              : 'Podsjećamo vas da je vaš termin čišćenja zakazan za sutra.'}
          </Text>

          {/* Booking Details Box */}
          <Section style={detailsBox}>
            <Text style={detailsTitle}>Detalji vašeg termina:</Text>

            <table style={table}>
              <tr>
                <td style={labelCell}>📋 Broj rezervacije:</td>
                <td style={valueCell}>{bookingNumber}</td>
              </tr>
              <tr>
                <td style={labelCell}>🧹 Usluga:</td>
                <td style={valueCell}>{serviceType}</td>
              </tr>
              <tr>
                <td style={labelCell}>📅 Datum:</td>
                <td style={valueCell}>{scheduledDate}</td>
              </tr>
              <tr>
                <td style={labelCell}>⏰ Vrijeme:</td>
                <td style={valueCell}>{scheduledTime}</td>
              </tr>
              <tr>
                <td style={labelCell}>📍 Adresa:</td>
                <td style={valueCell}>{address}</td>
              </tr>
              <tr>
                <td style={labelCell}>👤 Voditelj tima:</td>
                <td style={valueCell}>{teamLeader}</td>
              </tr>
            </table>
          </Section>

          {/* Preparation Tips */}
          <Section style={tipsSection}>
            <Text style={tipsTitle}>💡 Priprema za naš dolazak:</Text>
            <ul style={tipsList}>
              <li>Osigurajte pristup prostoru</li>
              <li>Uklonite vrijedne predmete s radnih površina</li>
              <li>Obavijestite nas o posebnim zahtjevima</li>
              {isUrgent && <li>Pripremite ključeve ili pristupni kod</li>}
            </ul>
          </Section>

          {/* Action Buttons */}
          <Section style={buttonSection}>
            <table width="100%">
              <tr>
                <td align="center" style={buttonCell}>
                  <Button
                    style={primaryButton}
                    href={`https://uredno.eu/booking/${bookingNumber}`}
                  >
                    Pogledaj detalje
                  </Button>
                </td>
                <td align="center" style={buttonCell}>
                  <Button
                    style={secondaryButton}
                    href={`https://uredno.eu/reschedule/${bookingNumber}`}
                  >
                    Promijeni termin
                  </Button>
                </td>
              </tr>
            </table>
          </Section>

          {/* Contact Info */}
          <Section style={contactSection}>
            <Text style={contactText}>
              Imate pitanja? Kontaktirajte nas:
            </Text>
            <Text style={contactDetails}>
              📧 <Link href="mailto:kontakt@uredno.eu">kontakt@uredno.eu</Link>
              <br />
              📱 <Link href="tel:+38591234567">+385 91 234 5678</Link>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Uredno d.o.o. | Ilica 1, 10000 Zagreb
              <br />
              <Link href="https://uredno.eu/unsubscribe" style={footerLink}>
                Odjavi se od obavijesti
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const logoSection = {
  padding: '32px 20px',
  textAlign: 'center' as const,
}

const heading = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#1f2937',
  textAlign: 'center' as const,
  margin: '0 0 20px',
}

const urgentHeading = {
  ...heading,
  color: '#dc2626',
  fontSize: '28px',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#374151',
  padding: '0 20px',
}

const detailsBox = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  padding: '24px',
  margin: '20px',
}

const detailsTitle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1f2937',
  marginBottom: '16px',
}

const table = {
  width: '100%',
  borderCollapse: 'collapse' as const,
}

const labelCell = {
  padding: '8px 0',
  fontSize: '14px',
  color: '#6b7280',
  width: '40%',
}

const valueCell = {
  padding: '8px 0',
  fontSize: '14px',
  color: '#1f2937',
  fontWeight: '500',
}

const tipsSection = {
  padding: '0 20px',
  marginTop: '24px',
}

const tipsTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1f2937',
  marginBottom: '12px',
}

const tipsList = {
  fontSize: '14px',
  color: '#4b5563',
  lineHeight: '24px',
  paddingLeft: '20px',
}

const buttonSection = {
  padding: '24px 20px',
}

const buttonCell = {
  padding: '0 8px',
}

const primaryButton = {
  backgroundColor: '#10b981',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  width: '100%',
}

const secondaryButton = {
  backgroundColor: '#ffffff',
  borderRadius: '6px',
  border: '2px solid #d1d5db',
  color: '#374151',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  width: '100%',
}

const contactSection = {
  backgroundColor: '#fef3c7',
  padding: '20px',
  margin: '20px',
  borderRadius: '8px',
  textAlign: 'center' as const,
}

const contactText = {
  fontSize: '14px',
  color: '#92400e',
  marginBottom: '8px',
}

const contactDetails = {
  fontSize: '14px',
  color: '#92400e',
  fontWeight: '500',
  lineHeight: '20px',
}

const footer = {
  padding: '20px',
  textAlign: 'center' as const,
  borderTop: '1px solid #e5e7eb',
}

const footerText = {
  fontSize: '12px',
  color: '#6b7280',
  lineHeight: '18px',
}

const footerLink = {
  color: '#6b7280',
  textDecoration: 'underline',
}
```

### 8. API Routes for Email

```typescript
// src/app/api/email/send/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email/service'
import { z } from 'zod'

const SendEmailSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  template: z.enum([
    'BOOKING_CONFIRMATION',
    'BOOKING_REMINDER',
    'BOOKING_COMPLETED',
    'REVIEW_REQUEST'
  ]),
  data: z.record(z.any()),
  locale: z.enum(['hr', 'en']).default('hr'),
  scheduledFor: z.string().datetime().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = SendEmailSchema.parse(body)

    const emailService = new EmailService()
    const result = await emailService.send({
      ...validated,
      subject: getSubject(validated.template, validated.locale),
      scheduledFor: validated.scheduledFor
        ? new Date(validated.scheduledFor)
        : undefined
    })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Email send error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}

function getSubject(template: string, locale: string): string {
  const subjects = {
    hr: {
      BOOKING_CONFIRMATION: 'Potvrda vašeg termina čišćenja',
      BOOKING_REMINDER: 'Podsjetnik: Vaš termin čišćenja',
      BOOKING_COMPLETED: 'Hvala vam na povjerenju!',
      REVIEW_REQUEST: 'Kako ste zadovoljni našom uslugom?'
    },
    en: {
      BOOKING_CONFIRMATION: 'Your cleaning appointment confirmation',
      BOOKING_REMINDER: 'Reminder: Your cleaning appointment',
      BOOKING_COMPLETED: 'Thank you for your trust!',
      REVIEW_REQUEST: 'How satisfied are you with our service?'
    }
  }

  return subjects[locale][template] || 'Uredno - Obavijest'
}
```

### 9. Testing Email Service

```typescript
// src/lib/email/__tests__/email.test.ts
import { EmailService } from '../service'
import { SendGridProvider } from '../providers/sendgrid'
import { ResendProvider } from '../providers/resend'

jest.mock('../providers/sendgrid')
jest.mock('../providers/resend')

describe('EmailService', () => {
  let emailService: EmailService

  beforeEach(() => {
    emailService = new EmailService()
  })

  it('should send email using primary provider', async () => {
    const mockEmail = {
      to: 'test@example.com',
      template: 'BOOKING_CONFIRMATION',
      data: {
        customerName: 'Ivan Horvat',
        bookingNumber: 'BK000001'
      },
      locale: 'hr' as const
    }

    const result = await emailService.send(mockEmail)

    expect(result.success).toBe(true)
    expect(result.provider).toBe('sendgrid')
    expect(SendGridProvider.prototype.send).toHaveBeenCalled()
  })

  it('should failover to backup provider on primary failure', async () => {
    // Mock primary provider failure
    SendGridProvider.prototype.send.mockRejectedValueOnce(
      new Error('SendGrid error')
    )

    const mockEmail = {
      to: 'test@example.com',
      template: 'BOOKING_CONFIRMATION',
      data: {},
      locale: 'hr' as const
    }

    const result = await emailService.send(mockEmail)

    expect(result.success).toBe(true)
    expect(result.provider).toBe('resend')
    expect(ResendProvider.prototype.send).toHaveBeenCalled()
  })

  it('should handle Croatian characters correctly', async () => {
    const mockEmail = {
      to: 'test@example.com',
      template: 'BOOKING_CONFIRMATION',
      data: {
        customerName: 'Željko Čović',
        address: 'Šubićeva 42, Zagreb'
      },
      locale: 'hr' as const
    }

    const result = await emailService.send(mockEmail)

    expect(result.success).toBe(true)
    // Verify that Croatian characters are preserved
    expect(SendGridProvider.prototype.send).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          customerName: 'Željko Čović'
        })
      })
    )
  })

  it('should schedule emails for future sending', async () => {
    const futureDate = new Date(Date.now() + 3600000) // 1 hour from now

    const mockEmail = {
      to: 'test@example.com',
      template: 'BOOKING_REMINDER',
      data: {},
      locale: 'hr' as const,
      scheduledFor: futureDate
    }

    const result = await emailService.send(mockEmail)

    expect(result.success).toBe(true)
    expect(result.queued).toBe(true)
    expect(result.jobId).toBeDefined()
  })
})
```

## Deployment Checklist

### Pre-deployment
- [ ] Configure SendGrid account with domain authentication
- [ ] Set up Resend as backup provider
- [ ] Configure SPF, DKIM, and DMARC records
- [ ] Set up Redis instance for queue management
- [ ] Configure environment variables in production
- [ ] Test email templates in multiple clients
- [ ] Verify Croatian character support
- [ ] Set up monitoring alerts

### Testing
- [ ] Unit tests for all providers
- [ ] Integration tests for failover
- [ ] Load testing for queue system
- [ ] Test email rendering in major clients
- [ ] Verify rate limiting works
- [ ] Test retry mechanism
- [ ] Verify dead letter queue

### Production
- [ ] Deploy email service
- [ ] Monitor initial sends
- [ ] Verify metrics collection
- [ ] Check error rates
- [ ] Monitor queue performance
- [ ] Verify backup provider failover
- [ ] Test scheduled emails

## Common Issues and Solutions

### Issue: High bounce rate
**Solution**: Implement email validation before sending, maintain clean email lists

### Issue: Slow email delivery
**Solution**: Increase queue concurrency, optimize template rendering

### Issue: Croatian characters not displaying
**Solution**: Ensure UTF-8 encoding, test in multiple email clients

### Issue: Rate limiting hit
**Solution**: Implement proper queue throttling, distribute sends over time

### Issue: Failed emails not retrying
**Solution**: Check retry configuration, verify Redis connection

## Performance Optimization

1. **Batch Processing**: Send multiple emails in single API calls
2. **Template Caching**: Cache rendered templates for repeated sends
3. **Queue Optimization**: Adjust concurrency based on provider limits
4. **Database Indexes**: Add indexes on email log queries
5. **Monitoring**: Track delivery rates and optimize based on metrics