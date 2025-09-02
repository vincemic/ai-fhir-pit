import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { FhirService } from './services/fhir.service';
import { SplashScreenComponent } from './components/splash-screen.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, RouterLink, RouterLinkActive, SplashScreenComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  private readonly router = inject(Router);
  private readonly fhirService = inject(FhirService);

  // Signals for reactive state management
  protected readonly title = signal('FHIR-PIT');
  protected readonly currentRoute = signal<string>('/');
  protected readonly isMobileMenuOpen = signal<boolean>(false);
  protected readonly isConnected = signal<boolean>(false);
  protected readonly showSplash = signal<boolean>(true);

  // Computed values
  protected readonly serverStatus = computed(() => 
    this.isConnected() ? 'Connected' : 'Disconnected'
  );

  protected readonly currentPageTitle = computed(() => {
    const route = this.currentRoute();
    switch (route) {
      case '/': return 'Dashboard';
      case '/search': return 'Search Resources';
      case '/create': return 'Create Resource';
      case '/config': return 'Configuration';
      default: return 'FHIR-PIT';
    }
  });

  constructor() {
    // Track route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute.set(event.url);
        this.isMobileMenuOpen.set(false); // Close mobile menu on navigation
      });

    // Test initial connection
    this.testConnection();

    // Splash screen now waits for button click - no automatic timer
  }

  private async testConnection(): Promise<void> {
    const result = await this.fhirService.testConnection();
    this.isConnected.set(result.success);
  }

  protected toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(current => !current);
  }

  protected async reconnect(): Promise<void> {
    await this.testConnection();
  }
}
