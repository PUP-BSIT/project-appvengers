import { Component, inject, OnInit, signal } from '@angular/core';
import { ResendEmailService } from '../../services/resend-email.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-resend-verification',
  imports: [],
  templateUrl: './resend-verification.html',
  styleUrl: './resend-verification.scss',
})
export class ResendVerification implements OnInit{
  resendEmailService = inject(ResendEmailService);
  activatedRoute = inject(ActivatedRoute);
  userEmail = signal('');

  ngOnInit(): void {
    // react to query param changes (no full reload required)
    this.activatedRoute.queryParamMap.subscribe((params) => {
      const email = params.get('email') || '';
      // only send if email is present and different from previous to avoid duplicate sends
      if (email && email !== this.userEmail()) {
        this.userEmail.set(email);
        console.log('Resending verification email to:', this.userEmail());
        this.resendEmail(this.userEmail());
      }
    });
  }

  resendEmail(email: string) {
    this.resendEmailService.resendVerificationEmail(email)
      .subscribe({
        next: (response) => {
          console.log('Verification email resent successfully:', response);
        },
        error: (error) => {
          console.error('Error resending verification email:', error);
        }
      });
  }
}
