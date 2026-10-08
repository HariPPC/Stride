@echo off
setlocal EnableExtensions
REM Open this Stride in the browser. If an older copy is still running, replace it.
set PORT=43123
set "ROOT=%~dp0..\.."
set "URL=http://127.0.0.1:%PORT%"
set "LOGDIR=%USERPROFILE%\.stride"
set "PAGE=%LOGDIR%\page.html"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"

cd /d "%ROOT%"
call :ensureNpm

call :isCurrent
if not errorlevel 1 goto ready

echo Starting this version of Stride...
echo Starting this version of Stride. 1>>"%LOGDIR%\startup.log" 2>&1
call :stopPort
ping -n 2 127.0.0.1 >nul
if not exist "node_modules" call npm install 1>>"%LOGDIR%\startup.log" 2>&1
if not exist ".next" call npm run build 1>>"%LOGDIR%\startup.log" 2>&1
call :startServer

set TRIES=0
:waitloop
call :isCurrent
if not errorlevel 1 goto ready
set /a TRIES+=1
if %TRIES% GEQ 30 goto notready
ping -n 3 127.0.0.1 >nul
goto waitloop

:notready
echo Stride did not open. The log is opening.
echo Stride did not open this version. 1>>"%LOGDIR%\startup.log" 2>&1
start "" notepad "%LOGDIR%\startup.log"
exit /b 1

:ready
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0speak-greeting.ps1"
if not errorlevel 1 set "URL=%URL%/?spoken=1"
start "" "%URL%"
exit /b 0

:isCurrent
curl -sf "%URL%" -o "%PAGE%" >NUL 2>&1
if errorlevel 1 exit /b 1
findstr /C:"Add project" "%PAGE%" >NUL 2>&1
if errorlevel 1 exit /b 1
findstr /C:"Sync Jira" "%PAGE%" >NUL 2>&1
if errorlevel 1 exit /b 1
exit /b 0

:stopPort
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /C:":%PORT% " ^| findstr LISTENING') do taskkill /F /T /PID %%P >NUL 2>&1
goto :eof

:startServer
REM Launch Windows cmd.exe. Starting the downloaded script directly is blocked on company PCs.
start "Stride" /MIN cmd /c "npm run start -- --port %PORT%"
goto :eof

:ensureNpm
where npm >NUL 2>&1 && goto :eof
if exist "%ProgramFiles%\nodejs\npm.cmd" set "PATH=%ProgramFiles%\nodejs;%PATH%"
where npm >NUL 2>&1 && goto :eof
if exist "%LocalAppData%\Programs\nodejs\npm.cmd" set "PATH=%LocalAppData%\Programs\nodejs;%PATH%"
where npm >NUL 2>&1 && goto :eof
for /f "delims=" %%D in ('dir /b /ad /o-n "%APPDATA%\nvm\v*" 2^>nul') do if exist "%APPDATA%\nvm\%%D\npm.cmd" set "PATH=%APPDATA%\nvm\%%D;%PATH%" & goto :eof
goto :eof
