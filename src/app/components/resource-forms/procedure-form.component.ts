import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FhirResource } from '../../services/fhir.service';
import { ResourceFormComponent } from './resource-form.interface';

@Component({
  selector: 'app-procedure-form',
  imports: [CommonModule],
  template: `
    <div class="procedure-form">
      @if (resource) {
        <div class="form-sections">
          <!-- Procedure Details Section -->
          <section class="form-section">
            <h3 class="section-title">Procedure Details</h3>
            <div class="form-grid">
              @if (resource['code']) {
                <div class="form-group full-width">
                  <label class="form-label">Procedure</label>
                  <span class="field-value procedure-code">
                    {{ getCodeableConceptDisplay(resource['code']) }}
                    @if (getProcedureCoding()) {
                      <div class="coding-details">
                        <span class="system">{{ getProcedureCoding().system }}</span>
                        @if (getProcedureCoding().code) {
                          <span class="code">{{ getProcedureCoding().code }}</span>
                        }
                      </div>
                    }
                  </span>
                </div>
              }

              @if (resource['status']) {
                <div class="form-group">
                  <label class="form-label">Status</label>
                  <span class="field-value">
                    <span class="badge status-{{ resource['status'] }}">
                      {{ resource['status'] | titlecase }}
                    </span>
                  </span>
                </div>
              }

              @if (resource['category']) {
                <div class="form-group">
                  <label class="form-label">Category</label>
                  <span class="field-value">
                    {{ getCodeableConceptDisplay(resource['category']) }}
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

          <!-- Timing and Performance Section -->
          <section class="form-section">
            <h3 class="section-title">Timing & Performance</h3>
            <div class="form-grid">
              @if (resource['performedDateTime'] || resource['performedPeriod'] || resource['performedString']) {
                <div class="form-group">
                  <label class="form-label">Performed</label>
                  <span class="field-value">
                    @if (resource['performedDateTime']) {
                      {{ formatDateTime(resource['performedDateTime']) }}
                    } @else if (resource['performedPeriod']) {
                      @if (resource['performedPeriod']['start'] && resource['performedPeriod']['end']) {
                        {{ formatDateTime(resource['performedPeriod']['start']) }} - 
                        {{ formatDateTime(resource['performedPeriod']['end']) }}
                      } @else if (resource['performedPeriod']['start']) {
                        Started: {{ formatDateTime(resource['performedPeriod']['start']) }}
                      } @else if (resource['performedPeriod']['end']) {
                        Ended: {{ formatDateTime(resource['performedPeriod']['end']) }}
                      }
                    } @else if (resource['performedString']) {
                      {{ resource['performedString'] }}
                    }
                  </span>
                </div>
              }

              @if (getPerformers().length > 0) {
                <div class="form-group full-width">
                  <label class="form-label">Performers</label>
                  <div class="performers-list">
                    @for (performer of getPerformers(); track $index) {
                      <div class="performer-entry">
                        @if (performer.actor) {
                          <span class="performer-actor reference">{{ performer.actor.reference }}</span>
                        }
                        @if (performer.function) {
                          <span class="performer-function">
                            ({{ getCodeableConceptDisplay(performer.function) }})
                          </span>
                        }
                        @if (performer.onBehalfOf) {
                          <span class="performer-behalf">
                            on behalf of: {{ performer.onBehalfOf.reference }}
                          </span>
                        }
                      </div>
                    }
                  </div>
                </div>
              }

              @if (resource['location']) {
                <div class="form-group">
                  <label class="form-label">Location</label>
                  <span class="field-value reference">{{ resource['location']['reference'] }}</span>
                </div>
              }
            </div>
          </section>

          <!-- Clinical Information Section -->
          <section class="form-section">
            <h3 class="section-title">Clinical Information</h3>
            <div class="form-grid">
              @if (getReasonCodes().length > 0) {
                <div class="form-group full-width">
                  <label class="form-label">Reason (Coded)</label>
                  <div class="reason-codes">
                    @for (reason of getReasonCodes(); track $index) {
                      <span class="reason-badge">
                        {{ getCodeableConceptDisplay(reason) }}
                      </span>
                    }
                  </div>
                </div>
              }

              @if (getReasonReferences().length > 0) {
                <div class="form-group full-width">
                  <label class="form-label">Reason (References)</label>
                  <div class="reason-references">
                    @for (reason of getReasonReferences(); track $index) {
                      <span class="reference">{{ reason.reference }}</span>
                    }
                  </div>
                </div>
              }

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

              @if (resource['outcome']) {
                <div class="form-group">
                  <label class="form-label">Outcome</label>
                  <span class="field-value">
                    {{ getCodeableConceptDisplay(resource['outcome']) }}
                  </span>
                </div>
              }

              @if (getComplications().length > 0) {
                <div class="form-group full-width">
                  <label class="form-label">Complications</label>
                  <div class="complications">
                    @for (complication of getComplications(); track $index) {
                      <span class="complication-badge">
                        {{ getCodeableConceptDisplay(complication) }}
                      </span>
                    }
                  </div>
                </div>
              }

              @if (getComplicationDetails().length > 0) {
                <div class="form-group full-width">
                  <label class="form-label">Complication Details</label>
                  <div class="complication-references">
                    @for (detail of getComplicationDetails(); track $index) {
                      <span class="reference">{{ detail.reference }}</span>
                    }
                  </div>
                </div>
              }
            </div>
          </section>

          <!-- Devices and Equipment Section -->
          @if (getUsedReferences().length > 0 || getUsedCodes().length > 0) {
            <section class="form-section">
              <h3 class="section-title">Devices & Equipment</h3>
              <div class="form-grid">
                @if (getUsedReferences().length > 0) {
                  <div class="form-group full-width">
                    <label class="form-label">Used Devices (References)</label>
                    <div class="used-references">
                      @for (device of getUsedReferences(); track $index) {
                        <span class="reference">{{ device.reference }}</span>
                      }
                    </div>
                  </div>
                }

                @if (getUsedCodes().length > 0) {
                  <div class="form-group full-width">
                    <label class="form-label">Used Devices (Coded)</label>
                    <div class="used-codes">
                      @for (device of getUsedCodes(); track $index) {
                        <span class="device-badge">
                          {{ getCodeableConceptDisplay(device) }}
                        </span>
                      }
                    </div>
                  </div>
                }
              </div>
            </section>
          }

          <!-- Follow-up Section -->
          @if (getFollowUps().length > 0) {
            <section class="form-section">
              <h3 class="section-title">Follow-up</h3>
              <div class="followup-list">
                @for (followup of getFollowUps(); track $index) {
                  <div class="followup-item">
                    {{ getCodeableConceptDisplay(followup) }}
                  </div>
                }
              </div>
            </section>
          }

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
    .procedure-form {
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
      
      .procedure-code .coding-details { margin-top: 0.5rem; font-size: 0.85rem; color: var(--vscode-text-secondary); }
      .procedure-code .system { margin-right: 1rem; }
      .procedure-code .code { font-family: var(--font-family-mono); background: var(--vscode-bg-tertiary); padding: 0.2rem 0.4rem; border-radius: 3px; }
      
      .performers-list, .reason-codes, .reason-references, .body-sites, .complications, .complication-references, .used-references, .used-codes { display: flex; flex-wrap: wrap; gap: 0.5rem; }
      .performer-entry { display: flex; flex-direction: column; gap: 0.25rem; padding: 0.5rem; background: var(--vscode-bg-tertiary); border-radius: 4px; }
      .performer-function, .performer-behalf { font-size: 0.85rem; color: var(--vscode-text-secondary); }
      
      .reason-badge, .body-site-badge, .complication-badge, .device-badge { padding: 0.25rem 0.5rem; background: var(--vscode-bg-tertiary); border: 1px solid var(--vscode-border-secondary); border-radius: 4px; font-size: 0.85rem; }
      
      .followup-list { display: flex; flex-direction: column; gap: 0.5rem; }
      .followup-item { padding: 0.5rem; background: var(--vscode-bg-tertiary); border-radius: 4px; }
      
      .notes-list { display: flex; flex-direction: column; gap: 1rem; }
      .note-entry { padding: 1rem; background: var(--vscode-bg-tertiary); border-radius: 4px; border-left: 3px solid var(--vscode-accent-primary); }
      .note-author { font-weight: 500; color: var(--vscode-text-primary); }
      .note-time { font-size: 0.85rem; color: var(--vscode-text-secondary); margin-bottom: 0.5rem; }
      .note-text { line-height: 1.5; }
      
      .status-completed { background: var(--vscode-success-primary); }
      .status-in-progress { background: var(--vscode-warning-primary); }
      .status-not-done, .status-stopped { background: var(--vscode-error-primary); }
      .status-preparation, .status-on-hold { background: var(--vscode-info-primary); }
      .status-unknown { background: var(--vscode-text-secondary); }
    }
  `],
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