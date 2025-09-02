import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FhirResource } from '../../services/fhir.service';
import { ResourceFormComponent } from './resource-form.interface';

@Component({
  selector: 'app-condition-form',
  imports: [CommonModule],
  template: `
    <div class="condition-form">
      @if (resource) {
        <div class="form-sections">
          <section class="form-section">
            <h3 class="section-title">Condition Details</h3>
            <div class="form-grid">
              @if (resource['code']) {
                <div class="form-group full-width">
                  <label class="form-label">Condition</label>
                  <span class="field-value">{{ getCodeableConceptDisplay(resource['code']) }}</span>
                </div>
              }
              
              @if (resource['clinicalStatus']) {
                <div class="form-group">
                  <label class="form-label">Clinical Status</label>
                  <span class="field-value">
                    <span class="badge status-{{ getCodeableConceptCode(resource['clinicalStatus']) }}">
                      {{ getCodeableConceptDisplay(resource['clinicalStatus']) }}
                    </span>
                  </span>
                </div>
              }

              @if (resource['verificationStatus']) {
                <div class="form-group">
                  <label class="form-label">Verification Status</label>
                  <span class="field-value">
                    <span class="badge verification-{{ getCodeableConceptCode(resource['verificationStatus']) }}">
                      {{ getCodeableConceptDisplay(resource['verificationStatus']) }}
                    </span>
                  </span>
                </div>
              }

              @if (resource['subject']) {
                <div class="form-group">
                  <label class="form-label">Subject</label>
                  <span class="field-value reference">{{ resource['subject']['reference'] }}</span>
                </div>
              }

              @if (resource['onsetDateTime'] || resource['onsetString']) {
                <div class="form-group">
                  <label class="form-label">Onset</label>
                  <span class="field-value">
                    @if (resource['onsetDateTime']) {
                      {{ formatDateTime(resource['onsetDateTime']) }}
                    } @else {
                      {{ resource['onsetString'] }}
                    }
                  </span>
                </div>
              }
            </div>
          </section>
        </div>
      }
    </div>
  `,
  styles: [`
    .condition-form {
      .form-sections { display: flex; flex-direction: column; gap: 2rem; }
      .form-section { background: var(--vscode-bg-secondary); border: 1px solid var(--vscode-border-primary); border-radius: 8px; padding: 1.5rem; box-shadow: var(--shadow-sm); }
      .section-title { margin: 0 0 1.5rem 0; font-size: 1.25rem; font-weight: 600; color: var(--vscode-text-primary); padding-bottom: 0.75rem; border-bottom: 2px solid var(--vscode-border-primary); }
      .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; }
      .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
      .form-label { font-weight: 500; color: var(--vscode-text-secondary); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; }
      .field-value { color: var(--vscode-text-primary); }
      .badge { padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; background: var(--vscode-accent-primary); color: var(--vscode-bg-primary); }
      .reference { font-family: var(--font-family-mono); color: var(--vscode-accent-primary); }
      .full-width { grid-column: 1 / -1; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConditionFormComponent implements ResourceFormComponent {
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

  protected getCodeableConceptCode(concept: any): string {
    if (!concept) return '';
    if (concept.coding && concept.coding.length > 0) {
      return concept.coding[0].code || '';
    }
    return '';
  }

  protected formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }
}