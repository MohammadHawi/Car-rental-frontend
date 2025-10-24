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
import { Router } from "@angular/router"

export interface Customer { 
  id: number
  firstName: string
  middleName?: string
  lastName: string
  phoneNumber: string
  nationalityId: number
  email?: string
}

@Component({
  selector: "app-customers",
  standalone: false,
  templateUrl: "./customers.component.html",
  styleUrls: ["./customers.component.scss"],
})
export class CustomersComponent implements OnInit {
  displayedColumns: string[] = ["FirstName", "MiddleName", "LastName", "PhoneNumber", "Nationality", "actions"]
  dataSource: MatTableDataSource<Customer> = new MatTableDataSource<Customer>()
  customers: any[] = []
  totalCount: number = 0
  pageSize: number = 10
  currentPage: number = 0
  filter: any = {}
  Nationalities: any = []
  selectedNationality: string = 'all'
  isLoading = false
  searchTimeout: any
  
  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort

  constructor(
    private dataFetchService: DataFetchService,
    private dialog: MatDialog,
    private dataSendService: DataSendService,
    public snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNationalities()
    this.fetchCustomers()
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort
  }

  loadNationalities(): void {
    this.dataFetchService.getNationalities().subscribe({
      next: (data) => {
        this.Nationalities = data
      },
      error: (error) => {
        console.error("Error loading nationalities:", error)
      }
    })
  }

  fetchCustomers() {
    this.isLoading = true
    this.dataFetchService
      .getCustomers(this.filter, this.currentPage + 1, this.pageSize)
      .subscribe({
        next: (data: any) => {
          this.totalCount = data.totalCount
          this.dataSource.data = data.customers
          this.isLoading = false
        },
        error: (error: any) => {
          console.error("Error fetching customers:", error)
          this.isLoading = false
          this.snackBar.open("Error loading customers", "Close", { duration: 3000 })
        },
      })
  }

  filterCallback(type: string | number, id: string) {
    this.filter[type] = id
    this.applyFilter()
  }

  applyFilter(): void {
    this.currentPage = 0
    if (this.paginator) {
      this.paginator.pageIndex = 0
    }
    this.fetchCustomers()
  }

  onNationalityFilterChange(): void {
    if (this.selectedNationality === 'all') {
      delete this.filter['nationalityId']
    } else {
      this.filter['nationalityId'] = this.selectedNationality
    }
    this.applyFilter()
  }

  clearSearch(): void {
    this.filter['search_query'] = ''
    this.applyFilter()
  }

  onSearchInput(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
    }
    this.searchTimeout = setTimeout(() => {
      if (this.filter['search_query']) {
        this.applyFilter()
      }
    }, 300)
  }

  pageRel(): void {
    this.filter = {}
    this.selectedNationality = 'all'
    this.currentPage = 0
    this.pageSize = 10
    this.applyFilter()
  }

  addCustomer(): void {
    const dialogRef = this.dialog.open(AddcustomerComponent, {
      width: '800px',
      height: '600px',
      data: { Nationalities: this.Nationalities }
    })

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dataSendService.crtCustomer(result).subscribe({
          next: (response: any) => {
            this.snackBar.open("Customer added successfully", "Close", {
              duration: 2000,
            })
            this.fetchCustomers()
          },
          error: (error: any) => {
            this.snackBar.open(error?.error?.message || 'Something went wrong!', undefined, {
              verticalPosition: 'top',
              duration: 3000,
              panelClass: ['error-snackbar'],
            })
          },
        })
      }
    })
  }

  editCustomer(customerId: number): void {
    const selectedCustomer = this.dataSource.data.find(c => c.id === customerId)

    if (!selectedCustomer) {
      console.error("Customer not found for editing:", customerId)
      return
    }

    const dialogRef = this.dialog.open(EditCustomerComponent, {
      width: '800px',
      height: '600px',
      data: { customer: selectedCustomer, Nationalities: this.Nationalities }
    })

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dataSendService.updateCustomer(customerId, result).subscribe({
          next: (response: any) => {
            this.snackBar.open("Customer updated successfully", "Close", {
              duration: 2000,
            })
            this.fetchCustomers()
          },
          error: (error: any) => {
            this.snackBar.open(error?.error?.message || 'Something went wrong!', undefined, {
              verticalPosition: 'top',
              duration: 3000,
              panelClass: ['error-snackbar'],
            })
          },
        })
      }
    })
  }

  getNationality(id: number): string {
    if (!this.Nationalities || !this.dataSource.data) return 'N/A'

    const statusObj = this.Nationalities.find((d: any) => d.id === id)
    return statusObj ? statusObj.name : 'N/A'
  }

  viewCustomerDetails(customer: Customer): void {
    // Implement customer details view
    console.log('View customer details:', customer)
  }

  viewRentalHistory(customer: Customer): void {
    // Navigate to customer rental history
    this.router.navigate([`/customers/${customer.id}/history`])
  }

  deleteCustomer(customerId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { message: 'Are you sure you want to delete this customer?' },
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.dataSendService.deleteCustomer(customerId).subscribe(
          (response: any) => {
            this.snackBar.open(response['message'] || 'Customer deleted successfully', "Close", {
              duration: 3000,
            })
            this.fetchCustomers()
          },
          (error: any) => {
            this.snackBar.open(
              error?.error?.message || 'An error occurred while deleting the customer. Please try again.',
              "Close",
              {
                duration: 3000,
                panelClass: ['error-snackbar'],
              }
            )
          }
        )
      }
    })
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex
    this.pageSize = event.pageSize
    this.fetchCustomers()
  }
}