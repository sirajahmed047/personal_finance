import React, { useState, useEffect } from 'react';
import { getDebts, saveDebts } from '../utils/storage';
import { calculateEMI, calculateRemainingBalance } from '../utils/debtCalculations';

function DebtTracker() {
  const [debts, setDebts] = useState([]);
  const [newDebt, setNewDebt] = useState({
    name: '', principal: '', interestRate: '', duration: '', startDate: '', extraPayments: false
  });
  const [newPayment, setNewPayment] = useState({});
  const [expandedDebtId, setExpandedDebtId] = useState(null);
  const [showPaymentsModal, setShowPaymentsModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);

  useEffect(() => {
    setDebts(getDebts());
  }, []);

  const addNotification = (message) => {
    // Get existing notifications from localStorage
    const savedNotifications = localStorage.getItem('notifications');
    let notifications = savedNotifications ? JSON.parse(savedNotifications) : [];
    
    // Add new notification
    const newNotification = { id: Date.now(), message, timestamp: new Date().toLocaleString() };
    notifications = [newNotification, ...notifications];
    
    // Save back to localStorage
    localStorage.setItem('notifications', JSON.stringify(notifications));
  };

  const getTotalDebtAmount = (debt) => {
    const emi = calculateEMI(debt.principal, debt.interestRate, debt.duration);
    return emi * debt.duration; // Total debt amount = EMI * number of months
  };

  const handleAddDebt = (e) => {
    e.preventDefault();
    const debt = {
      id: Date.now().toString(),
      ...newDebt,
      principal: parseFloat(newDebt.principal),
      interestRate: parseFloat(newDebt.interestRate),
      duration: parseInt(newDebt.duration),
      payments: [],
      extraPayments: newDebt.extraPayments || false
    };

    // Generate past EMIs for backdated loans
    const startDate = new Date(debt.startDate);
    const currentDate = new Date();
    if (startDate < currentDate) {
      const emi = calculateEMI(debt.principal, debt.interestRate, debt.duration);
      let current = new Date(startDate);
      while (current < currentDate) {
        debt.payments.push({
          amount: emi,
          date: current.toISOString().split('T')[0],
        });
        current.setMonth(current.getMonth() + 1);
      }
    }

    const updatedDebts = [...debts, debt];
    setDebts(updatedDebts);
    saveDebts(updatedDebts);
    setNewDebt({ name: '', principal: '', interestRate: '', duration: '', startDate: '', extraPayments: false });
    addNotification(`New debt "${debt.name}" added with principal ₹${debt.principal}`);
  };

  const handleDeleteDebt = (debtId) => {
    const debtToDelete = debts.find(d => d.id === debtId);
    const updatedDebts = debts.filter(debt => debt.id !== debtId);
    setDebts(updatedDebts);
    saveDebts(updatedDebts);
    setExpandedDebtId(null);
    addNotification(`Debt "${debtToDelete.name}" has been deleted`);
  };

  const handleAddPayment = (e, debtId) => {
    e.preventDefault();
    const debt = debts.find(d => d.id === debtId);
    const payment = {
      amount: parseFloat(newPayment[debtId].amount),
      date: newPayment[debtId].date,
    };

    const emi = calculateEMI(debt.principal, debt.interestRate, debt.duration);

    // Calculate total debt amount and remaining debt
    const totalDebtAmount = getTotalDebtAmount(debt);
    const totalPaid = debt.payments.reduce((sum, p) => sum + p.amount, 0);
    const remainingDebt = totalDebtAmount - totalPaid;

    // Validate payment based on extraPayments setting
    if (debt.extraPayments) {
      if (payment.amount > remainingDebt) {
        alert(`Payment amount (₹${payment.amount}) cannot exceed remaining debt amount (₹${remainingDebt.toFixed(2)}).`);
        return;
      }
    } else {
      if (payment.amount !== emi) {
        alert('Payment amount must equal EMI when extra payments are not allowed.');
        return;
      }
      const monthYear = new Date(payment.date).toISOString().slice(0, 7);
      const paymentsThisMonth = debt.payments.filter(p =>
        new Date(p.date).toISOString().slice(0, 7) === monthYear
      );
      if (paymentsThisMonth.length >= 1) {
        alert('Only one EMI payment allowed per month when extra payments are not allowed.');
        return;
      }
    }

    const updatedDebts = debts.map(d =>
      d.id === debtId
        ? { ...d, payments: [...d.payments, payment] }
        : d
    );
    setDebts(updatedDebts);
    saveDebts(updatedDebts);
    setNewPayment({ ...newPayment, [debtId]: { amount: '', date: '' } });

    // Add to notifications
    addNotification(`Payment of ₹${payment.amount} added to ${debt.name}`);

    // Show browser notification
    if (Notification.permission === 'granted') {
      new Notification(`Payment of ₹${payment.amount} added to ${debt.name}`);
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(`Payment of ₹${payment.amount} added to ${debt.name}`);
        }
      });
    }
  };

  const handleShowPayments = (debt) => {
    setSelectedDebt(debt);
    setShowPaymentsModal(true);
  };

  // Request notification permission on component mount
  useEffect(() => {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div>
      <h2>Debt Tracker</h2>
      <form onSubmit={handleAddDebt}>
        <input type="text" placeholder="Debt Name" value={newDebt.name} onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })} required />
        <input type="number" placeholder="Principal (₹)" value={newDebt.principal} onChange={(e) => setNewDebt({ ...newDebt, principal: e.target.value })} required />
        <input type="number" placeholder="Interest Rate (%)" value={newDebt.interestRate} onChange={(e) => setNewDebt({ ...newDebt, interestRate: e.target.value })} required />
        <input type="number" placeholder="Duration (months)" value={newDebt.duration} onChange={(e) => setNewDebt({ ...newDebt, duration: e.target.value })} required />
        <input type="date" value={newDebt.startDate} onChange={(e) => setNewDebt({ ...newDebt, startDate: e.target.value })} required />
        <label>
          <input type="checkbox" checked={newDebt.extraPayments} onChange={(e) => setNewDebt({ ...newDebt, extraPayments: e.target.checked })} />
          Allow Extra Payments
        </label>
        <button type="submit">Add Debt</button>
      </form>

      <div className="debts-list">
        {debts.map(debt => {
          const emi = calculateEMI(debt.principal, debt.interestRate, debt.duration);
          const remaining = calculateRemainingBalance(debt, new Date());
          const totalPaid = debt.payments.reduce((sum, p) => sum + p.amount, 0);
          
          // Calculate total amount including interest
          const totalInterest = debt.interestRate === 0 
            ? 0 
            : (emi * debt.duration) - debt.principal;
          const totalAmount = debt.principal + totalInterest;
          
          const progress = Math.min((totalPaid / totalAmount) * 100, 100);
          const remainingEMIs = debt.duration - debt.payments.filter(p => p.amount === emi).length;
          const isExpanded = expandedDebtId === debt.id;
          
          return (
            <div 
              key={debt.id} 
              className={`debt-card ${isExpanded ? 'expanded' : ''}`}
              onClick={() => setExpandedDebtId(isExpanded ? null : debt.id)}
            >
              <div className="debt-card-header">
                <h3>{debt.name}</h3>
                <p>Loan Amount: ₹{debt.principal.toFixed(2)}</p>
                <div className="progress-container">
                  <progress value={progress} max="100"></progress>
                  <span>{progress.toFixed(1)}% paid</span>
                </div>
              </div>
              
              {isExpanded && (
                <div className="debt-card-details" onClick={(e) => e.stopPropagation()}>
                  <p>EMI: ₹{emi.toFixed(2)}</p>
                  <p>Interest Rate: {debt.interestRate}%</p>
                  <p>Total Amount (Principal + Interest): ₹{totalAmount.toFixed(2)}</p>
                  <p>Remaining EMIs: {remainingEMIs > 0 ? remainingEMIs : 0}</p>
                  <p>Remaining Balance: ₹{remaining.toFixed(2)}</p>
                  
                  <div className="debt-actions">
                    <button 
                      className="view-payments-btn"
                      onClick={() => handleShowPayments(debt)}
                    >
                      View Payments History
                    </button>
                    <button 
                      className="delete-debt-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Are you sure you want to delete "${debt.name}"?`)) {
                          handleDeleteDebt(debt.id);
                        }
                      }}
                    >
                      Delete Debt
                    </button>
                  </div>
                  
                  <form onSubmit={(e) => handleAddPayment(e, debt.id)} className="payment-form">
                    <input
                      type="number"
                      placeholder="Amount (₹)"
                      value={newPayment[debt.id]?.amount || ''}
                      onChange={(e) =>
                        setNewPayment({
                          ...newPayment,
                          [debt.id]: { ...newPayment[debt.id], amount: e.target.value },
                        })
                      }
                      required
                    />
                    <input
                      type="date"
                      value={newPayment[debt.id]?.date || ''}
                      onChange={(e) =>
                        setNewPayment({
                          ...newPayment,
                          [debt.id]: { ...newPayment[debt.id], date: e.target.value },
                        })
                      }
                      required
                    />
                    <button type="submit">Add Payment</button>
                  </form>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showPaymentsModal && selectedDebt && (
        <div className="modal-overlay" onClick={() => setShowPaymentsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Payments for {selectedDebt.name}</h3>
            {selectedDebt.payments.length === 0 ? (
              <p>No payments recorded yet.</p>
            ) : (
              <ul className="payments-list modal-payments-list">
                {selectedDebt.payments.map((payment, index) => (
                  <li key={index}>
                    {payment.date}: ₹{payment.amount.toFixed(2)}
                  </li>
                ))}
              </ul>
            )}
            <button onClick={() => setShowPaymentsModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DebtTracker;