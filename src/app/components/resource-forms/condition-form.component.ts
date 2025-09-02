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
          <!-- Condition Details Section -->
          <section class="form-section">
            <h3 class="section-title">Condition Details</h3>
            <div class="form-grid">
              @if (resource['code']) {
                <div class="form-group full-width">
                  <label class="form-label">Condition</label>
                  <span class="field-value condition-code">
                    {{ getCodeableConceptDisplay(resource['code']) }}
                    @if (getConditionCoding()) {
                      <div class="coding-details">
                        <span class="system">{{ getConditionCoding().system }}</span>
                        @if (getConditionCoding().code) {
                          <span class="code">{{ getConditionCoding().code }}</span>
                        }
                      </div>
                    }
                  </span>
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

              @if (getCategories().length > 0) {
                <div class="form-group">
                  <label class="form-label">Category</label>
                  <div class="categories">
                    @for (category of getCategories(); track $index) {
                      <span class="category-badge">
                        {{ getCodeableConceptDisplay(category) }}
                      </span>
                    }
                  </div>
                </div>
              }

              @if (resource['severity']) {
                <div class="form-group">
                  <label class="form-label">Severity</label>
                  <span class="field-value">
                    <span class="badge severity-{{ getCodeableConceptCode(resource['severity']) }}">
                      {{ getCodeableConceptDisplay(resource['severity']) }}
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

              @if (resource['encounter']) {
                <div class="form-group">
                  <label class="form-label">Encounter</label>
                  <span class="field-value reference">{{ resource['encounter']['reference'] }}</span>
                </div>
              }
            </div>
          </section>

          <!-- Timing Section -->
          <section class="form-section">
            <h3 class="section-title">Timeline</h3>
            <div class="form-grid">
              @if (resource['onsetDateTime'] || resource['onsetAge'] || resource['onsetPeriod'] || resource['onsetRange'] || resource['onsetString']) {
                <div class="form-group">
                  <label class="form-label">Onset</label>
                  <span class="field-value">
                    @if (resource['onsetDateTime']) {
                      {{ formatDateTime(resource['onsetDateTime']) }}
                    } @else if (resource['onsetAge']) {
                      Age: {{ getQuantityDisplay(resource['onsetAge']) }}
                    } @else if (resource['onsetPeriod']) {
                      @if (resource['onsetPeriod']['start'] && resource['onsetPeriod']['end']) {
                        {{ formatDateTime(resource['onsetPeriod']['start']) }} - 
                        {{ formatDateTime(resource['onsetPeriod']['end']) }}
                      } @else if (resource['onsetPeriod']['start']) {
                        From: {{ formatDateTime(resource['onsetPeriod']['start']) }}
                      } @else if (resource['onsetPeriod']['end']) {
                        Until: {{ formatDateTime(resource['onsetPeriod']['end']) }}
                      }
                    } @else if (resource['onsetRange']) {
                      {{ getRangeDisplay(resource['onsetRange']) }}
                    } @else if (resource['onsetString']) {
                      {{ resource['onsetString'] }}
                    }
                  </span>
                </div>
              }

              @if (resource['abatementDateTime'] || resource['abatementAge'] || resource['abatementPeriod'] || resource['abatementRange'] || resource['abatementString'] || resource['abatementBoolean']) {
                <div class="form-group">
                  <label class="form-label">Abatement</label>
                  <span class="field-value">
                    @if (resource['abatementDateTime']) {
                      {{ formatDateTime(resource['abatementDateTime']) }}
                    } @else if (resource['abatementAge']) {
                      Age: {{ getQuantityDisplay(resource['abatementAge']) }}
                    } @else if (resource['abatementPeriod']) {
                      @if (resource['abatementPeriod']['start'] && resource['abatementPeriod']['end']) {
                        {{ formatDateTime(resource['abatementPeriod']['start']) }} - 
                        {{ formatDateTime(resource['abatementPeriod']['end']) }}
                      } @else if (resource['abatementPeriod']['start']) {
                        From: {{ formatDateTime(resource['abatementPeriod']['start']) }}
                      } @else if (resource['abatementPeriod']['end']) {
                        Until: {{ formatDateTime(resource['abatementPeriod']['end']) }}
                      }
                    } @else if (resource['abatementRange']) {
                      {{ getRangeDisplay(resource['abatementRange']) }}
                    } @else if (resource['abatementString']) {
                      {{ resource['abatementString'] }}
                    } @else if (resource['abatementBoolean']) {
                      <span class="badge">{{ resource['abatementBoolean'] ? 'Yes' : 'No' }}</span>
                    }
                  </span>
                </div>
              }

              @if (resource['recordedDate']) {
                <div class="form-group">
                  <label class="form-label">Recorded Date</label>
                  <span class="field-value">{{ formatDateTime(resource['recordedDate']) }}</span>
                </div>
              }

              @if (resource['recorder']) {
                <div class="form-group">
                  <label class="form-label">Recorder</label>
                  <span class="field-value reference">{{ resource['recorder']['reference'] }}</span>
                </div>
              }

              @if (resource['asserter']) {
                <div class="form-group">
                  <label class="form-label">Asserter</label>
                  <span class="field-value reference">{{ resource['asserter']['reference'] }}</span>
                </div>
              }
            </div>
          </section>

          <!-- Clinical Context Section -->
          <section class="form-section">
            <h3 class="section-title">Clinical Context</h3>
            <div class="form-grid">
              @if (getBodySites().length > 0) {
                <div class="form-group full-width">
                  <label class="form-label">Body Sites</label>
                  <div class="body-sites">
                    @for (site of getBodySites(); track $index) {
                      <span class="body-site-badge">
                        {{ getCodeableConceptDisplay(site) }}
                      </span>
                    }
                  </div>
                </div>
              }

              @if (getStages().length > 0) {
                <div class="form-group full-width">
                  <label class="form-label">Stages</label>
                  <div class="stages-list">
                    @for (stage of getStages(); track $index) {
                      <div class="stage-entry">
                        @if (stage.summary) {
                          <div class="stage-summary">
                            {{ getCodeableConceptDisplay(stage.summary) }}
                          </div>
                        }
                        @if (stage.assessment && stage.assessment.length > 0) {
                          <div class="stage-assessments">
                            <strong>Assessments:</strong>
                            @for (assessment of stage.assessment; track $index) {
                              <span class="reference">{{ assessment.reference }}</span>
                            }
                          </div>
                        }
                        @if (stage.type) {
                          <div class="stage-type">
                            Type: {{ getCodeableConceptDisplay(stage.type) }}
                          </div>
                        }
                      </div>
                    }
                  </div>
                </div>
              }

              @if (getEvidence().length > 0) {
                <div class="form-group full-width">
                  <label class="form-label">Evidence</label>
                  <div class="evidence-list">
                    @for (evidence of getEvidence(); track $index) {
                      <div class="evidence-entry">
                        @if (evidence.code && evidence.code.length > 0) {
                          <div class="evidence-codes">
                            @for (code of evidence.code; track $index) {
                              <span class="evidence-code-badge">
                                {{ getCodeableConceptDisplay(code) }}
                              </span>
                            }
                          </div>
                        }
                        @if (evidence.detail && evidence.detail.length > 0) {
                          <div class="evidence-details">
                            @for (detail of evidence.detail; track $index) {
                              <span class="reference">{{ detail.reference }}</span>
                            }
                          </div>
                        }
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          </section>

          <!-- Notes Section -->
          @if (getNotes().length > 0) {
            <section class="form-section">
              <h3 class="section-title">Notes</h3>
              <div class="notes-list">
                @for (note of getNotes(); track $index) {
                  <div class="note-entry">
                    @if (note.authorReference || note.authorString) {
                      <div class="note-author">
                        @if (note.authorReference) {
                          <span class="reference">{{ note.authorReference.reference }}</span>
                        } @else {
                          <span>{{ note.authorString }}</span>
                        }
                      </div>
                    }
                    @if (note.time) {
                      <div class="note-time">{{ formatDateTime(note.time) }}</div>
                    }
                    @if (note.text) {
                      <div class="note-text">{{ note.text }}</div>
                    }
                  </div>
                }
              </div>
            </section>
          }
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
      .full-width { grid-column: 1 / -1; }
      
      .badge { padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; background: var(--vscode-accent-primary); color: var(--vscode-bg-primary); }
      .reference { font-family: var(--font-family-mono); color: var(--vscode-accent-primary); }
      
      .condition-code .coding-details { margin-top: 0.5rem; font-size: 0.85rem; color: var(--vscode-text-secondary); }
      .condition-code .system { margin-right: 1rem; }
      .condition-code .code { font-family: var(--font-family-mono); background: var(--vscode-bg-tertiary); padding: 0.2rem 0.4rem; border-radius: 3px; }
      
      .categories, .body-sites { display: flex; flex-wrap: wrap; gap: 0.5rem; }
      .category-badge, .body-site-badge, .evidence-code-badge { padding: 0.25rem 0.5rem; background: var(--vscode-bg-tertiary); border: 1px solid var(--vscode-border-secondary); border-radius: 4px; font-size: 0.85rem; }
      
      .stages-list, .evidence-list { display: flex; flex-direction: column; gap: 1rem; }
      .stage-entry, .evidence-entry { padding: 1rem; background: var(--vscode-bg-tertiary); border-radius: 4px; }
      .stage-summary { font-weight: 500; margin-bottom: 0.5rem; }
      .stage-assessments, .stage-type, .evidence-details { font-size: 0.9rem; color: var(--vscode-text-secondary); margin-top: 0.5rem; }
      .evidence-codes { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem; }
      
      .notes-list { display: flex; flex-direction: column; gap: 1rem; }
      .note-entry { padding: 1rem; background: var(--vscode-bg-tertiary); border-radius: 4px; border-left: 3px solid var(--vscode-accent-primary); }
      .note-author { font-weight: 500; color: var(--vscode-text-primary); }
      .note-time { font-size: 0.85rem; color: var(--vscode-text-secondary); margin-bottom: 0.5rem; }
      .note-text { line-height: 1.5; }
      
      .status-active { background: var(--vscode-success-primary); }
      .status-recurrence, .status-relapse { background: var(--vscode-warning-primary); }
      .status-inactive, .status-remission, .status-resolved { background: var(--vscode-info-primary); }
      .verification-confirmed { background: var(--vscode-success-primary); }
      .verification-provisional, .verification-differential { background: var(--vscode-warning-primary); }
      .verification-refuted, .verification-entered-in-error { background: var(--vscode-error-primary); }
      .verification-unconfirmed { background: var(--vscode-text-secondary); }
      .severity-severe { background: var(--vscode-error-primary); }
      .severity-moderate { background: var(--vscode-warning-primary); }
      .severity-mild { background: var(--vscode-info-primary); }
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

  protected getConditionCoding(): any {
    const code = this.resource?.['code'];
    if (code?.coding && code.coding.length > 0) {
      return code.coding[0];
    }
    return null;
  }

  protected getCategories(): any[] {
    return this.resource?.['category'] || [];
  }

  protected getBodySites(): any[] {
    return this.resource?.['bodySite'] || [];
  }

  protected getStages(): any[] {
    return this.resource?.['stage'] || [];
  }

  protected getEvidence(): any[] {
    return this.resource?.['evidence'] || [];
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

  protected getRangeDisplay(range: any): string {
    if (!range) return '';
    const low = range.low ? this.getQuantityDisplay(range.low) : '';
    const high = range.high ? this.getQuantityDisplay(range.high) : '';
    
    if (low && high) {
      return `${low} - ${high}`;
    } else if (low) {
      return `≥ ${low}`;
    } else if (high) {
      return `≤ ${high}`;
    }
    return '';
  }

  protected formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }
}