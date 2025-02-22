// Import modules
import { DebtValidator, DebtCalculator } from '/src/js/modules/debt.js';
import { StorageService } from '/src/js/services/storage.js';
import { MobileUI } from '/src/js/utils/ui.js';
import { SyncService } from '/src/js/services/sync.js';
import { ModalManager } from './src/js/utils/modal.js';
import { NotificationManager } from './src/js/utils/notifications.js';

// Add to the top of script.js
let isOnline = navigator.onLine;
let pendingTransactions = [];

// Add network status detection
window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);

function updateNetworkStatus() {
    isOnline = navigator.onLine;
    const statusBar = document.getElementById('network-status');
    if (statusBar) {
        statusBar.textContent = isOnline ? 'Online' : 'Offline';
        statusBar.className = isOnline ? 'status-online' : 'status-offline';
    }
}

// Data storage
let debts = [];
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let salary = JSON.parse(localStorage.getItem('salary')) || 0;
let additionalIncomes = JSON.parse(localStorage.getItem('additionalIncomes')) || [];
let investments = JSON.parse(localStorage.getItem('investments')) || [];
let debtPayments = JSON.parse(localStorage.getItem('debtPayments')) || [];

// Load and validate debts from localStorage
try {
    const storedDebts = JSON.parse(localStorage.getItem('debts')) || [];
    debts = storedDebts.filter(debt => 
        debt && 
        typeof debt.id === 'number' && 
        typeof debt.name === 'string' && 
        typeof debt.principal === 'number' && 
        typeof debt.interestRate === 'number' && 
        typeof debt.emi === 'number' && 
        typeof debt.months === 'number' && 
        typeof debt.startDate === 'string' && 
        typeof debt.extraAllowed === 'boolean'
    );
    if (storedDebts.length !== debts.length) {
        console.warn('Some debts were invalid and filtered out:', storedDebts);
        saveData(); // Update localStorage with valid debts
    }
} catch (e) {
    console.error('Error loading debts from localStorage:', e);
    debts = [];
    localStorage.removeItem('debts'); // Clear corrupted data
}

// Save data to local storage
function saveData() {
    if (!isOnline) {
        pendingTransactions.push({
            timestamp: Date.now(),
            data: {
                debts,
                expenses,
                salary,
                additionalIncomes,
                investments,
                debtPayments
            }
        });
        localStorage.setItem('pendingTransactions', JSON.stringify(pendingTransactions));
    }
    
    localStorage.setItem('debts', JSON.stringify(debts));
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('salary', JSON.stringify(salary));
    localStorage.setItem('additionalIncomes', JSON.stringify(additionalIncomes));
    localStorage.setItem('investments', JSON.stringify(investments));
    localStorage.setItem('debtPayments', JSON.stringify(debtPayments));
}

// Add this after imports
console.log('ModalManager:', ModalManager);

// Initialize everything after DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Starting application initialization...');
        
        // Initialize MobileUI
        try {
            await MobileUI.init();
            console.log('MobileUI initialized successfully');
        } catch (error) {
            console.error('MobileUI initialization failed:', error);
            throw error;
        }
        
        // Initialize ModalManager
        try {
            if (typeof ModalManager.init !== 'function') {
                throw new Error('ModalManager.init is not a function. ModalManager:', ModalManager);
            }
            ModalManager.init();
            console.log('ModalManager initialized successfully');
        } catch (error) {
            console.error('ModalManager initialization failed:', error);
            throw error;
        }
        
        // Initialize NotificationManager
        NotificationManager.init();
        
        // Check for notifications
        NotificationManager.checkForDueEMIs(debts, debtPayments);
        
        // Initial render
        try {
            updateDebtSummary();
            updateExpenses();
            updateIncome();
            updateInvestments();
            console.log('Initial render completed');
        } catch (error) {
            console.error('Initial render failed:', error);
            throw error;
        }
        
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Error initializing application:', error);
        const errorNotification = document.createElement('div');
        errorNotification.className = 'sync-notification warning';
        errorNotification.textContent = `Error loading application: ${error.message}. Please refresh the page.`;
        document.body.appendChild(errorNotification);
    }
});

