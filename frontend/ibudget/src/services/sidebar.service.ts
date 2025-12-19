import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  isOpen = signal(false);
  sidebarType = signal(this.getInitialSidebarType());

  private getInitialSidebarType(): string {
    if (typeof localStorage !== 'undefined') {
      const storedType = localStorage.getItem('sidebarType');
      if (storedType) {
        return storedType;
      }
    }
    return 'expandable'; // Default sidebar type
  }

  toggle() {
    this.isOpen.set(!this.isOpen());
  }

  getToggleState(): boolean {
    return this.isOpen();
  }

  setSidebarType(type: string) {
    this.sidebarType.set(type);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('sidebarType', type);
    }
  }

  getSidebarType(): string {
    return this.sidebarType();
  }
}
