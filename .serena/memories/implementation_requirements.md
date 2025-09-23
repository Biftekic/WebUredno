# Uredno.eu Implementation Requirements

## Development Timeline: 20 Days

### Phase 0: Asset Collection (Before Dev)
**Required Assets:**
- Company logo (SVG/PNG)
- Hero image (clean living room/happy family)
- Team photo (3 teams in uniforms)
- 4 service photos (standard, deep, move-in/out, office)
- 4 before/after transformation sets
- 5-10 customer testimonials
- Google Service Account credentials
- PerfexCRM API credentials

### Phase 1: Project Setup (Days 1-2)
1. **Environment Setup**
   - Next.js 14 with TypeScript and App Router
   - Tailwind CSS + shadcn/ui components
   - Essential dependencies installation
   - Project structure creation

2. **Configuration**
   - Environment variables setup
   - Google Calendar API integration
   - WhatsApp Business API setup
   - SendGrid email configuration

### Phase 2: Core Development (Days 3-10)
1. **Homepage (Days 3-4)**
   - Hero section with booking CTA
   - Price calculator component
   - Services grid (4 cards)
   - How it works section
   - Coverage area map
   - Testimonials carousel
   - FAQ section

2. **Booking Flow (Days 5-7)**
   - Service selection step
   - Date/time picker with availability
   - Contact information form
   - WhatsApp confirmation integration
   - Price calculation logic

3. **API Development (Days 8-10)**
   - Price calculation endpoint
   - Availability checking (Google Calendar)
   - Booking submission
   - WhatsApp notification
   - Email backup system

### Phase 3: Croatian Content (Days 11-12)
- Implement 50+ FAQ questions
- Service checklists (60-75 points)
- Company policies and terms
- Trust badges and social proof
- SEO content for Zagreb areas

### Phase 4: Mobile Optimization (Days 13-14)
- Responsive design testing
- Touch targets optimization (44px min)
- Bottom navigation implementation
- Performance optimization
- Progressive Web App features

### Phase 5: Integration Testing (Days 15-17)
- Google Calendar sync testing
- WhatsApp notifications testing
- End-to-end booking flow
- Cross-browser testing
- Mobile device testing

### Phase 6: Deployment (Days 18-20)
- Vercel deployment setup
- Domain configuration (uredno.eu)
- SSL certificates
- Environment variables
- Production monitoring (Sentry)
- Google Analytics 4 setup

## Technical Requirements

### Performance Targets
- Lighthouse Score: >90
- Core Web Vitals:
  - LCP: <2.5s
  - FID: <100ms  
  - CLS: <0.1
- Mobile First: All features optimized for mobile

### Browser Support
- Chrome/Edge: Latest 2 versions
- Firefox: Latest version
- Safari: iOS 14+
- Mobile browsers: Chrome, Safari

### SEO Requirements
- Croatian language meta tags
- Schema.org structured data
- XML sitemap
- Robots.txt
- OpenGraph tags
- Local SEO optimization

### Security
- HTTPS everywhere
- Input validation and sanitization
- Rate limiting on APIs
- GDPR compliance
- Secure credential storage

## Complexity Analysis

### High Complexity Components
1. **Google Calendar Integration**: Real-time sync with 3 teams
2. **WhatsApp Business API**: Automated messaging
3. **Price Calculator**: Dynamic with distance calculation
4. **Availability System**: Holiday blocking, time slots

### Medium Complexity
1. **Booking flow**: Multi-step form with validation
2. **Coverage map**: Interactive Google Maps
3. **Email templates**: SendGrid integration
4. **Responsive design**: Mobile-first approach

### Low Complexity
1. **Static pages**: About, Contact
2. **FAQ section**: Expandable questions
3. **Service cards**: Display components
4. **Footer/Header**: Navigation components

## Risk Factors
- Google Calendar API quotas and rate limits
- WhatsApp Business API approval process
- Croatian content quality and SEO
- Mobile performance on low-end devices
- Third-party service reliability

## Dependencies
- Google Workspace account
- WhatsApp Business account
- SendGrid account
- Vercel account
- Domain registration (uredno.eu)
- SSL certificates
- PerfexCRM access