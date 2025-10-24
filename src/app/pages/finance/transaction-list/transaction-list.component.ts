import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Transaction, TransactionType } from '../../../models/transaction.model';
import { TransactionFormComponent } from '../transaction-form/transaction-form.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Data } from '@angular/router';
import { DataFetchService } from '../../../services/data-fetch.service';
import { DataSendService } from '../../../services/data-send.service';
import { PageEvent } from '@angular/material/paginator';

interface Category {
  id: number;
  name: string;
  type: string;
}

@Component({
  selector: 'app-transactions-list',
  templateUrl: './transaction-list.component.html',
  standalone: false,
  styleUrls: ['./transaction-list.component.scss']
})
export class TransactionsListComponent implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  categories: Category[] = [];
  loading = true;
  searchTerm = '';
  pageSize: number = 50;
  currentPage: number = 0;
  filter: any = {};
  totalCount: number = 0;
  selectedType: string = 'all';
  selectedCategory: string = 'all';
  
  displayedColumns: string[] = ['date', 'type', 'category', 'description', 'amount', 'actions'];

  constructor(
    private transactionFetchService: DataFetchService,
    private transactionSendService: DataSendService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadCategories();
    this.loadTransactions();
  }

  loadCategories(): void {
    this.transactionFetchService.getCategories().subscribe(
      data => {
        this.categories = data;
      },
      error => {
        console.error('Error loading categories', error);
        this.snackBar.open('Error loading categories', 'Close', { duration: 3000 });
      }
    );
  }

  loadTransactions(): void {
    this.loading = true;
    this.filter.pageNumber = this.currentPage + 1;
    this.filter.pageSize = this.pageSize;
    this.transactionFetchService.getAllTransactions(this.filter).subscribe(
      data => {
        this.transactions = data.transactions;
        this.totalCount = data.totalCount;
        this.loading = false;
      },
      error => {
        console.error('Error loading transactions', error);
        this.loading = false;
        this.snackBar.open('Error loading transactions', 'Close', { duration: 3000 });
      }
    );
  }

  filterCallback(type: string | number, id: string) {
    this.filter[type] = id;
    this.applyFilters();
  }

  applyFilters(): void {
    this.loadTransactions();
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTransactions();
  }

  onTypeFilterChange(): void {
    if (this.selectedType === 'all') {
      delete this.filter['type'];
    } else {
      this.filter['type'] = this.selectedType;
    }
    this.currentPage = 0;
    this.applyFilters();
  }

  onCategoryFilterChange(): void {
    if (this.selectedCategory === 'all') {
      delete this.filter['category'];
    } else {
      this.filter['category'] = this.selectedCategory;
    }
    this.currentPage = 0;
    this.applyFilters();
  }

  get filteredCategories(): Category[] {
    if (this.selectedType === 'all') {
      return this.categories;
    }
    return this.categories.filter(cat => 
      cat.type.toLowerCase() === this.selectedType.toLowerCase()
    );
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