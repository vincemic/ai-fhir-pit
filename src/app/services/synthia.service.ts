import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FhirService, FhirResource, FhirBundle } from './fhir.service';

export interface SynthiaConfig {
  apiUrl: string;
  apiKey?: string;
  patientCount: number;
  includeRelatedResources: boolean;
  resourceTypes: string[];
  seed?: string; // For reproducible data
}

export interface SynthiaGenerationRequest {
  patientCount: number;
  resourceTypes: string[];
  includeRelatedResources: boolean;
  seed?: string;
  locale?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface SynthiaGenerationResult {
  success: boolean;
  generatedCount: number;
  resources: FhirResource[];
  errors?: string[];
  generationTime: number;
}

@Injectable({
  providedIn: 'root'
})
export class SynthiaService {
  private readonly http = inject(HttpClient);
  private readonly fhirService = inject(FhirService);
  
  // Default SYNTHIA configuration
  private readonly defaultConfig: SynthiaConfig = {
    apiUrl: 'https://synthea.mitre.org/api', // Or your SYNTHIA endpoint
    patientCount: 10,
    includeRelatedResources: true,
    resourceTypes: [
      'Patient', 'Practitioner', 'Organization', 'Location',
      'Observation', 'Condition', 'Procedure', 'MedicationStatement',
      'Encounter', 'DiagnosticReport', 'Immunization', 'AllergyIntolerance'
    ]
  };

  // Reactive state management
  readonly config = signal<SynthiaConfig>(this.loadConfigFromStorage());
  readonly isGenerating = signal<boolean>(false);
  readonly lastGenerationResult = signal<SynthiaGenerationResult | null>(null);
  readonly generationProgress = signal<number>(0);

  /**
   * Generate synthetic FHIR data using SYNTHIA
   */
  async generateSyntheticData(request: SynthiaGenerationRequest): Promise<SynthiaGenerationResult> {
    this.isGenerating.set(true);
    this.generationProgress.set(0);
    
    const startTime = Date.now();
    const result: SynthiaGenerationResult = {
      success: false,
      generatedCount: 0,
      resources: [],
      generationTime: 0
    };

    try {
      // Option 1: Direct SYNTHIA API call (if available)
      const syntheticData = await this.callSynthiaAPI(request);
      
      // Option 2: Use local Synthea generation (alternative approach)
      // const syntheticData = await this.generateLocalSynthea(request);
      
      this.generationProgress.set(50);
      
      // Upload generated resources to connected FHIR server
      const uploadResults = await this.uploadToFhirServer(syntheticData);
      
      result.success = uploadResults.success;
      result.generatedCount = uploadResults.count;
      result.resources = uploadResults.resources;
      result.errors = uploadResults.errors;
      result.generationTime = Date.now() - startTime;
      
      this.generationProgress.set(100);
      this.lastGenerationResult.set(result);
      
      return result;
    } catch (error) {
      result.errors = [error instanceof Error ? error.message : 'Unknown error occurred'];
      result.generationTime = Date.now() - startTime;
      this.lastGenerationResult.set(result);
      return result;
    } finally {
      this.isGenerating.set(false);
    }
  }

  /**
   * Call SYNTHIA API to generate data
   */
  private async callSynthiaAPI(request: SynthiaGenerationRequest): Promise<FhirResource[]> {
    // This would integrate with actual SYNTHIA API
    // For now, we'll simulate the generation process
    
    const resources: FhirResource[] = [];
    
    // Generate patients first
    for (let i = 0; i < request.patientCount; i++) {
      const patient = this.generateSamplePatient(i + 1, request.seed);
      resources.push(patient);
      
      if (request.includeRelatedResources) {
        // Generate related resources for each patient
        const relatedResources = this.generateRelatedResources(patient, request.resourceTypes);
        resources.push(...relatedResources);
      }
    }
    
    return resources;
  }

