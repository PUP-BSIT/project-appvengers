import { ActivatedRoute } from '@angular/router';
import { Modal } from 'bootstrap';
import { HistoryService } from '../../../../services/history';
import { 
    Component, 
    ElementRef, 
    inject, 
    input,
    OnInit, 
    output, 
    signal, 
    ViewChild 
  } from '@angular/core';
import { 
    ReactiveFormsModule ,
    FormBuilder,
    FormGroup,
    Validators
  } from '@angular/forms';
import { SavingTransaction } from '../../../../models/user.model';
import { SavingTransactionService } from '../../../../services/saving-transaction.service';

@Component({
  selector: 'app-add-saving-transaction',
  imports: [ReactiveFormsModule],
  templateUrl: './add-saving-transaction.html',
  styleUrl: './add-saving-transaction.scss',
})
export class AddSavingTransaction implements OnInit {
  @ViewChild('addSavingTransactionModal') addSavingTransactionModal!: ElementRef;
  @ViewChild('openSavingTransactionModalBtn') 
    openSavingTransactionModalBtn!: ElementRef<HTMLButtonElement>;
  transactionForm: FormGroup;
  formBuilder = inject(FormBuilder);
  activatedRoute = inject(ActivatedRoute);
  historyService = inject(HistoryService);
  savingTransactionService = inject(SavingTransactionService);
  transactionsLength = input(<number>(0));
  addedTransaction = output<SavingTransaction>();
  tempUserId = signal(1);
  savingId = signal(1);
  transactionId = signal(0);
  date = signal(new Date().toISOString().split('T')[0]);

  constructor() {
    this.transactionForm = this.formBuilder.group({
      saving_id: [''],
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
    const savingId = this.activatedRoute.snapshot.paramMap.get('id') ?? '';
    this.savingId.set(+savingId);

    this.transactionForm = this.formBuilder.group({
      savings_id: [+savingId],
      amount: [0, {
        validators: [Validators.required]
      }],
      savings_action: ['', {
        validators: [Validators.required]
      }],
      transaction_date: [this.date(), {
        validators: [Validators.required]
      }],
      description: [''],
    });
  }
  
   openModal() {
      const modal = new Modal(this.addSavingTransactionModal.nativeElement);
      const newTransactionId = this.transactionsLength() + 1;
      this.transactionId.set(newTransactionId);

      this.transactionForm.patchValue({
        savings_id: this.savingId(),
      });

      modal.show();
    }
  
    closeModal() {
      const modal = Modal.getInstance(this.addSavingTransactionModal.nativeElement);
      modal?.hide();
  
      this.transactionForm.reset({
        savings_id: this.savingId(),
        amount: 0,
        savings_action: '',
        transaction_date: this.date(),
        description: '',
      });
      // Restore the id field after reset to prevent it being null
      this.openSavingTransactionModalBtn.nativeElement.focus();
    }

    addSavingTransaction() {
      const newTransaction = this.transactionForm.value;

      this.savingTransactionService.addSavingTransaction(this.savingId(), newTransaction)
      .subscribe({
        next: (transactionData) => {
          console.log(newTransaction);
          console.log('Added Transaction:', transactionData);
          this.addedTransaction.emit(transactionData);
          this.closeModal();
        },
        error: (error) => {
          console.error('Error adding transaction:', error);
        }
      });
    }
}
