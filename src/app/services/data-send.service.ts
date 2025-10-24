import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateTransaction, Transaction, UpdateTransaction } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class DataSendService {
  private appconf = {
    apiBaseUrl: 'http://localhost:5008/api'
  };
  
  constructor(private http: HttpClient) { }

  crtCustomer(data: any): Observable<any> {
    let url: string = `${this.appconf.apiBaseUrl}/customers`;
    return this.http.post<any>(url, data, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  deleteCustomer(customerId: number) {
    let url: string = `${this.appconf.apiBaseUrl}/customers`;
    return this.http.delete<any>(url + '/' + customerId, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  updateCustomer(customerId: number, customerData: any) {
    let url: string = `${this.appconf.apiBaseUrl}/customers`;
    return this.http.put<any>(url +'/' + customerId , customerData , {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  

  deleteContract(contractId: number) {
    let url: string = `${this.appconf.apiBaseUrl}/contracts`;
    return this.http.delete<any>(url + '/' + contractId, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  updateContract(data: any): Observable<any> {
    let url: string = `${this.appconf.apiBaseUrl}/contracts`;
    return this.http.put<any>(url, data, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  crtContract(data: any): Observable<any> {
    let url: string = `${this.appconf.apiBaseUrl}/contracts`;
    return this.http.post<any>(url, data, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  returnContract(contractId: number, CheckInDate: string): Observable<any> {
    let url: string = `${this.appconf.apiBaseUrl}/contracts/return/${contractId}`;
    return this.http.post<any>(url, {CheckInDate}, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  extendContract(contractId: number, CheckInDate: string): Observable<any> {
    let url: string = `${this.appconf.apiBaseUrl}/contracts/extend/${contractId}`;
    return this.http.post<any>(url, {CheckInDate}, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  createTransaction(transaction: any): Observable<Transaction> {
    return this.http.post<any>(`${this.appconf.apiBaseUrl}/transaction`, transaction);
  }

  updateTransaction(id: number, transaction: UpdateTransaction): Observable<void> {
    return this.http.put<any>(`${this.appconf.apiBaseUrl}/transaction/${id}`, transaction);
  }

  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<any>(`${this.appconf.apiBaseUrl}/transaction/${id}`);
  }
}
