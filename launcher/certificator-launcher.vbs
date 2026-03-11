' Certificator Launcher
' Simple and clean app starter

Option Explicit

Dim objShell, objFSO, scriptDir, rootDir, frontendDir
Dim batFile, batFileObj, nodeVersion

Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Get paths
scriptDir = objFSO.GetParentFolderName(WScript.ScriptFullName)
rootDir = objFSO.GetParentFolderName(scriptDir)
frontendDir = objFSO.BuildPath(rootDir, "frontend")

' Check Node.js
On Error Resume Next
Dim objExec
Set objExec = objShell.Exec("node --version")
If Err.Number <> 0 Or objExec.Status <> 0 Then
    MsgBox "Node.js not installed!" & vbCrLf & vbCrLf & "Please run setup.bat first" & vbCrLf & "setup.bat dosyasini once calistir", 16, "Certificator"
    WScript.Quit 1
End If

nodeVersion = Trim(objExec.StdOut.ReadAll())
On Error Goto 0

' Create startup batch file in Windows Temp folder (auto-cleanup)
Dim tempFolder
Set tempFolder = objFSO.GetSpecialFolder(2) ' 2 = Windows Temp
batFile = objFSO.BuildPath(tempFolder, "certificator-start.bat")
Set batFileObj = objFSO.CreateTextFile(batFile, True)

batFileObj.WriteLine("@echo off")
batFileObj.WriteLine("cd /d """ & frontendDir & """")
batFileObj.WriteLine("title Certificator")
batFileObj.WriteLine("echo.")
batFileObj.WriteLine("echo Certificator starting... / Certificator baslaniyor...")
batFileObj.WriteLine("echo.")
batFileObj.WriteLine("npm run dev")

batFileObj.Close()

' Show welcome message
Dim appMsg
appMsg = "Certificator" & vbCrLf
appMsg = appMsg & "Certificate Generator" & vbCrLf & vbCrLf
appMsg = appMsg & "Version: 0.1.3-beta" & vbCrLf
appMsg = appMsg & "Node.js: " & nodeVersion & vbCrLf & vbCrLf
appMsg = appMsg & "Developed by: Alican YILDIRIM" & vbCrLf
appMsg = appMsg & "Email: yildirim.alican@hotmail.com" & vbCrLf
appMsg = appMsg & "Website: https://yildirimalican.com" & vbCrLf & vbCrLf
appMsg = appMsg & "Starting server, browser will open..."

MsgBox appMsg, 64, "Certificator"

' Start the dev server
objShell.Run batFile, 1, False

' Wait for server to start
WScript.Sleep 4000

' Open in browser
objShell.Run "explorer http://localhost:3000", 0, False
