' routerkz Windows clickable launcher
' Double-click this file to start routerkz hidden in the notification area.
Option Explicit

Dim shell, fso, scriptDir, cliPath, nodePath, command
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
cliPath = fso.BuildPath(scriptDir, "..\..\cli.js")

' Resolve Node from the installed routerkz command first. This supports
' nvm-windows, Volta, and custom Node installations.
Dim npmPrefix, candidates, candidate
npmPrefix = shell.ExpandEnvironmentStrings("%APPDATA%\npm")
candidates = Array( _
  shell.ExpandEnvironmentStrings("%ProgramFiles%\nodejs\node.exe"), _
  shell.ExpandEnvironmentStrings("%LocalAppData%\Programs\nodejs\node.exe"), _
  shell.ExpandEnvironmentStrings("%NVM_HOME%\node.exe"), _
  shell.ExpandEnvironmentStrings("%NVM_SYMLINK%\node.exe") _
)
nodePath = ""
For Each candidate In candidates
  If Len(candidate) > 0 Then
    If fso.FileExists(candidate) Then
      nodePath = candidate
      Exit For
    End If
  End If
Next

If Len(nodePath) = 0 Then
  nodePath = "node.exe"
End If

If Not fso.FileExists(cliPath) Then
  MsgBox "routerkz cli.js tidak ditemukan: " & cliPath, 16, "routerkz"
  WScript.Quit 1
End If

command = Chr(34) & nodePath & Chr(34) & " " & Chr(34) & fso.GetAbsolutePathName(cliPath) & Chr(34) & " --launcher --host 127.0.0.1"
shell.Run command, 0, False
