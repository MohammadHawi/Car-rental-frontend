import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-addcustomer',
  standalone: false,
  templateUrl: './addcustomer.component.html',
  styleUrl: './addcustomer.component.scss'
})
export class AddcustomerComponent {
  customer: any;
  Nationalities: any = {}
  customerForm: FormGroup;

  constructor(private fb: FormBuilder,private dialogRef: MatDialogRef<AddcustomerComponent>,@Inject(MAT_DIALOG_DATA) public data: any) {
    this.customerForm = this.fb.group({
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      nationalityId: ['', Validators.required],
      PhoneNumber: ['', Validators.required]
    });
    this.Nationalities = data.Nationalities;
  }

  save(): void {
    if (this.customerForm.valid) {
      this.dialogRef.close(this.customerForm.value); // send form data back
    }
  }
  
}
