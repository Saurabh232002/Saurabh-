/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum MilkType {
  COW = 'Cow',
  BUFFALO = 'Buffalo',
}

export enum TimeSlot {
  MORNING = 'Morning',
  EVENING = 'Evening',
}

export enum PaymentMethod {
  GPAY = 'GPay',
  PHONEPE = 'PhonePe',
  BANK = 'Bank Transfer',
  CASH = 'Cash',
}

export interface Customer {
  id: string;
  code: string; // Customer ID/Code
  name: string;
  phone: string;
  milkType: MilkType;
  defaultRate: number;
  dailyQuantity?: number; // Preference
  openingBalance?: number; // Starting balance (Purana Hisab)
  createdAt: number;
}

export interface MilkEntry {
  id: string;
  customerId: string;
  date: string; // ISO string date
  slot: TimeSlot;
  milkType: MilkType;
  quantity: number;
  rate: number;
  amount: number;
}

export interface PaymentRecord {
  id: string;
  customerId: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  transactionId?: string;
  note?: string;
}

export interface AppNotification {
  id: string;
  type: 'PAYMENT_ALERT' | 'SYSTEM';
  title: string;
  message: string;
  customerId?: string;
  amount?: number;
  isRead: boolean;
  createdAt: number;
}

export interface AppSettings {
  vpa: string; // Virtual Payment Address / UPI ID
  merchantName: string;
  currency: string;
}

export interface BillSummary {
  customerId: string;
  customerName: string;
  month: string; // YYYY-MM
  openingBalance: number;
  previousOutstanding: number; // Pending from before this month
  totalQuantity: number;
  totalAmount: number;
  totalPaid: number;
  balance: number;
}
