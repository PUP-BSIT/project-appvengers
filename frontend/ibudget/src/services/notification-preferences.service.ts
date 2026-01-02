import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { environment } from '../environments/environment';

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
  private localStorageService = inject(LocalStorageService);
  private preferencesSubject = new BehaviorSubject<NotificationPreferences>(DEFAULT_PREFERENCES);
  public preferences$ = this.preferencesSubject.asObservable();

  constructor() {
    // Don't load preferences in constructor - wait for userId to be set first
    // loadPreferences() will be called by Header component after login
    if (!environment.production) {
      console.log('[NotificationPreferences] Service initialized (waiting for userId)');
    }
  }

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
   * Load preferences from user-scoped localStorage
   * Only works after userId is set in LocalStorageService
   */
  loadPreferences(): void {
    // Check if userId is set before trying to load
    const userId = this.localStorageService.getUserId();
    if (!userId) {
      if (!environment.production) {
        console.warn('[NotificationPreferences] Cannot load preferences - userId not set. Using defaults.');
      }
      this.preferencesSubject.next(DEFAULT_PREFERENCES);
      return;
    }

    try {
      const stored = this.localStorageService.getItem<NotificationPreferences>(STORAGE_KEY);
      if (stored) {
        // Merge with defaults to ensure all keys exist
        const preferences = { ...DEFAULT_PREFERENCES, ...stored };
        this.preferencesSubject.next(preferences);
        if (!environment.production) {
          console.log('[NotificationPreferences] Loaded user preferences for user:', userId);
        }
      } else {
        if (!environment.production) {
          console.log('[NotificationPreferences] No stored preferences for user:', userId, '- using defaults');
        }
        this.preferencesSubject.next(DEFAULT_PREFERENCES);
      }
    } catch (e) {
      console.error('[NotificationPreferences] Failed to load preferences:', e);
      this.preferencesSubject.next(DEFAULT_PREFERENCES);
    }
  }

  /**
   * Save preferences to user-scoped localStorage
   */
  private saveToStorage(preferences: NotificationPreferences): void {
    // Check if userId is set before saving
    const userId = this.localStorageService.getUserId();
    if (!userId) {
      if (!environment.production) {
        console.warn('[NotificationPreferences] Cannot save preferences - userId not set. Skipping save.');
      }
      return;
    }

    try {
      this.localStorageService.setItem(STORAGE_KEY, preferences);
      if (!environment.production) {
        console.log('[NotificationPreferences] Saved user preferences for user:', userId);
      }
    } catch (e) {
      console.error('[NotificationPreferences] Failed to save preferences:', e);
    }
  }

  /**
   * Clear state on logout.
   * Resets to defaults - user's preferences will be reloaded from localStorage on next login.
   */
  clearState(): void {
    if (!environment.production) {
      console.log('[NotificationPreferences] Clearing state');
    }
    this.preferencesSubject.next(DEFAULT_PREFERENCES);
  }
}
