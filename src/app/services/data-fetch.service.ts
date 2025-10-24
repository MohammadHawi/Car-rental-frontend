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

  getAllTransactions(filter?:any): Observable<any> {
    let params = new HttpParams();

    if (filter) {
      if (filter.pageNumber !== undefined) params = params.set('pageNumber', filter.pageNumber);
      if (filter.pageSize !== undefined) params = params.set('pageSize', filter.pageSize);
      if (filter.type !== undefined) params = params.set('type', filter.type);
      if (filter.category !== undefined) params = params.set('category', filter.category);
      if (filter.searchQuery) params = params.set('searchQuery', filter.searchQuery);
      if (filter.startDate) params = params.set('startDate', filter.startDate);
      if (filter.endDate) params = params.set('endDate', filter.endDate);
    }
    return this.http.get<any>(`${this.apiUrl}/transaction`, { params });
  }

  getNationalities(): Observable<any> {
    return this.http.get(`${this.apiUrl}/Routes/fetch/nationalities`);
  }

  getCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/Routes/fetch/categories`);
  }

  searchCustomersByName(name: string) {
    return this.http.get(`${this.apiUrl}/customers/search?name=${name}`);
  }
  
  getContractById(contractId: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/contracts/${contractId}`);
  }

  getContractResponseById(contractId: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/contracts/getResponse/${contractId}`);
  }

  getCarById(carId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/cars/${carId}`);
  }
  
  getReservations(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reservations`);
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

  getCarHistory(carId: number): Observable<any> {
     return this.http.get<any>(`${this.apiUrl}/cars/${carId}/history`);
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

  // ==================== CAR STATISTICS ====================

  /**
   * Get yearly report for a specific car
   */
  getCarYearlyReport(carId: number, year: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistics/cars/${carId}/yearly/${year}`);
  }

  /**
   * Get yearly reports for all cars
   */
  getAllCarsYearlyReport(year: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistics/cars/yearly/${year}`);
  }

  /**
   * Get monthly averages for rental days across all cars
   */
  getMonthlyAverages(year: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistics/cars/monthly-averages/${year}`);
  }

  /**
   * Get best performing cars by rental days
   */
  getBestPerformingCars(year: number, topCount: number = 10): Observable<any> {
    const params = new HttpParams().set('topCount', topCount.toString());
    return this.http.get(`${this.apiUrl}/statistics/cars/best-performing/${year}`, { params });
  }

  /**
   * Get car statistics with optional date range filter
   */
  getCarStatistics(startDate?: Date, endDate?: Date): Observable<any> {
    let params = new HttpParams();
    
    if (startDate) {
      params = params.set('startDate', startDate.toISOString());
    }
    if (endDate) {
      params = params.set('endDate', endDate.toISOString());
    }

    return this.http.get(`${this.apiUrl}/statistics/cars`, { params });
  }

  // ==================== CUSTOMER STATISTICS ====================

  /**
   * Get statistics for a specific customer (for customer profile)
   */
  getCustomerStatistics(customerId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistics/customers/${customerId}`);
  }

  /**
   * Get VIP customers ranked by profit
   */
  getVIPCustomers(topCount: number = 20): Observable<any> {
    const params = new HttpParams().set('topCount', topCount.toString());
    return this.http.get(`${this.apiUrl}/statistics/customers/vip`, { params });
  }

  /**
   * Get statistics for all customers
   */
  getAllCustomerStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistics/customers`);
  }

  // ==================== BUSINESS STATISTICS ====================

  /**
   * Get overall business statistics and dashboard data
   */
  getBusinessStatistics(year?: number): Observable<any> {
    let params = new HttpParams();
    
    if (year) {
      params = params.set('year', year.toString());
    }

    return this.http.get(`${this.apiUrl}/statistics/business`, { params });
  }

  /**
   * Get brand performance statistics
   */
  getBrandPerformance(year?: number): Observable<any> {
    let params = new HttpParams();
    
    if (year) {
      params = params.set('year', year.toString());
    }

    return this.http.get(`${this.apiUrl}/statistics/brands`, { params });
  }

}
