# Phase 3: WhatsApp Business Integration Workflow

## Overview
Integrate WhatsApp Business API for customer communication and booking management.

## Prerequisites
- WhatsApp Business account
- Facebook Business Manager access
- Phone number verified for WhatsApp Business
- Backend API server (Railway) configured

## Workflow Steps

### 1. WhatsApp Business Setup
```bash
# 1. Create Facebook Business App
# Go to: https://developers.facebook.com/apps/
# Create new app > Business type

# 2. Add WhatsApp Product
# Dashboard > Add Product > WhatsApp > Set up

# 3. Configure webhook
# Webhook URL: https://your-backend.railway.app/api/whatsapp/webhook
# Verify token: Generate secure token
```

### 2. Create WhatsApp Configuration
```typescript
// lib/whatsapp/config.ts
export const WHATSAPP_CONFIG = {
  phoneNumber: '385924502265',
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
  businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID!,
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN!,
  verifyToken: process.env.WHATSAPP_VERIFY_TOKEN!,
  apiVersion: 'v18.0',
  baseUrl: 'https://graph.facebook.com',
};

export const MESSAGE_TEMPLATES = {
  bookingConfirmation: 'booking_confirmation_v1',
  dayBeforeReminder: 'day_before_reminder_v1',
  arrivalNotification: 'arrival_notification_v1',
  completionThankYou: 'completion_thank_you_v1',
};
```

### 3. Create WhatsApp Service
```typescript
// lib/whatsapp/service.ts
import axios from 'axios';
import { WHATSAPP_CONFIG, MESSAGE_TEMPLATES } from './config';

export class WhatsAppService {
  private apiUrl: string;
  private headers: Record<string, string>;

  constructor() {
    this.apiUrl = `${WHATSAPP_CONFIG.baseUrl}/${WHATSAPP_CONFIG.apiVersion}`;
    this.headers = {
      'Authorization': `Bearer ${WHATSAPP_CONFIG.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  async sendMessage(to: string, message: string) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/${WHATSAPP_CONFIG.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to,
          type: 'text',
          text: {
            preview_url: false,
            body: message,
          },
        },
        { headers: this.headers }
      );

      return response.data;
    } catch (error) {
      console.error('WhatsApp send message error:', error);
      throw error;
    }
  }

  async sendTemplate(
    to: string,
    templateName: string,
    parameters: any[]
  ) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/${WHATSAPP_CONFIG.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: 'hr', // Croatian
            },
            components: [
              {
                type: 'body',
                parameters: parameters,
              },
            ],
          },
        },
        { headers: this.headers }
      );

      return response.data;
    } catch (error) {
      console.error('WhatsApp template error:', error);
      throw error;
    }
  }

  async sendBookingConfirmation(booking: any) {
    const parameters = [
      { type: 'text', text: booking.customerName },
      { type: 'text', text: booking.date },
      { type: 'text', text: booking.timeSlot },
      { type: 'text', text: booking.service },
      { type: 'text', text: booking.address },
      { type: 'text', text: booking.totalPrice },
      { type: 'text', text: booking.bookingNumber },
    ];

    return this.sendTemplate(
      booking.phone,
      MESSAGE_TEMPLATES.bookingConfirmation,
      parameters
    );
  }

  async sendDayBeforeReminder(booking: any) {
    const parameters = [
      { type: 'text', text: booking.customerName },
      { type: 'text', text: booking.date },
      { type: 'text', text: booking.timeSlot },
    ];

    return this.sendTemplate(
      booking.phone,
      MESSAGE_TEMPLATES.dayBeforeReminder,
      parameters
    );
  }
}

export const whatsappService = new WhatsAppService();
```

### 4. Create Message Queue Handler
```typescript
// lib/queue/whatsapp-queue.ts
import Queue from 'bull';
import { whatsappService } from '@/lib/whatsapp/service';

const whatsappQueue = new Queue('whatsapp-messages', {
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
});

// Process messages
whatsappQueue.process(async (job) => {
  const { type, data } = job.data;

  switch (type) {
    case 'booking_confirmation':
      return await whatsappService.sendBookingConfirmation(data);

    case 'day_before_reminder':
      return await whatsappService.sendDayBeforeReminder(data);

    case 'custom_message':
      return await whatsappService.sendMessage(data.to, data.message);

    default:
      throw new Error(`Unknown message type: ${type}`);
  }
});

// Queue a message
export async function queueWhatsAppMessage(
  type: string,
  data: any,
  delay?: number
) {
  const options: any = {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  };

  if (delay) {
    options.delay = delay;
  }

  return await whatsappQueue.add({ type, data }, options);
}
```

### 5. Create Webhook Handler
```typescript
// app/api/whatsapp/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { WHATSAPP_CONFIG } from '@/lib/whatsapp/config';
import { handleIncomingMessage } from '@/lib/whatsapp/incoming';

// Webhook verification
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === WHATSAPP_CONFIG.verifyToken) {
    console.log('Webhook verified');
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json(
    { error: 'Invalid verification token' },
    { status: 403 }
  );
}

