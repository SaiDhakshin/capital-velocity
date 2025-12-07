import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui';

// --- VISUALIZATION COMPONENTS ---

const CashflowPatternsAnimation = () => {
  const [pattern, setPattern] = useState<'poor' | 'middle' | 'rich'>('poor');

  useEffect(() => {
    const states: ('poor' | 'middle' | 'rich')[] = ['poor', 'middle', 'rich'];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % 3;
      setPattern(states[i]);
    }, 3000); // Increased duration slightly to let the smooth transition breathe
    return () => clearInterval(interval);
  }, []);

  // Helper for smooth transition styles
  const getOpacity = (target: string) => ({
    opacity: pattern === target ? 1 : 0,
    transition: 'opacity 1s ease-in-out'
  });

  return (
    <div className="w-full max-w-2xl mx-auto aspect-[16/9] bg-paper-contrast border border-ink/10 shadow-xl rounded-sm p-4 flex flex-col">
       <div className="flex justify-between items-center border-b border-ink/5 pb-2 mb-4">
          <div className="flex gap-4">
             <button onClick={() => setPattern('poor')} className={`text-xs font-bold uppercase tracking-widest px-2 py-1 transition-colors duration-500 ${pattern === 'poor' ? 'bg-ink text-white' : 'text-ink/40'}`}>Poor</button>
             <button onClick={() => setPattern('middle')} className={`text-xs font-bold uppercase tracking-widest px-2 py-1 transition-colors duration-500 ${pattern === 'middle' ? 'bg-ink text-white' : 'text-ink/40'}`}>Middle Class</button>
             <button onClick={() => setPattern('rich')} className={`text-xs font-bold uppercase tracking-widest px-2 py-1 transition-colors duration-500 ${pattern === 'rich' ? 'bg-accent-green text-white' : 'text-ink/40'}`}>Rich</button>
          </div>
          <div className="text-xs font-serif italic text-ink/50">Figure {pattern === 'poor' ? '1' : pattern === 'middle' ? '2' : '3'}</div>
       </div>

       <div className="flex-1 relative">
         <svg viewBox="0 0 600 300" className="w-full h-full font-serif">
            <defs>
              <marker id="arrow-ink" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#1c1917" /></marker>
              <marker id="arrow-red" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#b91c1c" /></marker>
              <marker id="arrow-green" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#15803d" /></marker>
            </defs>
            
            {/* Income Statement Container */}
            <g transform="translate(50, 50)">
               <rect x="0" y="0" width="180" height="200" fill="none" stroke="#1c1917" strokeWidth="1" strokeDasharray="2 2" />
               <text x="90" y="-10" textAnchor="middle" fontSize="10" fill="#a8a29e" fontWeight="bold">INCOME STATEMENT</text>
               
               {/* Income Box (Abs Center: 140, 100) */}
               <rect x="20" y="20" width="140" height="60" fill="white" stroke="#1c1917" strokeWidth="1" />
               <text x="90" y="55" textAnchor="middle" fontSize="14" fontWeight="bold">INCOME</text>
               
               {/* Expense Box (Abs Center: 140, 200) */}
               <rect x="20" y="120" width="140" height="60" fill="white" stroke="#1c1917" strokeWidth="1" />
               <text x="90" y="155" textAnchor="middle" fontSize="14" fontWeight="bold">EXPENSES</text>
            </g>

            {/* Balance Sheet Container */}
            <g transform="translate(350, 50)">
               <rect x="0" y="0" width="180" height="200" fill="none" stroke="#1c1917" strokeWidth="1" strokeDasharray="2 2" />
               <text x="90" y="-10" textAnchor="middle" fontSize="10" fill="#a8a29e" fontWeight="bold">BALANCE SHEET</text>
               
               {/* Asset Box (Abs Center: 440, 100) */}
               <rect 
                  x="20" y="20" width="140" height="60" 
                  className="transition-all duration-1000"
                  fill={pattern === 'rich' ? '#dcfce7' : 'white'} 
                  stroke={pattern === 'rich' ? '#15803d' : '#1c1917'} 
                  strokeWidth={pattern === 'rich' ? 2 : 1} 
               />
               <text x="90" y="55" textAnchor="middle" fontSize="14" fontWeight="bold" 
                     className="transition-colors duration-1000"
                     fill={pattern === 'rich' ? '#15803d' : '#1c1917'}>
                     ASSETS
               </text>
               
               {/* Liability Box (Abs Center: 440, 200) */}
               <rect 
                  x="20" y="120" width="140" height="60" 
                  className="transition-all duration-1000"
                  fill={pattern === 'middle' ? '#fee2e2' : 'white'} 
                  stroke={pattern === 'middle' ? '#b91c1c' : '#1c1917'} 
                  strokeWidth={pattern === 'middle' ? 2 : 1} 
               />
               <text x="90" y="155" textAnchor="middle" fontSize="14" fontWeight="bold" 
                     className="transition-colors duration-1000"
                     fill={pattern === 'middle' ? '#b91c1c' : '#1c1917'}>
                     LIABILITIES
               </text>
            </g>

            {/* --- FLOW LINES (Using Opacity Transitions) --- */}
            
            {/* 1. Job Source (Used in Poor & Middle) */}
            <g style={{ opacity: (pattern === 'poor' || pattern === 'middle') ? 1 : 0, transition: 'opacity 1s' }}>
                <text x="10" y="100" fontSize="10" fontWeight="bold">JOB</text>
                {/* Enters Income Box Left */}
                <path d="M 35 100 L 70 100" stroke="#1c1917" strokeWidth="2" markerEnd="url(#arrow-ink)" />
            </g>

            {/* 2. POOR PATTERN: Income -> Expenses -> Out */}
            <g style={getOpacity('poor')}>
                {/* Income Bottom (140,130) -> Expense Top (140,170) */}
                <path d="M 140 130 L 140 170" stroke="#1c1917" strokeWidth="2" markerEnd="url(#arrow-ink)" />
                {/* Expense Bottom (140,230) -> Out */}
                <path d="M 140 230 L 140 280" stroke="#1c1917" strokeWidth="2" strokeDasharray="4 2" markerEnd="url(#arrow-ink)" />
            </g>

            {/* 3. MIDDLE CLASS PATTERN: Income -> Liability -> Expense -> Out */}
            <g style={getOpacity('middle')}>
                {/* Income Right (210,100) -> Liability Left (370,200) */}
                <path d="M 210 100 L 260 100 L 260 200 L 370 200" fill="none" stroke="#b91c1c" strokeWidth="2" markerEnd="url(#arrow-red)" />
                {/* Liability Bottom (440,230) -> Expense Right (210,200) */}
                <path d="M 440 230 L 440 260 L 260 260 L 260 200 L 210 200" fill="none" stroke="#b91c1c" strokeWidth="2" strokeDasharray="2 2" markerEnd="url(#arrow-red)" />
            </g>

            {/* 4. RICH PATTERN: Assets -> Income -> Assets */}
            <g style={getOpacity('rich')}>
                {/* Asset Left (370,100) -> Income Right (210,100) */}
                <path d="M 370 100 L 210 100" fill="none" stroke="#15803d" strokeWidth="4" markerEnd="url(#arrow-green)" />
                {/* Income Bottom (140,130) -> Reinvest -> Asset Bottom (440,130) */}
                <path d="M 140 130 L 140 160 L 440 160 L 440 130" fill="none" stroke="#15803d" strokeWidth="2" strokeDasharray="4 2" markerEnd="url(#arrow-green)" />
            </g>

         </svg>
         
         <div className="absolute bottom-4 left-0 right-0 text-center">
             <div className="inline-block relative h-8 w-full">
                <p style={getOpacity('poor')} className="absolute w-full text-sm font-serif italic bg-white/90 px-4 py-1 rounded">
                   Pattern: Earn, Spend, Broke. (Zero Asset Growth)
                </p>
                <p style={getOpacity('middle')} className="absolute w-full text-sm font-serif italic bg-white/90 px-4 py-1 rounded">
                   Pattern: Buy Liabilities thinking they are Assets.
                </p>
                <p style={getOpacity('rich')} className="absolute w-full text-sm font-serif italic bg-white/90 px-4 py-1 rounded">
                   Pattern: Assets buy Luxuries. Reinvest the surplus.
                </p>
             </div>
         </div>
       </div>
    </div>
  );
};

