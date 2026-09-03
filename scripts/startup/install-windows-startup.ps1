# Install Stride to start when Windows signs in.
# Run in PowerShell:  .\scripts\startup\install-windows-startup.ps1

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$startupDir = [Environment]::GetFolderPath("Startup")
$cmdPath = Join-Path $startupDir "Stride-Open.cmd"
$launcher = Join-Path $root "scripts\startup\open-stride-windows.cmd"

@"
@echo off
cd /d "$root"
call "$launcher"
"@ | Set-Content -Path $cmdPath -Encoding ASCII

Write-Host "Stride startup shortcut created:"
Write-Host "  $cmdPath"
Write-Host "It will run when you sign in to Windows."
Write-Host "To remove: delete that file from your Startup folder."
