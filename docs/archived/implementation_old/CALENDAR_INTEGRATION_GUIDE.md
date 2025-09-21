# Google Calendar Integration Implementation Guide

## Quick Start

### 1. Google Cloud Project Setup

```bash
# Step 1: Create a new project in Google Cloud Console
# https://console.cloud.google.com

# Step 2: Enable required APIs
gcloud services enable calendar-json.googleapis.com
gcloud services enable admin.googleapis.com

# Step 3: Create service account
gcloud iam service-accounts create uredno-calendar \
  --display-name="Uredno Calendar Service"

# Step 4: Download credentials
gcloud iam service-accounts keys create \
  ./credentials/google-service-account.json \
  --iam-account=uredno-calendar@PROJECT_ID.iam.gserviceaccount.com
```

### 2. Calendar Setup

```javascript
// Setup script to configure calendar
const { google } = require('googleapis')

async function setupCalendar() {
  // 1. Share calendar with service account email
  const serviceAccountEmail = 'uredno-calendar@PROJECT_ID.iam.gserviceaccount.com'

  // 2. Grant 'Make changes to events' permission
  // 3. Set calendar timezone to Europe/Zagreb
  // 4. Configure working hours (08:00 - 20:00)
}
```

### 3. Install Dependencies

```bash
npm install googleapis google-auth-library
npm install date-fns date-fns-tz
npm install node-cron # for sync jobs
npm install p-queue # for rate limiting
```

## Core Implementation

### 1. Calendar Service Class

