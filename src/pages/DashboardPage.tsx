import React from 'react';
import { Link } from 'react-router-dom';
import type { FinancialSnapshot, Asset, Liability } from '../types';
import { Card, StatBox, Button } from '../components/ui';
import NetWorthChart from '../components/NetWorthChart';
import FinancialAdvisor from '../components/FinancialAdvisor';
import { CashflowDiagram } from '../components/CashflowDiagram';
import { formatCurrency } from '../utils';

interface Props {
  snapshot: FinancialSnapshot;
  assets: Asset[];
  liabilities: Liability[];
}

const DashboardPage: React.FC<Props> = ({ snapshot, assets, liabilities }) => {
  
  const ratRaceIndex = snapshot.monthlyExpenses > 0 
    ? ((snapshot.passiveIncome / snapshot.monthlyExpenses) * 100).toFixed(1)
    : '100';

  const isEmpty = assets.length === 0 && liabilities.length === 0;
  return (
    <div className="space-y-12 pb-12">
      {isEmpty && (
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Card className="text-center bg-paper-dark border border-ink/10 p-8">
              <h2 className="text-2xl font-serif font-bold mb-2">Your ledger looks empty</h2>
              <p className="text-ink/60 mb-4">Import bank statements, portfolio reports, or upload documents to automatically populate your ledger.</p>
              <div className="flex justify-center gap-4">
                <Link to="/app/transactions"><Button>Upload / Import Statements</Button></Link>
                <Link to="/app/assets"><Button variant="secondary">Add Manually</Button></Link>
              </div>
            </Card>
          </div>
        </div>
      )}
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-6 border-b border-ink/10">
        <div className="max-w-2xl">
           <h1 className="text-5xl font-serif font-bold text-ink mb-2">My Ledger</h1>
           <p className="text-lg font-serif italic text-ink/60">
             "Wealth is the ability to survive so many number of days forward... Wealth is measured in time, not money."
           </p>
        </div>
        <div className="text-right">
           <span className="block text-xs font-serif uppercase tracking-widest text-ink/50 mb-1">Exit Velocity</span>
           <span className={`text-3xl font-serif font-bold ${Number(ratRaceIndex) >= 100 ? 'text-accent-green' : 'text-ink'}`}>
             {ratRaceIndex}%
           </span>
        </div>
      </div>

      {/* HERO SECTION: Cashflow Diagram */}
      <CashflowDiagram snapshot={snapshot} assets={assets} liabilities={liabilities} />
      
      {/* Secondary Data Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Col: Stats & Advisor */}
        <div className="lg:col-span-2 space-y-12">
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <StatBox 
                    label="Net Worth" 
                    value={formatCurrency(snapshot.netWorth)} 
                    color={snapshot.netWorth >= 0 ? 'text-ink' : 'text-accent-red'} 
                />
                <StatBox 
                    label="Passive Flow" 
                    value={`${formatCurrency(snapshot.passiveIncome)}/mo`} 
                    color="text-accent-green"
                />
                <StatBox 
                    label="Living Costs" 
                    value={`${formatCurrency(snapshot.monthlyExpenses)}/mo`} 
                    color="text-accent-red"
                />
                <StatBox 
                    label="Net Cashflow" 
                    value={formatCurrency(snapshot.monthlyIncome + snapshot.passiveIncome - snapshot.monthlyExpenses)} 
                    color={(snapshot.monthlyIncome + snapshot.passiveIncome - snapshot.monthlyExpenses) > 0 ? "text-accent-blue" : "text-accent-red"}
                />
            </div>

           <FinancialAdvisor snapshot={snapshot} assets={assets} liabilities={liabilities} />
        </div>

        {/* Right Col: Charts & Lists */}
        <div className="space-y-8 border-l border-ink/5 pl-0 lg:pl-8">
          <Card title="Allocation">
            <NetWorthChart snapshot={snapshot} />
          </Card>

          <Card title="Monthly Statement">
             <div className="space-y-4 text-sm font-serif">
                <div className="flex justify-between items-center pb-2 border-b border-ink/5">
                    <span className="text-ink/60 italic">Labor Income</span>
                    <span className="font-bold text-ink">{formatCurrency(Math.max(0, snapshot.monthlyIncome - snapshot.passiveIncome))}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-ink/5">
                    <span className="text-ink/60 italic">Asset Income</span>
                    <span className="font-bold text-accent-green">+ {formatCurrency(snapshot.passiveIncome)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-ink/5">
                    <span className="text-ink/60 italic">Living Expenses</span>
                    <span className="font-bold text-accent-red">- {formatCurrency(snapshot.monthlyExpenses - liabilities.reduce((s,l)=>s+l.monthlyPayment,0))}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-ink/60 italic">Liability Payments</span>
                    <span className="font-bold text-accent-gold">- {formatCurrency(liabilities.reduce((s,l)=>s+l.monthlyPayment,0))}</span>
                </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;