# Put this Stride on the Windows desktop and start it at sign-in.
# From the Stride folder:
#   powershell -ExecutionPolicy Bypass -File .\scripts\startup\install-windows-startup.ps1

$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$launcher = Join-Path $root "scripts\startup\open-stride-windows.cmd"
$startupDir = [Environment]::GetFolderPath("Startup")
$desktop = [Environment]::GetFolderPath("Desktop")
$cmdPath = Join-Path $startupDir "Stride-Open.cmd"
$shortcutPath = Join-Path $desktop "Stride.lnk"
$port = 43123

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw "Node.js is not installed. Install it from https://nodejs.org, then run this again."
}
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  throw "npm was not found. Reinstall Node.js, then run this again."
}

Set-Location -LiteralPath $root
Write-Host "Installing Stride from:"
Write-Host "  $root"

Write-Host "Installing dependencies..."
cmd /c "npm install"
if ($LASTEXITCODE -ne 0) { throw "npm install failed ($LASTEXITCODE)." }

Write-Host "Stopping anything already using port $port..."
$listeners = netstat -ano | Select-String -Pattern ":$port\s+.*LISTENING"
$pids = @()
foreach ($line in $listeners) {
  $procId = ($line.ToString().Trim() -split '\s+')[-1]
  if ($procId -match '^\d+$' -and [int]$procId -gt 0) {
    $pids += [int]$procId
  }
}
foreach ($procId in ($pids | Select-Object -Unique)) {
  Write-Host "  stopping process $procId"
  Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
}
if ($pids.Count -gt 0) {
  $deadline = (Get-Date).AddSeconds(8)
  do {
    Start-Sleep -Milliseconds 400
    $still = netstat -ano | Select-String -Pattern ":$port\s+.*LISTENING"
  } while ($still -and (Get-Date) -lt $deadline)
}

Write-Host "Building this version (replaces an older copy already on this PC)..."
cmd /c "npm run build"
if ($LASTEXITCODE -ne 0) { throw "npm run build failed ($LASTEXITCODE)." }

@"
@echo off
cd /d "$root"
call "$launcher"
"@ | Set-Content -Path $cmdPath -Encoding ASCII

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = Join-Path $env:SystemRoot "System32\cmd.exe"
$shortcut.Arguments = "/c `"$launcher`""
$shortcut.WorkingDirectory = $root
$shortcut.WindowStyle = 7
$shortcut.Description = "Open Stride"
$shortcut.Save()

Write-Host ""
Write-Host "Desktop icon:"
Write-Host "  $shortcutPath"
Write-Host "Starts when Windows signs in:"
Write-Host "  $cmdPath"
Write-Host "To remove both, delete those two files."
Write-Host ""
Write-Host "Opening Stride now..."
Start-Process -FilePath $env:ComSpec -ArgumentList "/c `"$launcher`"" -WorkingDirectory $root -Wait
