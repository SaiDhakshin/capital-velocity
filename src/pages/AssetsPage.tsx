import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import type { Asset, Liability } from '../types';
import { AssetType, LiabilityType } from '../types';
import { dataService } from '../services/storageService';
import { Card, Button, Input, Select } from '../components/ui';
import { formatCurrency } from '../utils';

interface Props {
  assets: Asset[];
  liabilities: Liability[];
  onUpdate: () => void;
}

const AssetsPage: React.FC<Props> = ({ assets, liabilities, onUpdate }) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'assets' | 'liabilities'>('assets');
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<any>({});

  // Effect to switch tab based on URL query param (e.g. ?tab=liabilities)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'assets' || tab === 'liabilities') {
      setActiveTab(tab);
    }
  }, [location]);

  const handleAddAsset = () => {
    if (!formData.name || !formData.currentValue) return;
    dataService.addAsset({
      id: '',
      name: formData.name,
      type: formData.type || AssetType.PAPER,
      purchaseDate: formData.purchaseDate || new Date().toISOString().split('T')[0],
      costBasis: Number(formData.costBasis) || 0,
      currentValue: Number(formData.currentValue) || 0,
      monthlyCashflow: Number(formData.monthlyCashflow) || 0
    });
    setIsAdding(false);
    setFormData({});
    onUpdate();
  };

  const handleAddLiability = () => {
    if (!formData.name || !formData.outstandingBalance) return;
    dataService.addLiability({
      id: '',
      name: formData.name,
      type: formData.type || LiabilityType.CONSUMER_DEBT,
      originalAmount: Number(formData.originalAmount) || 0,
      outstandingBalance: Number(formData.outstandingBalance) || 0,
      monthlyPayment: Number(formData.monthlyPayment) || 0,
      interestRate: Number(formData.interestRate) || 0
    });
    setIsAdding(false);
    setFormData({});
    onUpdate();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-ink/10 pb-4 gap-4">
        <div>
            <h1 className="text-4xl font-serif font-bold text-ink mb-1">Statement of Position</h1>
            <p className="text-ink/60 font-serif italic text-sm">
                "An Asset puts money in your pocket. A Liability takes money out of your pocket."
            </p>
        </div>
        <div className="flex space-x-6">
          <button 
            className={`pb-2 text-lg font-serif font-bold transition-colors ${activeTab === 'assets' ? 'text-ink border-b-2 border-ink' : 'text-ink/40 hover:text-ink'}`}
            onClick={() => { setActiveTab('assets'); setIsAdding(false); }}
          >
            The Asset Column
          </button>
          <button 
            className={`pb-2 text-lg font-serif font-bold transition-colors ${activeTab === 'liabilities' ? 'text-ink border-b-2 border-ink' : 'text-ink/40 hover:text-ink'}`}
            onClick={() => { setActiveTab('liabilities'); setIsAdding(false); }}
          >
            The Liability Column
          </button>
        </div>
      </div>

      {!isAdding && (
        <div className="text-right">
            <Button onClick={() => setIsAdding(true)}>+ Add Entry</Button>
        </div>
      )}

      {isAdding && (
        <Card className="max-w-xl mx-auto bg-paper-dark border border-ink/10">
          <h3 className="text-xl font-serif font-bold mb-6 text-center italic">New Ledger Entry</h3>
          <div className="space-y-4">
            <Input label="Name" placeholder={activeTab === 'assets' ? "e.g., Rental House" : "e.g., Car Loan"} onChange={e => setFormData({...formData, name: e.target.value})} />
            
            {activeTab === 'assets' ? (
              <>
                 <Select 
                    label="Class" 
                    options={Object.values(AssetType).map(t => ({label: t, value: t}))}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                 />
                 <div className="grid grid-cols-2 gap-6">
                   <Input label="Market Value" type="number" onChange={e => setFormData({...formData, currentValue: e.target.value})} />
                   <Input label="Cost Basis" type="number" onChange={e => setFormData({...formData, costBasis: e.target.value})} />
                 </div>
                 <Input label="Monthly Cashflow (Inflow)" type="number" placeholder="Positive amount" onChange={e => setFormData({...formData, monthlyCashflow: e.target.value})} />
              </>
            ) : (
              <>
                <Select 
                    label="Class" 
                    options={Object.values(LiabilityType).map(t => ({label: t, value: t}))}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                 />
                 <div className="grid grid-cols-2 gap-6">
                   <Input label="Outstanding Balance" type="number" onChange={e => setFormData({...formData, outstandingBalance: e.target.value})} />
                   <Input label="Monthly Payment (Outflow)" type="number" placeholder="Positive amount" onChange={e => setFormData({...formData, monthlyPayment: e.target.value})} />
                 </div>
              </>
            )}

            <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-ink/10">
              <Button variant="secondary" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button onClick={activeTab === 'assets' ? handleAddAsset : handleAddLiability}>Record</Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {activeTab === 'assets' && assets.map(asset => (
          <Card key={asset.id} className="hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-bold uppercase bg-ink text-white px-2 py-1">Edit</span>
            </div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-ink/40 text-xs font-serif font-bold uppercase tracking-widest">{asset.type}</span>
              <span className="text-ink/40 text-xs font-serif italic">{asset.purchaseDate}</span>
            </div>
            <h3 className="font-serif font-bold text-2xl text-ink mb-1">{asset.name}</h3>
            {asset.ticker && <p className="text-xs text-ink/50 font-mono mb-4">[{asset.ticker}]</p>}
            
            <div className="mt-6 pt-4 border-t border-ink/5 space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-sm text-ink/60 font-serif italic">Value</span>
                <span className="font-bold text-lg text-ink font-serif">{formatCurrency(asset.currentValue)}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-sm text-ink/60 font-serif italic">Cashflow</span>
                <span className="font-bold text-lg text-accent-green font-serif">+{formatCurrency(asset.monthlyCashflow)}/mo</span>
              </div>
            </div>
          </Card>
        ))}

        {activeTab === 'liabilities' && liabilities.map(liability => (
           <Card key={liability.id} className="hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-bold uppercase bg-ink text-white px-2 py-1">Edit</span>
            </div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-ink/40 text-xs font-serif font-bold uppercase tracking-widest">{liability.type}</span>
            </div>
            <h3 className="font-serif font-bold text-2xl text-ink mb-4">{liability.name}</h3>
            
            <div className="mt-6 pt-4 border-t border-ink/5 space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-sm text-ink/60 font-serif italic">Debt</span>
                <span className="font-bold text-lg text-ink font-serif">{formatCurrency(liability.outstandingBalance)}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-sm text-ink/60 font-serif italic">Outflow</span>
                <span className="font-bold text-lg text-accent-red font-serif">-{formatCurrency(liability.monthlyPayment)}/mo</span>
              </div>
            </div>
           </Card>
        ))}
      </div>
    </div>
  );
};

export default AssetsPage;