// Debt Tracker
document.getElementById('add-debt-form').addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('Submit button clicked');

    let name = document.getElementById('debt-name').value.trim();
    let principal = parseFloat(document.getElementById('debt-principal').value);
    let interestRate = parseFloat(document.getElementById('debt-interest-rate').value);
    let emi = parseFloat(document.getElementById('debt-emi').value);
    let months = parseInt(document.getElementById('debt-months').value);
    let startDate = document.getElementById('debt-start-date').value;
    let extraAllowed = document.getElementById('debt-extra-allowed').checked;

    if (!name) return alert('Debt Name is required.');
    if (isNaN(principal) || principal <= 0) return alert('Principal Amount must be a positive number.');
    if (isNaN(interestRate) || interestRate < 0) return alert('Interest Rate must be a non-negative number.');
    if (isNaN(emi) || emi <= 0) return alert('Monthly EMI must be a positive number.');
    if (isNaN(months) || months <= 0) return alert('Loan Duration must be a positive number.');
    if (!startDate) return alert('Start Date is required.');

    let id = Date.now();
    const newDebt = { id, name, principal, interestRate, emi, months, startDate, extraAllowed };
    
    // Add historical payments if start date is in the past
    const startDateObj = new Date(startDate);
    const today = new Date();
    if (startDateObj < today) {
        const monthsDiff = DebtValidator.getMonthsDifference(startDateObj, today);
        
        for (let i = 0; i < monthsDiff; i++) {
            const paymentDate = new Date(startDateObj);
            paymentDate.setMonth(startDateObj.getMonth() + i);
            
            debtPayments.push({
                debtId: id,
                date: paymentDate.toISOString().split('T')[0],
                amount: emi,
                isHistorical: true
            });
        }
    }

    debts.push(newDebt);
    updateDebtSummary();
    saveData();
    ModalManager.closeModal('add-debt-modal');
    document.getElementById('add-debt-form').reset();
});

function calculateCurrentDebt(debt) {
    const breakdown = DebtCalculator.calculatePaymentBreakdown(debt, debtPayments);
    return debt.principal - breakdown.principalPaid;
}

