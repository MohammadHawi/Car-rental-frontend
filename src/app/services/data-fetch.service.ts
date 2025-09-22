import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FinancialSummary, Transaction, TransactionType } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class DataFetchService {
  private apiUrl = 'http://localhost:5008/api'; 

  constructor(private http: HttpClient) {}

  // Example method to fetch customers
  getCustomers(filter?:any, pageNumber?: number, pageSize?: number): Observable<any> {
    
    let url: string = `${this.apiUrl}/customers/fetch/all`;
    let queryParams: string[] = [];
    if (filter) {
      if (filter.search_query) {
        queryParams.push(`search_query=${filter.search_query}`);
      }
    }
    if (pageNumber !== undefined) {
      queryParams.push(`pageNumber=${pageNumber}`);
    }

    if (pageSize !== undefined) {
      queryParams.push(`pageSize=${pageSize}`);
    }
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    } 
    return this.http.get<any>(url);
  }

  getCars(filter?:any, pageNumber?: number, pageSize?: number): Observable<any> {
    
    let url: string = `${this.apiUrl}/cars/fetch/all`;
    let queryParams: string[] = [];
    if (filter) {
      if (filter.search_query) {
        queryParams.push(`search_query=${filter.search_query}`);
      }
    }
    if (pageNumber !== undefined) {
      queryParams.push(`pageNumber=${pageNumber}`);
    }

    if (pageSize !== undefined) {
      queryParams.push(`pageSize=${pageSize}`);
    }
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    } 
    return this.http.get<any>(url);
  }

  getContracts(filter?:any, pageNumber?: number, pageSize?: number): Observable<any> {
    
    let url: string = `${this.apiUrl}/contracts/fetch/all`;
    let queryParams: string[] = [];
    if (filter) {
      if (filter.search_query) {
        queryParams.push(`search_query=${filter.search_query}`);
      }
    }
    if (pageNumber !== undefined) {
      queryParams.push(`pageNumber=${pageNumber}`);
    }

    if (pageSize !== undefined) {
      queryParams.push(`pageSize=${pageSize}`);
    }
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    } 
    return this.http.get<any>(url);
  }

  getNationalities(): Observable<any> {
    return this.http.get(`${this.apiUrl}/Nationality`);
  }

  searchCustomersByName(name: string) {
    return this.http.get(`${this.apiUrl}/customers/search?name=${name}`);
  }
  
  getContractById(contractId: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/contracts/${contractId}`);
  }

  getCarById(carId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/cars/${carId}`);
  }
  
  getReservations(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reservations`);
  }

  getAllTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/transaction`);
  }

  getIncomeTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/income`);
  }

  getExpenseTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/expenses`);
  }

  getTransaction(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
  }

  getFinancialSummary(startDate?: Date, endDate?: Date): Observable<FinancialSummary> {
    let params = new HttpParams();
    
    if (startDate) {
      params = params.set('startDate', startDate.toISOString());
    }
    
    if (endDate) {
      params = params.set('endDate', endDate.toISOString());
    }
    
    return this.http.get<FinancialSummary>(`${this.apiUrl}/transaction/summary`, { params });
  }

  getCategoryName(category: number): string {
    const categories = {
      1: 'Rental Payment',
      2: 'Deposit',
      3: 'Late Fee',
      4: 'Damage Fee',
      5: 'Maintenance',
      6: 'Insurance',
      7: 'Fuel',
      8: 'Taxes',
      9: 'Salaries',
      10: 'Utilities',
      11: 'Marketing',
      12: 'Office Costs',
      13: 'Vehicle Purchase',
      14: 'Other'
    };
    
    return categories[category as keyof typeof categories] || 'Unknown';
  }

  getTypeName(type: TransactionType): string {
    return TransactionType[type];
  }
}
