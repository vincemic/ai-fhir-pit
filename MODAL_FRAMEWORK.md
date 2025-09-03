# Standardized Modal Dialog Framework

## Overview

This document outlines the standardized modal dialog framework implemented across the FHIR-PIT application. The framework provides consistent behavior, styling, and functionality for all modal dialogs.

## Architecture

### Core Components

1. **ModalService** (`modal.service.ts`)
   - Central service for managing modal state
   - Handles multiple concurrent modals
   - Provides promise-based API for modal results
   - Manages body scroll locking
   - Supports dynamic component rendering

2. **ModalComponent** (`modal.component.ts`)
   - Base modal component with consistent styling
   - Handles keyboard navigation (ESC key)
   - Provides backdrop click handling
   - Supports different sizes and configurations
   - Includes accessibility features

3. **ModalContainerComponent** (`modal-container.component.ts`)
   - Hosts dynamic modal components
   - Renders all open modals
   - Manages component lifecycle

### Specialized Components

4. **StandardizedResourceModalService** (`standardized-resource-modal.service.ts`)
   - High-level service for resource-specific modals
   - Provides typed methods for create/edit/view operations
   - Handles form data extraction and mapping

5. **StandardizedResourceFormModalComponent** (`standardized-resource-form-modal.component.ts`)
   - Modal for creating and editing FHIR resources
   - Supports different resource types
   - Includes form validation and preview functionality

6. **StandardizedResourceViewModalComponent** (`standardized-resource-view-modal.component.ts`)
   - Modal for viewing FHIR resources
   - Displays resource details and referenced resources
   - Includes edit functionality

## Usage

### Basic Modal Usage

```typescript
import { ModalService } from './services/modal.service';

constructor(private modalService: ModalService) {}

// Open a simple modal
async openModal() {
  const result = await this.modalService.open({
    id: 'my-modal',
    title: 'Confirmation',
    size: 'sm',
    closeOnBackdrop: true,
    closeOnEscape: true
  });
  
  console.log('Modal result:', result);
}

// Close a modal
closeModal() {
  this.modalService.close('my-modal', 'confirmed');
}
```

### Component Modal Usage

```typescript
import { ModalService } from './services/modal.service';
import { MyComponent } from './my.component';

// Open a modal with a dynamic component
async openComponentModal() {
  const result = await this.modalService.openComponent(MyComponent, {
    id: 'component-modal',
    title: 'Dynamic Component',
    size: 'lg',
    data: { /* data passed to component */ }
  });
}
```

### Resource Modal Usage

```typescript
import { StandardizedResourceModalService } from './services/standardized-resource-modal.service';

constructor(private resourceModalService: StandardizedResourceModalService) {}

// Create a new resource
async createResource() {
  const result = await this.resourceModalService.openCreateModal('Patient');
  if (result) {
    console.log('Created resource:', result);
  }
}

// Edit an existing resource
async editResource(resource: FhirResource) {
  const result = await this.resourceModalService.openEditModal(resource);
  if (result) {
    console.log('Updated resource:', result);
  }
}

// View a resource
async viewResource(resource: FhirResource) {
  await this.resourceModalService.openViewModal(resource);
}
```

## Configuration Options

### ModalConfig Interface

```typescript
interface ModalConfig {
  id: string;                    // Unique identifier for the modal
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';  // Modal size
  closeOnBackdrop?: boolean;     // Close when clicking backdrop
  closeOnEscape?: boolean;       // Close when pressing ESC key
  showCloseButton?: boolean;     // Show X button in header
  title?: string;                // Modal title
  cssClass?: string;             // Additional CSS classes
  data?: any;                    // Data passed to modal component
}
```

### Size Options

- **sm**: 400px width
- **md**: 600px width (default)
- **lg**: 800px width
- **xl**: 1200px width
- **full**: 95% viewport dimensions

## Styling

### CSS Variables

The modal framework uses CSS custom properties for theming:

```scss
--vscode-bg-primary: Primary background color
--vscode-bg-secondary: Secondary background color
--vscode-border-primary: Border color
--vscode-text-primary: Primary text color
--vscode-text-secondary: Secondary text color
--vscode-button-primary-bg: Primary button background
--vscode-accent-primary: Accent color
```

### Custom Styling

Add custom CSS classes via the `cssClass` configuration option:

```typescript
const config = {
  id: 'my-modal',
  cssClass: 'my-custom-modal',
  // ... other options
};
```

## Accessibility Features

- **Keyboard Navigation**: ESC key closes modal, TAB navigation works correctly
- **Focus Management**: Modal content receives focus when opened
- **Screen Reader Support**: Proper ARIA labels and roles
- **High Contrast Support**: Respects user's high contrast preferences
- **Reduced Motion Support**: Honors user's motion reduction preferences

## Migration from Legacy Modal System

### Before (Legacy ResourceModalService)

```typescript
// Old way
this.modalService.openCreateModal('Patient');
this.modalService.openEditModal(resource);
this.modalService.closeModal();
```

### After (Standardized System)

```typescript
// New way
this.resourceModalService.openCreateModal('Patient');
this.resourceModalService.openEditModal(resource);
this.resourceModalService.closeModal();
```

### Component Updates Required

1. **Update Imports**: Replace `ResourceModalService` with `StandardizedResourceModalService`
2. **Update Templates**: Replace old modal components with new standardized ones
3. **Update Styling**: Remove custom modal CSS in favor of standardized framework

## Best Practices

### 1. Modal IDs
- Use descriptive, unique IDs for each modal type
- Consider using constants for commonly used modal IDs

### 2. Data Passing
- Use the `data` property to pass information to modal components
- Avoid tight coupling between parent and modal components

### 3. Error Handling
- Always handle promise rejections from modal operations
- Provide user feedback for failed operations

### 4. Performance
- Close modals when no longer needed
- Avoid opening multiple modals simultaneously unless necessary

### 5. User Experience
- Use appropriate modal sizes for content
- Provide clear action buttons
- Include loading states for async operations

## Examples

### Simple Confirmation Modal

```typescript
async confirmAction() {
  try {
    const confirmed = await this.modalService.open({
      id: 'confirm-delete',
      title: 'Confirm Deletion',
      size: 'sm',
      closeOnBackdrop: false
    });
    
    if (confirmed) {
      // Perform deletion
    }
  } catch (error) {
    // User cancelled or modal error
  }
}
```

### Resource Form Modal

```typescript
async createPatient() {
  try {
    const patient = await this.resourceModalService.openCreateModal('Patient');
    if (patient) {
      // Handle created patient
      this.refreshPatientList();
    }
  } catch (error) {
    console.error('Failed to create patient:', error);
  }
}
```

## Troubleshooting

### Common Issues

1. **Modal not appearing**: Check that `ModalContainerComponent` is included in app template
2. **Styling issues**: Verify CSS custom properties are defined
3. **Navigation not closing modals**: Ensure navigation subscription is properly configured
4. **TypeScript errors**: Check that all modal-related services are properly imported

### Debug Mode

Enable debug logging by setting localStorage:

```javascript
localStorage.setItem('modal-debug', 'true');
```

This will log modal operations to the browser console.

## Future Enhancements

- **Animation Customization**: Support for custom enter/exit animations
- **Modal Stacking**: Better visual hierarchy for multiple open modals
- **Drag and Drop**: Allow modals to be repositioned
- **Responsive Design**: Enhanced mobile experience
- **Theming**: Additional built-in themes