# build.ps1 — one-shot pipeline: backend (linux amd64 + arm64) + frontend.
#
# Usage:
#   pwsh scripts/build.ps1           # build everything
#   pwsh scripts/build.ps1 -Check    # also run `ugcli check`
#   pwsh scripts/build.ps1 -Pack 1   # also pack a .upk with --build 1

param(
  [switch]$Check,
  [int]$Pack = 0
)

$ErrorActionPreference = 'Stop'
$repo = Resolve-Path "$PSScriptRoot/.."

Write-Host "[1/3] backend: linux/amd64" -ForegroundColor Cyan
$env:GOOS = 'linux'; $env:GOARCH = 'amd64'; $env:CGO_ENABLED = '0'
Push-Location "$repo/backend"
& go build -trimpath -ldflags="-s -w -X main.Version=0.1.0-dev" `
  -o "$repo/rootfs_amd64/bin/ugnas_reader" ./cmd/ugnas_reader
Pop-Location

Write-Host "[2/3] backend: linux/arm64" -ForegroundColor Cyan
$env:GOOS = 'linux'; $env:GOARCH = 'arm64'; $env:CGO_ENABLED = '0'
Push-Location "$repo/backend"
& go build -trimpath -ldflags="-s -w -X main.Version=0.1.0-dev" `
  -o "$repo/rootfs_arm64/bin/ugnas_reader" ./cmd/ugnas_reader
Pop-Location

Write-Host "[3/3] frontend: vite build" -ForegroundColor Cyan
Push-Location "$repo/frontend"
& pnpm build
Pop-Location

if ($Check) {
  Write-Host "ugcli check" -ForegroundColor Cyan
  Push-Location $repo
  & "$repo/tools/ugcli.exe" check
  Pop-Location
}

if ($Pack -gt 0) {
  Write-Host "ugcli pack --arch all --build $Pack" -ForegroundColor Cyan
  Push-Location $repo
  & "$repo/tools/ugcli.exe" pack --arch all --build $Pack
  Pop-Location
}

Write-Host "Done." -ForegroundColor Green
