import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, 
    FormBuilder, 
    Validators} from '@angular/forms';
import { SetupAccountService } from '../../services/setup-account.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

@Component({
  selector: 'app-setup-account',
  imports: [ReactiveFormsModule],
  templateUrl: './setup-account.html',
  styleUrl: './setup-account.scss'
})
export class SetupAccount implements OnInit {
  setupAccountForm: FormGroup;
  formBuilder = inject(FormBuilder);
  setupAccountService = inject(SetupAccountService);
  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  userToken = signal('');
  username = signal('');
  isDisabled = signal(true); 
  isAlertShown = signal(false);
  alertType = signal<'success' | 'danger'>('danger');
  alertMessage = signal('');

  constructor() {
    this.setupAccountForm = this.formBuilder.group( {
      firstName: ['', {
        validators: [Validators.required]
      }],
      middleName: [''],
      lastName: ['', {
        validators: [Validators.required]
      }],
      birthdate: ['', {
        validators: [Validators.required]
      }],
      gender: ['', {
        validators: [Validators.required]
      }]
    });
  }

  ngOnInit(): void {
    // Get token and username from URL parameters
    this.getUserTokenWithUsername(); 
  }

  get firstName() {
    return this.setupAccountForm.get('firstName');
  }

  get lastName() {
    return this.setupAccountForm.get('lastName');
  }

  get birthdate() {
    return this.setupAccountForm.get('birthdate');
  }

  get gender() {
    return this.setupAccountForm.get('gender');
  }

  getUserTokenWithUsername() {
    this.activatedRoute.queryParams.subscribe((params) => {
      const tokenValue = params['token'];
      const usernameValue = params['username'];
      this.userToken.set(tokenValue || '');
      this.username.set(usernameValue || '');
    })
  }

  submitForm() {
    const formValue = this.setupAccountForm;

    if (formValue.valid) {
      this.isAlertShown.set(false);

      this.setupAccountService
        .verifyAccountSetupToken(this.userToken(), this.username(), formValue.value)
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.alertType.set('success');
              this.alertMessage.set('Account setup verified successfully.');

              setTimeout(() => {
                this.router.navigate(['/login-page']);
              }, 2000);
            } else {
              this.alertType.set('danger');
              this.alertMessage.set(response.message || 'Failed to verify account.');
            }
            this.isAlertShown.set(true);
          },
          error: () => {
            this.alertType.set('danger');
            this.alertMessage.set('Server error. Please try again later.');
            this.isAlertShown.set(true);
          }
        });
    } else {
      this.alertType.set('danger');
      this.alertMessage.set('Please fill all required fields to continue.');
      this.isAlertShown.set(true);
    }
  }
}
