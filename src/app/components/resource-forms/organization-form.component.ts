import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FhirResource } from '../../services/fhir.service';
import { ResourceFormComponent } from './resource-form.interface';

@Component({
  selector: 'app-organization-form',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="organization-form">
      @if (resource) {
        <div class="form-sections">
          <!-- Basic Information Section -->
          <section class="form-section">
            <h3 class="section-title">Organization Information</h3>
            <div class="form-grid">
              <!-- Organization Name -->
              <div class="form-group full-width">
                <label class="form-label">Organization Name</label>
                <span class="field-value">
                  @if (resource['name']) {
                    <span class="org-name">{{ resource['name'] }}</span>
                  } @else {
                    <span class="no-data">No name recorded</span>
                  }
                </span>
              </div>

              <!-- Aliases -->
              @if (getAliases().length > 0) {
                <div class="form-group full-width">
                  <label class="form-label">Aliases</label>
                  <div class="aliases-list">
                    @for (alias of getAliases(); track $index) {
                      <span class="badge alias">{{ alias }}</span>
                    }
                  </div>
                </div>
              }

              <!-- Status -->
              <div class="form-group">
                <label class="form-label">Status</label>
                <span class="field-value">
                  @if (resource['active'] !== undefined) {
                    <span class="badge" [class]="resource['active'] ? 'active' : 'inactive'">
                      {{ resource['active'] ? 'Active' : 'Inactive' }}
                    </span>
                  } @else {
                    <span class="no-data">Not specified</span>
                  }
                </span>
              </div>

              <!-- Organization Type -->
              @if (getTypes().length > 0) {
                <div class="form-group">
                  <label class="form-label">Organization Type</label>
                  <div class="types-list">
                    @for (type of getTypes(); track $index) {
                      <span class="badge org-type">{{ getCodeableConceptDisplay(type) }}</span>
                    }
                  </div>
                </div>
              }
            </div>
          </section>

          <!-- Identifiers Section -->
          @if (getIdentifiers().length > 0) {
            <section class="form-section">
              <h3 class="section-title">Identifiers</h3>
              <div class="identifiers-grid">
                @for (identifier of getIdentifiers(); track $index) {
                  <div class="identifier-entry">
                    @if (identifier.type) {
                      <div class="identifier-type">
                        {{ getCodeableConceptDisplay(identifier.type) }}
                      </div>
                    }
                    <div class="identifier-value">{{ identifier.value }}</div>
                    @if (identifier.system) {
                      <div class="identifier-system">{{ identifier.system }}</div>
                    }
                    @if (identifier.use) {
                      <span class="badge use-{{ identifier.use }}">{{ identifier.use }}</span>
                    }
                    @if (identifier.period) {
                      <div class="identifier-period">
                        Valid: {{ formatPeriod(identifier.period) }}
                      </div>
                    }
                  </div>
                }
              </div>
            </section>
          }

          <!-- Contact Information Section -->
          <section class="form-section">
            <h3 class="section-title">Contact Information</h3>
            
            <!-- Addresses -->
            @if (getAddresses().length > 0) {
              <div class="subsection">
                <h4 class="subsection-title">Addresses</h4>
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
                    @if (address.period) {
                      <div class="address-period">
                        Valid: {{ formatPeriod(address.period) }}
                      </div>
                    }
                  </div>
                }
              </div>
            }

            <!-- Telecom -->
            @if (getTelecom().length > 0) {
              <div class="subsection">
                <h4 class="subsection-title">Phone & Email</h4>
                @for (telecom of getTelecom(); track $index) {
                  <div class="telecom-entry">
                    <div class="telecom-value">
                      @if (telecom.system === 'email') {
                        <a href="mailto:{{ telecom.value }}">{{ telecom.value }}</a>
                      } @else if (telecom.system === 'phone') {
                        <a href="tel:{{ telecom.value }}">{{ telecom.value }}</a>
                      } @else if (telecom.system === 'url') {
                        <a href="{{ telecom.value }}" target="_blank">{{ telecom.value }}</a>
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
                    @if (telecom.period) {
                      <div class="telecom-period">
                        Valid: {{ formatPeriod(telecom.period) }}
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </section>

          <!-- Contact Persons -->
          @if (getContacts().length > 0) {
            <section class="form-section">
              <h3 class="section-title">Contact Persons</h3>
              @for (contact of getContacts(); track $index) {
                <div class="contact-entry">
                  @if (contact.purpose) {
                    <div class="contact-purpose">
                      <strong>Purpose:</strong> {{ getCodeableConceptDisplay(contact.purpose) }}
                    </div>
                  }
                  @if (contact.name) {
                    <div class="contact-name">
                      <strong>Name:</strong> {{ getHumanNameDisplay(contact.name) }}
                    </div>
                  }
                  @if (contact.telecom?.length) {
                    <div class="contact-telecom">
                      <strong>Contact:</strong>
                      @for (telecom of contact.telecom; track $index) {
                        <div class="telecom-item">
                          {{ telecom.value }} 
                          @if (telecom.system) {
                            <span class="telecom-type">({{ telecom.system }})</span>
                          }
                        </div>
                      }
                    </div>
                  }
                  @if (contact.address) {
                    <div class="contact-address">
                      <strong>Address:</strong>
                      @if (contact.address.text) {
                        {{ contact.address.text }}
                      } @else {
                        {{ getFullAddress(contact.address) }}
                      }
                    </div>
                  }
                </div>
              }
            </section>
          }

          <!-- Part Of (Parent Organization) -->
          @if (resource['partOf']) {
            <section class="form-section">
              <h3 class="section-title">Organizational Hierarchy</h3>
              <div class="form-group">
                <label class="form-label">Part Of</label>
                <span class="field-value">
                  <span class="reference-value">{{ resource['partOf']['reference'] }}</span>
                  @if (resource['partOf']['display']) {
                    <span class="reference-display"> - {{ resource['partOf']['display'] }}</span>
                  }
                </span>
              </div>
            </section>
          }

          <!-- Endpoints -->
          @if (getEndpoints().length > 0) {
            <section class="form-section">
              <h3 class="section-title">Technical Endpoints</h3>
              <div class="endpoints-list">
                @for (endpoint of getEndpoints(); track $index) {
                  <div class="endpoint-entry">
                    <div class="endpoint-reference">{{ endpoint.reference }}</div>
                    @if (endpoint.display) {
                      <div class="endpoint-display">{{ endpoint.display }}</div>
                    }
                  </div>
                }
              </div>
            </section>
          }

          <!-- Qualification -->
          @if (getQualifications().length > 0) {
            <section class="form-section">
              <h3 class="section-title">Qualifications & Accreditations</h3>
              @for (qualification of getQualifications(); track $index) {
                <div class="qualification-entry">
                  @if (qualification.identifier?.length) {
                    <div class="qualification-identifiers">
                      <strong>Identifiers:</strong>
                      @for (id of qualification.identifier; track $index) {
                        <span class="qualification-id">{{ id.value }}</span>
                      }
                    </div>
                  }
                  @if (qualification.code) {
                    <div class="qualification-code">
                      <strong>Qualification:</strong> {{ getCodeableConceptDisplay(qualification.code) }}
                    </div>
                  }
                  @if (qualification.period) {
                    <div class="qualification-period">
                      <strong>Valid Period:</strong> {{ formatPeriod(qualification.period) }}
                    </div>
                  }
                  @if (qualification.issuer) {
                    <div class="qualification-issuer">
                      <strong>Issued By:</strong> 
                      <span class="reference-value">{{ qualification.issuer.reference }}</span>
                      @if (qualification.issuer.display) {
                        <span class="reference-display"> - {{ qualification.issuer.display }}</span>
                      }
                    </div>
                  }
                </div>
              }
            </section>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './organization-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationFormComponent implements ResourceFormComponent {
  @Input() resource: FhirResource | null = null;
  @Input() readonly: boolean = true;

  protected getIdentifiers(): any[] {
    return this.resource?.['identifier'] || [];
  }

  protected getAliases(): string[] {
    return this.resource?.['alias'] || [];
  }

  protected getTypes(): any[] {
    return this.resource?.['type'] || [];
  }

  protected getAddresses(): any[] {
    return this.resource?.['address'] || [];
  }

  protected getTelecom(): any[] {
    return this.resource?.['telecom'] || [];
  }

  protected getContacts(): any[] {
    return this.resource?.['contact'] || [];
  }

  protected getEndpoints(): any[] {
    return this.resource?.['endpoint'] || [];
  }

  protected getQualifications(): any[] {
    return this.resource?.['qualification'] || [];
  }

  protected formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  protected formatPeriod(period: any): string {
    if (!period) return '';
    
    const start = period.start ? this.formatDate(period.start) : 'Unknown';
    const end = period.end ? this.formatDate(period.end) : 'Ongoing';
    
    return `${start} - ${end}`;
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

  protected getFullAddress(address: any): string {
    const parts = [];
    if (address.line && address.line.length > 0) {
      parts.push(address.line.join(', '));
    }
    parts.push(this.getAddressLine(address));
    return parts.filter(part => part).join(', ');
  }
}