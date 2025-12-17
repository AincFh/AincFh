
$files = Get-ChildItem -Path "src/app" -Recurse -Include "page.tsx", "route.ts"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($content -notmatch "export const runtime") {
        $newContent = "export const runtime = 'edge';`n`n" + $content
        Set-Content -Path $file.FullName -Value $newContent
        Write-Host "Updated: $($file.Name)"
    } else {
        Write-Host "Skipped: $($file.Name) (Already has runtime config)"
    }
}
