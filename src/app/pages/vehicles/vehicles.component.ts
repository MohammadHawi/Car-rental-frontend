import { Component, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DataFetchService } from '../../services/data-fetch.service';
import { MatDialog } from '@angular/material/dialog';
import { DataSendService } from '../../services/data-send.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { NewcontractComponent } from '../contracts/newcontract/newcontract.component';
import { Router } from '@angular/router';
import { PdfReportService } from '../../services/pdf-report.service';
import { PdfArabicService } from '../../services/pdf-report-arabic.service';

interface Car {
  id: number;
  plate: string;
  brand?: string;
  class?: string;
  model?: number;
  color?: string;
  statusInfo?: {
    isRented: boolean;
    customerName?: string;
    checkIn?: string;
    contractId?: number;
  };
}

interface Contract {
  id: number;
  carId: number;
  cid: number;
  carPlate: string;
  customerName: string;
  price: number;
  checkIn: string;
  checkOut: string;
  status: number;
  phoneNumber: string;
}

@Component({
  selector: 'app-vehicles',
  standalone: false,
  templateUrl: './vehicles.component.html',
  styleUrl: './vehicles.component.scss'
})
export class VehiclesComponent {
  displayedColumns: string[] = ["Plate", "Brand", "Class", "Model", "Color", "Status", "actions"];
  dataSource: MatTableDataSource<Car> = new MatTableDataSource<Car>();
  statusFilter = "all";
  customers: any[] = [];
  totalCount: number = 0;
  pageSize: number = 110;
  currentPage: number = 0;
  totalRentedCars: number = 0;
  contracts: Contract[] = [];
  filter: any = {};
  isLoading = false;
  Nationalities: any = {};
  searchTimeout: any;
  allCars: Car[] = []; // Store all cars before filtering
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private dataFetchService: DataFetchService,
    private pdfReportService: PdfReportService,
    private pdfReportArabicService: PdfReportService,
    private dialog: MatDialog,
    private dataSendService: DataSendService,
    public snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchCarsAndContracts();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  async fetchCarsAndContracts() {
    try {
      this.isLoading = true;
      await Promise.all([
        this.fetchCars(),
        this.fetchContracts()
      ]);
      this.mergeCarsWithStatus();
      this.applyStatusFilter();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  fetchCars(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.dataFetchService
        .getCars(this.filter, this.currentPage + 1, this.pageSize)
        .subscribe({
          next: (data: any) => {
            this.totalCount = data.totalCount;
            this.allCars = data.cars;
            resolve();
          },
          error: (error: any) => {
            console.error("Error fetching cars:", error);
            reject(error);
          },
        });
    });
  }

  fetchContracts(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.dataFetchService
        .getContracts('', 1, 1000)
        .subscribe({
          next: (data: any) => {
            this.totalRentedCars = data.totalCount;
            this.contracts = data.contracts;
            resolve();
          },
          error: (error: any) => {
            console.error("Error fetching contracts:", error);
            reject(error);
          },
        });
    });
  }

  mergeCarsWithStatus() {
    this.allCars = this.allCars.map((car: Car) => {
      const activeContract = this.contracts.find(contract => 
        contract.carId === car.id
      );

      if (activeContract) {
        car.statusInfo = {
          isRented: true,
          customerName: activeContract.customerName,
          checkIn: activeContract.checkIn,
          contractId: activeContract.id
        };
      } else {
        car.statusInfo = {
          isRented: false
        };
      }

      return car;
    });
  }

  applyStatusFilter() {
    let filteredCars = [...this.allCars];

    if (this.statusFilter === 'rented') {
      filteredCars = this.allCars.filter(car => car.statusInfo?.isRented);
    } else if (this.statusFilter === 'available') {
      filteredCars = this.allCars.filter(car => !car.statusInfo?.isRented);
    }

    this.dataSource.data = filteredCars;
    
    // Update total count based on filter
    if (this.statusFilter === 'rented') {
      this.totalCount = this.totalRentedCars;
    } else if (this.statusFilter === 'available') {
      this.totalCount = this.allCars.length - this.totalRentedCars;
    } else {
      this.totalCount = this.allCars.length;
    }
  }

  onStatusFilterChange(): void {
    this.currentPage = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.applyStatusFilter();
  }

  getStatusDisplay(car: Car): string {
    if (!car.statusInfo) return 'Available';
    
    if (car.statusInfo.isRented) {
      const checkInDate = new Date(car.statusInfo.checkIn!).toLocaleDateString();
      return `Rented to: ${car.statusInfo.customerName} (${checkInDate})`;
    }
    
    return 'Available';
  }

  getStatusClass(car: Car): string {
    if (!car.statusInfo) return 'status-available';
    return car.statusInfo.isRented ? 'status-rented' : 'status-available';
  }
  
  filterCallback(type: string | number, id: string) {
    this.filter[type] = id;
    this.applyFilter();
  }

  applyFilter(): void {
    this.fetchCarsAndContracts();
  }

  pageRel(): void {
    this.filter = {};
    this.statusFilter = 'all';
    this.currentPage = 0;
    this.pageSize = 100;
    this.applyFilter();
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchCarsAndContracts();
  }

  editCar(car: Car) {
    console.log('Edit car:', car);
  }

  addCar() {
    console.log('Add new car');
  }

  viewContract(car: Car) {
    if (car.statusInfo?.contractId) {
      console.log('View contract:', car.statusInfo.contractId);
    }
  }

  viewCarDetails(car: Car) {
    console.log('View car details:', car);
  }

  viewHistory(car: Car) {
    this.router.navigate([`/cars/${car.id}/history`]);
  }

  clearSearch(): void {
    this.filter['search_query'] = '';
    this.applyFilter();
  }

  onSearchInput(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.applyFilter();
    }, 300);
  }

  newBooking(car: Car): void {
    const dialogRef = this.dialog.open(NewcontractComponent, {
      width: '800px', 
      height: '600px', 
      data: { Plate: car.plate, CheckOut: new Date() } 
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.pickout instanceof Date) {
          result.pickout.setHours(12, 0, 0, 0);
        }
        if (result.dropin instanceof Date) {
          result.dropin.setHours(12, 0, 0, 0);
        }
        this.dataSendService.crtContract(result).subscribe({
          next: (response: any) => {
            this.snackBar.open("Contract added successfully", "Close", {
              duration: 2000,
            });
            this.fetchCarsAndContracts(); 
          },
          error: (error: any) => {
            this.snackBar.open(error?.error?.message || 'Something went wrong!', undefined, {
              verticalPosition: 'top',
              duration: 3000,
              panelClass: ['error-snackbar'],
            });
          },
        });
      }
    });
  }

  generatePdfReport(): void {
    // Get the currently displayed/filtered cars
    const carsToReport = this.dataSource.data;
    
    if (carsToReport.length === 0) {
      this.snackBar.open('No data to export', 'Close', {
        duration: 2000,
      });
      return;
    }

    // Use the specialized cars report method
    this.pdfReportArabicService.generateCarsReport(
      carsToReport,
      this.totalRentedCars,
      this.statusFilter
    );

    this.snackBar.open('PDF report generated successfully', 'Close', {
      duration: 2000,
    });
  }
}