/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Milk, CreditCard, Clock, TrendingUp, Droplets } from 'lucide-react';
import { Customer, MilkEntry, PaymentRecord, AppNotification } from '../../types';
import { formatCurrency, cn } from '../../lib/utils';
import { startOfMonth, subDays, format, isAfter, isBefore, endOfMonth } from 'date-fns';

import { User } from 'firebase/auth';

interface DashboardProps {
  user: User | null;
  customers: Customer[];
  entries: MilkEntry[];
  payments: PaymentRecord[];
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => Promise<void>;
}

export default function Dashboard({ user, customers, entries, payments, notifications, markNotificationAsRead }: DashboardProps) {
  const monthStart = startOfMonth(new Date());
  
  const unreadNotifications = useMemo(() => 
    notifications.filter(n => !n.isRead).sort((a, b) => b.createdAt - a.createdAt), 
  [notifications]);

  const stats = useMemo(() => {
    const currentMonthEntries = entries.filter(e => isAfter(new Date(e.date), subDays(monthStart, 1)));
    const totalMilk = currentMonthEntries.reduce((acc, curr) => acc + curr.quantity, 0);
    const totalAmount = currentMonthEntries.reduce((acc, curr) => acc + curr.amount, 0);
    
    // For pending, let's use global balance
    const globalEntriesAmount = entries.reduce((acc, curr) => acc + curr.amount, 0);
    const globalPaymentsAmount = payments.reduce((acc, curr) => acc + curr.amount, 0);
    const totalOpeningBalances = customers.reduce((acc, curr) => acc + (curr.openingBalance || 0), 0);
    
    const currentMonthPayments = payments.filter(p => isAfter(new Date(p.date), subDays(monthStart, 1)));
    const totalPaidThisMonth = currentMonthPayments.reduce((acc, curr) => acc + curr.amount, 0);
    
    return {
      totalMilk,
      totalAmount, // Current Month
      totalPaid: totalPaidThisMonth,
      pending: totalOpeningBalances + globalEntriesAmount - globalPaymentsAmount
    };
  }, [entries, payments, customers, monthStart]);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), i);
      return format(d, 'yyyy-MM-dd');
    }).reverse();

    return last7Days.map(date => {
      const dayEntries = entries.filter(e => e.date === date);
      return {
        name: format(new Date(date), 'dd MMM'),
        quantity: dayEntries.reduce((acc, curr) => acc + curr.quantity, 0),
      };
    });
  }, [entries]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-tight">
          Swagat hai! <span className="text-brand-primary">{user?.displayName?.split(' ')[0] || 'User'}</span>
        </h2>
        <p className="text-gray-500">Aapki dairy ki aaj ki status.</p>
      </header>

      {unreadNotifications.length > 0 && (
        <section className="bg-amber-50 border border-amber-100 rounded-[2rem] p-6 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-amber-800 font-bold flex items-center gap-2 uppercase tracking-wider text-xs">
              <Clock size={16} />
              Recent Payment Alerts (Auto-Cut)
            </h3>
            <button 
              onClick={() => unreadNotifications.forEach(n => markNotificationAsRead(n.id))}
              className="text-[10px] font-bold text-amber-700 hover:underline"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-3">
            {unreadNotifications.slice(0, 3).map(notif => (
              <div key={notif.id} className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-amber-50 group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{notif.title}</p>
                    <p className="text-xs text-gray-500 leading-tight">{notif.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="hidden sm:block text-right">
                      <p className="text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">Balance Updated</p>
                      <p className="text-[10px] text-gray-400 font-medium">Just now</p>
                   </div>
                   <button 
                    onClick={() => markNotificationAsRead(notif.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Clock size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Milk (Month)" 
          value={`${stats.totalMilk.toFixed(1)} L`} 
          icon={Droplets} 
          color="blue" 
          description="Last 30 days"
        />
        <StatCard 
          title="Total Bill" 
          value={formatCurrency(stats.totalAmount)} 
          icon={TrendingUp} 
          color="green" 
          description="Current month"
        />
        <StatCard 
          title="Received" 
          value={formatCurrency(stats.totalPaid)} 
          icon={CreditCard} 
          color="indigo" 
          description="Payments fixed"
        />
        <StatCard 
          title="Pending" 
          value={formatCurrency(stats.pending)} 
          icon={Clock} 
          color="amber" 
          description="Monthly balance"
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Milk Collection <span className="text-sm font-normal text-gray-400 ml-2">(Last 7 Days)</span></h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[10px] font-bold text-gray-400 uppercase">Litres</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorMilk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="quantity" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorMilk)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="pb-20">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Top Customers</h3>
          <div className="space-y-4">
            {customers.length === 0 ? (
              <p className="text-gray-400 text-sm">No customers added yet.</p>
            ) : (
              customers
                .map(customer => ({
                  ...customer,
                  total: entries
                    .filter(e => e.customerId === customer.id)
                    .reduce((acc, curr) => acc + curr.quantity, 0)
                }))
                .sort((a, b) => b.total - a.total)
                .slice(0, 4)
                .map(customer => (
                  <div key={customer.id} className="flex items-center justify-between p-2 rounded-2xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold uppercase ring-2 ring-white">
                        {customer.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{customer.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Verified Customer</p>
                      </div>
                    </div>
                    <p className="text-sm font-black text-gray-800">{customer.total.toFixed(1)} L</p>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, description }: any) {
  const colors: any = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    indigo: "bg-indigo-100 text-indigo-600",
    amber: "bg-amber-100 text-amber-600",
  };
  
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-3 rounded-xl", colors[color])}>
          <Icon size={24} />
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
        <h4 className="text-2xl font-bold text-gray-900 mt-1">{value}</h4>
        <p className="text-xs text-gray-400 mt-1">{description}</p>
      </div>
    </div>
  );
}
