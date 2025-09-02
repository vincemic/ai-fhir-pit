import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard.component').then(m => m.DashboardComponent),
    title: 'Dashboard - FHIR-PIT'
  },
  {
    path: 'search',
    loadComponent: () => import('./components/search.component').then(m => m.SearchComponent),
    title: 'Search Resources - FHIR-PIT'
  },
  {
    path: 'create',
    loadComponent: () => import('./components/create.component').then(m => m.CreateComponent),
    title: 'Create Resource - FHIR-PIT'
  },
  {
    path: 'synthetic',
    loadComponent: () => import('./components/synthetic-data.component').then(m => m.SyntheticDataComponent),
    title: 'Generate Synthetic Data - FHIR-PIT'
  },
  {
    path: 'config',
    loadComponent: () => import('./components/config.component').then(m => m.ConfigComponent),
    title: 'Configuration - FHIR-PIT'
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
