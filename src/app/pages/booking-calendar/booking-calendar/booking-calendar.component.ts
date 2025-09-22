import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { FormBuilder, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NewBookingComponent } from '../new-booking/new-booking.component';
import { DataFetchService } from '../../../services/data-fetch.service';
import { DataSendService } from '../../../services/data-send.service';

interface CalendarDay {
  date: Date;
  day: number;
  month: number;
  year: number;
  isWeekend: boolean;
  isToday: boolean;
}

interface BookingEvent {
  contractId: number;
  carId: number;
  startDate: Date;
  endDate: Date;
  customerName: string;
  status: string;
}

@Component({
  selector: 'app-booking-calendar',
  templateUrl: './booking-calendar.component.html',
  styleUrls: ['./booking-calendar.component.scss'],
  standalone: false,
  providers: [DatePipe]
})
export class BookingCalendarComponent implements OnInit {
  @ViewChild('calendarContainer') calendarContainer!: ElementRef;
  
  cars: any[] = [];
  contracts: any[] = [];
  bookingEvents: BookingEvent[] = [];
  calendarDays: CalendarDay[] = [];
  
  viewMode: 'week' | 'month' = 'week';
  currentDate: Date = new Date();
  startDate!: Date;
  endDate!: Date;
  
  filterForm: FormGroup;
  isLoading = true;
  pageSize = 100;
  currentPage: number = 0;
  filter:any = {};
  isFullscreen: boolean = false;
  private fullscreenElement: HTMLElement | null = null;
  
  constructor(
    private dataFetchService: DataFetchService,
    private dataSendService: DataSendService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.fb.group({
      carStatus: ['all'], // all, available, rented
      dateRange: [null]
    });
  }

  toggleFullscreen(): void {
    if (!this.isFullscreen) {
      this.enterFullscreen();
    } else {
      this.exitFullscreen();
    }
  }

  private enterFullscreen(): void {
    const element = document.querySelector('.booking-calendar-container') as HTMLElement;
    
    if (element) {
      this.fullscreenElement = element;
      
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        (element as any).webkitRequestFullscreen();
      } else if ((element as any).msRequestFullscreen) {
        (element as any).msRequestFullscreen();
      }
      
      this.isFullscreen = true;
      element.classList.add('fullscreen-mode');
    }
  }

  private exitFullscreen(): void {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }
    
    this.isFullscreen = false;
    if (this.fullscreenElement) {
      this.fullscreenElement.classList.remove('fullscreen-mode');
    }
  }

  
  ngOnInit(): void {
    this.initCalendar();
    this.loadData();
    this.checkDataStructure();
    this.addFullscreenEventListeners();
  }

  private addFullscreenEventListeners(): void {
    document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
    document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
    document.addEventListener('msfullscreenchange', () => this.handleFullscreenChange());
  }

  private handleFullscreenChange(): void {
    const isCurrentlyFullscreen = !!(document.fullscreenElement || 
                                    (document as any).webkitFullscreenElement || 
                                    (document as any).msFullscreenElement);
    
    if (!isCurrentlyFullscreen && this.isFullscreen) {
      this.isFullscreen = false;
      if (this.fullscreenElement) {
        this.fullscreenElement.classList.remove('fullscreen-mode');
      }
    }
  }

  // Don't forget to clean up event listeners
  ngOnDestroy(): void {
    document.removeEventListener('fullscreenchange', () => this.handleFullscreenChange());
    document.removeEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
    document.removeEventListener('msfullscreenchange', () => this.handleFullscreenChange());
  }

  checkDataStructure(): void {
  console.log('=== DATA STRUCTURE CHECK ===');
  
  if (this.cars.length > 0) {
    console.log('Sample car:', this.cars[0]);
    console.log('Car ID type:', typeof this.cars[0].id);
  }
  
  if (this.contracts.length > 0) {
    console.log('Sample contract:', this.contracts[0]);
    console.log('Contract carId type:', typeof this.contracts[0].carId);
    console.log('Contract status type:', typeof this.contracts[0].status);
    console.log('Contract checkOut type:', typeof this.contracts[0].checkOut);
  }
  
  if (this.bookingEvents.length > 0) {
    console.log('Sample booking event:', this.bookingEvents[0]);
  }
}
  
  initCalendar(): void {
    this.startDate = this.getStartOfWeek(this.currentDate);
    
    if (this.viewMode === 'week') {
      this.endDate = new Date(this.startDate);
      this.endDate.setDate(this.startDate.getDate() + 6);
      this.generateCalendarDays(this.startDate, this.endDate);
    } else {
      this.endDate = new Date(this.startDate);
      this.endDate.setMonth(this.endDate.getMonth() + 1);
      this.endDate.setDate(0); // Last day of the month
      this.generateCalendarDays(this.startDate, this.endDate);
    }
  }
  
  generateCalendarDays(start: Date, end: Date): void {
    this.calendarDays = [];
    const today = new Date();
    
    let currentDate = new Date(start);
    while (currentDate <= end) {
      const day = currentDate.getDate();
      const month = currentDate.getMonth();
      const year = currentDate.getFullYear();
      const dayOfWeek = currentDate.getDay();
      
      this.calendarDays.push({
        date: new Date(currentDate),
        day,
        month,
        year,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        isToday: this.isSameDay(currentDate, today)
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }
  
  loadData(): void {
    this.isLoading = true;
    
    // Load cars
    this.dataFetchService.getCars(this.filter,this.currentPage+1,this.pageSize).subscribe(data => {
      this.cars = data.cars;
      
      // Load contracts
      this.dataFetchService.getContracts(this.filter,this.currentPage+1,this.pageSize).subscribe(data => {
        this.contracts = data.contracts;
        this.processBookingEvents();
        console.log(this.bookingEvents)
        this.isLoading = false;
      }, error => {
        console.error('Error loading contracts', error);
        this.isLoading = false;
        this.snackBar.open('Error loading contracts', 'Close', { duration: 3000 });
      });
    }, error => {
      console.error('Error loading cars', error);
      this.isLoading = false;
      this.snackBar.open('Error loading cars', 'Close', { duration: 3000 });
    });
    // console.log(this.cars)
  }
  
  processBookingEvents(): void {
    this.bookingEvents = [];
    console.log(this.contracts, "from processBookingEvents ")
    
    this.contracts.forEach(contract => {
      if (!contract.checkOut || !contract.checkIn) return;
      
      const startDate = new Date(contract.checkOut);
      const endDate = new Date(contract.checkIn);
      
      // Skip contracts that are outside our current view
      // if (endDate < this.startDate || startDate > this.endDate) return;
      
      this.bookingEvents.push({
        contractId: contract.id,
        carId: contract.carId,
        startDate,
        endDate,
        customerName: contract.customerName || 'Unknown Customer',
        status: contract.status
      });
    });
  }
  
  previousPeriod(): void {
    if (this.viewMode === 'week') {
      this.currentDate.setDate(this.currentDate.getDate() - 7);
    } else {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    }
    this.initCalendar();
    this.processBookingEvents();
  }
  
  nextPeriod(): void {
    if (this.viewMode === 'week') {
      this.currentDate.setDate(this.currentDate.getDate() + 7);
    } else {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    }
    this.initCalendar();
    this.processBookingEvents();
  }
  
  today(): void {
    this.currentDate = new Date();
    this.initCalendar();
    this.processBookingEvents();
  }
  
  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'week' ? 'month' : 'week';
    this.initCalendar();
    this.processBookingEvents();
  }
  
  getStartOfWeek(date: Date): Date {
    const result = new Date(date);
    const day = result.getDay();
    const diff = result.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    result.setDate(diff);
    return result;
  }
  
  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }
  
  isCarBooked(carId: number, date: Date): BookingEvent | null {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    return this.bookingEvents.find(event => 
      event.carId === carId && 
      event.startDate <= dayEnd && 
      event.endDate >= dayStart
    ) || null;
  }
  
  getBookingStatus(event: BookingEvent | null): string {
    if (!event) return 'available';
    
    switch (event.status) {
      case '1': return 'active';
      case '2': return 'overdue';
      case '3': return 'closed';
      default: return 'active';
    }
  }

  // Add this method to your BookingCalendarComponent class

  // Replace your existing isCarCurrentlyRented method with this debug version

// isCarCurrentlyRented(carId: number): boolean {
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);
  
//   const currentBookings = this.bookingEvents.filter(event => 
//     event.carId === carId && 
//     event.startDate <= today && 
//     event.endDate >= today &&
//     (event.status === '1' || event.status === '2') // active or overdue
//   );
  
//   // Debug logging
//   // console.log(`Car ${carId}:`, {
//   //   today: today,
//   //   bookings: currentBookings,
//   //   isRented: currentBookings.length > 0
//   // });
  
//   return currentBookings.length > 0;
// }

