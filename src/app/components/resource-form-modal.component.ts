import { Component, inject, signal, computed, effect, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ResourceModalService } from '../services/resource-modal.service';
import { FhirService, FhirResource } from '../services/fhir.service';

@Component({
  selector: 'app-resource-form-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './resource-form-modal.component.html',
  styleUrl: './resource-form-modal.component.scss'
})
export class ResourceFormModalComponent {
  protected readonly modalService = inject(ResourceModalService);
  private readonly fb = inject(FormBuilder);
  private readonly fhirService = inject(FhirService);

  // Signals
  protected readonly resourceForm = signal<FormGroup | null>(null);
  protected readonly previewJson = signal<string | null>(null);
  protected readonly isLoading = signal<boolean>(false);

  // Outputs
  readonly resourceCreated = output<FhirResource>();
  readonly resourceUpdated = output<FhirResource>();

  constructor() {
    // Create form when modal opens or resource type changes
    effect(() => {
      if (this.modalService.isOpen() && this.modalService.resourceType()) {
        this.createFormForResourceType();
      }
    });

    // Populate form with existing data when editing
    effect(() => {
      if (this.modalService.mode() === 'edit' && this.modalService.formData() && this.resourceForm()) {
        this.populateFormWithData();
      }
    });
  }

  private createFormForResourceType(): void {
    const resourceType = this.modalService.resourceType();
    if (!resourceType) return;

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

      case 'Procedure':
        form = this.fb.group({
          status: ['completed', Validators.required],
          codeSystem: ['http://snomed.info/sct'],
          codeValue: ['', Validators.required],
          codeDisplay: ['', Validators.required],
          subjectReference: ['', Validators.required],
          performedDateTime: [''],
          performedPeriodStart: [''],
          performedPeriodEnd: [''],
          performedString: [''],
          performerReference: [''],
          performerRole: [''],
          locationReference: [''],
          reasonCodeSystem: [''],
          reasonCodeValue: [''],
          reasonCodeDisplay: [''],
          reasonReference: [''],
          bodySiteSystem: [''],
          bodySiteCode: [''],
          bodySiteDisplay: [''],
          outcomeSystem: [''],
          outcomeCode: [''],
          outcomeDisplay: [''],
          notes: ['']
        });
        break;

      case 'Condition':
        form = this.fb.group({
          clinicalStatus: ['active', Validators.required],
          verificationStatus: ['confirmed', Validators.required],
          category: ['problem-list-item'],
          severity: [''],
          codeSystem: ['http://snomed.info/sct'],
          codeValue: ['', Validators.required],
          codeDisplay: ['', Validators.required],
          subjectReference: ['', Validators.required],
          onsetType: ['onsetDateTime'],
          onsetDateTime: [''],
          onsetString: [''],
          onsetAgeValue: [''],
          onsetAgeUnit: ['years'],
          abatementType: [''],
          abatementDateTime: [''],
          abatementString: [''],
          abatementBoolean: [false],
          recordedDate: [''],
          recorderReference: [''],
          asserterReference: [''],
          bodySiteSystem: [''],
          bodySiteCode: [''],
          bodySiteDisplay: [''],
          notes: ['']
        });
        break;

      case 'Organization':
        form = this.fb.group({
          identifier: ['', Validators.required],
          active: [true],
          name: ['', Validators.required],
          alias: [''],
          typeSystem: ['http://terminology.hl7.org/CodeSystem/organization-type'],
          typeCode: [''],
          typeDisplay: [''],
          addressLine: [''],
          addressCity: [''],
          addressState: [''],
          addressPostalCode: [''],
          addressCountry: [''],
          phone: [''],
          email: [''],
          website: [''],
          contactName: [''],
          contactPhone: [''],
          contactEmail: [''],
          partOfReference: ['']
        });
        break;

      case 'Location':
        form = this.fb.group({
          identifier: ['', Validators.required],
          status: ['active', Validators.required],
          name: ['', Validators.required],
          alias: [''],
          description: [''],
          mode: ['instance'],
          typeSystem: ['http://terminology.hl7.org/CodeSystem/v3-RoleCode'],
          typeCode: [''],
          typeDisplay: [''],
          physicalTypeSystem: ['http://terminology.hl7.org/CodeSystem/location-physical-type'],
          physicalTypeCode: [''],
          physicalTypeDisplay: [''],
          addressLine: [''],
          addressCity: [''],
          addressState: [''],
          addressPostalCode: [''],
          addressCountry: [''],
          phone: [''],
          email: [''],
          longitude: [''],
          latitude: [''],
          altitude: [''],
          managingOrganizationReference: [''],
          partOfReference: ['']
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

  private populateFormWithData(): void {
    const formData = this.modalService.formData();
    const form = this.resourceForm();
    
    if (formData && form) {
      form.patchValue(formData);
    }
  }

  protected async onSubmit(): Promise<void> {
    const form = this.resourceForm();
    if (!form || form.invalid) return;

    this.isLoading.set(true);
    
    try {
      const resource = this.buildResourceFromForm();
      
      if (this.modalService.mode() === 'create') {
        const created = await this.fhirService.createResource(resource);
        if (created) {
          this.resourceCreated.emit(created);
        }
      } else if (this.modalService.mode() === 'edit') {
        const updated = await this.fhirService.updateResource(resource);
        if (updated) {
          this.resourceUpdated.emit(updated);
        }
      }
      
      this.modalService.closeModal();
    } catch (error) {
      console.error('Error saving resource:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private buildResourceFromForm(): any {
    const form = this.resourceForm()!;
    const resourceType = this.modalService.resourceType()!;
    const mode = this.modalService.mode()!;
    const existingResource = this.modalService.resource();

    let resource: any;

    switch (resourceType) {
      case 'Patient':
        resource = this.buildPatientResource(form.value);
        break;
      case 'Observation':
        resource = this.buildObservationResource(form.value);
        break;
      case 'Procedure':
        resource = this.buildProcedureResource(form.value);
        break;
      case 'Condition':
        resource = this.buildConditionResource(form.value);
        break;
      case 'Organization':
        resource = this.buildOrganizationResource(form.value);
        break;
      case 'Location':
        resource = this.buildLocationResource(form.value);
        break;
      default:
        resource = JSON.parse(form.value.resourceJson);
        break;
    }

    // If editing, preserve the resource ID and metadata
    if (mode === 'edit' && existingResource) {
      resource.id = existingResource.id;
      if (existingResource.meta) {
        resource.meta = { ...existingResource.meta };
      }
    }

    return resource;
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

  private buildProcedureResource(formValue: any): any {
    const procedure: any = {
      resourceType: 'Procedure',
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
        reference: formValue.subjectReference.startsWith('Patient/') ? 
          formValue.subjectReference : 
          `Patient/${formValue.subjectReference}`
      }
    };

    // Add performed timing
    if (formValue.performedDateTime) {
      procedure.performedDateTime = formValue.performedDateTime;
    } else if (formValue.performedPeriodStart || formValue.performedPeriodEnd) {
      procedure.performedPeriod = {};
      if (formValue.performedPeriodStart) {
        procedure.performedPeriod.start = formValue.performedPeriodStart;
      }
      if (formValue.performedPeriodEnd) {
        procedure.performedPeriod.end = formValue.performedPeriodEnd;
      }
    } else if (formValue.performedString) {
      procedure.performedString = formValue.performedString;
    }

    // Add performer
    if (formValue.performerReference) {
      procedure.performer = [{
        actor: {
          reference: formValue.performerReference.startsWith('Practitioner/') ? 
            formValue.performerReference : 
            `Practitioner/${formValue.performerReference}`
        }
      }];
      
      if (formValue.performerRole) {
        procedure.performer[0].function = {
          coding: [{
            system: 'http://snomed.info/sct',
            code: formValue.performerRole,
            display: formValue.performerRole
          }]
        };
      }
    }

    // Add location
    if (formValue.locationReference) {
      procedure.location = {
        reference: formValue.locationReference.startsWith('Location/') ? 
          formValue.locationReference : 
          `Location/${formValue.locationReference}`
      };
    }

    // Add reason
    if (formValue.reasonCodeValue) {
      procedure.reasonCode = [{
        coding: [{
          system: formValue.reasonCodeSystem || 'http://snomed.info/sct',
          code: formValue.reasonCodeValue,
          display: formValue.reasonCodeDisplay || formValue.reasonCodeValue
        }]
      }];
    }
    
    if (formValue.reasonReference) {
      procedure.reasonReference = [{
        reference: formValue.reasonReference
      }];
    }

    // Add body site
    if (formValue.bodySiteCode) {
      procedure.bodySite = [{
        coding: [{
          system: formValue.bodySiteSystem || 'http://snomed.info/sct',
          code: formValue.bodySiteCode,
          display: formValue.bodySiteDisplay || formValue.bodySiteCode
        }]
      }];
    }

    // Add outcome
    if (formValue.outcomeCode) {
      procedure.outcome = {
        coding: [{
          system: formValue.outcomeSystem || 'http://snomed.info/sct',
          code: formValue.outcomeCode,
          display: formValue.outcomeDisplay || formValue.outcomeCode
        }]
      };
    }

    // Add notes
    if (formValue.notes) {
      procedure.note = [{
        text: formValue.notes,
        time: new Date().toISOString()
      }];
    }

    return procedure;
  }

  private buildConditionResource(formValue: any): any {
    const condition: any = {
      resourceType: 'Condition',
      clinicalStatus: {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
          code: formValue.clinicalStatus,
          display: formValue.clinicalStatus
        }]
      },
      verificationStatus: {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
          code: formValue.verificationStatus,
          display: formValue.verificationStatus
        }]
      },
      code: {
        coding: [{
          system: formValue.codeSystem,
          code: formValue.codeValue,
          display: formValue.codeDisplay
        }],
        text: formValue.codeDisplay
      },
      subject: {
        reference: formValue.subjectReference.startsWith('Patient/') ? 
          formValue.subjectReference : 
          `Patient/${formValue.subjectReference}`
      }
    };

    // Add category
    if (formValue.category) {
      condition.category = [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/condition-category',
          code: formValue.category,
          display: formValue.category.replace('-', ' ')
        }]
      }];
    }

    // Add severity
    if (formValue.severity) {
      condition.severity = {
        coding: [{
          system: 'http://snomed.info/sct',
          code: formValue.severity,
          display: formValue.severity
        }]
      };
    }

    // Add onset
    switch (formValue.onsetType) {
      case 'onsetDateTime':
        if (formValue.onsetDateTime) {
          condition.onsetDateTime = formValue.onsetDateTime;
        }
        break;
      case 'onsetString':
        if (formValue.onsetString) {
          condition.onsetString = formValue.onsetString;
        }
        break;
      case 'onsetAge':
        if (formValue.onsetAgeValue) {
          condition.onsetAge = {
            value: parseFloat(formValue.onsetAgeValue),
            unit: formValue.onsetAgeUnit,
            system: 'http://unitsofmeasure.org',
            code: formValue.onsetAgeUnit === 'years' ? 'a' : formValue.onsetAgeUnit
          };
        }
        break;
    }

    // Add abatement
    switch (formValue.abatementType) {
      case 'abatementDateTime':
        if (formValue.abatementDateTime) {
          condition.abatementDateTime = formValue.abatementDateTime;
        }
        break;
      case 'abatementString':
        if (formValue.abatementString) {
          condition.abatementString = formValue.abatementString;
        }
        break;
      case 'abatementBoolean':
        condition.abatementBoolean = formValue.abatementBoolean;
        break;
    }

    // Add recorded date
    if (formValue.recordedDate) {
      condition.recordedDate = formValue.recordedDate;
    }

    // Add recorder
    if (formValue.recorderReference) {
      condition.recorder = {
        reference: formValue.recorderReference
      };
    }

    // Add asserter
    if (formValue.asserterReference) {
      condition.asserter = {
        reference: formValue.asserterReference
      };
    }

    // Add body site
    if (formValue.bodySiteCode) {
      condition.bodySite = [{
        coding: [{
          system: formValue.bodySiteSystem || 'http://snomed.info/sct',
          code: formValue.bodySiteCode,
          display: formValue.bodySiteDisplay || formValue.bodySiteCode
        }]
      }];
    }

    // Add notes
    if (formValue.notes) {
      condition.note = [{
        text: formValue.notes,
        time: new Date().toISOString()
      }];
    }

    return condition;
  }

  private buildOrganizationResource(formValue: any): any {
    const organization: any = {
      resourceType: 'Organization',
      identifier: [{
        system: 'http://example.org/organization-ids',
        value: formValue.identifier
      }],
      active: formValue.active,
      name: formValue.name
    };

    // Add alias
    if (formValue.alias) {
      organization.alias = formValue.alias.split(',').map((alias: string) => alias.trim()).filter((alias: string) => alias);
    }

    // Add type
    if (formValue.typeCode) {
      organization.type = [{
        coding: [{
          system: formValue.typeSystem,
          code: formValue.typeCode,
          display: formValue.typeDisplay || formValue.typeCode
        }]
      }];
    }

    // Add address
    if (formValue.addressLine || formValue.addressCity || formValue.addressState || 
        formValue.addressPostalCode || formValue.addressCountry) {
      organization.address = [{
        use: 'work',
        type: 'physical',
        line: formValue.addressLine ? [formValue.addressLine] : undefined,
        city: formValue.addressCity,
        state: formValue.addressState,
        postalCode: formValue.addressPostalCode,
        country: formValue.addressCountry
      }];
    }

    // Add telecom
    const telecom = [];
    if (formValue.phone) {
      telecom.push({
        system: 'phone',
        value: formValue.phone,
        use: 'work'
      });
    }
    if (formValue.email) {
      telecom.push({
        system: 'email',
        value: formValue.email,
        use: 'work'
      });
    }
    if (formValue.website) {
      telecom.push({
        system: 'url',
        value: formValue.website,
        use: 'work'
      });
    }
    if (telecom.length > 0) {
      organization.telecom = telecom;
    }

    // Add contact
    if (formValue.contactName || formValue.contactPhone || formValue.contactEmail) {
      organization.contact = [{
        purpose: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/contactentity-type',
            code: 'ADMIN',
            display: 'Administrative'
          }]
        },
        name: formValue.contactName ? {
          text: formValue.contactName
        } : undefined,
        telecom: [
          formValue.contactPhone ? {
            system: 'phone',
            value: formValue.contactPhone,
            use: 'work'
          } : null,
          formValue.contactEmail ? {
            system: 'email',
            value: formValue.contactEmail,
            use: 'work'
          } : null
        ].filter(t => t !== null)
      }];
    }

    // Add partOf
    if (formValue.partOfReference) {
      organization.partOf = {
        reference: formValue.partOfReference.startsWith('Organization/') ? 
          formValue.partOfReference : 
          `Organization/${formValue.partOfReference}`
      };
    }

    return organization;
  }

  private buildLocationResource(formValue: any): any {
    const location: any = {
      resourceType: 'Location',
      identifier: [{
        system: 'http://example.org/location-ids',
        value: formValue.identifier
      }],
      status: formValue.status,
      name: formValue.name
    };

    // Add alias
    if (formValue.alias) {
      location.alias = formValue.alias.split(',').map((alias: string) => alias.trim()).filter((alias: string) => alias);
    }

    // Add description
    if (formValue.description) {
      location.description = formValue.description;
    }

    // Add mode
    if (formValue.mode) {
      location.mode = formValue.mode;
    }

    // Add type
    if (formValue.typeCode) {
      location.type = [{
        coding: [{
          system: formValue.typeSystem,
          code: formValue.typeCode,
          display: formValue.typeDisplay || formValue.typeCode
        }]
      }];
    }

    // Add physical type
    if (formValue.physicalTypeCode) {
      location.physicalType = {
        coding: [{
          system: formValue.physicalTypeSystem,
          code: formValue.physicalTypeCode,
          display: formValue.physicalTypeDisplay || formValue.physicalTypeCode
        }]
      };
    }

    // Add address
    if (formValue.addressLine || formValue.addressCity || formValue.addressState || 
        formValue.addressPostalCode || formValue.addressCountry) {
      location.address = {
        use: 'work',
        type: 'physical',
        line: formValue.addressLine ? [formValue.addressLine] : undefined,
        city: formValue.addressCity,
        state: formValue.addressState,
        postalCode: formValue.addressPostalCode,
        country: formValue.addressCountry
      };
    }

    // Add telecom
    const telecom = [];
    if (formValue.phone) {
      telecom.push({
        system: 'phone',
        value: formValue.phone,
        use: 'work'
      });
    }
    if (formValue.email) {
      telecom.push({
        system: 'email',
        value: formValue.email,
        use: 'work'
      });
    }
    if (telecom.length > 0) {
      location.telecom = telecom;
    }

    // Add position
    if (formValue.longitude || formValue.latitude || formValue.altitude) {
      location.position = {};
      if (formValue.longitude) {
        location.position.longitude = parseFloat(formValue.longitude);
      }
      if (formValue.latitude) {
        location.position.latitude = parseFloat(formValue.latitude);
      }
      if (formValue.altitude) {
        location.position.altitude = parseFloat(formValue.altitude);
      }
    }

    // Add managing organization
    if (formValue.managingOrganizationReference) {
      location.managingOrganization = {
        reference: formValue.managingOrganizationReference.startsWith('Organization/') ? 
          formValue.managingOrganizationReference : 
          `Organization/${formValue.managingOrganizationReference}`
      };
    }

    // Add partOf
    if (formValue.partOfReference) {
      location.partOf = {
        reference: formValue.partOfReference.startsWith('Location/') ? 
          formValue.partOfReference : 
          `Location/${formValue.partOfReference}`
      };
    }

    return location;
  }

  protected previewResource(): void {
    try {
      const resource = this.buildResourceFromForm();
      this.previewJson.set(JSON.stringify(resource, null, 2));
    } catch (error) {
      console.error('Error building resource:', error);
      this.previewJson.set('Error: Invalid JSON or form data');
    }
  }

  protected onCancel(): void {
    this.previewJson.set(null);
    this.modalService.closeModal();
  }

  protected onOverlayClick(): void {
    this.onCancel();
  }
}