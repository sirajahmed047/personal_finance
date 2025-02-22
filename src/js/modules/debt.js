export class DebtValidator {
    static MAX_LOAN_AMOUNT = 100000000; // 1 crore
    static MAX_LOAN_YEARS = 30;

    static validateDebtInput(data) {
        const errors = [];
        
        // Basic validations
        if (!data.name?.trim()) {
            errors.push("Debt name is required");
        }
        
        // Amount validation
        if (!data.principal || data.principal <= 0) {
            errors.push("Principal amount must be greater than 0");
        } else if (data.principal > this.MAX_LOAN_AMOUNT) {
            errors.push(`Principal amount cannot exceed ₹${this.MAX_LOAN_AMOUNT.toLocaleString()}`);
        }
        
        // Duration validation
        if (!data.months || data.months <= 0) {
            errors.push("Loan duration must be greater than 0");
        } else if (data.months > this.MAX_LOAN_YEARS) {
            errors.push(`Loan duration cannot exceed ${this.MAX_LOAN_YEARS} months`);
        }

        // Date validation
        const startDate = new Date(data.startDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time part for accurate date comparison
        
        if (startDate > today) {
            errors.push("Start date cannot be in the future");
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static calculateMissedPayments(debt, payments) {
        if (!debt.startDate) return false;
        
        const startDate = new Date(debt.startDate);
        const today = new Date();
        
        // If start date is in the future, no missed payments
        if (startDate > today) {
            return false;
        }

        // Calculate expected number of payments since start date
        const monthsSinceStart = this.getMonthsDifference(startDate, today);
        
        // Get all payments for this debt
        const debtPayments = payments.filter(p => p.debtId === debt.id);
        const monthsWithPayments = new Set();
        
        // Track which months have payments
        debtPayments.forEach(payment => {
            const paymentDate = new Date(payment.date);
            const monthKey = `${paymentDate.getFullYear()}-${paymentDate.getMonth()}`;
            monthsWithPayments.add(monthKey);
        });

        // Return true if any month is missing a payment
        return monthsWithPayments.size < monthsSinceStart;
    }

    static getMonthsDifference(startDate, endDate) {
        const yearDiff = endDate.getFullYear() - startDate.getFullYear();
        const monthDiff = endDate.getMonth() - startDate.getMonth();
        return yearDiff * 12 + monthDiff;
    }

    static hasPaymentForCurrentMonth(debt, payments) {
        const today = new Date();
        const currentMonthKey = `${today.getFullYear()}-${today.getMonth()}`;
        
        return payments
            .filter(p => p.debtId === debt.id)
            .some(payment => {
                const paymentDate = new Date(payment.date);
                const paymentMonthKey = `${paymentDate.getFullYear()}-${paymentDate.getMonth()}`;
                return paymentMonthKey === currentMonthKey;
            });
    }
}

export class DebtCalculator {
    static calculateEMI(principal, annualInterestRate, months) {
        // Convert annual rate to monthly rate (as decimal)
        const monthlyRate = (annualInterestRate / 12) / 100;
        
        if (annualInterestRate === 0) {
            // For 0% interest, simply divide principal by months
            return principal / months;
        }
        
        // EMI = [P × r × (1 + r)^n] / [(1 + r)^n - 1]
        const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                   (Math.pow(1 + monthlyRate, months) - 1);
        
        return Math.round(emi * 100) / 100; // Round to 2 decimal places
    }

    static calculateTotalDebt(debt, payments = []) {
        const totalAmount = debt.emi * debt.months;
        const paidAmount = payments
            .filter(p => p.debtId === debt.id)
            .reduce((sum, p) => sum + p.amount, 0);
        
        return Math.max(totalAmount - paidAmount, 0);
    }

    static calculatePaymentSchedule(debt, payments = []) {
        const schedule = [];
        const startDate = new Date(debt.startDate);
        let remainingAmount = debt.emi * debt.months;

        // Generate schedule from start date
        for (let i = 0; i < debt.months; i++) {
            const dueDate = new Date(startDate);
            dueDate.setMonth(startDate.getMonth() + i);
            
            schedule.push({
                dueDate: dueDate.toISOString().split('T')[0],
                amount: debt.emi,
                isPaid: false,
                remainingAmount
            });
            
            remainingAmount -= debt.emi;
        }

        // Mark payments as paid
        const filteredPayments = payments.filter(p => p.debtId === debt.id);
        filteredPayments.forEach(payment => {
            const scheduleItem = schedule.find(item => item.dueDate === payment.date);
            if (scheduleItem) {
                scheduleItem.isPaid = true;
                scheduleItem.actualPayment = payment.amount;
            }
        });

        return schedule;
    }

    static calculateProgress(debt, payments = []) {
        const totalAmount = debt.emi * debt.months;
        const totalPaid = payments
            .filter(p => p.debtId === debt.id)
            .reduce((sum, p) => sum + p.amount, 0);
        
        return (totalPaid / totalAmount) * 100;
    }

    static calculatePaymentBreakdown(debt, payments = []) {
        const totalMonths = debt.months;
        const totalAmount = debt.emi * totalMonths;
        const monthlyInterestRate = (debt.interestRate / 12) / 100;

        let principalPaid = 0;
        let interestPaid = 0;
        let remainingEMIs = totalMonths;

        payments.filter(p => p.debtId === debt.id)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .forEach(payment => {
                // Calculate interest portion of this payment
                const currentInterest = (debt.principal - principalPaid) * monthlyInterestRate;
                const currentPrincipal = Math.min(payment.amount, debt.emi) - currentInterest;
                
                principalPaid += currentPrincipal;
                interestPaid += Math.min(currentInterest, payment.amount - currentPrincipal);
                
                if (payment.amount >= debt.emi) {
                    remainingEMIs--;
                }
            });

        return {
            principalPaid,
            interestPaid,
            totalPaid: principalPaid + interestPaid,
            remainingEMIs,
            progressPercentage: ((principalPaid + interestPaid) / totalAmount) * 100,
            principalPercentage: (principalPaid / totalAmount) * 100,
            interestPercentage: (interestPaid / totalAmount) * 100
        };
    }

    static getUpcomingEMIs(debt, payments = []) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time for accurate date comparison
        const nextThreeMonths = new Date(today);
        nextThreeMonths.setMonth(today.getMonth() + 3);
        
        const schedule = this.calculatePaymentSchedule(debt, payments)
            .filter(payment => {
                const dueDate = new Date(payment.dueDate);
                return !payment.isPaid && dueDate <= nextThreeMonths;
            })
            .map(payment => {
                const dueDate = new Date(payment.dueDate);
                const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                
                return {
                    ...payment,
                    daysUntilDue,
                    status: this.getEMIStatus(daysUntilDue)
                };
            });

        return schedule;
    }

    static getEMIStatus(daysUntilDue) {
        if (daysUntilDue < 0) return 'overdue';
        if (daysUntilDue <= 2) return 'urgent';
        if (daysUntilDue <= 5) return 'upcoming';
        return 'normal';
    }
} 