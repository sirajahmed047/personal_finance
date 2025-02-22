export async function shareNetWorth() {
    if (navigator.share) {
        try {
            const netWorth = document.getElementById('net-worth').textContent;
            await navigator.share({
                title: 'My Financial Summary',
                text: `Net Worth: ₹${netWorth}\nTracked with Finance Dashboard`,
                url: window.location.href
            });
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error sharing:', error);
            }
        }
    }
} 