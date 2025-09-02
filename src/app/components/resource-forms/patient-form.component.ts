import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FhirResource } from '../../services/fhir.service';
import { ResourceFormComponent } from './resource-form.interface';

@Component({
  selector: 'app-patient-form',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="patient-form">
      @if (resource) {
        <div class="form-sections">
          <!-- Demographics Section -->
          <section class="form-section">
            <h3 class="section-title">Demographics</h3>
            <div class="form-grid">
              <!-- Names -->
              <div class="form-group full-width">
                <label class="form-label">Names</label>
                @if (getNames().length > 0) {
                  @for (name of getNames(); track $index) {
                    <div class="name-entry">
                      <div class="name-fields">
                        @if (name.prefix?.length) {
                          <div class="field-group">
                            <label>Prefix</label>
                            <span class="field-value">{{ name.prefix.join(' ') }}</span>
                          </div>
                        }
                        @if (name.given?.length) {
                          <div class="field-group">
                            <label>Given Names</label>
                            <span class="field-value">{{ name.given.join(' ') }}</span>
                          </div>
                        }
                        @if (name.family) {
                          <div class="field-group">
                            <label>Family Name</label>
                            <span class="field-value">{{ name.family }}</span>
                          </div>
                        }
                        @if (name.suffix?.length) {
                          <div class="field-group">
                            <label>Suffix</label>
                            <span class="field-value">{{ name.suffix.join(' ') }}</span>
                          </div>
                        }
                        @if (name.use) {
                          <div class="field-group">
                            <label>Use</label>
                            <span class="field-value badge" [class]="'use-' + name.use">{{ name.use }}</span>
                          </div>
                        }
                      </div>
                    </div>
                  }
                } @else {
                  <span class="no-data">No names recorded</span>
                }
              </div>

              <!-- Basic Demographics -->
              <div class="form-group">
                <label class="form-label">Gender</label>
                <span class="field-value">
                  @if (resource['gender']) {
                    <span class="badge gender-{{ resource['gender'] }}">{{ resource['gender'] | titlecase }}</span>
                  } @else {
                    <span class="no-data">Not specified</span>
                  }
                </span>
              </div>

              <div class="form-group">
                <label class="form-label">Birth Date</label>
                <span class="field-value">
                  @if (resource['birthDate']) {
                    {{ formatDate(resource['birthDate']) }}
                    @if (getAge()) {
                      <span class="age-display">({{ getAge() }} years old)</span>
                    }
                  } @else {
                    <span class="no-data">Not recorded</span>
                  }
                </span>
              </div>

              @if (resource['deceasedBoolean'] !== undefined || resource['deceasedDateTime']) {
                <div class="form-group">
                  <label class="form-label">Deceased</label>
                  <span class="field-value">
                    @if (resource['deceasedBoolean'] === true) {
                      <span class="badge deceased">Yes</span>
                    } @else if (resource['deceasedDateTime']) {
                      <span class="badge deceased">{{ formatDate(resource['deceasedDateTime']) }}</span>
                    } @else {
                      <span class="badge alive">No</span>
                    }
                  </span>
                </div>
              }

              @if (resource['maritalStatus']) {
                <div class="form-group">
                  <label class="form-label">Marital Status</label>
                  <span class="field-value">
                    {{ getCodeableConceptDisplay(resource['maritalStatus']) }}
                  </span>
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
                        <div>
                          {{ getAddressLine(address) }}
                        </div>
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
          </section>

          <!-- Emergency Contacts -->
          @if (getContacts().length > 0) {
            <section class="form-section">
              <h3 class="section-title">Emergency Contacts</h3>
              @for (contact of getContacts(); track $index) {
                <div class="contact-entry">
                  @if (contact.name) {
                    <div class="contact-name">
                      {{ getHumanNameDisplay(contact.name) }}
                    </div>
                  }
                  @if (contact.relationship?.length) {
                    <div class="contact-relationship">
                      @for (rel of contact.relationship; track $index) {
                        <span class="badge relationship">{{ getCodeableConceptDisplay(rel) }}</span>
                      }
                    </div>
                  }
                  @if (contact.telecom?.length) {
                    <div class="contact-telecom">
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
                </div>
              }
            </section>
          }

          <!-- Communication Preferences -->
          @if (getCommunication().length > 0) {
            <section class="form-section">
              <h3 class="section-title">Communication Preferences</h3>
              @for (comm of getCommunication(); track $index) {
                <div class="communication-entry">
                  @if (comm.language) {
                    <div class="language">
                      <strong>Language:</strong> {{ getCodeableConceptDisplay(comm.language) }}
                    </div>
                  }
                  @if (comm.preferred) {
                    <span class="badge preferred">Preferred</span>
                  }
                </div>
              }
            </section>
          }

          <!-- Clinical Information -->
          <section class="form-section">
            <h3 class="section-title">Clinical Information</h3>
            <div class="form-grid">
              @if (resource['active'] !== undefined) {
                <div class="form-group">
                  <label class="form-label">Active</label>
                  <span class="field-value">
                    <span class="badge" [class]="resource['active'] ? 'active' : 'inactive'">
                      {{ resource['active'] ? 'Yes' : 'No' }}
                    </span>
                  </span>
                </div>
              }

              @if (resource['multipleBirthBoolean'] !== undefined || resource['multipleBirthInteger'] !== undefined) {
                <div class="form-group">
                  <label class="form-label">Multiple Birth</label>
                  <span class="field-value">
                    @if (resource['multipleBirthBoolean']) {
                      <span class="badge">Yes</span>
                    } @else if (resource['multipleBirthInteger']) {
                      <span class="badge">Birth #{{ resource['multipleBirthInteger'] }}</span>
                    } @else {
                      <span class="badge">No</span>
                    }
                  </span>
                </div>
              }
            </div>
          </section>

          <!-- Links and References -->
          @if (getLinks().length > 0) {
            <section class="form-section">
              <h3 class="section-title">Related Records</h3>
              @for (link of getLinks(); track $index) {
                <div class="link-entry">
                  <div class="link-other">
                    <strong>Linked Patient:</strong> {{ link.other?.reference }}
                  </div>
                  @if (link.type) {
                    <span class="badge link-{{ link.type }}">{{ link.type }}</span>
                  }
                </div>
              }
            </section>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './patient-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientFormComponent implements ResourceFormComponent {
  @Input() resource: FhirResource | null = null;
  @Input() readonly: boolean = true;

  protected getNames(): any[] {
    return this.resource?.['name'] || [];
  }

  protected getIdentifiers(): any[] {
    return this.resource?.['identifier'] || [];
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

  protected getCommunication(): any[] {
    return this.resource?.['communication'] || [];
  }

  protected getLinks(): any[] {
    return this.resource?.['link'] || [];
  }

  protected getAge(): number | null {
    const birthDate = this.resource?.['birthDate'];
    if (!birthDate) return null;
    
    const birth = new Date(birthDate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
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