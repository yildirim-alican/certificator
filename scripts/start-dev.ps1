$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$backendPath = Join-Path $repoRoot "backend"
$frontendPath = Join-Path $repoRoot "frontend"
$backendPy = Join-Path $backendPath "venv\Scripts\python.exe"

if (-not (Test-Path $backendPy)) {
    Write-Host "[backend] Creating venv (prefers Python 3.12)..."
    try {
        py -3.12 -m venv (Join-Path $backendPath "venv")
    } catch {
        Write-Host "[backend] Python 3.12 launcher not found, falling back to default python..."
        python -m venv (Join-Path $backendPath "venv")
    }
}

Write-Host "Starting backend and frontend in separate terminals..."

$backendCmd = @"
Set-Location '$backendPath'
.\venv\Scripts\python.exe -m pip install --upgrade pip setuptools wheel
.\venv\Scripts\python.exe -m pip install -r requirements.txt
.\venv\Scripts\python.exe -m playwright install chromium
.\venv\Scripts\python.exe main.py
"@

$frontendCmd = @"
Set-Location '$frontendPath'
npm install
npm run dev
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd

Write-Host "Done."
Write-Host "Backend:  http://localhost:8000/api/v1"
Write-Host "Frontend: http://localhost:3000"
