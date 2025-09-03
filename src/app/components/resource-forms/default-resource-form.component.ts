import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FhirResource } from '../../services/fhir.service';
import { ResourceFormComponent } from './resource-form.interface';

@Component({
  selector: 'app-default-resource-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './default-resource-form.component.html',
  styleUrl: './default-resource-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DefaultResourceFormComponent implements ResourceFormComponent {
  @Input() resource: FhirResource | null = null;
  @Input() readonly: boolean = true;

  protected formatDateTime(dateString: string | undefined): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString();
  }

  protected formatJson(resource: FhirResource): string {
    return JSON.stringify(resource, null, 2);
  }

  protected async copyToClipboard(): Promise<void> {
    if (this.resource) {
      try {
        await navigator.clipboard.writeText(this.formatJson(this.resource));
        // Could emit an event or show a toast notification here
        console.log('Resource copied to clipboard');
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    }
  }

  protected getKeyFields(): Array<{key: string, label: string, value: any, type: string}> {
    if (!this.resource) return [];

    const fields: Array<{key: string, label: string, value: any, type: string}> = [];

    // Common fields that might be interesting to highlight
    const commonFields = [
      { key: 'status', label: 'Status', type: 'text' },
      { key: 'active', label: 'Active', type: 'boolean' },
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'code', label: 'Code', type: 'code' },
      { key: 'subject', label: 'Subject', type: 'reference' },
      { key: 'patient', label: 'Patient', type: 'reference' },
      { key: 'encounter', label: 'Encounter', type: 'reference' },
      { key: 'effectiveDateTime', label: 'Effective Date', type: 'date' },
      { key: 'performedDateTime', label: 'Performed Date', type: 'date' },
      { key: 'authoredOn', label: 'Authored On', type: 'date' },
      { key: 'recordedDate', label: 'Recorded Date', type: 'date' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'category', label: 'Category', type: 'code' },
      { key: 'type', label: 'Type', type: 'code' },
      { key: 'performer', label: 'Performer', type: 'reference' },
      { key: 'requester', label: 'Requester', type: 'reference' },
      { key: 'author', label: 'Author', type: 'reference' }
    ];

    commonFields.forEach(fieldDef => {
      const value = this.resource![fieldDef.key];
      if (value !== undefined && value !== null) {
        let displayValue = value;
        
        if (fieldDef.type === 'code' && typeof value === 'object') {
          displayValue = this.getCodeableConceptDisplay(value);
        } else if (fieldDef.type === 'reference' && typeof value === 'object') {
          displayValue = value.reference || value.display || JSON.stringify(value);
        } else if (Array.isArray(value)) {
          displayValue = value.length > 0 ? `${value.length} items` : 'Empty array';
        } else if (typeof value === 'object') {
          displayValue = JSON.stringify(value);
        }

        if (displayValue && displayValue.toString().trim()) {
          fields.push({
            key: fieldDef.key,
            label: fieldDef.label,
            value: displayValue,
            type: fieldDef.type
          });
        }
      }
    });

    return fields;
  }

  private getCodeableConceptDisplay(concept: any): string {
    if (!concept) return '';
    
    if (concept.text) return concept.text;
    
    if (concept.coding && concept.coding.length > 0) {
      const coding = concept.coding[0];
      return coding.display || coding.code || '';
    }
    
    return '';
  }
}
