import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FhirResource } from '../../services/fhir.service';
import { ResourceFormComponent } from './resource-form.interface';

@Component({
  selector: 'app-allergy-intolerance-form',
  imports: [CommonModule],
  templateUrl: './allergy-intolerance-form.component.html',
  styleUrls: ['./allergy-intolerance-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllergyIntoleranceFormComponent implements ResourceFormComponent {
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

  protected getClinicalStatusCode(): string {
    const code = this.resource?.['clinicalStatus'];
    if (code?.coding && code.coding.length > 0) {
      return code.coding[0].code || '';
    }
    return '';
  }

  protected getVerificationStatusCode(): string {
    const code = this.resource?.['verificationStatus'];
    if (code?.coding && code.coding.length > 0) {
      return code.coding[0].code || '';
    }
    return '';
  }

  protected getAllergenCoding(): any {
    const code = this.resource?.['code'];
    if (code?.coding && code.coding.length > 0) {
      return code.coding[0];
    }
    return null;
  }

  protected getCategories(): string[] {
    return this.resource?.['category'] || [];
  }

  protected getReactions(): any[] {
    return this.resource?.['reaction'] || [];
  }

  protected getReactionManifestations(reaction: any): any[] {
    return reaction?.manifestation || [];
  }

  protected getNotes(reaction: any): any[] {
    return reaction?.note || [];
  }

  protected getAllergyNotes(): any[] {
    return this.resource?.['note'] || [];
  }

  protected getQuantityDisplay(quantity: any): string {
    if (!quantity) return '';
    const value = quantity.value || '';
    const unit = quantity.unit || quantity.code || '';
    return `${value} ${unit}`.trim();
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

  protected getRangeDisplay(range: any): string {
    if (!range) return '';
    const low = range.low ? this.getQuantityDisplay(range.low) : '';
    const high = range.high ? this.getQuantityDisplay(range.high) : '';
    if (low && high) return `${low} - ${high}`;
    if (low) return `â‰¥ ${low}`;
    if (high) return `â‰¤ ${high}`;
    return '';
  }

  protected formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  protected formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}

