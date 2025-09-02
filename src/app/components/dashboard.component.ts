import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FhirService } from '../services/fhir.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  protected readonly fhirService = inject(FhirService);
  private readonly router = inject(Router);

  protected readonly serverStatus = computed(() => {
    const config = this.fhirService.config();
    return config.serverUrl ? `Connected to ${config.serverName}` : 'Not connected';
  });

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  protected readonly supportedResources = signal([
    {
      name: 'Patient',
      icon: '👥',
      description: 'Individual receiving healthcare services'
    },
    {
      name: 'Practitioner',
      icon: '👨‍⚕️',
      description: 'Healthcare professional providing care'
    },
    {
      name: 'Observation',
      icon: '📊',
      description: 'Measurements and findings'
    },
    {
      name: 'Condition',
      icon: '🏥',
      description: 'Patient conditions and diagnoses'
    },
    {
      name: 'Medication',
      icon: '💊',
      description: 'Medication information'
    },
    {
      name: 'Encounter',
      icon: '🏥',
      description: 'Healthcare encounters and visits'
    },
    {
      name: 'Procedure',
      icon: '⚕️',
      description: 'Medical procedures performed'
    },
    {
      name: 'Organization',
      icon: '🏢',
      description: 'Healthcare organizations'
    }
  ]);
}