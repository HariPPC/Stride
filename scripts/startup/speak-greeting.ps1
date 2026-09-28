# Speak the greeting Stride saved the last time it was open.
# Exit 0 when something was spoken, 2 when there is nothing to say.
$ErrorActionPreference = "Stop"
$path = Join-Path $env:USERPROFILE ".stride\greeting.txt"
if (-not (Test-Path -LiteralPath $path)) { exit 2 }
$text = (Get-Content -LiteralPath $path -Raw -Encoding UTF8).Trim()
if ([string]::IsNullOrWhiteSpace($text)) { exit 2 }
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.Speak($text)
exit 0
