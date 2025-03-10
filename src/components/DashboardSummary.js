import React from 'react';

function DashboardSummary({ assets, liabilities, netWorth, history }) {
  const lastMonth = history.length > 1 ? history[history.length - 2] : null;
  const monthlyChange = lastMonth ? netWorth - lastMonth.value : 0;
  const monthlyChangePercent = lastMonth && lastMonth.value !== 0 ? (monthlyChange / lastMonth.value) * 100 : 0;
  const isPositiveChange = monthlyChange >= 0;

  return (
    <div className="card p-4">
      <h3 className="text-lg font-semibold mb-3">Summary</h3>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Assets:</span>
          <span className="font-medium">₹{assets.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Liabilities:</span>
          <span className="font-medium">₹{liabilities.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Net Worth:</span>
          <span className="font-bold text-primary">₹{netWorth.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between items-center mt-2 pt-2 border-t">
          <span className="text-gray-600">Monthly Change:</span>
          <span className={`font-medium ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}>
            {isPositiveChange ? '+' : ''}₹{monthlyChange.toLocaleString('en-IN')} (
            {monthlyChangePercent.toFixed(2)}%)
          </span>
        </div>
      </div>
    </div>
  );
}

export default DashboardSummary; 