import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FhirResource } from '../../services/fhir.service';
import { ResourceFormComponent } from './resource-form.interface';

@Component({
  selector: 'app-encounter-form',
  imports: [CommonModule],
  templateUrl: './encounter-form.component.html',
  styleUrls: ['./encounter-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EncounterFormComponent implements ResourceFormComponent {
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

  protected getCodingDisplay(coding: any): string {
    if (!coding) return '';
    return coding.display || coding.code || '';
  }

  protected getParticipants(): any[] {
    return this.resource?.['participant'] || [];
  }

  protected getParticipantTypes(participant: any): any[] {
    return participant?.type || [];
  }

  protected getReasonCodes(): any[] {
    return this.resource?.['reasonCode'] || [];
  }

  protected getReasonReferences(): any[] {
    return this.resource?.['reasonReference'] || [];
  }

  protected getDiagnoses(): any[] {
    return this.resource?.['diagnosis'] || [];
  }

  protected getLocations(): any[] {
    return this.resource?.['location'] || [];
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

  protected getDurationDisplay(duration: any): string {
    if (!duration) return '';
    const value = duration.value || '';
    const unit = duration.unit || duration.code || '';
    return `${value} ${unit}`.trim();
  }

  protected getIdentifierDisplay(identifier: any): string {
    if (!identifier) return '';
    return identifier.value || identifier.id || '';
  }

  protected formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }
}
