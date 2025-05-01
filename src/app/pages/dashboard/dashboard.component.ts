import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: false,
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats = {
    totalCars: 0,
    availableCars: 0,
    totalCustomers: 0,
    activeContracts: 0,
    revenue: 0
  };

  recentContracts: { id: string; customer: string; car: string; startDate: string; endDate: string; status: string; }[] = [];
  popularCars: { model: string; rentals: number; availability: string; }[] = [];

  constructor() { }

  ngOnInit(): void {
    // In a real app, you would fetch this data from your .NET backend
    this.stats = {
      totalCars: 45,
      availableCars: 32,
      totalCustomers: 128,
      activeContracts: 18,
      revenue: 24500
    };
    
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // This would be replaced with actual API calls to your .NET backend
    this.recentContracts = [
      { id: 'C-1001', customer: 'John Doe', car: 'Toyota Camry', startDate: '2023-04-01', endDate: '2023-04-08', status: 'Active' },
      { id: 'C-1002', customer: 'Jane Smith', car: 'Honda Civic', startDate: '2023-04-02', endDate: '2023-04-05', status: 'Active' },
      { id: 'C-1003', customer: 'Robert Johnson', car: 'Ford Focus', startDate: '2023-03-28', endDate: '2023-04-04', status: 'Active' },
      { id: 'C-1004', customer: 'Emily Davis', car: 'Nissan Altima', startDate: '2023-03-30', endDate: '2023-04-06', status: 'Active' }
    ];
    
    this.popularCars = [
      { model: 'Toyota Camry', rentals: 24, availability: '80%' },
      { model: 'Honda Civic', rentals: 22, availability: '65%' },
      { model: 'Ford Focus', rentals: 18, availability: '75%' },
      { model: 'Nissan Altima', rentals: 16, availability: '90%' }
    ];
  }
}