Param(
  [string]$Domain = "roulotte.online",
  [string]$TunnelName = "roulotte-tunnel",
  [int]$Port = 3000
)
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
function Exec($cmd){ Write-Host ">" $cmd; Invoke-Expression $cmd }
function Ensure-Cloudflared {
  $cf = Get-Command cloudflared -ErrorAction SilentlyContinue
  if (-not $cf) {
    try {
      Exec "winget install --id Cloudflare.Cloudflared -e --accept-source-agreements --accept-package-agreements"
    } catch {
      $tmp = Join-Path $env:TEMP "cloudflared.msi"
      Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.msi" -OutFile $tmp
      Exec "msiexec /i `"$tmp`" /qn"
    }
  }
}
Ensure-Cloudflared
Exec "cloudflared login"
Exec "cloudflared tunnel create $TunnelName"
$confDir = Join-Path $env:USERPROFILE ".cloudflared"
New-Item -ItemType Directory -Force -Path $confDir | Out-Null
$confPath = Join-Path $confDir "config.yml"
$yml = @"
tunnel: $TunnelName
credentials-file: $confDir\$TunnelName.json
ingress:
  - hostname: $Domain
    service: http://localhost:$Port
  - service: http_status:404
"@
Set-Content -Path $confPath -Value $yml -Encoding UTF8
Exec "cloudflared tunnel route dns $TunnelName $Domain"
Exec "cloudflared service install"
Start-Service cloudflared
Write-Host "Tunnel attivo. Apri https://$Domain/"

