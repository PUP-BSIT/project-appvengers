import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts$ | async; track toast.id) {
        <div class="toast" [ngClass]="toast.type" [@slideIn]>
          <i [ngClass]="toast.icon"></i>
          <div class="toast-content">
            <strong class="toast-title">{{ toast.title }}</strong>
            <p class="toast-message">{{ toast.message }}</p>
          </div>
          @if (toast.action) {
            <button 
              class="toast-action" 
              (click)="handleAction(toast)">
              {{ toast.action.label }}
            </button>
          }
          <button 
            class="toast-dismiss" 
            (click)="toastService.dismiss(toast.id)"
            title="Dismiss">
            <i class="fas fa-times"></i>
          </button>
        </div>
      }
    </div>
  `,
  styleUrl: './toast.scss'
})
export class ToastContainer {
  toastService = inject(ToastService);

  handleAction(toast: { id: number; action?: { callback: () => void } }): void {
    if (toast.action) {
      toast.action.callback();
      this.toastService.dismiss(toast.id);
    }
  }
}
