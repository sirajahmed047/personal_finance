import { StorageService } from './storage.js';

export class SyncService {
    static RETENTION_DAYS = 1825; // 5 years in days

    static async saveOfflineData(data) {
        const timestamp = new Date().toISOString();
        const offlineData = {
            timestamp,
            data,
            synced: false
        };
        
        const pendingChanges = StorageService.getItem('pendingChanges', []);
        
        // Clean up old data
        const retentionDate = new Date();
        retentionDate.setDate(retentionDate.getDate() - this.RETENTION_DAYS);
        
        const validChanges = pendingChanges.filter(change => 
            new Date(change.timestamp) > retentionDate
        );
        
        validChanges.push(offlineData);
        StorageService.setItem('pendingChanges', validChanges);
    }

    static async syncWhenOnline() {
        if (!navigator.onLine) return;
        
        const pendingChanges = StorageService.getItem('pendingChanges', []);
        if (pendingChanges.length === 0) return;

        try {
            // Process pending changes
            const processedChanges = pendingChanges.filter(change => !change.synced);
            
            // Update local storage
            StorageService.setItem('pendingChanges', 
                pendingChanges.filter(change => !processedChanges.includes(change)));

            // Show sync notification
            this.showSyncNotification(processedChanges.length);
        } catch (error) {
            console.error('Sync failed:', error);
        }
    }

    static showSyncNotification(count) {
        const notification = document.createElement('div');
        notification.className = 'sync-notification';
        notification.textContent = `${count} changes synchronized`;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
} 