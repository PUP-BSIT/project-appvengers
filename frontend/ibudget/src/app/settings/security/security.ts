import { Component, inject, signal, ViewChild, ElementRef, OnInit, computed } from '@angular/core';
import { Header } from "../../header/header";
import { SubHeader } from "../sub-header/sub-header";
import { Router } from '@angular/router';
import { 
    FormGroup, 
    ReactiveFormsModule, 
    FormBuilder,
    Validators
  } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { CommonModule } from '@angular/common';
import { ToggleableSidebar } from "../../toggleable-sidebar/toggleable-sidebar";

declare var bootstrap: any;

@Component({
  selector: 'app-security',
  imports: [Header, ReactiveFormsModule, SubHeader, CommonModule, ToggleableSidebar],
  templateUrl: './security.html',
  styleUrl: './security.scss',
})
export class Security implements OnInit {
  securitySettingsForm: FormGroup;
  deactivateForm: FormGroup;
  deleteForm: FormGroup;
  
  formBuilder = inject(FormBuilder);
  authService = inject(AuthService);
  userService = inject(UserService);
  router = inject(Router);
  
hideCurrentPassword = signal(true);
  hideNewPassword = signal(true);
  hideConfirmPassword = signal(true);
  hideDeactivatePassword = signal(true);
  hideDeletePassword = signal(true);
  
  // Password strength tracking
  passwordStrength = signal<{ score: number; label: string; color: string }>({ 
    score: 0, 
    label: '', 
    color: '' 
  });
  
  // OAuth detection
  isOAuthUser = signal(false);
  userEmail = signal('');
  
  // Status flags
  isSubmitting = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  
  // Modal references
  @ViewChild('deactivateModal') deactivateModalRef!: ElementRef;
  @ViewChild('deleteModal') deleteModalRef!: ElementRef;
  
  private deactivateModal: any;
  private deleteModal: any;

  constructor() {
    this.securitySettingsForm = this.formBuilder.group({
      current_password: ['', {
        validators: [Validators.required]
      }],
      new_password: ['', {
        validators: [Validators.required, Validators.minLength(8)]
      }],
      confirm_password: ['', {
        validators: [Validators.required]
      }]
    });
    
    // Initialize forms - validators will be set dynamically based on user type
    this.deactivateForm = this.formBuilder.group({
      password: [''],
      reason: ['', Validators.required],
      confirmEmail: ['']
    });
    
    this.deleteForm = this.formBuilder.group({
      password: [''],
      reason: ['', Validators.required],
      confirmEmail: ['']
    });
  }
  
  ngOnInit(): void {
    this.loadUserProfile();
  }
  
