if ('serviceWorker' in navigator) {
    console.log('app.js is running');
                
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js').then(registration => {
            console.log('Service Worker registered:', registration);
        }).catch(error => {
            console.error('Service Worker registration failed:', error);
        });
    });
} else {
    console.log('Service Worker is not supported by your browser.');
}
