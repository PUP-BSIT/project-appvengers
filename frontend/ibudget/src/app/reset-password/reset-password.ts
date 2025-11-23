import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
  standalone: true
})
export class ResetPassword implements OnInit {
  resetPasswordForm: FormGroup;
  token = signal('');
  tokenValid = signal(false);
  loading = signal(true);
  submitting = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  hideNewPassword = signal(true);
  hideConfirmPassword = signal(true);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit() {
    // Get token from URL query params
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.token.set(token);
        this.validateToken(token);
      } else {
        this.loading.set(false);
        this.errorMessage.set('Invalid password reset link');
      }
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (!newPassword || !confirmPassword) {
      return null;
    }

    return newPassword.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  get newPassword() {
    return this.resetPasswordForm.get('newPassword');
  }

  get confirmPassword() {
    return this.resetPasswordForm.get('confirmPassword');
  }

  validateToken(token: string) {
    this.authService.validateResetToken(token).subscribe({
      next: (response) => {
        this.tokenValid.set(response.success);
        this.loading.set(false);
        if (!response.success) {
          this.errorMessage.set(response.message);
        }
      },
      error: (error) => {
        this.tokenValid.set(false);
        this.loading.set(false);
        this.errorMessage.set(error.error?.message || 'Invalid or expired reset token');
      }
    });
  }

  onSubmit() {
    if (this.resetPasswordForm.invalid) {
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    const request = {
      token: this.token(),
      newPassword: this.resetPasswordForm.value.newPassword,
      confirmPassword: this.resetPasswordForm.value.confirmPassword
    };

    this.authService.resetPassword(request).subscribe({
      next: (response) => {
        this.submitting.set(false);
        if (response.success) {
          this.successMessage.set(response.message);
          // Redirect to login after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        } else {
          this.errorMessage.set(response.message);
        }
      },
      error: (error) => {
        this.submitting.set(false);
        this.errorMessage.set(error.error?.message || 'Failed to reset password. Please try again.');
      }
    });
  }
}
