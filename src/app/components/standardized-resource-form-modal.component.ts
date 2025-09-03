import { Component, inject, signal, computed, effect, input, output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalComponent } from './modal.component';
import { ModalService } from '../services/modal.service';
import { ResourceModalData } from '../services/standardized-resource-modal.service';
import { FhirService, FhirResource } from '../services/fhir.service';

@Component({
  selector: 'app-standardized-resource-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  template: `
    <app-modal 
      modalId="resource-form-modal"
      [isVisible]="isVisible()"
      [config]="modalConfig()"
      [hasFooter]="true"
      (modalClosed)="onModalClosed($event)"
    >
      <!-- Modal Body Content -->
      @if (modalData() && resourceForm()) {
        <form [formGroup]="resourceForm()!" (ngSubmit)="onSubmit()" class="resource-form">
          @switch (modalData()!.resourceType) {
            @case ('Patient') {
              <div class="form-grid">
                <!-- Basic Information -->
                <div class="form-section-group">
                  <h3>Basic Information</h3>
                  
                  <div class="form-group">
                    <label for="identifier">Patient ID *</label>
                    <input id="identifier" formControlName="identifier" class="form-control" placeholder="Patient identifier" />
                    @if (resourceForm()!.get('identifier')?.errors?.['required'] && resourceForm()!.get('identifier')?.touched) {
                      <div class="form-error">Patient ID is required</div>
                    }
                  </div>

                  <div class="form-group">
                    <label for="active">Active Status</label>
                    <select id="active" formControlName="active" class="form-control">
                      <option [value]="true">Active</option>
                      <option [value]="false">Inactive</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="family">Family Name *</label>
                    <input id="family" formControlName="family" class="form-control" placeholder="Last name" />
                    @if (resourceForm()!.get('family')?.errors?.['required'] && resourceForm()!.get('family')?.touched) {
                      <div class="form-error">Family name is required</div>
                    }
                  </div>

                  <div class="form-group">
                    <label for="given">Given Name *</label>
                    <input id="given" formControlName="given" class="form-control" placeholder="First name" />
                    @if (resourceForm()!.get('given')?.errors?.['required'] && resourceForm()!.get('given')?.touched) {
                      <div class="form-error">Given name is required</div>
                    }
                  </div>

                  <div class="form-group">
                    <label for="gender">Gender</label>
                    <select id="gender" formControlName="gender" class="form-control">
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="birthDate">Birth Date</label>
                    <input id="birthDate" type="date" formControlName="birthDate" class="form-control" />
                  </div>
                </div>

                <!-- Contact Information -->
                <div class="form-section-group">
                  <h3>Contact Information</h3>
                  
                  <div class="form-group">
                    <label for="phone">Phone Number</label>
                    <input id="phone" type="tel" formControlName="phone" class="form-control" placeholder="+1234567890" />
                  </div>

                  <div class="form-group">
                    <label for="email">Email Address</label>
                    <input id="email" type="email" formControlName="email" class="form-control" placeholder="patient@example.com" />
                  </div>
                </div>
              </div>
            }
            
            @default {
              <div class="form-grid">
                <div class="form-section-group">
                  <h3>JSON Editor</h3>
                  <p>Use the JSON editor below to {{ modalData()!.mode }} your {{ modalData()!.resourceType }} resource:</p>
                  
                  <div class="form-group">
                    <label for="resourceJson">Resource JSON *</label>
                    <textarea 
                      id="resourceJson" 
                      formControlName="resourceJson" 
                      class="form-control json-editor"
                      rows="20"
                      placeholder="Enter your {{ modalData()!.resourceType }} JSON here..."
                    ></textarea>
                  </div>
                </div>
              </div>
            }
          }
        </form>
      }

      <!-- Preview Section -->
      @if (previewJson()) {
        <div class="preview-section">
          <h3>Resource Preview</h3>
          <pre class="preview-json">{{ previewJson() }}</pre>
        </div>
      }

      <!-- Footer Actions -->
      <div slot="footer" class="form-actions">
        <button 
          type="button"
          (click)="previewResource()"
          [disabled]="!resourceForm() || resourceForm()!.invalid"
          class="btn-secondary"
        >
          👁️ Preview JSON
        </button>
        
        <button 
          type="button"
          (click)="onSubmit()"
          [disabled]="isLoading() || !resourceForm() || resourceForm()!.invalid"
          class="btn-primary"
        >
          @if (isLoading()) {
            <span class="loading-spinner"></span>
            @if (modalData()?.mode === 'create') {
              Creating...
            } @else {
              Updating...
            }
          } @else {
            @if (modalData()?.mode === 'create') {
              ✅ Create {{ modalData()?.resourceType }}
            } @else {
              💾 Update {{ modalData()?.resourceType }}
            }
          }
        </button>
        
        <button type="button" (click)="onCancel()" class="btn-secondary">
          Cancel
        </button>
      </div>
    </app-modal>
  `,
  styleUrl: './standardized-resource-form-modal.component.scss'
})
export class StandardizedResourceFormModalComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly fhirService = inject(FhirService);
  private readonly modalService = inject(ModalService);

  // Input data
  readonly data = input<ResourceModalData>();

  // Outputs
  readonly resourceCreated = output<FhirResource>();
  readonly resourceUpdated = output<FhirResource>();

  // Signals
  protected readonly resourceForm = signal<FormGroup | null>(null);
  protected readonly previewJson = signal<string | null>(null);
  protected readonly isLoading = signal<boolean>(false);

  // Computed properties
  protected readonly modalData = computed(() => {
    return this.data() || this.getModalDataFromService();
  });

  protected readonly isVisible = computed(() => {
    return this.modalService.isOpen('resource-form-modal');
  });

  protected readonly modalConfig = computed(() => {
    const data = this.modalData();
    return {
      id: 'resource-form-modal',
      title: data ? `${data.mode === 'create' ? 'Create' : 'Edit'} ${data.resourceType}` : 'Resource Form',
      size: 'lg' as const,
      closeOnBackdrop: false,
      closeOnEscape: true,
      showCloseButton: true
    };
  });

  constructor() {
    // Create form when modal data changes
    effect(() => {
      const data = this.modalData();
      if (data && data.resourceType) {
        this.createFormForResourceType(data.resourceType);
      }
    });

    // Populate form with existing data when editing
    effect(() => {
      const data = this.modalData();
      if (data && data.mode === 'edit' && data.formData && this.resourceForm()) {
        this.populateFormWithData(data.formData);
      }
    });
  }

  ngOnDestroy(): void {
    // Ensure modal is closed if component is destroyed while modal is open
    if (this.modalService.isOpen('resource-form-modal')) {
      this.modalService.close('resource-form-modal');
    }
  }

  private getModalDataFromService(): ResourceModalData | undefined {
    const modal = this.modalService.getModal('resource-form-modal');
    return modal?.config.data as ResourceModalData | undefined;
  }

  private createFormForResourceType(resourceType: string): void {
    let form: FormGroup;

    switch (resourceType) {
      case 'Patient':
        form = this.fb.group({
          identifier: ['', Validators.required],
          active: [true],
          family: ['', Validators.required],
          given: ['', Validators.required],
          gender: [''],
          birthDate: [''],
          phone: [''],
          email: ['', Validators.email]
        });
        break;

      default:
        form = this.fb.group({
          resourceJson: ['', Validators.required]
        });
        break;
    }

    this.resourceForm.set(form);
  }

  private populateFormWithData(formData: any): void {
    const form = this.resourceForm();
    
    if (formData && form) {
      form.patchValue(formData);
    }
  }

  protected async onSubmit(): Promise<void> {
    const form = this.resourceForm();
    const data = this.modalData();
    
    if (!form || form.invalid || !data) return;

    this.isLoading.set(true);
    
    try {
      const resource = this.buildResourceFromForm(data);
      
      if (data.mode === 'create') {
        const created = await this.fhirService.createResource(resource);
        if (created) {
          this.resourceCreated.emit(created);
          this.modalService.close('resource-form-modal', created);
        }
      } else if (data.mode === 'edit') {
        const updated = await this.fhirService.updateResource(resource);
        if (updated) {
          this.resourceUpdated.emit(updated);
          this.modalService.close('resource-form-modal', updated);
        }
      }
    } catch (error) {
      console.error('Error saving resource:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  protected previewResource(): void {
    try {
      const data = this.modalData();
      if (!data) return;
      
      const resource = this.buildResourceFromForm(data);
      this.previewJson.set(JSON.stringify(resource, null, 2));
    } catch (error) {
      console.error('Error building resource:', error);
      this.previewJson.set('Error: Invalid JSON or form data');
    }
  }

  protected onCancel(): void {
    this.previewJson.set(null);
    this.modalService.close('resource-form-modal');
  }

  protected onModalClosed(result?: any): void {
    // Modal is already closed by the modal service
    this.previewJson.set(null);
  }

  private buildResourceFromForm(data: ResourceModalData): any {
    const form = this.resourceForm()!;
    const resourceType = data.resourceType;
    const mode = data.mode;
    const existingResource = data.resource;

    let resource: any;

    switch (resourceType) {
      case 'Patient':
        resource = this.buildPatientResource(form.value);
        break;
      default:
        // Use JSON editor for unsupported resource types
        try {
          resource = JSON.parse(form.value.resourceJson);
        } catch (error) {
          throw new Error('Invalid JSON in resource editor');
        }
        break;
    }

    // If editing, preserve ID and meta
    if (mode === 'edit' && existingResource) {
      resource.id = existingResource.id;
      if (existingResource.meta) {
        resource.meta = existingResource.meta;
      }
    }

    return resource;
  }

  private buildPatientResource(formValue: any): any {
    const patient: any = {
      resourceType: 'Patient',
      identifier: [{
        system: 'http://example.org/patient-ids',
        value: formValue.identifier
      }],
      active: formValue.active,
      name: [{
        family: formValue.family,
        given: [formValue.given]
      }]
    };

    if (formValue.gender) {
      patient.gender = formValue.gender;
    }

    if (formValue.birthDate) {
      patient.birthDate = formValue.birthDate;
    }

    // Add telecom
    const telecom = [];
    if (formValue.phone) {
      telecom.push({
        system: 'phone',
        value: formValue.phone,
        use: 'home'
      });
    }
    if (formValue.email) {
      telecom.push({
        system: 'email',
        value: formValue.email,
        use: 'home'
      });
    }
    if (telecom.length > 0) {
      patient.telecom = telecom;
    }

    return patient;
  }
}