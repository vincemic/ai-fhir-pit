import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FhirResource } from '../../services/fhir.service';
import { ResourceFormComponent } from './resource-form.interface';

@Component({
  selector: 'app-patient-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './patient-form.component.html',
  styleUrl: './patient-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientFormComponent implements ResourceFormComponent {
  @Input() resource: FhirResource | null = null;
  @Input() readonly: boolean = true;

  protected getNames(): any[] {
    return this.resource?.['name'] || [];
  }

  protected getIdentifiers(): any[] {
    return this.resource?.['identifier'] || [];
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

  protected getCommunication(): any[] {
    return this.resource?.['communication'] || [];
  }

  protected getLinks(): any[] {
    return this.resource?.['link'] || [];
  }

  protected getGender(): string {
    return this.resource?.['gender'] || '';
  }

  protected getBirthDate(): string {
    return this.resource?.['birthDate'] || '';
  }

  protected getDeceased(): boolean {
    return this.resource?.['deceasedBoolean'] || this.resource?.['deceasedDateTime'];
  }

  protected getMaritalStatus(): any {
    return this.resource?.['maritalStatus'];
  }

  protected getMultipleBirth(): boolean {
    return this.resource?.['multipleBirthBoolean'] !== undefined || this.resource?.['multipleBirthInteger'] !== undefined;
  }

  protected getGeneralPractitioner(): any[] {
    return this.resource?.['generalPractitioner'] || [];
  }

  protected getManagingOrganization(): any {
    return this.resource?.['managingOrganization'];
  }

  protected getAge(): number | null {
    const birthDate = this.resource?.['birthDate'];
    if (!birthDate) return null;
    
    const birth = new Date(birthDate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  protected formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  protected formatPeriod(period: any): string {
    if (!period) return '';
    const start = period.start ? new Date(period.start).toLocaleDateString() : 'Unknown';
    const end = period.end ? new Date(period.end).toLocaleDateString() : 'Present';
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

  protected getAddressDisplay(address: any): string {
    if (!address) return '';
    
    if (address.text) return address.text;
    
    const parts = [];
    if (address.line && address.line.length > 0) {
      parts.push(address.line.join(', '));
    }
    
    const cityState = [address.city, address.state].filter(Boolean).join(', ');
    if (cityState) parts.push(cityState);
    
    if (address.postalCode) parts.push(address.postalCode);
    if (address.country) parts.push(address.country);
    
    return parts.join(', ');
  }

  protected getAddressLine(address: any): string {
    const parts = [address.city, address.state, address.postalCode, address.country];
    return parts.filter(part => part).join(', ');
  }
}
