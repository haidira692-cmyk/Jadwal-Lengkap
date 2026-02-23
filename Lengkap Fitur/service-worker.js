// Daftarkan Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
    .then(() => console.log("Service Worker Registered"))
    .catch(err => console.log("Service Worker Failed", err));
}

// Tambahkan link manifest di dalam tag <head>
// Paste ini di bagian <head> file index.html:
// <link rel="manifest" href="manifest.json">