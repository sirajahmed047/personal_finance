import CryptoJS from 'crypto-js';
import { convertToCSV } from './dataUtils';

// Encryption key (in production, use environment variable or secure key management)
const ENCRYPTION_KEY = 'your-secret-key';

export const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
};

export const decryptData = (encrypted) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    console.error("Error decrypting data:", error);
    return null;
  }
};

// Check if data is already encrypted
const isEncrypted = (data) => {
  try {
    // Try to parse as JSON - if it works, it's not encrypted
    JSON.parse(data);
    return false;
  } catch (e) {
    // If it fails to parse as JSON, it might be encrypted
    return true;
  }
};

export const getDebts = () => {
  const data = localStorage.getItem('debts');
  if (!data) return [];
  
  return isEncrypted(data) ? decryptData(data) : JSON.parse(data);
};

export const saveDebts = (debts) => {
  localStorage.setItem('debts', encryptData(debts));
};

export const getExpenses = () => {
  const data = localStorage.getItem('expenses');
  if (!data) return [];
  
  return isEncrypted(data) ? decryptData(data) : JSON.parse(data);
};

export const saveExpenses = (expenses) => {
  localStorage.setItem('expenses', encryptData(expenses));
};

export const getIncome = () => {
  const data = localStorage.getItem('income');
  if (!data) return null;
  
  return isEncrypted(data) ? decryptData(data) : JSON.parse(data);
};

export const saveIncome = (income) => {
  localStorage.setItem('income', encryptData(income));
};

export const getAssets = () => {
  const data = localStorage.getItem('assets');
  if (!data) return [];
  
  return isEncrypted(data) ? decryptData(data) : JSON.parse(data);
};

export const saveAssets = (assets) => {
  localStorage.setItem('assets', encryptData(assets));
  // Automatic backup
  localStorage.setItem(`backup_assets_${new Date().toISOString()}`, encryptData(assets));
};

export const getNetWorthHistory = () => {
  const data = localStorage.getItem('netWorthHistory');
  if (!data) return [];
  
  return isEncrypted(data) ? decryptData(data) : JSON.parse(data);
};

export const saveNetWorthHistory = (month, value) => {
  const history = getNetWorthHistory();
  // Only add if the month doesn't already exist
  if (!history.some(h => h.month === month)) {
    history.push({ month, value });
  } else {
    // Update the value for the existing month
    const index = history.findIndex(h => h.month === month);
    if (index !== -1) {
      history[index].value = value;
    }
  }
  localStorage.setItem('netWorthHistory', encryptData(history));
};

// Export/Import Functions
export const exportData = () => {
  const data = {
    debts: getDebts(),
    assets: getAssets(),
    expenses: getExpenses(),
    income: getIncome(),
    history: getNetWorthHistory(),
  };
  const json = JSON.stringify(data);
  const csv = convertToCSV(data);
  return { json, csv };
};

export const importData = (jsonData) => {
  try {
    const { debts, assets, expenses, income, history } = JSON.parse(jsonData);
    if (debts) saveDebts(debts);
    if (assets) saveAssets(assets);
    if (expenses) saveExpenses(expenses);
    if (income) saveIncome(income);
    if (history) localStorage.setItem('netWorthHistory', encryptData(history));
    return true;
  } catch (error) {
    console.error("Error importing data:", error);
    return false;
  }
};