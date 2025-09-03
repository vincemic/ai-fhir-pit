# Simple surgical replacement for component decorators
$files = @(
    "patient-form.component.ts",
    "practitioner-form.component.ts",
    "organization-form.component.ts", 
    "location-form.component.ts"
)

foreach ($filename in $files) {
    $path = "c:\tmp\ai-fhir-pit\src\app\components\resource-forms\$filename"
    if (Test-Path $path) {
        Write-Host "Processing: $filename"
        
        $content = Get-Content -Path $path -Raw
        
        # Replace template: ` with templateUrl: 
        $content = $content -replace "template: ``", "templateUrl: './$($filename -replace '\.ts$', '.html')'"
        
        # Replace styles: [`...`] with styleUrls:
        $content = $content -replace "(?s)styles: \[``.*?``\]", "styleUrls: ['./$($filename -replace '\.ts$', '.scss')']"
        
        # Write back
        Set-Content -Path $path -Value $content -NoNewline
        
        Write-Host "Converted: $filename"
    }
}

Write-Host "Simple conversion complete!"
