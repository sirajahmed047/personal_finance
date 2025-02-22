import { DebtCalculator, DebtValidator } from '../modules/debt.js';

export class NotificationManager {
    static notifications = [];
    
    static init() {
        // Initialize notification center
        const notificationBtn = document.getElementById('notification-btn');
        const notificationDropdown = document.getElementById('notification-dropdown');
        const clearNotificationsBtn = document.getElementById('clear-notifications');

        // Load saved notifications
        this.loadNotifications();

        // Toggle dropdown
        notificationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationDropdown.classList.toggle('show');
            this.markAllAsRead();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!notificationDropdown.contains(e.target) && !notificationBtn.contains(e.target)) {
                notificationDropdown.classList.remove('show');
            }
        });

        // Clear all notifications
        clearNotificationsBtn.addEventListener('click', () => {
            this.clearNotifications();
        });

        // Initial render
        this.renderNotifications();
    }

    static addNotification(notification) {
        const newNotification = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            read: false,
            ...notification
        };

        this.notifications.unshift(newNotification);
        this.saveNotifications();
        this.renderNotifications();
    }

    static markAllAsRead() {
        this.notifications = this.notifications.map(n => ({ ...n, read: true }));
        this.saveNotifications();
        this.renderNotifications();
    }

    static clearNotifications() {
        this.notifications = [];
        this.saveNotifications();
        this.renderNotifications();
    }

    static loadNotifications() {
        try {
            const saved = localStorage.getItem('notifications');
            this.notifications = saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading notifications:', error);
            this.notifications = [];
        }
    }

    static saveNotifications() {
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
    }

    static renderNotifications() {
        const notificationList = document.getElementById('notification-list');
        const notificationCount = document.getElementById('notification-count');
        
        // Update count
        const unreadCount = this.notifications.filter(n => !n.read).length;
        notificationCount.textContent = unreadCount;
        notificationCount.style.display = unreadCount > 0 ? 'block' : 'none';

        // Render list
        notificationList.innerHTML = this.notifications.length ? 
            this.notifications.map(notification => `
                <div class="notification-item ${notification.read ? '' : 'unread'} ${notification.priority || ''}" data-id="${notification.id}">
                    <div class="notification-content">
                        <div class="notification-message">
                            ${notification.priority === 'urgent' ? '🔴' : 
                              notification.priority === 'high' ? '🟡' : '🔵'} 
                            ${notification.message}
                        </div>
                        <div class="notification-time">${this.formatTimestamp(notification.timestamp)}</div>
                    </div>
                </div>
            `).join('') :
            '<div class="no-notifications">No notifications</div>';
    }

    static formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return `${Math.round(diffInHours)} hours ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    static checkForDueEMIs(debts, payments) {
        debts.forEach(debt => {
            // Check for upcoming EMIs (within next 5 days)
            const upcomingEMIs = DebtCalculator.getUpcomingEMIs(debt, payments)
                .filter(emi => emi.daysUntilDue <= 5 && emi.daysUntilDue >= 0);

            upcomingEMIs.forEach(emi => {
                // Check if we already have a notification for this EMI
                const existingNotification = this.notifications.find(n => 
                    n.type === 'emi_due' && 
                    n.debtId === debt.id && 
                    n.dueDate === emi.dueDate
                );

                if (!existingNotification) {
                    this.addNotification({
                        type: 'emi_due',
                        message: `EMI of ₹${emi.amount.toFixed(2)} for ${debt.name} is due in ${emi.daysUntilDue} days`,
                        debtId: debt.id,
                        dueDate: emi.dueDate,
                        priority: emi.daysUntilDue <= 2 ? 'high' : 'normal'
                    });
                }
            });

            // Check for missed payments
            if (DebtValidator.calculateMissedPayments(debt, payments)) {
                // Check if we already have an active missed payment notification
                const existingMissedNotification = this.notifications.find(n => 
                    n.type === 'missed_payment' && 
                    n.debtId === debt.id &&
                    !n.resolved
                );

                if (!existingMissedNotification) {
                    this.addNotification({
                        type: 'missed_payment',
                        message: `Missed payment for ${debt.name}. Please make the payment as soon as possible.`,
                        debtId: debt.id,
                        priority: 'urgent',
                        resolved: false
                    });
                }
            }
        });
    }
} 