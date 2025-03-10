import React, { useState, useEffect } from 'react';
import { getExpenses, saveExpenses, getIncome, saveIncome } from '../utils/storage';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

function ExpenseTracker() {
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ amount: '', category: '', date: '' });
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [additionalIncomes, setAdditionalIncomes] = useState([]);
  const [newAdditionalIncome, setNewAdditionalIncome] = useState({ amount: '', description: '', date: '' });
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isIncomeExpanded, setIsIncomeExpanded] = useState(false);

  const categories = [
    'Fuel', 
    'Transport', 
    'Health', 
    'Food', 
    'Shopping', 
    'Entertainment', 
    'Bills', 
    'Education',
    'Housing',
    'Travel',
    'Other'
  ];

  useEffect(() => {
    const savedExpenses = getExpenses();
    setExpenses(savedExpenses);
    
    const savedIncome = getIncome() || { monthly: 0, additional: [] };
    setMonthlyIncome(savedIncome.monthly || 0);
    setAdditionalIncomes(savedIncome.additional || []);
  }, []);

  const saveIncomeData = (monthly, additional) => {
    const incomeData = {
      monthly: monthly,
      additional: additional
    };
    saveIncome(incomeData);
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    const expense = { 
      id: Date.now().toString(), 
      ...newExpense, 
      amount: parseFloat(newExpense.amount) 
    };
    const updatedExpenses = [...expenses, expense];
    setExpenses(updatedExpenses);
    saveExpenses(updatedExpenses);
    setNewExpense({ amount: '', category: '', date: '' });
  };

  const handleDeleteExpense = (expenseId) => {
    const updatedExpenses = expenses.filter(exp => exp.id !== expenseId);
    setExpenses(updatedExpenses);
    saveExpenses(updatedExpenses);
  };

  const handleAddAdditionalIncome = (e) => {
    e.preventDefault();
    const income = { 
      id: Date.now().toString(), 
      amount: parseFloat(newAdditionalIncome.amount),
      description: newAdditionalIncome.description,
      date: newAdditionalIncome.date
    };
    const updatedAdditionalIncomes = [...additionalIncomes, income];
    setAdditionalIncomes(updatedAdditionalIncomes);
    saveIncomeData(monthlyIncome, updatedAdditionalIncomes);
    setNewAdditionalIncome({ amount: '', description: '', date: '' });
  };

  const handleDeleteAdditionalIncome = (incomeId) => {
    const updatedAdditionalIncomes = additionalIncomes.filter(inc => inc.id !== incomeId);
    setAdditionalIncomes(updatedAdditionalIncomes);
    saveIncomeData(monthlyIncome, updatedAdditionalIncomes);
  };

  const handleMonthlyIncomeChange = (value) => {
    const newMonthlyIncome = parseFloat(value) || 0;
    setMonthlyIncome(newMonthlyIncome);
    saveIncomeData(newMonthlyIncome, additionalIncomes);
  };

  // Filter expenses by selected month
  const filteredExpenses = expenses.filter(exp => exp.date.startsWith(selectedMonth));
  
  // Calculate totals for the selected month
  const totalSpent = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  // Calculate additional income for the selected month
  const additionalIncomeForMonth = additionalIncomes
    .filter(inc => inc.date.startsWith(selectedMonth))
    .reduce((sum, inc) => sum + inc.amount, 0);
  
  const totalIncome = monthlyIncome + additionalIncomeForMonth;
  const percentSpent = totalIncome ? (totalSpent / totalIncome) * 100 : 0;

  // Prepare data for pie chart
  const categoryTotals = filteredExpenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const pieData = {
    labels: Object.keys(categoryTotals),
    datasets: [{
      data: Object.values(categoryTotals),
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
        '#9966FF', '#FF9F40', '#C9CBCF', '#FF6384',
        '#36A2EB', '#FFCE56', '#4BC0C0'
      ],
      borderWidth: 1,
    }],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      }
    }
  };

  return (
    <div>
      <h2>Daily Expenses</h2>
      
      <div className="income-section">
        <div 
          className="income-header"
          onClick={() => setIsIncomeExpanded(!isIncomeExpanded)}
          style={{ cursor: 'pointer' }}
        >
          <h3>Monthly Income</h3>
          <div className="income-input">
            <input 
              id="monthly-income"
              type="number" 
              placeholder="Enter your monthly income (₹)"
              value={monthlyIncome} 
              onChange={(e) => handleMonthlyIncomeChange(e.target.value)} 
              onClick={(e) => e.stopPropagation()} // Prevent toggling when typing
            />
            <span className="expand-indicator">{isIncomeExpanded ? '▲' : '▼'}</span>
          </div>
        </div>
        
        {isIncomeExpanded && (
          <div className="income-details">
            <h3>Additional Income</h3>
            <form onSubmit={handleAddAdditionalIncome} className="additional-income-form">
              <input 
                type="number" 
                placeholder="Amount (₹)" 
                value={newAdditionalIncome.amount} 
                onChange={(e) => setNewAdditionalIncome({...newAdditionalIncome, amount: e.target.value})} 
                required 
              />
              <input 
                type="text" 
                placeholder="Description" 
                value={newAdditionalIncome.description} 
                onChange={(e) => setNewAdditionalIncome({...newAdditionalIncome, description: e.target.value})} 
                required 
              />
              <input 
                type="date" 
                value={newAdditionalIncome.date} 
                onChange={(e) => setNewAdditionalIncome({...newAdditionalIncome, date: e.target.value})} 
                required 
              />
              <button type="submit">Add Income</button>
            </form>
            
            {additionalIncomes.length > 0 && (
              <div className="additional-incomes-list">
                <h4>Additional Income History</h4>
                <ul>
                  {additionalIncomes.map(income => (
                    <li key={income.id}>
                      {income.date} - ₹{income.amount.toFixed(2)} ({income.description})
                      <button 
                        className="delete-btn" 
                        onClick={() => handleDeleteAdditionalIncome(income.id)}
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="expense-section">
        <h3>Add New Expense</h3>
        <form onSubmit={handleAddExpense}>
          <input 
            type="number" 
            placeholder="Amount (₹)" 
            value={newExpense.amount} 
            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} 
            required 
          />
          <select
            value={newExpense.category}
            onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
            required
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input 
            type="date" 
            value={newExpense.date} 
            onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })} 
            required 
          />
          <button type="submit">Add Expense</button>
        </form>
      </div>
      
      <div className="monthly-data-section">
        <h3>Monthly Overview</h3>
        <div className="month-selector">
          <label htmlFor="month-selector">Select Month:</label>
          <input
            id="month-selector"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>
        
        <div className="monthly-summary">
          <p>Total Income: ₹{totalIncome.toFixed(2)}</p>
          <p>Total Spent: ₹{totalSpent.toFixed(2)}</p>
          <p>Percentage of Income: {percentSpent.toFixed(2)}%</p>
        </div>
        
        {filteredExpenses.length > 0 ? (
          <div className="chart-container">
            <h4>Expenses by Category</h4>
            <div style={{ height: '300px' }}>
              <Pie data={pieData} options={pieOptions} />
            </div>
          </div>
        ) : (
          <p>No expenses recorded for this month.</p>
        )}
        
        <div className="expenses-list">
          <h4>Expenses for {selectedMonth}</h4>
          {filteredExpenses.length === 0 ? (
            <p>No expenses recorded for this month.</p>
          ) : (
            <ul>
              {filteredExpenses.map(exp => (
                <li key={exp.id}>
                  {exp.date} - ₹{exp.amount.toFixed(2)} ({exp.category})
                  <button 
                    className="delete-btn" 
                    onClick={() => handleDeleteExpense(exp.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExpenseTracker;