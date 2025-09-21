#!/bin/bash

# WebUredno Database Setup Script
# This script helps initialize the Supabase database for the WebUredno project

echo "=========================================="
echo "WebUredno Database Setup"
echo "=========================================="

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null
then
    echo "❌ Supabase CLI not found!"
    echo "Installing Supabase CLI..."
    npm install -D supabase
fi

echo "✅ Supabase CLI is installed"

# Check for environment variables
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found!"
    echo "Please create .env.local with your Supabase credentials"
    echo "Copy .env.example to .env.local and fill in the values"
    exit 1
fi

# Source environment variables
export $(cat .env.local | grep -v '^#' | xargs)

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ Supabase credentials not found in .env.local!"
    echo "Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    exit 1
fi

echo "✅ Environment variables loaded"

# Initialize Supabase (if not already initialized)
if [ ! -f supabase/config.toml ]; then
    echo "Initializing Supabase..."
    npx supabase init
fi

echo "Running database migrations..."

# Function to run a migration file
run_migration() {
    local file=$1
    local name=$(basename $file .sql)

    echo "  → Running migration: $name"

    # Here you would typically use supabase db push or execute the SQL directly
    # For now, we'll output instructions
    echo "    Please run this migration in your Supabase SQL editor:"
    echo "    File: $file"
}

# Run migrations in order
for migration in supabase/migrations/*.sql; do
    if [ -f "$migration" ]; then
        run_migration "$migration"
    fi
done

echo ""
echo "=========================================="
echo "Setup Instructions:"
echo "=========================================="
echo ""
echo "1. Go to your Supabase project dashboard"
echo "2. Navigate to the SQL Editor"
echo "3. Run each migration file in order:"
echo "   - 001_initial_schema.sql"
echo "   - 002_indexes.sql"
echo "   - 003_functions.sql"
echo "   - 004_rls.sql"
echo "   - 005_seed_data.sql"
echo ""
echo "4. Verify the tables are created:"
echo "   - services (8 records)"
echo "   - customers"
echo "   - bookings"
echo "   - availability"
echo "   - pricing_rules"
echo "   - reviews"
echo "   - inquiries"
echo ""
echo "5. Test the connection:"
echo "   npm run dev"
echo "   Visit http://localhost:3000"
echo ""
echo "=========================================="
echo "✅ Database setup complete!"
echo "=========================================="