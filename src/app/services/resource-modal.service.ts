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

  private originalBodyOverflow: string = '';
  private originalBodyPaddingRight: string = '';

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
    this.lockBodyScroll();
  }

  openEditModal(resource: FhirResource): void {
    this.modalState.set({
      isOpen: true,
      mode: 'edit',
      resourceType: resource.resourceType,
      resource,
      formData: this.extractFormDataFromResource(resource)
    });
    this.lockBodyScroll();
  }

  closeModal(): void {
    this.modalState.set({
      isOpen: false,
      mode: null,
      resourceType: null,
      resource: null,
      formData: null
    });
    this.unlockBodyScroll();
  }

  updateFormData(formData: any): void {
    this.modalState.update(state => ({
      ...state,
      formData
    }));
  }

  private extractFormDataFromResource(resource: FhirResource): any {
    // Extract form data based on resource type
    console.log('ResourceModalService extractFormDataFromResource called with:', resource.resourceType, resource);
    
    switch (resource.resourceType) {
      case 'Patient':
        return this.extractPatientFormData(resource);
      case 'Observation':
        return this.extractObservationFormData(resource);
      case 'Practitioner':
        return this.extractPractitionerFormData(resource);
      case 'Organization':
        return this.extractOrganizationFormData(resource);
      case 'Location':
        return this.extractLocationFormData(resource);
      case 'Procedure':
        return this.extractProcedureFormData(resource);
      case 'Condition':
        return this.extractConditionFormData(resource);
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

  lockBodyScroll(): void {
    if (typeof document === 'undefined') return;
    
    const body = document.body;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    // Store original values
    this.originalBodyOverflow = body.style.overflow;
    this.originalBodyPaddingRight = body.style.paddingRight;
    
    // Apply scroll lock
    body.style.overflow = 'hidden';
    if (scrollBarWidth > 0) {
      body.style.paddingRight = `${scrollBarWidth}px`;
    }
  }

  unlockBodyScroll(): void {
    if (typeof document === 'undefined') return;
    
    const body = document.body;
    
    // Restore original values
    body.style.overflow = this.originalBodyOverflow;
    body.style.paddingRight = this.originalBodyPaddingRight;
  }

  private extractPractitionerFormData(resource: any): any {
    const identifier = resource.identifier?.[0]?.value || '';
    const name = resource.name?.[0];
    const family = name?.family || '';
    const given = name?.given?.join(' ') || '';
    const telecom = resource.telecom || [];
    const phone = telecom.find((t: any) => t.system === 'phone')?.value || '';
    const email = telecom.find((t: any) => t.system === 'email')?.value || '';
    const address = resource.address?.[0];
    const qualification = resource.qualification?.[0];
    const communication = resource.communication?.[0];

    return {
      identifier,
      active: resource.active !== undefined ? resource.active : true,
      family,
      given,
      prefix: name?.prefix?.join(' ') || '',
      suffix: name?.suffix?.join(' ') || '',
      gender: resource.gender || '',
      birthDate: resource.birthDate || '',
      phone,
      email,
      addressLine: address?.line?.join(', ') || '',
      addressCity: address?.city || '',
      addressState: address?.state || '',
      addressPostalCode: address?.postalCode || '',
      addressCountry: address?.country || '',
      qualificationCode: qualification?.code?.coding?.[0]?.code || '',
      qualificationDisplay: qualification?.code?.coding?.[0]?.display || '',
      qualificationIssuer: qualification?.issuer?.display || '',
      qualificationStart: qualification?.period?.start || '',
      qualificationEnd: qualification?.period?.end || '',
      languageCode: communication?.language?.coding?.[0]?.code || '',
      languageDisplay: communication?.language?.coding?.[0]?.display || '',
      languagePreferred: communication?.preferred || false,
      photo: resource.photo?.[0]?.url || ''
    };
  }

  private extractOrganizationFormData(resource: any): any {
    const identifier = resource.identifier?.[0]?.value || '';
    const type = resource.type?.[0]?.coding?.[0];
    const telecom = resource.telecom || [];
    const phone = telecom.find((t: any) => t.system === 'phone')?.value || '';
    const email = telecom.find((t: any) => t.system === 'email')?.value || '';
    const website = telecom.find((t: any) => t.system === 'url')?.value || '';
    const address = resource.address?.[0];
    const contact = resource.contact?.[0];

    return {
      identifier,
      active: resource.active !== undefined ? resource.active : true,
      name: resource.name || '',
      alias: resource.alias?.join(', ') || '',
      typeSystem: type?.system || 'http://terminology.hl7.org/CodeSystem/organization-type',
      typeCode: type?.code || '',
      typeDisplay: type?.display || '',
      addressLine: address?.line?.join(', ') || '',
      addressCity: address?.city || '',
      addressState: address?.state || '',
      addressPostalCode: address?.postalCode || '',
      addressCountry: address?.country || '',
      phone,
      email,
      website,
      contactName: contact?.name?.text || '',
      contactPhone: contact?.telecom?.find((t: any) => t.system === 'phone')?.value || '',
      contactEmail: contact?.telecom?.find((t: any) => t.system === 'email')?.value || '',
      partOfReference: resource.partOf?.reference || ''
    };
  }

  private extractLocationFormData(resource: any): any {
    const identifier = resource.identifier?.[0]?.value || '';
    const type = resource.type?.[0]?.coding?.[0];
    const physicalType = resource.physicalType?.coding?.[0];
    const telecom = resource.telecom || [];
    const phone = telecom.find((t: any) => t.system === 'phone')?.value || '';
    const email = telecom.find((t: any) => t.system === 'email')?.value || '';
    const address = resource.address;
    const position = resource.position;

    return {
      identifier,
      status: resource.status || 'active',
      name: resource.name || '',
      alias: resource.alias?.join(', ') || '',
      description: resource.description || '',
      mode: resource.mode || 'instance',
      typeSystem: type?.system || 'http://terminology.hl7.org/CodeSystem/v3-RoleCode',
      typeCode: type?.code || '',
      typeDisplay: type?.display || '',
      physicalTypeSystem: physicalType?.system || 'http://terminology.hl7.org/CodeSystem/location-physical-type',
      physicalTypeCode: physicalType?.code || '',
      physicalTypeDisplay: physicalType?.display || '',
      addressLine: address?.line?.join(', ') || '',
      addressCity: address?.city || '',
      addressState: address?.state || '',
      addressPostalCode: address?.postalCode || '',
      addressCountry: address?.country || '',
      phone,
      email,
      longitude: position?.longitude?.toString() || '',
      latitude: position?.latitude?.toString() || '',
      altitude: position?.altitude?.toString() || '',
      managingOrganizationReference: resource.managingOrganization?.reference || '',
      partOfReference: resource.partOf?.reference || ''
    };
  }

  private extractProcedureFormData(resource: any): any {
    const code = resource.code?.coding?.[0];
    const reasonCode = resource.reasonCode?.[0]?.coding?.[0];
    const reasonReference = resource.reasonReference?.[0];
    const bodySite = resource.bodySite?.[0]?.coding?.[0];
    const outcome = resource.outcome?.coding?.[0];
    const performer = resource.performer?.[0];

    return {
      status: resource.status || 'completed',
      codeSystem: code?.system || 'http://snomed.info/sct',
      codeValue: code?.code || '',
      codeDisplay: code?.display || '',
      subjectReference: resource.subject?.reference?.replace('Patient/', '') || '',
      performedDateTime: resource.performedDateTime || '',
      performedPeriodStart: resource.performedPeriod?.start || '',
      performedPeriodEnd: resource.performedPeriod?.end || '',
      performedString: resource.performedString || '',
      performerReference: performer?.actor?.reference || '',
      performerRole: performer?.role?.coding?.[0]?.display || '',
      locationReference: resource.location?.reference || '',
      reasonCodeSystem: reasonCode?.system || '',
      reasonCodeValue: reasonCode?.code || '',
      reasonCodeDisplay: reasonCode?.display || '',
      reasonReference: reasonReference?.reference || '',
      bodySiteSystem: bodySite?.system || '',
      bodySiteCode: bodySite?.code || '',
      bodySiteDisplay: bodySite?.display || '',
      outcomeSystem: outcome?.system || '',
      outcomeCode: outcome?.code || '',
      outcomeDisplay: outcome?.display || '',
      notes: resource.note?.[0]?.text || ''
    };
  }

  private extractConditionFormData(resource: any): any {
    const clinicalStatus = resource.clinicalStatus?.coding?.[0];
    const verificationStatus = resource.verificationStatus?.coding?.[0];
    const category = resource.category?.[0]?.coding?.[0];
    const severity = resource.severity?.coding?.[0];
    const code = resource.code?.coding?.[0];
    const bodySite = resource.bodySite?.[0]?.coding?.[0];

    return {
      clinicalStatus: clinicalStatus?.code || 'active',
      verificationStatus: verificationStatus?.code || 'confirmed',
      category: category?.code || 'problem-list-item',
      severity: severity?.code || '',
      codeSystem: code?.system || 'http://snomed.info/sct',
      codeValue: code?.code || '',
      codeDisplay: code?.display || '',
      subjectReference: resource.subject?.reference?.replace('Patient/', '') || '',
      onsetType: resource.onsetDateTime ? 'onsetDateTime' : 
                 resource.onsetString ? 'onsetString' : 
                 resource.onsetAge ? 'onsetAge' : 'onsetDateTime',
      onsetDateTime: resource.onsetDateTime || '',
      onsetString: resource.onsetString || '',
      onsetAgeValue: resource.onsetAge?.value?.toString() || '',
      onsetAgeUnit: resource.onsetAge?.unit || 'years',
      abatementType: resource.abatementDateTime ? 'abatementDateTime' :
                     resource.abatementString ? 'abatementString' :
                     resource.abatementBoolean ? 'abatementBoolean' : '',
      abatementDateTime: resource.abatementDateTime || '',
      abatementString: resource.abatementString || '',
      abatementBoolean: resource.abatementBoolean || false,
      recordedDate: resource.recordedDate || '',
      recorderReference: resource.recorder?.reference || '',
      asserterReference: resource.asserter?.reference || '',
      bodySiteSystem: bodySite?.system || '',
      bodySiteCode: bodySite?.code || '',
      bodySiteDisplay: bodySite?.display || '',
      notes: resource.note?.[0]?.text || ''
    };
  }
}