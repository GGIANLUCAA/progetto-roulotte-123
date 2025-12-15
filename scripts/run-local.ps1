Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
Push-Location "$PSScriptRoot\..\server"
npm run start
Pop-Location

