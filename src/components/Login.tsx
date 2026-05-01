import React from 'react';
import { useAuth } from '../lib/AuthContext';
import { Milk, Cloud, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Login() {
  const { login, error, clearError } = useAuth();

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[3rem] shadow-xl shadow-blue-50 border border-gray-100 p-10 text-center relative overflow-hidden"
      >
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-red-50 border-b border-red-100 -mx-10 -mt-10 mb-8 p-4 flex items-start gap-3 text-left"
            >
              <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Login Error</p>
                <p className="text-xs text-red-500 leading-relaxed font-medium">{error}</p>
              </div>
              <button 
                onClick={clearError}
                className="text-red-400 hover:text-red-600 transition-colors p-1"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-center mb-8">
           <div className="relative">
              <div className="w-20 h-20 bg-blue-600 rounded-3xl rotate-6 flex items-center justify-center shadow-2xl shadow-blue-200">
                <Milk size={40} className="text-white -rotate-6" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl flex items-center justify-center border border-gray-100 shadow-lg">
                <Cloud size={20} className="text-blue-500" />
              </div>
           </div>
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 mb-2">Dugdh <span className="text-blue-600">Darpan</span></h1>
        <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-8">Premium Cloud Dairy Management</p>
        
        <div className="space-y-6">
          <p className="text-sm text-gray-500 leading-relaxed px-4">
            Ab aapka data hamesha surakshit rahega cloud par. Kahin se bhi access karein aur apne vyapar ko badhayein.
          </p>
          
          <button 
            onClick={login}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-800 transition-all active:scale-95 cursor-pointer shadow-xl shadow-gray-200"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            Continue with Google
          </button>
          
          <p className="text-[10px] text-gray-400 font-bold uppercase py-4 border-t border-gray-50">
            Powered by Secure Firebase Cloud
          </p>
        </div>
      </motion.div>
    </div>
  );
}