// Update your existing isCarCurrentlyRented method with this improved version
isCarCurrentlyRented(carId: number): boolean {
  // First check if we have any booking events
  if (!this.bookingEvents || this.bookingEvents.length === 0) {
    return false;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const currentBookings = this.bookingEvents.filter(event => {
    // Handle car ID comparison (ensure both are same type)
    const eventCarId = parseInt(event.carId.toString());
    const currentCarId = parseInt(carId.toString());
    
    if (eventCarId !== currentCarId) {
      return false;
    }
    
    // Handle date comparison more carefully
    let eventStart: Date;
    let eventEnd: Date;
    
    try {
      eventStart = new Date(event.startDate);
      eventEnd = new Date(event.endDate);
    } catch (error) {
      console.error('Date parsing error:', error);
      return false;
    }
    
    // Check if dates are valid
    if (isNaN(eventStart.getTime()) || isNaN(eventEnd.getTime())) {
      return false;
    }
    
    // Set hours for proper comparison
    eventStart.setHours(0, 0, 0, 0);
    eventEnd.setHours(23, 59, 59, 999);
    
    // Check if today falls within the rental period
    const isInDateRange = eventStart <= today && eventEnd >= today;
    
    // Handle status comparison (convert to string for comparison)
    const statusStr = event.status.toString();
    const isActiveStatus = statusStr === '1' || statusStr === '2' || 
                          statusStr === 'active' || statusStr === 'overdue';
    
    return isInDateRange && isActiveStatus;
  });
  
  return currentBookings.length > 0;
}

// Optional: Add a method to get more detailed rental status
getCarRentalStatus(carId: number): { isRented: boolean, status: string, customerName?: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const currentBooking = this.bookingEvents.find(event => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    
    eventStart.setHours(0, 0, 0, 0);
    eventEnd.setHours(23, 59, 59, 999);
    
    return event.carId === carId && 
           eventStart <= today && 
           eventEnd >= today &&
           (event.status === '1' || event.status === '2');
  });
  
  if (currentBooking) {
    return {
      isRented: true,
      status: currentBooking.status === '1' ? 'active' : 'overdue',
      customerName: currentBooking.customerName
    };
  }
  
  return { isRented: false, status: 'available' };
}
  
  // openBookingDialog(car: any, date: Date): void {
  //   const booking = this.isCarBooked(car.id, date);
    
  //   if (booking) {
  //     // Navigate to contract details
  //     this.router.navigate(['/contracts', booking.contractId]);
  //   } else {
  //     // Navigate to new contract form with pre-filled data
  //     const dateStr = this.datePipe.transform(date, 'yyyy-MM-dd');
  //     this.router.navigate(['/contracts/new'], { 
  //       queryParams: { 
  //         carId: car.id,
  //         startDate: dateStr
  //       } 
  //     });
  //   }
  // }
  
  applyFilters(): void {
    // Implementation for filtering cars and dates
    this.loadData();
  }
  
  resetFilters(): void {
    this.filterForm.reset({
      carStatus: 'all',
      dateRange: null
    });
    this.loadData();
  }
  
  getFormattedPeriod(): string {
    if (this.viewMode === 'week') {
      return `${this.datePipe.transform(this.startDate, 'MMM d')} - ${this.datePipe.transform(this.endDate, 'MMM d, yyyy')}`;
    } else {
      return this.datePipe.transform(this.startDate, 'MMMM yyyy') || '';
    }
  }
  
  scrollLeft(): void {
    if (this.calendarContainer) {
      this.calendarContainer.nativeElement.scrollLeft -= 200;
    }
  }
  
  scrollRight(): void {
    if (this.calendarContainer) {
      this.calendarContainer.nativeElement.scrollLeft += 200;
    }
  }

  openBookingDialog(car: any, date: Date): void {
    const booking = this.isCarBooked(car.id, date);
    
    if (booking) {
      // Open dialog in edit mode
      const dialogRef = this.dialog.open(NewBookingComponent, {
        data: {
          carId: car.id,
          date: date,
          contractId: booking.contractId
        }
      });
      
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loadData();
        }
      });
    } else {
      // Open dialog in create mode
      const dialogRef = this.dialog.open(NewBookingComponent, {
        data: {
          carId: car.id,
          date: date
        }
      });
      
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loadData();
        }
      });
    }
  }

// Add these ViewChild references to your component class
@ViewChild('daysHeader') daysHeader!: ElementRef;
@ViewChild('rowsContainer') rowsContainer!: ElementRef;
@ViewChild('carLabelsScroll') carLabelsScroll!: ElementRef; // Add this new ViewChild

// Add these properties to prevent infinite scroll loops
private isScrollingHeader = false;
private isScrollingRows = false;
private isScrollingCarLabels = false; // Add this new property

// Update your existing scroll methods and add the new one
onHeaderScroll(event: Event): void {
  if (this.isScrollingRows) {
    return;
  }
  
  const target = event.target as HTMLElement;
  const scrollLeft = target.scrollLeft;
  
  this.isScrollingHeader = true;
  this.rowsContainer.nativeElement.scrollLeft = scrollLeft;
  
  // Reset flag after scroll completes
  setTimeout(() => {
    this.isScrollingHeader = false;
  }, 10);
}

onRowsScroll(event: Event): void {
  if (this.isScrollingHeader || this.isScrollingCarLabels) {
    return;
  }
  
  const target = event.target as HTMLElement;
  const scrollLeft = target.scrollLeft;
  const scrollTop = target.scrollTop;
  
  this.isScrollingRows = true;
  
  // Sync horizontal scroll with header
  this.daysHeader.nativeElement.scrollLeft = scrollLeft;
  
  // Sync vertical scroll with car labels
  this.carLabelsScroll.nativeElement.scrollTop = scrollTop;
  
  // Reset flag after scroll completes
  setTimeout(() => {
    this.isScrollingRows = false;
  }, 10);
}

// Add this new method for car labels scroll
onCarLabelsScroll(event: Event): void {
  if (this.isScrollingRows) {
    return;
  }
  
  const target = event.target as HTMLElement;
  const scrollTop = target.scrollTop;
  
  this.isScrollingCarLabels = true;
  this.rowsContainer.nativeElement.scrollTop = scrollTop;
  
  // Reset flag after scroll completes
  setTimeout(() => {
    this.isScrollingCarLabels = false;
  }, 10);
}
}