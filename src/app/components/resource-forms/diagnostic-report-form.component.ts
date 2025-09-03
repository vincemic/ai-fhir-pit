import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FhirResource } from '../../services/fhir.service';
import { ResourceFormComponent } from './resource-form.interface';

@Component({
  selector: 'app-diagnostic-report-form',
  imports: [CommonModule],
  templateUrl: './diagnostic-report-form.component.html',
  styleUrls: ['./diagnostic-report-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiagnosticReportFormComponent implements ResourceFormComponent {
  @Input() resource: FhirResource | null = null;
  @Input() readonly: boolean = true;

  protected getCodeableConceptDisplay(concept: any): string {
    if (!concept) return '';
    if (concept.text) return concept.text;
    if (concept.coding && concept.coding.length > 0) {
      const coding = concept.coding[0];
      return coding.display || coding.code || '';
    }
    return '';
  }

  protected getDiagnosticCoding(): any {
    const code = this.resource?.['code'];
    if (code?.coding && code.coding.length > 0) {
      return code.coding[0];
    }
    return null;
  }

  protected getCategories(): any[] {
    return this.resource?.['category'] || [];
  }

  protected getPerformers(): any[] {
    return this.resource?.['performer'] || [];
  }

  protected getSpecimens(): any[] {
    return this.resource?.['specimen'] || [];
  }

  protected getResults(): any[] {
    return this.resource?.['result'] || [];
  }

  protected getImagingStudies(): any[] {
    return this.resource?.['imagingStudy'] || [];
  }

  protected getMedia(): any[] {
    return this.resource?.['media'] || [];
  }

  protected getConclusionCodes(): any[] {
    return this.resource?.['conclusionCode'] || [];
  }

  protected getPresentedForms(): any[] {
    return this.resource?.['presentedForm'] || [];
  }

  protected getPeriodDisplay(period: any): string {
    if (!period) return '';
    const start = period.start ? this.formatDateTime(period.start) : '';
    const end = period.end ? this.formatDateTime(period.end) : '';
    if (start && end) return `${start} - ${end}`;
    if (start) return `From ${start}`;
    if (end) return `Until ${end}`;
    return '';
  }

  protected formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }
}

