import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { FhirService, FhirResource } from '../services/fhir.service';

@Component({
  selector: 'app-create',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateComponent {
  private readonly fb = inject(FormBuilder);
  protected readonly fhirService = inject(FhirService);

  // Signals for reactive state
  protected readonly selectedResourceType = signal<string | null>(null);
  protected readonly resourceForm = signal<FormGroup | null>(null);
  protected readonly createdResource = signal<FhirResource | null>(null);
  protected readonly previewJson = signal<string | null>(null);

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
    }
  ]);

  protected selectResourceType(resourceType: string): void {
    this.selectedResourceType.set(resourceType);
    this.createFormForResourceType(resourceType);
    this.createdResource.set(null);
    this.previewJson.set(null);
  }

  private createFormForResourceType(resourceType: string): void {
    let form: FormGroup;

    switch (resourceType) {
      case 'Patient':
        form = this.fb.group({
          identifier: ['', Validators.required],
          active: [true],
          family: ['', Validators.required],
          given: ['', Validators.required],
          gender: [''],
          birthDate: [''],
          phone: [''],
          email: ['', Validators.email]
        });
        break;

      case 'Observation':
        form = this.fb.group({
          status: ['final', Validators.required],
          effectiveDateTime: ['', Validators.required],
          codeSystem: ['http://loinc.org'],
          codeValue: ['', Validators.required],
          codeDisplay: ['', Validators.required],
          valueType: ['valueQuantity'],
          valueQuantityValue: [''],
          valueQuantityUnit: [''],
          valueStringValue: [''],
          patientReference: ['', Validators.required]
        });
        break;

      default:
        form = this.fb.group({
          resourceJson: ['', Validators.required]
        });
        break;
    }

    this.resourceForm.set(form);
  }

  protected async onSubmit(): Promise<void> {
    const form = this.resourceForm();
    if (!form || form.invalid || !this.selectedResourceType()) return;

    let resource: any;
    
    try {
      resource = this.buildResourceFromForm();
      const created = await this.fhirService.createResource(resource);
      this.createdResource.set(created);
    } catch (error) {
      console.error('Error creating resource:', error);
    }
  }

  private buildResourceFromForm(): any {
    const form = this.resourceForm()!;
    const resourceType = this.selectedResourceType()!;

    switch (resourceType) {
      case 'Patient':
        return this.buildPatientResource(form.value);
      case 'Observation':
        return this.buildObservationResource(form.value);
      default:
        return JSON.parse(form.value.resourceJson);
    }
  }

  private buildPatientResource(formValue: any): any {
    const patient: any = {
      resourceType: 'Patient',
      identifier: [{
        system: 'http://example.org/patient-ids',
        value: formValue.identifier
      }],
      active: formValue.active,
      name: [{
        family: formValue.family,
        given: formValue.given.split(' ').filter((n: string) => n.trim())
      }]
    };

    if (formValue.gender) {
      patient.gender = formValue.gender;
    }

    if (formValue.birthDate) {
      patient.birthDate = formValue.birthDate;
    }

    if (formValue.phone || formValue.email) {
      patient.telecom = [];
      if (formValue.phone) {
        patient.telecom.push({
          system: 'phone',
          value: formValue.phone,
          use: 'mobile'
        });
      }
      if (formValue.email) {
        patient.telecom.push({
          system: 'email',
          value: formValue.email
        });
      }
    }

    return patient;
  }

  private buildObservationResource(formValue: any): any {
    const observation: any = {
      resourceType: 'Observation',
      status: formValue.status,
      code: {
        coding: [{
          system: formValue.codeSystem,
          code: formValue.codeValue,
          display: formValue.codeDisplay
        }],
        text: formValue.codeDisplay
      },
      subject: {
        reference: formValue.patientReference.startsWith('Patient/') ? 
          formValue.patientReference : 
          `Patient/${formValue.patientReference}`
      },
      effectiveDateTime: formValue.effectiveDateTime
    };

    // Add value based on type
    switch (formValue.valueType) {
      case 'valueQuantity':
        if (formValue.valueQuantityValue) {
          observation.valueQuantity = {
            value: parseFloat(formValue.valueQuantityValue),
            unit: formValue.valueQuantityUnit || '',
            system: 'http://unitsofmeasure.org',
            code: formValue.valueQuantityUnit || ''
          };
        }
        break;
      case 'valueString':
        if (formValue.valueStringValue) {
          observation.valueString = formValue.valueStringValue;
        }
        break;
    }

    return observation;
  }

  protected previewResource(): void {
    try {
      const resource = this.buildResourceFromForm();
      this.previewJson.set(JSON.stringify(resource, null, 2));
    } catch (error) {
      console.error('Error building resource:', error);
    }
  }

  protected closePreview(): void {
    this.previewJson.set(null);
  }

  protected async copyToClipboard(): Promise<void> {
    const json = this.previewJson();
    if (json) {
      await navigator.clipboard.writeText(json);
    }
  }

  protected resetForm(): void {
    if (this.selectedResourceType()) {
      this.createFormForResourceType(this.selectedResourceType()!);
    }
  }

  protected saveDraft(): void {
    const form = this.resourceForm();
    if (form) {
      const draftData = {
        resourceType: this.selectedResourceType(),
        formData: form.value,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('fhir-pit-draft', JSON.stringify(draftData));
    }
  }

  protected viewCreatedResource(): void {
    // Implementation would navigate to view the created resource
    console.log('View created resource:', this.createdResource());
  }

  protected createAnother(): void {
    this.createdResource.set(null);
    this.resetForm();
  }
}