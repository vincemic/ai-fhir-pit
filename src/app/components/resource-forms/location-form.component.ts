import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FhirResource } from '../../services/fhir.service';
import { ResourceFormComponent } from './resource-form.interface';

@Component({
  selector: 'app-location-form',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="location-form">
      @if (resource) {
        <div class="form-sections">
          <!-- Basic Information Section -->
          <section class="form-section">
            <h3 class="section-title">Location Information</h3>
            <div class="form-grid">
              <!-- Location Name -->
              <div class="form-group full-width">
                <label class="form-label">Location Name</label>
                <span class="field-value">
                  @if (resource['name']) {
                    <span class="location-name">{{ resource['name'] }}</span>
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
                  @if (resource['status']) {
                    <span class="badge status-{{ resource['status'] }}">
                      {{ resource['status'] | titlecase }}
                    </span>
                  } @else {
                    <span class="no-data">Not specified</span>
                  }
                </span>
              </div>

              <!-- Operational Status -->
              @if (resource['operationalStatus']) {
                <div class="form-group">
                  <label class="form-label">Operational Status</label>
                  <span class="field-value">
                    <span class="badge operational-status">
                      {{ getCodeableConceptDisplay(resource['operationalStatus']) }}
                    </span>
                  </span>
                </div>
              }

              <!-- Mode -->
              @if (resource['mode']) {
                <div class="form-group">
                  <label class="form-label">Mode</label>
                  <span class="field-value">
                    <span class="badge mode-{{ resource['mode'] }}">
                      {{ resource['mode'] | titlecase }}
                    </span>
                  </span>
                </div>
              }

              <!-- Physical Type -->
              @if (resource['physicalType']) {
                <div class="form-group">
                  <label class="form-label">Physical Type</label>
                  <span class="field-value">
                    <span class="badge physical-type">
                      {{ getCodeableConceptDisplay(resource['physicalType']) }}
                    </span>
                  </span>
                </div>
              }
            </div>
          </section>

          <!-- Description -->
          @if (resource['description']) {
            <section class="form-section">
              <h3 class="section-title">Description</h3>
              <div class="description-content">
                {{ resource['description'] }}
              </div>
            </section>
          }

          <!-- Location Types -->
          @if (getTypes().length > 0) {
            <section class="form-section">
              <h3 class="section-title">Location Types</h3>
              <div class="types-list">
                @for (type of getTypes(); track $index) {
                  <div class="type-entry">
                    <span class="badge location-type">{{ getCodeableConceptDisplay(type) }}</span>
                    @if (getCodeableConcepts(type).length > 1) {
                      <div class="additional-codings">
                        @for (coding of getCodeableConcepts(type).slice(1); track $index) {
                          <span class="coding-detail">{{ coding.display || coding.code }}</span>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            </section>
          }

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
            
            <!-- Address -->
            @if (resource['address']) {
              <div class="subsection">
                <h4 class="subsection-title">Address</h4>
                <div class="address-entry">
                  <div class="address-text">
                    @if (resource['address']['text']) {
                      {{ resource['address']['text'] }}
                    } @else {
                      @if (resource['address']['line']?.length) {
                        <div>{{ resource['address']['line'].join(', ') }}</div>
                      }
                      <div>{{ getAddressLine(resource['address']) }}</div>
                    }
                  </div>
                  @if (resource['address']['use']) {
                    <span class="badge use-{{ resource['address']['use'] }}">{{ resource['address']['use'] }}</span>
                  }
                  @if (resource['address']['type']) {
                    <span class="badge type-{{ resource['address']['type'] }}">{{ resource['address']['type'] }}</span>
                  }
                  @if (resource['address']['period']) {
                    <div class="address-period">
                      Valid: {{ formatPeriod(resource['address']['period']) }}
                    </div>
                  }
                </div>
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

          <!-- Position (Geographic Coordinates) -->
          @if (resource['position']) {
            <section class="form-section">
              <h3 class="section-title">Geographic Position</h3>
              <div class="position-info">
                <div class="coordinate-grid">
                  @if (resource['position']['longitude'] !== undefined) {
                    <div class="coordinate-item">
                      <label>Longitude</label>
                      <span class="coordinate-value">{{ resource['position']['longitude'] }}</span>
                    </div>
                  }
                  @if (resource['position']['latitude'] !== undefined) {
                    <div class="coordinate-item">
                      <label>Latitude</label>
                      <span class="coordinate-value">{{ resource['position']['latitude'] }}</span>
                    </div>
                  }
                  @if (resource['position']['altitude'] !== undefined) {
                    <div class="coordinate-item">
                      <label>Altitude</label>
                      <span class="coordinate-value">{{ resource['position']['altitude'] }} m</span>
                    </div>
                  }
                </div>
                @if (resource['position']['longitude'] !== undefined && resource['position']['latitude'] !== undefined) {
                  <div class="map-link">
                    <a href="https://www.google.com/maps?q={{ resource['position']['latitude'] }},{{ resource['position']['longitude'] }}" 
                       target="_blank" class="external-link">
                      View on Google Maps
                    </a>
                  </div>
                }
              </div>
            </section>
          }

          <!-- Managing Organization -->
          @if (resource['managingOrganization']) {
            <section class="form-section">
              <h3 class="section-title">Managing Organization</h3>
              <div class="form-group">
                <span class="field-value">
                  <span class="reference-value">{{ resource['managingOrganization']['reference'] }}</span>
                  @if (resource['managingOrganization']['display']) {
                    <span class="reference-display"> - {{ resource['managingOrganization']['display'] }}</span>
                  }
                </span>
              </div>
            </section>
          }

          <!-- Part Of (Parent Location) -->
          @if (resource['partOf']) {
            <section class="form-section">
              <h3 class="section-title">Location Hierarchy</h3>
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

          <!-- Hours of Operation -->
          @if (getHoursOfOperation().length > 0) {
            <section class="form-section">
              <h3 class="section-title">Hours of Operation</h3>
              <div class="hours-list">
                @for (hours of getHoursOfOperation(); track $index) {
                  <div class="hours-entry">
                    @if (hours.daysOfWeek?.length) {
                      <div class="days-of-week">
                        @for (day of hours.daysOfWeek; track $index) {
                          <span class="badge day">{{ day }}</span>
                        }
                      </div>
                    }
                    @if (hours.allDay) {
                      <div class="all-day">All Day</div>
                    } @else {
                      <div class="time-range">
                        @if (hours.openingTime) {
                          <span class="opening-time">{{ hours.openingTime }}</span>
                        }
                        @if (hours.openingTime && hours.closingTime) {
                          <span class="time-separator"> - </span>
                        }
                        @if (hours.closingTime) {
                          <span class="closing-time">{{ hours.closingTime }}</span>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            </section>
          }

          <!-- Availability Exceptions -->
          @if (getAvailabilityExceptions()) {
            <section class="form-section">
              <h3 class="section-title">Availability Exceptions</h3>
              <div class="exceptions-content">
                {{ getAvailabilityExceptions() }}
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
        </div>
      }
    </div>
  `,
  styleUrl: './location-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocationFormComponent implements ResourceFormComponent {
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

  protected getTelecom(): any[] {
    return this.resource?.['telecom'] || [];
  }

  protected getEndpoints(): any[] {
    return this.resource?.['endpoint'] || [];
  }

  protected getHoursOfOperation(): any[] {
    return this.resource?.['hoursOfOperation'] || [];
  }

  protected getAvailabilityExceptions(): string | null {
    return this.resource?.['availabilityExceptions'] || null;
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

  protected getCodeableConcepts(concept: any): any[] {
    if (!concept || !concept.coding) return [];
    return concept.coding;
  }

  protected getAddressLine(address: any): string {
    const parts = [address.city, address.state, address.postalCode, address.country];
    return parts.filter(part => part).join(', ');
  }
}