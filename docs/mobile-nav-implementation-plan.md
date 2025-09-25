# Mobile Bottom Navigation - Implementation Plan

## Summary
We'll implement a mobile bottom navigation bar that provides quick access to main pages, improving mobile UX by keeping navigation controls within thumb reach.

## What We Have
✅ **Dependencies Ready**:
- Framer Motion (animations)
- Lucide React (icons)
- Radix UI primitives
- Tailwind CSS
- Next.js routing

✅ **Existing Components**:
- Header with mobile menu
- Button component
- Logo component

## What We Need
1. **New Component**: `MobileBottomNav.tsx`
2. **Layout Updates**: Modify main layout to include bottom nav
3. **Route Detection**: Hook for active page detection
4. **Style Adjustments**: Page padding for nav space

## Implementation Steps

### Step 1: Create Base Component
**File**: `components/layout/MobileBottomNav.tsx`
- Fixed bottom positioning
- 5 navigation items
- Icons + labels
- Mobile-only visibility (md:hidden)

### Step 2: Add Navigation Items
```typescript
const navItems = [
  { href: '/', label: 'Početna', icon: Home },
  { href: '/usluge', label: 'Usluge', icon: Briefcase },
  { href: '/booking', label: 'Rezerviraj', icon: Calendar, special: true },
  { href: '/cjenik', label: 'Cjenik', icon: Euro },
  { href: '/kontakt', label: 'Kontakt', icon: Phone }
];
```

### Step 3: Implement Active States
- Use `usePathname()` from Next.js
- Highlight current page
- Special styling for booking CTA

### Step 4: Add Animations
- Scale on tap (0.95)
- Color transitions
- Optional: Spring animations for icons

### Step 5: Layout Integration
**File**: `app/layout.tsx`
- Add MobileBottomNav component
- Add padding-bottom to main content
- Ensure proper z-index layering

### Step 6: Update Header
- Simplify mobile header (remove some items)
- Coordinate with bottom nav
- Keep logo and minimal items

## Component Code Structure

```typescript
// MobileBottomNav.tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Briefcase, Calendar, Euro, Phone } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  special?: boolean;
}

export default function MobileBottomNav() {
  const pathname = usePathname();

  // Navigation items configuration
  // Active state logic
  // Render nav items with icons
  // Fixed bottom container
}
```

## Styling Guidelines

### Colors
- **Active**: text-green-600, bg-green-50
- **Inactive**: text-gray-600
- **Special (Booking)**: bg-green-600, text-white

### Spacing
- **Container Height**: 56px (14 in Tailwind)
- **Icon Size**: 20-24px (w-5 or w-6)
- **Font Size**: text-xs for labels

### Shadows & Borders
- **Top Border**: border-t border-gray-200
- **Shadow**: shadow-lg (subtle elevation)

## Testing Checklist
- [ ] Works on iPhone Safari
- [ ] Works on Android Chrome
- [ ] Active states update correctly
- [ ] No layout shifts
- [ ] Keyboard doesn't overlap nav
- [ ] Smooth animations
- [ ] Links work properly
- [ ] Accessibility (screen readers)

## Performance Optimizations
1. Use `memo` for nav items
2. Optimize icon imports
3. Minimize re-renders
4. Use CSS transforms for animations

## Responsive Behavior
- **< 768px**: Show bottom nav
- **>= 768px**: Hide bottom nav, use header nav
- **Landscape mobile**: Reduce height if needed

## Edge Cases to Handle
1. Keyboard opening (hide nav)
2. Long page titles
3. Deep linking
4. Back button behavior
5. Scroll position retention

## Future Enhancements (Phase 2)
- Badge notifications
- Haptic feedback
- Gesture navigation
- Custom animations per route
- A/B testing different layouts

## Files to Create/Modify

### New Files
1. `components/layout/MobileBottomNav.tsx`
2. `hooks/useActiveRoute.ts` (optional)

### Modified Files
1. `app/layout.tsx` - Add bottom nav
2. `components/layout/Header.tsx` - Simplify for mobile
3. `app/globals.css` - Add padding classes if needed

## Timeline
- **Component Creation**: 30 minutes
- **Integration**: 15 minutes
- **Styling & Polish**: 30 minutes
- **Testing**: 15 minutes
- **Total**: ~1.5 hours

## Success Criteria
✅ Bottom nav visible on mobile only
✅ All links functional
✅ Active states working
✅ Smooth animations
✅ No layout issues
✅ Accessible
✅ Performance maintained