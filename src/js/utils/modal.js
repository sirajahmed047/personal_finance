export class ModalManager {
    static openModal(modalId) {
        console.log(`Opening modal: ${modalId}`);
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            setTimeout(() => {
                modal.style.opacity = '1';
                modal.classList.add('active');
            }, 10);
        } else {
            console.error(`Modal not found: ${modalId}`);
        }
    }

    static closeModal(modalId) {
        console.log(`Closing modal: ${modalId}`);
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.opacity = '0';
            modal.classList.remove('active');
            setTimeout(() => modal.style.display = 'none', 300);
        } else {
            console.error(`Modal not found: ${modalId}`);
        }
    }

    static init() {
        console.log('Initializing ModalManager...');
        
        try {
            // Add Debt modal
            const addDebtBtn = document.getElementById('add-debt');
            const closeDebtBtn = document.getElementById('close-debt-modal');
            if (addDebtBtn) {
                addDebtBtn.addEventListener('click', () => this.openModal('add-debt-modal'));
                console.log('Add debt button listener added');
            }
            if (closeDebtBtn) {
                closeDebtBtn.addEventListener('click', () => this.closeModal('add-debt-modal'));
                console.log('Close debt button listener added');
            }

            // Update Salary modal
            const updateSalaryBtn = document.getElementById('update-salary');
            const closeSalaryBtn = document.getElementById('close-salary-modal');
            if (updateSalaryBtn) updateSalaryBtn.addEventListener('click', () => this.openModal('update-salary-modal'));
            if (closeSalaryBtn) closeSalaryBtn.addEventListener('click', () => this.closeModal('update-salary-modal'));

            // Add Investment modal
            const addInvestmentBtn = document.getElementById('add-investment');
            const closeInvestmentBtn = document.getElementById('close-investment-modal');
            if (addInvestmentBtn) addInvestmentBtn.addEventListener('click', () => this.openModal('add-investment-modal'));
            if (closeInvestmentBtn) closeInvestmentBtn.addEventListener('click', () => this.closeModal('add-investment-modal'));

            // History modal
            const viewHistoryBtn = document.getElementById('view-debt-history');
            const closeHistoryBtn = document.getElementById('close-history-modal');
            if (viewHistoryBtn) {
                viewHistoryBtn.addEventListener('click', () => {
                    if (typeof window.updateDebtHistory === 'function') {
                        window.updateDebtHistory();
                        this.openModal('history-modal');
                    } else {
                        console.error('updateDebtHistory function not found');
                    }
                });
            }
            if (closeHistoryBtn) closeHistoryBtn.addEventListener('click', () => this.closeModal('history-modal'));

            console.log('ModalManager initialized successfully');
        } catch (error) {
            console.error('Error in ModalManager initialization:', error);
            throw error;
        }
    }
} 