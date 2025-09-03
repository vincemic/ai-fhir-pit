import { Component, inject, signal, computed, effect, input, output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalComponent } from './modal.component';
import { ModalService } from '../services/modal.service';
import { ResourceModalData } from '../services/standardized-resource-modal.service';
import { FhirService, FhirResource } from '../services/fhir.service';

@Component({
  selector: 'app-standardized-resource-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  template: `
    <app-modal 
      modalId="resource-form-modal"
      [isVisible]="isVisible()"
      [config]="modalConfig()"
      [hasFooter]="true"
      (modalClosed)="onModalClosed($event)"
    >
      <!-- Modal Body Content -->
      @if (modalData() && resourceForm()) {
        <form [formGroup]="resourceForm()!" (ngSubmit)="onSubmit()" class="resource-form">
          @switch (modalData()!.resourceType) {
            @case ('Patient') {
              <div class="form-grid">
                <!-- Basic Information -->
                <div class="form-section-group">
                  <h3>Basic Information</h3>
                  
                  <div class="form-group">
                    <label for="identifier">Patient ID *</label>
                    <input id="identifier" formControlName="identifier" class="form-control" placeholder="Patient identifier" />
                    @if (resourceForm()!.get('identifier')?.errors?.['required'] && resourceForm()!.get('identifier')?.touched) {
                      <div class="form-error">Patient ID is required</div>
                    }
                  </div>

                  <div class="form-group">
                    <label for="active">Active Status</label>
                    <select id="active" formControlName="active" class="form-control">
                      <option [value]="true">Active</option>
                      <option [value]="false">Inactive</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="family">Family Name *</label>
                    <input id="family" formControlName="family" class="form-control" placeholder="Last name" />
                    @if (resourceForm()!.get('family')?.errors?.['required'] && resourceForm()!.get('family')?.touched) {
                      <div class="form-error">Family name is required</div>
                    }
                  </div>

                  <div class="form-group">
                    <label for="given">Given Name *</label>
                    <input id="given" formControlName="given" class="form-control" placeholder="First name" />
                    @if (resourceForm()!.get('given')?.errors?.['required'] && resourceForm()!.get('given')?.touched) {
                      <div class="form-error">Given name is required</div>
                    }
                  </div>

                  <div class="form-group">
                    <label for="gender">Gender</label>
                    <select id="gender" formControlName="gender" class="form-control">
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="birthDate">Birth Date</label>
                    <input id="birthDate" type="date" formControlName="birthDate" class="form-control" />
                  </div>
                </div>

                <!-- Contact Information -->
                <div class="form-section-group">
                  <h3>Contact Information</h3>
                  
                  <div class="form-group">
                    <label for="phone">Phone Number</label>
                    <input id="phone" type="tel" formControlName="phone" class="form-control" placeholder="+1234567890" />
                  </div>

                  <div class="form-group">
                    <label for="email">Email Address</label>
                    <input id="email" type="email" formControlName="email" class="form-control" placeholder="patient@example.com" />
                  </div>
                </div>
              </div>
            }

            @case ('Practitioner') {
              <div class="form-grid">
                <!-- Basic Information -->
                <div class="form-section-group">
                  <h3>Basic Information</h3>
                  
                  <div class="form-group">
                    <label for="identifier">Practitioner ID *</label>
                    <input id="identifier" formControlName="identifier" class="form-control" placeholder="Practitioner identifier" />
                    @if (resourceForm()!.get('identifier')?.errors?.['required'] && resourceForm()!.get('identifier')?.touched) {
                      <div class="form-error">Practitioner ID is required</div>
                    }
                  </div>

                  <div class="form-group">
                    <label for="active">Active Status</label>
                    <select id="active" formControlName="active" class="form-control">
                      <option [value]="true">Active</option>
                      <option [value]="false">Inactive</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="family">Family Name *</label>
                    <input id="family" formControlName="family" class="form-control" placeholder="Last name" />
                    @if (resourceForm()!.get('family')?.errors?.['required'] && resourceForm()!.get('family')?.touched) {
                      <div class="form-error">Family name is required</div>
                    }
                  </div>

                  <div class="form-group">
                    <label for="given">Given Name *</label>
                    <input id="given" formControlName="given" class="form-control" placeholder="First name" />
                    @if (resourceForm()!.get('given')?.errors?.['required'] && resourceForm()!.get('given')?.touched) {
                      <div class="form-error">Given name is required</div>
                    }
                  </div>

                  <div class="form-group">
                    <label for="gender">Gender</label>
                    <select id="gender" formControlName="gender" class="form-control">
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="birthDate">Birth Date</label>
                    <input id="birthDate" type="date" formControlName="birthDate" class="form-control" />
                  </div>
                </div>

                <!-- Contact Information -->
                <div class="form-section-group">
                  <h3>Contact Information</h3>
                  
                  <div class="form-group">
                    <label for="phone">Phone Number</label>
                    <input id="phone" type="tel" formControlName="phone" class="form-control" placeholder="+1234567890" />
                  </div>

                  <div class="form-group">
                    <label for="email">Email Address</label>
                    <input id="email" type="email" formControlName="email" class="form-control" placeholder="practitioner@example.com" />
                  </div>
                </div>
              </div>
            }

            @case ('Organization') {
              <div class="form-grid">
                <!-- Basic Information -->
                <div class="form-section-group">
                  <h3>Basic Information</h3>
                  
                  <div class="form-group">
                    <label for="identifier">Organization ID *</label>
                    <input id="identifier" formControlName="identifier" class="form-control" placeholder="Organization identifier" />
                    @if (resourceForm()!.get('identifier')?.errors?.['required'] && resourceForm()!.get('identifier')?.touched) {
                      <div class="form-error">Organization ID is required</div>
                    }
                  </div>

                  <div class="form-group">
                    <label for="active">Active Status</label>
                    <select id="active" formControlName="active" class="form-control">
                      <option [value]="true">Active</option>
                      <option [value]="false">Inactive</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="name">Organization Name *</label>
                    <input id="name" formControlName="name" class="form-control" placeholder="Organization name" />
                    @if (resourceForm()!.get('name')?.errors?.['required'] && resourceForm()!.get('name')?.touched) {
                      <div class="form-error">Organization name is required</div>
                    }
                  </div>

                  <div class="form-group">
                    <label for="type">Organization Type</label>
                    <input id="type" formControlName="type" class="form-control" placeholder="e.g., Healthcare Provider" />
                  </div>
                </div>

                <!-- Contact Information -->
                <div class="form-section-group">
                  <h3>Contact Information</h3>
                  
                  <div class="form-group">
                    <label for="phone">Phone Number</label>
                    <input id="phone" type="tel" formControlName="phone" class="form-control" placeholder="+1234567890" />
                  </div>

                  <div class="form-group">
                    <label for="email">Email Address</label>
                    <input id="email" type="email" formControlName="email" class="form-control" placeholder="contact@organization.com" />
                  </div>

                  <div class="form-group">
                    <label for="website">Website</label>
                    <input id="website" type="url" formControlName="website" class="form-control" placeholder="https://www.organization.com" />
                  </div>
                </div>
              </div>
            }

            @case ('Location') {
              <div class="form-grid">
                <!-- Basic Information -->
                <div class="form-section-group">
                  <h3>Basic Information</h3>
                  
                  <div class="form-group">
                    <label for="identifier">Location ID *</label>
                    <input id="identifier" formControlName="identifier" class="form-control" placeholder="Location identifier" />
                    @if (resourceForm()!.get('identifier')?.errors?.['required'] && resourceForm()!.get('identifier')?.touched) {
                      <div class="form-error">Location ID is required</div>
                    }
                  </div>

                  <div class="form-group">
                    <label for="status">Status</label>
                    <select id="status" formControlName="status" class="form-control">
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="name">Location Name *</label>
                    <input id="name" formControlName="name" class="form-control" placeholder="Location name" />
                    @if (resourceForm()!.get('name')?.errors?.['required'] && resourceForm()!.get('name')?.touched) {
                      <div class="form-error">Location name is required</div>
                    }
                  </div>

                  <div class="form-group">
                    <label for="description">Description</label>
                    <textarea id="description" formControlName="description" class="form-control" rows="3" placeholder="Location description"></textarea>
                  </div>

                  <div class="form-group">
                    <label for="mode">Mode</label>
                    <select id="mode" formControlName="mode" class="form-control">
                      <option value="instance">Instance</option>
                      <option value="kind">Kind</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="type">Location Type</label>
                    <input id="type" formControlName="type" class="form-control" placeholder="e.g., Hospital, Clinic" />
                  </div>
                </div>

                <!-- Contact Information -->
                <div class="form-section-group">
                  <h3>Contact Information</h3>
                  
                  <div class="form-group">
                    <label for="phone">Phone Number</label>
                    <input id="phone" type="tel" formControlName="phone" class="form-control" placeholder="+1234567890" />
                  </div>

                  <div class="form-group">
                    <label for="email">Email Address</label>
                    <input id="email" type="email" formControlName="email" class="form-control" placeholder="info@location.com" />
                  </div>
                </div>
              </div>
            }

            @case ('Observation') {
              <div class="form-grid">
                <!-- Basic Information -->
                <div class="form-section-group">
                  <h3>Basic Information</h3>
                  
                  <div class="form-group">
                    <label for="status">Status *</label>
                    <select id="status" formControlName="status" class="form-control">
                      <option value="registered">Registered</option>
                      <option value="preliminary">Preliminary</option>
                      <option value="final">Final</option>
                      <option value="amended">Amended</option>
                      <option value="corrected">Corrected</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="entered-in-error">Entered in Error</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="codeSystem">Code System</label>
                    <select id="codeSystem" formControlName="codeSystem" class="form-control">
                      <option value="http://loinc.org">LOINC</option>
                      <option value="http://snomed.info/sct">SNOMED CT</option>
                      <option value="http://www.nlm.nih.gov/research/umls/rxnorm">RxNorm</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="codeValue">Code Value *</label>
                    <input id="codeValue" formControlName="codeValue" class="form-control" placeholder="e.g., 8867-4" />
                  </div>

                  <div class="form-group">
                    <label for="codeDisplay">Code Display *</label>
                    <input id="codeDisplay" formControlName="codeDisplay" class="form-control" placeholder="e.g., Heart rate" />
                  </div>

                  <div class="form-group">
                    <label for="subjectReference">Patient Reference *</label>
                    <input id="subjectReference" formControlName="subjectReference" class="form-control" placeholder="Patient/123" />
                  </div>

                  <div class="form-group">
                    <label for="effectiveDateTime">Effective Date/Time</label>
                    <input id="effectiveDateTime" type="datetime-local" formControlName="effectiveDateTime" class="form-control" />
                  </div>
                </div>

                <!-- Value Information -->
                <div class="form-section-group">
                  <h3>Value</h3>
                  
                  <div class="form-group">
                    <label for="valueType">Value Type</label>
                    <select id="valueType" formControlName="valueType" class="form-control">
                      <option value="valueQuantity">Quantity</option>
                      <option value="valueString">String</option>
                      <option value="valueCodeableConcept">Codeable Concept</option>
                      <option value="valueBoolean">Boolean</option>
                      <option value="valueDateTime">Date/Time</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="valueQuantityValue">Quantity Value</label>
                    <input id="valueQuantityValue" type="number" formControlName="valueQuantityValue" class="form-control" placeholder="e.g., 72" />
                  </div>

                  <div class="form-group">
                    <label for="valueQuantityUnit">Quantity Unit</label>
                    <input id="valueQuantityUnit" formControlName="valueQuantityUnit" class="form-control" placeholder="e.g., beats/min" />
                  </div>

                  <div class="form-group">
                    <label for="valueStringValue">String Value</label>
                    <input id="valueStringValue" formControlName="valueStringValue" class="form-control" placeholder="Text value" />
                  </div>
                </div>
              </div>
            }

            @case ('Procedure') {
              <div class="form-grid">
                <!-- Basic Information -->
                <div class="form-section-group">
                  <h3>Basic Information</h3>
                  
                  <div class="form-group">
                    <label for="status">Status *</label>
                    <select id="status" formControlName="status" class="form-control">
                      <option value="preparation">Preparation</option>
                      <option value="in-progress">In Progress</option>
                      <option value="not-done">Not Done</option>
                      <option value="on-hold">On Hold</option>
                      <option value="stopped">Stopped</option>
                      <option value="completed">Completed</option>
                      <option value="entered-in-error">Entered in Error</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="codeSystem">Code System</label>
                    <select id="codeSystem" formControlName="codeSystem" class="form-control">
                      <option value="http://snomed.info/sct">SNOMED CT</option>
                      <option value="http://www.ama-assn.org/go/cpt">CPT</option>
                      <option value="http://hl7.org/fhir/sid/icd-10-pcs">ICD-10-PCS</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="codeValue">Code Value *</label>
                    <input id="codeValue" formControlName="codeValue" class="form-control" placeholder="e.g., 80146002" />
                  </div>

                  <div class="form-group">
                    <label for="codeDisplay">Code Display *</label>
                    <input id="codeDisplay" formControlName="codeDisplay" class="form-control" placeholder="e.g., Appendectomy" />
                  </div>

                  <div class="form-group">
                    <label for="subjectReference">Patient Reference *</label>
                    <input id="subjectReference" formControlName="subjectReference" class="form-control" placeholder="Patient/123" />
                  </div>

                  <div class="form-group">
                    <label for="performedDateTime">Performed Date/Time</label>
                    <input id="performedDateTime" type="datetime-local" formControlName="performedDateTime" class="form-control" />
                  </div>
                </div>
              </div>
            }

            @case ('Condition') {
              <div class="form-grid">
                <!-- Basic Information -->
                <div class="form-section-group">
                  <h3>Basic Information</h3>
                  
                  <div class="form-group">
                    <label for="clinicalStatus">Clinical Status *</label>
                    <select id="clinicalStatus" formControlName="clinicalStatus" class="form-control">
                      <option value="active">Active</option>
                      <option value="recurrence">Recurrence</option>
                      <option value="relapse">Relapse</option>
                      <option value="inactive">Inactive</option>
                      <option value="remission">Remission</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="verificationStatus">Verification Status *</label>
                    <select id="verificationStatus" formControlName="verificationStatus" class="form-control">
                      <option value="unconfirmed">Unconfirmed</option>
                      <option value="provisional">Provisional</option>
                      <option value="differential">Differential</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="refuted">Refuted</option>
                      <option value="entered-in-error">Entered in Error</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="codeSystem">Code System</label>
                    <select id="codeSystem" formControlName="codeSystem" class="form-control">
                      <option value="http://snomed.info/sct">SNOMED CT</option>
                      <option value="http://hl7.org/fhir/sid/icd-10-cm">ICD-10-CM</option>
                      <option value="http://hl7.org/fhir/sid/icd-9-cm">ICD-9-CM</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="codeValue">Code Value *</label>
                    <input id="codeValue" formControlName="codeValue" class="form-control" placeholder="e.g., 38341003" />
                  </div>

                  <div class="form-group">
                    <label for="codeDisplay">Code Display *</label>
                    <input id="codeDisplay" formControlName="codeDisplay" class="form-control" placeholder="e.g., Hypertensive disorder" />
                  </div>

                  <div class="form-group">
                    <label for="subjectReference">Patient Reference *</label>
                    <input id="subjectReference" formControlName="subjectReference" class="form-control" placeholder="Patient/123" />
                  </div>

                  <div class="form-group">
                    <label for="onsetDateTime">Onset Date/Time</label>
                    <input id="onsetDateTime" type="datetime-local" formControlName="onsetDateTime" class="form-control" />
                  </div>
                </div>
              </div>
            }

            @case ('Coverage') {
              <div class="form-grid">
                <div class="form-section-group">
                  <h3>Coverage Information</h3>

                  <div class="form-group">
                    <label for="identifier">Coverage ID *</label>
                    <input id="identifier" formControlName="identifier" class="form-control" placeholder="Coverage identifier" />
                    @if (resourceForm()!.get('identifier')?.errors?.['required'] && resourceForm()!.get('identifier')?.touched) {
                      <div class="form-error">Coverage ID is required</div>
                    }
                  </div>

                  <div class="form-group">
                    <label for="status">Status *</label>
                    <select id="status" formControlName="status" class="form-control">
                      <option value="active">Active</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="draft">Draft</option>
                      <option value="entered-in-error">Entered in Error</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="type">Coverage Type</label>
                    <select id="type" formControlName="type" class="form-control">
                      <option value="">Select type...</option>
                      <option value="medical">Medical</option>
                      <option value="dental">Dental</option>
                      <option value="mental-health">Mental Health</option>
                      <option value="substance-abuse">Substance Abuse</option>
                      <option value="vision">Vision</option>
                      <option value="drug">Drug</option>
                      <option value="short-term">Short Term</option>
                      <option value="long-term-care">Long Term Care</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="beneficiary">Beneficiary (Patient) *</label>
                    <input id="beneficiary" formControlName="beneficiary" class="form-control" placeholder="Patient/123" />
                  </div>

                  <div class="form-group">
                    <label for="payor">Payor (Organization) *</label>
                    <input id="payor" formControlName="payor" class="form-control" placeholder="Organization/456" />
                  </div>

                  <div class="form-group">
                    <label for="period_start">Coverage Start Date</label>
                    <input id="period_start" type="date" formControlName="period_start" class="form-control" />
                  </div>

                  <div class="form-group">
                    <label for="period_end">Coverage End Date</label>
                    <input id="period_end" type="date" formControlName="period_end" class="form-control" />
                  </div>
                </div>
              </div>
            }

            @case ('Encounter') {
              <div class="form-grid">
                <div class="form-section-group">
                  <h3>Encounter Information</h3>

                  <div class="form-group">
                    <label for="identifier">Encounter ID *</label>
                    <input id="identifier" formControlName="identifier" class="form-control" placeholder="Encounter identifier" />
                  </div>

                  <div class="form-group">
                    <label for="status">Status *</label>
                    <select id="status" formControlName="status" class="form-control">
                      <option value="planned">Planned</option>
                      <option value="arrived">Arrived</option>
                      <option value="triaged">Triaged</option>
                      <option value="in-progress">In Progress</option>
                      <option value="onleave">On Leave</option>
                      <option value="finished">Finished</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="entered-in-error">Entered in Error</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="class">Class *</label>
                    <select id="class" formControlName="class" class="form-control">
                      <option value="AMB">Ambulatory</option>
                      <option value="EMER">Emergency</option>
                      <option value="FLD">Field</option>
                      <option value="HH">Home Health</option>
                      <option value="IMP">Inpatient</option>
                      <option value="ACUTE">Inpatient Acute</option>
                      <option value="NONAC">Inpatient Non-Acute</option>
                      <option value="OBSENC">Observation Encounter</option>
                      <option value="PRENC">Pre-admission</option>
                      <option value="SS">Short Stay</option>
                      <option value="VR">Virtual</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="subject">Subject (Patient) *</label>
                    <input id="subject" formControlName="subject" class="form-control" placeholder="Patient/123" />
                  </div>

                  <div class="form-group">
                    <label for="period_start">Start Date/Time</label>
                    <input id="period_start" type="datetime-local" formControlName="period_start" class="form-control" />
                  </div>

                  <div class="form-group">
                    <label for="period_end">End Date/Time</label>
                    <input id="period_end" type="datetime-local" formControlName="period_end" class="form-control" />
                  </div>

                  <div class="form-group">
                    <label for="serviceProvider">Service Provider (Organization)</label>
                    <input id="serviceProvider" formControlName="serviceProvider" class="form-control" placeholder="Organization/456" />
                  </div>
                </div>
              </div>
            }

            @case ('MedicationStatement') {
              <div class="form-grid">
                <div class="form-section-group">
                  <h3>Medication Statement Information</h3>

                  <div class="form-group">
                    <label for="identifier">Statement ID *</label>
                    <input id="identifier" formControlName="identifier" class="form-control" placeholder="MedicationStatement identifier" />
                  </div>

                  <div class="form-group">
                    <label for="status">Status *</label>
                    <select id="status" formControlName="status" class="form-control">
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="entered-in-error">Entered in Error</option>
                      <option value="intended">Intended</option>
                      <option value="stopped">Stopped</option>
                      <option value="on-hold">On Hold</option>
                      <option value="unknown">Unknown</option>
                      <option value="not-taken">Not Taken</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="medicationCodeSystem">Medication Code System</label>
                    <select id="medicationCodeSystem" formControlName="medicationCodeSystem" class="form-control">
                      <option value="http://www.nlm.nih.gov/research/umls/rxnorm">RxNorm</option>
                      <option value="http://snomed.info/sct">SNOMED CT</option>
                      <option value="http://hl7.org/fhir/sid/ndc">NDC</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="medicationCode">Medication Code *</label>
                    <input id="medicationCode" formControlName="medicationCode" class="form-control" placeholder="e.g., 314076" />
                  </div>

                  <div class="form-group">
                    <label for="medicationDisplay">Medication Display *</label>
                    <input id="medicationDisplay" formControlName="medicationDisplay" class="form-control" placeholder="e.g., Lisinopril 10mg tablet" />
                  </div>

                  <div class="form-group">
                    <label for="subject">Subject (Patient) *</label>
                    <input id="subject" formControlName="subject" class="form-control" placeholder="Patient/123" />
                  </div>

                  <div class="form-group">
                    <label for="effectiveDateTime">Effective Date/Time</label>
                    <input id="effectiveDateTime" type="datetime-local" formControlName="effectiveDateTime" class="form-control" />
                  </div>

                  <div class="form-group">
                    <label for="dosage">Dosage Instructions</label>
                    <textarea id="dosage" formControlName="dosage" class="form-control" rows="3" placeholder="e.g., Take one tablet daily with food"></textarea>
                  </div>
                </div>
              </div>
            }

            @case ('DiagnosticReport') {
              <div class="form-grid">
                <div class="form-section-group">
                  <h3>Diagnostic Report Information</h3>

                  <div class="form-group">
                    <label for="identifier">Report ID *</label>
                    <input id="identifier" formControlName="identifier" class="form-control" placeholder="DiagnosticReport identifier" />
                  </div>

                  <div class="form-group">
                    <label for="status">Status *</label>
                    <select id="status" formControlName="status" class="form-control">
                      <option value="registered">Registered</option>
                      <option value="partial">Partial</option>
                      <option value="preliminary">Preliminary</option>
                      <option value="final">Final</option>
                      <option value="amended">Amended</option>
                      <option value="corrected">Corrected</option>
                      <option value="appended">Appended</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="entered-in-error">Entered in Error</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="category">Category</label>
                    <select id="category" formControlName="category" class="form-control">
                      <option value="">Select category...</option>
                      <option value="LAB">Laboratory</option>
                      <option value="RAD">Radiology</option>
                      <option value="CT">Cardiology</option>
                      <option value="URO">Urology</option>
                      <option value="PATH">Pathology</option>
                      <option value="OTH">Other</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="codeSystem">Code System</label>
                    <select id="codeSystem" formControlName="codeSystem" class="form-control">
                      <option value="http://loinc.org">LOINC</option>
                      <option value="http://snomed.info/sct">SNOMED CT</option>
                      <option value="http://www.ama-assn.org/go/cpt">CPT</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="code">Report Code *</label>
                    <input id="code" formControlName="code" class="form-control" placeholder="e.g., 58410-2" />
                  </div>

                  <div class="form-group">
                    <label for="codeDisplay">Code Display *</label>
                    <input id="codeDisplay" formControlName="codeDisplay" class="form-control" placeholder="e.g., CBC panel - Blood by Automated count" />
                  </div>

                  <div class="form-group">
                    <label for="subject">Subject (Patient) *</label>
                    <input id="subject" formControlName="subject" class="form-control" placeholder="Patient/123" />
                  </div>

                  <div class="form-group">
                    <label for="effectiveDateTime">Effective Date/Time</label>
                    <input id="effectiveDateTime" type="datetime-local" formControlName="effectiveDateTime" class="form-control" />
                  </div>

                  <div class="form-group">
                    <label for="conclusion">Conclusion</label>
                    <textarea id="conclusion" formControlName="conclusion" class="form-control" rows="4" placeholder="Report conclusion or interpretation"></textarea>
                  </div>
                </div>
              </div>
            }

            @case ('Immunization') {
              <div class="form-grid">
                <div class="form-section-group">
                  <h3>Immunization Information</h3>

                  <div class="form-group">
                    <label for="identifier">Immunization ID *</label>
                    <input id="identifier" formControlName="identifier" class="form-control" placeholder="Immunization identifier" />
                  </div>

                  <div class="form-group">
                    <label for="status">Status *</label>
                    <select id="status" formControlName="status" class="form-control">
                      <option value="completed">Completed</option>
                      <option value="entered-in-error">Entered in Error</option>
                      <option value="not-done">Not Done</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="vaccineCodeSystem">Vaccine Code System</label>
                    <select id="vaccineCodeSystem" formControlName="vaccineCodeSystem" class="form-control">
                      <option value="http://hl7.org/fhir/sid/cvx">CVX</option>
                      <option value="http://snomed.info/sct">SNOMED CT</option>
                      <option value="http://hl7.org/fhir/sid/ndc">NDC</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="vaccineCode">Vaccine Code *</label>
                    <input id="vaccineCode" formControlName="vaccineCode" class="form-control" placeholder="e.g., 207" />
                  </div>

                  <div class="form-group">
                    <label for="vaccineDisplay">Vaccine Display *</label>
                    <input id="vaccineDisplay" formControlName="vaccineDisplay" class="form-control" placeholder="e.g., COVID-19, mRNA, LNP-S, PF, 30 mcg/0.3 mL dose" />
                  </div>

                  <div class="form-group">
                    <label for="patient">Patient *</label>
                    <input id="patient" formControlName="patient" class="form-control" placeholder="Patient/123" />
                  </div>

                  <div class="form-group">
                    <label for="occurrenceDateTime">Occurrence Date/Time *</label>
                    <input id="occurrenceDateTime" type="datetime-local" formControlName="occurrenceDateTime" class="form-control" />
                  </div>

                  <div class="form-group">
                    <label for="primarySource">Primary Source</label>
                    <select id="primarySource" formControlName="primarySource" class="form-control">
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="lotNumber">Lot Number</label>
                    <input id="lotNumber" formControlName="lotNumber" class="form-control" placeholder="Vaccine lot number" />
                  </div>

                  <div class="form-group">
                    <label for="performer">Performer (Practitioner)</label>
                    <input id="performer" formControlName="performer" class="form-control" placeholder="Practitioner/456" />
                  </div>
                </div>
              </div>
            }

            @case ('AllergyIntolerance') {
              <div class="form-grid">
                <div class="form-section-group">
                  <h3>Allergy/Intolerance Information</h3>

                  <div class="form-group">
                    <label for="identifier">Allergy ID *</label>
                    <input id="identifier" formControlName="identifier" class="form-control" placeholder="AllergyIntolerance identifier" />
                  </div>

                  <div class="form-group">
                    <label for="clinicalStatus">Clinical Status</label>
                    <select id="clinicalStatus" formControlName="clinicalStatus" class="form-control">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="verificationStatus">Verification Status</label>
                    <select id="verificationStatus" formControlName="verificationStatus" class="form-control">
                      <option value="unconfirmed">Unconfirmed</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="refuted">Refuted</option>
                      <option value="entered-in-error">Entered in Error</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="type">Type</label>
                    <select id="type" formControlName="type" class="form-control">
                      <option value="allergy">Allergy</option>
                      <option value="intolerance">Intolerance</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="category">Category</label>
                    <select id="category" formControlName="category" class="form-control">
                      <option value="food">Food</option>
                      <option value="medication">Medication</option>
                      <option value="environment">Environment</option>
                      <option value="biologic">Biologic</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="criticality">Criticality</label>
                    <select id="criticality" formControlName="criticality" class="form-control">
                      <option value="low">Low Risk</option>
                      <option value="high">High Risk</option>
                      <option value="unable-to-assess">Unable to Assess Risk</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="codeSystem">Code System</label>
                    <select id="codeSystem" formControlName="codeSystem" class="form-control">
                      <option value="http://snomed.info/sct">SNOMED CT</option>
                      <option value="http://www.nlm.nih.gov/research/umls/rxnorm">RxNorm</option>
                      <option value="http://fdasis.nlm.nih.gov">UNII</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="code">Allergen Code *</label>
                    <input id="code" formControlName="code" class="form-control" placeholder="e.g., 227493005" />
                  </div>

                  <div class="form-group">
                    <label for="codeDisplay">Allergen Display *</label>
                    <input id="codeDisplay" formControlName="codeDisplay" class="form-control" placeholder="e.g., Cashew nuts" />
                  </div>

                  <div class="form-group">
                    <label for="patient">Patient *</label>
                    <input id="patient" formControlName="patient" class="form-control" placeholder="Patient/123" />
                  </div>

                  <div class="form-group">
                    <label for="onsetDateTime">Onset Date/Time</label>
                    <input id="onsetDateTime" type="datetime-local" formControlName="onsetDateTime" class="form-control" />
                  </div>

                  <div class="form-group">
                    <label for="note">Additional Notes</label>
                    <textarea id="note" formControlName="note" class="form-control" rows="3" placeholder="Additional information about the allergy/intolerance"></textarea>
                  </div>
                </div>
              </div>
            }
            
            @default {
              <div class="form-grid">
                <div class="form-section-group">
                  <h3>JSON Editor</h3>
                  <p>Use the JSON editor below to {{ modalData()!.mode }} your {{ modalData()!.resourceType }} resource:</p>
                  
                  <div class="form-group">
                    <label for="resourceJson">Resource JSON *</label>
                    <textarea 
                      id="resourceJson" 
                      formControlName="resourceJson" 
                      class="form-control json-editor"
                      rows="20"
                      placeholder="Enter your {{ modalData()!.resourceType }} JSON here..."
                    ></textarea>
                  </div>
                </div>
              </div>
            }
          }
        </form>
      }

      <!-- Preview Section -->
      @if (previewJson()) {
        <div class="preview-section">
          <h3>Resource Preview</h3>
          <pre class="preview-json">{{ previewJson() }}</pre>
        </div>
      }

      <!-- Footer Actions -->
      <div slot="footer" class="form-actions">
        <button 
          type="button"
          (click)="previewResource()"
          [disabled]="!resourceForm() || resourceForm()!.invalid"
          class="btn-secondary"
        >
          👁️ Preview JSON
        </button>
        
        <button 
          type="button"
          (click)="onSubmit()"
          [disabled]="isLoading() || !resourceForm() || resourceForm()!.invalid"
          class="btn-primary"
        >
          @if (isLoading()) {
            <span class="loading-spinner"></span>
            @if (modalData()?.mode === 'create') {
              Creating...
            } @else {
              Updating...
            }
          } @else {
            @if (modalData()?.mode === 'create') {
              ✅ Create {{ modalData()?.resourceType }}
            } @else {
              💾 Update {{ modalData()?.resourceType }}
            }
          }
        </button>
        
        <button type="button" (click)="onCancel()" class="btn-secondary">
          Cancel
        </button>
      </div>
    </app-modal>
  `,
  styleUrl: './standardized-resource-form-modal.component.scss'
})
export class StandardizedResourceFormModalComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly fhirService = inject(FhirService);
  private readonly modalService = inject(ModalService);

  // Input data
  readonly data = input<ResourceModalData>();

  // Outputs
  readonly resourceCreated = output<FhirResource>();
  readonly resourceUpdated = output<FhirResource>();

  // Signals
  protected readonly resourceForm = signal<FormGroup | null>(null);
  protected readonly previewJson = signal<string | null>(null);
  protected readonly isLoading = signal<boolean>(false);

  // Computed properties
  protected readonly modalData = computed(() => {
    return this.data() || this.getModalDataFromService();
  });

  protected readonly isVisible = computed(() => {
    return this.modalService.isOpen('resource-form-modal');
  });

  protected readonly modalConfig = computed(() => {
    const data = this.modalData();
    return {
      id: 'resource-form-modal',
      title: data ? `${data.mode === 'create' ? 'Create' : 'Edit'} ${data.resourceType}` : 'Resource Form',
      size: 'lg' as const,
      closeOnBackdrop: false,
      closeOnEscape: true,
      showCloseButton: true
    };
  });

  constructor() {
    // Create form when modal data changes
    effect(() => {
      const data = this.modalData();
      console.log('Modal data changed:', data);
      if (data && data.resourceType) {
        this.createFormForResourceType(data.resourceType);
      }
    });

    // Populate form with existing data when editing
    effect(() => {
      const data = this.modalData();
      console.log('Checking for form population:', data);
      if (data && data.mode === 'edit' && data.formData && this.resourceForm()) {
        console.log('Populating form with data:', data.formData);
        this.populateFormWithData(data.formData);
      }
    });
  }

  ngOnDestroy(): void {
    // Ensure modal is closed if component is destroyed while modal is open
    if (this.modalService.isOpen('resource-form-modal')) {
      this.modalService.close('resource-form-modal');
    }
  }

  private getModalDataFromService(): ResourceModalData | undefined {
    const modal = this.modalService.getModal('resource-form-modal');
    return modal?.config.data as ResourceModalData | undefined;
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
          effectiveDateTime: [''],
          codeSystem: ['http://loinc.org'],
          codeValue: ['', Validators.required],
          codeDisplay: ['', Validators.required],
          valueType: ['valueQuantity'],
          valueQuantityValue: [''],
          valueQuantityUnit: [''],
          valueStringValue: [''],
          subjectReference: ['', Validators.required]
        });
        break;

      case 'Practitioner':
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

      case 'Organization':
        form = this.fb.group({
          identifier: ['', Validators.required],
          active: [true],
          name: ['', Validators.required],
          type: [''],
          phone: [''],
          email: [''],
          website: ['']
        });
        break;

      case 'Location':
        form = this.fb.group({
          identifier: ['', Validators.required],
          status: ['active'],
          name: ['', Validators.required],
          description: [''],
          mode: ['instance'],
          type: [''],
          phone: [''],
          email: ['']
        });
        break;

      case 'Procedure':
        form = this.fb.group({
          status: ['completed', Validators.required],
          codeSystem: ['http://snomed.info/sct'],
          codeValue: ['', Validators.required],
          codeDisplay: ['', Validators.required],
          subjectReference: ['', Validators.required],
          performedDateTime: ['']
        });
        break;

      case 'Condition':
        form = this.fb.group({
          clinicalStatus: ['active', Validators.required],
          verificationStatus: ['confirmed', Validators.required],
          codeSystem: ['http://snomed.info/sct'],
          codeValue: ['', Validators.required],
          codeDisplay: ['', Validators.required],
          subjectReference: ['', Validators.required],
          onsetDateTime: ['']
        });
        break;

      case 'Coverage':
        form = this.fb.group({
          identifier: ['', Validators.required],
          status: ['active', Validators.required],
          type: [''],
          beneficiary: ['', Validators.required],
          payor: ['', Validators.required],
          period_start: [''],
          period_end: ['']
        });
        break;

      case 'Encounter':
        form = this.fb.group({
          identifier: ['', Validators.required],
          status: ['finished', Validators.required],
          class: ['AMB', Validators.required],
          subject: ['', Validators.required],
          period_start: [''],
          period_end: [''],
          serviceProvider: ['']
        });
        break;

      case 'MedicationStatement':
        form = this.fb.group({
          identifier: ['', Validators.required],
          status: ['active', Validators.required],
          medicationCodeSystem: ['http://www.nlm.nih.gov/research/umls/rxnorm'],
          medicationCode: ['', Validators.required],
          medicationDisplay: ['', Validators.required],
          subject: ['', Validators.required],
          effectiveDateTime: [''],
          dosage: ['']
        });
        break;

      case 'DiagnosticReport':
        form = this.fb.group({
          identifier: ['', Validators.required],
          status: ['final', Validators.required],
          category: [''],
          codeSystem: ['http://loinc.org'],
          code: ['', Validators.required],
          codeDisplay: ['', Validators.required],
          subject: ['', Validators.required],
          effectiveDateTime: [''],
          conclusion: ['']
        });
        break;

      case 'Immunization':
        form = this.fb.group({
          identifier: ['', Validators.required],
          status: ['completed', Validators.required],
          vaccineCodeSystem: ['http://hl7.org/fhir/sid/cvx'],
          vaccineCode: ['', Validators.required],
          vaccineDisplay: ['', Validators.required],
          patient: ['', Validators.required],
          occurrenceDateTime: ['', Validators.required],
          primarySource: ['true'],
          lotNumber: [''],
          performer: ['']
        });
        break;

      case 'AllergyIntolerance':
        form = this.fb.group({
          identifier: ['', Validators.required],
          clinicalStatus: ['active'],
          verificationStatus: ['confirmed'],
          type: ['allergy'],
          category: ['food'],
          criticality: ['low'],
          codeSystem: ['http://snomed.info/sct'],
          code: ['', Validators.required],
          codeDisplay: ['', Validators.required],
          patient: ['', Validators.required],
          onsetDateTime: [''],
          note: ['']
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

  private populateFormWithData(formData: any): void {
    const form = this.resourceForm();
    
    if (formData && form) {
      form.patchValue(formData);
    }
  }

  protected async onSubmit(): Promise<void> {
    const form = this.resourceForm();
    const data = this.modalData();
    
    if (!form || form.invalid || !data) return;

    this.isLoading.set(true);
    
    try {
      const resource = this.buildResourceFromForm(data);
      
      if (data.mode === 'create') {
        const created = await this.fhirService.createResource(resource);
        if (created) {
          this.resourceCreated.emit(created);
          this.modalService.close('resource-form-modal', created);
        }
      } else if (data.mode === 'edit') {
        const updated = await this.fhirService.updateResource(resource);
        if (updated) {
          this.resourceUpdated.emit(updated);
          this.modalService.close('resource-form-modal', updated);
        }
      }
    } catch (error) {
      console.error('Error saving resource:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  protected previewResource(): void {
    try {
      const data = this.modalData();
      if (!data) return;
      
      const resource = this.buildResourceFromForm(data);
      this.previewJson.set(JSON.stringify(resource, null, 2));
    } catch (error) {
      console.error('Error building resource:', error);
      this.previewJson.set('Error: Invalid JSON or form data');
    }
  }

  protected onCancel(): void {
    this.previewJson.set(null);
    this.modalService.close('resource-form-modal');
  }

  protected onModalClosed(result?: any): void {
    // Modal is already closed by the modal service
    this.previewJson.set(null);
  }

  private buildResourceFromForm(data: ResourceModalData): any {
    const form = this.resourceForm()!;
    const resourceType = data.resourceType;
    const mode = data.mode;
    const existingResource = data.resource;

    let resource: any;

    switch (resourceType) {
      case 'Patient':
        resource = this.buildPatientResource(form.value);
        break;
      case 'Coverage':
        resource = this.buildCoverageResource(form.value);
        break;
      case 'Encounter':
        resource = this.buildEncounterResource(form.value);
        break;
      case 'MedicationStatement':
        resource = this.buildMedicationStatementResource(form.value);
        break;
      case 'DiagnosticReport':
        resource = this.buildDiagnosticReportResource(form.value);
        break;
      case 'Immunization':
        resource = this.buildImmunizationResource(form.value);
        break;
      case 'AllergyIntolerance':
        resource = this.buildAllergyIntoleranceResource(form.value);
        break;
      default:
        // Use JSON editor for unsupported resource types
        try {
          resource = JSON.parse(form.value.resourceJson);
        } catch (error) {
          throw new Error('Invalid JSON in resource editor');
        }
        break;
    }

    // If editing, preserve ID and meta
    if (mode === 'edit' && existingResource) {
      resource.id = existingResource.id;
      if (existingResource.meta) {
        resource.meta = existingResource.meta;
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
        given: [formValue.given]
      }]
    };

    if (formValue.gender) {
      patient.gender = formValue.gender;
    }

    if (formValue.birthDate) {
      patient.birthDate = formValue.birthDate;
    }

    // Add telecom
    const telecom = [];
    if (formValue.phone) {
      telecom.push({
        system: 'phone',
        value: formValue.phone,
        use: 'home'
      });
    }
    if (formValue.email) {
      telecom.push({
        system: 'email',
        value: formValue.email,
        use: 'home'
      });
    }
    if (telecom.length > 0) {
      patient.telecom = telecom;
    }

    return patient;
  }

  private buildCoverageResource(formValue: any): any {
    const coverage: any = {
      resourceType: 'Coverage',
      identifier: [{
        system: 'http://example.org/coverage-ids',
        value: formValue.identifier
      }],
      status: formValue.status,
      beneficiary: {
        reference: formValue.beneficiary
      },
      payor: [{
        reference: formValue.payor
      }]
    };

    if (formValue.type) {
      coverage.type = {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
          code: formValue.type,
          display: formValue.type
        }]
      };
    }

    if (formValue.period_start || formValue.period_end) {
      coverage.period = {};
      if (formValue.period_start) {
        coverage.period.start = formValue.period_start;
      }
      if (formValue.period_end) {
        coverage.period.end = formValue.period_end;
      }
    }

    return coverage;
  }

  private buildEncounterResource(formValue: any): any {
    const encounter: any = {
      resourceType: 'Encounter',
      identifier: [{
        system: 'http://example.org/encounter-ids',
        value: formValue.identifier
      }],
      status: formValue.status,
      class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: formValue.class,
        display: formValue.class
      },
      subject: {
        reference: formValue.subject
      }
    };

    if (formValue.period_start || formValue.period_end) {
      encounter.period = {};
      if (formValue.period_start) {
        encounter.period.start = formValue.period_start;
      }
      if (formValue.period_end) {
        encounter.period.end = formValue.period_end;
      }
    }

    if (formValue.serviceProvider) {
      encounter.serviceProvider = {
        reference: formValue.serviceProvider
      };
    }

    return encounter;
  }

  private buildMedicationStatementResource(formValue: any): any {
    const medicationStatement: any = {
      resourceType: 'MedicationStatement',
      identifier: [{
        system: 'http://example.org/medication-statement-ids',
        value: formValue.identifier
      }],
      status: formValue.status,
      medicationCodeableConcept: {
        coding: [{
          system: formValue.medicationCodeSystem,
          code: formValue.medicationCode,
          display: formValue.medicationDisplay
        }]
      },
      subject: {
        reference: formValue.subject
      }
    };

    if (formValue.effectiveDateTime) {
      medicationStatement.effectiveDateTime = formValue.effectiveDateTime;
    }

    if (formValue.dosage) {
      medicationStatement.dosage = [{
        text: formValue.dosage
      }];
    }

    return medicationStatement;
  }

  private buildDiagnosticReportResource(formValue: any): any {
    const diagnosticReport: any = {
      resourceType: 'DiagnosticReport',
      identifier: [{
        system: 'http://example.org/diagnostic-report-ids',
        value: formValue.identifier
      }],
      status: formValue.status,
      code: {
        coding: [{
          system: formValue.codeSystem,
          code: formValue.code,
          display: formValue.codeDisplay
        }]
      },
      subject: {
        reference: formValue.subject
      }
    };

    if (formValue.category) {
      diagnosticReport.category = [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
          code: formValue.category,
          display: formValue.category
        }]
      }];
    }

    if (formValue.effectiveDateTime) {
      diagnosticReport.effectiveDateTime = formValue.effectiveDateTime;
    }

    if (formValue.conclusion) {
      diagnosticReport.conclusion = formValue.conclusion;
    }

    return diagnosticReport;
  }

  private buildImmunizationResource(formValue: any): any {
    const immunization: any = {
      resourceType: 'Immunization',
      identifier: [{
        system: 'http://example.org/immunization-ids',
        value: formValue.identifier
      }],
      status: formValue.status,
      vaccineCode: {
        coding: [{
          system: formValue.vaccineCodeSystem,
          code: formValue.vaccineCode,
          display: formValue.vaccineDisplay
        }]
      },
      patient: {
        reference: formValue.patient
      },
      occurrenceDateTime: formValue.occurrenceDateTime,
      primarySource: formValue.primarySource === 'true'
    };

    if (formValue.lotNumber) {
      immunization.lotNumber = formValue.lotNumber;
    }

    if (formValue.performer) {
      immunization.performer = [{
        actor: {
          reference: formValue.performer
        }
      }];
    }

    return immunization;
  }

  private buildAllergyIntoleranceResource(formValue: any): any {
    const allergyIntolerance: any = {
      resourceType: 'AllergyIntolerance',
      identifier: [{
        system: 'http://example.org/allergy-intolerance-ids',
        value: formValue.identifier
      }],
      code: {
        coding: [{
          system: formValue.codeSystem,
          code: formValue.code,
          display: formValue.codeDisplay
        }]
      },
      patient: {
        reference: formValue.patient
      }
    };

    if (formValue.clinicalStatus) {
      allergyIntolerance.clinicalStatus = {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
          code: formValue.clinicalStatus,
          display: formValue.clinicalStatus
        }]
      };
    }

    if (formValue.verificationStatus) {
      allergyIntolerance.verificationStatus = {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-verification',
          code: formValue.verificationStatus,
          display: formValue.verificationStatus
        }]
      };
    }

    if (formValue.type) {
      allergyIntolerance.type = formValue.type;
    }

    if (formValue.category) {
      allergyIntolerance.category = [formValue.category];
    }

    if (formValue.criticality) {
      allergyIntolerance.criticality = formValue.criticality;
    }

    if (formValue.onsetDateTime) {
      allergyIntolerance.onsetDateTime = formValue.onsetDateTime;
    }

    if (formValue.note) {
      allergyIntolerance.note = [{
        text: formValue.note
      }];
    }

    return allergyIntolerance;
  }
}