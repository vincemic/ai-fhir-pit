import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FhirResource } from '../../services/fhir.service';
import { ResourceFormComponent } from './resource-form.interface';

@Component({
  selector: 'app-immunization-form',
  imports: [CommonModule],
  templateUrl: './immunization-form.component.html',
  styleUrls: ['./immunization-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImmunizationFormComponent implements ResourceFormComponent {
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

  protected getVaccineCoding(): any {
    const code = this.resource?.['vaccineCode'];
    if (code?.coding && code.coding.length > 0) {
      return code.coding[0];
    }
    return null;
  }

  protected getPerformers(): any[] {
    return this.resource?.['performer'] || [];
  }

  protected getReasonCodes(): any[] {
    return this.resource?.['reasonCode'] || [];
  }

  protected getReasonReferences(): any[] {
    return this.resource?.['reasonReference'] || [];
  }

  protected getReactions(): any[] {
    return this.resource?.['reaction'] || [];
  }

  protected getProtocolApplied(): any[] {
    return this.resource?.['protocolApplied'] || [];
  }

  protected getTargetDiseases(protocol: any): any[] {
    return protocol?.targetDisease || [];
  }

  protected getNotes(): any[] {
    return this.resource?.['note'] || [];
  }

  protected getQuantityDisplay(quantity: any): string {
    if (!quantity) return '';
    const value = quantity.value || '';
    const unit = quantity.unit || quantity.code || '';
    return `${value} ${unit}`.trim();
  }

  protected formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  protected formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}

