import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FhirResource } from '../../services/fhir.service';
import { ResourceFormComponent } from './resource-form.interface';

@Component({
  selector: 'app-observation-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './observation-form.component.html',
  styleUrl: './observation-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationFormComponent implements ResourceFormComponent {
  @Input() resource: FhirResource | null = null;
  @Input() readonly: boolean = true;

  protected getCategories(): any[] {
    return this.resource?.['category'] || [];
  }

  protected getInterpretations(): any[] {
    return this.resource?.['interpretation'] || [];
  }

  protected getPerformers(): any[] {
    return this.resource?.['performer'] || [];
  }

  protected getComponents(): any[] {
    return this.resource?.['component'] || [];
  }

  protected getReferenceRanges(): any[] {
    return this.resource?.['referenceRange'] || [];
  }

  protected hasValue(): boolean {
    return !!(
      this.resource?.['valueQuantity'] ||
      this.resource?.['valueCodeableConcept'] ||
      this.resource?.['valueString'] ||
      this.resource?.['valueBoolean'] !== undefined ||
      this.resource?.['valueDateTime'] ||
      this.resource?.['valuePeriod'] ||
      this.resource?.['valueRange'] ||
      this.resource?.['valueRatio'] ||
      this.resource?.['valueSampledData'] ||
      this.resource?.['valueTime'] ||
      this.resource?.['valueAttachment']
    );
  }

  protected formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  protected getCodeableConceptDisplay(concept: any): string {
    if (!concept) return '';
    
    if (concept.text) return concept.text;
    
    if (concept.coding && concept.coding.length > 0) {
      const coding = concept.coding[0];
      return coding.display || coding.code || '';
    }
    
    return '';
  }
}
