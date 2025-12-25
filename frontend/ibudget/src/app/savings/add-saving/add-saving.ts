import { Component, inject, OnInit, output, signal, } from '@angular/core';
import { Header } from "../../header/header";
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Saving } from '../../../models/user.model';
import { SavingsService } from '../../../services/savings.service';
import { ToggleableSidebar } from "../../toggleable-sidebar/toggleable-sidebar";
import { ToastService } from '../../../services/toast.service';

/**
 * Parses flexible date formats from chatbot deep links.
 * Handles: YYYY, YYYY-MM, YYYY-MM-DD
 * 
 * @param dateStr - The date string from query params
 * @param defaultToToday - If true, defaults to today for current year; if false, defaults to Jan 1st
 * @returns Valid YYYY-MM-DD string or empty string if unparseable
 */
function parseFlexibleDate(dateStr: string | undefined, defaultToToday = false): string {
  if (!dateStr) return '';
  
  const today = new Date();
  const currentYear = today.getFullYear();
  
  // Already valid YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  // Year-month format: YYYY-MM → YYYY-MM-01
  if (/^\d{4}-\d{2}$/.test(dateStr)) {
    return `${dateStr}-01`;
  }
  
  // Year only format: YYYY
  if (/^\d{4}$/.test(dateStr)) {
    const year = parseInt(dateStr, 10);
    
    // If current year and defaultToToday is true, return today's date
    if (year === currentYear && defaultToToday) {
      return today.toISOString().split('T')[0];
    }
    
    // Otherwise default to January 1st of that year
    return `${dateStr}-01-01`;
  }
  
  // Unparseable format - return empty (caller should handle default)
  return '';
}

@Component({
  selector: 'app-add-saving',
  imports: [Header, RouterLink, ReactiveFormsModule, ToggleableSidebar],
  templateUrl: './add-saving.html',
  styleUrl: './add-saving.scss',
})
export class AddSaving implements OnInit {
  savingService = inject(SavingsService);
  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  toastService = inject(ToastService);
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
      header_color: [''],
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
      header_color: [''],
      created_at: [this.dateNow],
      updated_at: [this.dateNow],
      deleted_at: ['']
    });

    // Handle query params from chatbot deep links
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['name'] || params['targetAmount'] || params['description']) {
        this.prefillFormFromParams(params);
        // Show toast notification when Bonzi pre-fills the form
        this.toastService.info(
          'Bonzi Pre-fill',
          'Please review the form carefully before submitting.'
        );
      }
    });
  }

  /**
   * Pre-fills the add saving form from query params (chatbot deep links).
   * Supports: name, targetAmount, frequency, goalDate, description
   */
  private prefillFormFromParams(params: Record<string, string>): void {
    // Parse target amount
    const targetAmount = params['targetAmount'] ? parseFloat(params['targetAmount']) : 0;

    // Parse goal date - use flexible parsing for chatbot deep links
    // Handles: YYYY, YYYY-MM, YYYY-MM-DD formats
    // For savings goals, default to January 1st (not today) for future year targets
    const goalDate = parseFlexibleDate(params['goalDate'], false);

    // Validate frequency value
    const validFrequencies = ['Daily', 'Weekly', 'Monthly'];
    let frequency = '';
    if (params['frequency']) {
      const paramFreq = params['frequency'].charAt(0).toUpperCase() + 
                        params['frequency'].slice(1).toLowerCase();
      if (validFrequencies.includes(paramFreq)) {
        frequency = paramFreq;
      }
    }

    // Patch form values - always set goal_date (empty if not provided for chatbot deep links)
    const patchData: any = {
      name: params['name'] || '',
      target_amount: isNaN(targetAmount) ? 0 : targetAmount,
      frequency: frequency,
      description: params['description'] || '',
      // Clear goal_date when not provided (chatbot deep links without deadline)
      goal_date: goalDate || ''
    };
    
    this.addSavingForm.patchValue(patchData);
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