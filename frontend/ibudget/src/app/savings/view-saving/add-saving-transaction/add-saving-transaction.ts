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
  transactionsLength = input(<number>(0));
  addedTransaction = output<SavingTransaction>();
  tempUserId = signal(1);
  savingId = signal(1);
  transactionId = signal(0);
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
    const savingId = this.activatedRoute.snapshot.paramMap.get('id') ?? '';
    this.savingId.set(+savingId);

    this.transactionForm = this.formBuilder.group({
      transaction_id: [],
      savings_id: [+savingId],
      user_id: [this.tempUserId()],
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
      created_at: [this.date(), {
        validators: [Validators.required]
      }],
      updated_at: [this.date(), {
        validators: [Validators.required]
      }],
      deleted_at: ['']
    });
  }
  
   openModal() {
      const modal = new Modal(this.addSavingTransactionModal.nativeElement);
      const newTransactionId = this.transactionsLength() + 1;
      this.transactionId.set(newTransactionId);

      this.transactionForm.patchValue({
        transaction_id: newTransactionId,
        savings_id: this.savingId(),
      });

      modal.show();
    }
  
    closeModal() {
      const modal = Modal.getInstance(this.addSavingTransactionModal.nativeElement);
      modal?.hide();
  
      this.transactionForm.reset({
        transaction_id: '',
        savings_id: this.savingId(),
        user_id: this.tempUserId(),
        amount: 0,
        savings_action: '',
        transaction_date: this.date(),
        description: '',
        created_at: this.date(),
        updated_at: this.date(),
        deleted_at: ''
      });
      // Restore the id field after reset to prevent it being null
      this.openSavingTransactionModalBtn.nativeElement.focus();
    }

    addSavingTransaction() {
      const newTransaction = this.transactionForm.value;

      this.historyService.addSavingTransaction(newTransaction)
        .subscribe((saved) => {
          this.addedTransaction.emit(saved);
          this.closeModal();
        });
    }
}
