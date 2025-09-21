# IMPLEMENTATION ROADMAP - WebUredno
## Complete Development, Deployment & Mobile-First Guide
### Consolidation of IMPLEMENTATION_CHECKLIST.md + DEPLOYMENT_GUIDE.md + MOBILE_FIRST_REQUIREMENTS.md

---

## Table of Contents

1. [Mobile-First Requirements](#1-mobile-first-requirements)
2. [Implementation Checklist](#2-implementation-checklist)
3. [Deployment Guide](#3-deployment-guide)

---

# 1. Mobile-First Requirements

## 📱 Core Mobile-First Approach

### **Core Principle**
- **NO native app** - Responsive web only
- **Mobile-first design** - Design for mobile, adapt to desktop
- **Touch-optimized** - Large buttons, swipe gestures
- **Fast loading** - Under 3 seconds on 3G
- **Offline capability** - PWA with service workers

### **Mobile UI Requirements**
```
Breakpoints:
- Mobile: 320px - 768px (PRIMARY FOCUS)
- Tablet: 768px - 1024px
- Desktop: 1024px+

Touch Targets:
- Minimum button size: 44x44px
- Spacing between clickable elements: 8px minimum
- Thumb-friendly zones for CTAs

Performance:
- Lighthouse score: 90+ mobile
- First Contentful Paint: <1.5s
- Time to Interactive: <3.5s
```

### **Mobile-Specific Features**
- **One-thumb navigation** - Bottom nav bar
- **Sticky booking button** - Always visible CTA
- **Swipe calendar** - For date selection
- **Auto-detect location** - GPS for distance calculation
- **Click-to-call** - Direct WhatsApp/phone
- **Progressive disclosure** - Expandable sections
- **Mobile-optimized forms** - Auto-advance, smart keyboards

## ⏰ Arrival Time Windows

### **Time Window Display**
```typescript
interface ArrivalWindow {
  startTime: string;  // "09:00"
  endTime: string;    // "11:00"
  display: string;    // "Između 09:00 - 11:00"
  teamAssigned?: number; // Team 1, 2, or 3
}

// Available windows based on selected slot
TIME_WINDOWS = {
  '07:00': { display: 'Između 07:00 - 09:00' },
  '08:00': { display: 'Između 08:00 - 10:00' },
  '09:00': { display: 'Između 09:00 - 11:00' },
  '10:00': { display: 'Između 10:00 - 12:00' },
  '11:00': { display: 'Između 11:00 - 13:00' },
  '12:00': { display: 'Između 12:00 - 14:00' },
  '13:00': { display: 'Između 13:00 - 15:00' }
}
```

### **Customer Communication**
- **Booking confirmation**: "Vaš tim će stići između 09:00 - 11:00"
- **Day before reminder**: "Podsjećamo: sutra između 09:00 - 11:00"
- **Day of service**: "Tim kreće! Očekujte nas između 09:00 - 11:00"
- **30 min before**: "Stižemo za 30 minuta!"

### **Mobile Calendar View**
```
Morning Slots:
┌─────────────────────┐
│ 07:00 - 09:00  ✓   │ <- Available
│ 08:00 - 10:00  ✓   │
│ 09:00 - 11:00  ✗   │ <- Booked
└─────────────────────┘

Afternoon Slots:
┌─────────────────────┐
│ 11:00 - 13:00  ✓   │
│ 12:00 - 14:00  ✓   │
│ 13:00 - 15:00  ✓   │
└─────────────────────┘
```

## 🏗️ Post-Construction Cleaning

### **Service Definition**
```typescript
interface PostConstructionCleaning {
  name: 'Čišćenje nakon građevinskih radova';
  minPrice: 100; // EUR
  pricePerHour: 15;
  minimumTeams: 2; // Always 2 teams minimum
  minimumDuration: 6; // hours
  includesSupplies: true;
  specialEquipment: true; // Industrial vacuum, construction debris bags
}

// Pricing Matrix
CONSTRUCTION_CLEANING = {
  studio: { hours: 6, teams: 2, price: 180 },
  oneBed: { hours: 8, teams: 2, price: 240 },
  twoBed: { hours: 10, teams: 2, price: 300 },
  threeBed: { hours: 12, teams: 2, price: 360 },
  house: { hours: 16, teams: 2, price: 480 }
}
```

### **Construction Cleaning Checklist (90 points)**
- Window cleaning (inside and frames)
- Dust removal from all surfaces
- Paint splatter removal
- Floor deep cleaning
- Light fixture cleaning
- Outlet and switch cleaning
- Cabinet interior/exterior cleaning
- Appliance cleaning
- Debris removal
- Final sanitization

## 💰 Airbnb Special Pricing

### **Flexible Pricing Model**
```typescript
// Cijena se formira prema učestalosti čišćenja i veličini prostora
AIRBNB_PRICING_MODEL = {
  startingPrice: "od 25€",
  factors: {
    frequency: "Broj čišćenja mjesečno",
    size: "Veličina prostora (m²)",
    location: "Udaljenost od centra"
  },
  description: "Konačna cijena ovisi o učestalosti i veličini prostora"
}
```

### **Mobile Pricing Display**
```jsx
<div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-4 rounded-lg">
  <h3>🏠 Airbnb Čišćenje</h3>
  <p className="text-2xl font-bold">od 25€</p>
  <p className="text-sm">Cijena ovisi o učestalosti i veličini prostora</p>
  <button className="mt-2 text-white underline">Saznajte više</button>
</div>
```

## 🗺️ Zagreb Neighborhoods

### **Coverage Zones**
```typescript
const ZAGREB_ZONES = {
  zone1: {
    name: 'Centar',
    neighborhoods: ['Donji grad', 'Gornji grad', 'Medveščak', 'Maksimir'],
    fee: 0
  },
  zone2: {
    name: 'Široki centar',
    neighborhoods: ['Trešnjevka', 'Črnomerec', 'Martinovka', 'Jarun', 'Trnje'],
    fee: 0
  },
  zone3: {
    name: 'Periferija',
    neighborhoods: ['Dubrava', 'Sesvete', 'Podsused', 'Stenjevec'],
    fee: 0
  },
  zone4: {
    name: 'Okolica',
    neighborhoods: ['Velika Gorica', 'Zaprešić', 'Samobor', 'Sveta Nedelja'],
    fee: 10 // per person
  }
}
```

### **Interactive Map Component**
```jsx
<GoogleMap
  center={{ lat: 45.815, lng: 15.981 }}
  zoom={11}
  options={{
    gestureHandling: 'greedy', // Mobile-friendly
    fullscreenControl: false,
    streetViewControl: false
  }}
>
  {zones.map(zone => (
    <Polygon
      paths={zone.coordinates}
      options={{
        fillColor: zone.fee === 0 ? '#10b981' : '#fbbf24',
        fillOpacity: 0.35,
        strokeColor: '#2563eb',
        strokeWeight: 2
      }}
    />
  ))}
</GoogleMap>
```

## ⚡ Emergency Service

### **Implementation**
```typescript
interface EmergencyService {
  available: boolean;
  surcharge: 30; // percentage
  conditions: {
    sameDay: true;
    weekend: true;
    afterHours: false; // Still within 07:00-15:00
    holiday: false; // No holiday service
  };
  minimumNotice: 2; // hours
  displayBadge: '🚨 HITNO';
}

// Emergency pricing calculation
function calculateEmergencyPrice(basePrice: number): number {
  return Math.round(basePrice * 1.3); // 30% surcharge
}
```

### **Mobile Emergency Button**
```jsx
<button className="fixed bottom-20 right-4 bg-red-600 text-white p-4 rounded-full shadow-lg animate-pulse">
  <Phone className="h-6 w-6" />
  <span className="sr-only">Hitna usluga</span>
</button>
```

## 🏢 Corporate Client Features

### **Corporate Benefits Display**
```typescript
const CORPORATE_BENEFITS = {
  pricing: 'Posebni uvjeti',
  billing: 'R1 računi',
  scheduling: 'Prioritetno zakazivanje',
  teams: 'Isti tim svaki put',
  support: 'Dedicated account manager'
};
```

### **Mobile Corporate Section**
```jsx
<div className="bg-gray-900 text-white p-6 rounded-lg">
  <h3>Za poslovne klijente</h3>
  <div className="grid grid-cols-2 gap-4 mt-4">
    <div className="flex items-center">
      <Building className="h-5 w-5 mr-2" />
      <span>R1 računi</span>
    </div>
    <div className="flex items-center">
      <Calendar className="h-5 w-5 mr-2" />
      <span>Fleksibilno</span>
    </div>
  </div>
  <button className="mt-4 w-full bg-white text-gray-900 rounded-lg py-3">
    Kontaktirajte nas
  </button>
</div>
```

## 📊 Real-Time Availability

### **Live Team Status**
```typescript
interface TeamAvailability {
  date: string;
  timeSlot: string;
  teams: {
    team1: boolean;
    team2: boolean;
    team3: boolean;
  };
  availableCount: number;
  displayStatus: 'Dostupno' | 'Ograničeno' | 'Zauzeto';
  color: 'green' | 'yellow' | 'red';
}
```

### **Mobile Availability Widget**
```jsx
<div className="flex justify-between items-center p-3 border rounded-lg">
  <div>
    <p className="font-medium">09:00 - 11:00</p>
    <p className="text-sm text-gray-600">
      {availableCount}/3 timova dostupno
    </p>
  </div>
  <div className={`px-3 py-1 rounded-full ${
    availableCount > 1 ? 'bg-green-100 text-green-700' :
    availableCount === 1 ? 'bg-yellow-100 text-yellow-700' :
    'bg-red-100 text-red-700'
  }`}>
    {displayStatus}
  </div>
</div>
```

---

# 2. Implementation Checklist

## 📸 Phase 0: Asset Collection (Before Development)

### Photos Required (Priority Order)

#### Essential Photos (Must Have)
- [ ] **Hero Image**: Clean, bright living room or happy family
- [ ] **Team Photo**: 3 teams in uniforms (or at least 3 people)
- [ ] **Service Photos** (4):
  - [ ] Standard cleaning action shot
  - [ ] Deep cleaning detail (scrubbing grout)
  - [ ] Empty apartment (move-in/out)
  - [ ] Office cleaning scene
- [ ] **Before/After** (minimum 4 sets):
  - [ ] Kitchen transformation
  - [ ] Bathroom transformation
  - [ ] Living room transformation
  - [ ] Bedroom transformation

#### Nice to Have
- [ ] Equipment/supplies photo
- [ ] Customer testimonial photos (5+)
- [ ] Individual team member portraits
- [ ] Zagreb landmarks for area pages

### Content Required
- [ ] **Company Logo** (SVG preferred, PNG backup)
- [ ] **Customer Testimonials** (minimum 5, ideally 10)
  - Name, area, service used, review text, star rating
- [ ] **Company Registration Details**:
  - Official business name
  - OIB (VAT number)
  - Insurance policy details
- [ ] **Google Service Account** credentials for Calendar API
- [ ] **PerfexCRM** API credentials

## 🚀 Phase 1: Project Setup (Day 1-2)

### Development Environment
```bash
# 1. Create Next.js project
npx create-next-app@latest weburedno --typescript --tailwind --app

# 2. Install core dependencies
npm install @radix-ui/react-[components] # shadcn/ui base
npm install framer-motion # animations
npm install react-hook-form zod # forms
npm install @react-google-maps/api # map
npm install lucide-react # icons
npm install date-fns # date handling
npm install clsx tailwind-merge # utilities

# 3. Install API dependencies
npm install googleapis # Google Calendar
npm install axios # HTTP requests
npm install @sendgrid/mail # email backup

# 4. Setup shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input select calendar dialog
```

### File Structure Setup
```
/weburedno
├── /app
│   ├── /(marketing)
│   │   ├── page.tsx              # Homepage
│   │   ├── ciscenje-zagreb/      # SEO pages
│   │   ├── o-nama/page.tsx       # About
│   │   └── kontakt/page.tsx      # Contact
│   ├── /rezervacija
│   │   ├── page.tsx              # Booking flow
│   │   └── potvrda/page.tsx      # Confirmation
│   ├── /api
│   │   ├── availability/route.ts # Calendar check
│   │   ├── booking/route.ts      # Submit booking
│   │   └── price/route.ts        # Calculate price
│   └── layout.tsx                # Root layout
├── /components
│   ├── /ui                       # shadcn components
│   ├── /sections                 # Page sections
│   └── /booking                  # Booking components
└── /lib
    ├── /utils                    # Helpers
    └── /constants               # Config
```

## 💻 Phase 2: Core Development (Day 3-10)

### Week 1 Tasks

#### Day 3-4: Homepage
- [ ] Setup Next.js project structure
- [ ] Install and configure shadcn/ui
- [ ] Create responsive navigation
- [ ] Build hero section with CTA
- [ ] Implement service cards grid
- [ ] Add "How it works" section
- [ ] Create footer with links

#### Day 5-6: Booking Flow - Step 1
- [ ] Service selection interface
- [ ] Size/room selector
- [ ] Extras checkboxes
- [ ] Price calculation logic
- [ ] Real-time price display
- [ ] Form validation

#### Day 7-8: Booking Flow - Step 2 & 3
- [ ] Calendar component (mobile-optimized)
- [ ] Time slot selector
- [ ] Availability checking (mock data)
- [ ] Contact form fields
- [ ] Payment method selector
- [ ] Form summary review

#### Day 9-10: API Integration
- [ ] Google Calendar service setup
- [ ] Availability checking endpoint
- [ ] Price calculation endpoint
- [ ] Booking submission endpoint
- [ ] WhatsApp link generation
- [ ] Error handling

### Week 2 Tasks

#### Day 11-12: Mobile Optimization
- [ ] Touch gesture optimization
- [ ] Bottom navigation bar
- [ ] Sticky CTA button
- [ ] Form field optimization
- [ ] Loading states
- [ ] Offline message

#### Day 13-14: Additional Pages
- [ ] Service detail pages (6)
- [ ] About us page
- [ ] Contact page
- [ ] FAQ section
- [ ] Privacy policy
- [ ] Terms of service

#### Day 15-16: Trust & Social Proof
- [ ] Testimonials carousel
- [ ] Trust badges
- [ ] Before/after gallery
- [ ] Coverage area map
- [ ] Corporate clients section
- [ ] Statistics counters

## 🔌 Phase 3: Integrations (Day 17-20)

### Google Calendar Setup
- [ ] Create service account
- [ ] Generate API credentials
- [ ] Share calendar with service account
- [ ] Test read permissions
- [ ] Test write permissions
- [ ] Implement real availability checking

### WhatsApp Integration
- [ ] Verify business account
- [ ] Create message templates
- [ ] Test Click-to-WhatsApp links
- [ ] Mobile app detection
- [ ] Desktop fallback

### Email Backup System
- [ ] SendGrid account setup
- [ ] Email templates (3)
- [ ] Booking confirmation
- [ ] Admin notification
- [ ] 24h reminder

### Analytics & Tracking
- [ ] Google Analytics 4 setup
- [ ] Event tracking implementation
- [ ] Conversion goals
- [ ] Testing with GA Debug

## 🧪 Phase 4: Testing & Optimization (Day 21-25)

### Functionality Testing
- [ ] Complete booking flow (10 test bookings)
- [ ] All form validations
- [ ] API error handling
- [ ] Calendar integration
- [ ] WhatsApp redirection
- [ ] Email delivery

### Performance Testing
- [ ] Lighthouse audit (target: 90+)
- [ ] Mobile page speed
- [ ] Image optimization
- [ ] Code splitting
- [ ] Bundle size analysis

### Browser Testing
- [ ] Chrome (mobile & desktop)
- [ ] Safari (mobile & desktop)
- [ ] Firefox
- [ ] Edge
- [ ] Samsung Internet

### Device Testing
- [ ] iPhone (various models)
- [ ] Android phones
- [ ] iPads
- [ ] Android tablets
- [ ] Desktop (various resolutions)

## 🚀 Phase 5: Launch Preparation (Day 26-28)

### Content Population
- [ ] Upload all images
- [ ] Add testimonials
- [ ] Write meta descriptions
- [ ] Create sitemap.xml
- [ ] Setup robots.txt
- [ ] Favicon and app icons

### SEO Setup
- [ ] Page titles optimization
- [ ] Meta descriptions
- [ ] Open Graph tags
- [ ] Schema markup
- [ ] Google Search Console submission

### Final Checklist
- [ ] All environment variables set
- [ ] SSL certificate active
- [ ] Forms tested with real data
- [ ] WhatsApp number verified
- [ ] Backup systems tested
- [ ] Error tracking enabled

---

# 3. Deployment Guide

## 1. Pre-Deployment Checklist

### Environment Setup
- [ ] Vercel account created and verified
- [ ] Domain (uredno.eu) DNS access ready
- [ ] Google Cloud Console account for Calendar API
- [ ] WhatsApp Business account verified
- [ ] SSL certificate (automatic with Vercel)
- [ ] Environment variables prepared

### Content & Assets
- [ ] All images optimized and uploaded
- [ ] Logo files in SVG and PNG formats
- [ ] Testimonials content ready
- [ ] Legal pages written (Privacy, Terms)
- [ ] SEO metadata prepared
- [ ] Favicon and app icons created

### Testing Complete
- [ ] All forms tested
- [ ] Calendar integration verified
- [ ] WhatsApp links working
- [ ] Mobile responsive tested
- [ ] Cross-browser compatibility confirmed
- [ ] Performance optimized (>90 Lighthouse)

## 2. Vercel Deployment Setup

### Step 1: Initialize Project
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Initialize project
vercel init weburedno
```

### Step 2: Configure vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["fra1"],
  "functions": {
    "app/api/availability/route.ts": {
      "maxDuration": 10
    },
    "app/api/booking/route.ts": {
      "maxDuration": 10
    },
    "app/api/price/route.ts": {
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/sitemap.xml",
      "destination": "/api/sitemap"
    }
  ],
  "redirects": [
    {
      "source": "/booking",
      "destination": "/rezervacija",
      "permanent": true
    }
  ]
}
```

### Step 3: Environment Variables Setup

```bash
# In Vercel Dashboard > Project Settings > Environment Variables

# Production Variables
NEXT_PUBLIC_SITE_URL=https://uredno.eu
NEXT_PUBLIC_WHATSAPP_PHONE=385924502265

# Google Calendar (Secret)
GOOGLE_CALENDAR_ID=02ff9b19d12ca44fda1dc9d4f6b628aa30663578b36f6c403d6f1b81e74e2664@group.calendar.google.com
GOOGLE_SERVICE_ACCOUNT_EMAIL=weburedno@PROJECT_ID.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# SendGrid (Secret)
SENDGRID_API_KEY=SG.xxxxxxxxxxxx
SENDGRID_FROM_EMAIL=info@uredno.eu

# Analytics (Public)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## 3. Google Calendar API Setup

### Step 1: Create Service Account
```bash
# 1. Go to Google Cloud Console
https://console.cloud.google.com

# 2. Create new project
Project name: WebUredno
Project ID: weburedno-2025

# 3. Enable Google Calendar API
APIs & Services > Library > "Google Calendar API" > Enable

# 4. Create Service Account
APIs & Services > Credentials > Create Credentials > Service Account

Service account name: weburedno-calendar
Service account ID: weburedno-calendar
Role: Project > Editor

# 5. Create Key
Click on created service account
Keys > Add Key > Create new key > JSON
Download and save securely
```

### Step 2: Share Calendar
```
1. Open Google Calendar (business account)
2. Settings > Settings for my calendars
3. Find WebUredno calendar
4. Share with specific people
5. Add: weburedno-calendar@weburedno-2025.iam.gserviceaccount.com
6. Permission: Make changes to events
7. Send invitation
```

### Step 3: Test Connection
```typescript
// test-calendar.js
const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: './service-account-key.json',
  scopes: ['https://www.googleapis.com/auth/calendar'],
});

const calendar = google.calendar({ version: 'v3', auth });

async function testConnection() {
  try {
    const response = await calendar.events.list({
      calendarId: 'YOUR_CALENDAR_ID',
      timeMin: new Date().toISOString(),
      maxResults: 10,
    });
    console.log('Success! Events:', response.data.items);
  } catch (error) {
    console.error('Error:', error);
  }
}

testConnection();
```

## 4. Domain Configuration

### Step 1: DNS Settings
```
# Add to DNS Provider (uredno.eu)

Type    Name    Value                   TTL
A       @       76.76.21.21            3600
CNAME   www     cname.vercel-dns.com   3600
```

### Step 2: Vercel Domain Setup
```bash
# Add domain in Vercel Dashboard
Project Settings > Domains > Add Domain
Enter: uredno.eu
Enter: www.uredno.eu

# Verify DNS propagation
nslookup uredno.eu
```

### Step 3: SSL Certificate
```
# Automatic with Vercel
- Certificate issued by Let's Encrypt
- Auto-renewal enabled
- Force HTTPS enabled
```

## 5. Production Deployment

### Step 1: Build Locally
```bash
# Test production build
npm run build

# Check for errors
npm run start

# Run Lighthouse audit
npx lighthouse http://localhost:3000 --view
```

### Step 2: Deploy to Vercel
```bash
# Deploy to production
vercel --prod

# Or via Git
git push origin main
```

### Step 3: Verify Deployment
```
✓ Homepage loads
✓ Booking flow works
✓ Calendar integration active
✓ WhatsApp links work
✓ Forms submit successfully
✓ Mobile responsive
✓ SSL certificate active
```

## 6. Post-Deployment Tasks

### Monitoring Setup
```bash
# Vercel Analytics (automatic)
- Real User Monitoring
- Web Vitals tracking
- Error tracking

# Google Analytics 4
- Verify installation
- Test events firing
- Check real-time data
```

### SEO Submission
```
1. Google Search Console
   - Add property: uredno.eu
   - Verify ownership
   - Submit sitemap.xml
   - Request indexing

2. Bing Webmaster Tools
   - Add site
   - Verify ownership
   - Submit sitemap

3. Local SEO
   - Google My Business
   - Bing Places
   - Local directories
```

### Performance Monitoring
```javascript
// Add to _app.tsx
export function reportWebVitals(metric) {
  if (metric.label === 'web-vital') {
    console.log(metric);
    // Send to analytics
    gtag('event', metric.name, {
      value: Math.round(metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  }
}
```

## 7. Rollback Plan

### If Issues Occur
```bash
# Instant rollback in Vercel
Dashboard > Deployments > [Previous deployment] > Promote to Production

# Or via CLI
vercel rollback

# Check deployment history
vercel list
```

### Backup Strategy
```
1. Database: Daily automated backups (if using)
2. Code: Git repository (GitHub/GitLab)
3. Assets: CDN cached + local backup
4. Configurations: Environment variables documented
```

## 8. Maintenance Mode

### Quick Maintenance Page
```typescript
// app/maintenance/page.tsx
export default function Maintenance() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-8">
        <h1 className="text-3xl font-bold mb-4">
          Održavanje u tijeku
        </h1>
        <p className="text-gray-600 mb-8">
          Vraćamo se za nekoliko minuta.
        </p>
        <a
          href="https://wa.me/385924502265"
          className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg"
        >
          Kontaktirajte nas na WhatsApp
        </a>
      </div>
    </div>
  );
}
```

### Enable Maintenance Mode
```javascript
// middleware.ts
export function middleware(request) {
  const maintenanceMode = process.env.MAINTENANCE_MODE === 'true';

  if (maintenanceMode && !request.nextUrl.pathname.startsWith('/maintenance')) {
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }
}
```

## 9. Production Checklist

### Week 1 Post-Launch
- [ ] Monitor error logs daily
- [ ] Check booking submissions
- [ ] Verify calendar sync
- [ ] Review page load times
- [ ] Check mobile experience
- [ ] Respond to user feedback
- [ ] Fix critical bugs immediately

### Month 1 Metrics
- [ ] Total visitors
- [ ] Booking conversion rate
- [ ] Average session duration
- [ ] Bounce rate
- [ ] Page load speed
- [ ] Error rate
- [ ] Customer feedback score

## 10. Troubleshooting Guide

### Common Issues & Solutions

#### Calendar Not Syncing
```bash
# Check service account permissions
# Verify calendar ID is correct
# Check API quota limits
# Review error logs in Vercel Functions
```

#### WhatsApp Links Not Working
```javascript
// Test different formats
const formats = [
  'https://wa.me/385924502265',
  'https://api.whatsapp.com/send?phone=385924502265',
  'whatsapp://send?phone=385924502265'
];
```

#### Slow Performance
```bash
# Check bundle size
npm run analyze

# Optimize images
npm install next-optimized-images

# Enable caching
Cache-Control: public, max-age=31536000, immutable
```

#### Form Submission Errors
```javascript
// Add detailed logging
try {
  // submission code
} catch (error) {
  console.error('Form submission error:', {
    error: error.message,
    stack: error.stack,
    data: formData
  });
  // Send to error tracking service
}
```

---

## 📋 Final Launch Countdown

### T-7 Days
- [ ] Final content review
- [ ] Complete testing on all devices
- [ ] Backup everything
- [ ] Prepare launch announcement

### T-3 Days
- [ ] Final performance optimization
- [ ] Security audit
- [ ] DNS pre-configuration
- [ ] Team briefing

### T-1 Day
- [ ] Final backup
- [ ] Clear cache
- [ ] Test emergency procedures
- [ ] Prepare monitoring dashboards

### Launch Day
- [ ] Deploy to production
- [ ] Verify all systems
- [ ] Monitor real-time
- [ ] Be ready for quick fixes

### T+1 Day
- [ ] Review analytics
- [ ] Address any issues
- [ ] Gather team feedback
- [ ] Plan improvements

---

*Implementation Roadmap v1.0*
*Mobile-First Development*
*Ready for Production*
*Last Updated: January 2025*