function hasMissedPayment(debt) {
    let lastPayment = debtPayments
        .filter(p => p.debtId === debt.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    let startDate = new Date(debt.startDate);
    let today = new Date();
    let oneMonthAgo = new Date(today.setMonth(today.getMonth() - 1));

    if (!lastPayment && startDate < oneMonthAgo) return true;
    if (lastPayment && new Date(lastPayment.date) < oneMonthAgo) return true;
    return false;
}

function updateDebtSummary() {
    let totalCurrentDebt = debts.reduce((sum, debt) => {
        return sum + DebtCalculator.calculateTotalDebt(debt, debtPayments);
    }, 0);
    
    const totalDebtElement = document.getElementById('total-current-debt');
    if (totalDebtElement) totalDebtElement.textContent = totalCurrentDebt.toFixed(2);
    renderDebtList();
    updateNetWorth();
    
    // Check for new notifications
    NotificationManager.checkForDueEMIs(debts, debtPayments);
}

function renderDebtList() {
    const debtList = document.getElementById('debt-list');
    debtList.innerHTML = '';
    
    const currentDebtPayments = debtPayments || [];
    
    debts.forEach(debt => {
        const breakdown = DebtCalculator.calculatePaymentBreakdown(debt, currentDebtPayments);
        const missedPayment = DebtValidator.calculateMissedPayments(debt, currentDebtPayments);
        
        const debtElement = document.createElement('div');
        debtElement.className = 'item';
        debtElement.dataset.debtId = debt.id;

        debtElement.innerHTML = `
            <div class="debt-info">
                <span class="debt-name">${debt.name}</span>
                <div class="debt-details">
                    <span>Principal Paid: ₹${breakdown.principalPaid.toFixed(2)}</span>
                    <span>Interest Paid: ₹${breakdown.interestPaid.toFixed(2)}</span>
                </div>
            </div>
            
            <div class="progress-container">
                <div class="progress-principal" style="width: ${breakdown.principalPercentage}%"></div>
                <div class="progress-interest" style="width: ${breakdown.interestPercentage}%; left: ${breakdown.principalPercentage}%"></div>
            </div>
            
            <span class="remaining-emis">${breakdown.remainingEMIs} EMIs remaining</span>
            
            <div class="form-row">
                <input type="number" id="payment-${debt.id}" placeholder="EMI Amount (₹)" step="0.01" min="0">
                <button onclick="deleteDebt(${debt.id})" class="danger">Delete</button>
            </div>
            
            ${missedPayment ? '<div class="missed-payment">⚠️ Payment overdue</div>' : ''}
        `;
        
        debtList.appendChild(debtElement);
    });
}

// Make necessary functions global
window.updateDebtHistory = function() {
    const historyList = document.getElementById('debt-payment-history');
    if (!historyList) {
        console.error('Debt payment history element not found');
        return;
    }
    historyList.innerHTML = '';
    debtPayments.forEach(payment => {
        let debt = debts.find(d => d.id === payment.debtId);
        if (debt) {
            historyList.innerHTML += `
                <div>${payment.date} - ${debt.name}: ₹${payment.amount.toFixed(2)}</div>
            `;
        }
    });
};

window.deleteDebt = function(id) {
    const debt = debts.find(d => d.id === id);
    if (!debt) return;

    const confirmDelete = confirm(`Are you sure you want to delete "${debt.name}"? This will remove all payment history and cannot be undone.`);
    
    if (confirmDelete) {
        debts = debts.filter(debt => debt.id !== id);
        debtPayments = debtPayments.filter(payment => payment.debtId !== id);
        updateDebtSummary();
        saveData();
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'sync-notification success';
        notification.textContent = `${debt.name} has been deleted successfully`;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
};

// Expense Tracker
document.getElementById('expense-form').addEventListener('submit', (e) => {
    e.preventDefault();
    let date = document.getElementById('expense-date').value;
    let category = document.getElementById('expense-category').value;
    let amount = parseFloat(document.getElementById('expense-amount').value);
    if (date && category && amount > 0) {
        expenses.push({ date, category, amount });
        updateExpenses();
        saveData();
        e.target.reset();
    }
});

function updateExpenses() {
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let monthlyExpenses = expenses.filter(exp => {
        let expDate = new Date(exp.date);
        return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    });
    let totalExpenses = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    document.getElementById('total-expenses').textContent = totalExpenses.toFixed(2);

    let expenseList = document.getElementById('expense-list');
    expenseList.innerHTML = '';
    monthlyExpenses.slice(-5).forEach(exp => {
        expenseList.innerHTML += `
            <div class="item">${exp.date} - ${exp.category}: ₹${exp.amount.toFixed(2)}</div>
        `;
    });
}

// Income Tracker
document.getElementById('submit-salary').addEventListener('click', () => {
    let newSalary = parseFloat(document.getElementById('new-salary').value);
    if (newSalary >= 0) {
        salary = newSalary;
        updateIncome();
        saveData();
        ModalManager.closeModal('update-salary-modal');
    }
});

document.getElementById('additional-income-form').addEventListener('submit', (e) => {
    e.preventDefault();
    let date = document.getElementById('income-date').value;
    let description = document.getElementById('income-description').value;
    let amount = parseFloat(document.getElementById('income-amount').value);
    if (date && description && amount > 0) {
        additionalIncomes.push({ date, description, amount });
        updateIncome();
        saveData();
        e.target.reset();
    }
});

function updateIncome() {
    document.getElementById('monthly-salary').textContent = salary.toFixed(2);
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let monthlyIncomes = additionalIncomes.filter(inc => {
        let expDate = new Date(inc.date);
        return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    });
    let totalAdditional = monthlyIncomes.reduce((sum, inc) => sum + inc.amount, 0);
    let totalIncome = salary + totalAdditional;
    document.getElementById('total-income').textContent = totalIncome.toFixed(2);

    let incomeList = document.getElementById('additional-income-list');
    incomeList.innerHTML = '';
    monthlyIncomes.slice(-5).forEach(inc => {
        incomeList.innerHTML += `
            <div class="item">${inc.date} - ${inc.description}: ₹${inc.amount.toFixed(2)}</div>
        `;
    });
}

// Investment Tracker
document.getElementById('submit-investment').addEventListener('click', () => {
    let name = document.getElementById('investment-name').value;
    let category = document.getElementById('investment-category').value;
    let value = parseFloat(document.getElementById('investment-value').value);
    if (name && category && value >= 0) {
        let id = Date.now();
        investments.push({ id, name, category, value });
        updateInvestments();
        saveData();
        ModalManager.closeModal('add-investment-modal');
    }
});

function updateInvestments() {
    let totalInvestments = investments.reduce((sum, inv) => sum + inv.value, 0);
    document.getElementById('total-investments').textContent = totalInvestments.toFixed(2);

    let investmentList = document.getElementById('investment-list');
    investmentList.innerHTML = '';
    investments.forEach(inv => {
        investmentList.innerHTML += `
            <div class="item">
                <span>${inv.name} (${inv.category}): ₹${inv.value.toFixed(2)}</span>
                <button onclick="updateInvestment(${inv.id})">Update Value</button>
            </div>
        `;
    });
    updateNetWorth();
}

function updateInvestment(id) {
    let newValue = parseFloat(prompt("Enter new value (₹):"));
    if (newValue >= 0) {
        let investment = investments.find(inv => inv.id === id);
        investment.value = newValue;
        updateInvestments();
        saveData();
    }
}

// Net Worth
function updateNetWorth() {
    let totalCurrentDebt = debts.reduce((sum, debt) => sum + calculateCurrentDebt(debt), 0);
    let totalInvestments = investments.reduce((sum, inv) => sum + inv.value, 0);
    let netWorth = totalInvestments - totalCurrentDebt;
    document.getElementById('net-worth').textContent = netWorth.toFixed(2);
}

// Add this function to show loading states on buttons
function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.textContent = 'Processing...';
    } else {
        button.disabled = false;
        button.textContent = button.dataset.originalText;
    }
}

