import { Injectable, signal, computed } from '@angular/core';
import { FhirResource } from './fhir.service';

export interface ResourceModalState {
  isOpen: boolean;
  mode: 'create' | 'edit' | null;
  resourceType: string | null;
  resource: FhirResource | null;
  formData: any;
}

@Injectable({
  providedIn: 'root'
})
export class ResourceModalService {
  private readonly modalState = signal<ResourceModalState>({
    isOpen: false,
    mode: null,
    resourceType: null,
    resource: null,
    formData: null
  });

  // Public read-only computed properties
  readonly isOpen = computed(() => this.modalState().isOpen);
  readonly mode = computed(() => this.modalState().mode);
  readonly resourceType = computed(() => this.modalState().resourceType);
  readonly resource = computed(() => this.modalState().resource);
  readonly formData = computed(() => this.modalState().formData);

  openCreateModal(resourceType: string): void {
    this.modalState.set({
      isOpen: true,
      mode: 'create',
      resourceType,
      resource: null,
      formData: null
    });
  }

  openEditModal(resource: FhirResource): void {
    this.modalState.set({
      isOpen: true,
      mode: 'edit',
      resourceType: resource.resourceType,
      resource,
      formData: this.extractFormDataFromResource(resource)
    });
  }

  closeModal(): void {
    this.modalState.set({
      isOpen: false,
      mode: null,
      resourceType: null,
      resource: null,
      formData: null
    });
  }

  updateFormData(formData: any): void {
    this.modalState.update(state => ({
      ...state,
      formData
    }));
  }

  private extractFormDataFromResource(resource: FhirResource): any {
    // Extract form data based on resource type
    switch (resource.resourceType) {
      case 'Patient':
        return this.extractPatientFormData(resource);
      case 'Observation':
        return this.extractObservationFormData(resource);
      default:
        return {
          resourceJson: JSON.stringify(resource, null, 2)
        };
    }
  }

  private extractPatientFormData(resource: any): any {
    const identifier = resource.identifier?.[0]?.value || '';
    const name = resource.name?.[0];
    const family = name?.family || '';
    const given = name?.given?.join(' ') || '';
    const telecom = resource.telecom || [];
    const phone = telecom.find((t: any) => t.system === 'phone')?.value || '';
    const email = telecom.find((t: any) => t.system === 'email')?.value || '';

    return {
      identifier,
      active: resource.active !== undefined ? resource.active : true,
      family,
      given,
      gender: resource.gender || '',
      birthDate: resource.birthDate || '',
      phone,
      email
    };
  }

  private extractObservationFormData(resource: any): any {
    const code = resource.code?.coding?.[0];
    const valueQuantity = resource.valueQuantity;
    const subject = resource.subject?.reference || '';

    return {
      status: resource.status || 'final',
      effectiveDateTime: resource.effectiveDateTime || '',
      codeSystem: code?.system || 'http://loinc.org',
      codeValue: code?.code || '',
      codeDisplay: code?.display || '',
      valueType: resource.valueQuantity ? 'valueQuantity' : 
                 resource.valueString ? 'valueString' : 'valueQuantity',
      valueQuantityValue: valueQuantity?.value || '',
      valueQuantityUnit: valueQuantity?.unit || '',
      valueStringValue: resource.valueString || '',
      patientReference: subject.replace('Patient/', '') || ''
    };
  }
}