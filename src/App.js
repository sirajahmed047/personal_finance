import React, { useState } from 'react';
import DebtTracker from './components/DebtTracker';
import ExpenseTracker from './components/ExpenseTracker';
import Header from './components/Header';
import Footer from './components/Footer';
import { exportData, importData } from './utils/storage';
import './styles/main.css';

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [importStatus, setImportStatus] = useState(null);

  const handleExport = () => {
    const { json, csv } = exportData();
    
    // Create and download JSON file
    const jsonBlob = new Blob([json], { type: 'application/json' });
    const jsonLink = document.createElement('a');
    jsonLink.href = URL.createObjectURL(jsonBlob);
    jsonLink.download = 'finance_data.json';
    jsonLink.click();
    
    // Create and download CSV file
    const csvBlob = new Blob([csv], { type: 'text/csv' });
    const csvLink = document.createElement('a');
    csvLink.href = URL.createObjectURL(csvBlob);
    csvLink.download = 'finance_data.csv';
    csvLink.click();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const success = importData(event.target.result);
      setImportStatus(success ? 'Import successful!' : 'Import failed. Please check the file format.');
      
      // Clear status message after 3 seconds
      setTimeout(() => setImportStatus(null), 3000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <div className="container mx-auto px-4 flex-1 flex flex-col">
        <Header currentTab={currentTab} setCurrentTab={setCurrentTab} />
        
        <main className="mt-4 flex-1">
          {currentTab === 'dashboard' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card">
                  <h3 className="text-lg font-semibold mb-2">Total Debt</h3>
                  <p className="text-2xl font-bold text-primary">₹0</p>
                </div>
                <div className="card">
                  <h3 className="text-lg font-semibold mb-2">Monthly Expenses</h3>
                  <p className="text-2xl font-bold text-primary">₹0</p>
                </div>
              </div>
            </div>
          )}
          {currentTab === 'debts' && <DebtTracker />}
          {currentTab === 'expenses' && <ExpenseTracker />}
        </main>
        
        <div className="flex justify-center mb-2 relative">
          <div className="data-management-icons flex space-x-2">
            <button 
              onClick={handleExport} 
              className="p-2 bg-primary text-white rounded-full shadow-md hover:bg-primary/90 transition-colors"
              title="Export Data"
            >
              📤
            </button>
            <label 
              className="p-2 bg-accent text-white rounded-full shadow-md hover:bg-accent/90 transition-colors cursor-pointer"
              title="Import Data"
            >
              📥
              <input 
                type="file" 
                accept=".json" 
                onChange={handleImport} 
                className="hidden"
              />
            </label>
            {importStatus && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded-md shadow-md text-sm">
                <p className={importStatus.includes('successful') ? 'text-green-600' : 'text-red-600'}>
                  {importStatus}
                </p>
              </div>
            )}
          </div>
        </div>
        
        <Footer />
      </div>
    </div>
  );
}

export default App;