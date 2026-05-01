/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, Users, PlusCircle, CreditCard, ScanLine, FileText, Milk, TrendingUp, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../lib/AuthContext';

export type NavTab = 'dashboard' | 'customers' | 'entries' | 'payments' | 'billing' | 'settings';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const { user, logout } = useAuth();
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: Home },
    { id: 'customers' as NavTab, label: 'Customers', icon: Users },
    { id: 'entries' as NavTab, label: 'Daily Entries', icon: PlusCircle },
    { id: 'payments' as NavTab, label: 'Payments', icon: CreditCard },
    { id: 'billing' as NavTab, label: 'Bills', icon: FileText },
    { id: 'settings' as NavTab, label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe md:relative md:border-t-0 md:border-r md:w-64 md:h-screen md:pb-0">
      <div className="flex justify-around items-center h-16 md:flex-col md:justify-start md:h-full md:py-8 md:gap-4">
        {/* ... existing header ... */}
        <div className="hidden md:block px-6 mb-8 group cursor-pointer">
          <div className="flex items-center gap-3 justify-center mb-2">
            <div className="relative">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl rotate-3 group-hover:rotate-0 transition-transform duration-300 flex items-center justify-center shadow-lg shadow-blue-100">
                <Milk size={28} className="text-white -rotate-3 group-hover:rotate-0 transition-transform duration-300" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-lg flex items-center justify-center border border-gray-100 shadow-sm">
                <TrendingUp size={12} className="text-blue-500" />
              </div>
            </div>
          </div>
          <h1 className="text-xl font-black text-gray-800 tracking-tight text-center">Dugdh <span className="text-brand-primary">Darpan</span></h1>
          <p className="text-[10px] text-gray-400 text-center font-bold uppercase tracking-[0.2em] mt-1">Premium Dairy Services</p>
        </div>

        <div className="flex justify-around items-center w-full md:flex-col md:gap-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex flex-col items-center justify-center w-full py-1 transition-all duration-200 md:flex-row md:justify-start md:px-6 md:py-3 md:gap-3 relative",
                activeTab === id 
                  ? "text-brand-primary" 
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              <div className={cn(
                "p-1 rounded-lg transition-colors",
                activeTab === id ? "bg-brand-secondary" : "bg-transparent"
              )}>
                <Icon size={20} />
              </div>
              <span className="text-[10px] mt-1 font-medium md:text-sm md:mt-0">{label}</span>
              {activeTab === id && (
                <div className="absolute top-0 w-8 h-1 bg-brand-primary rounded-full md:hidden" />
              )}
              {activeTab === id && (
                <div className="hidden md:block absolute right-0 w-1 h-8 bg-brand-primary rounded-l-full" />
              )}
            </button>
          ))}
        </div>

        {/* User Profile / Logout */}
        <div className="hidden md:flex flex-col mt-auto w-full px-4 gap-2">
           <div className="p-3 bg-gray-50 rounded-2xl flex items-center gap-3">
              {user?.photoURL ? (
                <img src={user.photoURL} className="w-8 h-8 rounded-xl" alt="User" />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                  {user?.displayName?.[0] || 'U'}
                </div>
              )}
              <div className="min-w-0">
                 <p className="text-xs font-bold text-gray-900 truncate">{user?.displayName || 'User'}</p>
                 <p className="text-[9px] font-bold text-blue-500 uppercase">Cloud Active</p>
              </div>
           </div>
           <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-500 transition-colors text-sm font-bold w-full"
           >
             <LogOut size={18} />
             <span>Logout</span>
           </button>
        </div>
      </div>
    </nav>
  );
}
