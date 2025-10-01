import { Component, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DataFetchService } from '../../services/data-fetch.service';
import { MatDialog } from '@angular/material/dialog';
import { DataSendService } from '../../services/data-send.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { NewcontractComponent } from './newcontract/newcontract.component';
import { EditContractComponent } from './editcontract/editcontract.component';
import { ReturnContractComponent } from './return-contract/return-contract.component';
import { TransactionFormComponent } from '../finance/transaction-form/transaction-form.component';

@Component({
  selector: 'app-contracts',
  standalone: false,
  templateUrl: './contracts.component.html',
  styleUrl: './contracts.component.scss'
})
export class ContractsComponent {
  displayedColumns: string[] = ["carPlate","customerName", "checkOut", "checkIn", "price", "total", "paid", "balance", "status", "actions"];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>()
  statusFilter = "all"
  customers: any[] = [];
  totalCount: number = 0;
  pageSize: number = 100;
  currentPage: number = 0;
  filter:any = {};
  private searchTimeout: any;
  isLoading: boolean = false;
  Nationalities: any = {}
  @ViewChild(MatPaginator) paginator!: MatPaginator

  constructor(private dataFetchService: DataFetchService,private dialog: MatDialog,
    private dataSendService: DataSendService, public snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.fetchContracts();

  }

  
  fetchContracts() {
    this.dataFetchService
      .getContracts(this.filter,this.currentPage +1 , this.pageSize)
      .subscribe({
        next: (data: any) => {
          this.totalCount = data.totalCount; 
          this.dataSource.data = data.contracts;

        },
        error: (error: any) => {
          console.error("Error fetching contracts:", error);
        },
      });
  }
  
  filterCallback(type: string | number, id: string) {
    this.filter[type] = id;
    this.applyFilter();
  }

  applyFilter(): void {
    this.fetchContracts();
  }

