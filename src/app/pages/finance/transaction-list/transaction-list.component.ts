import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Transaction, TransactionType } from '../../../models/transaction.model';
import { TransactionFormComponent } from '../transaction-form/transaction-form.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Data } from '@angular/router';
import { DataFetchService } from '../../../services/data-fetch.service';
import { DataSendService } from '../../../services/data-send.service';

@Component({
  selector: 'app-transactions-list',
  templateUrl: './transaction-list.component.html',
  standalone: false,
  styleUrls: ['./transaction-list.component.scss']
})
export class TransactionsListComponent implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  loading = true;
  searchTerm = '';
  selectedType: string = 'all';
  
  displayedColumns: string[] = ['date', 'type', 'category', 'description', 'amount', 'actions'];

  constructor(
    private transactionFetchService: DataFetchService,
    private transactionSendService: DataSendService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading = true;
    this.transactionFetchService.getAllTransactions().subscribe(
      data => {
        this.transactions = data;
        this.applyFilters();
        this.loading = false;
      },
      error => {
        console.error('Error loading transactions', error);
        this.loading = false;
        this.snackBar.open('Error loading transactions', 'Close', { duration: 3000 });
      }
    );
  }

  applyFilters(): void {
    let filtered = [...this.transactions];
    
    // Apply type filter
    if (this.selectedType !== 'all') {
      const typeValue = this.selectedType === 'income' ? TransactionType.Income : TransactionType.Expense;
      filtered = filtered.filter(t => t.type === typeValue);
    }
    
    // Apply search filter
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        this.transactionFetchService.getCategoryName(t.category).toLowerCase().includes(search) ||
        (t.description && t.description.toLowerCase().includes(search)) ||
        (t.contractNumber && t.contractNumber.toLowerCase().includes(search)) ||
        (t.carDetails && t.carDetails.toLowerCase().includes(search))
      );
    }
    
    this.filteredTransactions = filtered;
  }

  onSearch(): void {
    this.applyFilters();
  }

  onTypeFilterChange(): void {
    this.applyFilters();
  }

  openTransactionForm(transaction?: Transaction): void {
    const dialogRef = this.dialog.open(TransactionFormComponent, {
      width: '600px',
      data: { transaction }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTransactions();
      }
    });
  }

  deleteTransaction(id: number): void {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.transactionSendService.deleteTransaction(id).subscribe(
        () => {
          this.loadTransactions();
          this.snackBar.open('Transaction deleted successfully', 'Close', { duration: 3000 });
        },
        error => {
          console.error('Error deleting transaction', error);
          this.snackBar.open('Error deleting transaction', 'Close', { duration: 3000 });
        }
      );
    }
  }

  getCategoryName(category: number): string {
    return this.transactionFetchService.getCategoryName(category);
  }

  getTypeName(type: number): string {
    return this.transactionFetchService.getTypeName(type);
  }
}