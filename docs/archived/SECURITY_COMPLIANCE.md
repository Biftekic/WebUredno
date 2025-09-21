# Security & Compliance - WebUredno Platform

## Executive Summary

**Security Status**: 🔴 **CRITICAL GAPS IDENTIFIED**
**GDPR Compliance**: 🔴 **NON-COMPLIANT**
**Production Readiness**: ❌ **BLOCKED - DO NOT DEPLOY**

### Critical Issues Requiring Immediate Attention
1. **No Authentication System** - Creates massive vulnerability
2. **GDPR Non-compliance** - Risks significant fines
3. **Incomplete Security Implementation** - Gaps between documentation and code
4. **Missing Cookie Consent** - GDPR violation from day one

---

## 🚨 Priority 1: Critical Security Fixes (MUST IMPLEMENT IMMEDIATELY)

### 1.1 Admin Authentication System

```typescript
// middleware/adminAuth.ts
export async function adminAuthMiddleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Admin Area"' }
      });
    }

    // Verify credentials with bcrypt
    const validPassword = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    if (!validPassword) {
      await logFailedAdminAttempt(request);
      return new NextResponse('Unauthorized', { status: 403 });
    }
  }
  return NextResponse.next();
}
```

### 1.2 Booking Verification System

```typescript
// lib/bookingVerification.ts
export class BookingVerification {
  static generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static generateBookingReference(): string {
    const date = new Date();
    const year = date.getFullYear();
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `WU${year}-${random}`;
  }

  static async sendVerificationEmail(email: string, bookingRef: string, token: string) {
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/booking/verify?ref=${bookingRef}&token=${token}`;
    // Send verification email with link
  }
}
```

### 1.3 Complete CSRF Protection

```typescript
// lib/csrf.ts
export class CSRFProtection {
  static generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  static async validateToken(token: string): Promise<boolean> {
    const storedToken = getCookie('csrf-token');
    return crypto.timingSafeEqual(
      Buffer.from(storedToken),
      Buffer.from(token)
    );
  }
}
```

### 1.4 Complete Security Headers

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://www.google-analytics.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  return response;
}
```

---

## 🔐 Priority 2: GDPR Compliance Implementation

### 2.1 Cookie Consent Banner (CRITICAL)

```typescript
// components/gdpr/CookieConsent.tsx
export const CookieConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false
  });

  const acceptAll = () => {
    const fullConsent = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    saveConsent(fullConsent);
    enableCookies(fullConsent);
    setShowBanner(false);
  };

  const rejectAll = () => {
    const minimalConsent = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    saveConsent(minimalConsent);
    disableNonEssentialCookies();
    setShowBanner(false);
  };

  // Banner UI with granular controls
};
```

### 2.2 Data Subject Rights Portal

```typescript
// app/gdpr/page.tsx
export default function GDPRPortal() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Vaši Podaci i Prava</h1>

      <div className="grid gap-6">
        <DataRightCard
          title="Pravo na pristup"
          description="Zatražite kopiju svih vaših osobnih podataka"
          action="Zatraži podatke"
          endpoint="/api/gdpr/export"
        />
        <DataRightCard
          title="Pravo na brisanje"
          description="Zatražite brisanje vaših osobnih podataka"
          action="Obriši podatke"
          endpoint="/api/gdpr/delete"
          requiresConfirmation={true}
        />
        // Additional data rights...
      </div>
    </div>
  );
}
```

### 2.3 Privacy Policy Implementation

**Required Privacy Policy Sections**:
1. **Data Controller Information**: WebUredno d.o.o. contact details
2. **Data Processing Purposes**: Service delivery, communication, legal compliance
3. **Legal Basis**: Contract, consent, legitimate interest, legal obligation
4. **Data Retention**: 2 years for bookings, 7 years for invoices
5. **Data Subject Rights**: All 8 GDPR rights with contact information
6. **Third-Party Data Sharing**: Google Calendar, email providers
7. **International Transfers**: Adequate protection measures
8. **Contact Information**: privacy@weburedno.hr for questions