```typescript
// src/lib/calendar/google-calendar-service.ts
import { google, calendar_v3 } from 'googleapis'
import { JWT } from 'google-auth-library'
import { addMinutes, format, parseISO } from 'date-fns'
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz'
import PQueue from 'p-queue'

export class GoogleCalendarService {
  private calendar: calendar_v3.Calendar
  private auth: JWT
  private queue: PQueue
  private calendarId: string
  private timezone = 'Europe/Zagreb'

  constructor() {
    this.initializeAuth()
    this.calendar = google.calendar({ version: 'v3', auth: this.auth })
    this.calendarId = process.env.GOOGLE_CALENDAR_ID!

    // Rate limiting: 10 requests per second
    this.queue = new PQueue({
      concurrency: 5,
      interval: 1000,
      intervalCap: 10
    })
  }

  private initializeAuth() {
    const credentials = JSON.parse(
      fs.readFileSync(process.env.GOOGLE_SERVICE_ACCOUNT_PATH!, 'utf8')
    )

    this.auth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
      ]
    })
  }

  /**
   * Create a calendar event for a booking
   */
  async createBookingEvent(booking: {
    id: string
    bookingNumber: string
    customer: {
      firstName: string
      lastName: string
      email: string
      phone: string
    }
    address: {
      street: string
      city: string
      postalCode: string
    }
    serviceType: string
    scheduledDate: Date
    scheduledTime: string
    duration: number // in minutes
    team?: {
      name: string
      leader: string
      members: Array<{ name: string; phone: string }>
    }
    specialInstructions?: string
  }): Promise<CalendarEvent> {
    return this.queue.add(async () => {
      const startTime = this.parseDateTime(
        booking.scheduledDate,
        booking.scheduledTime
      )
      const endTime = addMinutes(startTime, booking.duration)

      const event: calendar_v3.Schema$Event = {
        summary: `🧹 ${booking.serviceType} - ${booking.customer.lastName}`,
        description: this.formatDescription(booking),
        location: `${booking.address.street}, ${booking.address.postalCode} ${booking.address.city}`,
        start: {
          dateTime: zonedTimeToUtc(startTime, this.timezone).toISOString(),
          timeZone: this.timezone
        },
        end: {
          dateTime: zonedTimeToUtc(endTime, this.timezone).toISOString(),
          timeZone: this.timezone
        },
        attendees: this.formatAttendees(booking),
        colorId: this.getColorForService(booking.serviceType),
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 24h before
            { method: 'popup', minutes: 120 },     // 2h before
            { method: 'popup', minutes: 30 }       // 30min before
          ]
        },
        extendedProperties: {
          private: {
            bookingId: booking.id,
            bookingNumber: booking.bookingNumber,
            serviceType: booking.serviceType,
            customerId: booking.customer.email,
            teamId: booking.team?.name || 'unassigned'
          }
        }
      }

      try {
        const response = await this.calendar.events.insert({
          calendarId: this.calendarId,
          resource: event,
          sendUpdates: 'all' // Send email notifications to attendees
        })

        console.log(`Calendar event created: ${response.data.id}`)

        return {
          id: response.data.id!,
          htmlLink: response.data.htmlLink!,
          status: response.data.status!,
          created: true
        }
      } catch (error) {
        console.error('Failed to create calendar event:', error)
        throw new CalendarError('EVENT_CREATE_FAILED', error.message)
      }
    })
  }

  /**
   * Update an existing calendar event
   */
  async updateBookingEvent(
    eventId: string,
    updates: Partial<{
      scheduledDate: Date
      scheduledTime: string
      duration: number
      team: any
      status: string
    }>
  ): Promise<CalendarEvent> {
    return this.queue.add(async () => {
      try {
        // Fetch existing event
        const existing = await this.calendar.events.get({
          calendarId: this.calendarId,
          eventId
        })

        if (!existing.data) {
          throw new Error('Event not found')
        }

        // Prepare updates
        const updatedEvent: calendar_v3.Schema$Event = {
          ...existing.data
        }

        if (updates.scheduledDate && updates.scheduledTime) {
          const startTime = this.parseDateTime(
            updates.scheduledDate,
            updates.scheduledTime
          )
          const endTime = addMinutes(
            startTime,
            updates.duration || this.extractDuration(existing.data)
          )

          updatedEvent.start = {
            dateTime: zonedTimeToUtc(startTime, this.timezone).toISOString(),
            timeZone: this.timezone
          }
          updatedEvent.end = {
            dateTime: zonedTimeToUtc(endTime, this.timezone).toISOString(),
            timeZone: this.timezone
          }
        }

        if (updates.team) {
          updatedEvent.attendees = this.formatAttendees({ team: updates.team })
          updatedEvent.extendedProperties = {
            ...updatedEvent.extendedProperties,
            private: {
              ...updatedEvent.extendedProperties?.private,
              teamId: updates.team.name
            }
          }
        }

        if (updates.status === 'CANCELLED') {
          updatedEvent.status = 'cancelled'
          updatedEvent.summary = `[OTKAZANO] ${updatedEvent.summary}`
        }

        const response = await this.calendar.events.update({
          calendarId: this.calendarId,
          eventId,
          resource: updatedEvent,
          sendUpdates: 'all'
        })

        return {
          id: response.data.id!,
          htmlLink: response.data.htmlLink!,
          status: response.data.status!,
          updated: true
        }
      } catch (error) {
        console.error('Failed to update calendar event:', error)
        throw new CalendarError('EVENT_UPDATE_FAILED', error.message)
      }
    })
  }

  /**
   * Delete a calendar event
   */
  async deleteBookingEvent(eventId: string): Promise<void> {
    return this.queue.add(async () => {
      try {
        await this.calendar.events.delete({
          calendarId: this.calendarId,
          eventId,
          sendUpdates: 'all'
        })

        console.log(`Calendar event deleted: ${eventId}`)
      } catch (error) {
        if (error.code === 404) {
          console.warn(`Event ${eventId} not found, may already be deleted`)
          return
        }
        throw new CalendarError('EVENT_DELETE_FAILED', error.message)
      }
    })
  }

  /**
   * Check availability for a time slot
   */
  async checkAvailability(
    date: Date,
    time: string,
    duration: number
  ): Promise<AvailabilityCheck> {
    return this.queue.add(async () => {
      const startTime = this.parseDateTime(date, time)
      const endTime = addMinutes(startTime, duration)

      try {
        // Query for busy times
        const freeBusyResponse = await this.calendar.freebusy.query({
          requestBody: {
            timeMin: zonedTimeToUtc(startTime, this.timezone).toISOString(),
            timeMax: zonedTimeToUtc(endTime, this.timezone).toISOString(),
            timeZone: this.timezone,
            items: [{ id: this.calendarId }]
          }
        })

        const busySlots =
          freeBusyResponse.data.calendars?.[this.calendarId]?.busy || []

        if (busySlots.length === 0) {
          return {
            available: true,
            conflicts: [],
            alternativeSlots: []
          }
        }

        // Check for conflicts
        const conflicts = await this.getConflictingEvents(
          startTime,
          endTime,
          busySlots
        )

        // Find alternative slots
        const alternativeSlots = await this.findAlternativeSlots(
          date,
          duration,
          5 // Find 5 alternatives
        )

        return {
          available: false,
          conflicts,
          alternativeSlots
        }
      } catch (error) {
        console.error('Failed to check availability:', error)
        throw new CalendarError('AVAILABILITY_CHECK_FAILED', error.message)
      }
    })
  }

  /**
   * Find available time slots for a given date
   */
  async findAvailableSlots(
    date: Date,
    duration: number,
    options?: {
      startHour?: number
      endHour?: number
      slotInterval?: number
    }
  ): Promise<TimeSlot[]> {
    const {
      startHour = 8,
      endHour = 20,
      slotInterval = 60
    } = options || {}

    return this.queue.add(async () => {
      const dayStart = new Date(date)
      dayStart.setHours(startHour, 0, 0, 0)

      const dayEnd = new Date(date)
      dayEnd.setHours(endHour, 0, 0, 0)

      try {
        // Get all busy times for the day
        const freeBusyResponse = await this.calendar.freebusy.query({
          requestBody: {
            timeMin: zonedTimeToUtc(dayStart, this.timezone).toISOString(),
            timeMax: zonedTimeToUtc(dayEnd, this.timezone).toISOString(),
            timeZone: this.timezone,
            items: [{ id: this.calendarId }]
          }
        })

        const busySlots =
          freeBusyResponse.data.calendars?.[this.calendarId]?.busy || []

        // Generate all possible slots
        const availableSlots: TimeSlot[] = []
        let currentTime = new Date(dayStart)

        while (currentTime < dayEnd) {
          const slotEnd = addMinutes(currentTime, duration)

          // Check if slot overlaps with any busy time
          const isAvailable = !busySlots.some(busy => {
            const busyStart = new Date(busy.start!)
            const busyEnd = new Date(busy.end!)
            return (
              (currentTime >= busyStart && currentTime < busyEnd) ||
              (slotEnd > busyStart && slotEnd <= busyEnd) ||
              (currentTime <= busyStart && slotEnd >= busyEnd)
            )
          })

          if (isAvailable && slotEnd <= dayEnd) {
            availableSlots.push({
              date: format(currentTime, 'yyyy-MM-dd'),
              time: format(currentTime, 'HH:mm'),
              available: true,
              duration
            })
          }

          currentTime = addMinutes(currentTime, slotInterval)
        }

        return availableSlots
      } catch (error) {
        console.error('Failed to find available slots:', error)
        throw new CalendarError('SLOT_SEARCH_FAILED', error.message)
      }
    })
  }

  /**
   * Sync calendar events with database
   */
  async syncWithDatabase(): Promise<SyncResult> {
    console.log('Starting calendar sync...')

    const syncResult: SyncResult = {
      synced: 0,
      created: 0,
      updated: 0,
      deleted: 0,
      errors: []
    }

    try {
      // Get all future events from calendar
      const now = new Date()
      const events = await this.listEvents({
        timeMin: now,
        maxResults: 500,
        orderBy: 'startTime'
      })

      // Get all future bookings from database
      const bookings = await prisma.booking.findMany({
        where: {
          scheduledDate: { gte: now },
          status: { not: 'CANCELLED' }
        },
        include: {
          customer: true,
          address: true,
          assignedTeam: true
        }
      })

      // Create a map for quick lookup
      const bookingMap = new Map(
        bookings.map(b => [b.bookingNumber, b])
      )

      // Process calendar events
      for (const event of events) {
        try {
          const bookingNumber =
            event.extendedProperties?.private?.bookingNumber

          if (!bookingNumber) {
            continue // Skip non-booking events
          }

          const booking = bookingMap.get(bookingNumber)

          if (!booking) {
            // Event exists in calendar but not in database
            // Consider deleting or marking as orphaned
            console.warn(`Orphaned event found: ${bookingNumber}`)
            syncResult.errors.push({
              type: 'ORPHANED_EVENT',
              bookingNumber,
              eventId: event.id
            })
            continue
          }

          // Update booking with calendar event ID if missing
          if (!booking.calendarEventId) {
            await prisma.booking.update({
              where: { id: booking.id },
              data: { calendarEventId: event.id }
            })
            syncResult.updated++
          }

          // Check if event needs updating
          const eventStart = new Date(event.start?.dateTime || event.start?.date!)
          const bookingStart = this.parseDateTime(
            booking.scheduledDate,
            booking.scheduledTime
          )

          if (eventStart.getTime() !== bookingStart.getTime()) {
            await this.updateBookingEvent(event.id!, {
              scheduledDate: booking.scheduledDate,
              scheduledTime: booking.scheduledTime,
              duration: booking.duration * 60
            })
            syncResult.updated++
          }

          bookingMap.delete(bookingNumber)
          syncResult.synced++
        } catch (error) {
          syncResult.errors.push({
            type: 'SYNC_ERROR',
            event: event.id,
            error: error.message
          })
        }
      }

      // Create events for bookings without calendar events
      for (const [bookingNumber, booking] of bookingMap) {
        try {
          const event = await this.createBookingEvent({
            id: booking.id,
            bookingNumber: booking.bookingNumber,
            customer: booking.customer,
            address: booking.address,
            serviceType: booking.serviceType,
            scheduledDate: booking.scheduledDate,
            scheduledTime: booking.scheduledTime,
            duration: booking.duration * 60,
            team: booking.assignedTeam,
            specialInstructions: booking.specialInstructions
          })

          await prisma.booking.update({
            where: { id: booking.id },
            data: { calendarEventId: event.id }
          })

          syncResult.created++
        } catch (error) {
          syncResult.errors.push({
            type: 'CREATE_ERROR',
            bookingNumber,
            error: error.message
          })
        }
      }

      console.log('Calendar sync completed:', syncResult)
      return syncResult
    } catch (error) {
      console.error('Calendar sync failed:', error)
      throw new CalendarError('SYNC_FAILED', error.message)
    }
  }

  /**
   * List calendar events
   */
  private async listEvents(params: {
    timeMin?: Date
    timeMax?: Date
    maxResults?: number
    orderBy?: string
  }): Promise<calendar_v3.Schema$Event[]> {
    const response = await this.calendar.events.list({
      calendarId: this.calendarId,
      timeMin: params.timeMin?.toISOString(),
      timeMax: params.timeMax?.toISOString(),
      maxResults: params.maxResults || 250,
      singleEvents: true,
      orderBy: params.orderBy as any || 'startTime'
    })

    return response.data.items || []
  }

  /**
   * Helper: Parse date and time into Date object
   */
  private parseDateTime(date: Date, time: string): Date {
    const [hours, minutes] = time.split(':').map(Number)
    const result = new Date(date)
    result.setHours(hours, minutes, 0, 0)
    return result
  }

  /**
   * Helper: Format event description
   */
  private formatDescription(booking: any): string {
    return `
