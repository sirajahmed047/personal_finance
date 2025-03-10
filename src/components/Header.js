import React from 'react';

const Header = ({ currentTab, setCurrentTab }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">
            Finance Dashboard
          </h1>
        </div>
        <nav className="flex flex-nowrap overflow-x-auto mt-4 border-t pt-4 pb-1 -mx-4 px-4">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`px-3 py-2 rounded-md font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
              currentTab === 'dashboard' 
                ? 'bg-primary text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentTab('debts')}
            className={`px-3 py-2 rounded-md font-medium transition-colors whitespace-nowrap flex-shrink-0 ml-2 ${
              currentTab === 'debts' 
                ? 'bg-primary text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Debts
          </button>
          <button
            onClick={() => setCurrentTab('expenses')}
            className={`px-3 py-2 rounded-md font-medium transition-colors whitespace-nowrap flex-shrink-0 ml-2 ${
              currentTab === 'expenses' 
                ? 'bg-primary text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Expenses
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
