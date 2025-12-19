import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Header } from '../../header/header';
import { SubHeader } from '../sub-header/sub-header';
import { ToggleableSidebar } from '../../toggleable-sidebar/toggleable-sidebar';
import { 
  NotificationPreferencesService, 
  NotificationPreferences 
} from '../../../services/notification-preferences.service';

@Component({
  selector: 'app-notification-preferences',
  standalone: true,
  imports: [CommonModule, FormsModule, Header, SubHeader, ToggleableSidebar],
  templateUrl: './notification-preferences.html',
  styleUrl: './notification-preferences.scss'
})
export class NotificationPreferencesComponent implements OnInit {
  private preferencesService = inject(NotificationPreferencesService);

// Form state
  preferences = signal<NotificationPreferences>({
    budgetWarningEnabled: true,
    budgetExceededEnabled: true,
    budgetNearEndEnabled: true,
    savingsDeadlineEnabled: true,
    savingsDeadlineDays: 7,
    savingsMilestoneEnabled: true,
    savingsCompletedEnabled: true,
    soundEnabled: true,
    toastEnabled: true
  });

  // UI state
  isLoading = signal(true);
  isSaving = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  hasChanges = signal(false);

  // Original preferences for change detection
  private originalPreferences: NotificationPreferences | null = null;

  // Deadline days options
  deadlineDaysOptions = [
    { value: 1, label: '1 day before' },
    { value: 3, label: '3 days before' },
    { value: 7, label: '7 days before' },
    { value: 14, label: '14 days before' }
  ];

  ngOnInit(): void {
    this.loadPreferences();
  }

  private loadPreferences(): void {
    this.isLoading.set(true);
    this.preferencesService.getPreferences().subscribe({
      next: (prefs) => {
        this.preferences.set({ ...prefs });
        this.originalPreferences = { ...prefs };
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load preferences:', err);
        this.errorMessage.set('Failed to load preferences');
        this.isLoading.set(false);
      }
    });
  }

  onPreferenceChange(): void {
    this.hasChanges.set(this.detectChanges());
    this.successMessage.set(null);
  }

  private detectChanges(): boolean {
    if (!this.originalPreferences) return false;
    const current = this.preferences();
    return JSON.stringify(current) !== JSON.stringify(this.originalPreferences);
  }

  savePreferences(): void {
    this.isSaving.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    this.preferencesService.updatePreferences(this.preferences()).subscribe({
      next: (savedPrefs) => {
        this.originalPreferences = { ...savedPrefs };
        this.hasChanges.set(false);
        this.isSaving.set(false);
        this.successMessage.set('Preferences saved successfully!');
      },
      error: (err) => {
        console.error('Failed to save preferences:', err);
        this.errorMessage.set('Failed to save preferences. Please try again.');
        this.isSaving.set(false);
      }
    });
  }

  resetToDefaults(): void {
    this.preferencesService.resetToDefaults().subscribe({
      next: (defaults) => {
        this.preferences.set({ ...defaults });
        this.originalPreferences = { ...defaults };
        this.hasChanges.set(false);
        this.successMessage.set('Preferences reset to defaults!');
      },
      error: (err) => {
        console.error('Failed to reset preferences:', err);
        this.errorMessage.set('Failed to reset preferences.');
      }
    });
  }

  // Helper methods for template binding
  updatePreference<K extends keyof NotificationPreferences>(
    key: K, 
    value: NotificationPreferences[K]
  ): void {
    this.preferences.update(prefs => ({ ...prefs, [key]: value }));
    this.onPreferenceChange();
  }

  getPreference<K extends keyof NotificationPreferences>(key: K): NotificationPreferences[K] {
    return this.preferences()[key];
  }
}
