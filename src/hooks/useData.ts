import { useState, useEffect } from 'react';
import { Customer, MilkEntry, PaymentRecord, AppSettings, AppNotification, PaymentMethod } from '../types';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  doc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  writeBatch,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { handleFirestoreError, OperationType } from '../lib/errorHandlers';

// Enable persistence for faster subsequent loads
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Persistence failed: Browser not supported');
    }
  });
} catch (err) {
  // Ignore if already enabled or other issues
}

export default function useData() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [entries, setEntries] = useState<MilkEntry[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    vpa: '',
    merchantName: 'Dugdh Darpan',
    currency: 'INR'
  });
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState({
    settings: false,
    customers: false,
    entries: false,
    payments: false
  });

  // Perceived loading: set loading to false as soon as critical data arrives
  useEffect(() => {
    if (dataLoaded.settings && dataLoaded.customers) {
      setLoading(false);
    }
  }, [dataLoaded.settings, dataLoaded.customers]);

  // Safety Timeout: If cloud data takes too long, force open the app (offline-first)
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      if (loading) {
        console.warn('Data loading timeout: forcing app open');
        setLoading(false);
      }
    }, 8000); // 8 seconds safety
    return () => clearTimeout(timer);
  }, [user, loading]);

  // Migration from localStorage to Firebase
  useEffect(() => {
    if (!user) return;

    const performMigration = async () => {
      const isMigrated = localStorage.getItem(`migrated_${user.uid}`);
      if (isMigrated) return;

      console.log('Starting migration for user:', user.uid);
      const batch = writeBatch(db);
      
      const localCustomers = localStorage.getItem('customers');
      const localEntries = localStorage.getItem('entries');
      const localPayments = localStorage.getItem('payments');
      const localSettings = localStorage.getItem('settings');

      if (localSettings) {
        const settingsData = JSON.parse(localSettings);
        batch.set(doc(db, 'settings', user.uid), settingsData);
      }

      if (localCustomers) {
        const customersData: Customer[] = JSON.parse(localCustomers);
        customersData.forEach(c => {
          batch.set(doc(db, 'customers', c.id), { ...c, userId: user.uid });
        });
      }

      if (localEntries) {
        const entriesData: MilkEntry[] = JSON.parse(localEntries);
        entriesData.forEach(e => {
          batch.set(doc(db, 'entries', e.id), { ...e, userId: user.uid });
        });
      }

      if (localPayments) {
        const paymentsData: PaymentRecord[] = JSON.parse(localPayments);
        paymentsData.forEach(p => {
          batch.set(doc(db, 'payments', p.id), { ...p, userId: user.uid });
        });
      }

      try {
        await batch.commit();
        localStorage.setItem(`migrated_${user.uid}`, 'true');
        console.log('Migration successful');
      } catch (err) {
        console.error('Migration failed:', err);
      }
    };

    performMigration();
  }, [user]);

  // Data Sync
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Settings
    const settingsPath = `settings/${user.uid}`;
    const unsubSettings = onSnapshot(doc(db, 'settings', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data() as AppSettings);
      }
      setDataLoaded(prev => ({ ...prev, settings: true }));
    }, (err) => {
      setDataLoaded(prev => ({ ...prev, settings: true })); // Unblock even on error
      handleFirestoreError(err, OperationType.GET, settingsPath);
    });

    // Customers
    const customersPath = 'customers';
    const qCustomers = query(collection(db, customersPath), where('userId', '==', user.uid));
    const unsubCustomers = onSnapshot(qCustomers, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Customer[];
      setCustomers(data);
      setDataLoaded(prev => ({ ...prev, customers: true }));
    }, (err) => {
      setDataLoaded(prev => ({ ...prev, customers: true }));
      handleFirestoreError(err, OperationType.LIST, customersPath);
    });

    // Entries
    const entriesPath = 'entries';
    const qEntries = query(collection(db, entriesPath), where('userId', '==', user.uid));
    const unsubEntries = onSnapshot(qEntries, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as MilkEntry[];
      setEntries(data);
      setDataLoaded(prev => ({ ...prev, entries: true }));
    }, (err) => {
      setDataLoaded(prev => ({ ...prev, entries: true }));
      handleFirestoreError(err, OperationType.LIST, entriesPath);
    });

    // Payments
    const paymentsPath = 'payments';
    const qPayments = query(collection(db, paymentsPath), where('userId', '==', user.uid));
    const unsubPayments = onSnapshot(qPayments, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as PaymentRecord[];
      setPayments(data);
      setDataLoaded(prev => ({ ...prev, payments: true }));
    }, (err) => {
      setDataLoaded(prev => ({ ...prev, payments: true }));
      handleFirestoreError(err, OperationType.LIST, paymentsPath);
    });

    // Notifications
    const notificationsPath = 'notifications';
    const qNotifications = query(collection(db, notificationsPath), where('userId', '==', user.uid));
    const unsubNotifications = onSnapshot(qNotifications, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as AppNotification[];
      setNotifications(data);
    }, (err) => handleFirestoreError(err, OperationType.LIST, notificationsPath));

    return () => {
      unsubSettings();
      unsubCustomers();
      unsubEntries();
      unsubPayments();
      unsubNotifications();
    };
  }, [user]);

  // Actions
  const updateSettings = async (newSettings: AppSettings) => {
    if (!user) return;
    const path = `settings/${user.uid}`;
    try {
      await setDoc(doc(db, 'settings', user.uid), newSettings);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const addCustomer = async (customer: Omit<Customer, 'id' | 'createdAt'>) => {
    if (!user) return;
    const path = 'customers';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...customer,
        userId: user.uid,
        createdAt: Date.now()
      });
      return { ...customer, id: docRef.id, createdAt: Date.now() } as Customer;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const updateCustomer = async (updated: Customer) => {
    if (!user) return;
    const path = `customers/${updated.id}`;
    try {
      const { id, ...data } = updated;
      await updateDoc(doc(db, 'customers', id), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!user) return;
    const path = `customers/${id}`;
    try {
      await deleteDoc(doc(db, 'customers', id));
      // Cleanup related entries/payments in background or here
      // For simplicity, we could use a Cloud Function or manually delete here
      const batch = writeBatch(db);
      entries.filter(e => e.customerId === id).forEach(e => batch.delete(doc(db, 'entries', e.id)));
      payments.filter(p => p.customerId === id).forEach(p => batch.delete(doc(db, 'payments', p.id)));
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const addMilkEntry = async (entry: Omit<MilkEntry, 'id'>) => {
    if (!user) return;
    const path = 'entries';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...entry,
        userId: user.uid
      });
      return { ...entry, id: docRef.id } as MilkEntry;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const deleteMilkEntry = async (id: string) => {
    if (!user) return;
    const path = `entries/${id}`;
    try {
      await deleteDoc(doc(db, 'entries', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const addPayment = async (payment: Omit<PaymentRecord, 'id'>) => {
    if (!user) return;
    const path = 'payments';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...payment,
        userId: user.uid
      });
      return { ...payment, id: docRef.id } as PaymentRecord;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const deletePayment = async (id: string) => {
    if (!user) return;
    const path = `payments/${id}`;
    try {
      await deleteDoc(doc(db, 'payments', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const addNotification = async (notif: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => {
    if (!user) return;
    const path = 'notifications';
    try {
      await addDoc(collection(db, path), {
        ...notif,
        isRead: false,
        createdAt: Date.now(),
        userId: user.uid
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    if (!user) return;
    const path = `notifications/${id}`;
    try {
      await updateDoc(doc(db, 'notifications', id), { isRead: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  // Auto-Cut Logic: Listen for incoming payment alerts and record them automatically
  useEffect(() => {
    if (!user || loading) return;
    
    const unreadAlerts = notifications.filter(n => !n.isRead && n.type === 'PAYMENT_ALERT' && n.customerId && n.amount);
    
    if (unreadAlerts.length > 0) {
      unreadAlerts.forEach(async (notif) => {
        console.log('Processing auto-cut for notification:', notif.id);
        
        // 1. Add the payment automatically
        await addPayment({
          customerId: notif.customerId!,
          amount: notif.amount!,
          date: new Date().toISOString(),
          method: PaymentMethod.GPAY,
          note: `Auto-cut: ${notif.title}`
        });

        // 2. Mark alert as read so it doesn't process again
        await markNotificationAsRead(notif.id);
      });
    }
  }, [notifications, user, loading]);

  return {
    customers,
    entries,
    payments,
    notifications,
    settings,
    loading,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addMilkEntry,
    deleteMilkEntry,
    addPayment,
    deletePayment,
    updateSettings,
    addNotification,
    markNotificationAsRead
  };
}
