# fairy-dsh-skin uninstaller (ASCII only, safe for Windows PowerShell 5.1)
# Restores package.json / cordis.patch.yml from the byte-exact copies the
# installer saved; falls back to surgical removal when no copy exists.

param(
  [string]$Profile = ''
)

$ErrorActionPreference = 'Stop'
$PkgName = 'fairy-dsh-skin'

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
  throw "no DSH profile found under $homeDir\profiles"
}

$ProfileDir = Resolve-Profile $Profile
$Stamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$PatchPath = Join-Path $ProfileDir 'cordis.patch.yml'
$PackagePath = Join-Path $ProfileDir 'package.json'

Write-Host "== fairy-dsh-skin uninstall =="
Write-Host "profile : $ProfileDir"

# ---- 1. cordis.patch.yml: restore original bytes -------------------------
$patchOrig = $PatchPath + '.fairy_orig'
if (Test-Path -LiteralPath $patchOrig) {
  Copy-Item -LiteralPath $patchOrig -Destination $PatchPath -Force
  Remove-Item -LiteralPath $patchOrig -Force
  Write-Host 'restored: cordis.patch.yml (byte-exact)'
} elseif (Test-Path -LiteralPath $PatchPath) {
  $text = [System.IO.File]::ReadAllText($PatchPath)
  if ($text.Contains('# >>> fairy-skin')) {
    Copy-Item -LiteralPath $PatchPath -Destination ($PatchPath + '.bak_fairy_skin_' + $Stamp) -Force
    $lines = $text -split "`r?`n"
    $kept = New-Object System.Collections.Generic.List[string]
    $inside = $false
    foreach ($line in $lines) {
      $trimmed = $line.Trim()
      if ($trimmed -like '# >>> fairy-skin*') { $inside = $true; continue }
      if ($trimmed -like '# <<< fairy-skin*') { $inside = $false; continue }
      if (-not $inside) { $kept.Add($line) }
    }
    Write-Utf8NoBom $PatchPath (($kept -join "`r`n").TrimEnd() + "`r`n")
    Write-Host 'patched : cordis.patch.yml (block removed)'
  } else {
    Write-Host 'skipped : no fairy-skin block'
  }
}

# ---- 2. package.json: restore original bytes -----------------------------
$pkgOrig = $PackagePath + '.fairy_orig'
if (Test-Path -LiteralPath $pkgOrig) {
  Copy-Item -LiteralPath $pkgOrig -Destination $PackagePath -Force
  Remove-Item -LiteralPath $pkgOrig -Force
  Write-Host 'restored: package.json (byte-exact)'
} elseif (Test-Path -LiteralPath $PackagePath) {
  Copy-Item -LiteralPath $PackagePath -Destination ($PackagePath + '.bak_fairy_skin_' + $Stamp) -Force
  $pkg = [System.IO.File]::ReadAllText($PackagePath) | ConvertFrom-Json
  if ($pkg.dependencies -and $pkg.dependencies.PSObject.Properties[$PkgName]) {
    $pkg.dependencies.PSObject.Properties.Remove($PkgName)
  }
  if ($pkg.dsh -and $pkg.dsh.profile -and $pkg.dsh.profile.bundles) {
    $kept = @($pkg.dsh.profile.bundles | Where-Object { $_ -ne $PkgName })
    $pkg.dsh.profile | Add-Member -MemberType NoteProperty -Name bundles -Value $kept -Force
  }
  Write-Utf8NoBom $PackagePath ($pkg | ConvertTo-Json -Depth 32)
  Write-Host 'patched : package.json (entry removed)'
}

# ---- 3. plugin folders ---------------------------------------------------
foreach ($dir in @((Join-Path $ProfileDir $PkgName), (Join-Path $ProfileDir "node_modules\$PkgName"))) {
  if (Test-Path -LiteralPath $dir) {
    Remove-Item -LiteralPath $dir -Recurse -Force
    Write-Host "removed : $dir"
  }
}

Write-Host ''
Write-Host 'DONE. Restart DeepSeek Harness to unload the skin.'