### 2.4 Data Retention Automation

```typescript
// services/dataRetention.ts
export class DataRetentionService {
  private static readonly RETENTION_PERIODS = {
    bookings: 730,     // 2 years
    inquiries: 365,    // 1 year
    logs: 90,         // 90 days
    sessions: 30,     // 30 days
    marketing: 365    // 1 year
  };

  static async runDailyCleanup(): Promise<void> {
    for (const [table, days] of Object.entries(this.RETENTION_PERIODS)) {
      await this.cleanupTable(table, days);
    }
    await this.logCleanupRun();
  }

  private static async cleanupTable(table: string, retentionDays: number) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await db(table)
      .where('created_at', '<', cutoffDate)
      .del();

    await this.logCleanup(table, result, cutoffDate);
  }
}
```

---

## 🛡️ Security Implementation Standards

### Input Validation & Sanitization
✅ **Implemented**: Zod schema validation
✅ **Implemented**: HTML escaping functions
✅ **Implemented**: SQL injection prevention through parameterized queries
⚠️ **Missing**: File upload validation
⚠️ **Missing**: API rate limiting bypass protection

### Authentication & Authorization
🔴 **Critical Gap**: No authentication system
🔴 **Critical Gap**: No booking ownership verification
🔴 **Critical Gap**: No admin panel access control

**Required Implementation**:
- Admin authentication with bcrypt password hashing
- Booking verification via email tokens
- Session management for authenticated users
- Role-based access control for future features

### API Security
⚠️ **Partial**: Rate limiting (basic implementation only)
⚠️ **Partial**: CSRF protection (documented but not fully implemented)
❌ **Missing**: API versioning strategy
❌ **Missing**: Request signature validation

### Infrastructure Security
⚠️ **Partial**: Environment variable management
❌ **Missing**: Secret rotation automation
❌ **Missing**: Container security scanning
❌ **Missing**: Dependency vulnerability monitoring

---

## 📋 Legal & Compliance Requirements

### GDPR Compliance Checklist

#### Data Processing Fundamentals
- [ ] **Lawful Basis**: Document lawful basis for all processing activities
- [ ] **Privacy Policy**: Comprehensive policy in Croatian language
- [ ] **Consent Management**: Granular cookie consent system
- [ ] **Data Subject Rights**: All 8 GDPR rights implemented
- [ ] **Data Minimization**: Collect only necessary data
- [ ] **Purpose Limitation**: Use data only for stated purposes

#### Technical Implementation
- [ ] **Cookie Consent Banner**: Deployed before any tracking
- [ ] **Privacy Policy Page**: Linked from all pages
- [ ] **Data Export API**: Allow users to download their data
- [ ] **Data Deletion API**: Automated data erasure
- [ ] **Consent Tracking**: Database records of all consents
- [ ] **Data Retention**: Automated deletion after retention periods

#### Compliance Documentation
- [ ] **Data Processing Register**: Document all processing activities
- [ ] **Data Protection Impact Assessment**: Evaluate privacy risks
- [ ] **Data Processing Agreements**: Contracts with third-party processors
- [ ] **Breach Notification Procedure**: 72-hour notification process
- [ ] **Staff Training**: GDPR awareness for all team members

### Croatian Legal Requirements
- [ ] **Consumer Protection**: Comply with Croatian consumer laws
- [ ] **Electronic Commerce**: Follow e-commerce regulations
- [ ] **Tax Compliance**: Implement fiscal requirements
- [ ] **Business Registration**: Complete company registration
- [ ] **Insurance Coverage**: General liability and professional indemnity

---

## 🎯 Implementation Roadmap

### Phase 1: Critical Security (Week 1)
**BLOCKING PRODUCTION LAUNCH**
- [ ] Implement admin authentication middleware
- [ ] Add booking verification system
- [ ] Deploy complete security headers
- [ ] Implement full CSRF protection
- [ ] Add comprehensive rate limiting

