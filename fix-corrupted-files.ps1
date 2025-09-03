$componentFiles = Get-ChildItem -Path "c:\tmp\ai-fhir-pit\src\app\components\resource-forms" -Filter "*.component.ts"

foreach ($file in $componentFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Extract component name from filename
    $componentName = $file.BaseName
    
    # Check if this file has corrupted templateUrl
    if ($content -match 'templateUrl: ''\.\/.*\.component\.html'', .*\) \}\}') {
        Write-Host "Fixing corrupted file: $($file.Name)"
        
        # Fix templateUrl - just keep the file reference
        $content = $content -replace "templateUrl: '(\.\/.*\.component\.html)', .*", "templateUrl: '$1',"
        
        # Fix styleUrls/styleUrl
        $content = $content -replace "styleUrls?: \['(\.\/.*\.component\.scss)'\],.*", "styleUrls: ['$1'],"
        
        # Remove any leftover HTML template content that got mixed in
        $content = $content -replace '(\s+@Component\({[^}]*}\)\s+)', '$1'
        $content = $content -replace '(\s+changeDetection: ChangeDetectionStrategy\.OnPush[^}]*}\)\s+)', '$1'
        
        # Write the fixed content
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($file.Name)"
    }
}

Write-Host "Corruption fix complete!"
