# Phase 1: Project Setup Workflow

## Overview
Initial project setup with Next.js 14, TypeScript, and mobile-first configuration.

## Prerequisites
- Node.js 20+ installed
- Git repository created
- Access to Vercel, Railway, and Supabase accounts

## Workflow Steps

### 1. Initialize Next.js Project
```bash
# Create Next.js app with TypeScript
npx create-next-app@latest uredno --typescript --tailwind --app --no-src-dir

# Navigate to project
cd uredno

# Initialize git
git init
git remote add origin https://github.com/[your-org]/uredno.git
```

### 2. Configure TypeScript
```bash
# Update tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["components/*"],
      "@/lib/*": ["lib/*"],
      "@/hooks/*": ["hooks/*"],
      "@/types/*": ["types/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
EOF
```

### 3. Install Core Dependencies
```bash
# UI & Styling
npm install @radix-ui/react-dialog @radix-ui/react-slot class-variance-authority clsx tailwind-merge
npm install lucide-react framer-motion

# Forms & Validation
npm install react-hook-form zod @hookform/resolvers

# State Management
npm install zustand

# Date & Time
npm install date-fns date-fns-tz

# API & Data
npm install axios swr

# Dev Dependencies
npm install -D @types/node prettier eslint-config-prettier
```

### 4. Setup Tailwind CSS
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfdf5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        secondary: {
          500: '#3b82f6',
          600: '#2563eb',
        }
      },
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
      },
      height: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-bottom))',
      },
    },
  },
  plugins: [],
}
```

### 5. Create Project Structure
```bash
# Create directory structure
mkdir -p {components,lib,hooks,types,public/images,app/api}
mkdir -p components/{ui,layout,booking,services,common}
mkdir -p lib/{utils,api,constants}
mkdir -p app/{booking,services,about,contact}

# Create base files
touch lib/utils.ts
touch lib/constants.ts
touch types/index.ts
touch components/layout/MobileNav.tsx
touch components/layout/Footer.tsx
```

### 6. Environment Configuration
```bash
# Create .env.local
cat > .env.local << 'EOF'
# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Uredno.eu

# WhatsApp
NEXT_PUBLIC_WHATSAPP_PHONE=385924502265

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# Google Calendar
GOOGLE_CALENDAR_ID=02ff9b19d12ca44fda1dc9d4f6b628aa30663578b36f6c403d6f1b81e74e2664@group.calendar.google.com
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Email (Resend)
RESEND_API_KEY=

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=
EOF

# Create .env.example (without sensitive data)
cat > .env.example << 'EOF'
# Copy this to .env.local and fill in your values
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_WHATSAPP_PHONE=
# ... etc
EOF
```

### 7. Configure ESLint & Prettier
```json
// .eslintrc.json
{
  "extends": ["next", "prettier"],
  "rules": {
    "react/no-unescaped-entities": "off",
    "@next/next/no-img-element": "off"
  }
}
```

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### 8. Setup Git Hooks
```bash
# Install husky
npm install -D husky lint-staged

# Initialize husky
npx husky-init

# Configure pre-commit hook
cat > .husky/pre-commit << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
EOF

# Configure lint-staged
cat > .lintstagedrc.json << 'EOF'
{
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md}": ["prettier --write"]
}
EOF
```

### 9. Create Utility Functions
```typescript
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('hr-HR', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
}

export function formatPhoneNumber(phone: string): string {
  return phone.replace(/(\d{3})(\d{2})(\d{3})(\d{4})/, '+$1 $2 $3 $4');
}
```

### 10. Initial Commit
```bash
# Add all files
git add .

# Commit
git commit -m "Initial project setup with Next.js 14 and mobile-first configuration"

# Push to repository
git push -u origin main
```

## Verification Checklist

- [ ] Next.js app runs locally with `npm run dev`
- [ ] TypeScript compiles without errors
- [ ] Tailwind CSS is working
- [ ] Environment variables are configured
- [ ] Git repository is initialized
- [ ] ESLint and Prettier are configured
- [ ] Project structure is created
- [ ] All dependencies are installed

## Next Steps
- Proceed to [Database Schema Setup](./02-database-schema.md)
- Configure CI/CD pipeline
- Setup development environment

## Troubleshooting

### Common Issues

1. **TypeScript errors**: Run `npm run type-check`
2. **Missing dependencies**: Run `npm install`
3. **Environment variables**: Check `.env.local` exists
4. **Port conflicts**: Change port in `package.json` scripts

## Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)