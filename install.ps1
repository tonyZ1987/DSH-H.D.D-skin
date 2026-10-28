# fairy-dsh-skin installer (ASCII only, safe for Windows PowerShell 5.1)
#
#   powershell -NoProfile -ExecutionPolicy Bypass -File install.ps1
#   powershell -NoProfile -ExecutionPolicy Bypass -File install.ps1 -Profile "C:\Users\me\.dsh\profiles\desktop"
#
# It only touches two profile files (package.json / cordis.patch.yml) and two
# folders, and it saves the byte-exact originals first so uninstall.ps1 can
# restore them without reformatting anything.

param(
  [string]$Profile = ''
)

$ErrorActionPreference = 'Stop'
$Here = Split-Path -Parent $MyInvocation.MyCommand.Path
$PkgName = 'fairy-dsh-skin'
$SentinelBegin = '# >>> fairy-skin (managed by dsh-skin/install.ps1)'
$SentinelEnd = '# <<< fairy-skin'

function Write-Utf8NoBom([string]$Path, [string]$Text) {
  $enc = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Text, $enc)
}

function Resolve-Profile([string]$Given) {
  if ($Given -ne '') {
    if (-not (Test-Path -LiteralPath $Given)) { throw "profile not found: $Given" }
    return (Resolve-Path -LiteralPath $Given).Path
  }
  $homeDir = $env:DSH_HOME
  if (-not $homeDir) { $homeDir = Join-Path $env:USERPROFILE '.dsh' }
  $candidate = Join-Path $homeDir 'profiles\desktop'
  if (Test-Path -LiteralPath (Join-Path $candidate 'cordis.patch.yml')) { return $candidate }
  $found = Get-ChildItem -Path (Join-Path $homeDir 'profiles') -Directory -ErrorAction SilentlyContinue |
    Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName 'cordis.patch.yml') } |
    Select-Object -First 1
  if ($found) { return $found.FullName }
  throw "no DSH profile with cordis.patch.yml found under $homeDir\profiles"
}

$ProfileDir = Resolve-Profile $Profile
$Stamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$PatchPath = Join-Path $ProfileDir 'cordis.patch.yml'
$PackagePath = Join-Path $ProfileDir 'package.json'

Write-Host "== fairy-dsh-skin install =="
Write-Host "profile : $ProfileDir"

# ---- 1. copy the plugin (profile root + node_modules) --------------------
foreach ($target in @((Join-Path $ProfileDir $PkgName), (Join-Path $ProfileDir "node_modules\$PkgName"))) {
  if (Test-Path -LiteralPath $target) {
    Copy-Item -LiteralPath $target -Destination ($target + '.bak_' + $Stamp) -Recurse -Force
    Remove-Item -LiteralPath $target -Recurse -Force
  }
  $parent = Split-Path -Parent $target
  if (-not (Test-Path -LiteralPath $parent)) { New-Item -ItemType Directory -Path $parent | Out-Null }
  Copy-Item -LiteralPath $Here -Destination $target -Recurse -Force
  # develop-only fixtures / design comps never ship into the profile
  foreach ($drop in @('_work', 'design')) {
    $dropDir = Join-Path $target $drop
    if (Test-Path -LiteralPath $dropDir) { Remove-Item -LiteralPath $dropDir -Recurse -Force }
  }
  Write-Host "copied  : $target"
}

# ---- 2. package.json: dependency + bundle --------------------------------
$pkgOrig = $PackagePath + '.fairy_orig'
if (-not (Test-Path -LiteralPath $pkgOrig)) {
  Copy-Item -LiteralPath $PackagePath -Destination $pkgOrig -Force
  Write-Host "saved   : package.json.fairy_orig"
}
Copy-Item -LiteralPath $PackagePath -Destination ($PackagePath + '.bak_fairy_skin_' + $Stamp) -Force

$pkg = [System.IO.File]::ReadAllText($PackagePath) | ConvertFrom-Json
if (-not $pkg.dependencies) {
  $pkg | Add-Member -MemberType NoteProperty -Name dependencies -Value (New-Object psobject) -Force
}
$pkg.dependencies | Add-Member -MemberType NoteProperty -Name $PkgName -Value ('file:' + $PkgName) -Force

if (-not $pkg.dsh) {
  $pkg | Add-Member -MemberType NoteProperty -Name dsh -Value (New-Object psobject) -Force
}
if (-not $pkg.dsh.profile) {
  $pkg.dsh | Add-Member -MemberType NoteProperty -Name profile -Value (New-Object psobject) -Force
}
$bundles = @()
if ($pkg.dsh.profile.bundles) { $bundles = @($pkg.dsh.profile.bundles) }
if ($bundles -notcontains $PkgName) { $bundles += $PkgName }
$pkg.dsh.profile | Add-Member -MemberType NoteProperty -Name bundles -Value $bundles -Force

Write-Utf8NoBom $PackagePath ($pkg | ConvertTo-Json -Depth 32)
Write-Host "patched : package.json (dependency + bundle)"

# ---- 3. cordis.patch.yml: sentinel block ---------------------------------
$patchText = [System.IO.File]::ReadAllText($PatchPath)
if ($patchText.Contains($SentinelBegin)) {
  Write-Host "skipped : cordis.patch.yml already has the fairy-skin block"
} else {
  $patchOrig = $PatchPath + '.fairy_orig'
  if (-not (Test-Path -LiteralPath $patchOrig)) {
    Copy-Item -LiteralPath $PatchPath -Destination $patchOrig -Force
    Write-Host "saved   : cordis.patch.yml.fairy_orig"
  }
  Copy-Item -LiteralPath $PatchPath -Destination ($PatchPath + '.bak_fairy_skin_' + $Stamp) -Force
  $block = @(
    '',
    $SentinelBegin,
    '- insert:',
    '    - id: fairy-skin',
    ('      name: ''' + $PkgName + ''''),
    $SentinelEnd,
    ''
  ) -join "`r`n"
  Write-Utf8NoBom $PatchPath ($patchText.TrimEnd() + "`r`n" + $block)
  Write-Host "patched : cordis.patch.yml (insert fairy-skin)"
}

Write-Host ''
Write-Host 'DONE. Restart DeepSeek Harness to load the skin (page refresh alone is not enough).'
