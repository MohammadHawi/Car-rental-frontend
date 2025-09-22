import { Component, OnInit } from '@angular/core';
import { FinancialSummary, Transaction } from '../../../models/transaction.model';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Data } from '@angular/router';
import { DataFetchService } from '../../../services/data-fetch.service';

@Component({
  selector: 'app-finance-dashboard',
  templateUrl: './finance-dashboard.component.html',
  standalone: false,
  styleUrls: ['./finance-dashboard.component.scss']
})
export class FinanceDashboardComponent implements OnInit {
  financialSummary!: FinancialSummary;
  recentTransactions: Transaction[] = [];
  dateRangeForm!: FormGroup;
  loading = true;
  error = false;

  constructor(
    private transactionFetschService: DataFetchService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    this.dateRangeForm = this.fb.group({
      startDate: [thirtyDaysAgo],
      endDate: [today]
    });
    
    this.loadFinancialData();
  }

  loadFinancialData(): void {
    this.loading = true;
    this.error = false;
    
    const { startDate, endDate } = this.dateRangeForm.value;
    
    this.transactionFetschService.getFinancialSummary(startDate, endDate)
      .subscribe(
        summary => {
          this.financialSummary = summary;
          this.loading = false;
        },
        error => {
          console.error('Error loading financial summary', error);
          this.error = true;
          this.loading = false;
        }
      );
      
    this.transactionFetschService.getAllTransactions()
      .subscribe(
        transactions => {
          this.recentTransactions = transactions.slice(0, 5);
        },
        error => {
          console.error('Error loading recent transactions', error);
        }
      );
  }

  onDateRangeChange(): void {
    this.loadFinancialData();
  }

  getCategoryName(category: number): string {
    return this.transactionFetschService.getCategoryName(category);
  }

  getTypeName(type: number): string {
    return this.transactionFetschService.getTypeName(type);
  }
}