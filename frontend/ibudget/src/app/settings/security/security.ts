import { Component, inject, signal, ViewChild, ElementRef } from '@angular/core';
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
export class Security {
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
    
    this.deactivateForm = this.formBuilder.group({
      password: ['', Validators.required],
      reason: ['', Validators.required]
    });
    
    this.deleteForm = this.formBuilder.group({
      password: ['', Validators.required],
      reason: ['', Validators.required]
    });
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
  
  // Delete Form Getters
  get deletePassword() { return this.deleteForm.get('password'); }
  get deleteReason() { return this.deleteForm.get('reason'); }

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
    
    this.isSubmitting.set(true);
    
    this.userService.deactivateAccount(this.deactivateForm.value).subscribe({
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
    
    this.isSubmitting.set(true);
    
    this.userService.softDeleteAccount(this.deleteForm.value).subscribe({
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
}
