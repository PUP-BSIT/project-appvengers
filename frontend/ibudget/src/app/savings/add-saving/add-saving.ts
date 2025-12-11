import { Component, inject, OnInit, output, signal, } from '@angular/core';
import { Sidebar } from "../../sidebar/sidebar";
import { Header } from "../../header/header";
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Saving } from '../../../models/user.model';
import { SavingsService } from '../../../services/savings.service';

@Component({
  selector: 'app-add-saving',
  imports: [Sidebar, Header, RouterLink, ReactiveFormsModule],
  templateUrl: './add-saving.html',
  styleUrl: './add-saving.scss',
})
export class AddSaving implements OnInit {
  savingService = inject(SavingsService);
  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  addSavingForm: FormGroup;
  formBuilder = inject(FormBuilder);
  currentSaving = signal(<Saving>{});
  savingsLength = signal(1);
  dateNow = new Date().toISOString().split('T')[0];

  constructor() {
    this.addSavingForm = this.formBuilder.group({
      // savings_id: [''],
      name: ['',  {
        validators: [Validators.required]
      }],
      goal_date: [this.dateNow, {
        validators: [Validators.required]
      }],
      frequency: ['', {
        validators: [Validators.required]
      }],
      target_amount: [Number(0), {
        validators: [Validators.required, Validators.min(1)]
      }],
      current_amount: [Number(0)],
      description: [''],
      created_at: [''],
      updated_at: [''],
      deleted_at: ['']
    });
  }

  ngOnInit(): void {
    this.getSavingsLength();

    this.addSavingForm = this.formBuilder.group({
      name: ['', {
        validators: [Validators.required]
      }],
      goal_date: [this.dateNow, {
        validators: [Validators.required]
      }],
      frequency: ['', {
        validators: [Validators.required]
      }],
      target_amount: [Number(0), {
        validators: [Validators.required, Validators.min(1)]
      }],
      current_amount: [Number(0)],
      description: [''],
      created_at: [this.dateNow],
      updated_at: [this.dateNow],
      deleted_at: ['']
    });
  }

  getSavingsLength() {
    this.savingService.getSavings().subscribe((savingsData) => {
      this.savingsLength.set(savingsData.length);
    });
  }

  addSaving() {
    const newSaving = this.addSavingForm.value as Saving;

    // Validate form using FormGroup, not the value object
    if (!this.addSavingForm.valid) {
      this.addSavingForm.markAllAsTouched();
      console.error('Form is invalid');
      return;
    }
    
    this.savingService.addSaving(newSaving)
      .subscribe({
        next: () => {
          // Navigate to savings with success toast state
          this.router.navigate(['/savings'], 
            { 
              state: { 
                toastMessage: 'Saving added successfully!', 
                toastType: 'success' 
            } 
          });
        },
        error: (err) => {
          console.error('Error adding saving:', err);
          this.router.navigate(['/savings'], 
            { 
              state: { 
                toastMessage: 'Error adding saving. Please try again.', 
                toastType: 'error' 
            } 
          });
        }
      });
  }
}