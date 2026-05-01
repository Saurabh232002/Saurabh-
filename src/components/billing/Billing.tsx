/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { FileText, Download, Printer, Filter, ChevronRight, User, CreditCard, QrCode, X, Share2, MessageCircle, Check } from 'lucide-react';
import { Customer, MilkEntry, PaymentRecord, BillSummary, AppSettings, TimeSlot, AppNotification } from '../../types';
import { cn, formatCurrency } from '../../lib/utils';
import { format, startOfMonth, endOfMonth, isAfter, isBefore, parseISO, isSameMonth } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface BillingProps {
  customers: Customer[];
  entries: MilkEntry[];
  payments: PaymentRecord[];
  settings: AppSettings;
  addNotification: (notif: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => Promise<void>;
}

export default function Billing({ customers, entries, payments, settings, addNotification }: BillingProps) {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedCustomer, setSelectedCustomer] = useState<string>('all');
  const [qrModal, setQrModal] = useState<BillSummary | null>(null);

  const monthDate = useMemo(() => parseISO(`${selectedMonth}-01`), [selectedMonth]);
  const monthStart = useMemo(() => startOfMonth(monthDate), [monthDate]);
  const monthEnd = useMemo(() => endOfMonth(monthDate), [monthDate]);

  const getUPILink = (bill: BillSummary) => {
    if (!settings.vpa) return null;
    const note = `Dugdh Darpan Bill - ${bill.customerName} - ${bill.month}`;
    return `upi://pay?pa=${settings.vpa}&pn=${encodeURIComponent(settings.merchantName)}&am=${bill.balance}&tn=${encodeURIComponent(note)}&cu=INR`;
  };

  const handlePayClick = (bill: BillSummary) => {
    const link = getUPILink(bill);
    if (!link) {
      alert("Please set your UPI ID in Settings first!");
      return;
    }
    window.location.href = link;
  };

  const formatPDFCurrency = (amount: number) => {
    return `Rs ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleSharePDF = async (bill: BillSummary) => {
    const customer = customers.find(c => c.id === bill.customerId);
    if (!customer) return;

    const doc = new jsPDF();
    const monthDate = parseISO(`${bill.month}-01`);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthStart);

    const customerEntries = entries
      .filter(e => {
        const entryDate = parseISO(e.date);
        return e.customerId === bill.customerId && 
               entryDate >= monthStart && 
               entryDate <= monthEnd;
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    // Premium Color Palette
    const primaryColor: [number, number, number] = [26, 71, 42]; // Deep Forest Green
    const secondaryColor: [number, number, number] = [240, 245, 241]; // Very Light Green Background
    const accentColor: [number, number, number] = [184, 134, 11]; // Dark Gold for accents
    
    // Header Background
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 45, 'F');
    
    // Header Content
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text(settings.merchantName.toUpperCase(), 14, 22);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 200);
    doc.text('PREMIUM DAIRY SERVICES', 14, 30);
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('BY.SAURABH', 14, 36);
    doc.setFont('helvetica', 'normal');
    
    if (settings.vpa) {
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text(`UPI ID: ${settings.vpa}`, 196, 22, { align: 'right' });
    }

    // Customer Info Box
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.5);
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.roundedRect(14, 52, 182, 28, 2, 2, 'FD');
    
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`CUSTOMER INVOICE`, 16, 60);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Name: ${customer.name}`, 16, 68);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Account No: ${customer.code}`, 16, 74);
    
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(`BILLING PERIOD`, 190, 60, { align: 'right' });
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`${format(monthStart, 'dd MMM yyyy')} - ${format(monthEnd, 'dd MMM yyyy')}`, 190, 68, { align: 'right' });

    // Table
    const tableData = customerEntries.map(e => [
      format(parseISO(e.date), 'dd MMM') + ' ' + (e.slot === TimeSlot.MORNING ? 'AM' : 'PM'),
      `${e.quantity.toFixed(3)} L`,
      `Rs. ${e.rate.toFixed(2)}`,
      `Rs. ${e.amount.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 88,
      head: [['DATE & SLOT', 'QUANTITY', 'RATE', 'AMOUNT']],
      body: tableData,
      foot: [[`TOTAL (${customerEntries.length} Records)`, `${bill.totalQuantity.toFixed(3)} L`, '', `Rs. ${bill.totalAmount.toFixed(2)}`]],
      theme: 'grid',
      headStyles: { 
        fillColor: primaryColor, 
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'center'
      },
      footStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'right'
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 50 },
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right', fontStyle: 'bold' }
      },
      styles: { 
        fontSize: 9,
        cellPadding: 3,
        lineColor: [220, 220, 220],
        textColor: [50, 50, 50]
      },
      alternateRowStyles: {
        fillColor: [252, 252, 252]
      }
    });

    doc.setTextColor(0, 0, 0); // Reset for following content

    const finalY = ((doc as any).lastAutoTable?.finalY || 150) + 15;

    // Check for page break before drawing summary
    let currentY = finalY;
    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    }

    // Summary Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('STATEMENT SUMMARY', 14, currentY);
    
    doc.setDrawColor(230, 230, 230);
    doc.line(14, currentY + 3, 196, currentY + 3);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    
    const summaryX = 120;
    const valueX = 195;
    const startYForSummary = currentY;
    currentY += 12;

    // Table of values
    const drawRow = (label: string, value: string, isBold: boolean = false, color: number[] = [0, 0, 0]) => {
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.text(label, summaryX, currentY);
      doc.setTextColor(color[0], color[1], color[2]);
      if (isBold) doc.setFont('helvetica', 'bold');
      doc.text(value, valueX, currentY, { align: 'right' });
      currentY += 8;
    };

    drawRow('Total Quantity Received:', `${bill.totalQuantity.toFixed(1)} L`);
    drawRow('Previous Balance (Old Hisab):', `${formatPDFCurrency(bill.previousOutstanding)}`);
    drawRow('Current Month Bill:', `${formatPDFCurrency(bill.totalAmount)}`);
    
    doc.setDrawColor(240, 240, 240);
    doc.line(summaryX, currentY - 4, valueX, currentY - 4);
    
    drawRow('Total Amount Received:', `- ${formatPDFCurrency(bill.totalPaid)}`, true, [22, 163, 74]);

    currentY += 5;
    
    // Balance Box Callout
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.roundedRect(summaryX - 5, currentY, 80, 18, 1, 1, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('TOTAL BALANCE BAKI:', summaryX, currentY + 7);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`${formatPDFCurrency(bill.balance)}`, valueX, currentY + 13, { align: 'right' });

    // QR Code for payment
    if (settings.vpa && bill.balance > 0) {
      try {
        const upiLink = getUPILink(bill);
        if (upiLink) {
          const qrDataUrl = await QRCode.toDataURL(upiLink, { margin: 1, scale: 4 });
          const qrSize = 35;
          const qrX = 14;
          const qrY = startYForSummary + 5;
          
          doc.setDrawColor(230, 230, 230);
          doc.setLineWidth(0.5);
          doc.roundedRect(qrX, qrY, qrSize + 10, qrSize + 20, 2, 2, 'S');
          
          doc.addImage(qrDataUrl, 'PNG', qrX + 5, qrY + 5, qrSize, qrSize);
          
          doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.text('SCAN TO PAY', qrX + (qrSize + 10)/2, qrY + qrSize + 12, { align: 'center' });
        }
      } catch (err) {
        console.error('Failed to generate QR for PDF', err);
      }
    }

    // Footer
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    const footerY = 285;
    doc.text(settings.merchantName.toUpperCase(), 105, footerY - 5, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(`Digitally Generated by Dugdh Darpan Premium - Thank you for your business!`, 105, footerY, { align: 'center' });

    const blob = doc.output('blob');
    const fileName = `Bill_${customer.name.replace(/\s+/g, '_')}_${bill.month}.pdf`;
    const file = new File([blob], fileName, { type: 'application/pdf' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `Milk Bill - ${customer.name}`,
          text: `Milk Bill for ${format(monthStart, 'MMMM yyyy')}`,
        });
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          doc.save(fileName);
        }
      }
    } else {
      doc.save(fileName);
    }
  };

  const billSummaries = useMemo<BillSummary[]>(() => {
    return customers
      .filter(c => selectedCustomer === 'all' || c.id === selectedCustomer)
      .map(customer => {
        const customerEntries = entries.filter(e => {
          const entryDate = parseISO(e.date);
          return e.customerId === customer.id && 
                 entryDate >= monthStart && 
                 entryDate <= monthEnd;
        });

        const customerPayments = payments.filter(p => {
          const paymentDate = parseISO(p.date);
          return p.customerId === customer.id && 
                 paymentDate >= monthStart && 
                 paymentDate <= monthEnd;
        });

        const totalQuantity = customerEntries.reduce((acc, curr) => acc + curr.quantity, 0);
        const totalAmount = customerEntries.reduce((acc, curr) => acc + curr.amount, 0);
        const totalPaid = customerPayments.reduce((acc, curr) => acc + curr.amount, 0);

        // Calculate previous outstanding (Before this month)
        const previousEntries = entries.filter(e => {
          const entryDate = parseISO(e.date);
          return e.customerId === customer.id && entryDate < monthStart;
        });
        const previousPayments = payments.filter(p => {
          const paymentDate = parseISO(p.date);
          return p.customerId === customer.id && paymentDate < monthStart;
        });

        const prevAmount = previousEntries.reduce((acc, curr) => acc + curr.amount, 0);
        const prevPaid = previousPayments.reduce((acc, curr) => acc + curr.amount, 0);
        const opening = customer.openingBalance || 0;
        const previousOutstanding = opening + prevAmount - prevPaid;

        return {
          customerId: customer.id,
          customerName: customer.name,
          month: selectedMonth,
          openingBalance: opening,
          previousOutstanding,
          totalQuantity,
          totalAmount,
          totalPaid,
          balance: previousOutstanding + totalAmount - totalPaid
        };
      });
  }, [customers, entries, payments, monthStart, monthEnd, selectedMonth, selectedCustomer]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header>
        <h2 className="text-2xl font-bold text-gray-800">Monthly Billing (Mahine ka Bill)</h2>
        <p className="text-gray-500">Pure mahine ka hisab kitaab.</p>
      </header>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 space-y-1">
          <label className="text-[10px] uppercase font-bold text-gray-400 px-1">Mahina (Month)</label>
          <input 
            type="month" 
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
          />
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-[10px] uppercase font-bold text-gray-400 px-1">Grahak (Customer)</label>
          <select 
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
            value={selectedCustomer}
            onChange={e => setSelectedCustomer(e.target.value)}
          >
            <option value="all">Sabhi Grahak (All)</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {billSummaries.length === 0 ? (
          <div className="py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
             <p className="text-gray-400">Abhi koi bill summary nahi mili.</p>
          </div>
        ) : (
          billSummaries.map(bill => (
            <div key={bill.customerId} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group">
               <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <User size={24} />
                     </div>
                     <div>
                        <h4 className="font-bold text-lg text-gray-800">{bill.customerName}</h4>
                        <p className="text-xs text-gray-500">{format(new Date(bill.month + '-01'), 'MMMM yyyy')} Status</p>
                     </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-6 items-center">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Total Milk</p>
                      <p className="text-sm font-bold text-gray-800">{bill.totalQuantity.toFixed(1)} L</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Purana Bill (Old)</p>
                      <p className="text-sm font-bold text-amber-600">{formatCurrency(bill.previousOutstanding)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Naya Bill (New)</p>
                      <p className="text-sm font-bold text-gray-800">{formatCurrency(bill.totalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Paid</p>
                      <p className="text-sm font-bold text-green-600">{formatCurrency(bill.totalPaid)}</p>
                    </div>
                    <div className="px-4 py-2 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="text-[10px] uppercase font-bold text-blue-400 mb-1">Balance</p>
                      <p className={cn(
                        "text-sm font-black",
                        bill.balance > 0 ? "text-red-500" : "text-green-600"
                      )}>
                        {formatCurrency(bill.balance)}
                      </p>
                    </div>
                  </div>
                  
                    <div className="flex gap-2">
                       <button 
                         onClick={() => handleSharePDF(bill)}
                         className="p-2.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl transition-all flex items-center gap-2"
                         title="Share PDF Bill on WhatsApp"
                       >
                         <Share2 size={18} />
                         <span className="text-xs font-bold md:hidden">Share PDF</span>
                       </button>
                    {bill.balance > 0 && (
                      <>
                        <button 
                          onClick={() => setQrModal(bill)}
                          className="p-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-all"
                          title="Show QR Code"
                        >
                          <QrCode size={18} />
                        </button>
                        <button 
                          onClick={() => handlePayClick(bill)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all active:scale-95"
                        >
                           <CreditCard size={16} />
                           Pay
                        </button>
                      </>
                    )}
                  </div>
               </div>
            </div>
          ))
        )}
      </div>

      {/* QR Modal */}
      {qrModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-sm rounded-[40px] overflow-hidden shadow-2xl p-8 relative animate-in zoom-in-95 duration-300 flex flex-col items-center">
              <button 
                onClick={() => setQrModal(null)}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
              >
                <X size={24} />
              </button>
              
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                 <CreditCard size={32} />
              </div>
              
              <h3 className="text-xl font-black text-gray-800 text-center">{qrModal.customerName}</h3>
              <p className="text-gray-500 text-sm mb-8">Scan and Pay via GPay / PhonePe</p>

              <div className="p-6 bg-white border-2 border-dashed border-gray-100 rounded-[32px] shadow-sm mb-8">
                 <QRCodeSVG 
                   value={getUPILink(qrModal) || ''} 
                   size={200}
                   level="H"
                   includeMargin={true}
                 />
              </div>

              <div className="flex w-full gap-4 mb-8">
                 <div className="flex-1 p-3 bg-gray-50 rounded-2xl text-center">
                    <p className="text-[10px] uppercase font-bold text-gray-400">Purana</p>
                    <p className="text-xs font-bold text-amber-600">{formatCurrency(qrModal.previousOutstanding)}</p>
                 </div>
                 <div className="flex-1 p-3 bg-gray-50 rounded-2xl text-center">
                    <p className="text-[10px] uppercase font-bold text-gray-400">Naya</p>
                    <p className="text-xs font-bold text-gray-800">{formatCurrency(qrModal.totalAmount)}</p>
                 </div>
                 <div className="flex-1 p-3 bg-gray-50 rounded-2xl text-center">
                    <p className="text-[10px] uppercase font-bold text-gray-400">Mila</p>
                    <p className="text-xs font-bold text-green-600">{formatCurrency(qrModal.totalPaid)}</p>
                 </div>
              </div>

              <div className="text-center">
                 <p className="text-3xl font-black text-blue-600">{formatCurrency(qrModal.balance)}</p>
                 <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mt-1">Total Outstanding</p>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-50 w-full">
                 <button 
                   onClick={async () => {
                     await addNotification({
                       type: 'PAYMENT_ALERT',
                       title: 'UPI Payment Received',
                       message: `${qrModal.customerName} ne ₹${qrModal.balance} QR scan se pay kiya hai.`,
                       customerId: qrModal.customerId,
                       amount: qrModal.balance
                     });
                     setQrModal(null);
                     alert("Payment successful! Balance update hone mein kuch second lagenge.");
                   }}
                   className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                 >
                   <Check size={20} />
                   Mark as Paid (SIMULATE)
                 </button>
                 <p className="mt-4 text-xs text-gray-400 font-medium text-center">Merchant: {settings.merchantName}</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
