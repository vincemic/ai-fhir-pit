import { Injectable, inject } from '@angular/core';
import { ModalService, ModalConfig } from './modal.service';
import { FhirResource } from './fhir.service';

export interface ResourceModalData {
  mode: 'create' | 'edit';
  resourceType: string;
  resource?: FhirResource;
  formData?: any;
}

@Injectable({
  providedIn: 'root'
})
export class StandardizedResourceModalService {
  private readonly modalService = inject(ModalService);

  /**
   * Open a modal to create a new resource
   */
  openCreateModal(resourceType: string): Promise<FhirResource | undefined> {
    const config: ModalConfig = {
      id: 'resource-form-modal',
      title: `Create ${resourceType}`,
      size: 'lg',
      closeOnBackdrop: false,
      closeOnEscape: true,
      data: {
        mode: 'create',
        resourceType,
        resource: undefined,
        formData: undefined
      } as ResourceModalData
    };

    return this.modalService.open(config);
  }

  /**
   * Open a modal to edit an existing resource
   */
  openEditModal(resource: FhirResource): Promise<FhirResource | undefined> {
    console.log('openEditModal called with resource:', resource);
    const formData = this.extractFormDataFromResource(resource);
    console.log('Extracted form data:', formData);
    
    const config: ModalConfig = {
      id: 'resource-form-modal',
      title: `Edit ${resource.resourceType}`,
      size: 'lg',
      closeOnBackdrop: false,
      closeOnEscape: true,
      data: {
        mode: 'edit',
        resourceType: resource.resourceType,
        resource,
        formData
      } as ResourceModalData
    };

    console.log('Modal config:', config);
    return this.modalService.open(config);
  }

  /**
   * Close any open resource modal
   */
  closeModal(result?: any): void {
    if (this.modalService.isOpen('resource-form-modal')) {
      this.modalService.close('resource-form-modal', result);
    }
  }

  /**
   * Check if a resource modal is open
   */
  isOpen(): boolean {
    return this.modalService.isOpen('resource-form-modal');
  }

  /**
   * Get the current modal data
   */
  getCurrentModalData(): ResourceModalData | undefined {
    const formModal = this.modalService.getModal('resource-form-modal');
    
    return formModal?.config.data as ResourceModalData | undefined;
  }

  private extractFormDataFromResource(resource: FhirResource): any {
    console.log('extractFormDataFromResource called with:', resource.resourceType, resource);
    // Extract form data based on resource type
    switch (resource.resourceType) {
      case 'Patient':
        const patientData = this.extractPatientFormData(resource);
        console.log('Patient form data:', patientData);
        return patientData;
      case 'Observation':
        const observationData = this.extractObservationFormData(resource);
        console.log('Observation form data:', observationData);
        return observationData;
      case 'Practitioner':
        const practitionerData = this.extractPractitionerFormData(resource);
        console.log('Practitioner form data:', practitionerData);
        return practitionerData;
      case 'Organization':
        const organizationData = this.extractOrganizationFormData(resource);
        console.log('Organization form data:', organizationData);
        return organizationData;
      case 'Location':
        const locationData = this.extractLocationFormData(resource);
        console.log('Location form data:', locationData);
        return locationData;
      case 'Procedure':
        const procedureData = this.extractProcedureFormData(resource);
        console.log('Procedure form data:', procedureData);
        return procedureData;
      case 'Condition':
        const conditionData = this.extractConditionFormData(resource);
        console.log('Condition form data:', conditionData);
        return conditionData;
      default:
        const jsonData = {
          resourceJson: JSON.stringify(resource, null, 2)
        };
        console.log('Default JSON data:', jsonData);
        return jsonData;
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
      subjectReference: subject.replace('Patient/', '') || ''
    };
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