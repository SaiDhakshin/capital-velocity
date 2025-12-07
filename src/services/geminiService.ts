import { GoogleGenAI, Type } from "@google/genai";
import type { Schema } from "@google/genai";
import type { FinancialSnapshot, Asset, Liability } from "../types";
import { TransactionType, AssetType, LiabilityType } from "../types";
import { formatCurrency } from '../utils';

// This service mimics the "Worker" role in the monorepo that would process insights
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // In a real app, never expose keys on client. This is strictly for the Phase 0 prototype.
    // Create a .env file in project root with VITE_API_KEY=your_key
    const apiKey = import.meta.env.VITE_API_KEY || '';
    this.ai = new GoogleGenAI({ apiKey });
  }

  async getRichDadAdvice(
    snapshot: FinancialSnapshot, 
    assets: Asset[], 
    liabilities: Liability[]
  ): Promise<string> {
    if (!process.env.API_KEY) {
      return "Gemini API Key is missing. Configure `process.env.API_KEY` to enable the Financial Coach.";
    }

    const prompt = `
      You are a strategic capital allocation coach. Analyze the following ledger.
      
      Core Philosophy to apply (rephrased):
      1. True Assets are only things that put money IN the pocket (positive cashflow). Everything else is a liability or an expense.
      2. Wealth is measured in time, not dollars. (How long can they survive without working?)
      3. The goal is to escape the "Labor-for-Money" cycle by building the Asset Column until Passive Income > Expenses.

      Financial Data:
      - Net Worth: ${formatCurrency(snapshot.netWorth)}
      - Passive Income: ${formatCurrency(snapshot.passiveIncome)}/month
      - Living Expenses: ${formatCurrency(snapshot.monthlyExpenses)}/month
      - Asset Column: ${assets.map(a => `${a.name} (${formatCurrency(a.monthlyCashflow)}/mo)`).join(', ')}
      - Liability Column: ${liabilities.map(l => `${l.name} (-${formatCurrency(l.monthlyPayment)}/mo)`).join(', ')}

      Provide a short, handwritten-style note (max 2 sentences).
      Be direct. Do not use trademarked terms like "Rich Dad" or "Cashflow Quadrant".
      Use terms like "Asset Column", "Cashflow Velocity", and "Buying Freedom".
      If they have no assets, tell them to stop buying liabilities.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text || "Focus on your Asset Column.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Unable to analyze capital flow at this moment.";
    }
  }

  async parseFinancialDocument(data: string, mimeType: string): Promise<{ transactions: any[], assets: any[], liabilities: any[] }> {
    if (!process.env.API_KEY) {
      throw new Error("Gemini API Key is missing.");
    }

    // PROMPT
    const promptText = `
      Analyze the attached financial document (Bank Statement, CDSL Statement, Portfolio Report, or Bill).
      
      Extract and Classify:
      1. Transactions: List all visible transactions. 
         - Classify 'type' as: INCOME, EXPENSE, ASSET_PURCHASE, LIABILITY_PAYMENT, or TRANSFER.
         - 'amount' should be a positive number.
      2. Assets: Identify any holdings (Stocks, Mutual Funds, Properties).
         - Classify 'type' as: PAPER, REAL_ESTATE, BUSINESS, COMMODITY, or CASH.
         - Estimate 'monthlyCashflow' if dividend/rent is mentioned, else 0.
      3. Liabilities: Identify any loans or debts mentioned.
         - Classify 'type' as: MORTGAGE, CONSUMER_DEBT, or LOAN.

      Context:
      - CDSL statements usually list Stocks (Paper Assets).
      - Bank statements list Transactions.
      - Loan statements list Liabilities.
      
      Return valid JSON matching the schema.
    `;

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        transactions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING, description: "ISO Date YYYY-MM-DD or closest approximation" },
              description: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              category: { type: Type.STRING },
              type: { type: Type.STRING, enum: Object.values(TransactionType) }
            },
            required: ["date", "description", "amount", "type"]
          }
        },
        assets: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              ticker: { type: Type.STRING },
              type: { type: Type.STRING, enum: Object.values(AssetType) },
              currentValue: { type: Type.NUMBER },
              costBasis: { type: Type.NUMBER },
              monthlyCashflow: { type: Type.NUMBER }
            },
            required: ["name", "currentValue", "type"]
          }
        },
        liabilities: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              type: { type: Type.STRING, enum: Object.values(LiabilityType) },
              outstandingBalance: { type: Type.NUMBER },
              monthlyPayment: { type: Type.NUMBER }
            },
            required: ["name", "outstandingBalance", "type"]
          }
        }
      }
    };

    try {
      // Logic to handle Text vs Binary
      // If it's CSV or plain text, decode base64 and send as text part to avoid potential inlineData issues
      const isText = mimeType === 'text/csv' || mimeType === 'text/plain';
      
      let contents;
      if (isText) {
        const decodedText = atob(data);
        contents = {
          parts: [
            { text: "Here is the content of the financial file (CSV/Text format):" },
            { text: decodedText },
            { text: promptText }
          ]
        };
      } else {
        contents = {
          parts: [
            { inlineData: { mimeType, data: data } },
            { text: promptText }
          ]
        };
      }

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        }
      });

      const text = response.text;
      if (!text) return { transactions: [], assets: [], liabilities: [] };
      return JSON.parse(text);

    } catch (error: any) {
      console.error("Gemini Document Parse Error:", error);
      // Pass the error message up for UI handling
      if (error.message) throw new Error(error.message);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();