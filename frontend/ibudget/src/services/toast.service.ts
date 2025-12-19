import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  icon: string;
  duration?: number;
  action?: {
    label: string;
    callback: () => void;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$ = this.toastsSubject.asObservable();
  private idCounter = 0;

  /**
   * Show a toast notification
   * @param toast Toast configuration (without id)
   * @returns The id of the created toast
   */
  show(toast: Omit<Toast, 'id'>): number {
    const id = ++this.idCounter;
    const newToast: Toast = { ...toast, id };

    this.toastsSubject.next([...this.toastsSubject.value, newToast]);

    // Auto-dismiss after duration (default 5 seconds)
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }

    return id;
  }

  /**
   * Dismiss a specific toast by id
   */
  dismiss(id: number): void {
    const toasts = this.toastsSubject.value.filter(t => t.id !== id);
    this.toastsSubject.next(toasts);
  }

  /**
   * Dismiss all toasts
   */
  dismissAll(): void {
    this.toastsSubject.next([]);
  }

  /**
   * Convenience method for info toast
   */
  info(title: string, message: string, action?: Toast['action']): number {
    return this.show({
      title,
      message,
      type: 'info',
      icon: 'fas fa-info-circle',
      action
    });
  }

  /**
   * Convenience method for success toast
   */
  success(title: string, message: string, action?: Toast['action']): number {
    return this.show({
      title,
      message,
      type: 'success',
      icon: 'fas fa-check-circle',
      action
    });
  }

  /**
   * Convenience method for warning toast
   */
  warning(title: string, message: string, action?: Toast['action']): number {
    return this.show({
      title,
      message,
      type: 'warning',
      icon: 'fas fa-exclamation-triangle',
      action
    });
  }

  /**
   * Convenience method for error toast
   */
  error(title: string, message: string, action?: Toast['action']): number {
    return this.show({
      title,
      message,
      type: 'error',
      icon: 'fas fa-times-circle',
      action
    });
  }
}
