import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { FinancialSnapshot } from '../types';
import { formatCurrency } from '../utils';

interface Props {
  snapshot: FinancialSnapshot;
}

const NetWorthChart: React.FC<Props> = ({ snapshot }) => {
  const data = [
    { name: 'Assets', value: snapshot.totalAssets, color: '#2563eb' },
    { name: 'Liabilities', value: snapshot.totalLiabilities, color: '#dc2626' },
  ];

  // If both are zero, show placeholder
  if (snapshot.totalAssets === 0 && snapshot.totalLiabilities === 0) {
    return <div className="h-64 flex items-center justify-center text-slate-400">No data to visualize</div>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center mt-[-110px] mb-[60px]">
        <span className="text-sm text-slate-500 block">Net Worth</span>
        <span className="text-xl font-bold text-slate-800">{formatCurrency(snapshot.netWorth)}</span>
      </div>
    </div>
  );
};

export default NetWorthChart;