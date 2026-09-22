$files = @(
    "frontend/js/admin-categories.js",
    "frontend/js/admin-login.js",
    "frontend/js/admin-products.js",
    "frontend/js/admin-reviews.js",
    "frontend/js/admin.js",
    "frontend/js/api.js"
)

Write-Host "`n================ UTF-8 PERSIAN REPAIR ================" -ForegroundColor Cyan

foreach ($file in $files) {

    if (-not (Test-Path $file)) {
        Write-Host "SKIP - File not found: $file" -ForegroundColor Red
        continue
    }

    Write-Host "`nChecking: $file" -ForegroundColor Cyan

    # Current file
    $currentLines = [System.IO.File]::ReadAllLines(
        (Resolve-Path $file).Path,
        [System.Text.Encoding]::UTF8
    )

    # Clean version from Git
    $gitText = git show "HEAD:$file" 2>$null

    if ($LASTEXITCODE -ne 0) {
        Write-Host "SKIP - Git version not found" -ForegroundColor Red
        continue
    }

    $gitLines = $gitText -split "`r?`n"

    $changed = $false

    $max = [Math]::Min(
        $currentLines.Count,
        $gitLines.Count
    )

    for ($i = 0; $i -lt $max; $i++) {

        $current = $currentLines[$i]
        $clean = $gitLines[$i]

        # Detect common UTF-8 mojibake
        $broken =
            $current -match "Ø" -or
            $current -match "Ù" -or
            $current -match "Û" -or
            $current -match "â€" -or
            $current -match "<U\+00"

        # Only replace when:
        # 1. current line looks broken
        # 2. Git line contains real Persian
        if ($broken -and $clean -match "[\u0600-\u06FF]") {

            Write-Host "  Line $($i + 1): Persian repaired" -ForegroundColor Green

            $currentLines[$i] = $clean
            $changed = $true
        }
    }

    if ($changed) {

        [System.IO.File]::WriteAllLines(
            (Resolve-Path $file).Path,
            $currentLines,
            [System.Text.UTF8Encoding]::new($false)
        )

        Write-Host "  FIXED: $file" -ForegroundColor Green
    }
    else {
        Write-Host "  No broken Persian detected." -ForegroundColor DarkGray
    }
}

Write-Host "`n================ REPAIR COMPLETE ================" -ForegroundColor Green
