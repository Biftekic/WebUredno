# Uredno.eu Database Setup

This directory contains all database migrations and configuration for the Uredno.eu cleaning service platform.

## Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **New Project**: Create a new Supabase project
3. **Database Credentials**: Get your project URL and anon key from the project settings

## Quick Setup

1. **Configure Environment Variables**
   ```bash
   # Copy the example file
   cp .env.example .env.local

   # Add your Supabase credentials:
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (optional, for admin operations)
   ```

2. **Run Migrations**

   Go to your Supabase Dashboard → SQL Editor and run each migration file in order:

   - `001_initial_schema.sql` - Creates all tables
   - `002_indexes.sql` - Adds performance indexes
   - `003_functions.sql` - Database functions and triggers
   - `004_rls.sql` - Row Level Security policies
   - `005_seed_data.sql` - Initial service data in Croatian

3. **Verify Setup**
   ```bash
   npm run dev
   # Visit http://localhost:3000
   ```

## Database Schema

### Core Tables

- **services** - Cleaning service offerings
- **customers** - Customer information
- **bookings** - Service bookings and appointments
- **availability** - Team scheduling and time slots
- **pricing_rules** - Dynamic pricing rules
- **reviews** - Customer reviews and ratings
- **inquiries** - Contact form submissions

### Key Features

- **Croatian Content**: All service names and descriptions in Croatian
- **2-Hour Time Slots**: Services scheduled in 2-hour windows
- **3 Teams Support**: Parallel booking for up to 3 cleaning teams
- **EUR Currency**: Prices in Euros as per Croatian market
- **Mobile Optimized**: Indexes for fast mobile queries

## Database Functions

### Available Functions

- `generate_booking_number()` - Auto-generates unique booking numbers
- `calculate_price()` - Calculates service price with extras
- `check_availability()` - Checks team availability for time slots
- `get_available_slots()` - Gets all available slots for a date
- `get_next_available_slot()` - Finds the next available booking slot

## Row Level Security (RLS)

The database implements secure access policies:

- **Public**: Can view active services and availability
- **Customers**: Can create bookings and view their own data
- **Authenticated**: Additional permissions for logged-in users
- **Service Role**: Full access for backend operations

## TypeScript Support

All database types are defined in `/types/database.ts` for full type safety.

Database helper functions are in `/lib/db/`:
- `services.ts` - Service queries
- `bookings.ts` - Booking operations
- `availability.ts` - Schedule management
- `inquiries.ts` - Contact form handling
- `reviews.ts` - Review management

## Testing the Database

### Quick Test Queries

```sql
-- Check services are loaded
SELECT * FROM services WHERE active = true;

-- Check availability for next 7 days
SELECT date, time_slot, COUNT(*) as available_teams
FROM availability
WHERE date >= CURRENT_DATE
  AND date <= CURRENT_DATE + INTERVAL '7 days'
  AND is_available = true
GROUP BY date, time_slot
ORDER BY date, time_slot;

-- Test booking number generation
SELECT generate_booking_number();

-- Test price calculation
SELECT * FROM calculate_price(
  (SELECT id FROM services WHERE slug = 'osnovno-ciscenje' LIMIT 1),
  80, -- 80 sqm property
  '[{"name": "Pranje prozora", "price": 15}]'::jsonb
);
```

## Maintenance

### Daily Tasks
- Monitor availability generation (auto-generates 60 days ahead)
- Check for completed bookings to mark for review

### Weekly Tasks
- Review featured reviews
- Check inquiry response times

### Monthly Tasks
- Analyze booking patterns
- Update pricing rules if needed
- Archive old completed bookings

## Troubleshooting

### Common Issues

1. **"Permission denied" errors**
   - Check RLS policies are properly set
   - Verify anon key is correct

2. **"Relation does not exist"**
   - Run migrations in correct order
   - Check all migrations completed successfully

3. **No availability showing**
   - Run seed data migration (005)
   - Check dates are in the future

4. **Price calculation errors**
   - Verify service exists and is active
   - Check pricing rules are configured

## Support

For database issues:
1. Check Supabase logs in Dashboard → Logs
2. Verify migrations ran successfully
3. Test with SQL queries in SQL Editor
4. Check TypeScript types match schema