/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar, { NavTab } from './components/layout/Navbar';
import Dashboard from './components/dashboard/Dashboard';
import CustomerList from './components/customers/CustomerList';
import DailyEntries from './components/entries/DailyEntries';
import Payments from './components/payments/Payments';
import Billing from './components/billing/Billing';
import Settings from './components/settings/Settings';
import useData from './hooks/useData';
import Login from './components/Login';
import { useAuth } from './lib/AuthContext';
import { Bell, Search, Milk } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'motion/react';

export default function App() {
  const { user, loading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const data = useData();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full mb-4 flex items-center justify-center">
             <Milk className="text-blue-500" />
          </div>
          <p className="text-gray-400 font-medium">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    // Basic search filtering (only for customers for now as a demo of better features)
    const filteredCustomers = searchQuery 
      ? data.customers.filter(c => 
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          c.code.includes(searchQuery)
        )
      : data.customers;
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            user={user} 
            customers={data.customers} 
            entries={data.entries} 
            payments={data.payments} 
            notifications={data.notifications}
            markNotificationAsRead={data.markNotificationAsRead}
          />
        );
      case 'customers':
        return (
          <CustomerList 
            customers={filteredCustomers} 
            addCustomer={data.addCustomer} 
            updateCustomer={data.updateCustomer}
            deleteCustomer={data.deleteCustomer} 
          />
        );
      case 'entries':
        return (
          <DailyEntries 
            customers={filteredCustomers} 
            entries={data.entries} 
            settings={data.settings}
            addMilkEntry={data.addMilkEntry} 
            deleteMilkEntry={data.deleteMilkEntry} 
          />
        );
      case 'payments':
        return (
          <Payments 
            customers={filteredCustomers} 
            payments={data.payments} 
            addPayment={data.addPayment} 
            deletePayment={data.deletePayment}
            settings={data.settings}
          />
        );
      case 'billing':
        return (
          <Billing 
            customers={filteredCustomers} 
            entries={data.entries} 
            payments={data.payments} 
            settings={data.settings}
            addNotification={data.addNotification}
          />
        );
      case 'settings':
        return (
          <Settings 
            settings={data.settings} 
            updateSettings={data.updateSettings} 
          />
        );
      default:
        return (
          <Dashboard 
            user={user} 
            customers={data.customers} 
            entries={data.entries} 
            payments={data.payments} 
            notifications={data.notifications}
            markNotificationAsRead={data.markNotificationAsRead}
          />
        );
    }
  };

  if (data.loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#FDFDFD]">
        <div className="flex flex-col items-center">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 bg-brand-primary rounded-[2rem] mb-6 flex items-center justify-center shadow-2xl shadow-brand-primary/10"
          >
             <Milk size={32} className="text-white" />
          </motion.div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce" />
            <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
          <p className="mt-4 text-[10px] text-brand-primary font-bold uppercase tracking-[0.3em]">Loading Darpan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col md:flex-row font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="hidden md:flex items-center justify-between px-8 h-20 bg-white border-b border-gray-50 sticky top-0 z-40">
           <div className="flex items-center bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 w-96 group focus-within:ring-2 focus-within:ring-brand-primary/20 transition-all">
              <Search size={18} className="text-gray-400 group-focus-within:text-brand-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Grahak ya cord dhoondein..." 
                className="bg-transparent border-none focus:outline-none ml-2 text-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-500">{format(new Date(), 'EEEE, dd MMM')}</span>
              <div 
                onClick={() => setActiveTab('dashboard')} // Quick way to see them
                className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors cursor-pointer border border-gray-100 relative"
              >
                <Bell size={20} />
                {data.notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                    {data.notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </div>
              <div 
                onClick={() => {
                  if (confirm('Kya aap logout karna chahte hain?')) {
                    logout();
                  }
                }}
                className="cursor-pointer transition-transform active:scale-95"
              >
                {user?.photoURL ? (
                  <img src={user.photoURL} className="w-10 h-10 rounded-xl shadow-lg border-2 border-white" alt="User" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-100">
                    {user?.displayName?.[0] || 'S'}
                  </div>
                )}
              </div>
           </div>
        </header>

        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-6 pt-6 pb-2 sticky top-0 bg-[#FDFDFD]/80 backdrop-blur-md z-40">
           <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
                <Milk size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-black text-gray-800 leading-none">Dugdh <span className="text-blue-600">Darpan</span></h1>
                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Premium Dairy</p>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-400 border border-gray-100">
                <Bell size={16} />
              </div>
              <button 
                onClick={() => {
                  if (confirm('Kya aap logout karna chahte hain?')) {
                    logout();
                  }
                }}
                className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm"
              >
                {user?.photoURL ? (
                  <img src={user.photoURL} className="w-full h-full rounded-lg" alt="U" />
                ) : (
                  user?.displayName?.[0] || 'S'
                )}
              </button>
           </div>
        </header>

        {/* Main Workspace */}
        <div className="p-6 md:p-8 flex-1 overflow-auto max-w-[1400px] mx-auto w-full">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

