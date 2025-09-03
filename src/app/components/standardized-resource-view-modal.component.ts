import { Component, inject, signal, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from './modal.component';
import { ModalService } from '../services/modal.service';
import { StandardizedResourceModalService } from '../services/standardized-resource-modal.service';
import { ResourceViewerComponent } from './resource-viewer.component';
import { FhirService, FhirResource } from '../services/fhir.service';

@Component({
  selector: 'app-standardized-resource-view-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, ResourceViewerComponent],
  template: `
    <app-modal 
      modalId="resource-view-modal"
      [isVisible]="isVisible()"
      [config]="modalConfig()"
      [hasFooter]="true"
      (modalClosed)="onModalClosed($event)"
    >
      <!-- Modal Body Content -->
      @if (resource()) {
        <div class="resource-view-content">
          <app-resource-viewer 
            [resource]="resource()!"
            [readonly]="true">
          </app-resource-viewer>
          
          @if (referencedResources().length > 0 || isLoadingReferences()) {
            <div class="referenced-resources-section">
              <h3>Referenced Resources</h3>
              @if (isLoadingReferences()) {
                <div class="loading-indicator">
                  <span class="loading-spinner"></span>
                  Loading references...
                </div>
              } @else {
                <div class="referenced-resources">
                  @for (refResource of referencedResources(); track refResource.id) {
                    <div class="referenced-resource-card">
                      <div class="ref-header">
                        <span class="ref-type">{{ refResource.resourceType }}</span>
                        <span class="ref-id">{{ refResource.id }}</span>
                      </div>
                      <div class="ref-title">{{ getResourceTitle(refResource) }}</div>
                      <div class="ref-description">{{ getResourceDescription(refResource) }}</div>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Footer Actions -->
      <div slot="footer" class="modal-actions">
        <button 
          type="button"
          (click)="loadReferences()"
          [disabled]="isLoadingReferences()"
          class="btn-secondary"
        >
          @if (isLoadingReferences()) {
            <span class="loading-spinner"></span>
            Loading...
          } @else {
            🔗 Load References
          }
        </button>
        
        <button 
          type="button"
          (click)="editResource()"
          class="btn-secondary"
        >
          ✏️ Edit Resource
        </button>
        
        <button 
          type="button" 
          (click)="closeModal()" 
          class="btn-secondary"
        >
          Close
        </button>
      </div>
    </app-modal>
  `,
  styleUrl: './standardized-resource-view-modal.component.scss'
})
export class StandardizedResourceViewModalComponent {
  private readonly modalService = inject(ModalService);
  private readonly resourceModalService = inject(StandardizedResourceModalService);
  private readonly fhirService = inject(FhirService);

  // Input data
  readonly data = input<{ resource: FhirResource }>();

  // Outputs
  readonly editRequested = output<FhirResource>();

  // Signals
  protected readonly isLoadingReferences = signal<boolean>(false);
  protected readonly referencedResources = signal<FhirResource[]>([]);

  // Computed properties
  protected readonly resource = computed(() => {
    return this.data()?.resource || this.getResourceFromService();
  });

  protected readonly isVisible = computed(() => {
    return this.modalService.isOpen('resource-view-modal');
  });

  protected readonly modalConfig = computed(() => {
    const res = this.resource();
    return {
      id: 'resource-view-modal',
      title: res ? `${res.resourceType} - ${res.id}` : 'Resource View',
      size: 'lg' as const,
      closeOnBackdrop: true,
      closeOnEscape: true,
      showCloseButton: true
    };
  });

  private getResourceFromService(): FhirResource | undefined {
    const modal = this.modalService.getModal('resource-view-modal');
    return modal?.config.data?.resource as FhirResource | undefined;
  }

  protected async loadReferences(): Promise<void> {
    const resource = this.resource();
    if (!resource) return;

    this.isLoadingReferences.set(true);
    this.referencedResources.set([]);
    
    try {
      const references = this.extractReferences(resource);
      const referencedResources: FhirResource[] = [];
      
      for (const reference of references) {
        try {
          const referencedResource = await this.fhirService.followReference(reference);
          if (referencedResource) {
            referencedResources.push(referencedResource);
          }
        } catch (error) {
          console.warn('Failed to load reference:', reference, error);
        }
      }
      
      this.referencedResources.set(referencedResources);
    } catch (error) {
      console.error('Error loading references:', error);
    } finally {
      this.isLoadingReferences.set(false);
    }
  }

  protected editResource(): void {
    const resource = this.resource();
    if (!resource) return;

    this.editRequested.emit(resource);
    this.closeModal();
    
    // Open edit modal
    this.resourceModalService.openEditModal(resource);
  }

  protected closeModal(): void {
    this.modalService.close('resource-view-modal');
  }

  protected onModalClosed(result?: any): void {
    // Reset state when modal is closed
    this.isLoadingReferences.set(false);
    this.referencedResources.set([]);
  }

  protected getResourceTitle(resource: FhirResource): string {
    switch (resource.resourceType) {
      case 'Patient':
        const name = (resource as any).name?.[0];
        if (name) {
          const given = name.given?.join(' ') || '';
          const family = name.family || '';
          return `${given} ${family}`.trim() || 'Unnamed Patient';
        }
        return 'Unnamed Patient';

      case 'Practitioner':
        const practName = (resource as any).name?.[0];
        if (practName) {
          const given = practName.given?.join(' ') || '';
          const family = practName.family || '';
          const prefix = practName.prefix?.join(' ') || '';
          return `${prefix} ${given} ${family}`.trim() || 'Unnamed Practitioner';
        }
        return 'Unnamed Practitioner';

      case 'Organization':
        return (resource as any).name || 'Unnamed Organization';

      case 'Location':
        return (resource as any).name || 'Unnamed Location';

      case 'Observation':
        const code = (resource as any).code?.coding?.[0];
        return code?.display || code?.code || 'Observation';

      case 'Condition':
        const conditionCode = (resource as any).code?.coding?.[0];
        return conditionCode?.display || conditionCode?.code || 'Condition';

      case 'Procedure':
        const procedureCode = (resource as any).code?.coding?.[0];
        return procedureCode?.display || procedureCode?.code || 'Procedure';

      default:
        return `${resource.resourceType} ${resource.id}`;
    }
  }

  protected getResourceDescription(resource: FhirResource): string {
    switch (resource.resourceType) {
      case 'Patient':
        const patient = resource as any;
        const parts = [];
        if (patient.gender) parts.push(`Gender: ${patient.gender}`);
        if (patient.birthDate) parts.push(`DOB: ${this.formatDate(patient.birthDate)}`);
        return parts.join(' • ') || 'Patient details';

      case 'Practitioner':
        const practitioner = resource as any;
        const practParts = [];
        if (practitioner.gender) practParts.push(`Gender: ${practitioner.gender}`);
        if (practitioner.qualification?.[0]) {
          practParts.push(`Qualification: ${practitioner.qualification[0].code?.coding?.[0]?.display || 'Licensed'}`);
        }
        return practParts.join(' • ') || 'Practitioner details';

      case 'Organization':
        const org = resource as any;
        const orgParts = [];
        if (org.type?.[0]?.coding?.[0]?.display) {
          orgParts.push(`Type: ${org.type[0].coding[0].display}`);
        }
        if (org.address?.[0]?.city) {
          orgParts.push(`Location: ${org.address[0].city}`);
        }
        return orgParts.join(' • ') || 'Organization details';

      case 'Location':
        const location = resource as any;
        const locParts = [];
        if (location.status) locParts.push(`Status: ${location.status}`);
        if (location.address?.city) locParts.push(`City: ${location.address.city}`);
        return locParts.join(' • ') || 'Location details';

      case 'Observation':
        const obs = resource as any;
        const obsParts = [];
        if (obs.status) obsParts.push(`Status: ${obs.status}`);
        if (obs.effectiveDateTime) obsParts.push(`Date: ${this.formatDate(obs.effectiveDateTime)}`);
        if (obs.valueQuantity) {
          obsParts.push(`Value: ${obs.valueQuantity.value} ${obs.valueQuantity.unit || ''}`);
        }
        return obsParts.join(' • ') || 'Observation details';

      default:
        return `${resource.resourceType} resource`;
    }
  }

  private formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  }

  private extractReferences(resource: FhirResource): string[] {
    const references: string[] = [];
    
    const findReferences = (obj: any): void => {
      if (typeof obj === 'object' && obj !== null) {
        if (obj.reference && typeof obj.reference === 'string') {
          references.push(obj.reference);
        }
        
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            findReferences(obj[key]);
          }
        }
      } else if (Array.isArray(obj)) {
        obj.forEach(item => findReferences(item));
      }
    };

    findReferences(resource);
    
    // Remove duplicates and filter out self-references
    return Array.from(new Set(references)).filter(ref => 
      !ref.includes(`${resource.resourceType}/${resource.id}`)
    );
  }
}