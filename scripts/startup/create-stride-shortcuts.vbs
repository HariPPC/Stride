' Create the desktop icon and the sign-in shortcut.
' Usage: cscript //Nologo create-stride-shortcuts.vbs "launcher.cmd" "project-root"
Set sh = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
launcher = WScript.Arguments(0)
root = WScript.Arguments(1)

Sub MakeLink(folderName)
  linkPath = sh.SpecialFolders(folderName) & "\Stride.lnk"
  Set sc = sh.CreateShortcut(linkPath)
  sc.TargetPath = sh.ExpandEnvironmentStrings("%SystemRoot%\System32\cmd.exe")
  sc.Arguments = "/c " & Chr(34) & launcher & Chr(34)
  sc.WorkingDirectory = root
  sc.WindowStyle = 7
  sc.Description = "Open Stride"
  sc.Save
  WScript.Echo folderName & ": " & linkPath
End Sub

MakeLink "Desktop"
MakeLink "Startup"

oldCmd = sh.SpecialFolders("Startup") & "\Stride-Open.cmd"
If fso.FileExists(oldCmd) Then fso.DeleteFile oldCmd, True