const QuadrantAnimation = () => {
  const [activeSide, setActiveSide] = useState<'left' | 'right'>('left');

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSide(prev => prev === 'left' ? 'right' : 'left');
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-md aspect-square bg-paper border-4 border-ink shadow-[8px_8px_0px_0px_#1c1917] relative flex flex-col">
      {/* Top Row */}
      <div className="flex flex-1 border-b-4 border-ink">
          {/* E - Employee (Top Left) */}
          <div className={`flex-1 flex flex-col justify-center items-center border-r-4 border-ink transition-colors duration-1000 ${activeSide === 'left' ? 'bg-ink/5' : 'bg-transparent'}`}>
            <span className="text-6xl font-serif font-bold text-ink mb-2">E</span>
            <span className="text-[10px] uppercase tracking-widest text-ink/60">Employee</span>
          </div>
          {/* B - Business (Top Right) */}
          <div className={`flex-1 flex flex-col justify-center items-center transition-colors duration-1000 ${activeSide === 'right' ? 'bg-accent-green/10' : 'bg-transparent'}`}>
            <span className="text-6xl font-serif font-bold text-ink mb-2">B</span>
            <span className="text-[10px] uppercase tracking-widest text-ink/60">Business</span>
          </div>
      </div>
      
      {/* Bottom Row */}
      <div className="flex flex-1">
          {/* S - Self Employed (Bottom Left) */}
          <div className={`flex-1 flex flex-col justify-center items-center border-r-4 border-ink transition-colors duration-1000 ${activeSide === 'left' ? 'bg-ink/5' : 'bg-transparent'}`}>
            <span className="text-6xl font-serif font-bold text-ink mb-2">S</span>
            <span className="text-[10px] uppercase tracking-widest text-ink/60">Self-Employed</span>
          </div>
          {/* I - Investor (Bottom Right) */}
          <div className={`flex-1 flex flex-col justify-center items-center transition-colors duration-1000 ${activeSide === 'right' ? 'bg-accent-gold/10' : 'bg-transparent'}`}>
            <span className="text-6xl font-serif font-bold text-ink mb-2">I</span>
            <span className="text-[10px] uppercase tracking-widest text-ink/60">Investor</span>
          </div>
      </div>

      {/* Animation Overlay */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
         {/* The Wall */}
         <div className="absolute h-full w-1 bg-ink/20"></div>
         
         {/* The Transition Arrow */}
         <div 
            className="bg-white border-2 border-ink rounded-full w-12 h-12 flex items-center justify-center shadow-lg z-10 transition-all duration-1000"
            style={{ 
                transform: activeSide === 'right' ? 'translateX(40px) rotate(0deg)' : 'translateX(-40px) rotate(180deg)'
            }}
         >
             <span className="text-xl">➔</span>
         </div>
      </div>
    </div>
  );
};

const DashboardSimAnimation = () => {
  const [step, setStep] = useState(0); 
  // 0: Idle, 1: Cursor Move, 2: Modal Open, 3: Typing, 4: Added/Update

  useEffect(() => {
    const sequence = async () => {
      while(true) {
        await new Promise(r => setTimeout(r, 1000)); // Wait
        setStep(1); // Cursor moves to button
        await new Promise(r => setTimeout(r, 800));
        setStep(2); // Modal Opens
        await new Promise(r => setTimeout(r, 500));
        setStep(3); // Typing
        await new Promise(r => setTimeout(r, 1500));
        setStep(4); // Submitted
        await new Promise(r => setTimeout(r, 2000)); // Show Result
        setStep(0); // Reset
      }
    };
    sequence();
  }, []);

  return (
    <div className="bg-paper-contrast w-full max-w-lg rounded-sm border border-ink/20 shadow-xl overflow-hidden relative font-serif text-sm">
      {/* Mock Header */}
      <div className="bg-paper border-b border-ink/10 p-3 flex justify-between items-center">
        <div className="font-bold text-ink">My Ledger</div>
        <div className="flex gap-2">
            <div className="bg-ink/10 px-2 py-0.5 rounded text-xs">Net Worth: <span className={`font-bold transition-all duration-500 ${step === 4 ? 'text-accent-green scale-110 inline-block' : 'text-ink'}`}>{step === 4 ? '$1,250,000' : '$1,000,000'}</span></div>
        </div>
      </div>

      {/* Mock Body */}
      <div className="p-4 space-y-3">
        {/* Asset List */}
        <div className="flex justify-between border-b border-ink/5 pb-1">
           <span>Rental Property A</span>
           <span className="font-bold">$400,000</span>
        </div>
        <div className="flex justify-between border-b border-ink/5 pb-1">
           <span>Stock Portfolio</span>
           <span className="font-bold">$600,000</span>
        </div>
        
        {/* The New Item Animation */}
        <div className={`flex justify-between border-b border-ink/5 pb-1 overflow-hidden transition-all duration-500 ${step === 4 ? 'max-h-10 opacity-100 bg-accent-green/5 px-1' : 'max-h-0 opacity-0'}`}>
           <span className="text-accent-green font-bold">New Apartment Complex</span>
           <span className="font-bold">$250,000</span>
        </div>
        
        <div className="flex justify-end mt-4">
           <button className={`bg-ink text-white px-3 py-1 text-xs rounded transition-transform ${step === 1 ? 'scale-95' : ''}`}>+ Add Asset</button>
        </div>
      </div>

      {/* Virtual Cursor */}
      <div className={`absolute w-4 h-4 transition-all duration-700 pointer-events-none z-50
          ${step === 0 ? 'top-32 right-10' : ''}
          ${step === 1 ? 'top-28 right-8' : ''} 
          ${step >= 2 ? 'top-40 right-40 opacity-0' : 'opacity-100'}
      `}>
          <svg viewBox="0 0 24 24" fill="#000"><path d="M7 2l12 11.2-5.8.5 3.3 7.3-2.2.9-3.2-7.4-4.4 4z"/></svg>
      </div>

      {/* Virtual Modal */}
      <div className={`absolute inset-0 bg-black/10 flex items-center justify-center transition-opacity duration-300 ${step === 2 || step === 3 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className={`bg-white p-4 shadow-2xl border border-ink/20 w-64 transform transition-all duration-300 ${step >= 2 ? 'scale-100 translate-y-0' : 'scale-90 translate-y-4'}`}>
              <div className="text-xs font-bold mb-2">New Asset</div>
              <div className="bg-gray-100 h-6 w-full mb-2 flex items-center px-2 text-xs text-ink">
                 {step === 3 && <span className="animate-pulse">New Apartment Com|</span>}
                 {step === 2 && <span className="animate-pulse">|</span>}
              </div>
              <div className="bg-gray-100 h-6 w-1/2 mb-4 flex items-center px-2 text-xs text-ink">
                 {step === 3 && <span>$250,000</span>}
              </div>
              <div className="flex justify-end">
                  <div className="bg-ink text-white text-[10px] px-2 py-1">SAVE</div>
              </div>
          </div>
      </div>
    </div>
  );
};

const IngestionAnimation = () => {
    const [phase, setPhase] = useState(0); // 0: Drop, 1: Scan, 2: List

    useEffect(() => {
        const interval = setInterval(() => {
            setPhase(p => (p + 1) % 3);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-paper-contrast w-full max-w-xs h-48 border border-ink/20 relative overflow-hidden flex flex-col items-center justify-center shadow-lg">
            
            {/* Phase 0: Drop */}
            <div className={`absolute transition-all duration-700 ${phase === 0 ? 'top-10 opacity-100' : 'top-32 opacity-0'}`}>
                <div className="text-4xl filter drop-shadow-lg">📄</div>
                <div className="text-xs mt-2 font-bold text-center">statement.pdf</div>
            </div>

            {/* Phase 1: Scan */}
            <div className={`absolute inset-0 bg-paper-dark flex items-center justify-center transition-opacity duration-300 ${phase === 1 ? 'opacity-100' : 'opacity-0'}`}>
                 <div className="text-2xl font-bold text-ink">Analyzing...</div>
                 <div className="absolute top-0 left-0 w-full h-1 bg-accent-green animate-scan"></div>
            </div>
            <style>{`
                @keyframes scan {
                    0% { top: 0; opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .animate-scan {
                    animation: scan 1.5s infinite linear;
                }
            `}</style>

            {/* Phase 2: Result */}
            <div className={`absolute inset-0 bg-white p-4 transition-all duration-500 ${phase === 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="text-xs font-bold mb-2 text-accent-green flex items-center gap-1">
                    <span>✓</span> Extraction Complete
                </div>
                <div className="space-y-2">
                    {[1,2,3].map(i => (
                        <div key={i} className="h-6 bg-ink/5 border-b border-ink/10 flex items-center px-2 justify-between animate-fade-in-up" style={{animationDelay: `${i*0.1}s`}}>
                            <div className="w-16 h-2 bg-ink/20 rounded"></div>
                            <div className="w-8 h-2 bg-ink/20 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const CoachAnimation = () => {
    const [messages, setMessages] = useState<number[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessages(prev => prev.length >= 3 ? [] : [...prev, prev.length]);
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-paper-contrast w-full max-w-xs h-64 border border-ink/20 relative flex flex-col shadow-lg p-4">
            <div className="flex items-center gap-2 border-b border-ink/5 pb-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center text-white text-xs font-serif font-bold italic">CV</div>
                <div className="text-xs font-bold text-ink">Coach</div>
            </div>
            <div className="flex-1 space-y-3 relative overflow-hidden">
                {messages.map((m, i) => (
                    <div key={i} className={`flex gap-2 animate-fade-in-up transition-all ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                         <div className={`w-8 h-8 rounded-full flex-shrink-0 ${i % 2 === 0 ? 'bg-ink' : 'bg-gray-200'}`}></div>
                         <div className={`p-2 rounded max-w-[80%] text-[10px] leading-tight shadow-sm ${i % 2 === 0 ? 'bg-ink/5 text-ink' : 'bg-accent-green/10 text-ink'}`}>
                             {i === 0 && "Analysis complete. You are spending 40% on liabilities."}
                             {i === 1 && "What should I do?"}
                             {i === 2 && "Stop buying bad debt. Acquire income-generating assets."}
                         </div>
                    </div>
                ))}
            </div>
            {/* Input Mock */}
            <div className="h-8 border border-ink/10 rounded-full mt-2 bg-paper-dark flex items-center px-3">
                 <div className="w-full h-1 bg-ink/10 rounded"></div>
            </div>
        </div>
    )
}


const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-paper text-ink font-body flex flex-col">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto w-full sticky top-0 bg-paper/90 backdrop-blur-sm z-50 border-b border-ink/5">
        <div className="flex flex-col">
           <span className="font-serif font-bold text-2xl tracking-tighter text-ink border-b-2 border-ink pb-1">CAPITAL VELOCITY</span>
        </div>
        <div className="flex gap-4">
           <Link to="/login">
             <Button variant="secondary" className="border-none hover:bg-ink/5 hidden md:block">Sign In</Button>
           </Link>
           <Link to="/app/dashboard">
             <Button>Try Demo</Button>
           </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 bg-paper-dark border-b border-ink/10 relative overflow-hidden">
         {/* Background Decoration */}
         <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
            <svg width="100%" height="100%">
               <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                 <path d="M 40 0 L 0 0 0 40" fill="none" stroke="black" strokeWidth="0.5"/>
               </pattern>
               <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
         </div>

         <div className="relative z-10 max-w-4xl">
            <span className="inline-block py-1 px-3 border border-accent-green text-accent-green font-serif font-bold tracking-widest uppercase text-xs mb-6 rounded-full bg-paper animate-fade-in-up">
                Financial Intelligence System
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold italic text-ink mb-8 leading-tight animate-fade-in-up">
              Don't Work For Money.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-ink to-ink/60">Make It Work For You.</span>
            </h1>
            <p className="text-xl md:text-2xl text-ink/70 font-serif italic mb-12 max-w-2xl mx-auto leading-relaxed">
              Most people focus on Income. The wealthy focus on Assets.
              <br/>
              <span className="text-ink font-bold not-italic">Capital Velocity</span> visualizes your real financial position.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link to="/app/dashboard">
                <Button className="text-lg px-10 py-5 bg-ink text-white shadow-2xl hover:-translate-y-1 transition-transform">
                  Launch App
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" className="text-lg px-10 py-5">
                   Create Account
                </Button>
              </Link>
            </div>
         </div>
      </header>

      {/* Section 1: Cashflow Patterns (Moved Up) */}
      <section className="bg-paper-contrast py-24 border-b border-ink/10">
          <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-16">
                  <h2 className="text-4xl font-serif font-bold mb-4">The Three Patterns</h2>
                  <p className="text-xl text-ink/60 font-serif italic max-w-2xl mx-auto">
                      It's not about how much you make. It's about how you spend it.
                  </p>
              </div>
              <div className="flex justify-center">
                  <CashflowPatternsAnimation />
              </div>
          </div>
      </section>

      {/* Section 2: The Core Philosophy (Animated Quadrant) */}
      <section className="py-24 px-4 border-b border-ink/10 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
              <div>
                  <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8 leading-tight">
                      The Cashflow <br/><span className="text-accent-gold">Quadrant</span>
                  </h2>
                  <p className="text-xl text-ink/80 font-serif leading-relaxed mb-6">
                      There are four ways to produce income. The left side works for money. The right side has money work for them.
                  </p>
                  <ul className="space-y-6 text-lg font-serif">
                      <li className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-ink/10 flex items-center justify-center font-bold text-sm shrink-0">E</div>
                          <p><strong className="text-ink">Employee:</strong> You exchange time for money. Highest taxes.</p>
                      </li>
                      <li className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-ink/10 flex items-center justify-center font-bold text-sm shrink-0">S</div>
                          <p><strong className="text-ink">Self-Employed:</strong> You own a job. If you stop, income stops.</p>
                      </li>
                      <li className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-accent-green text-white flex items-center justify-center font-bold text-sm shrink-0">B</div>
                          <p><strong className="text-accent-green">Business:</strong> You own a system. People work for you.</p>
                      </li>
                      <li className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-accent-gold text-white flex items-center justify-center font-bold text-sm shrink-0">I</div>
                          <p><strong className="text-accent-gold">Investor:</strong> Money works for you. 0% Taxes (legally).</p>
                      </li>
                  </ul>
                  <div className="mt-10 p-4 bg-paper border-l-4 border-accent-gold italic text-ink/70">
                      "You cannot be free if you stay on the left side of the quadrant."
                  </div>
              </div>
              
              <div className="flex justify-center md:justify-end">
                  <QuadrantAnimation />
              </div>
          </div>
      </section>

      {/* Section 3: Product Features (Animated Demos) */}
      <section className="bg-paper-dark py-32 border-b border-ink/10">
         <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-20">
                <span className="text-accent-green font-bold tracking-widest uppercase text-sm">How It Works</span>
                <h2 className="text-4xl md:text-5xl font-serif font-bold mt-4 mb-6">A System for Wealth</h2>
                <p className="text-xl text-ink/60 font-serif italic max-w-2xl mx-auto">
                    Stop guessing. Start measuring.
                </p>
            </div>
            
            {/* Feature 1 */}
            <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
                 <div className="order-2 md:order-1 flex justify-center">
                      <DashboardSimAnimation />
                 </div>
                 <div className="order-1 md:order-2">
                      <h3 className="text-3xl font-serif font-bold mb-4">1. Build Your Asset Column</h3>
                      <p className="text-lg text-ink/70 font-serif leading-relaxed mb-6">
                          The rich buy assets. The poor buy liabilities they <em>think</em> are assets. 
                          Our dashboard clearly separates the two. Watch your Net Worth grow in real-time as you add real assets.
                      </p>
                      <Button className="mt-4">Start Tracking Assets</Button>
                 </div>
            </div>

            {/* Feature 2 */}
            <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
                 <div className="order-1">
                      <h3 className="text-3xl font-serif font-bold mb-4">2. Automate the Boring Stuff</h3>
                      <p className="text-lg text-ink/70 font-serif leading-relaxed mb-6">
                          Don't waste time entering data. Drag and drop your bank statements, brokerage PDFs, or Excel sheets. 
                          Our AI extracts the line items and classifies them instantly.
                      </p>
                      <ul className="text-sm font-bold font-serif space-y-2 text-ink/60">
                          <li>✓ Supports PDF Bank Statements</li>
                          <li>✓ Supports Brokerage Reports</li>
                          <li>✓ Privacy-First (Local Processing)</li>
                      </ul>
                 </div>
                 <div className="order-2 flex justify-center">
                      <IngestionAnimation />
                 </div>
            </div>

            {/* Feature 3 (NEW) */}
            <div className="grid md:grid-cols-2 gap-16 items-center">
                 <div className="order-2 md:order-1 flex justify-center">
                      <CoachAnimation />
                 </div>
                 <div className="order-1 md:order-2">
                      <h3 className="text-3xl font-serif font-bold mb-4">3. Artificial Financial Intelligence</h3>
                      <p className="text-lg text-ink/70 font-serif leading-relaxed mb-6">
                          It's not just about tracking; it's about strategy. Our AI Coach analyzes your ledger against Rich Dad principles to identify cashflow leaks and suggest asset acquisitions.
                      </p>
                      <div className="p-4 bg-paper-contrast border border-ink/10 italic text-sm text-ink/70">
                          "Your AI identified that 40% of your outflow is servicing bad debt. Focus on paying down the car loan before investing in stocks."
                      </div>
                 </div>
            </div>
         </div>
      </section>

      {/* Section 4: Dark Manifesto Section */}
      <section className="py-24 bg-ink text-paper-contrast">
          <div className="max-w-4xl mx-auto px-4 text-center">
              <span className="text-accent-gold font-bold tracking-widest uppercase text-xs mb-4 block">The Rules Have Changed</span>
              <h2 className="text-3xl md:text-6xl font-serif font-bold mb-12 leading-tight">
                  Stop saving. Start investing.<br/>
                  Savers are losers.
              </h2>
              <div className="grid md:grid-cols-3 gap-8 text-left mb-12">
                  <div className="bg-white/5 p-6 border border-white/10">
                      <h4 className="font-bold text-accent-gold mb-2">Inflation</h4>
                      <p className="text-sm opacity-70 font-serif">Your cash is losing value every second. Holding cash is a guaranteed way to lose wealth.</p>
                  </div>
                  <div className="bg-white/5 p-6 border border-white/10">
                      <h4 className="font-bold text-accent-gold mb-2">Taxes</h4>
                      <p className="text-sm opacity-70 font-serif">Employees pay tax on income. Investors pay tax on what's left. The system favors the investor.</p>
                  </div>
                  <div className="bg-white/5 p-6 border border-white/10">
                      <h4 className="font-bold text-accent-gold mb-2">Debt</h4>
                      <p className="text-sm opacity-70 font-serif">Good debt makes you rich (Real Estate). Bad debt makes you poor (Consumerism). Learn the difference.</p>
                  </div>
              </div>
              <Link to="/app/dashboard">
                <Button className="border-accent-gold text-accent-gold hover:bg-accent-gold hover:text-white px-10 py-4 text-lg">
                    Take Control of Your Ledger
                </Button>
              </Link>
          </div>
      </section>
      
      {/* Footer CTA */}
      <section className="py-24 text-center bg-white border-b border-ink/10">
         <h2 className="text-3xl md:text-5xl font-serif font-bold mb-8">What gets measured,<br/>gets managed.</h2>
         <Link to="/app/dashboard">
            <Button className="px-12 py-5 text-xl shadow-xl hover:bg-accent-green hover:border-accent-green hover:text-white transition-colors">
               Start Your Ledger
            </Button>
         </Link>
         <p className="mt-6 text-ink/50 text-sm font-serif italic">
             "The poor and middle class work for money. The rich have money work for them."
         </p>
      </section>

      <footer className="bg-ink text-paper-contrast py-12 text-center font-serif border-t border-ink/10">
         <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center opacity-60">
             <p className="text-sm">&copy; 2025 Capital Velocity.</p>
             <div className="flex gap-4 text-sm mt-4 md:mt-0">
                 <span>Privacy</span>
                 <span>Terms</span>
                 <span>Manifesto</span>
             </div>
         </div>
      </footer>
    </div>
  );
};

export default LandingPage;