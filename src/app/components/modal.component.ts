import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService, ModalConfig } from '../services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="modal-overlay" 
      [class.show]="isVisible"
      [class]="getOverlayClasses()"
      (click)="onBackdropClick($event)"
      (keydown.escape)="onEscapeKey($event)"
      #modalOverlay
    >
      <div 
        class="modal-content"
        [class]="getContentClasses()"
        (click)="$event.stopPropagation()"
        tabindex="-1"
        #modalContent
      >
        <!-- Header -->
        <div class="modal-header" *ngIf="showHeader">
          <div class="modal-title">
            <ng-content select="[slot=title]"></ng-content>
            <h2 *ngIf="config && config.title && !hasCustomTitle">{{ config.title }}</h2>
          </div>
          <button 
            *ngIf="config?.showCloseButton"
            type="button"
            class="modal-close"
            (click)="close()"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <ng-content></ng-content>
        </div>

        <!-- Footer -->
        <div class="modal-footer" *ngIf="hasFooter">
          <ng-content select="[slot=footer]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styleUrl: './modal.component.scss'
})
export class ModalComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() modalId!: string;
  @Input() config?: ModalConfig;
  @Input() isVisible = false;
  @Input() showHeader = true;
  @Input() hasFooter = false;
  @Input() hasCustomTitle = false;

  @Output() modalClosed = new EventEmitter<any>();
  @Output() backdropClicked = new EventEmitter<void>();

  @ViewChild('modalOverlay') modalOverlay!: ElementRef;
  @ViewChild('modalContent') modalContent!: ElementRef;

  private readonly modalService = inject(ModalService);

  ngOnInit(): void {
    // Set default config if not provided
    if (!this.config && this.modalId) {
      const modal = this.modalService.getModal(this.modalId);
      this.config = modal?.config;
    }
  }

  ngAfterViewInit(): void {
    // Focus the modal content for accessibility
    if (this.isVisible && this.modalContent) {
      setTimeout(() => {
        this.modalContent.nativeElement.focus();
      }, 100);
    }
  }

  ngOnDestroy(): void {
    // Ensure modal is closed when component is destroyed
    if (this.modalId && this.modalService.isOpen(this.modalId)) {
      this.modalService.close(this.modalId);
    }
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isVisible) {
      this.onEscapeKey(event);
    }
  }

  onBackdropClick(event: Event): void {
    if (event.target === this.modalOverlay.nativeElement) {
      this.backdropClicked.emit();
      if (this.config?.closeOnBackdrop && this.modalId) {
        this.modalService.onBackdropClick(this.modalId);
      }
    }
  }

  onEscapeKey(event: Event): void {
    event.preventDefault();
    if (this.config?.closeOnEscape && this.modalId) {
      this.modalService.onEscapeKey(this.modalId);
    }
  }

  close(result?: any): void {
    this.modalClosed.emit(result);
    if (this.modalId) {
      this.modalService.close(this.modalId, result);
    }
  }

  getOverlayClasses(): string {
    const classes = ['modal-overlay'];
    if (this.config?.cssClass) {
      classes.push(this.config.cssClass);
    }
    return classes.join(' ');
  }

  getContentClasses(): string {
    const classes = ['modal-content'];
    
    if (this.config?.size) {
      classes.push(`modal-${this.config.size}`);
    }
    
    return classes.join(' ');
  }
}