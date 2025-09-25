# Mobile Bottom Navigation Design

## Overview
Implementation of a mobile bottom navigation bar using shadcn/ui components for better mobile UX on the WebUredno cleaning services website.

## Current Analysis

### Existing Navigation
- **Location**: Top header with hamburger menu
- **Type**: Slide-down overlay menu for mobile
- **Items**: Početna, Usluge, Cjenik, O nama, Kontakt
- **Issues**:
  - Requires reaching to top of screen
  - Not always visible when scrolling
  - Takes full screen when opened

### Existing Components
- Custom Button component (compatible with shadcn patterns)
- No existing shadcn navigation components installed
- Using Radix UI primitives (@radix-ui/react-slot, @radix-ui/react-dialog)
- Framer Motion for animations
- Lucide React for icons

## Design Specification

### Component Structure
```
MobileBottomNav
├── Navigation Container (fixed bottom)
├── Nav Items (5 items max for mobile)
│   ├── Home (Početna)
│   ├── Services (Usluge)
│   ├── Booking (Rezerviraj) - Primary CTA
│   ├── Pricing (Cjenik)
│   └── Contact (Kontakt)
└── Active State Indicator
```

### Visual Design

#### Container
- **Position**: Fixed bottom, full width
- **Height**: 56-64px
- **Background**: White with subtle shadow/border
- **Z-index**: 40 (below header at 50)
- **Display**: Only on mobile (< 768px)

#### Navigation Items
- **Layout**: Flex, equal spacing
- **Max Items**: 5 (optimal for mobile)
- **Item Structure**:
  ```
  [Icon]
  [Label]
  ```
- **Icons**: Lucide React icons
  - Home → Home
  - Services → Briefcase
  - Book → Calendar/CalendarCheck
  - Pricing → Euro
  - Contact → Phone

#### States
- **Default**: Gray-600 text and icons
- **Active**: Green-600 with background highlight
- **Hover/Press**: Scale animation (0.95)

### Behavior

#### Visibility
- **Show**: Screen width < 768px
- **Hide**: Screen width >= 768px (desktop)
- **Special Cases**:
  - Hide on keyboard open (input focus)
  - Add padding-bottom to page content

#### Interactions
- **Tap**: Navigate to page
- **Active State**: Highlight current page
- **Booking Button**: Special styling (primary color)
- **Smooth Transitions**: Using framer-motion

## Implementation Plan

### Phase 1: Setup & Dependencies
1. ✅ Already have necessary Radix UI primitives
2. ✅ Have framer-motion for animations
3. ✅ Have lucide-react for icons
4. Need to install shadcn/ui navigation if needed (optional)

### Phase 2: Component Development
1. Create `MobileBottomNav.tsx` component
2. Implement responsive visibility logic
3. Add route detection for active states
4. Integrate with existing routing

### Phase 3: Integration
1. Add to main layout
2. Adjust page padding for nav height
3. Update Header component to work with bottom nav
4. Test on various mobile devices

### Phase 4: Enhancements
1. Add haptic feedback (vibration API)
2. Implement badge notifications (optional)
3. Add accessibility features (ARIA labels)
4. Optimize performance

## Technical Specifications

### Component Props
```typescript
interface MobileBottomNavProps {
  className?: string;
  hideOnKeyboard?: boolean;
}
```

### Navigation Items Type
```typescript
interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  isSpecial?: boolean; // For CTA styling
}
```

### Key Features
- Route-aware active states using Next.js `usePathname`
- Responsive design with Tailwind breakpoints
- Smooth animations with Framer Motion
- Accessibility compliant (ARIA labels, keyboard navigation)
- Performance optimized (memo, lazy loading)

## File Structure
```
components/
├── layout/
│   ├── Header.tsx (existing)
│   └── MobileBottomNav.tsx (new)
└── ui/
    └── navigation.tsx (optional shadcn component)
```

## Styling Approach
- Use existing Tailwind classes
- Maintain consistency with current design system
- Green-600 for primary actions (matches brand)
- Gray scale for inactive states

## Performance Considerations
- Use CSS transforms for animations (GPU accelerated)
- Lazy load icons if needed
- Memoize navigation items
- Use Next.js Link for prefetching

## Accessibility
- ARIA labels for screen readers
- Keyboard navigation support
- Focus indicators
- Proper semantic HTML (nav, ul, li)

## Testing Requirements
- Mobile devices (iOS Safari, Chrome Android)
- Various screen sizes (320px - 768px)
- Keyboard interaction
- Screen readers
- Performance metrics (Lighthouse)

## Success Metrics
- Improved mobile navigation accessibility
- Reduced hamburger menu usage
- Faster navigation between pages
- Better user engagement on mobile