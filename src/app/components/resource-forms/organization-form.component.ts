import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FhirResource } from '../../services/fhir.service';
import { ResourceFormComponent } from './resource-form.interface';

@Component({
  selector: 'app-organization-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './organization-form.component.html',
  styleUrl: './organization-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationFormComponent implements ResourceFormComponent {
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

  protected getAddresses(): any[] {
    return this.resource?.['address'] || [];
  }

  protected getTelecom(): any[] {
    return this.resource?.['telecom'] || [];
  }

  protected getContacts(): any[] {
    return this.resource?.['contact'] || [];
  }

  protected getEndpoints(): any[] {
    return this.resource?.['endpoint'] || [];
  }

  protected getQualifications(): any[] {
    return this.resource?.['qualification'] || [];
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

  protected getHumanNameDisplay(name: any): string {
    if (!name) return '';
    
    const parts = [];
    if (name.prefix && name.prefix.length > 0) {
      parts.push(name.prefix.join(' '));
    }
    if (name.given && name.given.length > 0) {
      parts.push(name.given.join(' '));
    }
    if (name.family) {
      parts.push(name.family);
    }
    if (name.suffix && name.suffix.length > 0) {
      parts.push(name.suffix.join(' '));
    }
    
    return parts.join(' ') || 'Unknown Name';
  }

  protected getAddressLine(address: any): string {
    const parts = [address.city, address.state, address.postalCode, address.country];
    return parts.filter(part => part).join(', ');
  }

  protected getFullAddress(address: any): string {
    const parts = [];
    if (address.line && address.line.length > 0) {
      parts.push(address.line.join(', '));
    }
    parts.push(this.getAddressLine(address));
    return parts.filter(part => part).join(', ');
  }
}
