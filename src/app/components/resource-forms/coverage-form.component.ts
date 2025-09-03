import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FhirResource } from '../../services/fhir.service';
import { ResourceFormComponent } from './resource-form.interface';

@Component({
  selector: 'app-coverage-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './coverage-form.component.html',
  styleUrl: './default-resource-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoverageFormComponent implements ResourceFormComponent {
  @Input() resource: FhirResource | null = null;
  @Input() readonly: boolean = true;

  protected getPayors(): any[] {
    return this.resource?.['payor'] || [];
  }

  protected getClasses(): any[] {
    return this.resource?.['class'] || [];
  }

  protected getCostToBeneficiary(): any[] {
    return this.resource?.['costToBeneficiary'] || [];
  }

  protected getContracts(): any[] {
    return this.resource?.['contract'] || [];
  }

  protected formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  protected formatMoney(money: any): string {
    if (!money) return '';
    
    const value = money.value || 0;
    const currency = money.currency || 'USD';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(value);
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
}
