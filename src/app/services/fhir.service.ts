import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface FhirResource {
  resourceType: string;
  id?: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
    profile?: string[];
  };
  [key: string]: any;
}

export interface FhirBundle {
  resourceType: 'Bundle';
  id?: string;
  type: 'searchset' | 'collection' | 'document' | 'message' | 'transaction' | 'batch';
  total?: number;
  entry?: FhirBundleEntry[];
  link?: FhirBundleLink[];
}

export interface FhirBundleEntry {
  resource?: FhirResource;
  search?: {
    mode?: 'match' | 'include' | 'outcome';
    score?: number;
  };
  fullUrl?: string;
}

export interface FhirBundleLink {
  relation: 'self' | 'first' | 'previous' | 'next' | 'last';
  url: string;
}

export interface FhirSearchParams {
  resourceType: string;
  searchTerm?: string;
  searchField?: string;
  count?: number;
  offset?: number;
  sort?: string;
  [key: string]: any;
}

export interface FhirConfig {
  serverUrl: string;
  serverName: string;
  apiKey?: string;
  timeout?: number;
}

interface StoredFhirConfig {
  serverUrl?: string;
  serverName?: string;
  apiKey?: string;
  timeout?: number;
}

export interface ServerInfo {
  url: string;
  version?: string;
  software?: string;
  lastTested?: string;
  capabilities?: string[];
  responseTime?: number;
}

