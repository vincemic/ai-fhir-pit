import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FhirResource } from '../../services/fhir.service';
import { ResourceFormComponent } from './resource-form.interface';

@Component({
  selector: 'app-medication-statement-form',
  imports: [CommonModule],
  templateUrl: './medication-statement-form.component.html',
  styleUrls: ['./medication-statement-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MedicationStatementFormComponent implements ResourceFormComponent {
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

  protected getMedicationCoding(): any {
    const code = this.resource?.['medicationCodeableConcept'];
    if (code?.coding && code.coding.length > 0) {
      return code.coding[0];
    }
    return null;
  }

  protected getDerivedFrom(): any[] {
    return this.resource?.['derivedFrom'] || [];
  }

  protected getReasonCodes(): any[] {
    return this.resource?.['reasonCode'] || [];
  }

  protected getReasonReferences(): any[] {
    return this.resource?.['reasonReference'] || [];
  }

  protected getDosages(): any[] {
    return this.resource?.['dosage'] || [];
  }

  protected getNotes(): any[] {
    return this.resource?.['note'] || [];
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

  protected getQuantityDisplay(quantity: any): string {
    if (!quantity) return '';
    const value = quantity.value || '';
    const unit = quantity.unit || quantity.code || '';
    return `${value} ${unit}`.trim();
  }

  protected getRangeDisplay(range: any): string {
    if (!range) return '';
    const low = range.low ? this.getQuantityDisplay(range.low) : '';
    const high = range.high ? this.getQuantityDisplay(range.high) : '';
    if (low && high) return `${low} - ${high}`;
    if (low) return `â‰¥ ${low}`;
    if (high) return `â‰¤ ${high}`;
    return '';
  }

  protected getRatioDisplay(ratio: any): string {
    if (!ratio) return '';
    const numerator = ratio.numerator ? this.getQuantityDisplay(ratio.numerator) : '';
    const denominator = ratio.denominator ? this.getQuantityDisplay(ratio.denominator) : '';
    if (numerator && denominator) return `${numerator} / ${denominator}`;
    return numerator || denominator;
  }

  protected getTimingDisplay(timing: any): string {
    if (!timing) return '';
    if (timing.code) return this.getCodeableConceptDisplay(timing.code);
    if (timing.repeat) {
      const repeat = timing.repeat;
      let display = '';
      if (repeat.frequency && repeat.period) {
        display += `${repeat.frequency} times per ${repeat.period} ${repeat.periodUnit || ''}`;
      }
      if (repeat.duration) {
        display += ` for ${repeat.duration} ${repeat.durationUnit || ''}`;
      }
      return display.trim();
    }
    return '';
  }

  protected formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }
}

