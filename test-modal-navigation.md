# Modal Navigation Test Plan

## Test Cases for Modal Dialog Closing on Navigation

### 1. ResourceFormModal (Create/Edit Modal)
**Test Steps:**
1. Navigate to the Create page (/create)
2. Click on any resource type to open the create modal
3. Navigate to another page (e.g., Dashboard, Search, Config) using the navigation menu
4. **Expected Result:** Modal should close automatically

### 2. Search Component Modal (Resource Details)
**Test Steps:**
1. Navigate to the Search page (/search)
2. Search for resources (e.g., search for "Patient")
3. Click on a resource to open the details modal
4. Navigate to another page using the navigation menu
5. **Expected Result:** Modal should close automatically

### 3. Verification
**Manual Testing:**
1. Open the application at http://localhost:4200
2. Test each modal type as described above
3. Verify that modals close when navigation occurs
4. Verify that modal state is properly cleaned up

## Implementation Details

### Changes Made:

1. **Main App Component (`app.ts`)**
   - Added import for `ResourceModalService`
   - Injected `ResourceModalService` as `modalService`
   - Modified the router navigation subscription to close ResourceModalService modals

2. **Search Component (`search.component.ts`)**
   - Added imports for `Router`, `NavigationEnd`, and `filter`
   - Injected `Router` service
   - Added router navigation subscription to close the search component's own modal (`selectedResource`)

### Code Changes:

```typescript
// In app.ts - Navigation subscription
this.router.events
  .pipe(filter(event => event instanceof NavigationEnd))
  .subscribe((event: NavigationEnd) => {
    this.currentRoute.set(event.url);
    this.isMobileMenuOpen.set(false); // Close mobile menu on navigation
    
    // Close modal dialogs on navigation
    if (this.modalService.isOpen()) {
      this.modalService.closeModal();
    }
  });

// In search.component.ts - Navigation subscription
this.router.events
  .pipe(filter(event => event instanceof NavigationEnd))
  .subscribe(() => {
    if (this.selectedResource()) {
      this.closeModal();
    }
  });
```

## Coverage

This solution covers:
- ✅ ResourceFormModal (used in Create and Search components)
- ✅ Search component's resource details modal
- ✅ Proper cleanup of modal state
- ✅ Follows existing patterns in the codebase