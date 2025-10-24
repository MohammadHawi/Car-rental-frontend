import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { 
  Transaction, 
  TransactionType, 
  TransactionCategory, 
  CreateTransaction, 
  UpdateTransaction,
  
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
  
  // Store all categories from API
  allCategories: any[] = [];
  incomeCategories: any[] = [];
  expenseCategories: any[] = [];
  
  // Currently displayed categories based on transaction type
  categories: any[] = [];
  
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
    this.isEditMode = !!this.data && !!this.data.transactionId;
    const isPreFilled = !!this.data && this.data.preFilled === true;

    this.loading = true;
    
    // Initialize form with default values
    this.transactionForm = this.fb.group({
      type: [{ value: this.isEditMode ? this.data.type : TransactionType.Income, disabled: this.isEditMode || isPreFilled }, Validators.required],
      category: [{ value: '', disabled: isPreFilled }, Validators.required],
      amount: [{ value: this.data?.amount }, [Validators.required, Validators.min(0.01)]],
      date: [this.isEditMode ? new Date(this.data.date) : new Date(), Validators.required],
      description: [ this.data?.description || '', [Validators.maxLength(500)]],
      contractId: [this.data?.contractId || null],
      carId: [this.data?.carId || null]
    });
    
    // Load all data including categories from database
    forkJoin({
      cars: this.datafetchservice.getCars('', 1, 200), // Adjust page size as needed
      contracts: this.datafetchservice.getContracts('', 1, 200),
      categories: this.datafetchservice.getCategories()
    }).subscribe(
      ({ cars, contracts, categories }) => {
        // console.log('Loaded categories:', categories);
        
        this.cars = cars.cars;
        this.contracts = contracts.contracts;
        this.allCategories = categories;
        
        // Separate categories by type
        this.incomeCategories = categories.filter(cat => cat.type === 'Income');
        this.expenseCategories = categories.filter(cat => cat.type === 'Expense');
        
        // console.log('Income categories:', this.incomeCategories);
        // console.log('Expense categories:', this.expenseCategories);
        
        // Set initial categories based on transaction type
        // if (this.isEditMode) {
        //   this.updateCategoriesForType(this.data.type);
        // } else {
        //   this.updateCategoriesForType(TransactionType.Income);
        // }
        
        // // Set initial input display if editing
        // if (this.isEditMode && this.data.carId) {
        //   const selected = this.cars.find(car => car.id === this.data.carId);
        //   if (selected) {
        //     this.carInputControl.setValue(this.getCarDisplayName(selected));
        //   }
        // }

        // Set initial categories based on transaction type
      const initialType = this.data?.type !== undefined ? this.data.type : TransactionType.Income;
      this.updateCategoriesForType(initialType);
      
      // NOW set the category value after categories are loaded
      if (this.data?.category) {
        this.transactionForm.patchValue({
          category: this.data.category
        });
      }
      
      // Set contractId and carId if provided
      if (this.data?.contractId) {
        this.transactionForm.patchValue({
          contractId: this.data.contractId
        });
      }
      
      if (this.data?.carId) {
        this.transactionForm.patchValue({
          carId: this.data.carId
        });
        
        const selected = this.cars.find(car => car.id === this.data.carId);
        if (selected) {
          this.carInputControl.setValue(this.getCarDisplayName(selected));
        }
      }
  
        // Filter observable for car autocomplete
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
        this.snackBar.open('Error loading data. Please try again.', 'Close', { duration: 3000 });
        this.loading = false;
      }
    );
    
    // Listen for type changes to update categories
    this.transactionForm.get('type')?.valueChanges.subscribe(type => {
      // console.log('Type changed to:', type);
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

  getCategoryIcon(categoryId: number): string {
    // Map category IDs to icons based on category name
    const category = this.allCategories.find(cat => cat.id === categoryId);
    if (!category) return 'help_outline';
    
    // Remove spaces and convert to lowercase for matching
    const normalizedName = category.name.replace(/\s+/g, '').toLowerCase();
    
    const iconMap: { [key: string]: string } = {
      'rentalpayment': 'payments',
      'deposit': 'savings',
      'latefee': 'schedule',
      'damagefee': 'build',
      'maintenance': 'handyman',
      'insurance': 'security',
      'fuel': 'local_gas_station',
      'taxes': 'account_balance',
      'salaries': 'people',
      'utilities': 'power',
      'marketing': 'campaign',
      'officecosts': 'business',
      'vehiclepurchase': 'directions_car',
      'other': 'more_horiz'
    };
    
    return iconMap[normalizedName] || 'help_outline';
  }

  updateCategoriesForType(type: TransactionType): void {
    if (type === TransactionType.Income) {
      this.categories = this.incomeCategories;
      // console.log('Updated to income categories:', this.categories);
    } else {
      this.categories = this.expenseCategories;
      console.log('Updated to expense categories:', this.categories);
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
    
    // if (this.isEditMode) {
    //   const updateData: UpdateTransaction = {
    //     category: formValue.category,
    //     amount: formValue.amount,
    //     date: formValue.date.toISOString(),
    //     description: formValue.description,
    //     contractId: formValue.contractId,
    //     carId: formValue.carId
    //   };
      
    //   this.datasendservice.updateTransaction(this.transactionId, updateData).subscribe(
    //     () => {
    //       this.snackBar.open('Transaction updated successfully', 'Close', { duration: 3000 });
    //       this.dialogRef.close(true);
    //     },
    //     error => {
    //       console.error('Error updating transaction', error);
    //       this.snackBar.open('Error updating transaction', 'Close', { duration: 3000 });
    //       this.submitting = false;
    //     }
    //   );
    // } else {
    //   const createData: CreateTransaction = {
    //     type: formValue.type,
    //     category: formValue.category,
    //     amount: formValue.amount,
    //     date: formValue.date.toISOString(),
    //     description: formValue.description,
    //     contractId: formValue.contractId,
    //     carId: formValue.carId
    //   };
      
    //   this.datasendservice.createTransaction(createData).subscribe(
    //     () => {
    //       this.snackBar.open('Transaction created successfully', 'Close', { duration: 3000 });
    //       this.dialogRef.close(true);
    //     },
    //     error => {
    //       console.error('Error creating transaction', error);
    //       this.snackBar.open('Error creating transaction', 'Close', { duration: 3000 });
    //       this.submitting = false;
    //     }
    //   );
    // }


     const transaction = {
        transactionType: formValue.type,
        category: formValue.category,
        amount: formValue.amount,
        date: formValue.date,
        description: formValue.description,
        contractId: formValue.contractId,
        carId: formValue.carId
      };


  this.dialogRef.close(transaction);
  }

  // Helper methods for template
  getCategoryName(categoryId: number): string {
    const category = this.allCategories.find(cat => cat.id === categoryId);
    return category?.name || 'Unknown';
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