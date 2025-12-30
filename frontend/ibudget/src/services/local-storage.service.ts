import { Injectable, signal } from '@angular/core';
import { environment } from '../environments/environment';

/**
 * LocalStorageService - User-scoped localStorage wrapper
 *
 * Provides user-specific data isolation by prefixing keys with userId.
 * Prevents cross-account data leakage for chat history, preferences, etc.
 *
 * Architecture:
 * - User-specific keys: user_{userId}_{key}
 * - Global keys: app_{key}
 *
 * Industry standard pattern used by Auth0, Firebase, AWS Amplify.
 */
@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private userIdSignal = signal<number | null>(null);

  /**
   * Set the current user context. Must be called after login.
   * @param userId - The authenticated user's ID
   */
  setUserId(userId: number): void {
    this.userIdSignal.set(userId);
    if (!environment.production) {
      console.log(`[LocalStorageService] User context set: ${userId}`);
    }
  }

  /**
   * Get the current user ID
   */
  getUserId(): number | null {
    return this.userIdSignal();
  }

  /**
   * Clear the current user context (call before logout)
   */
  clearUserId(): void {
    this.userIdSignal.set(null);
    if (!environment.production) {
      console.log('[LocalStorageService] User context cleared');
    }
  }

  /**
   * Store user-specific data with automatic userId prefixing
   * @param key - Storage key (e.g., 'chat_history')
   * @param value - Value to store (will be JSON stringified)
   * @throws Error if userId is not set
   */
  setItem<T>(key: string, value: T): void {
    const userId = this.userIdSignal();
    if (userId === null) {
      console.error(
        `[LocalStorageService] Cannot set '${key}' - no userId set. Call setUserId() first.`
      );
      throw new Error('LocalStorageService: userId not set');
    }

    const prefixedKey = `user_${userId}_${key}`;
    try {
      localStorage.setItem(prefixedKey, JSON.stringify(value));
      if (!environment.production) {
        console.log(`[LocalStorageService] Stored: ${prefixedKey}`);
      }
    } catch (error) {
      console.error(
        `[LocalStorageService] Failed to store ${prefixedKey}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Retrieve user-specific data
   * @param key - Storage key
   * @returns Parsed value or null if not found
   * @throws Error if userId is not set
   */
  getItem<T>(key: string): T | null {
    const userId = this.userIdSignal();
    if (userId === null) {
      console.error(
        `[LocalStorageService] Cannot get '${key}' - no userId set. Call setUserId() first.`
      );
      return null;
    }

    const prefixedKey = `user_${userId}_${key}`;
    try {
      const item = localStorage.getItem(prefixedKey);
      if (item === null) {
        if (!environment.production) {
          console.log(`[LocalStorageService] Key not found: ${prefixedKey}`);
        }
        return null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(
        `[LocalStorageService] Failed to parse ${prefixedKey}:`,
        error
      );
      return null;
    }
  }

  /**
   * Remove user-specific item
   * @param key - Storage key
   */
  removeItem(key: string): void {
    const userId = this.userIdSignal();
    if (userId === null) {
      console.error(
        `[LocalStorageService] Cannot remove '${key}' - no userId set.`
      );
      return;
    }

    const prefixedKey = `user_${userId}_${key}`;
    localStorage.removeItem(prefixedKey);
    if (!environment.production) {
      console.log(`[LocalStorageService] Removed: ${prefixedKey}`);
    }
  }

  /**
   * Clear ALL data for the current user (called on logout)
   */
  clearUserData(): void {
    const userId = this.userIdSignal();
    if (userId === null) {
      console.warn(
        '[LocalStorageService] clearUserData called but no userId set'
      );
      return;
    }

    const prefix = `user_${userId}_`;
    const keysToRemove: string[] = [];

    // Find all keys for this user
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }

    // Remove all user-specific keys
    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
      if (!environment.production) {
        console.log(`[LocalStorageService] Cleared user data: ${key}`);
      }
    });

    if (!environment.production) {
      console.log(
        `[LocalStorageService] Cleared ${keysToRemove.length} items for user ${userId}`
      );
    }
  }

  /**
   * Store global app-wide data (not user-specific)
   * @param key - Storage key
   * @param value - Value to store
   */
  setGlobalItem<T>(key: string, value: T): void {
    const prefixedKey = `app_${key}`;
    try {
      localStorage.setItem(prefixedKey, JSON.stringify(value));
      if (!environment.production) {
        console.log(`[LocalStorageService] Stored global: ${prefixedKey}`);
      }
    } catch (error) {
      console.error(
        `[LocalStorageService] Failed to store global ${prefixedKey}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Retrieve global app-wide data
   * @param key - Storage key
   * @returns Parsed value or null if not found
   */
  getGlobalItem<T>(key: string): T | null {
    const prefixedKey = `app_${key}`;
    try {
      const item = localStorage.getItem(prefixedKey);
      if (item === null) {
        return null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(
        `[LocalStorageService] Failed to parse global ${prefixedKey}:`,
        error
      );
      return null;
    }
  }

  /**
   * Remove global app-wide item
   * @param key - Storage key
   */
  removeGlobalItem(key: string): void {
    const prefixedKey = `app_${key}`;
    localStorage.removeItem(prefixedKey);
    if (!environment.production) {
      console.log(`[LocalStorageService] Removed global: ${prefixedKey}`);
    }
  }

  /**
   * Check if a user-specific key exists
   */
  hasItem(key: string): boolean {
    const userId = this.userIdSignal();
    if (userId === null) return false;
    const prefixedKey = `user_${userId}_${key}`;
    return localStorage.getItem(prefixedKey) !== null;
  }

  /**
   * Get all keys for the current user
   */
  getUserKeys(): string[] {
    const userId = this.userIdSignal();
    if (userId === null) return [];

    const prefix = `user_${userId}_`;
    const userKeys: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        // Return the unprefixed key
        userKeys.push(key.replace(prefix, ''));
      }
    }

    return userKeys;
  }
}
