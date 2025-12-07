import React from 'react';
import { Link } from 'react-router-dom';
import type { FinancialSnapshot, Asset, Liability } from '../types';
import { formatCurrency } from '../utils';

interface Props {
  snapshot: FinancialSnapshot;
  assets: Asset[];
  liabilities: Liability[];
}

export const CashflowDiagram: React.FC<Props> = ({ snapshot, assets, liabilities }) => {
  // Derived Calculations
  const liabilityPayments = liabilities.reduce((sum, l) => sum + l.monthlyPayment, 0);
  const activeIncome = Math.max(0, snapshot.monthlyIncome - snapshot.passiveIncome);
  const totalIncome = snapshot.monthlyIncome + snapshot.passiveIncome;
  
  const netCashflow = Math.max(0, totalIncome - snapshot.monthlyExpenses);
  const isFinancialFreedom = snapshot.passiveIncome > snapshot.monthlyExpenses;

  // Constant thin width for schematic look
  const STROKE_WIDTH = 2;

  // Ink Styles
  const cInk = '#1c1917';
  const cGreen = '#15803d'; // Forest Green for Income
  const cRed = '#b91c1c';   // Brick Red for Expense/Liability
  const cPaper = '#ffffff'; // Background color for halo

  return (
    <div className="w-full bg-paper-contrast border border-ink/10 p-1 mb-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)]">
      <div className="p-6 border-b border-ink/10 flex justify-between items-center bg-paper">
        <div>
            <h3 className="font-serif text-2xl font-bold text-ink italic">Figure 1. The Cashflow Pattern</h3>
            <p className="text-xs font-serif text-ink/60 mt-1">
                Visualizing the circulation of capital. The objective is to cycle Income into the Asset Column.
            </p>
        </div>
      </div>
      
      <div className="relative w-full aspect-[4/3] lg:aspect-[2/1] bg-paper-contrast">
        <svg 
          viewBox="0 0 1000 600" 
          className="w-full h-full font-serif" 
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <marker id="arrowhead-green" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill={cGreen} />
            </marker>
            <marker id="arrowhead-red" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill={cRed} />
            </marker>
            
            {/* Ink Hatching Patterns */}
            <pattern id="hatch-ink" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
               <line x1="0" y1="0" x2="0" y2="10" style={{stroke:cInk, strokeWidth:0.5}} opacity="0.05" />
            </pattern>
            
            <style>
              {`
                .flow-line {
                  fill: none;
                  stroke-linecap: round;
                  stroke-linejoin: round;
                }
                .btn-edit {
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-edit:hover circle {
                    fill: #1c1917;
                    stroke: #1c1917;
                }
                .btn-edit:hover text {
                    fill: #fff;
                }
                .text-halo {
                    paint-order: stroke;
                    stroke: ${cPaper};
                    stroke-width: 12px;
                    stroke-linejoin: round;
                }
                /* Custom Scrollbar for foreignObject content */
                .scroller {
                    overflow-y: auto;
                    scrollbar-width: thin;
                    scrollbar-color: #1c1917 #f3f1e8;
                }
                .scroller::-webkit-scrollbar {
                    width: 4px;
                }
                .scroller::-webkit-scrollbar-track {
                    background: #f3f1e8;
                }
                .scroller::-webkit-scrollbar-thumb {
                    background-color: #1c1917;
                    border-radius: 2px;
                }
              `}
            </style>
          </defs>

          {/* --- STRUCTURE --- */}
          
          {/* Vertical Separator Line */}
          <line x1="500" y1="15" x2="500" y2="560" stroke={cInk} strokeWidth="1" strokeDasharray="4 4" opacity="0.2" />

          {/* --- BOXES --- */}
          
          {/* INCOME (Left Top) */}
          <g transform="translate(100, 70)">
             <rect width="300" height="140" fill="white" stroke={cInk} strokeWidth="1" />
             <text x="150" y="30" textAnchor="middle" className="font-bold fill-ink text-xl font-serif tracking-widest border-b border-ink">INCOME</text>
             <line x1="100" y1="35" x2="200" y2="35" stroke={cInk} strokeWidth="0.5" />
             
             <text x="20" y="70" textAnchor="start" className="text-sm fill-ink/60 font-serif italic">Salary</text>
             <text x="280" y="70" textAnchor="end" className="font-bold fill-ink text-lg font-serif">{formatCurrency(activeIncome)}</text>
             
             <line x1="20" y1="90" x2="280" y2="90" stroke={cInk} strokeWidth="0.5" strokeDasharray="1 3" />
             
             <text x="20" y="115" textAnchor="start" className="text-sm fill-ink/60 font-serif italic">Passive</text>
             <text x="280" y="115" textAnchor="end" className="font-bold fill-accent-green text-lg font-serif">{formatCurrency(snapshot.passiveIncome)}</text>

             {/* Add Button */}
             <Link to="/transactions">
               <g className="btn-edit" transform="translate(270, -10)">
                 <circle cx="10" cy="10" r="10" fill="white" stroke={cInk} strokeWidth="1" />
                 <text x="10" y="14" textAnchor="middle" className="text-sm fill-ink font-bold">+</text>
               </g>
             </Link>
          </g>

          {/* EXPENSES (Left Bottom) */}
          <g transform="translate(100, 390)">
             <rect width="300" height="140" fill="white" stroke={cInk} strokeWidth="1" />
             <text x="150" y="30" textAnchor="middle" className="font-bold fill-ink text-xl font-serif tracking-widest">EXPENSES</text>
             <line x1="100" y1="35" x2="200" y2="35" stroke={cInk} strokeWidth="0.5" />

             <text x="20" y="70" textAnchor="start" className="text-sm fill-ink/60 font-serif italic">Living</text>
             <text x="280" y="70" textAnchor="end" className="font-bold fill-ink text-lg font-serif">{formatCurrency(snapshot.monthlyExpenses - liabilityPayments)}</text>
             
             <line x1="20" y1="90" x2="280" y2="90" stroke={cInk} strokeWidth="0.5" strokeDasharray="1 3" />
             
             <text x="20" y="115" textAnchor="start" className="text-sm fill-ink/60 font-serif italic">Debt Cost</text>
             <text x="280" y="115" textAnchor="end" className="font-bold fill-accent-red text-lg font-serif">{formatCurrency(liabilityPayments)}</text>

             {/* Add Button */}
             <Link to="/transactions">
               <g className="btn-edit" transform="translate(270, -10)">
                 <circle cx="10" cy="10" r="10" fill="white" stroke={cInk} strokeWidth="1" />
                 <text x="10" y="14" textAnchor="middle" className="text-sm fill-ink font-bold">+</text>
               </g>
             </Link>
          </g>

          {/* ASSETS (Right Top) */}
          <g transform="translate(600, 70)">
             <rect width="300" height="200" fill="url(#hatch-ink)" stroke={cInk} strokeWidth="1" />
             <rect width="300" height="200" fill="white" fillOpacity="0.8" />
             <rect width="300" height="200" fill="none" stroke={cInk} strokeWidth="1" />
             
             <text x="150" y="30" textAnchor="middle" className="font-bold fill-ink text-xl font-serif tracking-widest">ASSETS</text>
             <line x1="100" y1="35" x2="200" y2="35" stroke={cInk} strokeWidth="0.5" />
             
             <foreignObject x="20" y="50" width="260" height="140">
                <div className="h-full font-serif text-sm scroller pr-2">
                    {assets.length === 0 && <div className="text-center mt-8 text-ink/40 italic">Inventory Empty</div>}
                    {assets.map(a => (
                        <div key={a.id} className="flex justify-between py-1 border-b border-ink/10 last:border-0">
                            <span className="text-ink/80 italic truncate pr-2 w-2/3">{a.name}</span>
                            <span className="font-bold text-ink w-1/3 text-right">{formatCurrency(a.monthlyCashflow)}</span>
                        </div>
                    ))}
                </div>
             </foreignObject>

             {/* Add Button */}
             <Link to="/assets?tab=assets">
               <g className="btn-edit" transform="translate(270, -10)">
                 <circle cx="10" cy="10" r="10" fill="white" stroke={cInk} strokeWidth="1" />
                 <text x="10" y="14" textAnchor="middle" className="text-sm fill-ink font-bold">+</text>
               </g>
             </Link>
          </g>

          {/* LIABILITIES (Right Bottom) */}
          <g transform="translate(600, 390)">
             <rect width="300" height="140" fill="white" stroke={cInk} strokeWidth="1" />
             <text x="150" y="30" textAnchor="middle" className="font-bold fill-ink text-xl font-serif tracking-widest">LIABILITIES</text>
             <line x1="100" y1="35" x2="200" y2="35" stroke={cInk} strokeWidth="0.5" />

             <foreignObject x="20" y="50" width="260" height="80">
                <div className="h-full font-serif text-sm scroller pr-2">
                    {liabilities.length === 0 && <div className="text-center mt-4 text-ink/40 italic">None</div>}
                    {liabilities.map(l => (
                        <div key={l.id} className="flex justify-between py-1 border-b border-ink/10 last:border-0">
                            <span className="text-ink/80 italic truncate pr-2 w-2/3">{l.name}</span>
                            <span className="font-bold text-ink/60 w-1/3 text-right">{formatCurrency(l.monthlyPayment)}</span>
                        </div>
                    ))}
                </div>
             </foreignObject>

             {/* Add Button */}
             <Link to="/assets?tab=liabilities">
               <g className="btn-edit" transform="translate(270, -10)">
                 <circle cx="10" cy="10" r="10" fill="white" stroke={cInk} strokeWidth="1" />
                 <text x="10" y="14" textAnchor="middle" className="text-sm fill-ink font-bold">+</text>
               </g>
             </Link>
          </g>


          {/* --- FLOW LINES (INK STYLE) --- */}
          {/* NOTE: All flows now use fixed STROKE_WIDTH for a cleaner, thin diagrammatic look. */}

          {/* 1. JOB -> INCOME (Green, Solid) */}
          {activeIncome > 0 && (
            <g>
              <path 
                d="M 20 120 L 100 120" 
                className="flow-line"
                stroke={cGreen}
                strokeWidth={STROKE_WIDTH} 
                markerEnd="url(#arrowhead-green)" 
              />
              <circle cx="20" cy="120" r="3" fill={cGreen} />
              <text x="20" y="110" className="text-xs font-bold font-serif fill-ink uppercase">
                Job <tspan fill={cGreen}>(+{formatCurrency(activeIncome)})</tspan>
              </text>
            </g>
          )}

          {/* 2. ASSETS -> INCOME (Green, Solid) */}
          {snapshot.passiveIncome > 0 && (
            <g>
               <path 
                 d="M 600 170 L 500 170 L 400 170" 
                 className="flow-line"
                 stroke={cGreen}
                 strokeWidth={STROKE_WIDTH} 
                 markerEnd="url(#arrowhead-green)" 
               />
               {/* Label */}
               <rect x="460" y="160" width="80" height="20" fill="white" stroke={cInk} strokeWidth="0.5" />
               <text x="500" y="174" textAnchor="middle" className="text-xs font-bold fill-accent-green font-serif tracking-widest">+{formatCurrency(snapshot.passiveIncome)}</text>
            </g>
          )}

          {/* 3. INCOME -> EXPENSES (Red, Solid) */}
          {snapshot.monthlyExpenses > 0 && (
             <g>
               <path 
                 d="M 250 210 L 250 390" 
                 className="flow-line"
                 stroke={cRed}
                 strokeWidth={STROKE_WIDTH} 
                 markerEnd="url(#arrowhead-red)" 
               />
               {/* Label */}
               <rect x="210" y="290" width="80" height="20" fill="white" stroke={cInk} strokeWidth="0.5" />
               <text x="250" y="304" textAnchor="middle" className="text-xs font-bold fill-accent-red font-serif tracking-widest">-{formatCurrency(snapshot.monthlyExpenses)}</text>
            </g>
          )}

          {/* 4. LIABILITIES -> EXPENSES (Red, Dotted) */}
          {liabilityPayments > 0 && (
              <g>
                <path 
                    d="M 600 460 L 500 460 L 400 460" 
                    className="flow-line"
                    stroke={cRed}
                    strokeWidth={STROKE_WIDTH} 
                    markerEnd="url(#arrowhead-red)"
                    strokeDasharray="4 4" 
                />
                {/* Label */}
                <rect x="460" y="450" width="80" height="20" fill="white" stroke={cInk} strokeWidth="0.5" />
                <text x="500" y="464" textAnchor="middle" className="text-xs font-bold fill-accent-red font-serif tracking-widest">-{formatCurrency(liabilityPayments)}</text>
              </g>
          )}

          {/* 5. INCOME -> ASSETS (Investments - Green, Solid) */}
          {netCashflow > 0 ? (
             <g>
               <path 
                 d="M 250 70 L 250 45 L 750 45 L 750 70" 
                 className="flow-line"
                 stroke={cGreen}
                 strokeWidth={STROKE_WIDTH} 
                 markerEnd="url(#arrowhead-green)" 
               />
               <rect x="450" y="35" width="100" height="20" fill="white" stroke={cInk} strokeWidth="0.5" />
               <text x="500" y="49" textAnchor="middle" className="text-xs font-bold fill-accent-green font-serif tracking-widest">+{formatCurrency(netCashflow)}</text>
             </g>
          ) : (
             snapshot.monthlyExpenses > totalIncome && (
                <g>
                  <text x="500" y="300" textAnchor="middle" className="text-2xl font-bold fill-accent-red font-serif">
                    ⚠ Negative Cashflow (-{formatCurrency(snapshot.monthlyExpenses - totalIncome)})
                  </text>
                </g>
             )
          )}
          
          {isFinancialFreedom && (
             <text x="500" y="560" textAnchor="middle" className="text-3xl font-bold fill-accent-green opacity-40 uppercase tracking-widest font-serif italic">
               Financially Independent
             </text>
          )}

          {/* Headers */}
          <text x="250" y="15" textAnchor="middle" className="text-xl font-bold font-serif fill-ink tracking-widest uppercase text-halo">Income Statement</text>
          <text x="750" y="15" textAnchor="middle" className="text-xl font-bold font-serif fill-ink tracking-widest uppercase text-halo">Balance Sheet</text>
          <text x="250" y="15" textAnchor="middle" className="text-xl font-bold font-serif fill-ink tracking-widest uppercase">Income Statement</text>
          <text x="750" y="15" textAnchor="middle" className="text-xl font-bold font-serif fill-ink tracking-widest uppercase">Balance Sheet</text>

        </svg>
      </div>
    </div>
  );
};