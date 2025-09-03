# PowerShell script to convert inline templates to external HTML files
$componentFiles = Get-ChildItem -Path "." -Name "*.component.ts" | Where-Object { $_ -ne "placeholder-forms.component.ts" -and $_ -ne "encounter-form.component.ts" }

foreach ($file in $componentFiles) {
    $baseName = $file -replace '\.component\.ts$', ''
    $htmlFile = "$baseName.component.html"
    $scssFile = "$baseName.component.scss"
    
    Write-Host "Processing: $file"
    
    # Read the TypeScript file
    $content = Get-Content $file -Raw
    
    # Extract template content between template: ` and `,
    if ($content -match "template:\s*`([\s\S]*?)`,") {
        $templateContent = $matches[1]
        Write-Host "  Found template, writing to $htmlFile"
        
        # Write template to HTML file (or update existing)
        $templateContent | Out-File -FilePath $htmlFile -Encoding UTF8
    }
    
    # Extract styles content between styles: [` and `],
    if ($content -match "styles:\s*\[`([\s\S]*?)`\],") {
        $stylesContent = $matches[1]
        Write-Host "  Found styles, writing to $scssFile"
        
        # Write styles to SCSS file (or update existing)
        $stylesContent | Out-File -FilePath $scssFile -Encoding UTF8
    }
    
    # Update TypeScript file to use external template and styles
    $newContent = $content -replace "template:\s*`[\s\S]*?`,", "templateUrl: './$htmlFile',"
    $newContent = $newContent -replace "styles:\s*\[`[\s\S]*?`\],", "styleUrls: ['./$scssFile'],"
    
    # Write updated TypeScript file
    $newContent | Out-File -FilePath $file -Encoding UTF8
    
    Write-Host "  Updated $file to use external template and styles"
}

Write-Host "Conversion complete!"
