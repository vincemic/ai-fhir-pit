# Convert specific component files to external templates
$files = @(
    "patient-form.component.ts",
    "practitioner-form.component.ts", 
    "organization-form.component.ts",
    "location-form.component.ts"
)

foreach ($filename in $files) {
    $filepath = "c:\tmp\ai-fhir-pit\src\app\components\resource-forms\$filename"
    if (Test-Path $filepath) {
        $content = Get-Content -Path $filepath -Raw
        
        # Extract the template content
        if ($content -match '(?s)template: `(.*?)`') {
            $templateContent = $Matches[1]
            
            # Extract styles content if present
            $stylesContent = ""
            if ($content -match '(?s)styles: \[`(.*?)`\]') {
                $stylesContent = $Matches[1]
            }
            
            # Create HTML file
            $htmlFile = $filepath -replace '\.ts$', '.html'
            Set-Content -Path $htmlFile -Value $templateContent.Trim()
            Write-Host "Created: $htmlFile"
            
            # Create SCSS file if styles exist
            if ($stylesContent -ne "") {
                $scssFile = $filepath -replace '\.ts$', '.scss'
                Set-Content -Path $scssFile -Value $stylesContent.Trim()
                Write-Host "Created: $scssFile"
                
                # Update component to use external files with styles
                $newContent = $content -replace '(?s)template: `.*?`', 'templateUrl: ''./$(($filename -replace "\.ts$", ".html"))'''
                $newContent = $newContent -replace '(?s)styles: \[`.*?`\]', 'styleUrls: [''./$(($filename -replace "\.ts$", ".scss"))'']'
            } else {
                # Check if it has styleUrl already
                if ($content -match 'styleUrl:') {
                    $newContent = $content -replace '(?s)template: `.*?`', 'templateUrl: ''./$(($filename -replace "\.ts$", ".html"))'''
                } else {
                    # Add styleUrls
                    $scssFile = $filepath -replace '\.ts$', '.scss'
                    Set-Content -Path $scssFile -Value ""
                    Write-Host "Created empty: $scssFile"
                    
                    $newContent = $content -replace '(?s)template: `.*?`', 'templateUrl: ''./$(($filename -replace "\.ts$", ".html"))'',\n  styleUrls: [''./$(($filename -replace "\.ts$", ".scss"))'']'
                }
            }
            
            # Write the updated component
            Set-Content -Path $filepath -Value $newContent -NoNewline
            Write-Host "Updated: $filepath"
        } else {
            Write-Host "No template found in: $filename"
        }
    } else {
        Write-Host "File not found: $filepath"
    }
}

Write-Host "Manual conversion complete!"
