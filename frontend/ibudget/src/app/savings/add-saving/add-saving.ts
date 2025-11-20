import { Component, inject, OnInit, signal } from '@angular/core';
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

  constructor() {
    this.addSavingForm = this.formBuilder.group({
      savings_id: [''],
      user_id: [1],
      name: [''],
      goal_date: [''],
      frequency: [''],
      target_amount: [''],
      current_amount: [0],
      created_at: [''],
      updated_at: [''],
      deleted_at: ['']
    });
  }

  ngOnInit(): void {
    this.getSavingsLength();

    const newSavingId = this.savingsLength() + 1;

    this.addSavingForm = this.formBuilder.group({
      savings_id: [newSavingId],
      user_id: [1],
      name: [''],
      goal_date: [''],
      frequency: [''],
      target_amount: [''],
      current_amount: [0],
      created_at: [''],
      updated_at: [''],
      deleted_at: ['']
    });

    console.log('New Saving ID:', newSavingId);
  }

  getSavingsLength() {
    this.savingService.getSavings().subscribe((savingsData) => {
      this.savingsLength.set(savingsData.length);
    });
  }

  addSaving() {
    this.savingService.addSaving(this.addSavingForm.value)
      .subscribe((newSaving) => {
        console.log('New saving added:', newSaving);
        this.router.navigate(['/savings']);
      });
  }
}