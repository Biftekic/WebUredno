import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

// WhatsApp webhook verification token
const WEBHOOK_VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_TOKEN || 'uredno_verify_token';
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN || '';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
const WHATSAPP_BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '';

// Message templates for auto-replies
const MESSAGE_TEMPLATES = {
  welcome: `Pozdrav! 👋

Dobrodošli u Uredno.eu - Vašeg pouzdanog partnera za čišćenje.

Kako Vam možemo pomoći danas?

1️⃣ Informacije o uslugama
2️⃣ Provjera dostupnosti
3️⃣ Zakazivanje termina
4️⃣ Cijena usluga
5️⃣ Kontakt s podrškom

Odgovorite brojem ili opišite što trebate.`,

  services: `Naše usluge čišćenja:

🏠 Redovito čišćenje
✨ Dubinsko čišćenje
📦 Čišćenje nakon selidbe
🏗️ Čišćenje nakon građevinskih radova
🏢 Čišćenje ureda
🪟 Čišćenje prozora

Za detalje o određenoj usluzi, napišite naziv usluge.`,

  booking_confirmation: (bookingNumber: string, date: string, time: string) => `✅ Vaša rezervacija je potvrđena!

Broj rezervacije: ${bookingNumber}
Datum: ${date}
Vrijeme: ${time}

Hvala što ste odabrali Uredno.eu!

Za promjenu termina ili otkazivanje, kontaktirajte nas najmanje 24 sata unaprijed.`,

  price_info: `💰 Informacije o cijenama:

Naše cijene ovise o:
• Vrsti usluge
• Veličini prostora
• Učestalosti čišćenja
• Dodatnim uslugama

Za personaliziranu ponudu, molimo podijelite:
1. Vrstu usluge koju trebate
2. Veličinu prostora (m²)
3. Lokaciju

Odgovorit ćemo s detaljnom ponudom!`,

  availability_check: `📅 Provjera dostupnosti

Molimo navedite:
• Željeni datum (DD.MM.YYYY)
• Preferirano vrijeme
• Vrstu usluge

Provjerit ćemo dostupnost i javiti Vam se!`,

  support: `📞 Kontakt podrške

Naš tim je tu za Vas!

Email: kontakt@uredno.eu
Telefon: +385 XX XXX XXXX
Radno vrijeme: Pon-Pet 8:00-18:00, Sub 9:00-14:00

Ili opišite svoj upit ovdje, pa ćemo Vam odgovoriti što prije.`,

  unknown: `Oprosti, nisam razumio Vaš zahtjev. 🤔

Možete:
• Napisati broj opcije (1-5)
• Opisati što trebate
• Kontaktirati našu podršku

Ili napišite "pomoć" za prikaz glavnog izbornika.`
};

// Keywords for intent detection
const INTENT_KEYWORDS = {
  services: ['usluga', 'usluge', 'čišćenje', 'cleaning', 'servis'],
  booking: ['rezervacija', 'zakazati', 'termin', 'booking', 'zakaži'],
  price: ['cijena', 'cijene', 'košta', 'price', 'cena'],
  availability: ['dostupnost', 'slobodno', 'kada', 'available'],
  support: ['pomoć', 'podrška', 'kontakt', 'help', 'support'],
  cancel: ['otkaži', 'otkazati', 'cancel', 'otkaz']
};

// Detect user intent from message
function detectIntent(message: string): string {
  const lowerMessage = message.toLowerCase();

  // Check for menu numbers
  if (lowerMessage === '1') return 'services';
  if (lowerMessage === '2') return 'availability';
  if (lowerMessage === '3') return 'booking';
  if (lowerMessage === '4') return 'price';
  if (lowerMessage === '5') return 'support';

  // Check for keywords
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      return intent;
    }
  }

  // Check for help/start commands
  if (lowerMessage.includes('pomoć') || lowerMessage.includes('help') ||
      lowerMessage.includes('start') || lowerMessage.includes('početak')) {
    return 'welcome';
  }

  return 'unknown';
}

