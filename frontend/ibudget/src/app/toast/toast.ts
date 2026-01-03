import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';
import { trigger, state, style, transition, animate } from '@angular/animations';

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
  styleUrl: './toast.scss',
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ]
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
