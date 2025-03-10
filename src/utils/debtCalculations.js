export function calculateEMI(principal, interestRate, duration) {
    if (interestRate === 0) {
      return principal / duration;
    }
    const monthlyRate = interestRate / 1200;
    const denominator = Math.pow(1 + monthlyRate, duration) - 1;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, duration)) / denominator;
  }
  
  export function calculateRemainingBalance(debt, currentDate) {
    let balance = debt.principal;
    const monthlyRate = debt.interestRate / 1200;
    let current = new Date(debt.startDate);
    while (current < currentDate) {
      balance += balance * monthlyRate; // Add interest
      const paymentsThisMonth = debt.payments.filter(p => new Date(p.date).getMonth() === current.getMonth() && new Date(p.date).getFullYear() === current.getFullYear());
      balance -= paymentsThisMonth.reduce((sum, p) => sum + p.amount, 0); // Apply payments
      current.setMonth(current.getMonth() + 1);
    }
    return balance > 0 ? balance : 0;
  }