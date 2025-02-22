# Personal Finance Dashboard

A modern, single-page web application for tracking personal finances, designed specifically for Indian users. This Progressive Web App (PWA) helps you manage your debts, expenses, income, and investments all in one place.

## Features

### 1. Debt Tracker
- Track multiple loans/debts with EMI (Equated Monthly Installment) calculations
- Individual progress bars for each debt
- Support for extra payments beyond EMI
- Missed payment notifications
- Payment history tracking
- Start date support for backdated loans
- Decimal year support (e.g., 1.5 years)

### 2. Expense Tracker
- Daily expense logging with categories
- Monthly expense summaries
- Last 5 transactions display
- Date-wise expense tracking

### 3. Income Tracker
- Fixed monthly salary management
- Additional income tracking (bonuses, returns, etc.)
- Monthly income summaries
- Last 5 income entries display

### 4. Investment Tracker
- Multiple investment category support:
  - Stocks
  - Property
  - Savings
  - Other assets
- Current value updates
- Investment appreciation/depreciation tracking
- Total investment value calculation

### 5. Net Worth Calculator
- Dynamic net worth calculation
- Real-time updates based on:
  - Total investments
  - Current debt obligations

## Technical Features

- Progressive Web App (PWA) capabilities
- Offline functionality
- Mobile-responsive design
- Local storage for data persistence
- Real-time calculations and updates
- Modern notification system

## Setup Instructions

1. Clone the repository:
\`\`\`bash
git clone [repository-url]
cd finance-dashboard
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Start the development server:
\`\`\`bash
npm start
\`\`\`

## Usage Guide

### Adding a New Debt
1. Click the "Add Debt" button
2. Fill in the required details:
   - Debt name
   - Principal amount
   - Interest rate
   - Loan duration
   - Start date
3. Enable/disable extra payments option
4. Submit to add the debt

### Recording Expenses
1. Navigate to the Expense section
2. Enter expense details:
   - Amount
   - Category
   - Date
3. Click "Add Expense"

### Managing Income
1. Set your fixed monthly salary
2. Add additional incomes as they occur
3. View monthly summaries

### Tracking Investments
1. Add new investments with:
   - Name
   - Category
   - Current value
2. Update values as needed
3. Monitor total investment growth

## Data Storage

All data is stored locally in your browser using localStorage. This ensures:
- Privacy: Your financial data stays on your device
- Offline access: Use the app without internet
- No server requirements: Pure client-side application

## Security Notes

- All data is stored locally on your device
- No data is transmitted to external servers
- Regular backups are recommended
- Clear browser data with caution as it will reset all stored information

## Browser Support

- Chrome (recommended for best PWA experience)
- Firefox
- Safari
- Edge

## Contributing

Feel free to submit issues and enhancement requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with vanilla JavaScript
- Uses modern web APIs
- Designed for Indian users (₹ currency)
- Mobile-first approach 