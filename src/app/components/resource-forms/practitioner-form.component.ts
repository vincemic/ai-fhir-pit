import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FhirResource } from '../../services/fhir.service';
import { ResourceFormComponent } from './resource-form.interface';

@Component({
  selector: 'app-practitioner-form',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="practitioner-form">
      @if (resource) {
        <div class="form-sections">
          <!-- Basic Information -->
          <section class="form-section">
            <h3 class="section-title">Practitioner Details</h3>
            <div class="form-grid">
              <!-- Names -->
              <div class="form-group full-width">
                <label class="form-label">Names</label>
                @if (getNames().length > 0) {
                  @for (name of getNames(); track $index) {
                    <div class="name-entry">
                      <div class="name-display">
                        {{ getHumanNameDisplay(name) }}
                      </div>
                      @if (name.use) {
                        <span class="badge use-{{ name.use }}">{{ name.use }}</span>
                      }
                    </div>
                  }
                } @else {
                  <span class="no-data">No names recorded</span>
                }
              </div>

              <div class="form-group">
                <label class="form-label">Active</label>
                <span class="field-value">
                  @if (resource['active'] !== undefined) {
                    <span class="badge" [class]="resource['active'] ? 'active' : 'inactive'">
                      {{ resource['active'] ? 'Yes' : 'No' }}
                    </span>
                  } @else {
                    <span class="no-data">Not specified</span>
                  }
                </span>
              </div>

              @if (resource['gender']) {
                <div class="form-group">
                  <label class="form-label">Gender</label>
                  <span class="field-value">
                    <span class="badge gender-{{ resource['gender'] }}">{{ resource['gender'] | titlecase }}</span>
                  </span>
                </div>
              }

              @if (resource['birthDate']) {
                <div class="form-group">
                  <label class="form-label">Birth Date</label>
                  <span class="field-value">{{ formatDate(resource['birthDate']) }}</span>
                </div>
              }
            </div>
          </section>

          <!-- Identifiers -->
          @if (getIdentifiers().length > 0) {
            <section class="form-section">
              <h3 class="section-title">Identifiers</h3>
              <div class="identifiers-grid">
                @for (identifier of getIdentifiers(); track $index) {
                  <div class="identifier-entry">
                    @if (identifier.type) {
                      <div class="identifier-type">
                        <strong>{{ getCodeableConceptDisplay(identifier.type) }}</strong>
                      </div>
                    }
                    <div class="identifier-value" title="{{ identifier.value }}">
                      {{ identifier.value }}
                    </div>
                    @if (identifier.system) {
                      <div class="identifier-system" title="{{ identifier.system }}">
                        <small>System: {{ identifier.system }}</small>
                      </div>
                    }
                    @if (identifier.use) {
                      <div class="identifier-badges">
                        <span class="badge use-{{ identifier.use }}">{{ identifier.use }}</span>
                      </div>
                    }
                  </div>
                }
              </div>
            </section>
          }

          <!-- Contact Information -->
          @if (getTelecom().length > 0 || getAddresses().length > 0) {
            <section class="form-section">
              <h3 class="section-title">Contact Information</h3>
              
              @if (getTelecom().length > 0) {
                <div class="subsection">
                  <h4>Phone & Email</h4>
                  @for (telecom of getTelecom(); track $index) {
                    <div class="telecom-entry">
                      <div class="telecom-value">
                        @if (telecom.system === 'email') {
                          <a href="mailto:{{ telecom.value }}">{{ telecom.value }}</a>
                        } @else if (telecom.system === 'phone') {
                          <a href="tel:{{ telecom.value }}">{{ telecom.value }}</a>
                        } @else {
                          {{ telecom.value }}
                        }
                      </div>
                      @if (telecom.system) {
                        <span class="badge system-{{ telecom.system }}">{{ telecom.system }}</span>
                      }
                      @if (telecom.use) {
                        <span class="badge use-{{ telecom.use }}">{{ telecom.use }}</span>
                      }
                    </div>
                  }
                </div>
              }

              @if (getAddresses().length > 0) {
                <div class="subsection">
                  <h4>Addresses</h4>
                  @for (address of getAddresses(); track $index) {
                    <div class="address-entry">
                      <div class="address-text">
                        @if (address.text) {
                          {{ address.text }}
                        } @else {
                          @if (address.line?.length) {
                            <div>{{ address.line.join(', ') }}</div>
                          }
                          <div>{{ getAddressLine(address) }}</div>
                        }
                      </div>
                      @if (address.use) {
                        <span class="badge use-{{ address.use }}">{{ address.use }}</span>
                      }
                      @if (address.type) {
                        <span class="badge type-{{ address.type }}">{{ address.type }}</span>
                      }
                    </div>
                  }
                </div>
              }
            </section>
          }

          <!-- Qualifications -->
          @if (getQualifications().length > 0) {
            <section class="form-section">
              <h3 class="section-title">Qualifications</h3>
              @for (qualification of getQualifications(); track $index) {
                <div class="qualification-entry">
                  @if (qualification.code) {
                    <div class="qualification-code">
                      <strong>{{ getCodeableConceptDisplay(qualification.code) }}</strong>
                    </div>
                  }
                  @if (qualification.issuer) {
                    <div class="qualification-issuer">
                      Issued by: {{ qualification.issuer.display || qualification.issuer.reference }}
                    </div>
                  }
                  @if (qualification.period) {
                    <div class="qualification-period">
                      @if (qualification.period.start) {
                        Valid from: {{ formatDate(qualification.period.start) }}
                      }
                      @if (qualification.period.end) {
                        until {{ formatDate(qualification.period.end) }}
                      }
                    </div>
                  }
                </div>
              }
            </section>
          }

          <!-- Communication Languages -->
          @if (getCommunication().length > 0) {
            <section class="form-section">
              <h3 class="section-title">Communication Languages</h3>
              @for (comm of getCommunication(); track $index) {
                <div class="communication-entry">
                  @if (comm.language) {
                    <div class="language">
                      {{ getCodeableConceptDisplay(comm.language) }}
                    </div>
                  }
                  @if (comm.preferred) {
                    <span class="badge preferred">Preferred</span>
                  }
                </div>
              }
            </section>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .practitioner-form {
      .form-sections {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .form-section {
        background: var(--vscode-bg-secondary);
        border: 1px solid var(--vscode-border-primary);
        border-radius: 8px;
        padding: 1.5rem;
        box-shadow: var(--shadow-sm);

        .section-title {
          margin: 0 0 1.5rem 0;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid var(--vscode-border-primary);
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--vscode-text-primary);
        }

        .subsection {
          margin-top: 1.5rem;

          h4 {
            margin: 0 0 1rem 0;
            font-size: 1.1rem;
            font-weight: 500;
            color: var(--vscode-text-secondary);
          }
        }
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
        align-items: start;

        .full-width {
          grid-column: 1 / -1;
        }
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        .form-label {
          font-weight: 500;
          color: var(--vscode-text-secondary);
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .field-value {
          color: var(--vscode-text-primary);
          font-size: 1rem;
        }
      }

      .no-data {
        color: var(--vscode-text-muted);
        font-style: italic;
      }

      .badge {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin: 0 0.25rem 0.25rem 0;

        &.active {
          background: var(--vscode-success);
          color: var(--vscode-bg-primary);
        }

        &.inactive {
          background: var(--vscode-error);
          color: var(--vscode-text-inverse);
        }

        &.preferred {
          background: var(--vscode-info);
          color: var(--vscode-bg-primary);
        }

        &.gender-male {
          background: var(--vscode-info);
          color: var(--vscode-bg-primary);
        }

        &.gender-female {
          background: var(--fhir-condition);
          color: var(--vscode-bg-primary);
        }

        &.gender-other {
          background: var(--vscode-warning);
          color: var(--vscode-bg-primary);
        }

        &.use-usual, &.use-home {
          background: var(--vscode-success);
          color: var(--vscode-bg-primary);
        }

        &.use-official, &.use-work {
          background: var(--vscode-info);
          color: var(--vscode-bg-primary);
        }

        &.system-phone {
          background: var(--vscode-success);
          color: var(--vscode-bg-primary);
        }

        &.system-email {
          background: var(--vscode-info);
          color: var(--vscode-bg-primary);
        }
      }

      .name-entry, .identifier-entry, .telecom-entry, .address-entry, 
      .qualification-entry, .communication-entry {
        background: var(--vscode-bg-tertiary);
        border: 1px solid var(--vscode-border-primary);
        border-radius: 6px;
        padding: 1rem;
        margin-bottom: 0.75rem;
      }

      .identifiers-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1rem;

        @media (max-width: 768px) {
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }
      }

      .identifier-entry {
        word-wrap: break-word;
        overflow-wrap: break-word;
        min-width: 0; /* Allow container to shrink */
      }

      .identifier-value {
        font-family: var(--font-family-mono);
        font-size: 1.1rem;
        color: var(--vscode-accent-primary);
        margin-bottom: 0.5rem;
        word-break: break-all;
        overflow-wrap: break-word;
        white-space: pre-wrap;
      }

      .identifier-system {
        font-size: 0.85rem;
        color: var(--vscode-text-secondary);
        margin-bottom: 0.5rem;
        word-break: break-all;
        overflow-wrap: break-word;
        white-space: pre-wrap;
      }

      .identifier-type {
        font-weight: 500;
        color: var(--vscode-text-primary);
        margin-bottom: 0.5rem;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }

      .identifier-badges {
        margin-top: 0.5rem;
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
      }

      .telecom-entry {
        display: flex;
        align-items: center;
        gap: 0.75rem;

        .telecom-value {
          flex: 1;

          a {
            color: var(--vscode-accent-primary);
            text-decoration: none;

            &:hover {
              text-decoration: underline;
            }
          }
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PractitionerFormComponent implements ResourceFormComponent {
  @Input() resource: FhirResource | null = null;
  @Input() readonly: boolean = true;

  protected getNames(): any[] {
    return this.resource?.['name'] || [];
  }

  protected getIdentifiers(): any[] {
    return this.resource?.['identifier'] || [];
  }

  protected getTelecom(): any[] {
    return this.resource?.['telecom'] || [];
  }

  protected getAddresses(): any[] {
    return this.resource?.['address'] || [];
  }

  protected getQualifications(): any[] {
    return this.resource?.['qualification'] || [];
  }

  protected getCommunication(): any[] {
    return this.resource?.['communication'] || [];
  }

  protected formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
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

  protected getHumanNameDisplay(name: any): string {
    if (!name) return '';
    
    const parts = [];
    if (name.prefix && name.prefix.length > 0) {
      parts.push(name.prefix.join(' '));
    }
    if (name.given && name.given.length > 0) {
      parts.push(name.given.join(' '));
    }
    if (name.family) {
      parts.push(name.family);
    }
    if (name.suffix && name.suffix.length > 0) {
      parts.push(name.suffix.join(' '));
    }
    
    return parts.join(' ') || 'Unknown Name';
  }

  protected getAddressLine(address: any): string {
    const parts = [address.city, address.state, address.postalCode, address.country];
    return parts.filter(part => part).join(', ');
  }
}