# dev.ps1 — start backend (with test library) + Vite dev server side by side.
#
# Usage:
#   pwsh scripts/dev.ps1
#
# Backend output goes to .testdata/dev-backend.log, Vite output is left in
# the foreground so you see HMR in real time. Ctrl+C exits the script and
# the trap kills both children.

param(
  [string]$LibraryPath = "$PSScriptRoot/../.testdata/library",
  [string]$DataDir     = "$PSScriptRoot/../.testdata/data",
  [int]$BackendPort    = 21010
)

$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path "$PSScriptRoot/..").Path

# Ensure test library + data dir exist.
New-Item -ItemType Directory -Force $LibraryPath | Out-Null
New-Item -ItemType Directory -Force $DataDir | Out-Null
$LibraryPath = (Resolve-Path $LibraryPath).Path
$DataDir     = (Resolve-Path $DataDir).Path

# Build the backend if it's stale or missing.
$exe = Join-Path $repo 'backend/ugnas_reader.exe'
$srcRoot = Join-Path $repo 'backend'
$needBuild = -not (Test-Path $exe)
if (-not $needBuild) {
  $exeTime = (Get-Item $exe).LastWriteTime
  Get-ChildItem $srcRoot -Recurse -Include *.go,*.sql | ForEach-Object {
    if ($_.LastWriteTime -gt $exeTime) { $script:needBuild = $true }
  }
}
if ($needBuild) {
  Write-Host '[dev] building backend...' -ForegroundColor Cyan
  Push-Location $srcRoot
  & go build -o ugnas_reader.exe ./cmd/ugnas_reader
  $rc = $LASTEXITCODE
  Pop-Location
  if ($rc -ne 0) { Write-Host '[dev] go build failed' -ForegroundColor Red; exit 1 }
}

# Env that the backend reads on startup.
$env:UGAPP_DATA_DIR  = $DataDir
$env:UGAPP_LOG_DIR   = $DataDir
$env:UGAPP_CACHE_DIR = $DataDir
$env:LIBRARY_PATH    = $LibraryPath

$backendLog = Join-Path $DataDir 'dev-backend.log'

Write-Host "[dev] backend  -> http://127.0.0.1:$BackendPort  (log: $backendLog)" -ForegroundColor Cyan
Write-Host "[dev] frontend -> http://localhost:5173" -ForegroundColor Cyan
Write-Host "[dev] library  -> $LibraryPath" -ForegroundColor Cyan
Write-Host "[dev] Ctrl+C to stop both." -ForegroundColor Cyan
Write-Host ''

# Start backend in background, redirect its stdout/stderr to a log.
$backend = Start-Process -FilePath $exe `
  -ArgumentList "--port=$BackendPort" `
  -WorkingDirectory $repo `
  -NoNewWindow -PassThru `
  -RedirectStandardOutput $backendLog `
  -RedirectStandardError  "$backendLog.err"

# Cleanup hook — Ctrl+C lands here via the trap, normal exit hits the finally.
$cleanup = {
  Write-Host ''
  Write-Host '[dev] stopping backend...' -ForegroundColor Yellow
  if ($backend -and -not $backend.HasExited) {
    try { Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue } catch {}
  }
  # Any stray ugnas_reader process from a previous crashed run.
  Get-Process -Name ugnas_reader -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
}

try {
  # Give backend ~1s to bind so the Vite proxy hits a live target on first request.
  Start-Sleep -Milliseconds 800
  if ($backend.HasExited) {
    Write-Host '[dev] backend exited immediately — see log:' -ForegroundColor Red
    Get-Content $backendLog -Tail 30 -ErrorAction SilentlyContinue
    Get-Content "$backendLog.err" -Tail 30 -ErrorAction SilentlyContinue
    & $cleanup
    exit 1
  }

  # Run Vite in the foreground. Ctrl+C kills it AND propagates to this script,
  # which triggers the finally block below to clean up the backend.
  Push-Location (Join-Path $repo 'frontend')
  & pnpm dev
  Pop-Location
} finally {
  & $cleanup
}
