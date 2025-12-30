import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

export interface NotificationPreferences {
  // Budget notifications
  budgetWarningEnabled: boolean;
  budgetExceededEnabled: boolean;
  budgetNearEndEnabled: boolean;

  // Savings notifications
  savingsDeadlineEnabled: boolean;
  savingsDeadlineDays: number;  // Days before deadline (1, 3, 7, 14)
  savingsMilestoneEnabled: boolean;
  savingsCompletedEnabled: boolean;

  // Delivery settings
  soundEnabled: boolean;
  toastEnabled: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  budgetWarningEnabled: true,
  budgetExceededEnabled: true,
  budgetNearEndEnabled: true,
  savingsDeadlineEnabled: true,
  savingsDeadlineDays: 7,
  savingsMilestoneEnabled: true,
  savingsCompletedEnabled: true,
  soundEnabled: true,
  toastEnabled: true,
};

const STORAGE_KEY = 'ibudget_notification_preferences';

@Injectable({
  providedIn: 'root'
})
export class NotificationPreferencesService {
  private preferencesSubject = new BehaviorSubject<NotificationPreferences>(this.loadFromStorage());
  public preferences$ = this.preferencesSubject.asObservable();

  constructor() {}

  /**
   * Get current preferences
   */
  getPreferences(): Observable<NotificationPreferences> {
    return of(this.preferencesSubject.value);
  }

  /**
   * Get preferences synchronously
   */
  getPreferencesSync(): NotificationPreferences {
    return this.preferencesSubject.value;
  }

  /**
   * Update preferences
   */
  updatePreferences(preferences: NotificationPreferences): Observable<NotificationPreferences> {
    this.saveToStorage(preferences);
    this.preferencesSubject.next(preferences);
    return of(preferences);
  }

  /**
   * Reset to default preferences
   */
  resetToDefaults(): Observable<NotificationPreferences> {
    this.saveToStorage(DEFAULT_PREFERENCES);
    this.preferencesSubject.next(DEFAULT_PREFERENCES);
    return of(DEFAULT_PREFERENCES);
  }

  /**
   * Check if a specific notification type is enabled
   */
  isNotificationEnabled(type: string): boolean {
    const prefs = this.preferencesSubject.value;
    
    switch (type) {
      case 'BUDGET_WARNING':
        return prefs.budgetWarningEnabled;
      case 'BUDGET_EXCEEDED':
        return prefs.budgetExceededEnabled;
      case 'BUDGET_NEAR_END':
        return prefs.budgetNearEndEnabled;
      case 'SAVINGS_DEADLINE':
        return prefs.savingsDeadlineEnabled;
      case 'SAVINGS_MILESTONE_50':
      case 'SAVINGS_MILESTONE_75':
        return prefs.savingsMilestoneEnabled;
      case 'SAVINGS_COMPLETED':
        return prefs.savingsCompletedEnabled;
      default:
        return true;
    }
  }

  /**
   * Check if sound is enabled
   */
  isSoundEnabled(): boolean {
    return this.preferencesSubject.value.soundEnabled;
  }

/**
   * Check if toast notifications are enabled
   */
  isToastEnabled(): boolean {
    return this.preferencesSubject.value.toastEnabled;
  }

  /**
   * Load preferences from localStorage
   */
  private loadFromStorage(): NotificationPreferences {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all keys exist
        return { ...DEFAULT_PREFERENCES, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load notification preferences:', e);
    }
    return { ...DEFAULT_PREFERENCES };
  }

  /**
   * Save preferences to localStorage
   */
  private saveToStorage(preferences: NotificationPreferences): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (e) {
      console.error('Failed to save notification preferences:', e);
    }
  }

  /**
   * Clear preferences state (for logout).
   * Does NOT clear localStorage since preferences should persist across sessions.
   */
  clearState(): void {
    // Reset to defaults but keep localStorage (preferences are user-specific settings)
    this.preferencesSubject.next(this.loadFromStorage());
    console.log('🧹 Notification preferences state cleared');
  }
}
