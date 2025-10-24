import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataFetchService } from '../../../services/data-fetch.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { EditContractComponent } from '../editcontract/editcontract.component';
import { ReturnContractComponent } from '../return-contract/return-contract.component';
import { DataSendService } from '../../../services/data-send.service';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-view-contract',
  standalone: false,
  templateUrl: './view-contract.component.html',
  styleUrl: './view-contract.component.scss'
})
export class ViewContractComponent implements OnInit {
  contract: any = null;
  isLoading: boolean = true;
  contractId: number = 0;
  Math = Math;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataFetchService: DataFetchService,
    private dataSendService: DataSendService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private location: Location
  ) {}

  ngOnInit(): void {
    // Get contract ID from route parameters
    this.route.params.subscribe(params => {
      this.contractId = +params['id'];
      if (this.contractId) {
        this.loadContract();
      }
    });
  }

  loadContract(): void {
    this.isLoading = true;
    this.dataFetchService.getContractResponseById(this.contractId).subscribe({
      next: (data: any) => {
        console.log('Contract data:', data);
        this.contract = data;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error fetching contract:', error);
        this.snackBar.open(
          error?.error?.message || 'Failed to load contract details',
          'Close',
          {
            verticalPosition: 'top',
            duration: 3000,
            panelClass: ['error-snackbar']
          }
        );
        this.isLoading = false;
      }
    });
  }

  getStatusText(status: any): string {
    switch (status) {
      case 1: return 'Active';
      case 2: return 'Overdue';
      case 3: return 'Completed';
      default: return 'Unknown';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case '1': return 'status-active';
      case '2': return 'status-overdue';
      case '3': return 'status-completed';
      default: return 'status-unknown';
    }
  }

  getDaysRemaining(): number {
    if (!this.contract) return 0;
    const checkInDate = new Date(this.contract.checkIn);
    const today = new Date();
    const diffTime = checkInDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isOverdue(): boolean {
    return this.getDaysRemaining() < 0 && this.contract.status === '1';
  }

  editContract(): void {
    const dialogRef = this.dialog.open(EditContractComponent, {
      width: '800px',
      height: '600px',
      data: { contract: this.contract }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dataSendService.updateContract(result).subscribe({
          next: () => {
            this.snackBar.open('Contract updated successfully', 'Close', {
              duration: 2000
            });
            this.loadContract();
          },
          error: (error: any) => {
            this.snackBar.open(
              error?.error?.message || 'Failed to update contract',
              'Close',
              {
                verticalPosition: 'top',
                duration: 3000,
                panelClass: ['error-snackbar']
              }
            );
          }
        });
      }
    });
  }

  returnContract(): void {
    const dialogRef = this.dialog.open(ReturnContractComponent, {
      width: '400px',
      data: { contractId: this.contractId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dataSendService.returnContract(this.contractId, result.CheckInDate).subscribe({
          next: () => {
            this.snackBar.open('Contract returned successfully', 'Close', {
              duration: 2000
            });
            this.loadContract();
          },
          error: (error: any) => {
            this.snackBar.open(
              error?.error?.message || 'Failed to return contract',
              'Close',
              {
                verticalPosition: 'top',
                duration: 3000,
                panelClass: ['error-snackbar']
              }
            );
          }
        });
      }
    });
  }

  extendContract(): void {
    const dialogRef = this.dialog.open(ReturnContractComponent, {
      width: '400px',
      data: { contractId: this.contractId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dataSendService.extendContract(this.contractId, result.CheckInDate).subscribe({
          next: () => {
            this.snackBar.open('Contract extended successfully', 'Close', {
              duration: 2000
            });
            this.loadContract();
          },
          error: (error: any) => {
            this.snackBar.open(
              error?.error?.message || 'Failed to extend contract',
              'Close',
              {
                verticalPosition: 'top',
                duration: 3000,
                panelClass: ['error-snackbar']
              }
            );
          }
        });
      }
    });
  }

  deleteContract(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { message: 'Are you sure you want to delete this contract?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dataSendService.deleteContract(this.contractId).subscribe({
          next: () => {
            this.snackBar.open('Contract deleted successfully', 'Close', {
              duration: 2000
            });
            this.router.navigate(['/contracts']);
          },
          error: (error: any) => {
            this.snackBar.open(
              error?.error?.message || 'Failed to delete contract',
              'Close',
              {
                verticalPosition: 'top',
                duration: 3000,
                panelClass: ['error-snackbar']
              }
            );
          }
        });
      }
    });
  }

  openWhatsApp(): void {
    if (this.contract?.phoneNumber) {
      const phoneNumber = this.contract.phoneNumber.replace(/\D/g, '');
      const message = `Hi ${this.contract.customerName}, this is regarding your car rental contract #${this.contract.id} for vehicle ${this.contract.carPlate}.`;
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
    }
  }

  goBack(): void {
    this.location.back();
  }

  printContract(): void {
    window.print();
  }
}