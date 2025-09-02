import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SynthiaService, SynthiaGenerationRequest } from '../services/synthia.service';
import { FhirService } from '../services/fhir.service';

@Component({
  selector: 'app-synthetic-data',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './synthetic-data.component.html',
  styleUrl: './synthetic-data.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SyntheticDataComponent {
  private readonly fb = inject(FormBuilder);
  protected readonly synthiaService = inject(SynthiaService);
  protected readonly fhirService = inject(FhirService);
  private readonly snackBar = inject(MatSnackBar);

  // Available resource types for generation
  protected readonly availableResourceTypes = [
    { value: 'Patient', label: 'Patient', icon: '👤' },
    { value: 'Practitioner', label: 'Practitioner', icon: '👩‍⚕️' },
    { value: 'Organization', label: 'Organization', icon: '🏢' },
    { value: 'Location', label: 'Location', icon: '📍' },
    { value: 'Observation', label: 'Observation', icon: '📊' },
    { value: 'Condition', label: 'Condition', icon: '🩺' },
    { value: 'Procedure', label: 'Procedure', icon: '🏥' },
    { value: 'MedicationStatement', label: 'Medication Statement', icon: '💊' },
    { value: 'Encounter', label: 'Encounter', icon: '📅' },
    { value: 'DiagnosticReport', label: 'Diagnostic Report', icon: '📋' },
    { value: 'Immunization', label: 'Immunization', icon: '💉' },
    { value: 'AllergyIntolerance', label: 'Allergy Intolerance', icon: '⚠️' }
  ];

  // Form for generation parameters
  protected readonly generationForm = this.fb.group({
    patientCount: [10, [Validators.required, Validators.min(1), Validators.max(1000)]],
    resourceTypes: [['Patient', 'Observation', 'Condition'], Validators.required],
    includeRelatedResources: [true],
    seed: [''],
    locale: ['en_US'],
    dateRangeStart: ['2020-01-01'],
    dateRangeEnd: ['2024-12-31']
  });

  // Computed signals
  protected readonly isConnectedToFhir = computed(() => 
    this.fhirService.serverStatus() === 'connected'
  );

  protected readonly canGenerate = computed(() => 
    this.isConnectedToFhir() && 
    !this.synthiaService.isGenerating() && 
    this.generationForm.valid
  );

  protected readonly estimatedResourceCount = computed(() => {
    const patientCount = this.generationForm.value.patientCount || 0;
    const resourceTypes = this.generationForm.value.resourceTypes || [];
    const includeRelated = this.generationForm.value.includeRelatedResources;
    
    let estimate = patientCount; // Patients themselves
    
    if (includeRelated) {
      // Rough estimate: each patient has 2-5 related resources on average
      const relatedTypes = resourceTypes.filter(type => type !== 'Patient').length;
      estimate += patientCount * Math.min(relatedTypes * 2, 10);
    }
    
    return estimate;
  });

  /**
   * Generate synthetic data
   */
  protected async generateData(): Promise<void> {
    if (!this.canGenerate()) {
      this.snackBar.open('Cannot generate data. Check FHIR connection and form validity.', 'Close', {
        duration: 5000
      });
      return;
    }

    const formValue = this.generationForm.value;
    const request: SynthiaGenerationRequest = {
      patientCount: formValue.patientCount || 10,
      resourceTypes: formValue.resourceTypes || ['Patient'],
      includeRelatedResources: formValue.includeRelatedResources || false,
      seed: formValue.seed || undefined,
      locale: formValue.locale || 'en_US',
      dateRange: {
        start: formValue.dateRangeStart || '2020-01-01',
        end: formValue.dateRangeEnd || '2024-12-31'
      }
    };

    try {
      const result = await this.synthiaService.generateSyntheticData(request);
      
      if (result.success) {
        this.snackBar.open(
          `Successfully generated ${result.generatedCount} resources in ${result.generationTime}ms`,
          'Close',
          { duration: 5000 }
        );
      } else {
        const errorMsg = result.errors?.join(', ') || 'Unknown error occurred';
        this.snackBar.open(`Generation failed: ${errorMsg}`, 'Close', { duration: 8000 });
      }
    } catch (error) {
      this.snackBar.open(
        `Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'Close',
        { duration: 8000 }
      );
    }
  }

  /**
   * Reset form to defaults
   */
  protected resetForm(): void {
    this.generationForm.reset({
      patientCount: 10,
      resourceTypes: ['Patient', 'Observation', 'Condition'],
      includeRelatedResources: true,
      seed: '',
      locale: 'en_US',
      dateRangeStart: '2020-01-01',
      dateRangeEnd: '2024-12-31'
    });
  }

  /**
   * Get resource type display name
   */
  protected getResourceTypeDisplay(value: string): string {
    return this.availableResourceTypes.find(type => type.value === value)?.label || value;
  }

  /**
   * Get resource type icon
   */
  protected getResourceTypeIcon(value: string): string {
    return this.availableResourceTypes.find(type => type.value === value)?.icon || '📄';
  }
}