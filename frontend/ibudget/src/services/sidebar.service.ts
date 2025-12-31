import { Injectable, signal, inject, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class SidebarService implements OnDestroy {
  private authService: AuthService | null = inject(AuthService, { optional: true });
  private router = inject(Router);
  private routerSub: Subscription;

  isOpen = signal(false);
  sidebarType = signal('expandable');

  constructor() {
    // Re-initialize state on every navigation change to 
    // ensure the correct user's settings are loaded.
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.initializeSidebarType();
      this.isOpen.set(false); // Close sidebar on every navigation
    });
  }

  private getUserEmailFromToken(): string | null {
    // Prefer token from AuthService when available, otherwise read directly
    // from localStorage. Making AuthService optional prevents tests from
    // failing when `_HttpClient` (used by AuthService) isn't provided.
    const token = this.authService ? this.authService.getToken() :
      (typeof localStorage !== 'undefined' ? 
          localStorage.getItem('iBudget_authToken') : null);
    if (!token) {
      return null;
    }
    try {
      // The 'sub' claim in the JWT contains the user's email.
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub;
    } catch (e) {
      console.error('Error decoding JWT token:', e);
      return null;
    }
  }

  private initializeSidebarType(): void {
    const userEmail = this.getUserEmailFromToken();
    if (typeof localStorage !== 'undefined' && userEmail) {
      const storedType = localStorage.getItem(`sidebarType_${userEmail}`);
      if (storedType) {
        this.sidebarType.set(storedType);
      } else {
        this.sidebarType.set('expandable');
      }
    } else {
      // If no user is logged in, reset to default.
      this.sidebarType.set('expandable');
    }
  }

  setSidebarType(type: string) {
    this.sidebarType.set(type);
    const userEmail = this.getUserEmailFromToken();
    if (typeof localStorage !== 'undefined' && userEmail) {
      localStorage.setItem(`sidebarType_${userEmail}`, type);
    }
  }

  toggle() {
    this.isOpen.set(!this.isOpen());
  }

  getToggleState(): boolean {
    return this.isOpen();
  }

  getSidebarType(): string {
    return this.sidebarType();
  }

  ngOnDestroy(): void {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }
}
