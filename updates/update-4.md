

## Implementation Plan

### Phase 1 Goals
- **Net Worth Calculation:** Basic asset and liability tracking with manual entry.
- **Dashboard:** Summary view and simple visualizations (pie chart for asset allocation).
- **Integration:** Fetch liabilities from Debt Tracker.
- **Historical Tracking:** Last 6 months of net worth data.
- **Data Management:** Local storage with encryption, export/import (CSV/JSON), and automatic backups.
- **User Model:** Single-user with future multi-user support in mind.

### Complexity Warning
The implementation remains manageable for Phase 1, focusing on core functionality. However:
- **Encryption:** Adding encryption to `localStorage` adds slight complexity but is feasible with libraries like `crypto-js`.
- **Historical Tracking:** Storing 6 months of data requires a snapshot mechanism, which is simple now but could grow complex with more features.
- **Future Prep:** Designing for multi-user support and cloud backups adds overhead to the architecture; I’ll keep it modular to avoid overcomplicating Phase 1.

---

## Code Implementation

### File Structure Updates
```
personal-finance-dashboard/
├── public/
│   ├── index.html
│   ├── manifest.json
│   ├── icons/
│   └── service-worker.js
├── src/
│   ├── components/
│   │   ├── DebtTracker.js
│   │   ├── ExpenseTracker.js
│   │   ├── NetWorth.js
│   │   ├── DashboardSummary.js
│   │   └── AssetPieChart.js
│   ├── utils/
│   │   ├── storage.js       # Updated for encryption and backups
│   │   ├── debtCalculations.js
│   │   └── dataUtils.js     # CSV/JSON export/import
│   ├── App.js
│   ├── index.js
│   └── styles/
│       └── main.css
├── package.json
└── README.md
```

### Dependencies
Install additional libraries:
```bash
npm install chart.js react-chartjs-2 crypto-js
```

---

### Net Worth Component (`NetWorth.js`)
```jsx
import React, { useState, useEffect } from 'react';
import { getDebts, getAssets, saveAssets, saveNetWorthHistory } from '../utils/storage';
import { calculateEMI } from '../utils/debtCalculations';
import DashboardSummary from './DashboardSummary';
import AssetPieChart from './AssetPieChart';

function NetWorth() {
  const [assets, setAssets] = useState([]);
  const [newAsset, setNewAsset] = useState({ name: '', type: '', value: '' });
  const [totalLiabilities, setTotalLiabilities] = useState(0);
  const [history, setHistory] = useState([]);

  // Load initial data
  useEffect(() => {
    const storedAssets = getAssets();
    setAssets(storedAssets);

    const debts = getDebts();
    const total = debts.reduce((sum, debt) => {
      const emi = calculateEMI(debt.principal, debt.interestRate, debt.duration);
      const totalDebtAmount = emi * debt.duration;
      const totalPaid = debt.payments.reduce((paid, p) => paid + p.amount, 0);
      return sum + Math.max(totalDebtAmount - totalPaid, 0);
    }, 0);
    setTotalLiabilities(total);

    // Monthly snapshot for historical tracking
    const currentMonth = new Date().toISOString().slice(0, 7);
    const totalAssets = storedAssets.reduce((sum, a) => sum + parseFloat(a.value), 0);
    const netWorth = totalAssets - total;
    saveNetWorthHistory(currentMonth, netWorth);
    setHistory(getNetWorthHistory().slice(-6)); // Last 6 months
  }, []);

  const handleAddAsset = (e) => {
    e.preventDefault();
    const asset = { id: Date.now(), ...newAsset, value: parseFloat(newAsset.value) };
    const updatedAssets = [...assets, asset];
    setAssets(updatedAssets);
    saveAssets(updatedAssets);
    setNewAsset({ name: '', type: '', value: '' });

    // Update net worth history
    const currentMonth = new Date().toISOString().slice(0, 7);
    const totalAssets = updatedAssets.reduce((sum, a) => sum + a.value, 0);
    const netWorth = totalAssets - totalLiabilities;
    saveNetWorthHistory(currentMonth, netWorth);
    setHistory(getNetWorthHistory().slice(-6));
  };

  const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
  const netWorth = totalAssets - totalLiabilities;

  return (
    <div>
      <h2>Net Worth</h2>
      <DashboardSummary assets={totalAssets} liabilities={totalLiabilities} netWorth={netWorth} history={history} />
      <AssetPieChart assets={assets} />

      <h3>Add Asset</h3>
      <form onSubmit={handleAddAsset}>
        <input
          type="text"
          placeholder="Asset Name"
          value={newAsset.name}
          onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
          required
        />
        <select
          value={newAsset.type}
          onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
          required
        >
          <option value="">Select Type</option>
          <option value="Bank Account">Bank Account</option>
          <option value="Mutual Fund">Mutual Fund</option>
          <option value="Stocks">Stocks</option>
          <option value="Real Estate">Real Estate</option>
          <option value="Vehicle">Vehicle</option>
          <option value="Gold/Jewelry">Gold/Jewelry</option>
        </select>
        <input
          type="number"
          placeholder="Value (₹)"
          value={newAsset.value}
          onChange={(e) => setNewAsset({ ...newAsset, value: e.target.value })}
          required
        />
        <button type="submit">Add Asset</button>
      </form>

      <h3>Assets</h3>
      <ul>
        {assets.map(asset => (
          <li key={asset.id}>{asset.name} ({asset.type}): ₹{asset.value.toLocaleString('en-IN')}</li>
        ))}
      </ul>
    </div>
  );
}

export default NetWorth;
```

