import { Injectable, inject, signal } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class PwaService {
  private swUpdate = inject(SwUpdate);
  
  // Signals for reactive state management (works with zoneless)
  updateAvailable = signal(false);
  installPromptEvent = signal<BeforeInstallPromptEvent | null>(null);
  isInstallable = signal(false);

  // LocalStorage keys for PWA preferences
  private readonly INSTALL_DISMISSED_KEY = 'pwa_install_dismissed';
  private readonly INSTALL_DISMISSED_UNTIL_KEY = 'pwa_install_dismissed_until';
  private readonly DISMISS_DURATION_DAYS = 7; // Show again after 7 days

  constructor() {
    this.initializeUpdateCheck();
    this.initializeInstallPrompt();
  }

  /**
   * Check for service worker updates
   */
  private initializeUpdateCheck(): void {
    if (!this.swUpdate.isEnabled) {
      if (!environment.production) {
        console.log('Service Worker is not enabled');
      }
      return;
    }

    // Listen for version updates
    this.swUpdate.versionUpdates
      .pipe(filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY'))
      .subscribe((event) => {
        if (!environment.production) {
          console.log('New version available:', event.latestVersion);
        }
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
      
      // Only show install prompt if user hasn't dismissed it recently
      if (!this.isInstallDismissed()) {
        this.isInstallable.set(true);
        if (!environment.production) {
          console.log('PWA install prompt available');
        }
      } else {
        if (!environment.production) {
          console.log('PWA install prompt dismissed by user - not showing');
        }
      }
    });

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      if (!environment.production) {
        console.log('iBudget PWA was installed');
      }
      this.isInstallable.set(false);
      this.installPromptEvent.set(null);
      // Clear dismissal state since app is now installed
      this.clearInstallDismissed();
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
      if (!environment.production) {
        console.log('Install prompt not available');
      }
      return false;
    }

    // Show the install prompt
    promptEvent.prompt();

    // Wait for the user's response
    const result = await promptEvent.userChoice;
    
    if (!environment.production) {
      console.log('Install prompt result:', result.outcome);
    }
    
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

  /**
   * Mark install prompt as dismissed by user
   */
  dismissInstallPrompt(): void {
    const dismissedUntil = Date.now() + (this.DISMISS_DURATION_DAYS * 24 * 60 * 60 * 1000);
    localStorage.setItem(this.INSTALL_DISMISSED_KEY, 'true');
    localStorage.setItem(this.INSTALL_DISMISSED_UNTIL_KEY, dismissedUntil.toString());
    this.isInstallable.set(false);
    if (!environment.production) {
      console.log(`PWA install prompt dismissed until ${new Date(dismissedUntil).toLocaleDateString()}`);
    }
  }

  /**
   * Check if install prompt was dismissed and still within dismissal period
   */
  private isInstallDismissed(): boolean {
    const dismissed = localStorage.getItem(this.INSTALL_DISMISSED_KEY);
    const dismissedUntil = localStorage.getItem(this.INSTALL_DISMISSED_UNTIL_KEY);
    
    if (!dismissed || !dismissedUntil) {
      return false;
    }

    const dismissedUntilTime = parseInt(dismissedUntil, 10);
    const now = Date.now();

    // If dismissal period expired, clear the flag
    if (now > dismissedUntilTime) {
      this.clearInstallDismissed();
      return false;
    }

    return true;
  }

  /**
   * Clear install dismissal state
   */
  private clearInstallDismissed(): void {
    localStorage.removeItem(this.INSTALL_DISMISSED_KEY);
    localStorage.removeItem(this.INSTALL_DISMISSED_UNTIL_KEY);
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