### Phase 2: GDPR Compliance (Week 2)
**REQUIRED FOR EU OPERATIONS**
- [ ] Deploy cookie consent banner
- [ ] Create privacy policy page
- [ ] Implement data export API
- [ ] Add data deletion functionality
- [ ] Setup consent tracking database

### Phase 3: Advanced Security (Week 3-4)
**OPERATIONAL EXCELLENCE**
- [ ] Implement security event logging
- [ ] Add intrusion detection
- [ ] Setup automated security alerts
- [ ] Create security monitoring dashboard
- [ ] Implement secret rotation

### Phase 4: Compliance Automation (Week 5-6)
**LONG-TERM SUSTAINABILITY**
- [ ] Automated data retention
- [ ] GDPR request processing
- [ ] Compliance reporting
- [ ] Regular security audits
- [ ] Staff training programs

---

## 🚨 Critical Action Items

### IMMEDIATE (DO NOT DEPLOY WITHOUT)
1. **Implement Admin Authentication** - Prevents unauthorized access
2. **Add Cookie Consent Banner** - GDPR compliance from day one
3. **Deploy Security Headers** - Basic protection against common attacks
4. **Add Booking Verification** - Prevents booking manipulation

### URGENT (Complete within 48 hours)
1. **Create Privacy Policy** - Legal requirement for data processing
2. **Implement Data Export** - Required for GDPR Article 20
3. **Add Security Monitoring** - Detect and respond to threats
4. **Setup Error Tracking** - Monitor application security

### HIGH PRIORITY (Complete within 1 week)
1. **Automated Data Retention** - GDPR compliance automation
2. **Security Testing** - Vulnerability assessment
3. **Incident Response Plan** - Prepare for security events
4. **Team Training** - Security awareness

---

## 🔍 Security Validation

### Pre-Launch Security Checklist
```bash
#!/bin/bash
# Security validation script

echo "🔒 Security Pre-Launch Checklist"

# Check environment variables
[ -z "$ADMIN_PASSWORD_HASH" ] && echo "❌ Admin password not set" || echo "✅ Admin auth configured"

# Check HTTPS enforcement
[ "$NODE_ENV" = "production" ] && echo "✅ Production mode" || echo "⚠️ Development mode"

# Check security headers
curl -s -I https://weburedno.hr | grep -q "Content-Security-Policy" && echo "✅ CSP deployed" || echo "❌ CSP missing"

# Check GDPR compliance
curl -s https://weburedno.hr | grep -q "cookie" && echo "✅ Cookie consent" || echo "❌ No cookie consent"
```

### Security Metrics Dashboard
- **Authentication Success Rate**: >99%
- **CSRF Attack Prevention**: 100% blocked
- **Rate Limit Effectiveness**: <1% false positives
- **GDPR Request Response Time**: <72 hours
- **Security Alert Response**: <15 minutes

---

## 📞 Security Contact & Escalation

### Security Team Contacts
- **Security Lead**: security@weburedno.hr
- **Privacy Officer**: privacy@weburedno.hr
- **Emergency Contact**: +385 92 450 2265

### Incident Response
1. **Detect**: Automated monitoring and manual reports
2. **Assess**: Severity classification and impact assessment
3. **Contain**: Immediate threat containment
4. **Investigate**: Root cause analysis
5. **Recover**: Service restoration and validation
6. **Learn**: Post-incident review and improvements

### Regulatory Contacts
- **Croatian DPA**: Agencija za zaštitu osobnih podataka (azop.hr)
- **Emergency Notification**: 72 hours for data breaches
- **Legal Counsel**: For significant security incidents

---

**FINAL WARNING**: Current implementation poses significant security and compliance risks. DO NOT DEPLOY TO PRODUCTION until at least Phase 1 and Phase 2 security implementations are completed and validated.