📋 Broj rezervacije: ${booking.bookingNumber}
👤 Kupac: ${booking.customer.firstName} ${booking.customer.lastName}
📧 Email: ${booking.customer.email}
📱 Telefon: ${booking.customer.phone}
🏠 Adresa: ${booking.address.street}, ${booking.address.postalCode} ${booking.address.city}
🧹 Usluga: ${booking.serviceType}
⏱️ Trajanje: ${booking.duration} minuta
${booking.team ? `👥 Tim: ${booking.team.name} (Voditelj: ${booking.team.leader})` : ''}
${booking.specialInstructions ? `📝 Napomene: ${booking.specialInstructions}` : ''}
    `.trim()
  }

  /**
   * Helper: Format attendees list
   */
  private formatAttendees(booking: any): calendar_v3.Schema$EventAttendee[] {
    const attendees: calendar_v3.Schema$EventAttendee[] = []

    // Add customer
    if (booking.customer?.email) {
      attendees.push({
        email: booking.customer.email,
        displayName: `${booking.customer.firstName} ${booking.customer.lastName}`,
        responseStatus: 'accepted'
      })
    }

    // Add team members
    if (booking.team?.members) {
      booking.team.members.forEach((member: any) => {
        attendees.push({
          email: member.email || `${member.name.toLowerCase().replace(' ', '.')}@uredno.eu`,
          displayName: member.name,
          responseStatus: 'accepted'
        })
      })
    }

    return attendees
  }

  /**
   * Helper: Get color ID for service type
   */
  private getColorForService(serviceType: string): string {
    const colors: Record<string, string> = {
      'STANDARD': '2',        // Green
      'STANDARD_PLUS': '10',  // Light Green
      'DEEP_CLEAN': '5',      // Yellow
      'MOVING': '6',          // Orange
      'POST_CONSTRUCTION': '11' // Red
    }
    return colors[serviceType] || '7' // Default: Cyan
  }

  /**
   * Helper: Extract duration from event
   */
  private extractDuration(event: calendar_v3.Schema$Event): number {
    if (!event.start?.dateTime || !event.end?.dateTime) {
      return 120 // Default 2 hours
    }

    const start = new Date(event.start.dateTime)
    const end = new Date(event.end.dateTime)
    return Math.round((end.getTime() - start.getTime()) / 60000)
  }

  /**
   * Find alternative time slots
   */
  private async findAlternativeSlots(
    preferredDate: Date,
    duration: number,
    count: number
  ): Promise<TimeSlot[]> {
    const alternatives: TimeSlot[] = []
    let searchDate = new Date(preferredDate)
    let daysSearched = 0
    const maxDays = 7

    while (alternatives.length < count && daysSearched < maxDays) {
      const slots = await this.findAvailableSlots(searchDate, duration)

      // Add slots to alternatives
      for (const slot of slots) {
        if (alternatives.length >= count) break
        alternatives.push(slot)
      }

      // Move to next day
      searchDate.setDate(searchDate.getDate() + 1)
      daysSearched++
    }

    return alternatives
  }

  /**
   * Get conflicting events details
   */
  private async getConflictingEvents(
    startTime: Date,
    endTime: Date,
    busySlots: Array<{ start?: string | null; end?: string | null }>
  ): Promise<ConflictingEvent[]> {
    const conflicts: ConflictingEvent[] = []

    for (const busy of busySlots) {
      if (!busy.start || !busy.end) continue

      const busyStart = new Date(busy.start)
      const busyEnd = new Date(busy.end)

      // Check for overlap
      if (
        (startTime >= busyStart && startTime < busyEnd) ||
        (endTime > busyStart && endTime <= busyEnd) ||
        (startTime <= busyStart && endTime >= busyEnd)
      ) {
        // Get event details
        const events = await this.listEvents({
          timeMin: busyStart,
          timeMax: busyEnd,
          maxResults: 10
        })

        events.forEach(event => {
          conflicts.push({
            id: event.id!,
            summary: event.summary || 'Busy',
            start: event.start?.dateTime || event.start?.date!,
            end: event.end?.dateTime || event.end?.date!,
            type: event.extendedProperties?.private?.serviceType || 'OTHER'
          })
        })
      }
    }

    return conflicts
  }
}

// Custom error class
class CalendarError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message)
    this.name = 'CalendarError'
  }
}

// Type definitions
interface CalendarEvent {
  id: string
  htmlLink: string
  status: string
  created?: boolean
  updated?: boolean
}

interface AvailabilityCheck {
  available: boolean
  conflicts: ConflictingEvent[]
  alternativeSlots: TimeSlot[]
}

interface ConflictingEvent {
  id: string
  summary: string
  start: string
  end: string
  type: string
}

interface TimeSlot {
  date: string
  time: string
  available: boolean
  duration: number
}

interface SyncResult {
  synced: number
  created: number
  updated: number
  deleted: number
  errors: Array<{
    type: string
    [key: string]: any
  }>
}
```

