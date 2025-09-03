import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FhirResource } from '../../services/fhir.service';
import { ResourceFormComponent } from './resource-form.interface';

@Component({
  selector: 'app-location-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './location-form.component.html',
  styleUrl: './location-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocationFormComponent implements ResourceFormComponent {
  @Input() resource: FhirResource | null = null;
  @Input() readonly: boolean = true;

  protected getIdentifiers(): any[] {
    return this.resource?.['identifier'] || [];
  }

  protected getAliases(): string[] {
    return this.resource?.['alias'] || [];
  }

  protected getTypes(): any[] {
    return this.resource?.['type'] || [];
  }

  protected getTelecom(): any[] {
    return this.resource?.['telecom'] || [];
  }

  protected getEndpoints(): any[] {
    return this.resource?.['endpoint'] || [];
  }

  protected getHoursOfOperation(): any[] {
    return this.resource?.['hoursOfOperation'] || [];
  }

  protected getAvailabilityExceptions(): string | null {
    return this.resource?.['availabilityExceptions'] || null;
  }

  protected formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  protected formatPeriod(period: any): string {
    if (!period) return '';
    
    const start = period.start ? this.formatDate(period.start) : 'Unknown';
    const end = period.end ? this.formatDate(period.end) : 'Ongoing';
    
    return `${start} - ${end}`;
  }

  protected getCodeableConceptDisplay(concept: any): string {
    if (!concept) return '';
    
    if (concept.text) return concept.text;
    
    if (concept.coding && concept.coding.length > 0) {
      const coding = concept.coding[0];
      return coding.display || coding.code || '';
    }
    
    return '';
  }

  protected getCodeableConcepts(concept: any): any[] {
    if (!concept || !concept.coding) return [];
    return concept.coding;
  }

  protected getAddressLine(address: any): string {
    const parts = [address.city, address.state, address.postalCode, address.country];
    return parts.filter(part => part).join(', ');
  }
}
