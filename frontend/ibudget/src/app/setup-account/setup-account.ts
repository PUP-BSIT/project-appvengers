import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, 
    FormBuilder, 
    Validators} from '@angular/forms';

@Component({
  selector: 'app-setup-account',
  imports: [ReactiveFormsModule],
  templateUrl: './setup-account.html',
  styleUrl: './setup-account.scss'
})
export class SetupAccount {
  setupAccountForm: FormGroup;
  formBuilder = inject(FormBuilder);
  isDisabled = signal(true); 

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

  checkFields() {
    if(this.setupAccountForm.valid) {
      this.isDisabled.set(false);
    } else {
      this.isDisabled.set(true);
    }
  }
}
