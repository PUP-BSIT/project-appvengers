import { Component, inject, OnInit, signal } from '@angular/core';
import { Header } from "../../header/header";
import { Sidebar } from "../../sidebar/sidebar";
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SavingsService } from '../../../services/savings.service';
import { Saving } from '../../../models/user.model';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

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
      saving_id: [''],
      user_id: [''],
      name: [''],
      goal_date: [''],
      frequency: [''],
      target_amount: [''],
      current_amount: [0],
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

    this.updateSavingForm = this.formBuilder.group({
      saving_id: [this.savingId()],
      user_id: [this.currentSaving().user_id],
      name: [this.currentSaving().name],
      goal_date: [this.currentSaving().goal_date],
      frequency: [this.currentSaving().frequency],
      target_amount: [this.currentSaving().target_amount],
      current_amount: [this.currentSaving().current_amount],
      description: [this.currentSaving().description],
      created_at: [this.currentSaving().created_at],
      updated_at: [this.currentSaving().updated_at],
      deleted_at: [this.currentSaving().deleted_at]
    });
  }

  getSavingsData() {
    this.savingService.getSavingById(this.savingId())
      .subscribe((savingData) => {
        this.currentSaving.set(savingData);
    });
  }

  updateSaving() {
    this.savingService.updateSaving(this.savingId(), this.updateSavingForm.value)
      .subscribe(() => {
        this.getSavingsData();
        this.router.navigate(['/savings/view-saving', this.savingId()]);
      });
  }
}
