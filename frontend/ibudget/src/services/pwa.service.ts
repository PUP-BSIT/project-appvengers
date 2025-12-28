import { Injectable, inject, signal } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PwaService {
  private swUpdate = inject(SwUpdate);
  
  // Signals for reactive state management (works with zoneless)
  updateAvailable = signal(false);
  installPromptEvent = signal<BeforeInstallPromptEvent | null>(null);
  isInstallable = signal(false);

  constructor() {
    this.initializeUpdateCheck();
    this.initializeInstallPrompt();
  }

  /**
   * Check for service worker updates
   */
  private initializeUpdateCheck(): void {
    if (!this.swUpdate.isEnabled) {
      console.log('Service Worker is not enabled');
      return;
    }

    // Listen for version updates
    this.swUpdate.versionUpdates
      .pipe(filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY'))
      .subscribe((event) => {
        console.log('New version available:', event.latestVersion);
        this.updateAvailable.set(true);
      });

    // Check for updates every 30 minutes
    setInterval(() => {
      this.checkForUpdate();
    }, 30 * 60 * 1000);
  }

  /**
   * Initialize install prompt handling
   */
  private initializeInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (event: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      event.preventDefault();
      // Store the event for later use
      this.installPromptEvent.set(event as BeforeInstallPromptEvent);
      this.isInstallable.set(true);
      console.log('PWA install prompt available');
    });

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      console.log('iBudget PWA was installed');
      this.isInstallable.set(false);
      this.installPromptEvent.set(null);
    });
  }

  /**
   * Manually check for updates
   */
  async checkForUpdate(): Promise<boolean> {
    if (!this.swUpdate.isEnabled) return false;
    
    try {
      return await this.swUpdate.checkForUpdate();
    } catch (err) {
      console.error('Error checking for updates:', err);
      return false;
    }
  }

  /**
   * Reload the app to apply update
   */
  reloadToUpdate(): void {
    this.updateAvailable.set(false);
    window.location.reload();
  }

  /**
   * Prompt user to install the PWA
   */
  async promptInstall(): Promise<boolean> {
    const promptEvent = this.installPromptEvent();
    
    if (!promptEvent) {
      console.log('Install prompt not available');
      return false;
    }

    // Show the install prompt
    promptEvent.prompt();

    // Wait for the user's response
    const result = await promptEvent.userChoice;
    
    console.log('Install prompt result:', result.outcome);
    
    // Clear the stored prompt
    this.installPromptEvent.set(null);
    this.isInstallable.set(false);

    return result.outcome === 'accepted';
  }

  /**
   * Check if app is running in standalone mode (installed PWA)
   */
  isRunningStandalone(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }
}

/**
 * BeforeInstallPromptEvent interface
 * Not included in standard TypeScript DOM types
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}
