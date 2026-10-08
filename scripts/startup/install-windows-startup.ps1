# Put this Stride on the Windows desktop and start it at sign-in.
# From the Stride folder:
#   powershell -ExecutionPolicy Bypass -File .\scripts\startup\install-windows-startup.ps1

$ErrorActionPreference = "Stop"
if (Get-Variable PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue) {
  $PSNativeCommandUseErrorActionPreference = $false
}

$root = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$launcher = Join-Path $root "scripts\startup\open-stride-windows.cmd"
$shell = New-Object -ComObject WScript.Shell
$startupDir = $shell.SpecialFolders.Item("Startup")
if (-not $startupDir) { $startupDir = [Environment]::GetFolderPath("Startup") }
$desktopPaths = @(
  @(
    $shell.SpecialFolders.Item("Desktop"),
    [Environment]::GetFolderPath("Desktop")
  ) | Where-Object { $_ } | Select-Object -Unique
)
if (-not $desktopPaths[0]) { throw "Could not find your Desktop folder." }
$startupShortcut = Join-Path $startupDir "Stride.lnk"
$oldStartupCmd = Join-Path $startupDir "Stride-Open.cmd"
$port = 43123

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw "Node.js is not installed. Install it from https://nodejs.org, then run this again."
}
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  throw "npm was not found. Reinstall Node.js, then run this again."
}
if (-not (Test-Path -LiteralPath $launcher)) {
  throw "Missing launcher: $launcher"
}

Set-Location -LiteralPath $root
Write-Host "Installing Stride from:"
Write-Host "  $root"

Write-Host "Installing dependencies..."
cmd /c "npm install"
if ($LASTEXITCODE -ne 0) { throw "npm install failed ($LASTEXITCODE)." }

Write-Host "Stopping anything already using port $port..."
function Get-StrideListeners {
  netstat -ano | Select-String -Pattern ":$port\s+.*LISTENING"
}
$pids = @()
foreach ($line in (Get-StrideListeners)) {
  $procId = ($line.ToString().Trim() -split '\s+')[-1]
  if ($procId -match '^\d+$' -and [int]$procId -gt 0) { $pids += [int]$procId }
}
foreach ($procId in ($pids | Select-Object -Unique)) {
  Write-Host "  stopping process $procId"
  & taskkill.exe /F /T /PID $procId | Out-Null
}
if ($pids.Count -gt 0) {
  $deadline = (Get-Date).AddSeconds(8)
  do {
    Start-Sleep -Milliseconds 400
    $still = Get-StrideListeners
  } while ($still -and (Get-Date) -lt $deadline)
  if ($still) {
    throw "The old Stride is still running on port $port. Close that window, then run this again."
  }
}

Write-Host "Building this version. Leave this window open. It can take a few minutes."
cmd /c "npm run build"
if ($LASTEXITCODE -ne 0) { throw "npm run build failed ($LASTEXITCODE)." }

function New-StrideShortcut([string]$path) {
  $shortcut = $shell.CreateShortcut($path)
  $shortcut.TargetPath = $launcher
  $shortcut.Arguments = ""
  $shortcut.WorkingDirectory = $root
  $shortcut.WindowStyle = 7
  $shortcut.Description = "Open Stride"
  $shortcut.Save()
}

$desktopShortcuts = @()
foreach ($desktop in $desktopPaths) {
  $path = Join-Path $desktop "Stride.lnk"
  New-StrideShortcut $path
  $desktopShortcuts += $path
}
New-StrideShortcut $startupShortcut
if (Test-Path -LiteralPath $oldStartupCmd) {
  Remove-Item -LiteralPath $oldStartupCmd -Force
}

Write-Host ""
Write-Host "Desktop icon:"
foreach ($path in $desktopShortcuts) { Write-Host "  $path" }
Write-Host "Starts when Windows signs in:"
Write-Host "  $startupShortcut"
Write-Host ""
Write-Host "Opening Stride now..."
& cmd.exe /c "`"$launcher`""
if ($LASTEXITCODE -ne 0) {
  throw "Stride did not open. The log is in $env:USERPROFILE\.stride\startup.log"
}
Write-Host "Done. The desktop icon opens this version, with Add project and Sync Jira."
