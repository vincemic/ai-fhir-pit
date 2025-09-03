# FHIR-PIT Resource Types Documentation

This document provides a comprehensive overview of the FHIR resource types supported by FHIR-PIT, including their availability for search, creation, and viewing/editing.

## Summary

FHIR-PIT supports **13 FHIR resource types** with varying levels of functionality:

- **Search Support**: 13 resource types
- **Create/Edit Forms**: 13 resource types with full forms (all supported types now have creation forms)
- **View Forms**: 13 resource types (with default fallback for unsupported types)

## Resource Types Details

### 1. Patient 👤
- **Search**: ✅ Supported with fields: name, identifier, birthdate, gender
- **Creation**: ✅ Full form available in standardized modal
- **Viewing**: ✅ Dedicated form component with demographics, contact info, clinical data
- **Edit Form**: ✅ Complete PatientFormComponent with all patient data fields

### 2. Practitioner 👩‍⚕️
- **Search**: ✅ Supported with fields: name, identifier
- **Creation**: ✅ Full form available in standardized modal
- **Viewing**: ✅ Dedicated form component with practitioner details
- **Edit Form**: ✅ Complete PractitionerFormComponent with professional information

### 3. Organization 🏢
- **Search**: ✅ Supported (uses common fields only)
- **Creation**: ✅ Full form available in standardized modal
- **Viewing**: ✅ Dedicated form component with organization details
- **Edit Form**: ✅ Complete OrganizationFormComponent with organizational data

### 4. Location 📍
- **Search**: ✅ Supported (uses common fields only)
- **Creation**: ✅ Full form available in standardized modal
- **Viewing**: ✅ Dedicated form component with location details
- **Edit Form**: ✅ Complete LocationFormComponent with location information

### 5. Observation 📊
- **Search**: ✅ Supported with fields: code, patient, date
- **Creation**: ✅ Full form available in standardized modal
- **Viewing**: ✅ Dedicated form component with observation data
- **Edit Form**: ✅ Complete ObservationFormComponent with measurement details

### 6. Condition 🩺
- **Search**: ✅ Supported with fields: code, patient, onset-date
- **Creation**: ✅ Full form available in standardized modal
- **Viewing**: ✅ Dedicated form component with condition details
- **Edit Form**: ✅ Complete ConditionFormComponent with clinical condition data

### 7. Procedure 🏥
- **Search**: ✅ Supported (uses common fields only)
- **Creation**: ✅ Full form available in standardized modal
- **Viewing**: ✅ Dedicated form component with procedure details
- **Edit Form**: ✅ Complete ProcedureFormComponent with procedure information

### 8. Coverage 💳
- **Search**: ✅ Supported with fields: beneficiary, payor, subscriber, status, type
- **Creation**: ✅ Full form available in standardized modal
- **Viewing**: ✅ Dedicated form component with coverage details
- **Edit Form**: ✅ Complete CoverageFormComponent with insurance information

### 9. Encounter 📅
- **Search**: ✅ Supported (uses common fields only)
- **Creation**: ✅ Full form available in standardized modal
- **Viewing**: ⚠️ Placeholder form component (basic display only)
- **Edit Form**: ⚠️ Placeholder form - needs full implementation

### 10. MedicationStatement 💊
- **Search**: ✅ Supported (uses common fields only)
- **Creation**: ✅ Full form available in standardized modal
- **Viewing**: ⚠️ Placeholder form component (basic display only)
- **Edit Form**: ⚠️ Placeholder form - needs full implementation

### 11. DiagnosticReport 🔬
- **Search**: ✅ Supported (uses common fields only)
- **Creation**: ✅ Full form available in standardized modal
- **Viewing**: ⚠️ Placeholder form component (basic display only)
- **Edit Form**: ⚠️ Placeholder form - needs full implementation

### 12. Immunization 💉
- **Search**: ✅ Supported (uses common fields only)
- **Creation**: ✅ Full form available in standardized modal
- **Viewing**: ⚠️ Placeholder form component (basic display only)
- **Edit Form**: ⚠️ Placeholder form - needs full implementation

### 13. AllergyIntolerance 🤧
- **Search**: ✅ Supported (uses common fields only)
- **Creation**: ✅ Full form available in standardized modal
- **Viewing**: ⚠️ Placeholder form component (basic display only)
- **Edit Form**: ⚠️ Placeholder form - needs full implementation

## Search Functionality

All resource types can be searched with these common fields:
- `_id`: Resource ID
- `_lastUpdated`: Last update timestamp