// Send WhatsApp message via API
async function sendWhatsAppMessage(to: string, message: string, messageType = 'text') {
  if (!WHATSAPP_API_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.warn('WhatsApp API not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          type: messageType,
          text: {
            body: message
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API error:', data);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    return null;
  }
}

// Process incoming WhatsApp message
async function processWhatsAppMessage(message: any) {
  const { from, text, timestamp } = message;

  // Detect intent
  const intent = detectIntent(text.body);

  // Get appropriate response
  let responseMessage = MESSAGE_TEMPLATES.unknown;
  switch (intent) {
    case 'welcome':
      responseMessage = MESSAGE_TEMPLATES.welcome;
      break;
    case 'services':
      responseMessage = MESSAGE_TEMPLATES.services;
      break;
    case 'price':
      responseMessage = MESSAGE_TEMPLATES.price_info;
      break;
    case 'availability':
      responseMessage = MESSAGE_TEMPLATES.availability_check;
      break;
    case 'booking':
      responseMessage = MESSAGE_TEMPLATES.availability_check; // Start booking flow
      break;
    case 'support':
      responseMessage = MESSAGE_TEMPLATES.support;
      break;
  }

  // Store message in database
  await supabase
    .from('whatsapp_messages')
    .insert([{
      phone_number: from,
      message_text: text.body,
      intent: intent,
      response_sent: responseMessage,
      timestamp: new Date(timestamp * 1000).toISOString()
    }]);

  // Send auto-reply
  await sendWhatsAppMessage(from, responseMessage);

  // If it's a potential inquiry, create an inquiry record
  if (['booking', 'price', 'support'].includes(intent)) {
    await supabase
      .from('inquiries')
      .insert([{
        name: `WhatsApp User ${from.slice(-4)}`,
        phone: from,
        message: text.body,
        inquiry_type: intent === 'price' ? 'quote' : 'general',
        source: 'whatsapp',
        status: 'new'
      }]);
  }

  return {
    intent,
    response: responseMessage
  };
}

// GET /api/whatsapp - Webhook verification
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    // Verify webhook
    if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
      console.log('WhatsApp webhook verified successfully');
      return new NextResponse(challenge, { status: 200 });
    }

    return NextResponse.json(
      { error: 'Invalid verification token' },
      { status: 403 }
    );
  } catch (error) {
    console.error('Webhook verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}

// POST /api/whatsapp - Handle incoming messages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify webhook signature (optional but recommended)
    const signature = request.headers.get('x-hub-signature-256');
    if (signature && process.env.WHATSAPP_APP_SECRET) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.WHATSAPP_APP_SECRET)
        .update(JSON.stringify(body))
        .digest('hex');

      if (signature !== `sha256=${expectedSignature}`) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 403 }
        );
      }
    }

    // Process webhook payload
    if (body.entry && body.entry.length > 0) {
      for (const entry of body.entry) {
        if (entry.changes && entry.changes.length > 0) {
          for (const change of entry.changes) {
            // Handle incoming messages
            if (change.value.messages) {
              for (const message of change.value.messages) {
                if (message.type === 'text') {
                  await processWhatsAppMessage(message);
                }
              }
            }

            // Handle status updates
            if (change.value.statuses) {
              for (const status of change.value.statuses) {
                console.log('Message status update:', status);
                // You can track message delivery status here
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// POST /api/whatsapp/send - Send WhatsApp message (for internal use)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const sendSchema = z.object({
      to: z.string().min(10, 'Neispravan broj telefona'),
      message: z.string().min(1, 'Poruka je obavezna'),
      template: z.enum(['booking_confirmation', 'reminder', 'custom']).optional()
    });

    const validationResult = sendSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Neispravni podaci',
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const { to, message, template } = validationResult.data;

    // Format phone number
    let formattedPhone = to;
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '+385' + formattedPhone.substring(1);
      } else {
        formattedPhone = '+385' + formattedPhone;
      }
    }

    // Send message
    const result = await sendWhatsAppMessage(formattedPhone, message);

    if (!result) {
      return NextResponse.json(
        {
          error: 'Slanje poruke nije uspjelo',
          message: 'WhatsApp API nije konfiguriran ili je došlo do greške'
        },
        { status: 500 }
      );
    }

    // Log sent message
    await supabase
      .from('whatsapp_messages')
      .insert([{
        phone_number: formattedPhone,
        message_text: message,
        direction: 'outbound',
        template_used: template,
        timestamp: new Date().toISOString()
      }]);

    return NextResponse.json({
      success: true,
      message: 'Poruka uspješno poslana',
      data: {
        message_id: result.messages?.[0]?.id,
        recipient: formattedPhone
      }
    });

  } catch (error) {
    console.error('Send WhatsApp error:', error);
    return NextResponse.json(
      {
        error: 'Greška pri slanju poruke',
        message: error instanceof Error ? error.message : 'Nepoznata greška'
      },
      { status: 500 }
    );
  }
}