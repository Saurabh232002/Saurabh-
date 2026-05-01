# Dugdh Darpan - Dairy Management App

Dugdh Darpan ek professional Dairy Management web application hai jo doodh ka hisab-kitab aur payments manage karne ke liye banaya gaya hai.

## 🚀 Features

- **Dashboard Analytics**: Aapki dairy ki report, milk collection graph, aur top customers ki jankari.
- **Customer Management**: Naye customers add karein, unka milk type aur rate set karein.
- **Daily Entries**: Subah (Morning) aur Shaam (Evening) ki milk entries asani se karein.
- **Billing & QR Payments**: Har mahine ka bill generate karein aur **UPI QR Code** ke zariye payment receive karein.
- **Auto-Cut Payment (New)**: Agar koi customer QR scan karke payment karta hai, toh app usey auto-detect karke total balance se cut kar deta hai aur aapko notification bhejta hai.
- **Cloud Sync**: Aapka data Firebase par surakshit (secure) rehta hai.

## 🛠️ Tech Stack

- **Frontend**: React.js with TypeScript
- **Styling**: Tailwind CSS (Modern UI)
- **Database**: Firebase Firestore (Real-time data)
- **Icons**: Lucide React
- **Charts**: Recharts

## 📱 Auto-Cut Feature Kaise Kaam Karta Hai?

1. **Billing** tab mein jayein aur kisi customer ka Bill select karein.
2. **Pay via QR** button par click karein.
3. Jab customer payment karta hai (Simulation button se), tab ek **Payment Alert** notification generate hota hai.
4. App automatically:
   - Payment record add kar deta hai.
   - Customer ka outstanding balance kam kar deta hai.
   - Aapko top bar (Bell icon) par notification dikhta hai.

## 📦 Installation & Setup

1. Dependencies install karein:
   ```bash
   npm install
   ```
2. App start karein:
   ```bash
   npm run dev
   ```

---
*Developed with ❤️ for Dairy Owners.*
