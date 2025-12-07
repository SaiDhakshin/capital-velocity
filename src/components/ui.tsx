import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string }> = ({ children, className = '', title }) => (
  <div className={`bg-paper-contrast border border-ink/10 shadow-sm p-6 relative ${className}`}>
    {title && (
      <div className="mb-6 border-b border-ink/10 pb-2">
        <h3 className="text-xl font-serif font-bold text-ink tracking-wide">{title}</h3>
      </div>
    )}
    {children}
  </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' }> = ({ children, variant = 'primary', className = '', ...props }) => {
  // Elegant, print-like buttons
  const baseStyle = "px-6 py-2 font-serif font-bold transition-all duration-200 border uppercase tracking-wider text-sm disabled:opacity-50";
  const variants = {
    primary: "bg-ink text-paper-contrast border-ink hover:bg-ink/90",
    secondary: "bg-transparent text-ink border-ink hover:bg-ink hover:text-paper-contrast",
    danger: "bg-paper-contrast text-accent-red border-accent-red hover:bg-accent-red hover:text-white"
  };
  
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className = '', ...props }) => (
  <div className="mb-5">
    {label && <label className="block text-sm font-serif font-bold text-ink/70 mb-1 tracking-wide">{label}</label>}
    <input 
      className={`w-full px-0 py-2 bg-transparent border-b border-ink/30 text-lg font-serif placeholder:text-ink/20 focus:outline-none focus:border-ink transition-colors ${className}`} 
      {...props} 
    />
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string, options: {label: string, value: string}[] }> = ({ label, options, className = '', ...props }) => (
    <div className="mb-5">
      {label && <label className="block text-sm font-serif font-bold text-ink/70 mb-1 tracking-wide">{label}</label>}
      <select 
        className={`w-full px-2 py-2 bg-paper-dark border border-ink/10 font-serif focus:outline-none focus:border-ink ${className}`} 
        {...props} 
      >
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );

export const StatBox: React.FC<{ label: string; value: string; trend?: string; color?: string }> = ({ label, value, trend, color = 'text-ink' }) => (
  <div className="flex flex-col border-l-2 border-ink/10 pl-4">
    <span className="text-xs font-serif font-bold uppercase tracking-widest text-ink/50 mb-1">{label}</span>
    <span className={`text-2xl font-serif font-bold ${color}`}>{value}</span>
    {trend && <span className="text-xs font-serif italic text-ink/60 mt-1">{trend}</span>}
  </div>
);
