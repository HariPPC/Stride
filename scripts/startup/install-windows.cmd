@echo off
setlocal EnableExtensions
REM Build this Stride, put it on the desktop, and start it at sign-in.
REM From the Stride folder, in Command Prompt:  scripts\startup\install-windows.cmd
for %%I in ("%~dp0..\..") do set "ROOT=%%~fI"
set "LAUNCHER=%~dp0open-stride-windows.cmd"
cd /d "%ROOT%"

echo Installing Stride from:
echo   %ROOT%

where npm >NUL 2>&1 && goto havenpm
if exist "%ProgramFiles%\nodejs\npm.cmd" set "PATH=%ProgramFiles%\nodejs;%PATH%"
where npm >NUL 2>&1 && goto havenpm
if exist "%LocalAppData%\Programs\nodejs\npm.cmd" set "PATH=%LocalAppData%\Programs\nodejs;%PATH%"
where npm >NUL 2>&1 && goto havenpm
echo Node.js is not installed. Install it from https://nodejs.org and run this again.
exit /b 1

:havenpm
echo Installing dependencies. Leave this window open.
call npm install
if errorlevel 1 exit /b 1

echo Stopping anything already using port 43123...
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /C:":43123 " ^| findstr LISTENING') do taskkill /F /T /PID %%P >NUL 2>&1
ping -n 3 127.0.0.1 >nul
netstat -ano | findstr /C:":43123 " | findstr LISTENING >nul
if not errorlevel 1 (
  echo The old Stride is still running. Close that window, then run this again.
  exit /b 1
)

echo Building this version. This can take a few minutes.
call npm run build
if errorlevel 1 exit /b 1

cscript //Nologo "%~dp0create-stride-shortcuts.vbs" "%LAUNCHER%" "%ROOT%"
if errorlevel 1 (
  echo Could not create the desktop icon.
  exit /b 1
)

echo Opening Stride now...
call "%LAUNCHER%"
exit /b %ERRORLEVEL%
