
import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select } from '../components/ui';
import { dataService } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';

const SettingsPage: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    title: ''
  });

  useEffect(() => {
      if (user) {
          setProfile({
              name: user.name,
              email: user.email,
              title: user.title || 'Cashflow Seeker'
          });
      }
  }, [user]);

  const handleSave = async () => {
    if (user) {
        try {
            await updateUser({
                ...user,
                name: profile.name,
                title: profile.title
            });
            alert('Profile settings updated successfully.');
        } catch (e) {
            alert('Failed to update profile');
        }
    }
  };

  const handleExport = () => {
    const data = JSON.stringify(dataService.getTransactions(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger_export_${user?.name.replace(/\s+/g,'_')}.json`;
    a.click();
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="border-b border-ink/10 pb-4">
        <h1 className="text-4xl font-serif font-bold text-ink">Settings</h1>
        <p className="text-ink/50 font-serif italic mt-1">Manage your identity and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-2 space-y-8">
          <Card title="Public Profile">
            <div className="flex items-start gap-6 mb-6">
              <div className="w-20 h-20 rounded-full bg-ink text-paper-contrast flex items-center justify-center text-2xl font-serif font-bold shadow-md">
                 {profile.name.charAt(0)}
              </div>
              <div className="flex-1 space-y-4">
                 <Input 
                    label="Display Name" 
                    value={profile.name} 
                    onChange={e => setProfile({...profile, name: e.target.value})} 
                 />
                 <Input 
                    label="Title / Goal" 
                    value={profile.title} 
                    onChange={e => setProfile({...profile, title: e.target.value})} 
                 />
              </div>
            </div>
            <Input 
                label="Email Address" 
                type="email" 
                value={profile.email} 
                disabled
                className="opacity-60 cursor-not-allowed"
            />
            <div className="mt-6 flex justify-end">
                <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </Card>

          <Card title="Data Management">
             <div className="space-y-4">
                 <div className="flex justify-between items-center border-b border-ink/5 pb-4">
                     <div>
                         <h4 className="font-bold text-ink">Export Ledger</h4>
                         <p className="text-xs text-ink/50 italic">Download all transactions and asset data for {profile.name}.</p>
                     </div>
                     <Button variant="secondary" className="text-xs" onClick={handleExport}>Download JSON</Button>
                 </div>
                 <div className="flex justify-between items-center pt-2">
                     <div>
                         <h4 className="font-bold text-accent-red">Reset Account</h4>
                         <p className="text-xs text-ink/50 italic">Clear all data for this user. Cannot be undone.</p>
                     </div>
                     <Button variant="danger" onClick={() => { if(confirm('Are you sure you want to wipe your data?')) { dataService.reset(); window.location.reload(); } }}>Reset Data</Button>
                 </div>
             </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
             <Card title="System">
                <div className="space-y-4">
                    <Select 
                        label="Currency Display" 
                        options={[
                            {label: 'Auto-detect (System)', value: 'auto'},
                            {label: 'USD ($)', value: 'USD'},
                            {label: 'INR (₹)', value: 'INR'},
                            {label: 'EUR (€)', value: 'EUR'},
                        ]} 
                    />
                    <div className="flex items-center justify-between pt-2">
                         <div className="flex flex-col">
                             <span className="text-sm font-bold text-ink">Theme</span>
                             <span className="text-xs text-ink/50 italic">Paper (Default)</span>
                         </div>
                         <div className="w-10 h-5 bg-ink/10 rounded-full relative cursor-pointer">
                             <div className="w-3 h-3 bg-ink rounded-full absolute top-1 left-1"></div>
                         </div>
                    </div>
                </div>
             </Card>
             
             <Card>
                 <h4 className="font-bold text-ink mb-2">Account Status</h4>
                 <div className="flex items-center gap-2 mb-4">
                     <span className="w-2 h-2 rounded-full bg-accent-green"></span>
                     <span className="text-sm">Active Subscription</span>
                 </div>
                 <Button variant="secondary" className="w-full border-accent-red text-accent-red hover:bg-accent-red hover:text-white" onClick={logout}>Sign Out</Button>
             </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