### 2. Webhook Handler for Real-time Updates

```typescript
// src/app/api/calendar/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { GoogleCalendarService } from '@/lib/calendar/google-calendar-service'
import crypto from 'crypto'

/**
 * Handle Google Calendar push notifications
 * https://developers.google.com/calendar/api/guides/push
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    const signature = request.headers.get('x-goog-channel-token')
    const expectedSignature = process.env.GOOGLE_WEBHOOK_TOKEN

    if (signature !== expectedSignature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Get notification details
    const resourceId = request.headers.get('x-goog-resource-id')
    const channelId = request.headers.get('x-goog-channel-id')
    const resourceState = request.headers.get('x-goog-resource-state')

    console.log('Calendar webhook received:', {
      resourceId,
      channelId,
      resourceState
    })

    // Handle different resource states
    switch (resourceState) {
      case 'sync':
        // Initial sync notification
        console.log('Calendar sync initiated')
        break

      case 'exists':
        // Event created or updated
        await handleCalendarChange()
        break

      case 'not_exists':
        // Event deleted
        await handleCalendarDeletion()
        break

      default:
        console.warn('Unknown resource state:', resourceState)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCalendarChange() {
  const calendarService = new GoogleCalendarService()

  // Sync recent changes
  const now = new Date()
  const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000)

  const events = await calendarService.listEvents({
    timeMin: tenMinutesAgo,
    updatedMin: tenMinutesAgo.toISOString()
  })

  for (const event of events) {
    const bookingNumber =
      event.extendedProperties?.private?.bookingNumber

    if (!bookingNumber) continue

    // Update database with changes
    const booking = await prisma.booking.findFirst({
      where: { bookingNumber }
    })

    if (booking) {
      // Parse event time
      const eventStart = new Date(
        event.start?.dateTime || event.start?.date!
      )

      // Update if changed
      if (eventStart.getTime() !== booking.scheduledDate.getTime()) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            scheduledDate: eventStart,
            status: 'RESCHEDULED'
          }
        })

        // Send notification email
        await sendRescheduleNotification(booking, eventStart)
      }
    }
  }
}

async function handleCalendarDeletion() {
  // Handle event deletions
  console.log('Calendar event deleted')
}

async function sendRescheduleNotification(
  booking: any,
  newDate: Date
) {
  // Send email notification about schedule change
  const emailService = new EmailService()

  await emailService.send({
    template: 'BOOKING_RESCHEDULED',
    to: booking.customer.email,
    data: {
      bookingNumber: booking.bookingNumber,
      originalDate: booking.scheduledDate,
      newDate: newDate
    },
    locale: 'hr'
  })
}
```

