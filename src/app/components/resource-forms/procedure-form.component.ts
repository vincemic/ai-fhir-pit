import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FhirResource } from '../../services/fhir.service';
import { ResourceFormComponent } from './resource-form.interface';

@Component({
  selector: 'app-procedure-form',
  imports: [CommonModule],
  templateUrl: './procedure-form.component.html',
  styleUrls: ['./procedure-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcedureFormComponent implements ResourceFormComponent {
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

  protected getProcedureCoding(): any {
    const code = this.resource?.['code'];
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

  protected getBodySites(): any[] {
    return this.resource?.['bodySite'] || [];
  }

  protected getComplications(): any[] {
    return this.resource?.['complication'] || [];
  }

  protected getComplicationDetails(): any[] {
    return this.resource?.['complicationDetail'] || [];
  }

  protected getUsedReferences(): any[] {
    return this.resource?.['usedReference'] || [];
  }

  protected getUsedCodes(): any[] {
    return this.resource?.['usedCode'] || [];
  }

  protected getFollowUps(): any[] {
    return this.resource?.['followUp'] || [];
  }

  protected getNotes(): any[] {
    return this.resource?.['note'] || [];
  }

  protected formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }
}
