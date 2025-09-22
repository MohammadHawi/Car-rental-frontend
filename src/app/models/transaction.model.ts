export enum TransactionType {
    Income = 0,
    Expense = 1
  }
  
  export enum TransactionCategory {
    // Income categories
    RentalPayment = 1,
    Deposit = 2,
    LateFee = 3,
    DamageFee = 4,
    
    // Expense categories
    Maintenance = 5,
    Insurance = 6,
    Fuel = 7,
    Taxes = 8,
    Salaries = 9,
    Utilities = 10,
    Marketing = 11,
    OfficeCosts = 12,
    VehiclePurchase = 13,
    Other = 14
  }
  
  export interface Transaction {
    id: number;
    type: TransactionType;
    category: TransactionCategory;
    amount: number;
    date: string;
    description: string;
    contractId?: number;
    contractNumber?: string;
    carId?: number;
    carDetails?: string;
  }
  
  export interface CreateTransaction {
    type: TransactionType;
    category: TransactionCategory;
    amount: number;
    date: string;
    description: string;
    contractId?: number;
    carId?: number;
    createdBy?: string;
  }
  
  export interface UpdateTransaction {
    category: TransactionCategory;
    amount: number;
    date: string;
    description: string;
    contractId?: number;
    carId?: number;
    updatedBy?: string;
  }
  
  export interface FinancialSummary {
    totalIncome: number;
    totalExpenses: number;
    netIncome: number;
    startDate: string;
    endDate: string;
  }