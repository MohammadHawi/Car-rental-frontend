import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { VehiclesComponent } from './pages/vehicles/vehicles.component';
import { CustomersComponent } from './pages/customers/customers.component';
import { ContractsComponent } from './pages/contracts/contracts.component';
import { FinanceDashboardComponent } from './pages/finance/finance-dashboard/finance-dashboard.component';
import { TransactionFormComponent } from './pages/finance/transaction-form/transaction-form.component';
import { TransactionsListComponent } from './pages/finance/transaction-list/transaction-list.component';
import { BookingCalendarComponent } from './pages/booking-calendar/booking-calendar/booking-calendar.component';
import { TaskListComponent } from './pages/tasks/task-list/task-list.component';
import { CompletedTasksComponent } from './pages/tasks/completed-tasks/completed-tasks.component';
import { CarHistoryComponent } from './pages/vehicles/car-history/car-history.component';
import { ViewContractComponent } from './pages/contracts/view-contract/view-contract.component';
import { StatisticsComponent } from './pages/statistics/statistics.component';
import { CarStatisticsComponent } from './pages/statistics/car-statistics/car-statistics.component';
// import { ContractsComponent } from './pages/contracts/contracts.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'cars', component: VehiclesComponent },
  { path: 'cars/:id/history', component: CarHistoryComponent },
  { path: 'customers', component: CustomersComponent },
  { path: 'contracts', component: ContractsComponent },
  { path: 'finance', component: FinanceDashboardComponent },
  { path: 'finance/create', component: TransactionFormComponent },
  { path: 'finance/list', component: TransactionsListComponent },
  
  { path: 'booking-calendar', component: BookingCalendarComponent },
  { path: 'tasks/active', component: TaskListComponent },
  { path: 'tasks/completed', component: CompletedTasksComponent },
  { path: 'contracts/:id',component: ViewContractComponent },
  { path: 'statistics', component: StatisticsComponent },
  { path: 'statistics/cars', component: CarStatisticsComponent },
  { path: '**', redirectTo: '/dashboard' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }