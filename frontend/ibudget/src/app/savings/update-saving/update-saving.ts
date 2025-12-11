import { Component, inject, OnInit, signal } from '@angular/core';
import { Header } from "../../header/header";
import { Sidebar } from "../../sidebar/sidebar";
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SavingsService } from '../../../services/savings.service';
import { Saving } from '../../../models/user.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-update-saving',
  imports: [Header, Sidebar, RouterLink, ReactiveFormsModule],
  templateUrl: './update-saving.html',
  styleUrl: './update-saving.scss',
})
export class UpdateSaving implements OnInit{
  savingService = inject(SavingsService);
  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  updateSavingForm: FormGroup;
  formBuilder = inject(FormBuilder);
  currentSaving = signal(<Saving>{});
  savingId = signal(1);

  constructor() {
    this.updateSavingForm = this.formBuilder.group({
      name: ['', {
        validators: [Validators.required]
      }],
      goal_date: ['', {
        validators: [Validators.required]
      }],
      frequency: ['', {
        validators: [Validators.required]
      }],
      target_amount: ['', {
        validators: [Validators.required, Validators.min(1)]
      }],
      current_amount: [''],
      description: [''],
      created_at: [''],
      updated_at: [''],
      deleted_at: ['']
    });
  }

  ngOnInit(): void {
    const savingsId = this.activatedRoute.snapshot.paramMap.get('id') ?? '';
    this.savingId.set(+savingsId);
    this.getSavingsData();
  }

  getSavingsData() {
    this.savingService.getSavingById(+this.savingId())
      .subscribe((savingData) => {
        this.updateSavingForm.setValue({
          name: savingData.name,
          goal_date: savingData.goal_date,
          frequency: savingData.frequency,
          target_amount: Number(savingData.target_amount),
          current_amount: Number(savingData.current_amount),
          description: savingData.description,
          created_at: savingData.created_at,
          updated_at: savingData.updated_at,
          deleted_at: savingData.deleted_at
      });
    });
  }

  updateSaving() {
    const updatedSaving = this.updateSavingForm.value as Saving;

    if (!this.updateSavingForm.valid) {
      this.updateSavingForm.markAllAsTouched();
      console.error('Form is invalid');
      return;
    };

    this.savingService.updateSaving(this.savingId(), updatedSaving)
      .subscribe({
        next: () => {
          this.router.navigate(['/savings'], 
            { 
              state: { 
                toastMessage: 'Saving updated successfully!',
                toastType: 'success' 
            } 
          });
        },
        error: (err) => {
        console.error('Error updating saving:', err);

        this.router.navigate(['/savings'], 
          { 
            state: { 
              toastMessage: 'Error updating saving. Please try again.',
              toastType: 'error' 
          } 
        });
      }
    });
  }
}
