/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, Scan, CheckCircle, AlertCircle } from 'lucide-react';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

export default function QRScanner({ isOpen, onClose, onScan }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      
      // Give DOM time to render the 'reader' element
      const timer = setTimeout(() => {
        try {
          scannerRef.current = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
          );
          
          scannerRef.current.render(
            (decodedText) => {
              onScan(decodedText);
              if (scannerRef.current) {
                scannerRef.current.clear();
              }
              onClose();
            },
            (err) => {
              // We don't want to alert every frame scan error
              // console.warn(err);
            }
          );
        } catch (e) {
          setError("Could not start camera. Please ensure permissions are granted.");
          console.error(e);
        }
      }, 100);

      return () => {
        clearTimeout(timer);
        if (scannerRef.current) {
          scannerRef.current.clear().catch(e => console.error("Scanner clear error", e));
        }
      };
    }
  }, [isOpen, onScan, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scan size={20} className="text-blue-600" />
            <h3 className="font-bold text-gray-800">Scan UPI / Payment QR</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 trasition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div id="reader" className="w-full bg-gray-50 rounded-2xl overflow-hidden min-h-[300px]"></div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="mt-6 flex flex-col items-center text-center">
            <div className="w-12 h-1 bg-gray-100 rounded-full mb-4" />
            <p className="text-sm text-gray-500 max-w-[250px]">
              Point your camera at the payment receipt QR code to record the transaction.
            </p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 flex justify-center">
           <button 
             onClick={onClose}
             className="w-full py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-2xl shadow-sm hover:bg-gray-100 transition-colors"
           >
             Close Camera
           </button>
        </div>
      </div>
    </div>
  );
}
