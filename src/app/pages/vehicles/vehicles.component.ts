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


interface Car {
  id: number;
  plate: string;
  brand?: string;
  class?: string;
  model?: number;
  color?: string;
  // Add status info
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
  
  // ... other properties
}

@Component({
  selector: 'app-vehicles',
  standalone: false,
  templateUrl: './vehicles.component.html',
  styleUrl: './vehicles.component.scss'
})

export class VehiclesComponent {
  displayedColumns: string[] = ["Plate","Brand", "Class", "Model", "Color" ,"Status", "actions"];
  dataSource: MatTableDataSource<Car> = new MatTableDataSource<Car>()
  statusFilter = "all"
  customers: any[] = [];
  totalCount: number = 0;
  pageSize: number = 100;
  currentPage: number = 0;
  totalRentedCars: number = 0;
  contracts: Contract[] = [];
  filter:any = {};
  isLoading = false;
  Nationalities: any = {};
  searchTimeout: any;
  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private dataFetchService: DataFetchService,private dialog: MatDialog,
    private dataSendService: DataSendService, public snackBar: MatSnackBar,private router: Router

  ) {
  }

  ngOnInit(): void {
    this.fetchCarsAndContracts();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  // fetchCars() {
  //   this.dataFetchService
  //     .getCars(this.filter, this.currentPage + 1, this.pageSize)
  //     .subscribe({
  //       next: (data: any) => {
  //         this.totalCount = data.totalCount;
  //         this.dataSource.data = data.cars;
  
  //         // Re-attach sort to ensure it's bound after data update
  //         this.dataSource.sort = this.sort;
  //       },
  //       error: (error: any) => {
  //         console.error("Error fetching cars:", error);
  //       },
  //     });
  // }

  async fetchCarsAndContracts() {
    try {
      // Fetch both cars and contracts
      await Promise.all([
        this.fetchCars(),
        this.fetchContracts()
      ]);
      
      // Merge the data
      this.mergeCarsWithStatus();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  fetchCars(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.dataFetchService
        .getCars(this.filter, this.currentPage + 1, this.pageSize)
        .subscribe({
          next: (data: any) => {
            this.totalCount = data.totalCount;
            this.dataSource.data = data.cars;
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
        .getContracts('', 1, 1000) // Get all active contracts
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
    this.dataSource.data = this.dataSource.data.map((car: Car) => {
      // Find active contract for this car
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
    this.currentPage = 0;
    this.pageSize = 100;
    this.applyFilter();
  }


  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex; // MatPaginator is 0-based, API expects 1-based
    this.pageSize = event.pageSize;
  
    
    this.fetchCarsAndContracts(); // Fetch data again with new pagination values
  }

   editCar(car: Car) {
    // Navigate to edit car page or open dialog
    console.log('Edit car:', car);
    // Example: this.router.navigate(['/cars/edit', car.id]);
  }

  addCar() {
    // Navigate to add car page or open dialog
    console.log('Add new car');
    // Example: this.router.navigate(['/cars/add']);
  }

  viewContract(car: Car) {
    if (car.statusInfo?.contractId) {
      // Navigate to contract details
      console.log('View contract:', car.statusInfo.contractId);
      // Example: this.router.navigate(['/contracts', car.statusInfo.contractId]);
    }
  }

  viewCarDetails(car: Car) {
    // Show car details dialog or navigate to details page
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
  // Optional: implement real-time search with debouncing
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
        data: {Plate : car.plate, CheckOut : new Date()} 
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
              this.fetchContracts(); 
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
}
