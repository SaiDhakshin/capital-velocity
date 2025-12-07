import type { Asset, Transaction } from '../types';
import { TransactionType, AssetType } from '../types';

/**
 * MOCK ADAPTER for India Account Aggregator (CAMSFinServ)
 * 
 * In a production environment, this would:
 * 1. Initiate a Consent Request via a TSP (Technical Service Provider) like Setu/Anumati.
 * 2. Redirect user to the AA App to approve consent.
 * 3. Fetch encrypted financial data (FI).
 * 4. Decrypt and normalize the data.
 */

export const mockCamsFetch = async (): Promise<{assets: Asset[], transactions: Transaction[]}> => {
  // Simulate network latency for authentication and fetching
  await new Promise(resolve => setTimeout(resolve, 2000));

  const today = new Date().toISOString().split('T')[0];
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthStr = lastMonth.toISOString().split('T')[0];

  // Mock Data: Typical Indian Mutual Funds found via CAMS
  const assets: Asset[] = [
    {
        id: 'cams_1',
        name: 'SBI Nifty 50 ETF',
        ticker: 'SBINIFTY',
        type: AssetType.PAPER,
        purchaseDate: '2022-01-10',
        costBasis: 120000,
        currentValue: 145000,
        monthlyCashflow: 0, // Growth fund, no dividend
        description: 'Synced via CAMSFinServ (Folio: 123***89)'
    },
    {
        id: 'cams_2',
        name: 'HDFC Flexi Cap Fund',
        ticker: 'HDFCFLEX',
        type: AssetType.PAPER,
        purchaseDate: '2021-05-15',
        costBasis: 200000,
        currentValue: 280000,
        monthlyCashflow: 0,
        description: 'Synced via CAMSFinServ (Folio: 987***12)'
    },
    {
        id: 'cams_3',
        name: 'ICICI Pru Regular Savings',
        ticker: 'ICICIPRU',
        type: AssetType.PAPER,
        purchaseDate: '2023-01-01',
        costBasis: 500000,
        currentValue: 512000,
        monthlyCashflow: 3500, // Monthly Dividend
        description: 'Synced via CAMSFinServ (Folio: 456***23)'
    }
  ];

  // Mock Transactions: Recent SIPs found in the bank statement linked to CAMS
  const transactions: Transaction[] = [
      {
          id: 'tx_cams_1',
          date: today,
          description: 'SIP Deduct - SBI Nifty',
          amount: -5000,
          category: 'Investment',
          type: TransactionType.ASSET_PURCHASE,
          assetId: 'cams_1'
      },
      {
          id: 'tx_cams_2',
          date: today,
          description: 'SIP Deduct - HDFC Flexi',
          amount: -10000,
          category: 'Investment',
          type: TransactionType.ASSET_PURCHASE,
          assetId: 'cams_2'
      },
      {
          id: 'tx_cams_3',
          date: lastMonthStr,
          description: 'Div Payout - ICICI Pru',
          amount: 3500,
          category: 'Investment Income',
          type: TransactionType.INCOME,
          assetId: 'cams_3'
      }
  ];

  return { assets, transactions };
};