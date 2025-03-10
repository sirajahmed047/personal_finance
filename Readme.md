

# Personal Finance Dashboard

A modern, simple Progressive Web App (PWA) for tracking personal finances, designed specifically for Indian users. This application helps you manage debts, expenses, income, and net worth in one place. Currently in **Phase 1**, the project focuses on a barebones, functional application with core features, setting the stage for advanced functionalities in future phases.

## Current Status: Phase 1

Phase 1 delivers a minimal viable product (MVP) with three main tabs—Debt Tracker, Expense Tracker, and Net Worth—optimized for both mobile and desktop compatibility. The app is built as a PWA, ensuring offline functionality and installability.

### Features

#### 1. Debt Tracker
- **Debt Management**:
  - Add debts with details: name, principal amount, interest rate, duration (months), start date, and an "Allow Extra Payments" toggle.
  - Delete debts with a dedicated button.
  - Backdated loans auto-generate EMI payments from the start date to the current date.
- **Payment Management**:
  - Record payments with amount and date in an expandable payments section.
  - Validation:
    - If "Allow Extra Payments" is unchecked: Only one EMI payment per month, equal to the calculated EMI.
    - If checked: Payments can be any amount up to the remaining total debt (principal + interest).
  - Payments history accessible via a modal to save screen space.
- **Debt Details**:
  - Minimal view shows loan amount and progress bar; expands on click to show EMI, remaining balance, total debt (principal + interest), and remaining EMIs.
  - Total debt amount calculated as EMI * duration, accounting for interest.
  - Progress bar reflects percentage of total debt paid (principal + interest).
- **Notifications**:
  - Dashboard notifications (bell icon) display payment additions, replacing console logs.

#### 2. Expense Tracker
- **Expense Management**:
  - Log daily expenses with amount, category (dropdown), and date.
  - Delete expenses with a button next to each entry.
  - Categories: Fuel, Transport, Health, Food, Shopping, Entertainment, Bills, Other.
- **Income Management**:
  - Minimal view shows a single "Enter Monthly Income" input field; expands on click to reveal current income and additional incomes (if any).
  - Additional income feature allows logging one-time incomes with amount and date.
- **Data Visualization**:
  - View expenses by month using a date picker (e.g., "YYYY-MM").
  - Pie chart displays category-wise spending for the selected month.
  - Last 5 transactions shown for quick reference.
- **Calculations**:
  - Total spent and percentage of monthly income for the current month.

#### 3. Net Worth
- **Asset Management**:
  - Add assets with name and value, stored locally.
- **Liability Calculation**:
  - Total liabilities reflect the remaining total debt amount (principal + interest minus payments), not just principal.
- **Net Worth**:
  - Dynamic calculation: Total Assets - Total Liabilities.
  - Displayed with assets and liabilities breakdown.

### Technical Features
- **Progressive Web App (PWA)**:
  - Offline functionality via service workers.
  - Installable on mobile and desktop devices.
  - Responsive, mobile-first design.
- **Storage**: Local storage for debts, expenses, income, and assets persistence.
- **Real-Time Updates**: Calculations (EMI, net worth, progress) update instantly.
- **Notifications**: In-app dashboard notifications with a bell icon.
- **Currency**: Indian Rupees (₹) formatting throughout.
- **Dependencies**:
  - React for component-based UI.
  - Chart.js and react-chartjs-2 for pie charts in Expense Tracker.

## Installation and Setup

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd personal-finance-dashboard
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   npm install chart.js react-chartjs-2
   ```

3. **Run the App**:
   ```bash
   npm start
   ```
   Access at `http://localhost:3000`.

4. **Build for Production**:
   ```bash
   npm run build
   ```

5. **PWA Setup**:
   - Ensure `public/manifest.json` includes valid icons (`icons/icon-192x192.png`, `icons/icon-512x512.png`).
   - Service worker registration is enabled in `src/index.js`.

## Project Structure

```
personal-finance-dashboard/
├── public/
│   ├── index.html
│   ├── manifest.json
│   ├── icons/
│   │   ├── icon-192x192.png
│   │   └── icon-512x512.png
│   └── service-worker.js
├── src/
│   ├── components/
│   │   ├── DebtTracker.js
│   │   ├── ExpenseTracker.js
│   │   ├── NetWorth.js
│   │   ├── Header.js (optional)
│   │   └── Footer.js (optional)
│   ├── utils/
│   │   ├── storage.js
│   │   └── debtCalculations.js
│   ├── App.js
│   ├── index.js
│   └── styles/
│       └── main.css
├── package.json
└── README.md
```

## Usage Guide

### Debt Tracker
- **Add Debt**: Fill in details and submit. Backdated loans auto-populate EMIs.
- **Record Payment**: Expand a debt, enter payment details, and submit (validated based on extra payments setting).
- **View Payments**: Click "View Payments" to see history in a modal.
- **Delete Debt**: Click "Delete Debt" to remove it.

### Expense Tracker
- **Add Expense**: Enter amount, select category, pick date, and submit.
- **Manage Income**: Enter monthly income in the minimal field; expand to see details or add additional incomes.
- **View Data**: Select a month to see expenses and a pie chart.

### Net Worth
- **Add Assets**: Input name and value.
- **View Net Worth**: Automatically updates with total assets and liabilities (including interest).

## Planned Phases

### Phase 2
- **Android App**: Wrap PWA with Capacitor, integrate SMS reading for expense auto-updates.
- **Authentication**: Add OAuth (Google, X, email) with account login.
- **Net Worth Enhancements**: Income target projections, profile analysis, historical charts.
- **Expense Tracker Enhancements**: Budget setting, detailed category analysis.

### Phase 3
- **API Integrations**: Connect to Upstox and Zerodha for investment data.
- **Backend**: Introduce a server for secure data storage and API handling.

## Security Notes
- All data is stored locally using `localStorage`.
- No external server communication in Phase 1.
- Recommend regular backups (manual export planned for Phase 2).
- Clearing browser data resets all information.

## Browser Support
- Chrome (best PWA experience)
- Firefox
- Safari
- Edge

## Contributing
- Submit issues or enhancement requests via GitHub.
- Future contributions can focus on Phase 2 and 3 features.

## License
Licensed under the MIT License - see the `LICENSE` file for details.

## Acknowledgments
- Built with React and modern web APIs.
- Tailored for Indian users with ₹ currency support.
- Mobile-first approach for accessibility.

---

### Notes for Future Development
- **Phase 2 Preparation**: The current structure supports easy extension (e.g., adding authentication or charts). Expand `storage.js` for backend integration later.
- **Phase 3 Considerations**: Plan API endpoints for Upstox/Zerodha now to ensure data models align (e.g., investment categories in Net Worth).
- **Code Quality**: Refactor repetitive code (e.g., modal logic) into reusable components as the app grows.