// Add this at the end of your script.js
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('ServiceWorker registration successful');
            })
            .catch((err) => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// Pull-to-refresh implementation
let touchStart = 0;
let pullStarted = false;

document.addEventListener('touchstart', (e) => {
    if (window.scrollY === 0) {
        touchStart = e.touches[0].clientY;
        pullStarted = true;
    }
});

document.addEventListener('touchmove', (e) => {
    if (!pullStarted) return;
    
    const pullDistance = e.touches[0].clientY - touchStart;
    if (pullDistance > 100) {
        showRefreshIndicator();
    }
});

document.addEventListener('touchend', () => {
    if (pullStarted && window.scrollY === 0) {
        hideRefreshIndicator();
        refreshData();
    }
    pullStarted = false;
});

// Share functionality
function shareNetWorth() {
    if (navigator.share) {
        const netWorth = document.getElementById('net-worth').textContent;
        navigator.share({
            title: 'My Financial Summary',
            text: `Net Worth: ₹${netWorth}\nTracked with Finance Dashboard`,
            url: window.location.href
        }).catch(console.error);
    }
}

// Add this after your other event listeners
document.getElementById('apply-payments').addEventListener('click', () => {
    console.log('Applying payments...');
    try {
        debts.forEach(debt => {
            const paymentInput = document.getElementById(`payment-${debt.id}`);
            if (!paymentInput) {
                console.warn(`Payment input not found for debt: ${debt.id}`);
                return;
            }

            const amount = parseFloat(paymentInput.value);
            if (!isNaN(amount) && amount > 0) {
                const hasMonthlyPayment = DebtValidator.hasPaymentForCurrentMonth(debt, debtPayments);
                
                // Strict EMI check when extra payments are not allowed
                if (!debt.extraAllowed && amount !== debt.emi) {
                    alert(`For ${debt.name}, only exact EMI amount of ₹${debt.emi} is allowed.`);
                    paymentInput.value = '';
                    return;
                }
                
                // Check for duplicate monthly payment
                if (hasMonthlyPayment) {
                    if (!debt.extraAllowed) {
                        alert(`Monthly payment for ${debt.name} has already been made. Extra payments are not allowed.`);
                        paymentInput.value = '';
                        return;
                    }
                    
                    if (!confirm(`A payment for ${debt.name} has already been made this month. Do you want to make an additional payment?`)) {
                        paymentInput.value = '';
                        return;
                    }
                }

                // Add the payment
                const payment = {
                    debtId: debt.id,
                    date: new Date().toISOString().split('T')[0],
                    amount: amount,
                    isExtra: hasMonthlyPayment
                };
                
                console.log('Adding payment:', payment);
                debtPayments.push(payment);
                paymentInput.value = '';
            }
        });

        // Update UI and save
        updateDebtSummary();
        saveData();
        
        const notification = document.createElement('div');
        notification.className = 'sync-notification success';
        notification.textContent = 'Payments applied successfully';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);

    } catch (error) {
        console.error('Error applying payments:', error);
        const notification = document.createElement('div');
        notification.className = 'sync-notification warning';
        notification.textContent = 'Error applying payments. Please try again.';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
});

// Add event listeners for EMI calculation
document.getElementById('debt-principal').addEventListener('input', calculateAndSetEMI);
document.getElementById('debt-interest-rate').addEventListener('input', calculateAndSetEMI);
document.getElementById('debt-months').addEventListener('input', calculateAndSetEMI);

function calculateAndSetEMI() {
    const principal = parseFloat(document.getElementById('debt-principal').value);
    const interestRate = parseFloat(document.getElementById('debt-interest-rate').value);
    const months = parseFloat(document.getElementById('debt-months').value);
    
    if (!isNaN(principal) && !isNaN(interestRate) && !isNaN(months) && principal > 0 && months > 0) {
        const emi = DebtCalculator.calculateEMI(principal, interestRate, months);
        document.getElementById('debt-emi').value = emi.toFixed(2);
    }
}