import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';

import { AppComponent } from './app.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { HeaderComponent } from './shared/header/header.component';
import { VehiclesComponent } from './pages/vehicles/vehicles.component';
import { CustomersComponent } from './pages/customers/customers.component';
// import { ContractsComponent } from './pages/contracts/contracts.component';

import { AppRoutingModule } from './app-routing.module';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';
import { AddcustomerComponent } from './pages/customers/addcustomer/addcustomer.component';
import { EditCustomerComponent } from './pages/customers/edit-customer/edit-customer.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSortModule } from '@angular/material/sort';
import { ConfirmDialogComponent } from './shared/confirm-dialog/confirm-dialog.component';
import { ContractsComponent } from './pages/contracts/contracts.component';
import { NewcontractComponent } from './pages/contracts/newcontract/newcontract.component';
import { EditContractComponent } from './pages/contracts/editcontract/editcontract.component';
import { ReturnContractComponent } from './pages/contracts/return-contract/return-contract.component';
import { FinanceDashboardComponent } from './pages/finance/finance-dashboard/finance-dashboard.component';
import { TransactionsListComponent } from './pages/finance/transaction-list/transaction-list.component';
import { TransactionFormComponent } from './pages/finance/transaction-form/transaction-form.component';
import { BookingCalendarComponent } from './pages/booking-calendar/booking-calendar/booking-calendar.component';
import { NewBookingComponent } from './pages/booking-calendar/new-booking/new-booking.component';
import { TaskFormComponent } from './pages/tasks/task-form/task-form.component';
import { TaskListComponent } from './pages/tasks/task-list/task-list.component';
import { CompletedTasksComponent } from './pages/tasks/completed-tasks/completed-tasks.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    SidebarComponent,
    HeaderComponent,
    VehiclesComponent,
    CustomersComponent,
    AddcustomerComponent,
    EditCustomerComponent,
    ConfirmDialogComponent,
    ContractsComponent,
    NewcontractComponent,
    EditContractComponent,
    ReturnContractComponent,
    FinanceDashboardComponent,
    TransactionsListComponent,
    TransactionFormComponent,
    BookingCalendarComponent,
    NewBookingComponent,
    TaskFormComponent,
    TaskListComponent,
    CompletedTasksComponent
    ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule,
    AppRoutingModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatTableModule,
    MatPaginatorModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSortModule,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatTabsModule,
    MatBadgeModule
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }