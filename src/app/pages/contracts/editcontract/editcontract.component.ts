import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-editcontract',
  templateUrl: './editcontract.component.html',
  standalone: false,
  styleUrls: ['./editcontract.component.scss']
})
export class EditContractComponent {
  contract: any = {};

  constructor(
    public dialogRef: MatDialogRef<EditContractComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.contract = { ...data.contract }; // clone to avoid direct mutation
  }

  onSave(): void {
    this.dialogRef.close(this.contract);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
