
import type { 
  IDataService, 
  Transaction, 
  Asset, 
  Liability, 
  FinancialSnapshot,
  TransactionType as TransactionTypeT
} from '../types';
import { TransactionType, AssetType, LiabilityType } from '../types';

// Helper to generate IDs
const uuid = () => Math.random().toString(36).substring(2, 9);

class StorageService implements IDataService {
  private transactions: Transaction[] = [];
  private assets: Asset[] = [];
  private liabilities: Liability[] = [];
  private userId: string = 'guest';

  constructor() {
    // We do NOT load in constructor anymore, explicit init required
  }

  // Initialize DB for a specific user (Simulating switching DB connection)
  public initialize(userId: string) {
    this.userId = userId;
    this.loadFromStorage();
    
    // Seed new users with sample data so the app isn't empty
    if (this.assets.length === 0 && this.transactions.length === 0) {
      // Seed conditions:
      //  - Vite dev build (import.meta.env.DEV)
      //  - OR a runtime toggle stored in localStorage under `cv_enable_seed` (set via setSeedEnabled)
      let isDev = false;
      try {
        isDev = !!((import.meta as unknown as { env?: { DEV?: boolean | string } }).env?.DEV);
      } catch {
        isDev = false;
      }

      const toggle = typeof localStorage !== 'undefined' && localStorage.getItem('cv_enable_seed') === 'true';

      if ((isDev || toggle) && userId !== 'guest') {
        this.seedData();
      }
    }
  }

  private get keys() {
    return {
      TRANSACTIONS: `${this.userId}_cashflow_transactions`,
      ASSETS: `${this.userId}_cashflow_assets`,
      LIABILITIES: `${this.userId}_cashflow_liabilities`
    };
  }

  private loadFromStorage() {
    try {
      this.transactions = JSON.parse(localStorage.getItem(this.keys.TRANSACTIONS) || '[]');
      this.assets = JSON.parse(localStorage.getItem(this.keys.ASSETS) || '[]');
      this.liabilities = JSON.parse(localStorage.getItem(this.keys.LIABILITIES) || '[]');
    } catch (e) {
      console.error("Failed to load data", e);
    }
  }

  private saveToStorage() {
    localStorage.setItem(this.keys.TRANSACTIONS, JSON.stringify(this.transactions));
    localStorage.setItem(this.keys.ASSETS, JSON.stringify(this.assets));
    localStorage.setItem(this.keys.LIABILITIES, JSON.stringify(this.liabilities));
  }

  private seedData() {
    // Phase 0: Sample Data
    this.assets = [
      {
        id: 'a1', name: 'Rental Property #1', type: AssetType.REAL_ESTATE, 
        purchaseDate: '2020-01-15', costBasis: 200000, currentValue: 250000, monthlyCashflow: 1200, description: '3BR House in Austin'
      },
      {
        id: 'a2', name: 'AAPL Stock', ticker: 'AAPL', type: AssetType.PAPER,
        purchaseDate: '2021-05-20', costBasis: 5000, currentValue: 7500, monthlyCashflow: 15, description: 'Apple Inc.'
      },
      {
        id: 'a3', name: 'High Yield Savings', type: AssetType.CASH,
        purchaseDate: '2023-01-01', costBasis: 10000, currentValue: 12000, monthlyCashflow: 40, description: 'Emergency Fund'
      }
    ];

    this.liabilities = [
      {
        id: 'l1', name: 'Mortgage Property #1', type: LiabilityType.MORTGAGE,
        originalAmount: 160000, outstandingBalance: 145000, monthlyPayment: 900, interestRate: 3.5, linkedAssetId: 'a1'
      },
      {
        id: 'l2', name: 'Car Loan', type: LiabilityType.CONSUMER_DEBT,
        originalAmount: 30000, outstandingBalance: 15000, monthlyPayment: 450, interestRate: 5.0
      }
    ];

    this.transactions = [
      { id: 't1', date: '2023-10-01', description: 'Salary', amount: 5000, category: 'Job', type: TransactionType.INCOME },
      { id: 't2', date: '2023-10-02', description: 'Grocery Store', amount: -150, category: 'Food', type: TransactionType.EXPENSE },
      { id: 't3', date: '2023-10-05', description: 'Rental Income', amount: 1200, category: 'Real Estate', type: TransactionType.INCOME, assetId: 'a1' },
      { id: 't4', date: '2023-10-05', description: 'Mortgage Payment', amount: -900, category: 'Debt', type: TransactionType.LIABILITY_PAYMENT, assetId: 'l1' },
    ];
    this.saveToStorage();
  }

