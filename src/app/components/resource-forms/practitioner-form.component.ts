import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FhirResource } from '../../services/fhir.service';
import { ResourceFormComponent } from './resource-form.interface';

@Component({
  selector: 'app-practitioner-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './practitioner-form.component.html',
  styleUrls: ['./practitioner-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PractitionerFormComponent implements ResourceFormComponent {
  @Input() resource: FhirResource | null = null;
  @Input() readonly: boolean = true;

  protected getNames(): any[] {
    return this.resource?.['name'] || [];
  }

  protected getIdentifiers(): any[] {
    return this.resource?.['identifier'] || [];
  }

  protected getTelecom(): any[] {
    return this.resource?.['telecom'] || [];
  }

  protected getAddresses(): any[] {
    return this.resource?.['address'] || [];
  }

  protected getQualifications(): any[] {
    return this.resource?.['qualification'] || [];
  }

  protected getCommunication(): any[] {
    return this.resource?.['communication'] || [];
  }

  protected formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
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
}