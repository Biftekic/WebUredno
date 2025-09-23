import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';

// Validation schema for contact form submission
const contactFormSchema = z.object({
  name: z.string().min(2, 'Ime mora imati najmanje 2 znaka').max(100),
  email: z.string().email('Neispravna email adresa').optional().nullable(),
  phone: z.string().min(6, 'Telefon mora imati najmanje 6 znakova').optional().nullable(),
  message: z.string().min(10, 'Poruka mora imati najmanje 10 znakova').max(2000),
  inquiry_type: z.enum(['general', 'quote', 'support']).optional(),
  service_interest: z.string().optional(),
  source: z.enum(['website', 'whatsapp']).default('website'),
  consent: z.boolean().optional(),
  recaptcha_token: z.string().optional()
});

// Croatian inquiry type labels
const INQUIRY_TYPE_LABELS = {
  general: 'Opći upit',
  quote: 'Zahtjev za ponudu',
  support: 'Podrška'
};

// Rate limiting: Store request counts (in production, use Redis or similar)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// Simple rate limiting function
function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const limit = requestCounts.get(identifier);

  if (!limit || now > limit.resetTime) {
    // Reset or initialize the counter
    requestCounts.set(identifier, {
      count: 1,
      resetTime: now + 60000 // 1 minute window
    });
    return false;
  }

  if (limit.count >= 5) {
    // Max 5 requests per minute
    return true;
  }

  limit.count++;
  return false;
}

// Format phone number for Croatian standards
function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Format for Croatian numbers
  if (cleaned.startsWith('385')) {
    // International format
    return '+' + cleaned;
  } else if (cleaned.startsWith('0')) {
    // Local format, convert to international
    return '+385' + cleaned.substring(1);
  } else {
    // Assume it's local without leading 0
    return '+385' + cleaned;
  }
}

// Send notification (prepare for email/WhatsApp integration)
async function sendNotification(inquiry: any) {
  // This function can be extended to send actual notifications
  // via email (SendGrid, Resend, etc.) or WhatsApp API

  const notificationData = {
    type: 'new_inquiry',
    inquiry_id: inquiry.id,
    name: inquiry.name,
    contact: inquiry.email || inquiry.phone,
    message: inquiry.message,
    inquiry_type: INQUIRY_TYPE_LABELS[inquiry.inquiry_type as keyof typeof INQUIRY_TYPE_LABELS] || 'Nepoznato',
    created_at: inquiry.created_at
  };

  // For now, just log the notification
  console.log('Notification prepared:', notificationData);

  // TODO: Implement actual notification sending
  // Example integrations:
  // 1. Email via SendGrid/Resend
  // 2. WhatsApp via Twilio/WhatsApp Business API
  // 3. SMS via Twilio
  // 4. Push notifications

  return notificationData;
}

// POST /api/contact - Submit contact form
export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIp = request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    'unknown';

    // Check rate limiting
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        {
          error: 'Previše zahtjeva',
          message: 'Molimo pokušajte ponovo za minutu'
        },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = contactFormSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Neispravni podaci',
          details: validationResult.error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Ensure at least one contact method is provided
    if (!data.email && !data.phone) {
      return NextResponse.json(
        {
          error: 'Kontakt informacije su obavezne',
          message: 'Molimo unesite email adresu ili broj telefona'
        },
        { status: 400 }
      );
    }

    // Format phone number if provided
    const formattedPhone = data.phone ? formatPhoneNumber(data.phone) : null;

    // Prepare inquiry data for database
    const inquiryData = {
      name: data.name.trim(),
      email: data.email?.toLowerCase().trim() || null,
      phone: formattedPhone,
      message: data.message.trim(),
      inquiry_type: data.inquiry_type || 'general',
      status: 'new' as const,
      source: data.source,
      metadata: {
        service_interest: data.service_interest,
        client_ip: clientIp,
        user_agent: request.headers.get('user-agent'),
        submitted_at: new Date().toISOString()
      }
    };

    // Save to database
    const { data: inquiry, error: dbError } = await supabase
      .from('inquiries')
      .insert([inquiryData])
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        {
          error: 'Greška pri spremanju',
          message: 'Nismo mogli spremiti vašu poruku. Molimo pokušajte ponovo.'
        },
        { status: 500 }
      );
    }

    // Send notification asynchronously (don't wait for it)
    sendNotification(inquiry).catch(error => {
      console.error('Notification error:', error);
      // Don't fail the request if notification fails
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Vaša poruka je uspješno poslana!',
      data: {
        id: inquiry.id,
        reference_number: `INQ-${inquiry.id.substring(0, 8).toUpperCase()}`,
        estimated_response_time: '24 sata'
      }
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      {
        error: 'Greška sustava',
        message: 'Dogodila se neočekivana greška. Molimo pokušajte ponovo kasnije.'
      },
      { status: 500 }
    );
  }
}

// GET /api/contact/status/:id - Check inquiry status
export async function GET(request: NextRequest) {
  try {
    // Extract inquiry ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const inquiryId = pathParts[pathParts.length - 1];

    if (!inquiryId || inquiryId === 'contact') {
      return NextResponse.json(
        {
          error: 'ID upita je obavezan'
        },
        { status: 400 }
      );
    }

    // Fetch inquiry from database
    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .select('id, status, created_at, responded_at')
      .eq('id', inquiryId)
      .single();

    if (error || !inquiry) {
      return NextResponse.json(
        {
          error: 'Upit nije pronađen'
        },
        { status: 404 }
      );
    }

    // Calculate response time if responded
    let responseTime = null;
    if (inquiry.responded_at) {
      const created = new Date(inquiry.created_at);
      const responded = new Date(inquiry.responded_at);
      const diffHours = Math.round((responded.getTime() - created.getTime()) / (1000 * 60 * 60));
      responseTime = diffHours < 24 ? `${diffHours} sati` : `${Math.round(diffHours / 24)} dana`;
    }

    const statusLabels = {
      new: 'Novi upit',
      responded: 'Odgovoreno',
      closed: 'Zatvoreno'
    };

    return NextResponse.json({
      success: true,
      data: {
        id: inquiry.id,
        status: statusLabels[inquiry.status as keyof typeof statusLabels] || inquiry.status,
        submitted_at: inquiry.created_at,
        response_time: responseTime
      }
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      {
        error: 'Greška pri provjeri statusa'
      },
      { status: 500 }
    );
  }
}