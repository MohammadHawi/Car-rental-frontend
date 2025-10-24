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
  today = new Date();
  thirtyDaysAgo = new Date();

  constructor(
    private transactionFetschService: DataFetchService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    
    this.thirtyDaysAgo.setDate(this.today.getDate() - 1);
    
    this.dateRangeForm = this.fb.group({
      startDate: [this.thirtyDaysAgo],
      endDate: [this.today]
    });
    
    this.loadFinancialData();
  }

  loadFinancialData(): void {
    this.loading = true;
    this.error = false;
    let { startDate, endDate } = this.dateRangeForm.value;
    
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
      

    if (startDate instanceof Date) {
    startDate = startDate.toISOString();
    }
    if (endDate instanceof Date) {
      endDate = endDate.toISOString();
    }

    this.transactionFetschService.getAllTransactions({
      startDate: startDate,
      endDate: endDate
    }).subscribe(
      data => {
        this.recentTransactions = data.transactions;
      },
      error => {
        console.error('Error loading daily transactions', error);
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