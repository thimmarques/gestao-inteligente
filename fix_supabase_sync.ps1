Write-Host "Starting Supabase migration repair..." -ForegroundColor Cyan

# 1. Mark the missing migration as reverted on the remote history
Write-Host "Repairing migration history for 20260214151343..." -ForegroundColor Yellow
supabase migration repair --status reverted 20260214151343

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to repair migration history. Please ensure 'supabase' CLI is installed and you are logged in."
    exit 1
}

# 2. Pull the current remote schema into a new local migration file
Write-Host "Pulling remote database changes..." -ForegroundColor Yellow
supabase db pull

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to pull remote changes. Please check your connection and credentials."
    exit 1
}

Write-Host "Synchronization complete. You can now run 'supabase db push' to verify everything is up to date." -ForegroundColor Green