export interface TestResult {
  success: boolean;
  responseTime?: number;
  version?: string;
  capabilities?: string[];
  error?: string;
  details?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FhirService {
  private readonly http = inject(HttpClient);
  private readonly storageKey = 'fhir-config';
  
  // Default configuration from environment
  private readonly defaultConfig: FhirConfig = {
    serverUrl: environment.fhirServerUrl,
    serverName: environment.fhirServerName,
    timeout: 10000
  };
  
  // Signals for reactive state management
  readonly config = signal<FhirConfig>(this.loadConfigFromStorage());
  
  readonly isLoading = signal<boolean>(false);
  readonly lastError = signal<string | null>(null);
  readonly serverStatus = signal<'connected' | 'disconnected' | 'error'>('disconnected');
  readonly supportedResourceTypes = signal<string[]>([
    'Patient', 'Practitioner', 'Organization', 'Location',
    'Observation', 'Condition', 'Procedure', 'MedicationStatement',
    'Encounter', 'DiagnosticReport', 'Immunization', 'AllergyIntolerance',
    'Coverage'
  ]);

  /**
   * Load configuration from local storage, falling back to defaults
   */
  private loadConfigFromStorage(): FhirConfig {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsedConfig: StoredFhirConfig = JSON.parse(stored);
        return {
          serverUrl: parsedConfig.serverUrl || this.defaultConfig.serverUrl,
          serverName: parsedConfig.serverName || this.defaultConfig.serverName,
          apiKey: parsedConfig.apiKey || this.defaultConfig.apiKey,
          timeout: parsedConfig.timeout || this.defaultConfig.timeout
        };
      }
    } catch (error) {
      console.warn('Failed to load FHIR config from localStorage:', error);
    }
    return { ...this.defaultConfig };
  }

  /**
   * Save configuration to local storage
   */
  private saveConfigToStorage(config: FhirConfig): void {
    try {
      const configToStore: StoredFhirConfig = {
        serverUrl: config.serverUrl,
        serverName: config.serverName,
        apiKey: config.apiKey,
        timeout: config.timeout
      };
      localStorage.setItem(this.storageKey, JSON.stringify(configToStore));
    } catch (error) {
      console.warn('Failed to save FHIR config to localStorage:', error);
    }
  }

  /**
   * Reset configuration to defaults
   */
  resetToDefaults(): void {
    try {
      localStorage.removeItem(this.storageKey);
      this.config.set({ ...this.defaultConfig });
      this.serverStatus.set('disconnected');
    } catch (error) {
      console.warn('Failed to reset FHIR config:', error);
    }
  }

  /**
   * Get default configuration values
   */
  getDefaults(): FhirConfig {
    return { ...this.defaultConfig };
  }

  /**
   * Search for FHIR resources with pagination support
   */
  async searchResources(params: FhirSearchParams): Promise<FhirBundle | null> {
    this.isLoading.set(true);
    this.lastError.set(null);

    try {
      const url = `${this.config().serverUrl}/${params.resourceType}`;
      let httpParams = new HttpParams();

      // Add search parameters
      if (params.searchTerm && params.searchField) {
        httpParams = httpParams.set(params.searchField, params.searchTerm);
      }
      
      if (params.count) {
        httpParams = httpParams.set('_count', params.count.toString());
      }
      
      if (params.offset) {
        httpParams = httpParams.set('_skip', params.offset.toString());
      }
      
      if (params.sort) {
        httpParams = httpParams.set('_sort', params.sort);
      }

      // Add any additional search parameters
      Object.keys(params).forEach(key => {
        if (!['resourceType', 'searchTerm', 'searchField', 'count', 'offset', 'sort'].includes(key)) {
          httpParams = httpParams.set(key, params[key]);
        }
      });

      const response = await this.http.get<FhirBundle>(url, { 
        params: httpParams,
        headers: {
          'Accept': 'application/fhir+json',
          'Content-Type': 'application/fhir+json'
        }
      }).toPromise();

      return response || null;
    } catch (error) {
      await this.handleError(error);
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Get a specific FHIR resource by ID
   */
  async getResourceById(resourceType: string, id: string): Promise<FhirResource | null> {
    this.isLoading.set(true);
    this.lastError.set(null);

    try {
      const url = `${this.config().serverUrl}/${resourceType}/${id}`;
      
      const response = await this.http.get<FhirResource>(url, {
        headers: {
          'Accept': 'application/fhir+json',
          'Content-Type': 'application/fhir+json'
        }
      }).toPromise();

      return response || null;
    } catch (error) {
      await this.handleError(error);
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Create a new FHIR resource
   */
  async createResource(resource: FhirResource): Promise<FhirResource | null> {
    this.isLoading.set(true);
    this.lastError.set(null);

    try {
      const url = `${this.config().serverUrl}/${resource.resourceType}`;
      
      const response = await this.http.post<FhirResource>(url, resource, {
        headers: {
          'Accept': 'application/fhir+json',
          'Content-Type': 'application/fhir+json'
        }
      }).toPromise();

      return response || null;
    } catch (error) {
      await this.handleError(error);
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Update an existing FHIR resource
   */
  async updateResource(resource: FhirResource): Promise<FhirResource | null> {
    if (!resource.id) {
      this.lastError.set('Resource ID is required for update operation');
      return null;
    }

    this.isLoading.set(true);
    this.lastError.set(null);

    try {
      const url = `${this.config().serverUrl}/${resource.resourceType}/${resource.id}`;
      
      const response = await this.http.put<FhirResource>(url, resource, {
        headers: {
          'Accept': 'application/fhir+json',
          'Content-Type': 'application/fhir+json'
        }
      }).toPromise();

      return response || null;
    } catch (error) {
      await this.handleError(error);
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Follow a direct URL (used for pagination)
   */
  async followUrl(url: string): Promise<FhirBundle | null> {
    this.isLoading.set(true);
    this.lastError.set(null);

    try {
      const response = await this.http.get<FhirBundle>(url, {
        headers: {
          'Accept': 'application/fhir+json',
          'Content-Type': 'application/fhir+json'
        }
      }).toPromise();

      return response || null;
    } catch (error) {
      await this.handleError(error);
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Follow references to related resources
   */
  async followReference(reference: string): Promise<FhirResource | null> {
    if (!reference) {
      this.lastError.set('Reference is required');
      return null;
    }

    // Handle both relative and absolute references
    let url: string;
    if (reference.startsWith('http')) {
      url = reference;
    } else {
      url = `${this.config().serverUrl}/${reference}`;
    }

    this.isLoading.set(true);
    this.lastError.set(null);

    try {
      const response = await this.http.get<FhirResource>(url, {
        headers: {
          'Accept': 'application/fhir+json',
          'Content-Type': 'application/fhir+json'
        }
      }).toPromise();

      return response || null;
    } catch (error) {
      await this.handleError(error);
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Update FHIR server configuration
   */
  updateConfig(newConfig: Partial<FhirConfig>): void {
    const updatedConfig = { ...this.config(), ...newConfig };
    this.config.set(updatedConfig);
    this.saveConfigToStorage(updatedConfig);
  }

  /**
   * Update FHIR server URL and optionally server name
   */
  async updateServerUrl(newUrl: string, serverName?: string): Promise<void> {
    const updateData: Partial<FhirConfig> = { serverUrl: newUrl };
    if (serverName) {
      updateData.serverName = serverName;
    }
    
    this.updateConfig(updateData);
    this.serverStatus.set('disconnected');
    
    // Test the new connection
    const result = await this.testConnection();
    this.serverStatus.set(result.success ? 'connected' : 'error');
  }

  /**
   * Test connection to FHIR server with detailed results
   */
  async testConnection(serverUrl?: string): Promise<TestResult> {
    const urlToTest = serverUrl || this.config().serverUrl;
    this.isLoading.set(true);
    this.lastError.set(null);

    const startTime = Date.now();

    try {
      const url = `${urlToTest}/metadata`;
      
      const response = await this.http.get<any>(url, {
        headers: {
          'Accept': 'application/fhir+json'
        }
      }).toPromise();

      const responseTime = Date.now() - startTime;

      // Extract capabilities and version info
      const capabilities: string[] = [];
      const version = response?.fhirVersion || response?.version;
      let software = 'Unknown';

      if (response?.software?.name) {
        software = response.software.name;
      }

      if (response?.rest?.[0]?.resource) {
        response.rest[0].resource.forEach((resource: any) => {
          if (resource.type) {
            capabilities.push(resource.type);
          }
        });
      }

      // Update server status if testing current server
      if (!serverUrl) {
        this.serverStatus.set('connected');
      }

      return {
        success: true,
        responseTime,
        version,
        capabilities,
      };
    } catch (error) {
      let errorMessage = 'Connection failed';
      let details = '';

      if (error instanceof HttpErrorResponse) {
        errorMessage = `HTTP ${error.status}: ${error.statusText}`;
        details = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Update server status if testing current server
      if (!serverUrl) {
        this.serverStatus.set('error');
        this.lastError.set(errorMessage);
      }

      return {
        success: false,
        error: errorMessage,
        details
      };
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Get server capability statement
   */
  async getCapabilityStatement(): Promise<FhirResource | null> {
    this.isLoading.set(true);
    this.lastError.set(null);

    try {
      const url = `${this.config().serverUrl}/metadata`;
      
      const response = await this.http.get<FhirResource>(url, {
        headers: {
          'Accept': 'application/fhir+json'
        }
      }).toPromise();

      return response || null;
    } catch (error) {
      await this.handleError(error);
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Clear the last error
   */
  clearError(): void {
    this.lastError.set(null);
  }

  /**
   * Handle HTTP errors consistently
   */
  private async handleError(error: any): Promise<void> {
    let errorMessage = 'An unexpected error occurred';

    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 0:
          errorMessage = 'Unable to connect to FHIR server. Please check your network connection.';
          break;
        case 400:
          errorMessage = 'Bad request. Please check your search parameters.';
          break;
        case 401:
          errorMessage = 'Unauthorized access. Please check your credentials.';
          break;
        case 403:
          errorMessage = 'Access forbidden. You do not have permission to access this resource.';
          break;
        case 404:
          errorMessage = 'Resource not found.';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          break;
        case 503:
          errorMessage = 'Service unavailable. The FHIR server is temporarily down.';
          break;
        default:
          errorMessage = `HTTP ${error.status}: ${error.statusText}`;
      }

      // Try to extract FHIR OperationOutcome if available
      if (error.error?.resourceType === 'OperationOutcome') {
        const issues = error.error.issue || [];
        if (issues.length > 0 && issues[0].details?.text) {
          errorMessage = issues[0].details.text;
        }
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    this.lastError.set(errorMessage);
    console.error('FHIR Service Error:', error);
  }
}