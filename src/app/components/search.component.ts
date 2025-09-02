import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FhirService, FhirResource, FhirBundle, FhirSearchParams } from '../services/fhir.service';
import { ResourceViewerComponent } from './resource-viewer.component';

@Component({
  selector: 'app-search',
  imports: [CommonModule, ReactiveFormsModule, ResourceViewerComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent {
  private readonly fb = inject(FormBuilder);
  protected readonly fhirService = inject(FhirService);

  // Signals for reactive state
  protected readonly searchResults = signal<FhirBundle | null>(null);
  protected readonly selectedResource = signal<FhirResource | null>(null);
  protected readonly isSearching = signal<boolean>(false);
  protected readonly isLoadingReferences = signal<boolean>(false);
  protected readonly referencedResources = signal<FhirResource[]>([]);

  // Form controls
  protected readonly searchForm: FormGroup;

  // Resource types available for search
  protected readonly resourceTypes = signal<string[]>([
    'Patient', 'Practitioner', 'Organization', 'Location',
    'Observation', 'Condition', 'Procedure', 'MedicationStatement',
    'Encounter', 'DiagnosticReport', 'Immunization', 'AllergyIntolerance',
    'Coverage'
  ]);

  // Available search fields based on selected resource type
  protected readonly availableSearchFields = computed(() => {
    const resourceType = this.searchForm?.get('resourceType')?.value;
    
    const commonFields = [
      { value: '_id', label: 'ID' },
      { value: '_lastUpdated', label: 'Last Updated' }
    ];

    const specificFields: Record<string, Array<{value: string, label: string}>> = {
      'Patient': [
        { value: 'name', label: 'Name' },
        { value: 'identifier', label: 'Identifier' },
        { value: 'birthdate', label: 'Birth Date' },
        { value: 'gender', label: 'Gender' }
      ],
      'Practitioner': [
        { value: 'name', label: 'Name' },
        { value: 'identifier', label: 'Identifier' }
      ],
      'Observation': [
        { value: 'code', label: 'Code' },
        { value: 'patient', label: 'Patient' },
        { value: 'date', label: 'Date' }
      ],
      'Condition': [
        { value: 'code', label: 'Code' },
        { value: 'patient', label: 'Patient' },
        { value: 'onset-date', label: 'Onset Date' }
      ],
      'Coverage': [
        { value: 'beneficiary', label: 'Beneficiary (Patient)' },
        { value: 'payor', label: 'Payor (Insurance Company)' },
        { value: 'subscriber', label: 'Subscriber' },
        { value: 'status', label: 'Status' },
        { value: 'type', label: 'Coverage Type' }
      ]
    };

    return [...commonFields, ...(specificFields[resourceType] || [])];
  });

  constructor() {
    this.searchForm = this.fb.group({
      resourceType: ['Patient', Validators.required],
      searchField: ['name'],
      searchTerm: [''],
      count: [20]
    });

    // Update search field when resource type changes
    this.searchForm.get('resourceType')?.valueChanges.subscribe(() => {
      this.searchForm.patchValue({ searchField: this.availableSearchFields()[0]?.value });
    });
  }

  protected async onSearch(): Promise<void> {
    if (this.searchForm.invalid) return;

    const formValue = this.searchForm.value;
    const searchParams: FhirSearchParams = {
      resourceType: formValue.resourceType,
      searchField: formValue.searchField,
      searchTerm: formValue.searchTerm,
      count: formValue.count
    };

    const results = await this.fhirService.searchResources(searchParams);
    this.searchResults.set(results);
  }

  protected clearSearch(): void {
    this.searchForm.reset({
      resourceType: 'Patient',
      searchField: 'name',
      searchTerm: '',
      count: 20
    });
    this.searchResults.set(null);
    this.selectedResource.set(null);
  }

  protected async followLink(url: string): Promise<void> {
    if (!url) return;
    
    const results = await this.fhirService.followUrl(url);
    if (results) {
      this.searchResults.set(results);
    }
  }

  protected selectResource(resource: FhirResource): void {
    this.selectedResource.set(resource);
  }

  protected viewResource(resource: FhirResource): void {
    this.selectedResource.set(resource);
  }

  protected closeModal(): void {
    this.selectedResource.set(null);
    this.referencedResources.set([]);
    this.isLoadingReferences.set(false);
  }

  protected async showReferences(resource: FhirResource): Promise<void> {
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
      this.selectedResource.set(resource); // Show modal with references
    } catch (error) {
      console.error('Error loading references:', error);
    } finally {
      this.isLoadingReferences.set(false);
    }
  }

  private extractReferences(resource: FhirResource): string[] {
    const references: string[] = [];
    
    const findReferences = (obj: any): void => {
      if (typeof obj === 'object' && obj !== null) {
        if (obj.reference && typeof obj.reference === 'string') {
          references.push(obj.reference);
        }
        Object.values(obj).forEach(value => {
          if (Array.isArray(value)) {
            value.forEach(item => findReferences(item));
          } else if (typeof value === 'object') {
            findReferences(value);
          }
        });
      }
    };
    
    findReferences(resource);
    return references;
  }

  protected getResourceTitle(resource: FhirResource): string {
    switch (resource.resourceType) {
      case 'Patient':
        return this.getPatientName(resource);
      case 'Practitioner':
        return this.getPractitionerName(resource);
      case 'Observation':
        return resource['code']?.text || resource['code']?.coding?.[0]?.display || 'Observation';
      case 'Condition':
        return resource['code']?.text || resource['code']?.coding?.[0]?.display || 'Condition';
      case 'Coverage':
        return this.getCoverageTitle(resource);
      default:
        return resource.resourceType + (resource.id ? ` #${resource.id}` : '');
    }
  }

  protected getResourceDescription(resource: FhirResource): string {
    switch (resource.resourceType) {
      case 'Patient':
        const gender = resource['gender'] ? `Gender: ${resource['gender']}` : '';
        const birthDate = resource['birthDate'] ? `Birth: ${resource['birthDate']}` : '';
        return [gender, birthDate].filter(Boolean).join(' • ');
      case 'Observation':
        return resource['valueString'] || resource['valueQuantity']?.value?.toString() || 'No value';
      case 'Condition':
        return resource['clinicalStatus']?.coding?.[0]?.display || 'Unknown status';
      case 'Coverage':
        return this.getCoverageDescription(resource);
      default:
        return `${resource.resourceType} resource`;
    }
  }

  protected formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  protected hasReferences(resource: FhirResource): boolean {
    return this.countReferences(resource) > 0;
  }

  protected getLastUpdated(resource: FhirResource): string | null {
    return resource?.meta?.lastUpdated || null;
  }

  protected countReferences(resource: FhirResource): number {
    // Count reference fields in the resource
    let count = 0;
    const checkForReferences = (obj: any): void => {
      if (typeof obj === 'object' && obj !== null) {
        if (obj.reference && typeof obj.reference === 'string') {
          count++;
        }
        Object.values(obj).forEach(value => {
          if (Array.isArray(value)) {
            value.forEach(item => checkForReferences(item));
          } else if (typeof value === 'object') {
            checkForReferences(value);
          }
        });
      }
    };
    checkForReferences(resource);
    return count;
  }

  protected getPaginationLabel(relation: string): string {
    switch (relation) {
      case 'first': return '⏮️ First';
      case 'previous': return '⬅️ Previous';
      case 'next': return '➡️ Next';
      case 'last': return '⏭️ Last';
      case 'self': return '📍 Current';
      default: return relation;
    }
  }

  protected getCurrentPageInfo(): string {
    const results = this.searchResults();
    if (!results || !results.entry) return '';
    
    const total = results.total || 0;
    const currentCount = results.entry.length;
    
    if (total === 0) return 'No results';
    if (total <= currentCount) return `Showing all ${total} results`;
    
    return `Showing ${currentCount} of ${total} results`;
  }

  private getPatientName(patient: any): string {
    if (!patient.name || !Array.isArray(patient.name) || patient.name.length === 0) {
      return 'Unknown Patient';
    }
    
    const name = patient.name[0];
    const given = Array.isArray(name.given) ? name.given.join(' ') : name.given || '';
    const family = name.family || '';
    
    return [given, family].filter(Boolean).join(' ') || 'Unknown Patient';
  }

  private getPractitionerName(practitioner: any): string {
    if (!practitioner.name || !Array.isArray(practitioner.name) || practitioner.name.length === 0) {
      return 'Unknown Practitioner';
    }
    
    const name = practitioner.name[0];
    const given = Array.isArray(name.given) ? name.given.join(' ') : name.given || '';
    const family = name.family || '';
    const prefix = Array.isArray(name.prefix) ? name.prefix.join(' ') : name.prefix || '';
    
    return [prefix, given, family].filter(Boolean).join(' ') || 'Unknown Practitioner';
  }

  private getCoverageTitle(coverage: any): string {
    // Try to get a meaningful title for coverage
    if (coverage.type?.text) {
      return coverage.type.text;
    }
    
    if (coverage.type?.coding?.[0]?.display) {
      return coverage.type.coding[0].display;
    }
    
    if (coverage.payor?.[0]?.display) {
      return `Coverage by ${coverage.payor[0].display}`;
    }
    
    return `Coverage #${coverage.id || 'Unknown'}`;
  }

  private getCoverageDescription(coverage: any): string {
    const parts = [];
    
    if (coverage.status) {
      parts.push(`Status: ${coverage.status}`);
    }
    
    if (coverage.beneficiary?.display) {
      parts.push(`Beneficiary: ${coverage.beneficiary.display}`);
    }
    
    if (coverage.period?.start) {
      parts.push(`Start: ${this.formatDate(coverage.period.start)}`);
    }
    
    return parts.join(' • ') || 'Coverage details';
  }
}