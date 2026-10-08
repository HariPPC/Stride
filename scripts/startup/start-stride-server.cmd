@echo off
cd /d "%~dp0..\.."
set PORT=43123
set "LOGDIR=%USERPROFILE%\.stride"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"
npm run start -- --port %PORT% >> "%LOGDIR%\startup.log" 2>&1
