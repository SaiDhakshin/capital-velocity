// Domain Entities

export const TransactionType = {
  INCOME: 'INCOME', // Salary, Dividends
  EXPENSE: 'EXPENSE', // Food, Taxes
  ASSET_PURCHASE: 'ASSET_PURCHASE', // Buying Stock
  LIABILITY_PAYMENT: 'LIABILITY_PAYMENT', // Mortgage Payment
  TRANSFER: 'TRANSFER'
} as const;

export type TransactionType = typeof TransactionType[keyof typeof TransactionType];

export const AssetType = {
  PAPER: 'PAPER', // Stocks, Bonds, ETFs
  REAL_ESTATE: 'REAL_ESTATE', // Rental Property, Land
  BUSINESS: 'BUSINESS', // Private Equity, Side Hustle
  COMMODITY: 'COMMODITY', // Gold, Silver, Crypto
  CASH: 'CASH' // Savings
} as const;

export type AssetType = typeof AssetType[keyof typeof AssetType];

export const LiabilityType = {
  MORTGAGE: 'MORTGAGE',
  CONSUMER_DEBT: 'CONSUMER_DEBT', // Credit Cards, Car Loans
  LOAN: 'LOAN'
} as const;

export type LiabilityType = typeof LiabilityType[keyof typeof LiabilityType];

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number; // Positive for inflow, negative for outflow usually, but we normalize
  category: string;
  type: TransactionType;
  assetId?: string; // Link to specific asset (e.g., dividend from APPL)
}

export interface Asset {
  id: string;
  name: string;
  ticker?: string; // For paper assets
  type: AssetType;
  purchaseDate: string;
  costBasis: number;
  currentValue: number; // Market value
  monthlyCashflow: number; // e.g., Dividends or Rent
  description?: string;
}

export interface Liability {
  id: string;
  name: string;
  type: LiabilityType;
  originalAmount: number;
  outstandingBalance: number;
  monthlyPayment: number;
  interestRate: number;
  linkedAssetId?: string; // e.g., Mortgage linked to Real Estate
}

export interface FinancialSnapshot {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  passiveIncome: number;
}

// Service Interfaces (DIP/ISP)
export interface IDataService {
  getTransactions(): Transaction[];
  addTransaction(t: Transaction): void;
  importTransactions(csv: string): Promise<number>; // Returns count
  importExternalData(assets: Asset[], transactions: Transaction[]): Promise<void>; // For Connectors
  
  getAssets(): Asset[];
  addAsset(a: Asset): void;
  updateAsset(a: Asset): void;
  
  getLiabilities(): Liability[];
  addLiability(l: Liability): void;
  
  getSnapshot(): FinancialSnapshot;
  reset(): void;
  loadScenario(type: string): void;
}