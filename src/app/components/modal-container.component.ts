import { Component, ViewContainerRef, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../services/modal.service';
import { ModalComponent } from './modal.component';

@Component({
  selector: 'app-modal-container',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  template: `
    <!-- Render all open modals -->
    @for (modal of openModals(); track modal.id) {
      <app-modal 
        [modalId]="modal.id"
        [config]="modal.config"
        [isVisible]="modal.isOpen"
        (modalClosed)="onModalClosed(modal.id, $event)"
      >
        <!-- Dynamic component content will be inserted here -->
      </app-modal>
    }
  `
})
export class ModalContainerComponent implements OnInit {
  private readonly modalService = inject(ModalService);
  private readonly viewContainerRef = inject(ViewContainerRef);

  // Computed property to get all open modals
  readonly openModals = computed(() => {
    const modalsMap = this.modalService['modals']();
    return Array.from(modalsMap.values()).filter(modal => modal.isOpen);
  });

  ngOnInit(): void {
    // Register the view container ref with the modal service
    this.modalService.setViewContainerRef(this.viewContainerRef, this.viewContainerRef.injector);
  }

  onModalClosed(modalId: string, result?: any): void {
    this.modalService.close(modalId, result);
  }
}