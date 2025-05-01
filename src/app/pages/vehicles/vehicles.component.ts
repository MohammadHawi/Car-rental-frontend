import { Component, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DataFetchService } from '../../services/data-fetch.service';
import { MatDialog } from '@angular/material/dialog';
import { DataSendService } from '../../services/data-send.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';


export interface Car { 
  id: number
  plate: string
  brand: string
  class: string
  model: string
  color: string
}

@Component({
  selector: 'app-vehicles',
  standalone: false,
  templateUrl: './vehicles.component.html',
  styleUrl: './vehicles.component.scss'
})

export class VehiclesComponent {
  displayedColumns: string[] = ["Plate","Brand", "Class", "Model", "Color"];
  dataSource: MatTableDataSource<Car> = new MatTableDataSource<Car>()
  statusFilter = "all"
  customers: any[] = [];
  totalCount: number = 0;
  pageSize: number = 100;
  currentPage: number = 0;
  filter:any = {};
  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private dataFetchService: DataFetchService,private dialog: MatDialog,
    private dataSendService: DataSendService, public snackBar: MatSnackBar

  ) {
  }

  ngOnInit(): void {
    this.fetchCars();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  fetchCars() {
    this.dataFetchService
      .getCars(this.filter, this.currentPage + 1, this.pageSize)
      .subscribe({
        next: (data: any) => {
          this.totalCount = data.totalCount;
          this.dataSource.data = data.cars;
  
          // Re-attach sort to ensure it's bound after data update
          this.dataSource.sort = this.sort;
        },
        error: (error: any) => {
          console.error("Error fetching cars:", error);
        },
      });
  }
  
  
  filterCallback(type: string | number, id: string) {
    this.filter[type] = id;
    this.applyFilter();
  }

  applyFilter(): void {
    this.fetchCars();
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
  
    
    this.fetchCars(); // Fetch data again with new pagination values
  }
}
