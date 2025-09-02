import { Component, signal, OnInit, ChangeDetectionStrategy, ElementRef, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-splash-screen',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatButtonModule],
  templateUrl: './splash-screen.component.html',
  styleUrl: './splash-screen.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SplashScreenComponent implements OnInit, AfterViewInit {
  private readonly elementRef = inject(ElementRef);
  
  readonly isVisible = signal(true);
  readonly showContent = signal(false);
  
  ngOnInit(): void {
    // Show content after a brief delay for animation staging
    setTimeout(() => {
      this.showContent.set(true);
    }, 100);

    // Remove the automatic timer - now waits for user interaction
  }

  ngAfterViewInit(): void {
    // Auto-focus the splash screen so keyboard events work immediately
    setTimeout(() => {
      this.elementRef.nativeElement.querySelector('.splash-screen')?.focus();
    }, 150);
  }

  // Method to handle button click and hide splash screen
  onContinueClick(): void {
    this.hideSplashScreen();
  }

  // Method to handle clicking anywhere on splash screen
  onSplashClick(): void {
    this.hideSplashScreen();
  }

  // Method to handle keyboard events
  onKeyDown(event: KeyboardEvent): void {
    // Dismiss on Enter, Space, or Escape key
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Escape') {
      event.preventDefault();
      this.hideSplashScreen();
    }
  }

  private hideSplashScreen(): void {
    this.showContent.set(false);
    
    // Hide splash screen after animation
    setTimeout(() => {
      this.isVisible.set(false);
    }, 300);
  }

  get currentYear(): number {
    return new Date().getFullYear();
  }
}