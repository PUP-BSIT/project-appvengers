import { Component, ElementRef, inject, input, output, signal, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Modal } from 'bootstrap';
import { SavingTransaction } from '../../../../models/user.model';
import { HistoryService } from '../../../../services/history';

@Component({
  selector: 'app-update-saving-transaction',
  imports: [ReactiveFormsModule],
  templateUrl: './update-saving-transaction.html',
  styleUrl: './update-saving-transaction.scss',
})
export class UpdateSavingTransaction {
  @ViewChild('updateSavingTransactionModal') updateSavingTransactionModal!: ElementRef;
  @ViewChild('openUpdateSavingTransactionModalBtn') 
    openUpdateSavingTransactionModalBtn!: ElementRef<HTMLButtonElement>;
  transactionForm: FormGroup;
  formBuilder = inject(FormBuilder);
  activatedRoute = inject(ActivatedRoute);
  historyService = inject(HistoryService);
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
      created_at: ['', {
        validators: [Validators.required]
      }],
      updated_at: ['', {
        validators: [Validators.required]
      }],
      deleted_at: ['']
    });
  }

  ngOnInit(): void {
    const currentTransactionId = this.transactionId();
    const savingId = this.activatedRoute.snapshot.paramMap.get('id') ?? '';
    this.savingId.set(+savingId);

    this.transactionForm = this.formBuilder.group({
      transaction_id: [currentTransactionId],
      savings_id: [+savingId],
      user_id: [this.tempUserId()],
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
      created_at: ['', {
        validators: [Validators.required]
      }],
      updated_at: ['', {
        validators: [Validators.required]
      }],
      deleted_at: ['']
    });
  }
  
   openModal() {
      const modal = new Modal(this.updateSavingTransactionModal.nativeElement);
      modal.show();
    }
  
    closeModal() {
      const modal = Modal.getInstance(this.updateSavingTransactionModal.nativeElement);
      modal?.hide();
  
      this.transactionForm.reset();
      this.openUpdateSavingTransactionModalBtn.nativeElement.focus();
    }

    openUpdateModalWithData() {
      if(!this.transactionId()) return;

      this.openModal();
      this.historyService.getSavingTransactionsBySavingId(this.savingId(), this.transactionId())
        .subscribe((transactions: SavingTransaction[]) => {
          if(transactions.length === 0) return;
          const transaction = transactions[0];

          this.transactionForm.setValue({
            transaction_id: transaction.transaction_id,
            savings_id: transaction.savings_id,
            user_id: transaction.user_id,
            amount: transaction.amount,
            savings_action: transaction.savings_action,
            transaction_date: transaction.transaction_date,
            description: transaction.description,
            created_at: transaction.created_at,
            updated_at: this.date(),
            deleted_at: transaction.deleted_at
          });
        });
    }

    updateTransaction() {
      this.historyService.updateSavingTransaction
        (this.savingId(), this.transactionId(), this.transactionForm.value)
          .subscribe(updatedTransactionData => {
            this.updatedTransaction.emit(updatedTransactionData);
            this.closeModal();
        });
    }
}
