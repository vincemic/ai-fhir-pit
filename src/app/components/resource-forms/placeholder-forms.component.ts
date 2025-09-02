import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FhirResource } from '../../services/fhir.service';
import { ResourceFormComponent } from './resource-form.interface';

@Component({
  selector: 'app-organization-form',
  imports: [CommonModule],
  templateUrl: './organization-form.component.html',
  styles: [`.organization-form { padding: 2rem; text-align: center; color: var(--vscode-text-secondary); background: var(--vscode-bg-secondary); border-radius: 8px; }`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationFormComponent implements ResourceFormComponent {
  @Input() resource: FhirResource | null = null;
  @Input() readonly: boolean = true;
}

@Component({
  selector: 'app-location-form',
  imports: [CommonModule],
  templateUrl: './location-form.component.html',
  styles: [`.location-form { padding: 2rem; text-align: center; color: var(--vscode-text-secondary); background: var(--vscode-bg-secondary); border-radius: 8px; }`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocationFormComponent implements ResourceFormComponent {
  @Input() resource: FhirResource | null = null;
  @Input() readonly: boolean = true;
}

@Component({
  selector: 'app-encounter-form',
  imports: [CommonModule],
  templateUrl: './encounter-form.component.html',
  styles: [`.encounter-form { padding: 2rem; text-align: center; color: var(--vscode-text-secondary); background: var(--vscode-bg-secondary); border-radius: 8px; }`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EncounterFormComponent implements ResourceFormComponent {
  @Input() resource: FhirResource | null = null;
  @Input() readonly: boolean = true;
}



@Component({
  selector: 'app-medication-statement-form',
  imports: [CommonModule],
  templateUrl: './medication-statement-form.component.html',
  styles: [`.medication-statement-form { padding: 2rem; text-align: center; color: var(--vscode-text-secondary); background: var(--vscode-bg-secondary); border-radius: 8px; }`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MedicationStatementFormComponent implements ResourceFormComponent {
  @Input() resource: FhirResource | null = null;
  @Input() readonly: boolean = true;
}

@Component({
  selector: 'app-diagnostic-report-form',
  imports: [CommonModule],
  templateUrl: './diagnostic-report-form.component.html',
  styles: [`.diagnostic-report-form { padding: 2rem; text-align: center; color: var(--vscode-text-secondary); background: var(--vscode-bg-secondary); border-radius: 8px; }`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiagnosticReportFormComponent implements ResourceFormComponent {
  @Input() resource: FhirResource | null = null;
  @Input() readonly: boolean = true;
}

@Component({
  selector: 'app-immunization-form',
  imports: [CommonModule],
  templateUrl: './immunization-form.component.html',
  styles: [`.immunization-form { padding: 2rem; text-align: center; color: var(--vscode-text-secondary); background: var(--vscode-bg-secondary); border-radius: 8px; }`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImmunizationFormComponent implements ResourceFormComponent {
  @Input() resource: FhirResource | null = null;
  @Input() readonly: boolean = true;
}

@Component({
  selector: 'app-allergy-intolerance-form',
  imports: [CommonModule],
  templateUrl: './allergy-intolerance-form.component.html',
  styles: [`.allergy-intolerance-form { padding: 2rem; text-align: center; color: var(--vscode-text-secondary); background: var(--vscode-bg-secondary); border-radius: 8px; }`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllergyIntoleranceFormComponent implements ResourceFormComponent {
  @Input() resource: FhirResource | null = null;
  @Input() readonly: boolean = true;
}