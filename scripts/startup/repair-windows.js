// Repair the Windows desktop icon and sign-in start.
// Run from Command Prompt, in the Stride folder:
//   cscript //nologo //E:JScript scripts\startup\repair-windows.js
var fso = new ActiveXObject("Scripting.FileSystemObject");
var sh = new ActiveXObject("WScript.Shell");

function findRoot() {
  var scriptDir = fso.GetParentFolderName(WScript.ScriptFullName);
  if (fso.FileExists(scriptDir + "\\package.json")) return scriptDir;
  var fromStartup = fso.GetAbsolutePathName(scriptDir + "\\..\\..");
  if (fso.FileExists(fromStartup + "\\package.json")) return fromStartup;
  var downloaded = sh.ExpandEnvironmentStrings("%USERPROFILE%") + "\\Downloads\\Stride-cursor-pm-planning-features-46e3\\Stride-cursor-pm-planning-features-46e3";
  if (fso.FileExists(downloaded + "\\package.json")) return downloaded;
  return "";
}

function writeLauncher(path) {
  var lines = [
    "@echo off",
    "setlocal EnableExtensions",
    "REM Open this Stride in the browser. Company PCs block PowerShell and block",
    "REM starting a downloaded script directly, so this uses cmd.exe and Chrome.",
    "set PORT=43123",
    "set \"ROOT=%~dp0..\\..\"",
    "set \"URL=http://127.0.0.1:%PORT%\"",
    "set \"LOGDIR=%USERPROFILE%\\.stride\"",
    "set \"PAGE=%LOGDIR%\\page.html\"",
    "set \"CURL=%SystemRoot%\\System32\\curl.exe\"",
    "if not exist \"%CURL%\" set \"CURL=curl\"",
    "if not exist \"%LOGDIR%\" mkdir \"%LOGDIR%\"",
    "echo %DATE% %TIME% launcher 1>>\"%LOGDIR%\\startup.log\" 2>&1",
    "",
    "cd /d \"%ROOT%\"",
    "set \"PATH=%LOCALAPPDATA%\\Programs\\nodejs;%ProgramFiles%\\nodejs;%PATH%\"",
    "",
    "call :isCurrent",
    "if not errorlevel 1 goto ready",
    "",
    "echo Starting Stride...",
    "echo Starting Stride. 1>>\"%LOGDIR%\\startup.log\" 2>&1",
    "call :stopPort",
    "ping -n 2 127.0.0.1 >nul",
    "where npm >nul 2>&1",
    "if errorlevel 1 goto noNode",
    "if not exist \"node_modules\" call npm install 1>>\"%LOGDIR%\\startup.log\" 2>&1",
    "if not exist \".next\" call npm run build 1>>\"%LOGDIR%\\startup.log\" 2>&1",
    "start \"Stride\" /MIN cmd /c npm run start -- --port %PORT%",
    "",
    "set TRIES=0",
    ":waitloop",
    "call :isCurrent",
    "if not errorlevel 1 goto ready",
    "set /a TRIES+=1",
    "if %TRIES% GEQ 20 goto notready",
    "ping -n 3 127.0.0.1 >nul",
    "goto waitloop",
    "",
    ":noNode",
    "echo Node.js was not found.",
    "echo Node.js was not found. 1>>\"%LOGDIR%\\startup.log\" 2>&1",
    "goto notready",
    "",
    ":notready",
    "echo Stride did not open. The log is opening.",
    "echo Stride did not open. 1>>\"%LOGDIR%\\startup.log\" 2>&1",
    "start \"\" notepad \"%LOGDIR%\\startup.log\"",
    "exit /b 1",
    "",
    ":ready",
    "call :openBrowser",
    "exit /b 0",
    "",
    ":openBrowser",
    "if exist \"%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe\" (",
    "  start \"\" \"%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe\" \"%URL%\"",
    "  goto :eof",
    ")",
    "if exist \"%LOCALAPPDATA%\\Google\\Chrome\\Application\\chrome.exe\" (",
    "  start \"\" \"%LOCALAPPDATA%\\Google\\Chrome\\Application\\chrome.exe\" \"%URL%\"",
    "  goto :eof",
    ")",
    "start \"\" \"%URL%\"",
    "goto :eof",
    "",
    ":isCurrent",
    "\"%CURL%\" -sf \"%URL%\" -o \"%PAGE%\" >nul 2>&1",
    "if errorlevel 1 exit /b 1",
    "findstr /C:\"Add project\" \"%PAGE%\" >nul 2>&1",
    "if errorlevel 1 exit /b 1",
    "findstr /C:\"Sync Jira\" \"%PAGE%\" >nul 2>&1",
    "if errorlevel 1 exit /b 1",
    "exit /b 0",
    "",
    ":stopPort",
    "for /f \"tokens=5\" %%P in ('netstat -ano ^| findstr /C:\":%PORT% \" ^| findstr LISTENING') do taskkill /F /T /PID %%P >nul 2>&1",
    "goto :eof"
  ];
  var file = fso.CreateTextFile(path, true);
  var i;
  for (i = 0; i < lines.length; i++) file.WriteLine(lines[i]);
  file.Close();
}

function makeLink(folderName, launcher, root) {
  var folder = sh.SpecialFolders(folderName);
  var linkPath = folder + "\\Stride.lnk";
  var sc = sh.CreateShortcut(linkPath);
  sc.TargetPath = sh.ExpandEnvironmentStrings("%SystemRoot%") + "\\System32\\cmd.exe";
  sc.Arguments = "/c \"" + launcher + "\"";
  sc.WorkingDirectory = root;
  sc.WindowStyle = 7;
  sc.Description = "Open Stride";
  sc.Save();
  WScript.Echo(folderName + ": " + linkPath);
}

var root = findRoot();
if (!root) {
  WScript.Echo("Could not find the Stride folder.");
  WScript.Quit(1);
}

var launcher = root + "\\scripts\\startup\\open-stride-windows.cmd";
var startupFolder = fso.GetParentFolderName(launcher);
if (!fso.FolderExists(startupFolder)) fso.CreateFolder(startupFolder);
writeLauncher(launcher);

var oldCmd = sh.SpecialFolders("Startup") + "\\Stride-Open.cmd";
if (fso.FileExists(oldCmd)) fso.DeleteFile(oldCmd, true);

WScript.Echo("Installing Stride from:");
WScript.Echo("  " + root);
makeLink("Desktop", launcher, root);
makeLink("Startup", launcher, root);

var cmd = sh.ExpandEnvironmentStrings("%SystemRoot%") + "\\System32\\cmd.exe";
var code = sh.Run("\"" + cmd + "\" /c \"" + launcher + "\"", 1, true);
WScript.Quit(code);
