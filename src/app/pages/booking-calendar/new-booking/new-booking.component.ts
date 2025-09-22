import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataFetchService } from '../../../services/data-fetch.service';
import { DataSendService } from '../../../services/data-send.service';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

interface BookingDialogData {
  carId: number;
  date: Date;
  contractId?: number;
}

@Component({
  selector: 'app-new-booking',
  standalone: false,
  templateUrl: './new-booking.component.html',
  styleUrl: './new-booking.component.scss'
})
export class NewBookingComponent {
  bookingForm: FormGroup;
  car: any;
  customers: any[] = [];
  isLoading = false;
  isEditMode = false;
  customerSuggestions: any[] = [];
  
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<NewBookingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BookingDialogData,
    private dataFetchService: DataFetchService,
    private dataSendService: DataSendService,
    private snackBar: MatSnackBar
  ) {
    this.bookingForm = this.fb.group({
      customerId: ['', Validators.required],
      startDate: [new Date(data.date), Validators.required],
      endDate: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      deposit: ['', [Validators.min(0)]],
      note: ['']
    });
    
    this.isEditMode = !!data.contractId;
  }
  
  ngOnInit(): void {
    this.loadCar();
    this.loadCustomers();
    
    if (this.isEditMode) {
      this.loadContract();
    }
  }
  
  loadCar(): void {
    this.isLoading = true;
    this.dataFetchService.getCarById(this.data.carId).subscribe(car => {
      this.car = car;
      if (!this.isEditMode && car.price) {
        this.bookingForm.patchValue({ price: car.price });
      }
      this.isLoading = false;
    }, error => {
      console.error('Error loading car', error);
      this.isLoading = false;
      this.snackBar.open('Error loading car details', 'Close', { duration: 3000 });
    });
  }
  
  loadCustomers(): void {
    // This would be implemented with a CustomerService
    // For now, we'll use mock data
    this.customers = [
      { id: 1, firstName: 'John', lastName: 'Doe', phoneNumber: '123-456-7890' },
      { id: 2, firstName: 'Jane', lastName: 'Smith', phoneNumber: '987-654-3210' }
    ];
  }
  
  loadContract(): void {
    this.isLoading = true;
    this.dataFetchService.getContractById(this.data.contractId).subscribe(contract => {
      this.bookingForm.patchValue({
        customerId: contract.customerId,
        startDate: new Date(contract.startDate),
        endDate: new Date(contract.endDate),
        price: contract.price,
        deposit: contract.deposit,
        note: contract.note
      });
      this.isLoading = false;
    }, error => {
      console.error('Error loading contract', error);
      this.isLoading = false;
      this.snackBar.open('Error loading contract details', 'Close', { duration: 3000 });
    });
  }
  
  onSubmit(): void {
    if (this.bookingForm.invalid) {
      return;
    }
    
    const formValue = this.bookingForm.value;
    const contract = {
      carId: this.data.carId,
      customerId: formValue.customerId,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      price: formValue.price,
      deposit: formValue.deposit,
      note: formValue.note,
      status: 1 // Active
    };
    
    this.isLoading = true;
    
    if (this.isEditMode) {
      this.dataSendService.updateContract(contract).subscribe(() => {
        this.isLoading = false;
        this.snackBar.open('Booking updated successfully', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      }, error => {
        console.error('Error updating contract', error);
        this.isLoading = false;
        this.snackBar.open('Error updating booking', 'Close', { duration: 3000 });
      });
    } else {
      this.dataSendService.crtContract(contract).subscribe(() => {
        this.isLoading = false;
        this.snackBar.open('Booking created successfully', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      }, error => {
        console.error('Error creating contract', error);
        this.isLoading = false;
        this.snackBar.open('Error creating booking', 'Close', { duration: 3000 });
      });
    }
  }

  onNameChange(name: string): void {
    if (name.length < 2) return;
  
    this.dataFetchService.searchCustomersByName(name).subscribe((results) => {
      this.customerSuggestions = (results as any[]).map((c: any) => ({
        ...c,
        fullName: `${c.firstName} ${c.middleName || ''} ${c.lastName}`.trim()
      }));
    });
  }

  selectCustomer(event: MatAutocompleteSelectedEvent): void {
    const fullName = event.option.viewValue; // Assuming the full name is the display value
    const selected = this.customerSuggestions.find(c => c.fullName === fullName);
    // if (selected) {
    //   this.contract['name'] = fullName;
    //   this.contract['Cid'] = selected.id; // or however you store the Customer ID
    // }
  }
  
  calculateTotalDays(): number {
    const startDate = this.bookingForm.get('startDate')?.value;
    const endDate = this.bookingForm.get('endDate')?.value;
    
    if (!startDate || !endDate) {
      return 0;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays + 1; // Include both start and end days
  }
  
  calculateTotalPrice(): number {
    const days = this.calculateTotalDays();
    const price = this.bookingForm.get('price')?.value || 0;
    
    return days * price;
  }
  
  onCancel(): void {
    this.dialogRef.close();
  }
  
  getCustomerFullName(customer: any): string {
    return `${customer.firstName} ${customer.lastName}`;
  }
}
