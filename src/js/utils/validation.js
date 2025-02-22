// Input validation utilities
class Validation {
    static isValidEMI(principal, interestRate, years, emi) {
        // EMI validation formula: EMI = P * R * (1 + R)^N / ((1 + R)^N - 1)
        // where P = Principal, R = Monthly interest rate, N = Total months
        const monthlyRate = (interestRate / 12) / 100;
        const totalMonths = years * 12;
        const calculatedEMI = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                             (Math.pow(1 + monthlyRate, totalMonths) - 1);
        
        // Allow 5% margin of error due to rounding
        const margin = calculatedEMI * 0.05;
        return Math.abs(calculatedEMI - emi) <= margin;
    }

    static validateDebtInput(data) {
        const errors = [];
        
        if (!data.name?.trim()) {
            errors.push("Debt name is required");
        }
        
        if (!data.principal || data.principal <= 0) {
            errors.push("Principal amount must be greater than 0");
        }
        
        if (!data.interestRate || data.interestRate < 0) {
            errors.push("Interest rate must be 0 or greater");
        }
        
        if (!data.years || data.years <= 0) {
            errors.push("Loan duration must be greater than 0");
        }
        
        if (!data.emi || data.emi <= 0) {
            errors.push("EMI must be greater than 0");
        }

        // Validate EMI calculation if all numeric fields are present
        if (data.principal && data.interestRate && data.years && data.emi) {
            if (!this.isValidEMI(data.principal, data.interestRate, data.years, data.emi)) {
                errors.push("EMI amount appears incorrect for given loan terms");
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

export default Validation; 