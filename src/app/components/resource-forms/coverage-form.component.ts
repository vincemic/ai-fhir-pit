import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FhirResource } from '../../services/fhir.service';
import { ResourceFormComponent } from './resource-form.interface';

@Component({
  selector: 'app-coverage-form',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="coverage-form">
      @if (resource) {
        <div class="form-sections">
          <!-- Basic Information Section -->
          <section class="form-section">
            <h3 class="section-title">Coverage Information</h3>
            <div class="form-grid">
              <!-- Status -->
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

              <!-- Type -->
              <div class="form-group">
                <label class="form-label">Coverage Type</label>
                <span class="field-value">
                  @if (resource['type']) {
                    {{ getCodeableConceptDisplay(resource['type']) }}
                  } @else {
                    <span class="no-data">Not specified</span>
                  }
                </span>
              </div>

              <!-- Relationship -->
              @if (resource['relationship']) {
                <div class="form-group">
                  <label class="form-label">Relationship to Subscriber</label>
                  <span class="field-value">
                    {{ getCodeableConceptDisplay(resource['relationship']) }}
                  </span>
                </div>
              }

              <!-- Network -->
              @if (resource['network']) {
                <div class="form-group">
                  <label class="form-label">Network</label>
                  <span class="field-value">{{ resource['network'] }}</span>
                </div>
              }
            </div>
          </section>

          <!-- Parties Section -->
          <section class="form-section">
            <h3 class="section-title">Parties Involved</h3>
            <div class="form-grid">
              <!-- Beneficiary -->
              @if (resource['beneficiary']) {
                <div class="form-group full-width">
                  <label class="form-label">Beneficiary (Patient)</label>
                  <div class="reference-display">
                    <span class="reference-value">{{ resource['beneficiary'].display || resource['beneficiary'].reference }}</span>
                    @if (resource['beneficiary'].reference) {
                      <span class="reference-link">{{ resource['beneficiary'].reference }}</span>
                    }
                  </div>
                </div>
              }

              <!-- Subscriber -->
              @if (resource['subscriber']) {
                <div class="form-group full-width">
                  <label class="form-label">Subscriber</label>
                  <div class="reference-display">
                    <span class="reference-value">{{ resource['subscriber'].display || resource['subscriber'].reference }}</span>
                    @if (resource['subscriber'].reference) {
                      <span class="reference-link">{{ resource['subscriber'].reference }}</span>
                    }
                  </div>
                </div>
              }

              <!-- Payor -->
              @if (getPayors().length > 0) {
                <div class="form-group full-width">
                  <label class="form-label">Payor(s) (Insurance Companies)</label>
                  <div class="payors-list">
                    @for (payor of getPayors(); track $index) {
                      <div class="payor-entry">
                        <span class="reference-value">{{ payor.display || payor.reference }}</span>
                        @if (payor.reference) {
                          <span class="reference-link">{{ payor.reference }}</span>
                        }
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Subscriber ID -->
              @if (resource['subscriberId']) {
                <div class="form-group">
                  <label class="form-label">Subscriber ID</label>
                  <span class="field-value subscriber-id">{{ resource['subscriberId'] }}</span>
                </div>
              }

              <!-- Dependent -->
              @if (resource['dependent']) {
                <div class="form-group">
                  <label class="form-label">Dependent Number</label>
                  <span class="field-value">{{ resource['dependent'] }}</span>
                </div>
              }
            </div>
          </section>

          <!-- Coverage Period Section -->
          @if (resource['period']) {
            <section class="form-section">
              <h3 class="section-title">Coverage Period</h3>
              <div class="form-grid">
                @if (resource['period'].start) {
                  <div class="form-group">
                    <label class="form-label">Start Date</label>
                    <span class="field-value">{{ formatDate(resource['period'].start) }}</span>
                  </div>
                }
                @if (resource['period'].end) {
                  <div class="form-group">
                    <label class="form-label">End Date</label>
                    <span class="field-value">{{ formatDate(resource['period'].end) }}</span>
                  </div>
                }
                @if (resource['period'].start && !resource['period'].end) {
                  <div class="form-group">
                    <label class="form-label">Status</label>
                    <span class="field-value">
                      <span class="badge active">Active Coverage</span>
                    </span>
                  </div>
                }
              </div>
            </section>
          }

          <!-- Class Information Section -->
          @if (getClasses().length > 0) {
            <section class="form-section">
              <h3 class="section-title">Coverage Classes</h3>
              <div class="classes-grid">
                @for (cls of getClasses(); track $index) {
                  <div class="class-entry">
                    @if (cls.type) {
                      <div class="class-type">
                        <strong>{{ getCodeableConceptDisplay(cls.type) }}</strong>
                      </div>
                    }
                    @if (cls.value) {
                      <div class="class-value">{{ cls.value }}</div>
                    }
                    @if (cls.name) {
                      <div class="class-name">{{ cls.name }}</div>
                    }
                  </div>
                }
              </div>
            </section>
          }

          <!-- Cost to Beneficiary Section -->
          @if (getCostToBeneficiary().length > 0) {
            <section class="form-section">
              <h3 class="section-title">Cost to Beneficiary</h3>
              <div class="costs-grid">
                @for (cost of getCostToBeneficiary(); track $index) {
                  <div class="cost-entry">
                    @if (cost.type) {
                      <div class="cost-type">
                        <strong>{{ getCodeableConceptDisplay(cost.type) }}</strong>
                      </div>
                    }
                    @if (cost.valueMoney) {
                      <div class="cost-value">
                        {{ formatMoney(cost.valueMoney) }}
                      </div>
                    }
                    @if (cost.valueQuantity) {
                      <div class="cost-value">
                        {{ cost.valueQuantity.value }} {{ cost.valueQuantity.unit || cost.valueQuantity.code }}
                      </div>
                    }
                    @if (cost.exception?.length) {
                      <div class="cost-exceptions">
                        <strong>Exceptions:</strong>
                        @for (exception of cost.exception; track $index) {
                          <span class="exception-badge">{{ getCodeableConceptDisplay(exception.type) }}</span>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            </section>
          }

          <!-- Contract Information -->
          @if (getContracts().length > 0) {
            <section class="form-section">
              <h3 class="section-title">Contract Information</h3>
              <div class="contracts-list">
                @for (contract of getContracts(); track $index) {
                  <div class="contract-entry">
                    <span class="reference-value">{{ contract.display || contract.reference }}</span>
                    @if (contract.reference) {
                      <span class="reference-link">{{ contract.reference }}</span>
                    }
                  </div>
                }
              </div>
            </section>
          }

          <!-- Order and Priority -->
          <section class="form-section">
            <h3 class="section-title">Administrative Details</h3>
            <div class="form-grid">
              @if (resource['order']) {
                <div class="form-group">
                  <label class="form-label">Order</label>
                  <span class="field-value">{{ resource['order'] }}</span>
                </div>
              }
              
              @if (resource['subrogation']) {
                <div class="form-group">
                  <label class="form-label">Subrogation</label>
                  <span class="field-value">
                    <span class="badge" [class]="resource['subrogation'] ? 'active' : 'inactive'">
                      {{ resource['subrogation'] ? 'Yes' : 'No' }}
                    </span>
                  </span>
                </div>
              }
            </div>
          </section>
        </div>
      }
    </div>
  `,
  styleUrl: './default-resource-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoverageFormComponent implements ResourceFormComponent {
  @Input() resource: FhirResource | null = null;
  @Input() readonly: boolean = true;

  protected getPayors(): any[] {
    return this.resource?.['payor'] || [];
  }

  protected getClasses(): any[] {
    return this.resource?.['class'] || [];
  }

  protected getCostToBeneficiary(): any[] {
    return this.resource?.['costToBeneficiary'] || [];
  }

  protected getContracts(): any[] {
    return this.resource?.['contract'] || [];
  }

  protected formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  protected formatMoney(money: any): string {
    if (!money) return '';
    
    const value = money.value || 0;
    const currency = money.currency || 'USD';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(value);
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