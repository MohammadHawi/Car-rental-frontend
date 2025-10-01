import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { 
  Transaction, 
  TransactionType, 
  TransactionCategory, 
  CreateTransaction, 
  UpdateTransaction 
} from '../../../models/transaction.model';

import { Observable, forkJoin } from 'rxjs';
import { DataFetchService } from '../../../services/data-fetch.service';
import { DataSendService } from '../../../services/data-send.service';


@Component({
  selector: 'app-transaction-form',
  templateUrl: './transaction-form.component.html',
  standalone: false,
  styleUrls: ['./transaction-form.component.scss']
})
export class TransactionFormComponent implements OnInit {
  transactionForm!: FormGroup;
  isEditMode = false;
  loading = false;
  submitting = false;
  transactionId!: number;
  carInputControl = new FormControl('');
  filteredCars: any[] = [];
  
  // Expose enum to template
  TransactionType = TransactionType;
  
  incomeCategoriesEnum = [
    TransactionCategory.RentalPayment,
    TransactionCategory.Deposit,
    TransactionCategory.LateFee,
    TransactionCategory.DamageFee
  ];
  
  expenseCategoriesEnum = [
    TransactionCategory.Maintenance,
    TransactionCategory.Insurance,
    TransactionCategory.Fuel,
    TransactionCategory.Taxes,
    TransactionCategory.Salaries,
    TransactionCategory.Utilities,
    TransactionCategory.Marketing,
    TransactionCategory.OfficeCosts,
    TransactionCategory.VehiclePurchase,
    TransactionCategory.Other
  ];
  
  categories: { value: number; name: string }[] = [];
  cars: any[] = [];
  contracts: any[] = [];
  
  // For quick selection of related entities
  selectedContract: any | null = null;
  selectedCar: any | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TransactionFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private datafetchservice: DataFetchService,
    private datasendservice: DataSendService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.isEditMode = !!this.data;
    this.loading = true;
    
    // Initialize form with default values
    this.transactionForm = this.fb.group({
      type: [{ value: this.isEditMode ? this.data.type : TransactionType.Income, disabled: this.isEditMode }, Validators.required],
      category: [this.isEditMode ? this.data.category : '', Validators.required],
      amount: [this.isEditMode ? this.data.amount : '', [Validators.required, Validators.min(0.01)]],
      date: [this.isEditMode ? new Date(this.data.date) : new Date(), Validators.required],
      description: [this.isEditMode ? this.data.description : ''],
      contractId: [this.isEditMode ? this.data.contractId : null],
      carId: [this.isEditMode ? this.data.carId : null]
    });
    
    if (this.isEditMode) {
      this.transactionId = this.data.id;
      this.updateCategoriesForType(this.data.type);
    } else {
      this.updateCategoriesForType(TransactionType.Income);
    }
    

    forkJoin({
      cars: this.datafetchservice.getCars(),
      contracts: this.datafetchservice.getContracts()
    }).subscribe(
      ({ cars, contracts }) => {
        this.cars = cars.cars;
        this.contracts = contracts.contracts;
  
        // Set initial input display if editing
        if (this.isEditMode && this.data.carId) {
          const selected = this.cars.find(car => car.id === this.data.carId);
          if (selected) {
            this.carInputControl.setValue(this.getCarDisplayName(selected));
          }
        }
  
        // Filter observable
        this.carInputControl.valueChanges.subscribe(value => {
          const filterValue = value?.toLowerCase() || '';
          this.filteredCars = this.cars.filter(car =>
            this.getCarDisplayName(car).toLowerCase().includes(filterValue)
          );
        });
  
        this.loading = false;
      },
      error => {
        console.error('Error loading data', error);
        this.snackBar.open('Error loading cars and contracts', 'Close', { duration: 3000 });
        this.loading = false;
      }
    );

    
    
    
    // Listen for type changes to update categories
    this.transactionForm.get('type')?.valueChanges.subscribe(type => {
      this.updateCategoriesForType(type);
      this.transactionForm.get('category')?.setValue('');
    });
    
    // Listen for contract changes
    this.transactionForm.get('contractId')?.valueChanges.subscribe(contractId => {
      if (contractId) {
        this.selectedContract = this.contracts.find(contract => contract.id === contractId) || null;
      } else {
        this.selectedContract = null;
      }
    });
    
