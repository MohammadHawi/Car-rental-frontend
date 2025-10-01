import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataFetchService } from '../../../services/data-fetch.service';

@Component({
  selector: 'app-car-history',
  standalone: false,
  templateUrl: './car-history.component.html',
  styleUrls: ['./car-history.component.scss']
})
export class CarHistoryComponent implements OnInit {
  carId!: number;
  carDetails: string = '';
  contracts: any[] = [];
  transactions: any[] = [];
  summary: any;

  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private dataFetchService: DataFetchService
  ) {}

  ngOnInit(): void {
    this.carId = +this.route.snapshot.paramMap.get('id')!;
    this.loadHistory();
  }

  loadHistory() {
    this.isLoading = true;
    this.dataFetchService.getCarHistory(this.carId).subscribe({
      next: (data) => {
        this.carDetails = data.carDetails;
        this.contracts = data.contracts;
        this.transactions = data.transactions;
        this.summary = data.summary;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching history:', err);
        this.isLoading = false;
      }
    });
  }
}
