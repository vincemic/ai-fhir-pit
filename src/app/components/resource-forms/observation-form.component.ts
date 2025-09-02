import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FhirResource } from '../../services/fhir.service';
import { ResourceFormComponent } from './resource-form.interface';

@Component({
  selector: 'app-observation-form',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="observation-form">
      @if (resource) {
        <div class="form-sections">
          <!-- Basic Information -->
          <section class="form-section">
            <h3 class="section-title">Observation Details</h3>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Status</label>
                <span class="field-value">
                  @if (resource['status']) {
                    <span class="badge status-{{ resource['status'] }}">{{ resource['status'] | titlecase }}</span>
                  } @else {
                    <span class="no-data">Not specified</span>
                  }
                </span>
              </div>

              <div class="form-group">
                <label class="form-label">Category</label>
                <span class="field-value">
                  @if (getCategories().length > 0) {
                    @for (category of getCategories(); track $index) {
                      <span class="badge category">{{ getCodeableConceptDisplay(category) }}</span>
                    }
                  } @else {
                    <span class="no-data">Not specified</span>
                  }
                </span>
              </div>

              <div class="form-group full-width">
                <label class="form-label">Code</label>
                <div class="code-display">
                  @if (resource['code']) {
                    <div class="code-text">{{ getCodeableConceptDisplay(resource['code']) }}</div>
                    @if (resource['code']['coding']?.length) {
                      <div class="code-details">
                        @for (coding of resource['code']['coding']; track $index) {
                          <div class="coding-entry">
                            <span class="code-value">{{ coding.code }}</span>
                            @if (coding.system) {
                              <span class="code-system">{{ coding.system }}</span>
                            }
                          </div>
                        }
                      </div>
                    }
                  } @else {
                    <span class="no-data">Not specified</span>
                  }
                </div>
              </div>
            </div>
          </section>

          <!-- Subject and Context -->
          <section class="form-section">
            <h3 class="section-title">Subject & Context</h3>
            <div class="form-grid">
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

              @if (resource['effectiveDateTime'] || resource['effectivePeriod']) {
                <div class="form-group">
                  <label class="form-label">Effective Time</label>
                  <span class="field-value">
                    @if (resource['effectiveDateTime']) {
                      {{ formatDateTime(resource['effectiveDateTime']) }}
                    } @else if (resource['effectivePeriod']) {
                      @if (resource['effectivePeriod']['start']) {
                        {{ formatDateTime(resource['effectivePeriod']['start']) }}
                      }
                      @if (resource['effectivePeriod']['end']) {
                        - {{ formatDateTime(resource['effectivePeriod']['end']) }}
                      }
                    }
                  </span>
                </div>
              }

              @if (resource['issued']) {
                <div class="form-group">
                  <label class="form-label">Issued</label>
                  <span class="field-value">{{ formatDateTime(resource['issued']) }}</span>
                </div>
              }
            </div>
          </section>

          <!-- Value and Results -->
          <section class="form-section">
            <h3 class="section-title">Value & Results</h3>
            <div class="value-section">
              @if (hasValue()) {
                <div class="observation-value">
                  <div class="value-display">
                    @if (resource['valueQuantity']) {
                      <div class="quantity-value">
                        <span class="value">{{ resource['valueQuantity']['value'] }}</span>
                        @if (resource['valueQuantity']['unit']) {
                          <span class="unit">{{ resource['valueQuantity']['unit'] }}</span>
                        }
                        @if (resource['valueQuantity']['code'] && resource['valueQuantity']['system']) {
                          <span class="code-detail">({{ resource['valueQuantity']['code'] }})</span>
                        }
                      </div>
                    } @else if (resource['valueCodeableConcept']) {
                      <div class="codeable-value">
                        {{ getCodeableConceptDisplay(resource['valueCodeableConcept']) }}
                      </div>
                    } @else if (resource['valueString']) {
                      <div class="string-value">{{ resource['valueString'] }}</div>
                    } @else if (resource['valueBoolean'] !== undefined) {
                      <div class="boolean-value">
                        <span class="badge" [class]="resource['valueBoolean'] ? 'positive' : 'negative'">
                          {{ resource['valueBoolean'] ? 'Yes' : 'No' }}
                        </span>
                      </div>
                    } @else if (resource['valueDateTime']) {
                      <div class="datetime-value">{{ formatDateTime(resource['valueDateTime']) }}</div>
                    } @else if (resource['valuePeriod']) {
                      <div class="period-value">
                        @if (resource['valuePeriod']['start']) {
                          {{ formatDateTime(resource['valuePeriod']['start']) }}
                        }
                        @if (resource['valuePeriod']['end']) {
                          - {{ formatDateTime(resource['valuePeriod']['end']) }}
                        }
                      </div>
                    } @else if (resource['valueRange']) {
                      <div class="range-value">
                        @if (resource['valueRange']['low']) {
                          {{ resource['valueRange']['low']['value'] }} {{ resource['valueRange']['low']['unit'] }}
                        }
                        -
                        @if (resource['valueRange']['high']) {
                          {{ resource['valueRange']['high']['value'] }} {{ resource['valueRange']['high']['unit'] }}
                        }
                      </div>
                    }
                  </div>

                  @if (getReferenceRanges().length > 0) {
                    <div class="reference-ranges">
                      <h4>Reference Ranges</h4>
                      @for (range of getReferenceRanges(); track $index) {
                        <div class="reference-range">
                          @if (range.low || range.high) {
                            <div class="range-values">
                              @if (range.low) {
                                <span class="low">{{ range.low.value }} {{ range.low.unit }}</span>
                              }
                              @if (range.low && range.high) {
                                <span class="separator">-</span>
                              }
                              @if (range.high) {
                                <span class="high">{{ range.high.value }} {{ range.high.unit }}</span>
                              }
                            </div>
                          }
                          @if (range.text) {
                            <div class="range-text">{{ range.text }}</div>
                          }
                          @if (range.type) {
                            <span class="badge range-type">{{ getCodeableConceptDisplay(range.type) }}</span>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>
              } @else if (resource && resource['dataAbsentReason']) {
                <div class="absent-data">
                  <span class="badge absent">Data Absent</span>
                  <span class="reason">{{ getCodeableConceptDisplay(resource['dataAbsentReason']) }}</span>
                </div>
              } @else {
                <div class="no-value">
                  <span class="no-data">No value recorded</span>
                </div>
              }
            </div>
          </section>

          <!-- Interpretation and Notes -->
          @if (getInterpretations().length > 0 || (resource && resource['note']?.length > 0)) {
            <section class="form-section">
              <h3 class="section-title">Interpretation & Notes</h3>
              
              @if (getInterpretations().length > 0) {
                <div class="interpretations">
                  <h4>Interpretations</h4>
                  @for (interpretation of getInterpretations(); track $index) {
                    <span class="badge interpretation">{{ getCodeableConceptDisplay(interpretation) }}</span>
                  }
                </div>
              }

              @if (resource && resource['note']?.length > 0) {
                <div class="notes">
                  <h4>Notes</h4>
                  @for (note of resource['note']; track $index) {
                    <div class="note-entry">
                      <div class="note-text">{{ note.text }}</div>
                      @if (note.authorString || note.time) {
                        <div class="note-meta">
                          @if (note.authorString) {
                            <span class="author">{{ note.authorString }}</span>
                          }
                          @if (note.time) {
                            <span class="time">{{ formatDateTime(note.time) }}</span>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </section>
          }

          <!-- Performers -->
          @if (getPerformers().length > 0) {
            <section class="form-section">
              <h3 class="section-title">Performers</h3>
              @for (performer of getPerformers(); track $index) {
                <div class="performer-entry">
                  <span class="field-value reference">{{ performer.reference }}</span>
                  @if (performer.display) {
                    <span class="performer-display">{{ performer.display }}</span>
                  }
                </div>
              }
            </section>
          }

          <!-- Components -->
          @if (getComponents().length > 0) {
            <section class="form-section">
              <h3 class="section-title">Components</h3>
              @for (component of getComponents(); track $index) {
                <div class="component-entry">
                  <div class="component-code">
                    <strong>{{ getCodeableConceptDisplay(component.code) }}</strong>
                  </div>
                  @if (component.valueQuantity) {
                    <div class="component-value">
                      {{ component.valueQuantity.value }} {{ component.valueQuantity.unit }}
                    </div>
                  } @else if (component.valueString) {
                    <div class="component-value">{{ component.valueString }}</div>
                  } @else if (component.valueCodeableConcept) {
                    <div class="component-value">{{ getCodeableConceptDisplay(component.valueCodeableConcept) }}</div>
                  }
                </div>
              }
            </section>
          }
        </div>
      }
    </div>
  `,
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