#!/bin/bash
# Run Supabase migrations

echo "🗄️  Mouse Platform Database Migration"
echo "======================================"
echo ""

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo "❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set"
    echo ""
    echo "Example:"
    echo "export SUPABASE_URL=https://your-project.supabase.co"
    echo "export SUPABASE_SERVICE_KEY=your-service-key"
    exit 1
fi

echo "Connecting to: $SUPABASE_URL"
echo ""

# Run schema.sql
echo "Running schema migration..."
psql "$SUPABASE_URL" -f supabase/schema.sql

echo ""
echo "✅ Migration complete!"
