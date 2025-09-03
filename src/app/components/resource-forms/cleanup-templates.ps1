# PowerShell script to clean up extracted templates
$htmlFiles = Get-ChildItem -Path "." -Name "*.component.html" | Where-Object { $_ -ne "encounter-form.component.html" }

foreach ($file in $htmlFiles) {
    Write-Host "Cleaning: $file"
    
    # Read the HTML file
    $content = Get-Content $file -Raw
    
    # Remove leading and trailing backticks and whitespace
    $cleanContent = $content -replace '^\s*`\s*', '' -replace '\s*`\s*$', ''
    
    # Write cleaned content back
    $cleanContent | Out-File -FilePath $file -Encoding UTF8 -NoNewline
    
    Write-Host "  Cleaned $file"
}

# Also clean SCSS files
$scssFiles = Get-ChildItem -Path "." -Name "*.component.scss" | Where-Object { $_ -ne "encounter-form.component.scss" }

foreach ($file in $scssFiles) {
    Write-Host "Cleaning: $file"
    
    # Read the SCSS file
    $content = Get-Content $file -Raw
    
    # Remove leading and trailing backticks and whitespace
    $cleanContent = $content -replace '^\s*`\s*', '' -replace '\s*`\s*$', ''
    
    # Write cleaned content back
    $cleanContent | Out-File -FilePath $file -Encoding UTF8 -NoNewline
    
    Write-Host "  Cleaned $file"
}

Write-Host "Cleanup complete!"
