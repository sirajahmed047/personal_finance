// Simple CSV conversion (expand as needed)
export const convertToCSV = (data) => {
  const headers = 'Type,Name,Value\n';
  const assetRows = data.assets.map(a => `Asset,${a.name},${a.value}`).join('\n');
  const debtRows = data.debts.map(d => `Debt,${d.name},${d.principal}`).join('\n');
  return headers + assetRows + '\n' + debtRows;
}; 