  pageRel(): void {
    this.filter = {};
    this.currentPage = 0;
    this.pageSize = 100;
    this.applyFilter();
  }
  clearSearch(): void {
    this.filter['search_query'] = '';
    this.applyFilter();
  }
  onSearchInput(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.applyFilter();
    }, 300);
  }

  checkIn(contractId: number): void {
  // First, get the contract details to check status
    this.dataFetchService.getContractById(contractId).subscribe({
      next: (contract: any) => {
         console.log('Fetched contract:', contract);
        // Check if contract is overdue (status == '2')

        const today = new Date();
        const checkInDate = new Date(contract.checkIn);
        const daysOverdue = Math.max(0, Math.ceil((today.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));
        const extraAmount = daysOverdue * contract.price


        if (contract.status == '2') {
          // Open finance dialog for overdue contract
          const financeDialogRef = this.dialog.open(TransactionFormComponent, {
            width: '500px',
            data: { 
              contractId: contract.id,  
              type: 'Income',
              category: 'Rental Extension',
              description: 'Income for Car Rental Extension',
              carId: contract.carId,
              amount: extraAmount
            }
          });

          financeDialogRef.afterClosed().subscribe(financeResult => {
            if (financeResult) {
              // Process the finance entry first
              this.dataSendService.createTransaction(financeResult).subscribe({
                next: () => {
                  this.snackBar.open("Income added successfully", "Close", {
                    duration: 2000,
                  });
                  // After successful finance entry, proceed with contract return
                  this.openReturnContractDialog(contractId);
                },
                error: (error: any) => {
                  this.snackBar.open(
                    error?.error?.message || 'Failed to add income', 
                    "Close", 
                    {
                      verticalPosition: 'top',
                      duration: 3000,
                      panelClass: ['error-snackbar'],
                    }
                  );
                },
              });
            }
          });
        } else {
          // Contract is not overdue, proceed directly with return
          this.openReturnContractDialog(contractId);
        }
      },
      error: (error: any) => {
        this.snackBar.open(
          error?.error?.message || 'Failed to fetch contract details', 
          "Close", 
          {
            verticalPosition: 'top',
            duration: 3000,
            panelClass: ['error-snackbar'],
          }
        );
      }
    });
  }

  // Extract the return contract dialog logic into a separate method
  private openReturnContractDialog(contractId: number): void {
    const dialogRef = this.dialog.open(ReturnContractComponent, {
      width: '400px',
      data: { contractId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dataSendService.returnContract(contractId, result).subscribe({
          next: () => {
            this.snackBar.open("Contract returned successfully", "Close", {
              duration: 2000,
            });
            this.fetchContracts();
          },
          error: (error: any) => {
            this.snackBar.open(
              error?.error?.message || 'Failed to return contract', 
              "Close", 
              {
                verticalPosition: 'top',
                duration: 3000,
                panelClass: ['error-snackbar'],
              }
            );
          },
        });
      }
    });
  }

  extendContract(contractId: number): void {
    const dialogRef = this.dialog.open(ReturnContractComponent, {
      width: '400px',
      data: { contractId }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dataSendService.extendContract(contractId, result).subscribe({
          next: () => {
            this.snackBar.open("Contract extended successfully", "Close", {
              duration: 2000,
            });
            this.fetchContracts();
          },
          error: (error: any) => {
            this.snackBar.open(error?.error?.message || 'Failed to extend contract', undefined, {
              verticalPosition: 'top',
              duration: 3000,
              panelClass: ['error-snackbar'],
            });
          },
        });
      }
    });
  }
  

  addContract(): void {
    const dialogRef = this.dialog.open(NewcontractComponent, {
      width: '800px', 
      height: '600px', 
      data: {Nationalities : this.Nationalities} 
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.pickout instanceof Date) {
        result.pickout.setHours(12, 0, 0, 0);
      }
      if (result.dropin instanceof Date) {
        result.dropin.setHours(12, 0, 0, 0);
      }
        this.dataSendService.crtContract(result).subscribe({
          next: (response: any) => {
            this.snackBar.open("Contract added successfully", "Close", {
              duration: 2000,
            });
            this.fetchContracts(); 
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
  

  editContract(contractId: number): void {
    this.dataFetchService.getContractById(contractId).subscribe({
      next: (contract: any) => {
        const dialogRef = this.dialog.open(EditContractComponent, {
          width: '800px',
          height: '600px',
          data: { contract }
        });
  
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.dataSendService.updateContract(result).subscribe({
              next: (response: any) => {
                this.snackBar.open("Contract updated successfully", "Close", {
                  duration: 2000,
                });
                this.fetchContracts();
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
      },
      error: (error: any) => {
        console.error("Error fetching contract for editing:", error);
      }
    });
  }
  



  deleteContract(contrcatId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { message: 'Are you sure you want to delete this contract?' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.dataSendService.deleteContract(contrcatId).subscribe(
          (response: any) => {
            this.snackBar.open(response['message'], undefined, {
              verticalPosition: 'top',
              duration: 3000,
              panelClass: response['class'],
            });

            this.fetchContracts();
          },
          (error: any) => {
            this.snackBar.open(
              'An error occurred while deleting the contract. Please try again.',
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

  /**
   * Get count of active contracts
   */
  getActiveContractsCount(): number {
    if (!this.dataSource?.data) return 0;
    return this.dataSource.data.filter(contract => contract.status === '1').length;
  }

  /**
   * Get count of overdue contracts
   */
  getOverdueContractsCount(): number {
    if (!this.dataSource?.data) return 0;
    return this.dataSource.data.filter(contract => contract.status === '2').length;
  }

  /**
   * Calculate total revenue from all contracts
   */
  getTotalRevenue(): number {
    if (!this.dataSource?.data) return 0;
    return this.dataSource.data.reduce((total, contract) => {
      return total + (parseFloat(contract.total) || 0);
    }, 0);
  }

  /**
   * Calculate total paid amount
   */
  getTotalPaid(): number {
    if (!this.dataSource?.data) return 0;
    return this.dataSource.data.reduce((total, contract) => {
      return total + (parseFloat(contract.paid) || 0);
    }, 0);
  }

  /**
   * Calculate total outstanding balance
   */
  getTotalBalance(): number {
    if (!this.dataSource?.data) return 0;
    return this.dataSource.data.reduce((total, contract) => {
      return total + (parseFloat(contract.balance) || 0);
    }, 0);
  }

  /**
   * Get status class for styling
   */
  getStatusClass(contract: any): string {
    switch (contract.status) {
      case '1': return 'status-active';
      case '2': return 'status-overdue';
      case '3': return 'status-completed';
      default: return 'status-unknown';
    }
  }

  /**
   * Check if contract is overdue
   */
  isContractOverdue(contract: any): boolean {
    const checkInDate = new Date(contract.checkIn);
    const today = new Date();
    return checkInDate < today && contract.status === '1';
  }

  /**
   * Get days until check-in or days overdue
   */
  getDaysUntilCheckIn(contract: any): number {
    const checkInDate = new Date(contract.checkIn);
    const today = new Date();
    const diffTime = checkInDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Format phone number for WhatsApp
   */
  formatPhoneForWhatsApp(phoneNumber: string): string {
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present (assuming US +1, adjust as needed)
    if (cleaned.length === 10) {
      return '1' + cleaned;
    }
    return cleaned;
  }

  /**
   * Enhanced WhatsApp message
   */
  openWhatsApp(contract: any): void {
    const phoneNumber = this.formatPhoneForWhatsApp(contract.phoneNumber);
    const message = `Hi ${contract.customerName}, this is regarding your car rental contract #${contract.id} for vehicle ${contract.carPlate}.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  }

  /**
   * Bulk actions for selected contracts (if you implement selection)
   */
  bulkMarkAsCompleted(contractIds: number[]): void {
    // Implementation for bulk operations
    console.log('Marking contracts as completed:', contractIds);
  }

  /**
   * Export contracts to CSV
   */
  exportToCSV(): void {
    const csvData = this.dataSource.data.map(contract => ({
      ID: contract.id,
      'Car Plate': contract.carPlate,
      'Customer Name': contract.customerName,
      'Check Out': contract.checkOut,
      'Check In': contract.checkIn,
      'Price': contract.price,
      'Total': contract.total,
      'Paid': contract.paid,
      'Balance': contract.balance,
      'Status': this.getStatusText(contract.status)
    }));

    // Convert to CSV string
    const csvString = this.convertToCSV(csvData);
    
    // Download file
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `contracts_${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Convert array to CSV string
   */
  private convertToCSV(data: any[]): string {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        return typeof value === 'string' && (value.includes(',') || value.includes('"'))
          ? `"${value.replace(/"/g, '""')}"`
          : value;
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  }

  /**
   * Get human-readable status text
   */
  private getStatusText(status: string): string {
    switch (status) {
      case '1': return 'Active';
      case '2': return 'Overdue';
      case '3': return 'Completed';
      default: return 'Unknown';
    }
  }

  /**
   * Cleanup on component destroy
   */
  ngOnDestroy(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    // ... any other cleanup code you have
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex; // MatPaginator is 0-based, API expects 1-based
    this.pageSize = event.pageSize;
  
    
    this.fetchContracts(); // Fetch data again with new pagination values
  }
  
  
}
