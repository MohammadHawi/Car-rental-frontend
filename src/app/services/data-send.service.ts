import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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

  returnContract(contractId: number, checkInDate: Date): Observable<any> {
    let url: string = `${this.appconf.apiBaseUrl}/contracts/return/${contractId}`;
    return this.http.post<any>(url, {checkInDate: new Date}, {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