  /**
   * Upload generated resources to FHIR server in batches
   */
  private async uploadToFhirServer(resources: FhirResource[]): Promise<{
    success: boolean;
    count: number;
    resources: FhirResource[];
    errors: string[];
  }> {
    const batchSize = 20; // Process in batches to avoid overwhelming the server
    const uploadedResources: FhirResource[] = [];
    const errors: string[] = [];
    let totalUploaded = 0;

    for (let i = 0; i < resources.length; i += batchSize) {
      const batch = resources.slice(i, i + batchSize);
      
      try {
        // Create bundle for batch upload
        const bundle = this.createBundle(batch);
        const result = await this.uploadBundle(bundle);
        
        if (result) {
          uploadedResources.push(...batch);
          totalUploaded += batch.length;
        }
        
        // Update progress
        const progress = 50 + ((i + batch.length) / resources.length) * 50;
        this.generationProgress.set(Math.min(progress, 100));
        
      } catch (error) {
        const errorMsg = `Batch ${Math.floor(i/batchSize) + 1} failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
      }
    }

    return {
      success: errors.length === 0,
      count: totalUploaded,
      resources: uploadedResources,
      errors
    };
  }

  /**
   * Create FHIR Bundle for batch operations
   */
  private createBundle(resources: FhirResource[]): any {
    return {
      resourceType: 'Bundle',
      type: 'batch',
      entry: resources.map(resource => ({
        resource,
        fullUrl: `urn:uuid:${this.generateUuid()}`,
        request: {
          method: 'POST',
          url: resource.resourceType
        }
      }))
    };
  }

  /**
   * Upload bundle to FHIR server
   */
  private async uploadBundle(bundle: any): Promise<any> {
    try {
      const response = await this.http.post<any>(
        this.fhirService.config().serverUrl,
        bundle,
        {
          headers: {
            'Accept': 'application/fhir+json',
            'Content-Type': 'application/fhir+json'
          }
        }
      ).toPromise();
      
      return response || null;
    } catch (error) {
      console.error('Bundle upload failed:', error);
      throw error;
    }
  }

  /**
   * Generate a sample patient (placeholder for actual SYNTHIA integration)
   */
  private generateSamplePatient(index: number, seed?: string): FhirResource {
    const names = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa'];
    const surnames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
    
    const firstName = names[index % names.length];
    const lastName = surnames[index % surnames.length];
    
    return {
      resourceType: 'Patient',
      identifier: [{
        system: 'http://synthia.example.com/patient-id',
        value: `SYNTH-${String(index).padStart(6, '0')}`
      }],
      active: true,
      name: [{
        family: lastName,
        given: [firstName]
      }],
      gender: index % 2 === 0 ? 'male' : 'female',
      birthDate: this.generateRandomBirthDate(),
      telecom: [{
        system: 'phone',
        value: `555-${String(Math.floor(Math.random() * 9000) + 1000)}`
      }]
    };
  }

  /**
   * Generate related resources for a patient
   */
  private generateRelatedResources(patient: FhirResource, resourceTypes: string[]): FhirResource[] {
    const resources: FhirResource[] = [];
    const patientRef = `Patient/${patient.id || 'temp-id'}`;

    if (resourceTypes.includes('Observation')) {
      resources.push({
        resourceType: 'Observation',
        status: 'final',
        category: [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'vital-signs'
          }]
        }],
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '29463-7',
            display: 'Body Weight'
          }]
        },
        subject: { reference: patientRef },
        valueQuantity: {
          value: Math.floor(Math.random() * 50) + 50,
          unit: 'kg',
          system: 'http://unitsofmeasure.org'
        }
      });
    }

    if (resourceTypes.includes('Condition')) {
      resources.push({
        resourceType: 'Condition',
        clinicalStatus: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'active'
          }]
        },
        verificationStatus: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
            code: 'confirmed'
          }]
        },
        code: {
          coding: [{
            system: 'http://snomed.info/sct',
            code: '44054006',
            display: 'Diabetes mellitus type 2'
          }]
        },
        subject: { reference: patientRef }
      });
    }

    return resources;
  }

  /**
   * Generate random birth date
   */
  private generateRandomBirthDate(): string {
    const start = new Date(1950, 0, 1);
    const end = new Date(2005, 11, 31);
    const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return randomDate.toISOString().split('T')[0];
  }

  /**
   * Generate a UUID for resources
   */
  private generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Load configuration from storage
   */
  private loadConfigFromStorage(): SynthiaConfig {
    try {
      const stored = localStorage.getItem('synthia-config');
      if (stored) {
        return { ...this.defaultConfig, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load SYNTHIA config:', error);
    }
    return { ...this.defaultConfig };
  }

  /**
   * Save configuration to storage
   */
  saveConfig(config: Partial<SynthiaConfig>): void {
    const updatedConfig = { ...this.config(), ...config };
    this.config.set(updatedConfig);
    localStorage.setItem('synthia-config', JSON.stringify(updatedConfig));
  }

  /**
   * Reset to default configuration
   */
  resetConfig(): void {
    this.config.set({ ...this.defaultConfig });
    localStorage.removeItem('synthia-config');
  }
}