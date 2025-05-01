import { Component, type OnInit, ViewChild } from "@angular/core"
import { MatTableDataSource } from "@angular/material/table"
import { MatPaginator, PageEvent } from "@angular/material/paginator"
import { MatSort } from "@angular/material/sort"
import { DataFetchService } from "../../services/data-fetch.service"
import { AddcustomerComponent } from "./addcustomer/addcustomer.component"
import { MatDialog } from "@angular/material/dialog"
import { EditCustomerComponent } from "./edit-customer/edit-customer.component"
import { DataSendService } from "../../services/data-send.service"
import { MatSnackBar } from "@angular/material/snack-bar"
import { ConfirmDialogComponent } from "../../shared/confirm-dialog/confirm-dialog.component"


export interface Customer { 
  id: number
  name: string
  email: string
  phone: string
  status: "active" | "inactive"
  lastRental: string
}

@Component({
  selector: "app-customers",
  standalone: false,
  templateUrl: "./customers.component.html",
  styleUrls: ["./customers.component.scss"],
})

export class CustomersComponent implements OnInit {

  displayedColumns: string[] = ["FirstName","MiddleName", "LastName", "PhoneNumber", "Nationality", "actions"];
  dataSource: MatTableDataSource<Customer> = new MatTableDataSource<Customer>()
  statusFilter = "all"
  customers: any[] = [];
  totalCount: number = 0;
  pageSize: number = 10;
  currentPage: number = 0;
  filter:any = {};
  Nationalities: any = {}
  @ViewChild(MatPaginator) paginator!: MatPaginator

  constructor(private dataFetchService: DataFetchService,private dialog: MatDialog,
    private dataSendService: DataSendService, public snackBar: MatSnackBar

  ) {
  }

  ngOnInit(): void {
    this.fetchCustomers();
    this.dataFetchService.getNationalities().subscribe((data) => {
      this.Nationalities = data;
    });
  }

  
  fetchCustomers() {
    console.log("Current Page:", this.currentPage);
    this.dataFetchService
      .getCustomers(this.filter,this.currentPage +1 , this.pageSize)
      .subscribe({
        next: (data: any) => {
          this.totalCount = data.totalCount; 
          this.dataSource.data = data.customers;

        },
        error: (error: any) => {
          console.error("Error fetching customers:", error);
        },
      });
  }
  
  filterCallback(type: string | number, id: string) {
    this.filter[type] = id;
    this.applyFilter();
  }

  applyFilter(): void {
    this.fetchCustomers();
  }

  pageRel(): void {
    this.filter = {};
    this.currentPage = 0;
    this.pageSize = 10;
    this.applyFilter();
  }

  addCustomer(): void {
    const dialogRef = this.dialog.open(AddcustomerComponent, {
      width: '800px', 
      height: '600px', 
      data: {Nationalities : this.Nationalities} 
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Assuming the result contains the new customer data
        this.dataSendService.crtCustomer(result).subscribe({
          next: (response: any) => {
            this.snackBar.open("Customer added successfully", "Close", {
              duration: 2000,
            });
            this.fetchCustomers(); // Refresh the customer list
          },
          error: (error: any) => {
            this.snackBar.open(error?.error?.message || 'Something went wrong!', undefined, {
              verticalPosition: 'top',
              duration: 3000,
              panelClass: ['error-snackbar'],
            });
          },
        });
      }
    });
  }
  

  editCustomer(customerId: number): void {
    const selectedCustomer = this.dataSource.data.find(c => c.id === customerId);
  
    if (!selectedCustomer) {
      console.error("Customer not found for editing:", customerId);
      return;
    }
  
    const dialogRef = this.dialog.open(EditCustomerComponent, {
      width: '800px',
      height: '600px',
      data: { customer: selectedCustomer, Nationalities: this.Nationalities } 
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Assuming 'result' is the updated customer info
        this.dataSendService.updateCustomer(customerId, result).subscribe({
          next: (response: any) => {
            this.snackBar.open("Customer updated successfully", "Close", {
              duration: 2000,
            });
            this.fetchCustomers(); // Refresh the list after updating
          },
          error: (error: any) => {
            this.snackBar.open(error?.error?.message || 'Something went wrong!', undefined, {
              verticalPosition: 'top',
              duration: 3000,
              panelClass: ['error-snackbar'],
            });
          },
        });
      }
    });
  }
  
  getNationality(id: number): string {
    if (!this.Nationalities || !this.dataSource.data) return '';

    const statusObj = this.Nationalities.find((d: any) => d.id === id);
    return statusObj ? statusObj.name : 'Error';
  }

 


  deleteCustomer(customerId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { message: 'Are you sure you want to delete this customer?' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // User confirmed, proceed with deletion
        this.dataSendService.deleteCustomer(customerId).subscribe(
          (response: any) => {
            this.snackBar.open(response['message'], undefined, {
              verticalPosition: 'top',
              duration: 3000,
              panelClass: response['class'],
            });

            // Refresh the employee list
            this.fetchCustomers();
          },
          (error: any) => {
            this.snackBar.open(
              'An error occurred while deleting the employee. Please try again.',
              undefined,
              {
                verticalPosition: 'top',
                duration: 3000,
                panelClass: ['error-snackbar'],
              }
            );
          }
        );
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex; // MatPaginator is 0-based, API expects 1-based
    this.pageSize = event.pageSize;
  
    
    this.fetchCustomers(); // Fetch data again with new pagination values
  }
  
  
  
}

