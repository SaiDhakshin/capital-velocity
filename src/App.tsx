
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { dataService } from './services/storageService';
import type { FinancialSnapshot, Asset, Liability, Transaction } from './types';
import DashboardPage from './pages/DashboardPage';
import AssetsPage from './pages/AssetsPage';
import TransactionsPage from './pages/TransactionsPage';
import SettingsPage from './pages/SettingsPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';

// --- Protected Route Guard ---
const ProtectedRoute: React.FC = () => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return <Outlet />;
};

// Classic Book Navigation Layout
const Layout: React.FC = () => {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const navItems = [
    { path: '/app/dashboard', label: 'Overview' },
    { path: '/app/assets', label: 'Assets & Liabilities' },
    { path: '/app/transactions', label: 'Ledger' }
  ];

  const handleScenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      if (val) {
          dataService.loadScenario(val);
          window.location.reload();
      }
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper font-body text-ink">
      {/* Top Navbar */}
      <nav className="bg-paper-contrast border-b border-ink/10 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center h-auto md:h-20 py-4 md:py-0">
            
            {/* Logo area - Redirects based on Auth Status */}
            <div className="flex items-center mb-4 md:mb-0">
              <Link to={isAuthenticated ? "/app/dashboard" : "/"} className="flex flex-col items-center md:items-start group">
                <span className="font-serif font-bold text-2xl tracking-tighter text-ink border-b-2 border-ink pb-1 mb-1 group-hover:opacity-80 transition-opacity">CAPITAL VELOCITY</span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-ink/60">Strategic Capital Management</span>
              </Link>
            </div>
            
            {/* Centered Nav Links */}
            <div className="flex space-x-1 md:space-x-8">
                {navItems.map(item => (
                  <Link 
                    key={item.path} 
                    to={item.path} 
                    className={`px-3 py-2 text-sm font-serif font-bold uppercase tracking-wide transition-all ${
                      location.pathname === item.path 
                        ? 'text-ink border-b-2 border-ink' 
                        : 'text-ink/50 hover:text-ink hover:border-b border-ink/30'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
            </div>

            {/* Right Actions: Scenario & User Profile */}
            <div className="hidden md:flex items-center gap-6">
               {/* Scenario Selector */}
               <div className="flex items-center gap-2 border-r border-ink/10 pr-6">
                   <span className="text-[10px] uppercase font-bold text-ink/40">Scenario</span>
                   <select onChange={handleScenarioChange} className="bg-transparent text-xs font-serif font-bold text-ink focus:outline-none cursor-pointer">
                       <option value="">Default</option>
                       <option value="user_example">Starter</option>
                       <option value="freedom">Freedom</option>
                       <option value="deficit">Crisis</option>
                   </select>
               </div>

               {/* User Avatar Menu */}
               <div className="relative">
                   <button 
                       onClick={() => setIsMenuOpen(!isMenuOpen)}
                       className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none"
                   >
                       <div className="text-right hidden lg:block">
                           <div className="text-sm font-bold text-ink">{user?.name || 'Investor'}</div>
                           <div className="text-[10px] text-ink/50 uppercase tracking-wider">{user?.title || 'Member'}</div>
                       </div>
                       <div className="w-10 h-10 rounded-full bg-ink text-paper-contrast flex items-center justify-center font-serif font-bold text-lg border-2 border-transparent hover:border-accent-gold transition-colors shadow-sm">
                           {user?.name ? user.name.charAt(0) : 'I'}
                       </div>
                   </button>
                   
                   {/* Dropdown */}
                   {isMenuOpen && (
                       <>
                           <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
                           <div className="absolute right-0 mt-3 w-48 bg-white border border-ink/10 shadow-xl rounded-sm z-50 animate-fade-in-up">
                               <div className="py-1">
                                   <Link 
                                       to="/app/settings" 
                                       className="block px-4 py-2 text-sm text-ink hover:bg-ink/5 font-serif border-b border-ink/5"
                                       onClick={() => setIsMenuOpen(false)}
                                   >
                                       Settings & Profile
                                   </Link>
                                   <button 
                                       onClick={() => { logout(); setIsMenuOpen(false); }}
                                       className="block w-full text-left px-4 py-2 text-sm text-accent-red hover:bg-ink/5 font-serif"
                                   >
                                       Sign Out
                                   </button>
                               </div>
                           </div>
                       </>
                   )}
               </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 relative overflow-x-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
           <Outlet />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-ink/5 py-6 text-center">
         <p className="text-xs font-serif text-ink/30 italic">Est. 2025 • Capital Velocity Edition</p>
      </footer>
    </div>
  );
};

// Main Data Fetcher Wrapper
const AppDataWrapper: React.FC = () => {
    const [snapshot, setSnapshot] = useState<FinancialSnapshot>(dataService.getSnapshot());
    const [assets, setAssets] = useState<Asset[]>(dataService.getAssets());
    const [liabilities, setLiabilities] = useState<Liability[]>(dataService.getLiabilities());
    const [transactions, setTransactions] = useState<Transaction[]>(dataService.getTransactions());
    
    const refreshData = () => {
        setSnapshot(dataService.getSnapshot());
        setAssets(dataService.getAssets());
        setLiabilities(dataService.getLiabilities());
        setTransactions(dataService.getTransactions());
    };

    useEffect(() => {
        refreshData();
        // Since we are using local storage simulation, we might want to poll or use event listeners
        // for deeper updates, but for React state simple passing of `onUpdate` suffices.
    }, []);

    // Also re-fetch if location changes (as a crude way to catch updates if state management wasn't perfect)
    const location = useLocation();
    useEffect(() => { refreshData(); }, [location]);

    return (
        <Routes>
            <Route path="dashboard" element={<DashboardPage snapshot={snapshot} assets={assets} liabilities={liabilities} />} />
            <Route path="assets" element={<AssetsPage assets={assets} liabilities={liabilities} onUpdate={refreshData} />} />
            <Route path="transactions" element={<TransactionsPage transactions={transactions} onUpdate={refreshData} />} />
            <Route path="settings" element={<SettingsPage />} />
        </Routes>
    );
};

// Main Application Logic
export default function App() {
  return (
    <AuthProvider>
        <Router>
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Protected App Routes (Wrapped in Layout) */}
            <Route path="/app" element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                    <Route path="*" element={<AppDataWrapper />} />
                </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Router>
    </AuthProvider>
  );
}
