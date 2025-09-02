import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FhirResource } from '../services/fhir.service';
import { PatientFormComponent } from './resource-forms/patient-form.component';
import { PractitionerFormComponent } from './resource-forms/practitioner-form.component';
import { ObservationFormComponent } from './resource-forms/observation-form.component';
import { ConditionFormComponent } from './resource-forms/condition-form.component';
import { ProcedureFormComponent } from './resource-forms/procedure-form.component';
import { CoverageFormComponent } from './resource-forms/coverage-form.component';
import { OrganizationFormComponent } from './resource-forms/organization-form.component';
import { LocationFormComponent } from './resource-forms/location-form.component';
import { 
  EncounterFormComponent,
  MedicationStatementFormComponent,
  DiagnosticReportFormComponent,
  ImmunizationFormComponent,
  AllergyIntoleranceFormComponent
} from './resource-forms/placeholder-forms.component';
import { DefaultResourceFormComponent } from './resource-forms/default-resource-form.component';

@Component({
  selector: 'app-resource-viewer',
  imports: [
    CommonModule,
    PatientFormComponent,
    PractitionerFormComponent,
    ObservationFormComponent,
    ConditionFormComponent,
    CoverageFormComponent,
    OrganizationFormComponent,
    LocationFormComponent,
    EncounterFormComponent,
    ProcedureFormComponent,
    MedicationStatementFormComponent,
    DiagnosticReportFormComponent,
    ImmunizationFormComponent,
    AllergyIntoleranceFormComponent,
    DefaultResourceFormComponent
  ],
  templateUrl: './resource-viewer.component.html',
  styleUrl: './resource-viewer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResourceViewerComponent {
  @Input() resource: FhirResource | null = null;
  @Input() readonly: boolean = true;
  @Input() hasChanges: boolean = false;

  @Output() save = new EventEmitter<FhirResource>();
  @Output() cancel = new EventEmitter<void>();

  protected onSave(): void {
    if (this.resource) {
      this.save.emit(this.resource);
    }
  }

  protected onCancel(): void {
    this.cancel.emit();
  }

  protected formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}