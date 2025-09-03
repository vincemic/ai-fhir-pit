import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../services/modal.service';
import { StandardizedResourceModalService } from '../services/standardized-resource-modal.service';
import { StandardizedResourceFormModalComponent } from './standardized-resource-form-modal.component';
import { StandardizedResourceViewModalComponent } from './standardized-resource-view-modal.component';
import { FhirResource } from '../services/fhir.service';

@Component({
  selector: 'app-modal-demo',
  standalone: true,
  imports: [
    CommonModule, 
    StandardizedResourceFormModalComponent, 
    StandardizedResourceViewModalComponent
  ],
  template: `
    <div class="modal-demo">
      <h2>Modal Framework Demo</h2>
      
      <div class="demo-section">
        <h3>Basic Modals</h3>
        <div class="button-group">
          <button (click)="openSimpleModal()" class="btn-primary">
            Open Simple Modal
          </button>
          <button (click)="openConfirmModal()" class="btn-secondary">
            Open Confirmation Modal
          </button>
          <button (click)="openLargeModal()" class="btn-secondary">
            Open Large Modal
          </button>
        </div>
      </div>

      <div class="demo-section">
        <h3>Resource Modals</h3>
        <div class="button-group">
          <button (click)="createPatient()" class="btn-primary">
            Create Patient
          </button>
          <button (click)="createObservation()" class="btn-primary">
            Create Observation
          </button>
          <button (click)="viewSampleResource()" class="btn-secondary">
            View Sample Resource
          </button>
        </div>
      </div>

      <div class="demo-section">
        <h3>Modal Actions</h3>
        <div class="button-group">
          <button (click)="closeAllModals()" class="btn-warning">
            Close All Modals
          </button>
        </div>
      </div>

      <!-- Results Display -->
      @if (lastResult()) {
        <div class="result-section">
          <h3>Last Modal Result</h3>
          <pre>{{ lastResult() | json }}</pre>
        </div>
      }
    </div>

    <!-- Include standardized modal components -->
    <app-standardized-resource-form-modal
      (resourceCreated)="onResourceCreated($event)"
      (resourceUpdated)="onResourceUpdated($event)">
    </app-standardized-resource-form-modal>

    <app-standardized-resource-view-modal
      (editRequested)="onEditRequested($event)">
    </app-standardized-resource-view-modal>
  `,
  styles: [`
    .modal-demo {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }

    .demo-section {
      margin-bottom: 32px;
      padding: 16px;
      border: 1px solid var(--vscode-border-primary, #3c3c3c);
      border-radius: 4px;
    }

    .demo-section h3 {
      margin: 0 0 16px 0;
      color: var(--vscode-text-primary, #cccccc);
    }

    .button-group {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .btn-primary, .btn-secondary, .btn-warning {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: var(--vscode-button-primary-bg, #0e639c);
      color: var(--vscode-button-primary-fg, #ffffff);
    }

    .btn-primary:hover {
      background: var(--vscode-button-primary-hover-bg, #1177bb);
    }

    .btn-secondary {
      background: var(--vscode-button-secondary-bg, #3c3c3c);
      color: var(--vscode-button-secondary-fg, #cccccc);
      border: 1px solid var(--vscode-button-secondary-border, #858585);
    }

    .btn-secondary:hover {
      background: var(--vscode-button-secondary-hover-bg, #4f4f4f);
    }

    .btn-warning {
      background: var(--vscode-error-bg, #5a1d1d);
      color: var(--vscode-error-fg, #f48771);
      border: 1px solid var(--vscode-error-fg, #f48771);
    }

    .btn-warning:hover {
      background: var(--vscode-error-hover-bg, #6b2222);
    }

    .result-section {
      margin-top: 32px;
      padding: 16px;
      background: var(--vscode-bg-primary, #252526);
      border: 1px solid var(--vscode-border-primary, #3c3c3c);
      border-radius: 4px;
    }

    .result-section h3 {
      margin: 0 0 16px 0;
      color: var(--vscode-text-primary, #cccccc);
    }

    .result-section pre {
      background: var(--vscode-bg-secondary, #1e1e1e);
      padding: 12px;
      border-radius: 4px;
      color: var(--vscode-text-primary, #cccccc);
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 11px;
      white-space: pre-wrap;
      overflow: auto;
      max-height: 300px;
    }
  `]
})
export class ModalDemoComponent {
  private readonly modalService = inject(ModalService);
  private readonly resourceModalService = inject(StandardizedResourceModalService);