// Handle incoming messages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Process webhook event
    if (body.entry && body.entry[0].changes) {
      const change = body.entry[0].changes[0];

      if (change.field === 'messages') {
        const message = change.value.messages?.[0];
        if (message) {
          await handleIncomingMessage(message);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
```

### 6. Handle Incoming Messages
```typescript
// lib/whatsapp/incoming.ts
import { whatsappService } from './service';
import { supabase } from '@/lib/supabase';

export async function handleIncomingMessage(message: any) {
  const { from, type, text, timestamp } = message;

  // Log incoming message
  await supabase.from('whatsapp_messages').insert({
    from: from,
    type: type,
    content: text?.body || '',
    timestamp: new Date(timestamp * 1000),
    direction: 'incoming',
  });

  // Auto-reply based on content
  if (type === 'text') {
    const content = text.body.toLowerCase();

    if (content.includes('cijena') || content.includes('price')) {
      await whatsappService.sendMessage(
        from,
        `Pozdrav! 👋

Za točnu cijenu naših usluga, molimo vas da:
1. Posjetite našu web stranicu: https://uredno.eu
2. Koristite kalkulator cijena
3. Ili nas nazovite na: +385 92 450 2265

Radimo ponedjeljak-subota 07:00-15:00.

Hvala! 🏠✨`
      );
    } else if (content.includes('booking') || content.includes('rezervacija')) {
      await whatsappService.sendMessage(
        from,
        `Za rezervaciju termina:
🌐 Web: https://uredno.eu/booking
📞 Telefon: +385 92 450 2265

Slobodno nas kontaktirajte za sve informacije!`
      );
    } else {
      // Default auto-reply
      await whatsappService.sendMessage(
        from,
        `Hvala na poruci!
Tim WebUredno će vam odgovoriti tijekom radnog vremena (Pon-Sub 07:00-15:00).

Za hitne slučajeve nazovite: +385 92 450 2265`
      );
    }
  }
}
```

### 7. Create WhatsApp Link Generator
```typescript
// lib/whatsapp/links.ts
export function generateWhatsAppLink(
  phone: string = '385924502265',
  message?: string
): string {
  const baseUrl = 'https://wa.me/';
  const encodedMessage = message ?
    `?text=${encodeURIComponent(message)}` : '';

  return `${baseUrl}${phone}${encodedMessage}`;
}

export function generateBookingMessage(booking: any): string {
  return `🏠 NOVA REZERVACIJA - WebUredno
━━━━━━━━━━━━━━━━━━
📅 Datum: ${booking.date}
⏰ Vrijeme: ${booking.timeSlot}
🏠 Adresa: ${booking.address}
━━━━━━━━━━━━━━━━━━
📦 Usluga: ${booking.service}
👥 ${booking.bedrooms} spavaće | ${booking.bathrooms} kupaonice
📏 ${booking.size} m²
━━━━━━━━━━━━━━━━━━
💰 Cijena: ${booking.price} EUR
━━━━━━━━━━━━━━━━━━
👤 Ime: ${booking.name}
📧 Email: ${booking.email}
📱 Tel: ${booking.phone}
━━━━━━━━━━━━━━━━━━
${booking.notes ? `📝 Napomene: ${booking.notes}` : ''}`;
}
```

### 8. Create WhatsApp Components
```tsx
// components/whatsapp/WhatsAppButton.tsx
'use client';

import { MessageCircle } from 'lucide-react';
import { generateWhatsAppLink } from '@/lib/whatsapp/links';

interface WhatsAppButtonProps {
  message?: string;
  className?: string;
  fixed?: boolean;
}

export function WhatsAppButton({
  message,
  className = '',
  fixed = false
}: WhatsAppButtonProps) {
  const link = generateWhatsAppLink('385924502265', message);

  if (fixed) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-4 z-50 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors"
        aria-label="Contact on WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </a>
    );
  }

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors ${className}`}
    >
      <MessageCircle className="w-5 h-5" />
      WhatsApp
    </a>
  );
}
```

### 9. Setup Message Templates
```
# WhatsApp Business Manager Template Setup

## Booking Confirmation Template
Name: booking_confirmation_v1
Language: Croatian (hr)
Category: TRANSACTIONAL

Body:
Pozdrav {{1}}! 🏠

Vaša rezervacija je potvrđena:
📅 Datum: {{2}}
⏰ Vrijeme: {{3}}
🧹 Usluga: {{4}}
📍 Adresa: {{5}}
💰 Cijena: {{6}} EUR

Broj rezervacije: {{7}}

Stići ćemo u dogovoreno vrijeme. Za promjene kontaktirajte nas najmanje 24h prije.

Hvala na povjerenju!
Tim WebUredno ✨

## Day Before Reminder Template
Name: day_before_reminder_v1
Language: Croatian (hr)
Category: REMINDER

Body:
Pozdrav {{1}}! 👋

Podsjetnik: Sutra dolazimo!
📅 {{2}}
⏰ {{3}}

Molimo osigurajte pristup prostorima.

Vidimo se! 🏠✨
```

## Verification Checklist

- [ ] WhatsApp Business account configured
- [ ] Webhook URL verified
- [ ] Message templates approved
- [ ] Queue system working
- [ ] Auto-replies functioning
- [ ] Booking confirmations sent
- [ ] Reminders scheduled
- [ ] Error handling implemented

## Next Steps
- Proceed to [Google Calendar Integration](./02-google-calendar.md)
- Test message delivery
- Monitor webhook events
- Set up message analytics

## Testing

```bash
# Test webhook locally
ngrok http 3000

# Test message sending
curl -X POST https://your-api/api/whatsapp/test \
  -H "Content-Type: application/json" \
  -d '{"to": "385924502265", "message": "Test message"}'
```