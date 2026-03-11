@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo.
    echo Admin Rights Required / Yonetici Hakki Gereklidir
    echo.
    echo Right-click and select "Run as administrator"
    echo Sagina tikla ve "Run as administrator" sec
    echo.
    pause
    exit /b 1
)

cd /d "%~dp0"
set rootDir=%cd%\..
set frontendDir=%rootDir%\frontend
set backendDir=%rootDir%\backend
set tempDir=%rootDir%\temp
if not exist "%tempDir%" mkdir "%tempDir%"

cls
echo.
echo ========================================
echo CERTIFICATOR SETUP
echo ========================================
echo.

REM Verify paths
if not exist "%frontendDir%" (
    echo ERROR: Frontend folder not found
    pause
    exit /b 1
)

REM Step 1: Check and install Node.js
echo [1/4] Checking Node.js...
node --version >nul 2>&1
if %errorLevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do set nodeVersion=%%i
    echo OK - Node.js !nodeVersion! found
    goto checkNpm
) else (
    echo Installing Node.js v20.11.0...
    set nodeUrl=https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi
    set nodeInstaller=%tempDir%\nodejs-installer.msi
    
    echo Downloading...
    powershell -Command "try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('%nodeUrl%', '%nodeInstaller%') } catch { exit 1 }"
    
    if %errorLevel% neq 0 (
        echo ERROR: Could not download Node.js
        echo Please download from: https://nodejs.org/ (v18+)
        pause
        exit /b 1
    )
    
    echo Installing Node.js...
    msiexec /i "%nodeInstaller%" /qn ADDLOCAL=ALL
    timeout /t 30 /nobreak
    
    node --version >nul 2>&1
    if %errorLevel% neq 0 (
        echo ERROR: Node.js installation failed
        pause
        exit /b 1
    )
    
    for /f "tokens=*" %%i in ('node --version') do set nodeVersion=%%i
    echo OK - Node.js !nodeVersion! installed
    del /q "%nodeInstaller%"
    goto checkNpm
)

:checkNpm
REM Step 2: Check npm
echo [2/4] Checking npm...
npm --version >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: npm not found
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set npmVersion=%%i
echo OK - npm v!npmVersion! found

REM Step 3: Check other requirements
echo [3/4] Checking other requirements...

REM Check Git
git --version >nul 2>&1
if %errorLevel% equ 0 (
    for /f "tokens=*" %%i in ('git --version') do set gitVersion=%%i
    echo OK - !gitVersion!
) else (
    echo SKIP - Git not found (optional)
)

REM Check Python (for backend)
if exist "%backendDir%" (
    python --version >nul 2>&1
    if %errorLevel% equ 0 (
        for /f "tokens=*" %%i in ('python --version') do set pythonVersion=%%i
        echo OK - !pythonVersion!
    ) else (
        echo SKIP - Python not found (optional for backend)
    )
)

echo.

REM Step 4: Install frontend packages
echo [4/4] Installing frontend packages...
echo This may take a few minutes...
echo.

cd /d "%frontendDir%"
call npm install

if %errorLevel% neq 0 (
    echo.
    echo ERROR: npm install failed
    pause
    exit /b 1
)

cls
echo.
echo ========================================
echo SUCCESS! Setup Complete!
echo ========================================
echo.
echo Installed:
echo - Node.js: !nodeVersion!
echo - npm: v!npmVersion!

if defined pythonVersion (
    echo - Python: !pythonVersion!
)
if defined gitVersion (
    echo - Git: !gitVersion!
)

echo.
echo You can now:
echo.
echo 1. Close this window
echo.
echo 2. Double-click certificator-launcher.vbs
echo.
echo 3. App will start!
echo.
pause
exit /b 0