  loadUserProfile(): void {
    this.authService.getProfile().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.isOAuthUser.set(!res.data.hasPassword);
          this.userEmail.set(res.data.email);
          this.updateFormValidators();
        }
      },
      error: (err) => {
        console.error('Failed to load user profile', err);
      }
    });
  }
  
  updateFormValidators(): void {
    if (this.isOAuthUser()) {
      // OAuth user: require email confirmation
      this.deactivateForm.get('password')?.clearValidators();
      this.deactivateForm.get('confirmEmail')?.setValidators([Validators.required, Validators.email]);
      
      this.deleteForm.get('password')?.clearValidators();
      this.deleteForm.get('confirmEmail')?.setValidators([Validators.required, Validators.email]);
    } else {
      // Local user: require password
      this.deactivateForm.get('password')?.setValidators([Validators.required]);
      this.deactivateForm.get('confirmEmail')?.clearValidators();
      
      this.deleteForm.get('password')?.setValidators([Validators.required]);
      this.deleteForm.get('confirmEmail')?.clearValidators();
    }
    
    // Update validity
    this.deactivateForm.get('password')?.updateValueAndValidity();
    this.deactivateForm.get('confirmEmail')?.updateValueAndValidity();
    this.deleteForm.get('password')?.updateValueAndValidity();
    this.deleteForm.get('confirmEmail')?.updateValueAndValidity();
  }
  
  ngAfterViewInit() {
    if (this.deactivateModalRef) {
      this.deactivateModal = new bootstrap.Modal(this.deactivateModalRef.nativeElement);
    }
    if (this.deleteModalRef) {
      this.deleteModal = new bootstrap.Modal(this.deleteModalRef.nativeElement);
    }
  }

  get currentPassword() {
    return this.securitySettingsForm.get('current_password');
  }

  get newPassword() {
    return this.securitySettingsForm.get('new_password');
  }

  get confirmPassword() {
    return this.securitySettingsForm.get('confirm_password');
  }
  
  // Deactivate Form Getters
  get deactivatePassword() { return this.deactivateForm.get('password'); }
  get deactivateReason() { return this.deactivateForm.get('reason'); }
  get deactivateConfirmEmail() { return this.deactivateForm.get('confirmEmail'); }
  
  // Delete Form Getters
  get deletePassword() { return this.deleteForm.get('password'); }
  get deleteReason() { return this.deleteForm.get('reason'); }
  get deleteConfirmEmail() { return this.deleteForm.get('confirmEmail'); }
  
  // Email matching validators for OAuth users
  isDeactivateEmailMatching(): boolean {
    if (!this.isOAuthUser()) return true;
    return this.deactivateConfirmEmail?.value?.toLowerCase() === this.userEmail().toLowerCase();
  }
  
  isDeleteEmailMatching(): boolean {
    if (!this.isOAuthUser()) return true;
    return this.deleteConfirmEmail?.value?.toLowerCase() === this.userEmail().toLowerCase();
  }

  onSubmit(): void {
    // Clear previous messages
    this.successMessage.set(null);
    this.errorMessage.set(null);

    // Validate form
    if (this.securitySettingsForm.invalid) {
      Object.keys(this.securitySettingsForm.controls).forEach(key => {
        this.securitySettingsForm.get(key)?.markAsTouched();
      });
      return;
    }

    // Check if passwords match
    const formValue = this.securitySettingsForm.value;
    if (formValue.new_password !== formValue.confirm_password) {
      this.errorMessage.set('New password and confirm password do not match');
      return;
    }

    this.isSubmitting.set(true);

    const changePasswordData = {
      currentPassword: formValue.current_password,
      newPassword: formValue.new_password,
      confirmPassword: formValue.confirm_password
    };

    this.authService.changePassword(changePasswordData).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        if (response.success) {
          this.successMessage.set(response.message);
          this.securitySettingsForm.reset();
        } else {
          this.errorMessage.set(response.message);
        }
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          error.error?.message || 'Failed to change password. Please try again.'
        );
      }
    });
  }
  
  // Modal Actions
  openDeactivateModal() {
    this.deactivateForm.reset();
    this.deactivateModal.show();
  }
  
  closeDeactivateModal() {
    this.deactivateModal.hide();
  }
  
  openDeleteModal() {
    this.deleteForm.reset();
    this.deleteModal.show();
  }
  
  closeDeleteModal() {
    this.deleteModal.hide();
  }
  
  onDeactivateSubmit() {
    if (this.deactivateForm.invalid) {
      this.deactivateForm.markAllAsTouched();
      return;
    }
    
    // Additional validation for OAuth users
    if (this.isOAuthUser() && !this.isDeactivateEmailMatching()) {
      this.errorMessage.set('Email confirmation does not match your account email');
      return;
    }
    
    this.isSubmitting.set(true);
    
    // Build request based on user type
    const formValue = this.deactivateForm.value;
    const request = {
      reason: formValue.reason,
      password: this.isOAuthUser() ? undefined : formValue.password,
      confirmEmail: this.isOAuthUser() ? formValue.confirmEmail : undefined
    };
    
    this.userService.deactivateAccount(request).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.closeDeactivateModal();
        if (res.success) {
          this.authService.logout();
          this.router.navigate(['/login']);
        } else {
          this.errorMessage.set(res.message);
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.closeDeactivateModal();
        this.errorMessage.set(err.error?.message || 'Failed to deactivate account');
      }
    });
  }
  
  onDeleteSubmit() {
    if (this.deleteForm.invalid) {
      this.deleteForm.markAllAsTouched();
      return;
    }
    
    // Additional validation for OAuth users
    if (this.isOAuthUser() && !this.isDeleteEmailMatching()) {
      this.errorMessage.set('Email confirmation does not match your account email');
      return;
    }
    
    this.isSubmitting.set(true);
    
    // Build request based on user type
    const formValue = this.deleteForm.value;
    const request = {
      reason: formValue.reason,
      password: this.isOAuthUser() ? undefined : formValue.password,
      confirmEmail: this.isOAuthUser() ? formValue.confirmEmail : undefined
    };
    
this.userService.softDeleteAccount(request).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.closeDeleteModal();
        if (res.success) {
          this.authService.logout();
          this.router.navigate(['/login']);
        } else {
          this.errorMessage.set(res.message);
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.closeDeleteModal();
        this.errorMessage.set(err.error?.message || 'Failed to delete account');
      }
    });
  }
  
  /**
   * Calculate password strength based on various criteria
   */
  calculatePasswordStrength(password: string): void {
    if (!password) {
      this.passwordStrength.set({ score: 0, label: '', color: '' });
      return;
    }
    
    let score = 0;
    
    // Length checks
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    
    // Character type checks
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    
    // Normalize score to 0-4 range
    const normalizedScore = Math.min(Math.floor(score / 2), 4);
    
    const strengthLevels = [
      { label: 'Very Weak', color: '#ef4444' },
      { label: 'Weak', color: '#f59e0b' },
      { label: 'Fair', color: '#eab308' },
      { label: 'Good', color: '#22c55e' },
      { label: 'Strong', color: '#10b981' }
    ];
    
    const level = strengthLevels[normalizedScore];
    this.passwordStrength.set({ 
      score: normalizedScore, 
      label: level.label, 
      color: level.color 
    });
  }
  
  /**
   * Track password input changes for strength calculation
   */
  onNewPasswordInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.calculatePasswordStrength(input.value);
  }
}
