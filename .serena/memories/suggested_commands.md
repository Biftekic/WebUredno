# Development Commands

## Project Setup
```bash
# Create Next.js project
npx create-next-app@latest uredno --typescript --tailwind --app

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Code Quality
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

## Testing
```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# E2E tests
npm run test:e2e
```

## Git Commands
```bash
# Check status
git status

# Create feature branch
git checkout -b feature/[name]

# Commit changes
git add .
git commit -m "feat: [description]"

# Push to remote
git push origin feature/[name]
```

## Deployment
```bash
# Deploy to Vercel
vercel

# Deploy to production
vercel --prod
```