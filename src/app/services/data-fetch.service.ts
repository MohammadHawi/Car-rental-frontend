import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  
  getContractById(contractId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/contracts/${contractId}`);
  }
  
  getReservations(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reservations`);
  }
}