  // --- Scenarios for Debugging ---
  loadScenario(type: string): void {
    this.transactions = [];
    this.assets = [];
    this.liabilities = [];
    const today = new Date().toISOString().split('T')[0];

    if (type === 'default') {
      this.seedData();
      return;
    }

    if (type === 'user_example') {
        this.transactions = [
            { id: uuid(), date: today, description: 'Modest Salary', amount: 500, category: 'Job', type: TransactionType.INCOME },
            { id: uuid(), date: today, description: 'Living Expenses', amount: -200, category: 'Food', type: TransactionType.EXPENSE },
            { id: uuid(), date: today, description: 'Watch Loan Payment', amount: -50, category: 'Debt', type: TransactionType.LIABILITY_PAYMENT },
        ];
        this.assets = [
            { id: uuid(), name: 'AAPL Stock', ticker: 'AAPL', type: AssetType.PAPER, purchaseDate: today, costBasis: 100, currentValue: 120, monthlyCashflow: 5, description: 'Fractional Shares' }
        ];
        this.liabilities = [
            { id: uuid(), name: 'Apple Watch Finance', type: LiabilityType.CONSUMER_DEBT, originalAmount: 400, outstandingBalance: 350, monthlyPayment: 50, interestRate: 0 }
        ];
    }

    if (type === 'freedom') {
        this.transactions = [
             { id: uuid(), date: today, description: 'Consulting Gig', amount: 1000, category: 'Job', type: TransactionType.INCOME },
             { id: uuid(), date: today, description: 'Luxury Lifestyle', amount: -4000, category: 'Lifestyle', type: TransactionType.EXPENSE },
        ];
        this.assets = [
            { id: uuid(), name: 'Commercial Real Estate', type: AssetType.REAL_ESTATE, purchaseDate: '2018-01-01', costBasis: 2000000, currentValue: 3000000, monthlyCashflow: 6000, description: 'Strip Mall' }
        ];
        this.liabilities = [];
    }

    if (type === 'deficit') {
        this.transactions = [
             { id: uuid(), date: today, description: 'Salary', amount: 3000, category: 'Job', type: TransactionType.INCOME },
             { id: uuid(), date: today, description: 'Rent & Party', amount: -2500, category: 'Lifestyle', type: TransactionType.EXPENSE },
             { id: uuid(), date: today, description: 'Car Payment', amount: -600, category: 'Debt', type: TransactionType.LIABILITY_PAYMENT },
             { id: uuid(), date: today, description: 'Credit Card Min', amount: -400, category: 'Debt', type: TransactionType.LIABILITY_PAYMENT },
        ];
        this.assets = [];
        this.liabilities = [
             { id: uuid(), name: 'BMW Lease', type: LiabilityType.CONSUMER_DEBT, originalAmount: 50000, outstandingBalance: 45000, monthlyPayment: 600, interestRate: 5 },
             { id: uuid(), name: 'Credit Cards', type: LiabilityType.CONSUMER_DEBT, originalAmount: 10000, outstandingBalance: 9800, monthlyPayment: 400, interestRate: 22 }
        ];
    }

    this.saveToStorage();
  }

  // --- Transactions ---

