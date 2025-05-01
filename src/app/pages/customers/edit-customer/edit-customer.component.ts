import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-customer',
  templateUrl: './edit-customer.component.html',
  standalone: false,
  styleUrls: ['./edit-customer.component.scss']
})
export class EditCustomerComponent {

  customer: any = {};
  nationalities: any[] = [];

  constructor(
    private dialogRef: MatDialogRef<EditCustomerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data.customer) {
      this.customer = { ...data.customer };
      console.log(this.customer)
    }
    this.nationalities = data.Nationalities || [];
  }

  save(): void {
    this.dialogRef.close(this.customer);
  }

  close(): void {
    this.dialogRef.close();
  }
}