### Resource-Specific Search Fields

#### Patient
- `name`: Patient name
- `identifier`: Patient identifier
- `birthdate`: Birth date
- `gender`: Gender

#### Practitioner
- `name`: Practitioner name
- `identifier`: Practitioner identifier

#### Observation
- `code`: Observation code
- `patient`: Patient reference
- `date`: Observation date

#### Condition
- `code`: Condition code
- `patient`: Patient reference
- `onset-date`: Condition onset date

#### Coverage
- `beneficiary`: Beneficiary (Patient) reference
- `payor`: Payor (Insurance Company) reference
- `subscriber`: Subscriber reference
- `status`: Coverage status
- `type`: Coverage type

## Creation Forms

### Full Forms Available (13 types)
1. **Patient** - Complete demographic and contact information
2. **Practitioner** - Professional information and qualifications
3. **Organization** - Organizational details and contact information
4. **Location** - Location details, type, and contact information
5. **Observation** - Measurement details, values, and references
6. **Condition** - Clinical condition details and status
7. **Procedure** - Procedure details, status, and timing
8. **Coverage** - Insurance coverage details and benefit information
9. **Encounter** - Healthcare service interaction details
10. **MedicationStatement** - Medication usage and administration records
11. **DiagnosticReport** - Laboratory and diagnostic test results
12. **Immunization** - Vaccination administration records
13. **AllergyIntolerance** - Allergy and intolerance information

### ~~Missing Creation Forms~~ ✅ **ALL CREATION FORMS NOW IMPLEMENTED**
All resource types now have full creation forms available in the standardized modal!

## Form Components Status

### Complete Form Components (8 types)
- `PatientFormComponent` - Full implementation
- `PractitionerFormComponent` - Full implementation
- `OrganizationFormComponent` - Full implementation
- `LocationFormComponent` - Full implementation
- `ObservationFormComponent` - Full implementation
- `ConditionFormComponent` - Full implementation
- `ProcedureFormComponent` - Full implementation
- `CoverageFormComponent` - Full implementation

### Placeholder Form Components (5 types)
The following have basic placeholder forms that only display resource type and basic information:
- `EncounterFormComponent` - Needs full implementation for viewing/editing
- `MedicationStatementFormComponent` - Needs full implementation for viewing/editing
- `DiagnosticReportFormComponent` - Needs full implementation for viewing/editing
- `ImmunizationFormComponent` - Needs full implementation for viewing/editing
- `AllergyIntoleranceFormComponent` - Needs full implementation for viewing/editing

**Note**: All resource types now have creation forms in the standardized modal, but some still need improved viewing/editing form components.

### Default Fallback
- `DefaultResourceFormComponent` - Generic form for any unsupported resource types

## ✅ Recent Completion Status

### ~~Recommendations for Completion~~ **COMPLETED!**

All creation forms have been successfully implemented! The following were recently added:

### ✅ High Priority - COMPLETED
1. **Coverage Creation Form** - ✅ Added to standardized modal component
2. **Encounter Creation Form** - ✅ Added to standardized modal component  
3. **MedicationStatement Creation Form** - ✅ Added to standardized modal component

### ✅ Medium Priority - COMPLETED
4. **DiagnosticReport Creation Form** - ✅ Added to standardized modal component
5. **Immunization Creation Form** - ✅ Added to standardized modal component
6. **AllergyIntolerance Creation Form** - ✅ Added to standardized modal component

### Remaining Tasks
The only remaining improvements needed are for the viewing/editing form components (not creation forms):
- Replace placeholder viewing forms with full implementations for Encounter, MedicationStatement, DiagnosticReport, Immunization, and AllergyIntolerance

### Implementation Notes
- All creation forms are now fully implemented in the standardized modal component
- Creation forms follow FHIR R4 specification requirements for each resource type
- All creation forms support proper validation and FHIR-compliant resource generation
- Viewing form components for some resource types still use placeholder implementations and could be enhanced

## File Locations

### Form Components
- `src/app/components/resource-forms/` - All form components
- `src/app/components/standardized-resource-form-modal.component.ts` - Creation modal
- `src/app/components/resource-viewer.component.ts` - Form component router

### Search Configuration
- `src/app/components/search.component.ts` - Search functionality and available fields
- `src/app/components/create.component.ts` - Creation page and supported types

### Services
- `src/app/services/fhir.service.ts` - FHIR API interactions
- `src/app/services/standardized-resource-modal.service.ts` - Modal management