---

### Dashboard Summary Component (`DashboardSummary.js`)
```jsx
import React from 'react';

function DashboardSummary({ assets, liabilities, netWorth, history }) {
  const lastMonth = history.length > 1 ? history[history.length - 2] : null;
  const monthlyChange = lastMonth ? netWorth - lastMonth.value : 0;
  const monthlyChangePercent = lastMonth && lastMonth.value !== 0 ? (monthlyChange / lastMonth.value) * 100 : 0;

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
      <h3>Summary</h3>
      <p>Total Assets: ₹{assets.toLocaleString('en-IN')}</p>
      <p>Total Liabilities: ₹{liabilities.toLocaleString('en-IN')}</p>
      <p>Net Worth: ₹{netWorth.toLocaleString('en-IN')}</p>
      <p>
        Monthly Change: ₹{monthlyChange.toLocaleString('en-IN')} (
        {monthlyChangePercent.toFixed(2)}%)
      </p>
    </div>
  );
}

export default DashboardSummary;
```

---

### Asset Pie Chart Component (`AssetPieChart.js`)
```jsx
import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function AssetPieChart({ assets }) {
  const categories = assets.reduce((acc, asset) => {
    acc[asset.type] = (acc[asset.type] || 0) + asset.value;
    return acc;
  }, {});

  const data = {
    labels: Object.keys(categories),
    datasets: [
      {
        data: Object.values(categories),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
      },
    ],
  };

  return (
    <div style={{ maxWidth: '400px', marginBottom: '20px' }}>
      <h3>Asset Allocation</h3>
      <Pie data={data} />
    </div>
  );
}

export default AssetPieChart;
```

---

### Updated Storage Utilities (`storage.js`)
```jsx
import CryptoJS from 'crypto-js';

// Encryption key (in production, use environment variable or secure key management)
const ENCRYPTION_KEY = 'your-secret-key';

export const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
};

export const decryptData = (encrypted) => {
  const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

export const getDebts = () => {
  const data = localStorage.getItem('debts');
  return data ? decryptData(data) : [];
};

export const saveDebts = (debts) => {
  localStorage.setItem('debts', encryptData(debts));
};

export const getAssets = () => {
  const data = localStorage.getItem('assets');
  return data ? decryptData(data) : [];
};

export const saveAssets = (assets) => {
  localStorage.setItem('assets', encryptData(assets));
  // Automatic backup
  localStorage.setItem(`backup_assets_${new Date().toISOString()}`, encryptData(assets));
};

export const getNetWorthHistory = () => {
  const data = localStorage.getItem('netWorthHistory');
  return data ? decryptData(data) : [];
};

export const saveNetWorthHistory = (month, value) => {
  const history = getNetWorthHistory();
  if (!history.some(h => h.month === month)) {
    history.push({ month, value });
  }
  localStorage.setItem('netWorthHistory', encryptData(history));
};

// Export/Import Functions
export const exportData = () => {
  const data = {
    debts: getDebts(),
    assets: getAssets(),
    history: getNetWorthHistory(),
  };
  const json = JSON.stringify(data);
  const csv = convertToCSV(data); // Helper function below
  return { json, csv };
};

export const importData = (jsonData) => {
  const { debts, assets, history } = JSON.parse(jsonData);
  if (debts) saveDebts(debts);
  if (assets) saveAssets(assets);
  if (history) localStorage.setItem('netWorthHistory', encryptData(history));
};

// Simple CSV conversion (expand as needed)
const convertToCSV = (data) => {
  const headers = 'Type,Name,Value\n';
  const assetRows = data.assets.map(a => `Asset,${a.name},${a.value}`).join('\n');
  const debtRows = data.debts.map(d => `Debt,${d.name},${d.principal}`).join('\n');
  return headers + assetRows + '\n' + debtRows;
};
```