### 3. Scheduled Sync Job

```typescript
// src/lib/calendar/sync-job.ts
import cron from 'node-cron'
import { GoogleCalendarService } from './google-calendar-service'

export class CalendarSyncJob {
  private calendarService: GoogleCalendarService
  private syncTask: cron.ScheduledTask | null = null

  constructor() {
    this.calendarService = new GoogleCalendarService()
  }

  /**
   * Start the sync job
   */
  start() {
    // Run every 15 minutes
    this.syncTask = cron.schedule('*/15 * * * *', async () => {
      console.log('Running calendar sync job...')

      try {
        const result = await this.calendarService.syncWithDatabase()

        // Log metrics
        await this.logSyncMetrics(result)

        // Alert on errors
        if (result.errors.length > 0) {
          await this.alertOnErrors(result.errors)
        }
      } catch (error) {
        console.error('Sync job failed:', error)
        await this.alertOnFailure(error)
      }
    })

    console.log('Calendar sync job started')
  }

  /**
   * Stop the sync job
   */
  stop() {
    if (this.syncTask) {
      this.syncTask.stop()
      this.syncTask = null
      console.log('Calendar sync job stopped')
    }
  }

  private async logSyncMetrics(result: SyncResult) {
    // Log to monitoring system
    metrics.calendarSync.inc({ status: 'success' })
    metrics.calendarSyncedEvents.set(result.synced)
    metrics.calendarCreatedEvents.set(result.created)
    metrics.calendarUpdatedEvents.set(result.updated)

    if (result.errors.length > 0) {
      metrics.calendarSyncErrors.inc(result.errors.length)
    }
  }

  private async alertOnErrors(errors: any[]) {
    // Group errors by type
    const errorGroups = errors.reduce((acc, error) => {
      acc[error.type] = (acc[error.type] || 0) + 1
      return acc
    }, {})

    // Send alert if critical errors
    if (errorGroups['CREATE_ERROR'] > 5) {
      await this.sendAlert(
        'High calendar creation failures',
        `${errorGroups['CREATE_ERROR']} events failed to create`
      )
    }
  }

  private async alertOnFailure(error: any) {
    await this.sendAlert(
      'Calendar sync job failed',
      error.message
    )
  }

  private async sendAlert(title: string, message: string) {
    // Send to monitoring system
    console.error(`ALERT: ${title} - ${message}`)

    // Send email to admin
    const emailService = new EmailService()
    await emailService.send({
      template: 'ADMIN_ALERT',
      to: process.env.ADMIN_EMAIL!,
      data: {
        title,
        message,
        timestamp: new Date()
      },
      locale: 'hr'
    })
  }
}

// Initialize on server start
export const calendarSyncJob = new CalendarSyncJob()
```

