import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import type { FinancialSnapshot, Asset, Liability } from '../types';
import { Card, Button } from './ui';

interface Props {
  snapshot: FinancialSnapshot;
  assets: Asset[];
  liabilities: Liability[];
}

const FinancialAdvisor: React.FC<Props> = ({ snapshot, assets, liabilities }) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getAdvice = async () => {
    setLoading(true);
    const result = await geminiService.getRichDadAdvice(snapshot, assets, liabilities);
    setAdvice(result);
    setLoading(false);
  };

  return (
    <Card className="bg-paper-dark border-none">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-serif font-bold text-ink flex items-center gap-2 italic">
            <span className="text-2xl">✎</span>
            Coach's Notes
          </h3>
          <p className="text-sm text-ink/70 mt-1 font-serif italic">
            Automated insights based on your ledger.
          </p>
        </div>
        <Button onClick={getAdvice} disabled={loading} className="ml-4 shrink-0" variant="secondary">
          {loading ? 'Consulting...' : 'Request Insight'}
        </Button>
      </div>
      
      {advice && (
        <div className="mt-6 p-6 bg-paper-contrast shadow-sm border border-ink/5 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-paper-dark rotate-45 border-l border-t border-ink/10"></div>
          <p className="text-ink font-serif text-lg leading-relaxed italic">
            "{advice}"
          </p>
        </div>
      )}
    </Card>
  );
};

export default FinancialAdvisor;
