<#
PowerShell script to backup a MongoDB database using mongodump.

Usage:
  .\backup-db.ps1 -mongoUri "mongodb://localhost:27017" -dbName "mydb"

Requires: mongodump on PATH (MongoDB Database Tools)
#>

param(
    [string]$mongoUri = "mongodb://localhost:27017",
    [string]$dbName = "your_db_name",
    [string]$outDir = ".\backups\$(Get-Date -Format 'yyyyMMdd_HHmmss')"
)

if (-not (Get-Command mongodump -ErrorAction SilentlyContinue)) {
    Write-Error "mongodump not found. Install MongoDB Database Tools and ensure mongodump is on PATH."
    exit 1
}

New-Item -ItemType Directory -Force -Path $outDir | Out-Null
Write-Host "Running mongodump for database '$dbName' to '$outDir'..."

mongodump --uri $mongoUri --db $dbName --out $outDir

if ($LASTEXITCODE -eq 0) {
    Write-Host "Backup completed: $outDir"
} else {
    Write-Error "mongodump failed with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}
