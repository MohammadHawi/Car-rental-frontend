import { Component, Inject } from '@angular/core';
import { DataFetchService } from '../../../services/data-fetch.service';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataSendService } from '../../../services/data-send.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
  selector: 'app-newcontract',
  standalone: false,
  templateUrl: './newcontract.component.html',
  styleUrl: './newcontract.component.scss'
})
export class NewcontractComponent {
  contract: any = {};
  Nationalities: any = {}
  newCustomer: boolean = false;
  customerSuggestions: any[] = [];

  constructor(
    private dataFetchService: DataFetchService,
    private dialog: MatDialog,
    private dataSendService: DataSendService, 
    public snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  ngOnInit(): void {
    // Initialize contract with passed data
    if (this.data) {
      this.contract['car'] = this.data.Plate || '';
      this.contract['pickout'] = this.data.CheckOut || '';
    }

    this.dataFetchService.getNationalities().subscribe((data) => {
      this.Nationalities = data;
    });

    // Run form validation after setting initial values
    this.formValidation();
  }

  onNameChange(name: string): void {
    if (name.length < 2) return;
  
    this.dataFetchService.searchCustomersByName(name).subscribe((results) => {
      this.customerSuggestions = (results as any[]).map((c: any) => ({
        ...c,
        fullName: `${c.firstName} ${c.middleName || ''} ${c.lastName}`.trim()
      }));
    });
    this.formValidation();
  }

  selectCustomer(event: MatAutocompleteSelectedEvent): void {
    const fullName = event.option.viewValue;
    const selected = this.customerSuggestions.find(c => c.fullName === fullName);
    if (selected) {
      this.contract['name'] = fullName;
      this.contract['Cid'] = selected.id;
    }
    this.formValidation();
  }

  formValidation(): void {
    const isCarValid = !!this.contract['car'];
    const isPickoutValid = !!this.contract['pickout'];
    const isDropinValid = !!this.contract['dropin'];
  
    let isNameValid = false;
  
    if (this.newCustomer) {
      isNameValid =
        !!this.contract['firstName'] &&
        !!this.contract['lastName'] && 
        !!this.contract['PhoneNumber'] && 
        !!this.contract['nationalityId'];
    } else {
      isNameValid = !!this.contract['name'];
    }
  
    const isFormValid = isNameValid && isCarValid && isPickoutValid && isDropinValid;
  
    this.contract['form_isValid'] = isFormValid;
    this.contract['form_isComplete'] = isFormValid;
  }
}