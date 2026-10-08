@echo off
setlocal EnableExtensions
REM Start Stride (if needed) and open it in the browser.
set PORT=43123
set "ROOT=%~dp0..\.."
set "URL=http://127.0.0.1:%PORT%"
set "LOGDIR=%USERPROFILE%\.stride"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"

cd /d "%ROOT%"

REM Sign-in shortcuts do not always inherit a Node install from nvm or a user PATH.
where npm >NUL 2>&1
if errorlevel 1 (
  if exist "%ProgramFiles%\nodejs\npm.cmd" set "PATH=%ProgramFiles%\nodejs;%PATH%"
)
where npm >NUL 2>&1
if errorlevel 1 (
  if exist "%LocalAppData%\Programs\nodejs\npm.cmd" set "PATH=%LocalAppData%\Programs\nodejs;%PATH%"
)

curl -sf -o NUL "%URL%" >NUL 2>&1
if errorlevel 1 (
  echo Starting Stride...>> "%LOGDIR%\startup.log"
  if not exist "node_modules" call npm install >> "%LOGDIR%\startup.log" 2>&1
  if not exist ".next" call npm run build >> "%LOGDIR%\startup.log" 2>&1
  start "Stride" /MIN cmd /c "npm run start -- --port %PORT% >> \"%LOGDIR%\startup.log\" 2>&1"
)

set TRIES=0
:waitloop
curl -sf -o NUL "%URL%" >NUL 2>&1
if not errorlevel 1 goto ready
set /a TRIES+=1
if %TRIES% GEQ 30 goto notready
powershell -NoProfile -Command "Start-Sleep -Seconds 2"
goto waitloop

:notready
echo Stride did not start. The log is opening.
echo Stride did not start.>> "%LOGDIR%\startup.log"
start "" notepad "%LOGDIR%\startup.log"
exit /b 1

:ready
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0speak-greeting.ps1"
if not errorlevel 1 set "URL=%URL%/?spoken=1"
start "" "%URL%"
exit /b 0
