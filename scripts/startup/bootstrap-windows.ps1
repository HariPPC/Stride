# Find the Stride folder from the existing sign-in shortcut, update it, and
# install the desktop icon. Paste into PowerShell:
#   irm https://raw.githubusercontent.com/HariPPC/Stride/cursor/pm-planning-features-46e3/scripts/startup/bootstrap-windows.ps1 | iex

$ErrorActionPreference = "Stop"
if (Get-Variable PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue) {
  $PSNativeCommandUseErrorActionPreference = $false
}
$env:GIT_TERMINAL_PROMPT = "0"

function Test-StrideRoot([string]$path) {
  if (-not $path) { return $false }
  return Test-Path -LiteralPath (Join-Path $path "scripts\startup\open-stride-windows.cmd")
}

function Find-RootFrom([string]$start) {
  if (-not $start) { return $null }
  $current = $start
  if (Test-Path -LiteralPath $current -PathType Leaf) {
    $current = Split-Path -Parent $current
  }
  for ($i = 0; $i -lt 6; $i++) {
    if (-not $current) { return $null }
    if (Test-StrideRoot $current) { return (Resolve-Path -LiteralPath $current).Path }
    $parent = Split-Path -Parent $current
    if (-not $parent -or $parent -eq $current) { return $null }
    $current = $parent
  }
  return $null
}

function Resolve-StrideRoot {
  $shell = New-Object -ComObject WScript.Shell
  $startup = $shell.SpecialFolders.Item("Startup")
  if (-not $startup) { $startup = [Environment]::GetFolderPath("Startup") }
  $candidates = @()

  $lnk = Join-Path $startup "Stride.lnk"
  if (Test-Path -LiteralPath $lnk) {
    $shortcut = $shell.CreateShortcut($lnk)
    Write-Host "Found sign-in shortcut:"
    Write-Host "  $lnk"
    Write-Host "  target: $($shortcut.TargetPath)"
    Write-Host "  start in: $($shortcut.WorkingDirectory)"
    $candidates += $shortcut.WorkingDirectory
    $candidates += $shortcut.TargetPath
    if ($shortcut.Arguments -match '"([^"]+)"') { $candidates += $Matches[1] }
  }

  $cmd = Join-Path $startup "Stride-Open.cmd"
  if (Test-Path -LiteralPath $cmd) {
    $text = Get-Content -LiteralPath $cmd -Raw
    if ($text -match 'cd /d "([^"]+)"') { $candidates += $Matches[1] }
  }

  foreach ($candidate in $candidates) {
    $found = Find-RootFrom $candidate
    if ($found) { return $found }
  }

  Write-Host "Searching your user folder for Stride..."
  $hits = Get-ChildItem -Path $env:USERPROFILE -Filter open-stride-windows.cmd -Recurse -Depth 6 -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notmatch '\\node_modules\\' }
  foreach ($hit in $hits) {
    $root = (Resolve-Path -LiteralPath (Join-Path $hit.Directory.FullName "..\..")).Path
    if (Test-StrideRoot $root) { return $root }
  }
  return $null
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw "Git is not installed. Install it from https://git-scm.com/download/win, then run this again."
}

$root = Resolve-StrideRoot
if (-not $root -or -not (Test-Path -LiteralPath (Join-Path $root ".git"))) {
  $root = Join-Path $env:USERPROFILE "Stride"
  if ((Test-Path -LiteralPath $root) -and -not (Test-Path -LiteralPath (Join-Path $root ".git"))) {
    $root = Join-Path $env:USERPROFILE "Stride-app"
  }
  if (-not (Test-Path -LiteralPath (Join-Path $root ".git"))) {
    Write-Host "Downloading Stride to:"
    Write-Host "  $root"
    & git clone --branch cursor/pm-planning-features-46e3 --single-branch https://github.com/HariPPC/Stride.git $root
    if ($LASTEXITCODE -ne 0) { throw "Could not download Stride ($LASTEXITCODE)." }
  }
}

Write-Host "Updating Stride in:"
Write-Host "  $root"
Set-Location -LiteralPath $root
& git fetch origin
if ($LASTEXITCODE -ne 0) { throw "git fetch failed ($LASTEXITCODE)." }
& git checkout cursor/pm-planning-features-46e3
if ($LASTEXITCODE -ne 0) { throw "Could not switch to the latest Stride branch ($LASTEXITCODE)." }
& git pull --ff-only origin cursor/pm-planning-features-46e3
if ($LASTEXITCODE -ne 0) { throw "git pull failed ($LASTEXITCODE)." }

Write-Host "Installing the desktop icon and sign-in start..."
& powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\startup\install-windows-startup.ps1
if ($LASTEXITCODE -ne 0) { throw "Stride install failed ($LASTEXITCODE)." }
