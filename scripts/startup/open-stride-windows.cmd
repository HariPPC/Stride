@echo off
REM Start Stride server (if needed) and open the app in your browser.
set PORT=43123
set ROOT=%~dp0..\..
set URL=http://127.0.0.1:%PORT%
set LOGDIR=%USERPROFILE%\.stride
if not exist "%LOGDIR%" mkdir "%LOGDIR%"

cd /d "%ROOT%"

curl -sf -o NUL "%URL%" >NUL 2>&1
if errorlevel 1 (
  if not exist "node_modules" call npm install >> "%LOGDIR%\startup.log" 2>&1
  if not exist ".next" call npm run build >> "%LOGDIR%\startup.log" 2>&1
  start "Stride" /MIN cmd /c "npm run start -- --port %PORT% >> \"%LOGDIR%\startup.log\" 2>&1"
  timeout /t 8 /nobreak >NUL
)

start "" "%URL%"
