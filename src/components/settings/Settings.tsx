/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppSettings } from '../../types';
import { Save, Wallet, Building, Globe, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface SettingsProps {
  settings: AppSettings;
  updateSettings: (s: AppSettings) => void;
}

export default function Settings({ settings, updateSettings }: SettingsProps) {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const upiLink = formData.vpa 
    ? `upi://pay?pa=${formData.vpa}&pn=${encodeURIComponent(formData.merchantName || 'Dugdh Darpan')}&cu=INR`
    : '';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header>
        <h2 className="text-2xl font-bold text-gray-800">Settings (Settings)</h2>
        <p className="text-gray-500">App aur payment ki jankari set karein.</p>
      </header>

      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800">
               <Wallet size={20} className="text-brand-primary" />
               Payment Information (GPay Details)
            </h3>
            
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">UPI ID (VPA)</label>
              <input 
                type="text" 
                placeholder="yourname@okicici" 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary"
                value={formData.vpa}
                onChange={e => setFormData({...formData, vpa: e.target.value})}
              />
              <p className="text-[10px] text-gray-400 italic">Isi UPI ID par aapka paisa aayega. GPay, PhonePe, and Paytm sabhi support karte hain.</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Shop / Merchant Name</label>
              <input 
                type="text" 
                placeholder="Dugdh Darpan Dairy" 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary"
                value={formData.merchantName}
                onChange={e => setFormData({...formData, merchantName: e.target.value})}
              />
            </div>

            {upiLink && (
              <div className="pt-6 flex flex-col items-center">
                 <div className="p-4 bg-white border-2 border-gray-50 rounded-3xl shadow-sm">
                    <QRCodeSVG value={upiLink} size={150} level="H" />
                 </div>
                 <p className="mt-3 text-xs font-bold text-brand-primary flex items-center gap-1">
                    <QrCode size={12} />
                    GPay / PhonePe QR Preview
                 </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
             {showSuccess && (
               <span className="text-emerald-600 font-bold text-sm animate-in fade-in">Success! Settings saved.</span>
             )}
             <button 
               type="submit"
               className="ml-auto flex items-center gap-2 bg-brand-primary text-white px-8 py-3 rounded-2xl font-bold hover:opacity-90 shadow-lg shadow-brand-primary/10 transition-all active:scale-95"
             >
               <Save size={18} />
               Save Changes
             </button>
          </div>
        </form>
      </div>

      <div className="bg-brand-secondary p-6 rounded-3xl border border-brand-primary/10 max-w-2xl mx-auto">
         <h4 className="font-bold text-brand-primary mb-2">Ye kaise kaam karta hai?</h4>
         <p className="text-sm text-brand-primary/70 leading-relaxed font-bold">
           Jab aap apna UPI ID yaha set karenge, Billing section mein har bill ke niche ek payment link ban jayega. 
           Mobile user uss link par click karke seedhe apna preferred app (GPay/PhonePe) khol payenge.
         </p>
      </div>
    </div>
  );
}