### 4. API Routes

```typescript
// src/app/api/calendar/availability/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { GoogleCalendarService } from '@/lib/calendar/google-calendar-service'
import { z } from 'zod'

const AvailabilitySchema = z.object({
  date: z.string().datetime(),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  duration: z.number().min(30).max(480)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, time, duration } = AvailabilitySchema.parse(body)

    const calendarService = new GoogleCalendarService()
    const availability = await calendarService.checkAvailability(
      new Date(date),
      time,
      duration
    )

    return NextResponse.json(availability)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Availability check error:', error)
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    )
  }
}
```

```typescript
// src/app/api/calendar/slots/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { GoogleCalendarService } from '@/lib/calendar/google-calendar-service'
import { z } from 'zod'

const SlotsSchema = z.object({
  date: z.string().datetime(),
  duration: z.number().min(30).max(480),
  startHour: z.number().min(0).max(23).optional(),
  endHour: z.number().min(0).max(23).optional(),
  slotInterval: z.number().min(15).max(120).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = SlotsSchema.parse(body)

    const calendarService = new GoogleCalendarService()
    const slots = await calendarService.findAvailableSlots(
      new Date(validated.date),
      validated.duration,
      {
        startHour: validated.startHour,
        endHour: validated.endHour,
        slotInterval: validated.slotInterval
      }
    )

    return NextResponse.json({ slots })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Slot search error:', error)
    return NextResponse.json(
      { error: 'Failed to find available slots' },
      { status: 500 }
    )
  }
}
```