    // Listen for car changes
    this.transactionForm.get('carId')?.valueChanges.subscribe(carId => {
      if (carId) {
        this.selectedCar = this.cars.find(car => car.id === carId) || null;
      } else {
        this.selectedCar = null;
      }
    });
  }

  onCarSelected(selectedDisplay: string): void {
    const selectedCar = this.cars.find(car => this.getCarDisplayName(car) === selectedDisplay);
    this.transactionForm.get('carId')?.setValue(selectedCar ? selectedCar.id : null);
  }

  getCategoryIcon(category: TransactionCategory): string {
    const icons = {
      [TransactionCategory.RentalPayment]: 'payments',
      [TransactionCategory.Deposit]: 'savings',
      [TransactionCategory.LateFee]: 'schedule',
      [TransactionCategory.DamageFee]: 'build',
      [TransactionCategory.Maintenance]: 'handyman',
      [TransactionCategory.Insurance]: 'security',
      [TransactionCategory.Fuel]: 'local_gas_station',
      [TransactionCategory.Taxes]: 'account_balance',
      [TransactionCategory.Salaries]: 'people',
      [TransactionCategory.Utilities]: 'power',
      [TransactionCategory.Marketing]: 'campaign',
      [TransactionCategory.OfficeCosts]: 'business',
      [TransactionCategory.VehiclePurchase]: 'directions_car',
      [TransactionCategory.Other]: 'more_horiz'
    };
    
    return icons[category] || 'help_outline';
  }

  updateCategoriesForType(type: TransactionType): void {
    if (type === TransactionType.Income) {
      this.categories = this.incomeCategoriesEnum.map(value => ({
        value,
        name: this.datafetchservice.getCategoryName(value)
      }));
    } else {
      this.categories = this.expenseCategoriesEnum.map(value => ({
        value,
        name: this.datafetchservice.getCategoryName(value)
      }));
    }
  }

  onSubmit(): void {
    if (this.transactionForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.transactionForm.controls).forEach(key => {
        const control = this.transactionForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
      return;
    }
    
    this.submitting = true;
    
    const formValue = this.transactionForm.getRawValue();
    
    if (this.isEditMode) {
      const updateData: UpdateTransaction = {
        category: formValue.category,
        amount: formValue.amount,
        date: formValue.date.toISOString(),
        description: formValue.description,
        contractId: formValue.contractId,
        carId: formValue.carId
      };
      
      this.datasendservice.updateTransaction(this.transactionId, updateData).subscribe(
        () => {
          this.snackBar.open('Transaction updated successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error => {
          console.error('Error updating transaction', error);
          this.snackBar.open('Error updating transaction', 'Close', { duration: 3000 });
          this.submitting = false;
        }
      );
    } else {
      const createData: CreateTransaction = {
        type: formValue.type,
        category: formValue.category,
        amount: formValue.amount,
        date: formValue.date.toISOString(),
        description: formValue.description,
        contractId: formValue.contractId,
        carId: formValue.carId
      };
      
      this.datasendservice.createTransaction(createData).subscribe(
        () => {
          this.snackBar.open('Transaction created successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error => {
          console.error('Error creating transaction', error);
          this.snackBar.open('Error creating transaction', 'Close', { duration: 3000 });
          this.submitting = false;
        }
      );
    }
  }

  // Helper methods for template
  getCategoryName(category: number): string {
    return this.datafetchservice.getCategoryName(category);
  }
  
  getContractDisplayName(contract: any): string {
    return `#${contract.id} - ${contract.customerName || 'Unknown Customer'}`;
  }
  
  getCarDisplayName(car: any): string {
    return `${car.brand} ${car.class} (${car.plate})`;
  }
  
  // Quick actions
  setToday(): void {
    this.transactionForm.get('date')?.setValue(new Date());
  }
  
  clearRelatedEntities(): void {
    this.transactionForm.patchValue({
      contractId: null,
      carId: null
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  showPreview = false;

  togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  getPreviewData(): any {
    const formValue = this.transactionForm.getRawValue();
    return {
      type: formValue.type,
      typeName: this.TransactionType[formValue.type],
      category: formValue.category,
      categoryName: this.getCategoryName(formValue.category),
      amount: formValue.amount || 0,
      date: formValue.date,
      description: formValue.description,
      contractId: formValue.contractId,
      contractDetails: this.selectedContract ? this.getContractDisplayName(this.selectedContract) : null,
      carId: formValue.carId,
      carDetails: this.selectedCar ? this.getCarDisplayName(this.selectedCar) : null
    };
  }
}