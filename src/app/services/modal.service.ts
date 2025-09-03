import { Injectable, signal, computed, Type, ComponentRef, ViewContainerRef, Injector } from '@angular/core';

export interface ModalConfig {
  id: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  title?: string;
  cssClass?: string;
  data?: any;
}

export interface ModalInstance {
  id: string;
  config: ModalConfig;
  componentRef?: ComponentRef<any>;
  isOpen: boolean;
  resolve?: (value?: any) => void;
  reject?: (reason?: any) => void;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private readonly modals = signal<Map<string, ModalInstance>>(new Map());
  private readonly activeModalId = signal<string | null>(null);
  private originalBodyOverflow: string = '';
  private originalBodyPaddingRight: string = '';
  private viewContainerRef?: ViewContainerRef;
  private injector?: Injector;

  // Public computed properties
  readonly hasOpenModals = computed(() => this.modals().size > 0);
  readonly activeModal = computed(() => {
    const activeId = this.activeModalId();
    return activeId ? this.modals().get(activeId) : null;
  });

  /**
   * Set the view container ref for dynamic component creation
   */
  setViewContainerRef(viewContainerRef: ViewContainerRef, injector: Injector): void {
    this.viewContainerRef = viewContainerRef;
    this.injector = injector;
  }

  /**
   * Open a modal with content
   */
  open<T = any>(config: ModalConfig): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      // Close existing modal with same ID if it exists
      if (this.modals().has(config.id)) {
        this.close(config.id);
      }

      const modalInstance: ModalInstance = {
        id: config.id,
        config: {
          size: 'md',
          closeOnBackdrop: true,
          closeOnEscape: true,
          showCloseButton: true,
          ...config
        },
        isOpen: true,
        resolve,
        reject
      };

      // Update modals map
      this.modals.update(modals => {
        const newModals = new Map(modals);
        newModals.set(config.id, modalInstance);
        return newModals;
      });

      // Set as active modal
      this.activeModalId.set(config.id);

      // Lock body scroll if this is the first modal
      if (this.modals().size === 1) {
        this.lockBodyScroll();
      }
    });
  }

  /**
   * Open a modal with a dynamic component
   */
  openComponent<T = any, C = any>(
    component: Type<C>, 
    config: ModalConfig
  ): Promise<T> {
    if (!this.viewContainerRef || !this.injector) {
      throw new Error('ViewContainerRef and Injector must be set before opening component modals');
    }

    return new Promise<T>((resolve, reject) => {
      // Close existing modal with same ID if it exists
      if (this.modals().has(config.id)) {
        this.close(config.id);
      }

      // Create component
      const componentRef = this.viewContainerRef!.createComponent(component, { injector: this.injector });

      // Pass data to component if it has a data property
      if (config.data && componentRef.instance && typeof componentRef.instance === 'object' && 'data' in componentRef.instance) {
        (componentRef.instance as any).data = config.data;
      }

      const modalInstance: ModalInstance = {
        id: config.id,
        config: {
          size: 'md',
          closeOnBackdrop: true,
          closeOnEscape: true,
          showCloseButton: true,
          ...config
        },
        componentRef,
        isOpen: true,
        resolve,
        reject
      };

      // Update modals map
      this.modals.update(modals => {
        const newModals = new Map(modals);
        newModals.set(config.id, modalInstance);
        return newModals;
      });

      // Set as active modal
      this.activeModalId.set(config.id);

      // Lock body scroll if this is the first modal
      if (this.modals().size === 1) {
        this.lockBodyScroll();
      }
    });
  }

  /**
   * Close a modal by ID
   */
  close(modalId: string, result?: any): void {
    const modal = this.modals().get(modalId);
    if (!modal) return;

    // Destroy component if it exists
    if (modal.componentRef) {
      modal.componentRef.destroy();
    }

    // Resolve the promise
    if (modal.resolve) {
      modal.resolve(result);
    }

    // Remove from modals map
    this.modals.update(modals => {
      const newModals = new Map(modals);
      newModals.delete(modalId);
      return newModals;
    });

    // Update active modal
    if (this.activeModalId() === modalId) {
      const remainingModals = Array.from(this.modals().keys());
      this.activeModalId.set(remainingModals.length > 0 ? remainingModals[remainingModals.length - 1] : null);
    }

    // Unlock body scroll if no modals are open
    if (this.modals().size === 0) {
      this.unlockBodyScroll();
    }
  }

  /**
   * Close all modals
   */
  closeAll(): void {
    const modalIds = Array.from(this.modals().keys());
    modalIds.forEach(id => this.close(id));
  }

  /**
   * Check if a specific modal is open
   */
  isOpen(modalId: string): boolean {
    return this.modals().has(modalId);
  }

  /**
   * Get modal instance by ID
   */
  getModal(modalId: string): ModalInstance | undefined {
    return this.modals().get(modalId);
  }

  /**
   * Handle backdrop click
   */
  onBackdropClick(modalId: string): void {
    const modal = this.modals().get(modalId);
    if (modal?.config.closeOnBackdrop) {
      this.close(modalId);
    }
  }

  /**
   * Handle escape key
   */
  onEscapeKey(modalId: string): void {
    const modal = this.modals().get(modalId);
    if (modal?.config.closeOnEscape) {
      this.close(modalId);
    }
  }

  /**
   * Lock body scroll
   */
  private lockBodyScroll(): void {
    if (typeof document === 'undefined') return;
    
    const body = document.body;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    // Store original values
    this.originalBodyOverflow = body.style.overflow;
    this.originalBodyPaddingRight = body.style.paddingRight;
    
    // Apply scroll lock
    body.style.overflow = 'hidden';
    if (scrollBarWidth > 0) {
      body.style.paddingRight = `${scrollBarWidth}px`;
    }
  }

  /**
   * Unlock body scroll
   */
  private unlockBodyScroll(): void {
    if (typeof document === 'undefined') return;
    
    const body = document.body;
    
    // Restore original values
    body.style.overflow = this.originalBodyOverflow;
    body.style.paddingRight = this.originalBodyPaddingRight;
  }
}