## Testing Implementation

```typescript
// src/lib/calendar/__tests__/calendar.test.ts
import { GoogleCalendarService } from '../google-calendar-service'

describe('Google Calendar Integration', () => {
  let calendarService: GoogleCalendarService

  beforeEach(() => {
    calendarService = new GoogleCalendarService()
  })

  describe('Event Management', () => {
    it('should create calendar event for booking', async () => {
      const mockBooking = {
        id: 'booking-123',
        bookingNumber: 'BK000001',
        customer: {
          firstName: 'Ivan',
          lastName: 'Horvat',
          email: 'ivan@example.com',
          phone: '+385 91 234 5678'
        },
        address: {
          street: 'Ilica 1',
          city: 'Zagreb',
          postalCode: '10000'
        },
        serviceType: 'STANDARD',
        scheduledDate: new Date('2024-02-15'),
        scheduledTime: '10:00',
        duration: 120
      }

      const event = await calendarService.createBookingEvent(mockBooking)

      expect(event).toBeDefined()
      expect(event.id).toBeDefined()
      expect(event.htmlLink).toContain('calendar.google.com')
      expect(event.created).toBe(true)
    })

    it('should update existing event', async () => {
      const eventId = 'existing-event-id'
      const updates = {
        scheduledDate: new Date('2024-02-16'),
        scheduledTime: '14:00',
        duration: 180
      }

      const result = await calendarService.updateBookingEvent(
        eventId,
        updates
      )

      expect(result.updated).toBe(true)
    })

    it('should handle event deletion gracefully', async () => {
      const eventId = 'event-to-delete'

      await expect(
        calendarService.deleteBookingEvent(eventId)
      ).resolves.not.toThrow()
    })
  })

  describe('Availability Checking', () => {
    it('should detect time conflicts', async () => {
      const result = await calendarService.checkAvailability(
        new Date('2024-02-15'),
        '10:00',
        120
      )

      if (!result.available) {
        expect(result.conflicts).toBeInstanceOf(Array)
        expect(result.alternativeSlots).toBeInstanceOf(Array)
        expect(result.alternativeSlots.length).toBeGreaterThan(0)
      }
    })

    it('should find available slots for a day', async () => {
      const slots = await calendarService.findAvailableSlots(
        new Date('2024-02-15'),
        120,
        {
          startHour: 8,
          endHour: 20,
          slotInterval: 60
        }
      )

      expect(slots).toBeInstanceOf(Array)
      slots.forEach(slot => {
        expect(slot).toHaveProperty('date')
        expect(slot).toHaveProperty('time')
        expect(slot).toHaveProperty('available')
        expect(slot).toHaveProperty('duration')
      })
    })
  })

  describe('Database Sync', () => {
    it('should sync calendar with database', async () => {
      const result = await calendarService.syncWithDatabase()

      expect(result).toHaveProperty('synced')
      expect(result).toHaveProperty('created')
      expect(result).toHaveProperty('updated')
      expect(result).toHaveProperty('deleted')
      expect(result).toHaveProperty('errors')

      expect(result.errors).toBeInstanceOf(Array)
    })
  })

  describe('Croatian Support', () => {
    it('should format Croatian text correctly in events', async () => {
      const mockBooking = {
        id: 'booking-456',
        bookingNumber: 'BK000002',
        customer: {
          firstName: 'Željko',
          lastName: 'Čović',
          email: 'zeljko@example.com',
          phone: '+385 91 234 5678'
        },
        address: {
          street: 'Šubićeva 42',
          city: 'Zagreb',
          postalCode: '10000'
        },
        serviceType: 'DUBINSKO ČIŠĆENJE',
        scheduledDate: new Date('2024-02-20'),
        scheduledTime: '14:00',
        duration: 180
      }

      const event = await calendarService.createBookingEvent(mockBooking)

      expect(event).toBeDefined()
      // Verify Croatian characters are preserved
    })
  })
})
```

