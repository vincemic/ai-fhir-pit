import { FhirResource } from '../../services/fhir.service';

export interface ResourceFormComponent {
  resource: FhirResource | null;
  readonly: boolean;
}

export interface FormField {
  label: string;
  value: any;
  type: 'text' | 'date' | 'select' | 'textarea' | 'number' | 'boolean' | 'reference' | 'coding' | 'address' | 'contactpoint' | 'humanname';
  options?: { value: any; label: string }[];
  required?: boolean;
  readonly?: boolean;
  multiple?: boolean;
}

export interface FormSection {
  title: string;
  fields: FormField[];
  collapsible?: boolean;
  collapsed?: boolean;
}