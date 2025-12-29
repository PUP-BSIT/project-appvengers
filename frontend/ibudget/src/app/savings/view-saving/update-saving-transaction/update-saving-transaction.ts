import { Component, ElementRef, inject, input, output, signal, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Modal } from 'bootstrap';
import { SavingTransaction } from '../../../../models/user.model';
import { HistoryService } from '../../../../services/history';
import { SavingTransactionService } from '../../../../services/saving-transaction.service';

@Component({
  selector: 'app-update-saving-transaction',
  imports: [ReactiveFormsModule],
  templateUrl: './update-saving-transaction.html',
  styleUrl: './update-saving-transaction.scss',
})
export class UpdateSavingTransaction {
  @ViewChild('updateSavingTransactionModal') updateSavingTransactionModal!: ElementRef;

  transactionForm: FormGroup;
  formBuilder = inject(FormBuilder);
  activatedRoute = inject(ActivatedRoute);
  historyService = inject(HistoryService);
  savingTransactionService = inject(SavingTransactionService);
  transactionsLength = input(<number>(0));
  updatedTransaction = output<SavingTransaction>();
  tempUserId = signal(1);
  savingId = signal(1);
  transactionId = input(<number>(0));
  date = signal(new Date().toISOString().split('T')[0]);

  constructor() {
    this.transactionForm = this.formBuilder.group({
      transaction_id: [''],
      saving_id: [''],
      user_id: [''],
      amount: [0, {
        validators: [Validators.required]
      }],
      savings_action: ['', {
        validators: [Validators.required]
      }],
      transaction_date: ['', {
        validators: [Validators.required]
      }],
      description: [''],
    });
  }

  ngOnInit(): void {
    const currentTransactionId = this.transactionId();
    const savingId = this.activatedRoute.snapshot.paramMap.get('id') ?? '';
    this.savingId.set(+savingId);

    this.transactionForm = this.formBuilder.group({
      transaction_id: [currentTransactionId],
      savings_id: [+savingId],
      amount: [0, {
        validators: [Validators.required]
      }],
      savings_action: ['', {
        validators: [Validators.required]
      }],
      transaction_date: ['', {
        validators: [Validators.required]
      }],
      description: [''],
    });
  }
  
   openModal() {
      const modal = Modal.getOrCreateInstance(this.updateSavingTransactionModal.nativeElement);
      modal.show();
    }
  
    closeModal() {
      const modal = Modal.getInstance(this.updateSavingTransactionModal.nativeElement);
      modal?.hide();
  
      this.transactionForm.reset();
    }

    openUpdateModalWithData(id?: number) {
      const transactionIdToUse = id ?? this.transactionId();
      if(!transactionIdToUse) return;

      this.openModal();
      this.savingTransactionService.getSavingTransactionByTransactionId
        (this.savingId(), transactionIdToUse)
          .subscribe({
            next: (transactionData) => {
              this.transactionForm.patchValue({
                transaction_id: transactionData.id,
                savings_id: transactionData.savings_id,
                user_id: transactionData.user_id,
                amount: transactionData.amount,
                savings_action: transactionData.savings_action,
                transaction_date: transactionData.transaction_date?.split('T')[0],
                description: transactionData.description,
              });
            }
          })
    }

    updateTransaction() {
      if (this.transactionForm.invalid) {
        this.transactionForm.markAllAsTouched();
        return;
      }

      this.savingTransactionService.updateSavingTransaction(
        this.savingId(),
        this.transactionForm.value.transaction_id,
        this.transactionForm.value
      ).subscribe({
        next: (updatedTransaction) => {
          this.updatedTransaction.emit(updatedTransaction);
          this.closeModal();
        },
        error: (err) => {
          console.error('Error updating transaction:', err);
          this.closeModal();
        }
      });
    }
}
