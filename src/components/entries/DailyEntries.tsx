/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Plus, Table as TableIcon, Calendar, Sun, Moon, Trash2, CheckCircle2, MessageCircle } from 'lucide-react';
import { Customer, MilkEntry, MilkType, TimeSlot, AppSettings } from '../../types';
import { cn, formatCurrency, formatDate } from '../../lib/utils';
import { format } from 'date-fns';

interface DailyEntriesProps {
  customers: Customer[];
  entries: MilkEntry[];
  settings: AppSettings;
  addMilkEntry: (e: Omit<MilkEntry, 'id'>) => void;
  deleteMilkEntry: (id: string) => void;
}

export default function DailyEntries({ customers, entries, settings, addMilkEntry, deleteMilkEntry }: DailyEntriesProps) {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot>(TimeSlot.MORNING);
  
  const [entryData, setEntryData] = useState<Record<string, { quantity: number; rate: number }>>({});

  // Fast entry state
  const [fastCode, setFastCode] = useState(() => localStorage.getItem('lastFastCode') || '');
  const [fastQty, setFastQty] = useState('');
  const [fastRate, setFastRate] = useState('');

  // Persist code
  React.useEffect(() => {
    localStorage.setItem('lastFastCode', fastCode);
  }, [fastCode]);

  const filteredEntries = useMemo(() => {
    return entries.filter(e => e.date === selectedDate && e.slot === selectedSlot);
  }, [entries, selectedDate, selectedSlot]);

  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.code === fastCode);
  }, [customers, fastCode]);

  const hasFastEntry = useMemo(() => {
    if (!selectedCustomer) return false;
    return filteredEntries.some(e => e.customerId === selectedCustomer.id);
  }, [selectedCustomer, filteredEntries]);

  const handleFastAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || hasFastEntry) return;
    const qty = parseFloat(fastQty);
    const rate = parseFloat(fastRate) || selectedCustomer.defaultRate;
    
    if (isNaN(qty) || qty <= 0) return;

    addMilkEntry({
      customerId: selectedCustomer.id,
      date: selectedDate,
      slot: selectedSlot,
      milkType: selectedCustomer.milkType,
      quantity: qty,
      rate,
      amount: qty * rate
    });

    // Reset fast entry (don't reset code as requested)
    setFastQty('');
    setFastRate('');
    
    // Focus back to quantity input if code is still there, otherwise code input
    const qtyInput = document.getElementById('fast-qty-input');
    if (qtyInput) qtyInput.focus();
  };

  const handleQuickAdd = (customer: Customer) => {
    const quantity = entryData[customer.id]?.quantity || 0;
    const rate = entryData[customer.id]?.rate || customer.defaultRate;
    
    if (quantity <= 0) return;

    // Check if duplicate
    if (filteredEntries.some(e => e.customerId === customer.id)) {
      alert("Entry already exists for this slot!");
      return;
    }

    addMilkEntry({
      customerId: customer.id,
      date: selectedDate,
      slot: selectedSlot,
      milkType: customer.milkType,
      quantity,
      rate,
      amount: quantity * rate
    });

    // Clear input
    setEntryData(prev => ({ ...prev, [customer.id]: { quantity: 0, rate: customer.defaultRate } }));
  };

  const handleShareEntry = (entry: MilkEntry) => {
    const customer = customers.find(c => c.id === entry.customerId);
    if (!customer) return;

    const dateStr = format(new Date(entry.date), 'dd/MM/yyyy');
    
    let message = `🥛 *Dugdh Darpan - Daily Record* 🥛\n`;
    message += `*Grahak:* ${customer.name}\n`;
    message += `*Date:* ${dateStr}\n`;
    message += `*Slot:* ${entry.slot}\n\n`;

    message += `*Qty:* ${entry.quantity}L\n`;
    message += `*Rate:* ₹${entry.rate}\n`;
    message += `*Amount:* ₹${entry.amount === Math.floor(entry.amount) ? entry.amount : entry.amount.toFixed(2)}\n\n`;
    
    message += `*${settings.merchantName}*\nShukriya! 🙏`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500 pb-20">
      <header>
        <h2 className="text-2xl font-bold text-gray-800">Daily Entries (Rozana Record)</h2>
        <p className="text-gray-500">Subah aur shaam ka doodh chadhayein.</p>
      </header>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-200">
          <Calendar size={18} className="text-gray-400 ml-2" />
          <input 
            type="date" 
            className="bg-transparent focus:outline-none w-full text-sm font-medium"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
          />
        </div>
        <div className="flex p-1 bg-gray-100 rounded-xl w-full md:w-auto">
          <button 
            onClick={() => setSelectedSlot(TimeSlot.MORNING)}
            className={cn(
              "flex-1 md:w-32 py-2 rounded-lg flex items-center justify-center gap-2 transition-all",
              selectedSlot === TimeSlot.MORNING ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Sun size={16} />
            <span className="text-sm font-semibold">Morning</span>
          </button>
          <button 
            onClick={() => setSelectedSlot(TimeSlot.EVENING)}
            className={cn(
              "flex-1 md:w-32 py-2 rounded-lg flex items-center justify-center gap-2 transition-all",
              selectedSlot === TimeSlot.EVENING ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Moon size={16} />
            <span className="text-sm font-semibold">Evening</span>
          </button>
        </div>
      </div>

      {/* Fast Entry Section */}
      <div className="bg-blue-600 p-6 rounded-[2rem] shadow-xl shadow-blue-100 text-white animate-in zoom-in-95 duration-300">
         <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
               <h3 className="text-xl font-black mb-1">Fast Entry (Cord Se Entry)</h3>
               <p className="text-blue-100 text-sm">Cord daalein, Milk Qty likhein aur Enter dabayein.</p>
            </div>
            
            <form onSubmit={handleFastAdd} className="flex flex-wrap items-center gap-3 w-full md:w-auto">
               <div className="w-24">
                  <label className="text-[10px] font-bold uppercase opacity-60 mb-1 block">Cord</label>
                  <input 
                    id="fast-code-input"
                    type="text" 
                    placeholder="ID"
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl focus:bg-white focus:text-blue-900 focus:outline-none placeholder:text-white/40 font-bold"
                    value={fastCode}
                    onChange={e => setFastCode(e.target.value)}
                  />
               </div>
               <div className="flex-1 min-w-[120px]">
                  <label className="text-[10px] font-bold uppercase opacity-60 mb-1 block">Grahak (Auto)</label>
                  <div className={cn(
                    "p-3 bg-white/5 border border-white/10 rounded-xl min-h-[46px] flex items-center font-bold overflow-hidden truncate",
                    hasFastEntry && "bg-orange-500/20 border-orange-500/40"
                  )}>
                    {selectedCustomer ? (
                      <div className="flex items-center gap-2 animate-in slide-in-from-top-2">
                        <span>{selectedCustomer.name}</span>
                        {hasFastEntry && (
                          <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full uppercase">Already Added</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-white/20 text-xs italic">Waiting for Cord...</span>
                    )}
                  </div>
               </div>
               <div className="w-24">
                  <label className="text-[10px] font-bold uppercase opacity-60 mb-1 block">Qty (L)</label>
                  <input 
                    id="fast-qty-input"
                    type="number" 
                    step="0.1"
                    placeholder="0.0"
                    disabled={hasFastEntry}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl focus:bg-white focus:text-blue-900 focus:outline-none placeholder:text-white/40 font-bold disabled:opacity-50"
                    value={fastQty}
                    onChange={e => setFastQty(e.target.value)}
                    onFocus={() => {
                        if (selectedCustomer && !fastRate) setFastRate(selectedCustomer.defaultRate.toString());
                    }}
                  />
               </div>
               <div className="flex items-end h-[46px] mt-4 md:mt-0">
                  <button 
                    type="submit"
                    disabled={!selectedCustomer || !fastQty || hasFastEntry}
                    className="h-full px-6 bg-white text-blue-600 rounded-xl font-black hover:bg-blue-50 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
                  >
                    ADD <Plus size={20} />
                  </button>
               </div>
            </form>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Entry Form List */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-700 px-1">Add Entries</h3>
          {customers.length === 0 && (
            <p className="text-gray-400 p-8 text-center italic">No customers found. Please add customers first.</p>
          )}
          {customers.map(customer => {
            const hasEntry = filteredEntries.some(e => e.customerId === customer.id);
            return (
              <div 
                key={customer.id} 
                className={cn(
                  "bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all",
                  hasEntry ? "opacity-50 pointer-events-none grayscale" : "hover:border-blue-200"
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold uppercase relative">
                      {customer.name[0]}
                      <span className="absolute -top-1 -left-1 bg-blue-600 text-[8px] text-white px-1 py-0.5 rounded-full ring-1 ring-white">
                        {customer.code}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        {customer.name}
                        <span className="text-[10px] bg-gray-100 px-1 py-0.5 rounded text-gray-400">#{customer.code}</span>
                      </p>
                      <p className="text-xs text-gray-500">{customer.milkType} • Rate: {formatCurrency(customer.defaultRate)}</p>
                    </div>
                  </div>
                  {hasEntry && <CheckCircle2 size={24} className="text-green-500" />}
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <input 
                      type="number" 
                      placeholder="Qty (L)" 
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      value={entryData[customer.id]?.quantity || ''}
                      onChange={e => setEntryData(prev => ({
                        ...prev, 
                        [customer.id]: { 
                          ...prev[customer.id], 
                          quantity: parseFloat(e.target.value) || 0,
                          rate: prev[customer.id]?.rate || customer.defaultRate
                        } 
                      }))}
                      step="0.1"
                    />
                  </div>
                  <div className="w-24">
                    <input 
                      type="number" 
                      placeholder="Rate" 
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      value={entryData[customer.id]?.rate ?? customer.defaultRate}
                      onChange={e => setEntryData(prev => ({
                        ...prev, 
                        [customer.id]: { 
                          ...prev[customer.id], 
                          rate: parseFloat(e.target.value) || 0,
                          quantity: prev[customer.id]?.quantity || 0
                        } 
                      }))}
                    />
                  </div>
                  <button 
                    onClick={() => handleQuickAdd(customer)}
                    disabled={hasEntry}
                    className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Today's Saved List */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-700 px-1">Recorded for {selectedSlot}</h3>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-bottom border-gray-100">
                <tr>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Grahak</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Qty</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Amount</th>
                  <th className="p-4 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-400 text-sm italic">Abhi koi record nahi mila.</td>
                  </tr>
                ) : (
                  filteredEntries.map(entry => {
                    const customer = customers.find(c => c.id === entry.customerId);
                    return (
                      <tr key={entry.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                        <td className="p-4">
                          <p className="text-sm font-semibold text-gray-800">{customer?.name}</p>
                          <p className="text-[10px] text-gray-400">{entry.milkType}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm font-bold text-blue-600">{entry.quantity} L</p>
                          <p className="text-[10px] text-gray-400">@ {entry.rate}</p>
                        </td>
                        <td className="p-4 text-right font-bold text-gray-800">
                          {formatCurrency(entry.amount)}
                        </td>
                        <td className="p-4 flex items-center justify-end gap-1">
                          <button 
                            onClick={() => handleShareEntry(entry)}
                            className="p-2 text-green-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Share on WhatsApp"
                          >
                            <MessageCircle size={16} />
                          </button>
                          <button 
                            onClick={() => deleteMilkEntry(entry.id)}
                            className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
