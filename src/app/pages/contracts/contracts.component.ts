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

  checkIn(contractId: number): void {
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
            this.snackBar.open(error?.error?.message || 'Failed to return contract', undefined, {
              verticalPosition: 'top',
              duration: 3000,
              panelClass: ['error-snackbar'],
            });
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

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex; // MatPaginator is 0-based, API expects 1-based
    this.pageSize = event.pageSize;
  
    
    this.fetchContracts(); // Fetch data again with new pagination values
  }
  
  
}
