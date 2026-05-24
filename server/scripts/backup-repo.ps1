<#
PowerShell script to archive the repository into a timestamped ZIP.

Usage:
  .\backup-repo.ps1
#>

param(
    [string]$outDir = ".\repo-backups\$(Get-Date -Format 'yyyyMMdd_HHmmss').zip"
)

New-Item -ItemType Directory -Force -Path (Split-Path $outDir) | Out-Null
Write-Host "Creating ZIP of repository..."

Compress-Archive -Path .\* -DestinationPath $outDir -Force
Write-Host "Repo archive created at $outDir"
