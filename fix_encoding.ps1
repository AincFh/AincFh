
$files = Get-ChildItem -Path "src/app" -Recurse -Include "*.tsx", "*.ts"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    # 强制使用 UTF8 无 BOM 编码保存
    [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::new($true))
    Write-Host "Fixed encoding: $($file.Name)"
}
