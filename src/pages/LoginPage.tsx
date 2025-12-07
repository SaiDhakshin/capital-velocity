
import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { Card, Button, Input } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect to dashboard
  if (isAuthenticated) {
      return <Navigate to="/app/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setIsLoading(true);
      
      try {
          if (isLogin) {
              await login(email, password);
          } else {
              await register(email, password, name || 'Investor');
          }
          navigate('/app/dashboard');
      } catch (err: any) {
          setError(err.message || 'Authentication failed');
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
         <Link to="/" className="inline-block">
             <span className="font-serif font-bold text-3xl tracking-tighter text-ink border-b-2 border-ink pb-1">CAPITAL VELOCITY</span>
         </Link>
      </div>

      <Card className="w-full max-w-md bg-white shadow-xl border-ink/10">
         <div className="text-center mb-8">
             <h2 className="text-2xl font-serif font-bold">{isLogin ? 'Welcome Back' : 'Join the Club'}</h2>
             <p className="text-ink/50 italic font-serif mt-2">
                 {isLogin ? 'Continue your journey to financial freedom.' : 'Start building your asset column today.'}
             </p>
         </div>
         
         {error && (
             <div className="mb-4 p-3 bg-accent-red/10 border border-accent-red/20 text-accent-red text-sm text-center font-bold">
                 {error}
             </div>
         )}

         <form onSubmit={handleSubmit} className="space-y-6">
             {!isLogin && (
                 <Input 
                    label="Full Name" 
                    placeholder="Robert K." 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required 
                 />
             )}
             <Input 
                label="Email Address" 
                type="email" 
                placeholder="investor@velocity.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
             />
             <Input 
                label="Password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
             />
             
             <Button className="w-full py-3 text-lg" type="submit" disabled={isLoading}>
                 {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
             </Button>
         </form>

         <div className="mt-6 pt-6 border-t border-ink/5 text-center">
             <button 
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-sm font-serif underline text-ink/70 hover:text-ink"
             >
                 {isLogin ? "Don't have an account? Register" : "Already have an account? Sign In"}
             </button>
         </div>
      </Card>
      
      <div className="mt-8">
        <p className="text-xs text-ink/30 italic">Secure Client-Side Database Simulation</p>
      </div>
    </div>
  );
};

export default LoginPage;