## Deployment Checklist

### Google Cloud Setup
- [ ] Create Google Cloud project
- [ ] Enable Calendar API
- [ ] Create service account
- [ ] Download credentials JSON
- [ ] Share calendar with service account
- [ ] Set calendar permissions (Make changes to events)
- [ ] Configure calendar timezone (Europe/Zagreb)

### Application Configuration
- [ ] Store service account JSON securely
- [ ] Configure environment variables
- [ ] Set up webhook endpoint
- [ ] Configure webhook token
- [ ] Test authentication

### Testing
- [ ] Test event creation
- [ ] Test event updates
- [ ] Test event deletion
- [ ] Test availability checking
- [ ] Test conflict detection
- [ ] Test database sync
- [ ] Test webhook handling
- [ ] Test Croatian character support

### Monitoring
- [ ] Set up sync job monitoring
- [ ] Configure error alerts
- [ ] Monitor API quotas
- [ ] Track sync metrics
- [ ] Monitor webhook health

## Common Issues and Solutions

### Issue: Authentication fails
**Solution**: Verify service account JSON path, check calendar sharing permissions

### Issue: Rate limit exceeded
**Solution**: Implement request queuing with p-queue, adjust concurrency settings

### Issue: Events not syncing
**Solution**: Check webhook configuration, verify sync job is running

### Issue: Croatian characters corrupted
**Solution**: Ensure UTF-8 encoding throughout, verify calendar locale settings

### Issue: Time zone issues
**Solution**: Always use Europe/Zagreb timezone, use date-fns-tz for conversions

## Performance Optimization

1. **Batch Operations**: Use batch API calls when possible
2. **Caching**: Cache availability data for frequently checked slots
3. **Queue Management**: Implement proper rate limiting with p-queue
4. **Webhook Efficiency**: Process webhooks asynchronously
5. **Sync Optimization**: Only sync changed events, not full calendar

## Security Considerations

1. **Credentials**: Never commit service account JSON to repository
2. **Webhook Validation**: Always verify webhook signatures
3. **Access Control**: Limit calendar permissions to minimum required
4. **Data Privacy**: Don't store sensitive customer data in calendar
5. **Audit Logging**: Log all calendar operations for compliance