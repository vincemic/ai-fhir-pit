import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { FhirService, FhirResource } from '../services/fhir.service';
import { StandardizedResourceModalService } from '../services/standardized-resource-modal.service';
import { StandardizedResourceFormModalComponent } from './standardized-resource-form-modal.component';

@Component({
  selector: 'app-create',
  imports: [CommonModule, ReactiveFormsModule, StandardizedResourceFormModalComponent],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly fhirService = inject(FhirService);
  protected readonly modalService = inject(StandardizedResourceModalService);

  // Signals for reactive state
  protected readonly createdResource = signal<FhirResource | null>(null);

  // Supported resource types with metadata
  protected readonly supportedResourceTypes = signal([
    {
      value: 'Patient',
      icon: '👤',
      description: 'Individual receiving healthcare services'
    },
    {
      value: 'Practitioner',
      icon: '👩‍⚕️',
      description: 'Healthcare provider or practitioner'
    },
    {
      value: 'Observation',
      icon: '📊',
      description: 'Measurements and simple assertions'
    },
    {
      value: 'Condition',
      icon: '🩺',
      description: 'Clinical problems or diagnoses'
    },
    {
      value: 'Procedure',
      icon: '🏥',
      description: 'Healthcare procedures performed'
    },
    {
      value: 'Organization',
      icon: '🏢',
      description: 'Healthcare organization or facility'
    },
    {
      value: 'Location',
      icon: '📍',
      description: 'Physical location where services are provided'
    },
    {
      value: 'Encounter',
      icon: '📅',
      description: 'Healthcare service interaction'
    },
    {
      value: 'synthetic-bulk',
      icon: '🎲',
      description: 'Generate multiple synthetic resources for testing'
    }
  ]);

  protected selectResourceType(resourceType: string): void {
    if (resourceType === 'synthetic-bulk') {
      // Navigate to synthetic data generation page
      this.router.navigate(['/synthetic']);
    } else {
      this.modalService.openCreateModal(resourceType);
    }
  }

  protected onResourceCreated(resource: FhirResource): void {
    this.createdResource.set(resource);
  }

  protected createAnother(): void {
    this.createdResource.set(null);
  }

  protected viewCreatedResource(): void {
    // Implementation would navigate to view the created resource
    console.log('View created resource:', this.createdResource());
  }
}