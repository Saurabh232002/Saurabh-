/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, UserPlus, Phone, Milk, Trash2, Edit2, Search, X, Save } from 'lucide-react';
import { Customer, MilkType } from '../../types';
import { cn, formatCurrency } from '../../lib/utils';

interface CustomerListProps {
  customers: Customer[];
  addCustomer: (c: Omit<Customer, 'id' | 'createdAt'>) => void;
  updateCustomer: (c: Customer) => void;
  deleteCustomer: (id: string) => void;
}

export default function CustomerList({ customers, addCustomer, updateCustomer, deleteCustomer }: CustomerListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [search, setSearch] = useState('');
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    phone: '',
    milkType: MilkType.COW,
    defaultRate: 40,
    dailyQuantity: 1,
    openingBalance: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    
    // Auto-generate code if empty
    const customerCode = formData.code || (customers.length + 1).toString();
    
    // Check for duplicate code
    if (customers.some(c => c.code === customerCode)) {
      alert(`Cord "${customerCode}" pehle se istemal mein hai! Kripya naya Cord chunain.`);
      return;
    }
    
    addCustomer({
      ...formData,
      code: customerCode
    });

    setFormData({
      code: '',
      name: '',
      phone: '',
      milkType: MilkType.COW,
      defaultRate: 40,
      dailyQuantity: 1,
      openingBalance: 0
    });
    setShowAddForm(false);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      // Check for duplicate code (excluding current customer)
      if (customers.some(c => c.code === editingCustomer.code && c.id !== editingCustomer.id)) {
        alert(`Cord "${editingCustomer.code}" pehle se kisi aur grahak ke liye istemal mein hai!`);
        return;
      }
      updateCustomer(editingCustomer);
      setEditingCustomer(null);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search) ||
    c.code.includes(search)
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Customers (Grahak)</h2>
          <p className="text-gray-500">Apne doodh lene walon ki list aur unka purana hisab.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Add Customer</span>
        </button>
      </header>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm animate-in zoom-in-95 duration-200">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Customer Code (Cord)</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Ex. 101" 
                  className={cn(
                    "w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500",
                    customers.some(c => c.code === formData.code) && "border-red-300 ring-1 ring-red-300"
                  )}
                  value={formData.code}
                  onChange={e => setFormData({...formData, code: e.target.value})}
                />
                {formData.code && customers.some(c => c.code === formData.code) && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">
                    Taken
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Customer Name</label>
              <input 
                type="text" 
                placeholder="Ex. Rahul Singh" 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Phone Number</label>
              <input 
                type="tel" 
                placeholder="Ex. 9876543210" 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Milk Type</label>
              <select 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.milkType}
                onChange={e => setFormData({...formData, milkType: e.target.value as MilkType})}
              >
                <option value={MilkType.COW}>Cow (Gaay)</option>
                <option value={MilkType.BUFFALO}>Buffalo (Bhains)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Rate (Per Liter)</label>
              <input 
                type="number" 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.defaultRate}
                onChange={e => setFormData({...formData, defaultRate: parseFloat(e.target.value) || 0})}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Opening Balance (Purana Hisab)</label>
              <input 
                type="number" 
                placeholder="Ex. 500"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.openingBalance}
                onChange={e => setFormData({...formData, openingBalance: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="md:col-span-2 lg:col-span-1 flex items-end gap-3 pb-1">
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-3 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-[2] py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold"
              >
                Save Grahak
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl p-8 relative animate-in zoom-in-95 duration-300">
              <button 
                onClick={() => setEditingCustomer(null)}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
              >
                <X size={24} />
              </button>
              
              <h3 className="text-2xl font-black text-gray-800 mb-2">Edit Customer</h3>
              <p className="text-gray-500 mb-8">Grahak ki jankari ya purana hisab badlein.</p>

              <form onSubmit={handleUpdate} className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase">Code (Cord)</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          className={cn(
                            "w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500",
                            customers.some(c => c.code === editingCustomer.code && c.id !== editingCustomer.id) && "border-red-300 ring-1 ring-red-300"
                          )}
                          value={editingCustomer.code}
                          onChange={e => setEditingCustomer({...editingCustomer, code: e.target.value})}
                        />
                        {customers.some(c => c.code === editingCustomer.code && c.id !== editingCustomer.id) && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">
                            Already In Use
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase">Grahak Name</label>
                      <input 
                        type="text" 
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editingCustomer.name}
                        onChange={e => setEditingCustomer({...editingCustomer, name: e.target.value})}
                      />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase">Phone Number</label>
                      <input 
                        type="tel" 
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editingCustomer.phone}
                        onChange={e => setEditingCustomer({...editingCustomer, phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase">Milk Type</label>
                      <select 
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editingCustomer.milkType}
                        onChange={e => setEditingCustomer({...editingCustomer, milkType: e.target.value as MilkType})}
                      >
                        <option value={MilkType.COW}>Cow (Gaay)</option>
                        <option value={MilkType.BUFFALO}>Buffalo (Bhains)</option>
                      </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase">Rate/L</label>
                      <input 
                        type="number" 
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editingCustomer.defaultRate}
                        onChange={e => setEditingCustomer({...editingCustomer, defaultRate: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase">Old Bill (Purana)</label>
                      <input 
                        type="number" 
                        className="w-full p-3 bg-blue-50 border border-blue-100 text-blue-800 font-bold rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editingCustomer.openingBalance || 0}
                        onChange={e => setEditingCustomer({...editingCustomer, openingBalance: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                 </div>
                 <div className="pt-4 flex gap-3">
                   <button 
                     type="button" 
                     onClick={() => setEditingCustomer(null)}
                     className="flex-1 py-4 text-gray-500 font-bold border border-gray-100 rounded-2xl"
                   >
                     Cancel
                   </button>
                   <button 
                     type="submit" 
                     className="flex-[2] py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
                   >
                     <Save size={20} />
                     Update Karain
                   </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Search size={18} />
        </span>
        <input 
          type="text" 
          placeholder="Search grahak (name ya phone)..." 
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <UserPlus size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Koi grahak nahi mila. Ek naya grahak jodein!</p>
          </div>
        ) : (
          filteredCustomers.map(customer => (
            <div key={customer.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
               <div className="absolute top-3 right-3 flex gap-1">
                  <button 
                    onClick={() => setEditingCustomer(customer)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors bg-blue-50/50"
                    title="Edit Customer"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm(`Kya aap ${customer.name} ko delete karna chahte hain?`)) {
                        deleteCustomer(customer.id);
                      }
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors bg-red-50/50"
                    title="Delete Customer"
                  >
                    <Trash2 size={16} />
                  </button>
               </div>
               
               <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xl uppercase relative">
                    {customer.name[0]}
                    <span className="absolute -top-1 -left-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full ring-2 ring-white">
                      {customer.code}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                       {customer.name}
                       <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">#{customer.code}</span>
                    </h4>
                    <div className="flex items-center gap-1 text-gray-500 text-sm mt-0.5">
                      <Phone size={12} />
                      <span>{customer.phone || 'No Phone'}</span>
                    </div>
                  </div>
               </div>
               
               <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-gray-50">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Milk</p>
                    <div className="flex items-center gap-1 text-xs font-medium text-gray-700 mt-1">
                      <Milk size={12} className="text-blue-500" />
                      {customer.milkType}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Rate</p>
                    <p className="text-xs font-bold text-gray-800 mt-1">{formatCurrency(customer.defaultRate)}/L</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Old Bill</p>
                    <p className="text-xs font-bold text-amber-600 mt-1">{formatCurrency(customer.openingBalance || 0)}</p>
                  </div>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
