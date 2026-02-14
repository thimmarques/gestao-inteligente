#!/bin/bash
# This script repairs the Supabase migration history and pulls the remote schema.
# Usage: Execute this script in your terminal where 'supabase' is available.

echo "Starting Supabase migration repair..."

# 1. Mark the missing migration as reverted on the remote history
echo "Repairing migration history for 20260214151343..."
supabase migration repair --status reverted 20260214151343

# 2. Pull the current remote schema into a new local migration file
echo "Pulling remote database changes..."
supabase db pull

echo "Synchronization complete. You can now run 'supabase db push' to verify everything is up to date."
