/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CreditCard, IndianRupee, Trash2, CheckCircle2, History, QrCode, X } from 'lucide-react';
import { Customer, PaymentRecord, PaymentMethod, AppSettings } from '../../types';
import { cn, formatCurrency, formatDate } from '../../lib/utils';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';

interface PaymentsProps {
  customers: Customer[];
  payments: PaymentRecord[];
  settings: AppSettings;
  addPayment: (p: Omit<PaymentRecord, 'id'>) => void;
  deletePayment: (id: string) => void;
}

export default function Payments({ customers, payments, settings, addPayment, deletePayment }: PaymentsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showReceiveQR, setShowReceiveQR] = useState(false);
  const [qrAmount, setQrAmount] = useState<number>(0);
  const [qrCustomer, setQrCustomer] = useState<string>('');

  const [formData, setFormData] = useState({
    customerId: '',
    amount: 0,
    date: format(new Date(), 'yyyy-MM-dd'),
    method: PaymentMethod.GPAY,
    transactionId: '',
    note: ''
  });

  const getUPILink = () => {
    if (!settings.vpa) return null;
    const customer = customers.find(c => c.id === qrCustomer);
    const note = `Dugdh Darpan Payment${customer ? ' - ' + customer.name : ''}`;
    let link = `upi://pay?pa=${settings.vpa}&pn=${encodeURIComponent(settings.merchantName)}&cu=INR&tn=${encodeURIComponent(note)}`;
    if (qrAmount > 0) {
      link += `&am=${qrAmount}`;
    }
    return link;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId || formData.amount <= 0) return;
    
    addPayment(formData);
    setFormData({
      customerId: '',
      amount: 0,
      date: format(new Date(), 'yyyy-MM-dd'),
      method: PaymentMethod.GPAY,
      transactionId: '',
      note: ''
    });
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Payments (Len Den)</h2>
          <p className="text-gray-500">Milne wali raqam ka hisab.</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setShowReceiveQR(true)}
             className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 active:scale-95 transition-all text-sm font-bold"
           >
             <QrCode size={18} />
             <span>Receive</span>
           </button>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-95 transition-all"
          >
            <CreditCard size={18} />
            <span className="hidden sm:inline">Add Record</span>
          </button>
        </div>
      </header>

      {/* Receive Payment QR Modal */}
      {showReceiveQR && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-sm rounded-[40px] overflow-hidden shadow-2xl p-8 relative animate-in zoom-in-95 duration-300 flex flex-col items-center">
              <button 
                onClick={() => setShowReceiveQR(false)}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
               >
                <X size={24} />
              </button>
              
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
                 <QrCode size={32} />
              </div>
              
              <h3 className="text-xl font-black text-gray-800 text-center">Receive Payment</h3>
              <p className="text-gray-500 text-sm mb-6 text-center">Grahak se paise lene ke liye QR dikhayein.</p>

              <div className="w-full space-y-4 mb-8">
                 <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Grahak (Optional)</label>
                    <select 
                      className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none"
                      value={qrCustomer}
                      onChange={e => setQrCustomer(e.target.value)}
                    >
                      <option value="">Sabhi ke liye</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Amount (Optional)</label>
                    <input 
                      type="number" 
                      placeholder="Ex. 500"
                      className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none"
                      value={qrAmount || ''}
                      onChange={e => setQrAmount(parseFloat(e.target.value) || 0)}
                    />
                 </div>
              </div>

              {settings.vpa ? (
                <div className="p-6 bg-white border-2 border-dashed border-gray-100 rounded-[32px] shadow-sm mb-6">
                   <QRCodeSVG 
                     value={getUPILink() || ''} 
                     size={180}
                     level="H"
                     includeMargin={true}
                   />
                </div>
              ) : (
                <div className="p-8 text-center bg-red-50 rounded-3xl mb-6">
                   <p className="text-xs text-red-600 font-bold">Pehle Settings mein UPI ID set karein!</p>
                </div>
              )}

              <div className="text-center mb-6">
                 <p className="text-xs text-gray-400 font-medium">Merchant: {settings.merchantName}</p>
                 <p className="text-[10px] text-gray-300 mt-1 uppercase tracking-widest">{settings.vpa}</p>
              </div>

              <div className="w-full pt-4 border-t border-gray-50">
                 <div className="bg-blue-50 p-4 rounded-2xl mb-4">
                    <p className="text-[11px] text-blue-700 leading-tight text-center">
                       <b>Note:</b> Paise milne ke baad niche wala button daba kar entry zaroor karein taaki bill mein kam ho jaye.
                    </p>
                 </div>
                 <button 
                   onClick={() => {
                     setFormData({
                       ...formData,
                       customerId: qrCustomer,
                       amount: qrAmount,
                       date: format(new Date(), 'yyyy-MM-dd')
                     });
                     setShowReceiveQR(false);
                     setShowAddForm(true);
                   }}
                   className="w-full py-4 bg-gray-800 text-white font-black rounded-2xl flex items-center justify-center gap-2"
                 >
                   <CreditCard size={20} />
                   Add Payment Record
                 </button>
              </div>
           </div>
        </div>
      )}

      {showAddForm && (
        <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm animate-in zoom-in-95 duration-200">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Select Grahak</label>
              <select 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.customerId}
                onChange={e => setFormData({...formData, customerId: e.target.value})}
                required
              >
                <option value="">Choose Customer...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Amount (Rupaye)</label>
              <div className="relative">
                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                   <IndianRupee size={16} />
                 </span>
                 <input 
                  type="number" 
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.amount || ''}
                  onChange={e => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Method</label>
              <select 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.method}
                onChange={e => setFormData({...formData, method: e.target.value as PaymentMethod})}
              >
                {Object.values(PaymentMethod).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Date</label>
              <input 
                type="date" 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">Transaction ID / Note</label>
              <input 
                type="text" 
                placeholder="Ex. UPI-123456789"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.transactionId}
                onChange={e => setFormData({...formData, transactionId: e.target.value})}
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold"
              >
                Confirm Payment
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
           <History size={18} className="text-gray-400" />
           <h3 className="text-lg font-bold text-gray-700">Recent Payments</h3>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {payments.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
               <CheckCircle2 size={40} className="mx-auto mb-3 opacity-20" />
               <p className="text-sm">Abhi koi payment record nahi hai.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {payments.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(payment => {
                const customer = customers.find(c => c.id === payment.customerId);
                return (
                  <div key={payment.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                     <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold",
                          payment.method === PaymentMethod.CASH ? "bg-amber-400" : "bg-indigo-500"
                        )}>
                          {payment.method === PaymentMethod.CASH ? "C" : "U"}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{customer?.name || 'Unknown'}</p>
                          <p className="text-[10px] text-gray-400 flex items-center gap-1">
                            {payment.method} • {formatDate(payment.date)}
                          </p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4 text-right">
                        <div>
                          <p className="text-sm font-bold text-green-600">+{formatCurrency(payment.amount)}</p>
                          {payment.transactionId && (
                            <p className="text-[10px] text-gray-400 font-mono">{payment.transactionId}</p>
                          )}
                        </div>
                        <button 
                          onClick={() => deletePayment(payment.id)}
                          className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                     </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
