import { Component, signal, computed, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FhirService, ServerInfo } from '../services/fhir.service';

interface ServerConfig {
  name: string;
  url: string;
  description: string;
  version?: string;
  isDefault?: boolean;
}

@Component({
  selector: 'app-config',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './config.component.html',
  styleUrl: './config.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  protected readonly fhirService = inject(FhirService);

  // Signals for reactive state
  protected readonly savedServers = signal<ServerConfig[]>([]);
  protected readonly editingServer = signal<ServerConfig | null>(null);
  protected readonly testingConnection = signal<boolean>(false);
  protected readonly testResult = signal<any>(null);
  protected readonly currentServerInfo = signal<ServerInfo | null>(null);

  // Form controls
  protected readonly configForm: FormGroup;

  // Preset servers
  protected readonly presetServers = signal<ServerConfig[]>([
    {
      name: 'HAPI FHIR R4',
      url: 'https://hapi.fhir.org/baseR4',
      description: 'Public HAPI FHIR R4 test server'
    },
    {
      name: 'HAPI FHIR R5',
      url: 'https://hapi.fhir.org/baseR5',
      description: 'Public HAPI FHIR R5 test server'
    },
    {
      name: 'Synthea Sample Data',
      url: 'https://synthea.mitre.org/fhir',
      description: 'Synthetic patient data for testing'
    },
    {
      name: 'SMART Health IT',
      url: 'https://r4.smarthealthit.org',
      description: 'SMART on FHIR reference implementation'
    }
  ]);

  constructor() {
    this.configForm = this.fb.group({
      name: ['', Validators.required],
      url: ['', [Validators.required, this.urlValidator]],
      description: [''],
      isDefault: [false]
    });

    this.loadSavedServers();
  }

  ngOnInit(): void {
    this.updateCurrentServerInfo();
  }

  private urlValidator(control: any) {
    try {
      new URL(control.value);
      return null;
    } catch {
      return { url: true };
    }
  }

  protected getStatusText(): string {
    switch (this.fhirService.serverStatus()) {
      case 'connected': return 'Connected';
      case 'disconnected': return 'Disconnected';
      case 'error': return 'Connection Error';
      default: return 'Unknown';
    }
  }

  /**
   * Reset configuration to default values
   */
  protected resetToDefaults(): void {
    this.fhirService.resetToDefaults();
    this.updateCurrentServerInfo();
  }

  /**
   * Get current configuration for display
   */
  protected getCurrentConfig() {
    return this.fhirService.config();
  }

  /**
   * Get default configuration values
   */
  protected getDefaults() {
    return this.fhirService.getDefaults();
  }

  /**
   * Show default configuration values in an alert
   */
  protected showDefaults(): void {
    const defaults = this.getDefaults();
    const message = `Default Configuration:
    
Server Name: ${defaults.serverName}
Server URL: ${defaults.serverUrl}
Timeout: ${defaults.timeout}ms
${defaults.apiKey ? `API Key: ${defaults.apiKey}` : 'API Key: Not set'}`;
    
    alert(message);
  }

  protected async testCurrentConnection(): Promise<void> {
    const result = await this.fhirService.testConnection();
    this.testResult.set(result);
  }

  protected async testConnection(): Promise<void> {
    if (this.configForm.invalid) return;

    this.testingConnection.set(true);
    const url = this.configForm.get('url')?.value;
    
    try {
      const result = await this.fhirService.testConnection(url);
      this.testResult.set(result);
    } finally {
      this.testingConnection.set(false);
    }
  }

  protected async onSubmit(): Promise<void> {
    if (this.configForm.invalid) return;

    const formValue = this.configForm.value;
    const serverConfig: ServerConfig = {
      name: formValue.name,
      url: formValue.url,
      description: formValue.description,
      isDefault: formValue.isDefault
    };

    if (this.editingServer()) {
      this.updateServer(serverConfig);
    } else {
      this.addServer(serverConfig);
    }

    this.resetForm();
  }

  private addServer(server: ServerConfig): void {
    const servers = this.savedServers();
    
    // If this is set as default, remove default from others
    if (server.isDefault) {
      servers.forEach(s => s.isDefault = false);
    }

    // If this is the first server, make it default
    if (servers.length === 0) {
      server.isDefault = true;
    }

    servers.push(server);
    this.savedServers.set([...servers]);
    this.saveToPersistence();
  }

  private updateServer(updatedServer: ServerConfig): void {
    const servers = this.savedServers();
    const index = servers.findIndex(s => s.url === this.editingServer()?.url);
    
    if (index !== -1) {
      // If this is set as default, remove default from others
      if (updatedServer.isDefault) {
        servers.forEach(s => s.isDefault = false);
      }
      
      servers[index] = updatedServer;
      this.savedServers.set([...servers]);
      this.saveToPersistence();
      this.editingServer.set(null);
    }
  }

  protected cancelEdit(): void {
    this.editingServer.set(null);
    this.resetForm();
  }

  /**
   * Connect to a saved server configuration
   */
  protected async connectToServer(server: ServerConfig): Promise<void> {
    await this.fhirService.updateServerUrl(server.url, server.name);
    this.updateCurrentServerInfo();
  }

  /**
   * Add a preset server to saved servers and optionally connect to it
   */
  protected addPresetServer(preset: ServerConfig): void {
    const servers = this.savedServers();
    
    // Check if server already exists
    const exists = servers.some(s => s.url === preset.url);
    if (exists) {
      // If it exists, just connect to it
      this.connectToServer(preset);
      return;
    }

    // Add to saved servers
    this.addServer({ ...preset });
    
    // Optionally connect to it immediately
    this.connectToServer(preset);
  }

  /**
   * Edit an existing server configuration
   */
  protected editServer(server: ServerConfig): void {
    this.editingServer.set(server);
    this.configForm.patchValue({
      name: server.name,
      url: server.url,
      description: server.description,
      isDefault: server.isDefault
    });
  }

  /**
   * Delete a server configuration
   */
  protected deleteServer(server: ServerConfig): void {
    if (confirm(`Are you sure you want to delete "${server.name}"?`)) {
      const servers = this.savedServers().filter(s => s.url !== server.url);
      this.savedServers.set(servers);
      this.saveToPersistence();
    }
  }

  private resetForm(): void {
    this.configForm.reset();
    this.configForm.patchValue({
      isDefault: false
    });
    this.testResult.set(null);
  }

  private loadSavedServers(): void {
    try {
      const saved = localStorage.getItem('fhir-pit-servers');
      if (saved) {
        this.savedServers.set(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading saved servers:', error);
    }
  }

  private saveToPersistence(): void {
    try {
      localStorage.setItem('fhir-pit-servers', JSON.stringify(this.savedServers()));
    } catch (error) {
      console.error('Error saving servers:', error);
    }
  }

  private updateCurrentServerInfo(): void {
    const config = this.fhirService.config();
    const serverInfo: ServerInfo = {
      url: config.serverUrl,
      version: 'Unknown',
      software: config.serverName,
      lastTested: 'Not tested',
      capabilities: []
    };
    this.currentServerInfo.set(serverInfo);
  }

  protected formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  }
}