  protected lastResult = signal<any>(null);

  async openSimpleModal(): Promise<void> {
    try {
      const result = await this.modalService.open({
        id: 'simple-modal',
        title: 'Simple Modal',
        size: 'sm',
        closeOnBackdrop: true,
        closeOnEscape: true
      });
      
      this.lastResult.set({ type: 'simple', result });
    } catch (error) {
      this.lastResult.set({ type: 'simple', error: 'User cancelled' });
    }
  }

  async openConfirmModal(): Promise<void> {
    try {
      const result = await this.modalService.open({
        id: 'confirm-modal',
        title: 'Confirm Action',
        size: 'sm',
        closeOnBackdrop: false,
        closeOnEscape: true
      });
      
      this.lastResult.set({ type: 'confirm', result });
    } catch (error) {
      this.lastResult.set({ type: 'confirm', error: 'User cancelled' });
    }
  }

  async openLargeModal(): Promise<void> {
    try {
      const result = await this.modalService.open({
        id: 'large-modal',
        title: 'Large Modal',
        size: 'xl',
        closeOnBackdrop: true,
        closeOnEscape: true
      });
      
      this.lastResult.set({ type: 'large', result });
    } catch (error) {
      this.lastResult.set({ type: 'large', error: 'User cancelled' });
    }
  }

  async createPatient(): Promise<void> {
    try {
      const result = await this.resourceModalService.openCreateModal('Patient');
      this.lastResult.set({ type: 'create-patient', result });
    } catch (error) {
      this.lastResult.set({ type: 'create-patient', error: 'User cancelled' });
    }
  }

  async createObservation(): Promise<void> {
    try {
      const result = await this.resourceModalService.openCreateModal('Observation');
      this.lastResult.set({ type: 'create-observation', result });
    } catch (error) {
      this.lastResult.set({ type: 'create-observation', error: 'User cancelled' });
    }
  }

  async viewSampleResource(): Promise<void> {
    const samplePatient: FhirResource = {
      resourceType: 'Patient',
      id: 'sample-patient',
      identifier: [{
        system: 'http://example.org/patient-ids',
        value: 'DEMO-001'
      }],
      active: true,
      name: [{
        family: 'Doe',
        given: ['John']
      }],
      gender: 'male',
      birthDate: '1980-01-01',
      telecom: [{
        system: 'phone',
        value: '+1234567890',
        use: 'home'
      }, {
        system: 'email',
        value: 'john.doe@example.com',
        use: 'home'
      }]
    };

    try {
      await this.resourceModalService.openViewModal(samplePatient);
      this.lastResult.set({ type: 'view-resource', result: 'Modal closed' });
    } catch (error) {
      this.lastResult.set({ type: 'view-resource', error: 'User cancelled' });
    }
  }

  closeAllModals(): void {
    this.modalService.closeAll();
    this.lastResult.set({ type: 'close-all', result: 'All modals closed' });
  }

  onResourceCreated(resource: FhirResource): void {
    this.lastResult.set({ 
      type: 'resource-created', 
      result: { 
        resourceType: resource.resourceType, 
        id: resource.id 
      } 
    });
  }

  onResourceUpdated(resource: FhirResource): void {
    this.lastResult.set({ 
      type: 'resource-updated', 
      result: { 
        resourceType: resource.resourceType, 
        id: resource.id 
      } 
    });
  }

  onEditRequested(resource: FhirResource): void {
    this.lastResult.set({ 
      type: 'edit-requested', 
      result: { 
        resourceType: resource.resourceType, 
        id: resource.id 
      } 
    });
  }
}