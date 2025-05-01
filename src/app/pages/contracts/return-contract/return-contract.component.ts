import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-return-contract',
  standalone: false,
  templateUrl: './return-contract.component.html',
  styleUrl: './return-contract.component.scss'
})
export class ReturnContractComponent {
  checkInDate = new FormControl(new Date(), Validators.required);

  constructor(
    public dialogRef: MatDialogRef<ReturnContractComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  submit(): void {
    this.dialogRef.close(this.checkInDate.value);
  }
}

