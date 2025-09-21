// API Utility Functions

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// CORS headers for API responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
export const RATE_LIMITS = {
  default: { requests: 60, window: 60000 }, // 60 requests per minute
  contact: { requests: 5, window: 60000 }, // 5 contact form submissions per minute
  whatsapp: { requests: 100, window: 60000 }, // 100 WhatsApp messages per minute
  price: { requests: 30, window: 60000 }, // 30 price calculations per minute
};

// Get client identifier (IP address)
export function getClientId(request: NextRequest): string {
  return request.headers.get('x-forwarded-for') ||
         request.headers.get('x-real-ip') ||
         request.ip ||
         'unknown';
}

// Rate limiting function
export function checkRateLimit(
  clientId: string,
  endpoint: keyof typeof RATE_LIMITS = 'default'
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const limit = RATE_LIMITS[endpoint];
  const key = `${endpoint}:${clientId}`;

  const current = rateLimitStore.get(key);

  if (!current || now > current.resetTime) {
    // Reset or initialize
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + limit.window
    });
    return {
      allowed: true,
      remaining: limit.requests - 1,
      resetIn: limit.window
    };
  }

  if (current.count >= limit.requests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: current.resetTime - now
    };
  }

  current.count++;
  return {
    allowed: true,
    remaining: limit.requests - current.count,
    resetIn: current.resetTime - now
  };
}

// Create rate limit response
export function rateLimitResponse(resetIn: number): NextResponse {
  return NextResponse.json(
    {
      error: 'Previše zahtjeva',
      message: `Molimo pokušajte ponovo za ${Math.ceil(resetIn / 1000)} sekundi`,
      retry_after: Math.ceil(resetIn / 1000)
    },
    {
      status: 429,
      headers: {
        'Retry-After': Math.ceil(resetIn / 1000).toString(),
        ...corsHeaders
      }
    }
  );
}

// Validation error formatter
export function formatValidationErrors(errors: z.ZodError): any[] {
  return errors.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code
  }));
}

// Create validation error response
export function validationErrorResponse(errors: z.ZodError, message = 'Neispravni podaci'): NextResponse {
  return NextResponse.json(
    {
      error: message,
      details: formatValidationErrors(errors)
    },
    { status: 400, headers: corsHeaders }
  );
}

// Create success response
export function successResponse<T>(data: T, message?: string): NextResponse {
  return NextResponse.json(
    {
      success: true,
      message,
      data
    },
    { status: 200, headers: corsHeaders }
  );
}

// Create error response
export function errorResponse(
  error: string,
  message?: string,
  status = 500,
  details?: any
): NextResponse {
  return NextResponse.json(
    {
      error,
      message,
      details
    },
    { status, headers: corsHeaders }
  );
}

// Handle API errors
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  if (error instanceof z.ZodError) {
    return validationErrorResponse(error);
  }

  if (error instanceof Error) {
    // Check for specific error types
    if (error.message.includes('UNAUTHORIZED')) {
      return errorResponse('Neovlašteni pristup', error.message, 401);
    }
    if (error.message.includes('NOT_FOUND')) {
      return errorResponse('Resurs nije pronađen', error.message, 404);
    }
    if (error.message.includes('CONFLICT')) {
      return errorResponse('Konflikt podataka', error.message, 409);
    }

    return errorResponse(
      'Greška sustava',
      error.message,
      500
    );
  }

  return errorResponse(
    'Neočekivana greška',
    'Dogodila se neočekivana greška. Molimo pokušajte ponovo.',
    500
  );
}

// Verify webhook signature
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  return signature === `sha256=${expectedSignature}`;
}

// Sanitize input (basic XSS prevention)
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Format Croatian phone number
export function formatCroatianPhone(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Format based on length and prefix
  if (cleaned.startsWith('385')) {
    // International format
    return '+' + cleaned;
  } else if (cleaned.startsWith('0')) {
    // Local format, convert to international
    return '+385' + cleaned.substring(1);
  } else if (cleaned.length === 8 || cleaned.length === 9) {
    // Assume it's local without leading 0
    return '+385' + cleaned;
  }

  // Return as-is if format is unclear
  return phone;
}

// Validate Croatian postal code
export function isValidCroatianPostalCode(postalCode: string): boolean {
  // Croatian postal codes are 5 digits, optionally prefixed with HR-
  const pattern = /^(HR-)?[0-9]{5}$/;
  return pattern.test(postalCode);
}

// Calculate distance between two points (Haversine formula)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Generate booking reference number
export function generateBookingReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `WU-${timestamp}-${random}`;
}

// Parse time slot string (HH:MM-HH:MM)
export function parseTimeSlot(timeSlot: string): { start: string; end: string } | null {
  const match = timeSlot.match(/^(\d{2}:\d{2})-(\d{2}:\d{2})$/);
  if (!match) return null;

  return {
    start: match[1],
    end: match[2]
  };
}

// Check if time slot overlaps
export function timeSlotsOverlap(slot1: string, slot2: string): boolean {
  const parsed1 = parseTimeSlot(slot1);
  const parsed2 = parseTimeSlot(slot2);

  if (!parsed1 || !parsed2) return false;

  // Convert to minutes for easier comparison
  const toMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const start1 = toMinutes(parsed1.start);
  const end1 = toMinutes(parsed1.end);
  const start2 = toMinutes(parsed2.start);
  const end2 = toMinutes(parsed2.end);

  return (start1 < end2) && (start2 < end1);
}

// Get business days between two dates
export function getBusinessDays(startDate: Date, endDate: Date): number {
  let count = 0;
  const current = new Date(startDate);

  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

// Croatian date formatter
export function formatCroatianDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('hr-HR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(d);
}

// Croatian time formatter
export function formatCroatianTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('hr-HR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
}

// Log API request (for monitoring)
export function logApiRequest(
  method: string,
  path: string,
  clientId: string,
  responseStatus: number,
  responseTime: number
): void {
  const log = {
    timestamp: new Date().toISOString(),
    method,
    path,
    client_id: clientId,
    status: responseStatus,
    response_time_ms: responseTime
  };

  // In production, send to logging service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to logging service
  } else {
    console.log('API Request:', log);
  }
}

// Middleware wrapper for API routes
export function withApiMiddleware(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options?: {
    rateLimit?: keyof typeof RATE_LIMITS;
    requireAuth?: boolean;
  }
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest) => {
    const startTime = Date.now();
    const clientId = getClientId(req);

    try {
      // Check rate limiting
      if (options?.rateLimit) {
        const { allowed, resetIn } = checkRateLimit(clientId, options.rateLimit);
        if (!allowed) {
          return rateLimitResponse(resetIn);
        }
      }

      // TODO: Add authentication check if required
      if (options?.requireAuth) {
        // Implement auth check
      }

      // Handle the request
      const response = await handler(req);

      // Log the request
      logApiRequest(
        req.method,
        req.url,
        clientId,
        response.status,
        Date.now() - startTime
      );

      return response;
    } catch (error) {
      // Log error and return error response
      logApiRequest(
        req.method,
        req.url,
        clientId,
        500,
        Date.now() - startTime
      );

      return handleApiError(error);
    }
  };
}