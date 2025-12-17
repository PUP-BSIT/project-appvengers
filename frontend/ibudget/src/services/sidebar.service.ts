import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  isOpen = signal(false);
  sidebarType = signal('expandable');

  toggle() {
    this.isOpen.set(!this.isOpen());
  }

  setSidebarType(type: string) {
    this.sidebarType.set(type);
    console.log(`Sidebar type set to: ${type}`);
  }

  getSidebarType(): string {
    return this.sidebarType();
  }
}
