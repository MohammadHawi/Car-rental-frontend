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
  CheckInDate = new FormControl(new Date(), Validators.required);

  constructor(
    public dialogRef: MatDialogRef<ReturnContractComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  submit(): void {
    const selectedDate: Date | null = this.CheckInDate.value;
    if (selectedDate) {
      // Normalize to midnight UTC to avoid time component issues
      const normalized = new Date(Date.UTC(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      ));
      const formatted = normalized.toISOString();
      this.dialogRef.close({ CheckInDate: formatted });
    }
  }

}

