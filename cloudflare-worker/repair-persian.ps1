$files = @(
    "frontend/js/admin-categories.js",
    "frontend/js/admin-login.js",
    "frontend/js/admin-products.js",
    "frontend/js/admin-reviews.js",
    "frontend/js/admin.js",
    "frontend/js/api.js"
)

Write-Host "`n================ BACKUP ================" -ForegroundColor Cyan

$backupDir = ".\utf8-repair-backup"

if (Test-Path $backupDir) {
    Remove-Item $backupDir -Recurse -Force
}

New-Item -ItemType Directory -Path $backupDir | Out-Null

foreach ($file in $files) {

    $destination = Join-Path $backupDir $file
    $destinationDir = Split-Path $destination

    New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null

    Copy-Item $file $destination -Force

    Write-Host "Backed up: $file" -ForegroundColor Green
}

Write-Host "`n================ REPAIR ================" -ForegroundColor Cyan

foreach ($file in $files) {

    $currentPath = (Resolve-Path $file).Path

    $currentLines = [System.IO.File]::ReadAllLines(
        $currentPath,
        [System.Text.Encoding]::UTF8
    )

    $gitText = git show "HEAD:$file" 2>$null

    if ($LASTEXITCODE -ne 0) {
        Write-Host "Git version not found: $file" -ForegroundColor Red
        continue
    }

    $gitLines = $gitText -split "`r?`n"

    $changed = $false

    $max = [Math]::Min(
        $currentLines.Count,
        $gitLines.Count
    )

    for ($i = 0; $i -lt $max; $i++) {

        $line = $currentLines[$i]

        $looksBroken = (
            $line -match "Ø" -or
            $line -match "Ù" -or
            $line -match "Û" -or
            $line -match "â€" -or
            $line -match "\+U\+00"
        )

        if ($looksBroken) {

            if ($gitLines[$i] -match "[\u0600-\u06FF]") {

                Write-Host ""
                Write-Host "Repairing:" $file "line" ($i + 1) -ForegroundColor Yellow
                Write-Host "OLD:" $line
                Write-Host "NEW:" $gitLines[$i] -ForegroundColor Green

                $currentLines[$i] = $gitLines[$i]
                $changed = $true
            }
        }
    }

    if ($changed) {

        [System.IO.File]::WriteAllLines(
            $currentPath,
            $currentLines,
            [System.Text.UTF8Encoding]::new($false)
        )

        Write-Host "FIXED: $file" -ForegroundColor Green
    }
    else {
        Write-Host "No broken Persian found: $file" -ForegroundColor Gray
    }
}

Write-Host "`n================ DONE ================" -ForegroundColor Cyan
Write-Host "Backup folder: $backupDir" -ForegroundColor Green
