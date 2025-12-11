import { Component, inject, OnInit, output, signal, } from '@angular/core';
import { Sidebar } from "../../sidebar/sidebar";
import { Header } from "../../header/header";
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
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
      name: [''],
      goal_date: [this.dateNow],
      frequency: [''],
      target_amount: [Number(0)],
      current_amount: [Number(0)],
      description: [''],
      created_at: [''],
      updated_at: [''],
      deleted_at: ['']
    });
  }

  ngOnInit(): void {
    this.getSavingsLength();

    // const newSavingId = this.savingsLength() + 1;

    this.addSavingForm = this.formBuilder.group({
      // savings_id: [newSavingId],
      name: [''],
      goal_date: [this.dateNow],
      frequency: [''],
      target_amount: [Number(0)],
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
    const newSaving: Saving = this.addSavingForm.value;
    
    this.savingService.addSaving(newSaving)
      .subscribe({
        next: () => {
          // Navigate to savings with success toast state
          this.router.navigate(['/savings'], 
            { state: { toastMessage: 'Saving added successfully!' } });
        }
      });
  }
}