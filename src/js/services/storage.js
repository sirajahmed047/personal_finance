// Handles all localStorage operations
export class StorageService {
    static MAX_STORAGE_SIZE = 4.5 * 1024 * 1024; // 4.5MB (localStorage typically has 5MB limit)
    
    static compress(data) {
        return JSON.stringify(data).split('')
            .map(char => char.charCodeAt(0).toString(36))
            .join('');
    }
    
    static decompress(compressed) {
        return JSON.parse(
            compressed.match(/.{1,2}/g)
                .map(char => String.fromCharCode(parseInt(char, 36)))
                .join('')
        );
    }

    static getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error(`Error reading ${key} from storage:`, e);
            return defaultValue;
        }
    }

    static setItem(key, value) {
        try {
            const compressed = this.compress(value);
            localStorage.setItem(key, compressed);
            
            // Check storage usage
            const totalSize = new Blob(Object.values(localStorage)).size;
            if (totalSize > this.MAX_STORAGE_SIZE) {
                this.showStorageWarning(totalSize);
            }
            
            return true;
        } catch (e) {
            console.error(`Error saving ${key} to storage:`, e);
            return false;
        }
    }

    static showStorageWarning(currentSize) {
        const usagePercent = (currentSize / this.MAX_STORAGE_SIZE) * 100;
        const notification = document.createElement('div');
        notification.className = 'sync-notification warning';
        notification.textContent = `Storage ${usagePercent.toFixed(1)}% full. Consider backing up your data.`;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }
} 