---

### App Integration (`App.js`)
Update to include export/import buttons:
```jsx
import { exportData, importData } from './utils/storage';

function App() {
  const handleExport = () => {
    const { json, csv } = exportData();
    const jsonBlob = new Blob([json], { type: 'application/json' });
    const csvBlob = new Blob([csv], { type: 'text/csv' });
    const jsonLink = document.createElement('a');
    const csvLink = document.createElement('a');
    jsonLink.href = URL.createObjectURL(jsonBlob);
    csvLink.href = URL.createObjectURL(csvBlob);
    jsonLink.download = 'finance_data.json';
    csvLink.download = 'finance_data.csv';
    jsonLink.click();
    csvLink.click();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => importData(event.target.result);
    reader.readAsText(file);
  };

  return (
    <div className="app">
      {/* Existing tabs */}
      <button onClick={handleExport}>Export Data</button>
      <input type="file" accept=".json" onChange={handleImport} />
    </div>
  );
}
```

------------------

## Updated README

```markdown
# Personal Finance Dashboard

A modern, simple Progressive Web App (PWA) for Indian users to track personal finances in Indian Rupees (₹). Currently in **Phase 1**, it includes Debt Tracker, Expense Tracker, and Net Worth tabs.

## Phase 1 Features

### Debt Tracker
- Add/delete debts with EMI, interest, and payment tracking.
- Payments validated (extra payments ≤ total debt amount).
- Modal for payment history, dashboard notifications.

### Expense Tracker
- Log expenses with category dropdown, delete option.
- Minimal monthly income input (expandable), additional incomes.
- Monthly view with pie chart for category spending.

### Net Worth
- **Assets:** Manual entry for bank accounts, mutual funds, stocks, real estate, vehicles, gold/jewelry.
- **Liabilities:** Synced from Debt Tracker (total debt = principal + interest - payments).
- **Dashboard:**
  - Summary: Total assets, liabilities, net worth, monthly change.
  - Pie chart for asset allocation.
  - Historical tracking (last 6 months).
- **Data Management:**
  - Encrypted local storage (`crypto-js`).
  - Auto-backups in `localStorage`.
  - Export/import (CSV/JSON).

## Installation
```bash
git clone <repository-url>
cd personal-finance-dashboard
npm install
npm install chart.js react-chartjs-2 crypto-js
npm start
```

## Technical Details
- **PWA:** Offline support, installable.
- **Storage:** Encrypted `localStorage`.
- **Currency:** ₹ with Indian formatting.
- **Future-Ready:** Modular for multi-user and cloud backups.

## Phase 2 Plans
- Multi-user support with authentication.
- Cloud backups (Google Drive, Dropbox).
- Enhanced visualizations, tax tracking, goals.

## Phase 3 Plans
- API integrations: SBI, HDFC, Zerodha, Groww, CAMS, ClearTax, RBI gold rates.

## Security
- Data encrypted locally.
- Backup/export for portability.
- Clear browser data resets all info.

## License
MIT License.
```

---

## Notes
- **Debt Tracker Integration:** Liabilities use `getDebts()` and calculate total debt dynamically.
- **Encryption:** Uses a static key (`ENCRYPTION_KEY`); in production, secure this via environment variables or user input.
- **Future Prep:** State management (e.g., Redux) could streamline multi-user support later.