  getTransactions(): Transaction[] {
    return [...this.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  addTransaction(t: Transaction): void {
    this.transactions.push(t);
    this.saveToStorage();
  }

  async importTransactions(csvData: string): Promise<number> {
    const lines = csvData.split('\n');
    let count = 0;
    const startIndex = lines[0].toLowerCase().includes('date') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const [date, description, amountStr, category] = line.split(',');
      const amount = parseFloat(amountStr);

      if (isNaN(amount)) continue;

      let type: TransactionTypeT = amount > 0 ? TransactionType.INCOME : TransactionType.EXPENSE;
      
      const descLower = description.toLowerCase();
      if (descLower.includes('mortgage') || descLower.includes('loan')) {
        type = TransactionType.LIABILITY_PAYMENT;
      } else if (descLower.includes('dividend') || descLower.includes('rent')) {
        type = TransactionType.INCOME;
      } else if (descLower.includes('investment') || descLower.includes('brokerage')) {
        type = TransactionType.ASSET_PURCHASE;
      }

      const newTx: Transaction = {
        id: uuid(),
        date: date || new Date().toISOString().split('T')[0],
        description: description || 'Unknown',
        amount,
        category: category || 'Uncategorized',
        type
      };

      const exists = this.transactions.some(t => t.date === newTx.date && t.amount === newTx.amount && t.description === newTx.description);
      if (!exists) {
        this.transactions.push(newTx);
        count++;
      }
    }
    this.saveToStorage();
    return count;
  }

  // --- Integration Support ---
  
  async importExternalData(newAssets: Asset[], newTransactions: Transaction[], newLiabilities: Liability[] = []): Promise<void> {
    // 1. Merge Assets
    for (const asset of newAssets) {
        const existing = this.assets.find(a => (a.ticker && a.ticker === asset.ticker) || a.name === asset.name);
        if (existing) {
            existing.currentValue = asset.currentValue;
            existing.costBasis = asset.costBasis || existing.costBasis;
        } else {
            this.assets.push({ ...asset, id: asset.id || uuid() });
        }
    }

    // 2. Merge Liabilities
    for (const liab of newLiabilities) {
        const existing = this.liabilities.find(l => l.name === liab.name);
        if (existing) {
            existing.outstandingBalance = liab.outstandingBalance;
        } else {
            this.liabilities.push({ ...liab, id: liab.id || uuid() });
        }
    }

    // 3. Merge Transactions with ROBUST Deduplication & Dividend Linking
    for (const tx of newTransactions) {
        
        // A. Dividend Linking Logic
        // "Check if user was holding when ex date to be entitled"
        // We use Purchase Date <= Transaction Date as the validation since we lack real Ex-Dates.
        if (tx.type === TransactionType.INCOME && /dividend|dist|interest/i.test(tx.description)) {
             const asset = this.assets.find(a => 
                tx.description.toLowerCase().includes(a.name.toLowerCase()) || 
                (a.ticker && tx.description.includes(a.ticker))
             );
             
             if (asset) {
                 const purchaseTime = new Date(asset.purchaseDate).getTime();
                 const dividendTime = new Date(tx.date).getTime();
                 
                 // If owned before dividend date, assume entitled and link
                 if (purchaseTime <= dividendTime) {
                     tx.assetId = asset.id;
                 } else {
                     console.warn(`Potential issue: Dividend received for ${asset.name} on ${tx.date}, but asset purchase date is ${asset.purchaseDate}.`);
                 }
             }
        }

        // B. Fuzzy Deduplication
        const isDupe = this.transactions.some(existing => {
             // 1. Strict Amount Match (float tolerance)
             if (Math.abs(existing.amount - tx.amount) > 0.01) return false;
             
             // 2. Date Buffer (+/- 3 days)
             // Bank posting dates often vary from transaction dates
             const d1 = new Date(existing.date).getTime();
             const d2 = new Date(tx.date).getTime();
             const diffTime = Math.abs(d2 - d1);
             const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
             if (diffDays > 3) return false;

             // 3. Description Similarity
             // Normalize to remove whitespace/symbols for comparison
             const clean1 = existing.description.toLowerCase().replace(/[^a-z0-9]/g, '');
             const clean2 = tx.description.toLowerCase().replace(/[^a-z0-9]/g, '');
             
             // Check for overlap
             return clean1 === clean2 || clean1.includes(clean2) || clean2.includes(clean1);
        });

        if (!isDupe) {
            this.transactions.push({ ...tx, id: tx.id || uuid() });
        }
    }
    
    this.saveToStorage();
  }

  // Force override of all data
  async overrideData(newAssets: Asset[], newTransactions: Transaction[], newLiabilities: Liability[]): Promise<void> {
    // Sanitize and ensure IDs
    this.assets = newAssets.map(a => ({...a, id: uuid()}));
    this.liabilities = newLiabilities.map(l => ({...l, id: uuid()}));
    this.transactions = newTransactions.map(t => ({...t, id: uuid()}));
    this.saveToStorage();
  }

  // --- Assets & Liabilities ---

  getAssets(): Asset[] {
    return this.assets;
  }

  addAsset(a: Asset): void {
    this.assets.push({ ...a, id: a.id || uuid() });
    this.saveToStorage();
  }

  updateAsset(a: Asset): void {
    const idx = this.assets.findIndex(x => x.id === a.id);
    if (idx >= 0) {
      this.assets[idx] = a;
      this.saveToStorage();
    }
  }

  updateLiability(l: Liability): void {
    const idx = this.liabilities.findIndex(x => x.id === l.id);
    if (idx >= 0) {
      this.liabilities[idx] = l;
      this.saveToStorage();
    }
  }

  getLiabilities(): Liability[] {
    return this.liabilities;
  }

  addLiability(l: Liability): void {
    this.liabilities.push({ ...l, id: l.id || uuid() });
    this.saveToStorage();
  }

  // --- Snapshot Calculation ---

  getSnapshot(): FinancialSnapshot {
    const totalAssets = this.assets.reduce((sum, a) => sum + a.currentValue, 0);
    const totalLiabilities = this.liabilities.reduce((sum, l) => sum + l.outstandingBalance, 0);
    const netWorth = totalAssets - totalLiabilities;

    const passiveIncome = this.assets.reduce((sum, a) => sum + (a.monthlyCashflow || 0), 0);
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // recent transactions variable removed — not currently used
    
    const activeIncome = this.transactions
      .filter(t => t.type === TransactionType.INCOME && !t.assetId && !t.description.toLowerCase().includes('rent') && !t.description.toLowerCase().includes('dividend'))
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = this.transactions
      .filter(t => t.type === TransactionType.EXPENSE || t.type === TransactionType.LIABILITY_PAYMENT)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      netWorth,
      totalAssets,
      totalLiabilities,
      monthlyIncome: activeIncome,
      monthlyExpenses,
      passiveIncome
    };
  }

  reset() {
    localStorage.removeItem(this.keys.TRANSACTIONS);
    localStorage.removeItem(this.keys.ASSETS);
    localStorage.removeItem(this.keys.LIABILITIES);
    this.transactions = [];
    this.assets = [];
    this.liabilities = [];
    // NOTE: seedData() intentionally not called so reset yields a fresh empty state.
  }

  // Dev helpers: toggle seed data without editing code.
  public setSeedEnabled(enabled: boolean) {
    localStorage.setItem('cv_enable_seed', enabled ? 'true' : 'false');
    if (enabled && this.assets.length === 0 && this.transactions.length === 0) {
      this.seedData();
    }
  }

  public isSeedEnabled(): boolean {
    return localStorage.getItem('cv_enable_seed') === 'true';
  }
}

export const dataService = new StorageService();
