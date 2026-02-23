const APP_VERSION = "5.4"; // Naikkan versi karena banyak fitur baru

function switchPage(page, el) {
    document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('page-' + page).classList.add('active');
    el.classList.add('active');
    
    if(page === 'quran') initQuran();
    if(page === 'kiblat') initKiblat();
    window.scrollTo(0,0);
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Ambil semua elemen ikon tema di navigasi
    const themeIcon = document.querySelector('#themeToggle i');
    const themeText = document.querySelector('#themeToggle span');
    
    if (isDark) {
        if(themeIcon) themeIcon.className = 'fas fa-sun';
        if(themeText) themeText.innerText = 'Terang';
    } else {
        if(themeIcon) themeIcon.className = 'fas fa-moon';
        if(themeText) themeText.innerText = 'Gelap';
    }
}

// Tambahkan pengecekan saat aplikasi pertama kali dimuat
document.addEventListener('DOMContentLoaded', () => {
    if(localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
        const themeIcon = document.querySelector('#themeToggle i');
        if(themeIcon) themeIcon.className = 'fas fa-sun';
    }
    // Fungsi lain tetap ada di sini...
    showUpdateNotice();
    initWaShare();
});

setInterval(() => {
    const n = new Date();
    document.getElementById('liveClock').innerText = n.toLocaleTimeString('id-ID');
    document.getElementById('liveDate').innerText = n.toLocaleDateString('id-ID', {weekday:'long', day:'numeric', month:'long', year:'numeric'});
}, 1000);

if(localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-theme');

// --- TAMBAHAN FITUR BARU DI BAWAH ---

// 1. Fungsi Pop-up Update Otomatis
function showUpdateNotice() {
    const lastSeenVersion = localStorage.getItem('lastSeenVersion');
    const isDark = document.body.classList.contains('dark-theme');

    if (lastSeenVersion !== APP_VERSION) {
        Swal.fire({
            title: `<strong>Imsakiyah Pro v${APP_VERSION}</strong>`,
            html: `
            <div style="text-align: left; font-size: 0.92rem; line-height: 1.6; font-family: sans-serif;">
                <p>Alhamdulillah, fitur yang kamu minta sudah hadir: 🚀</p>
                <ul style="list-style-type: none; padding-left: 5px; margin: 10px 0;">
                    <li style="margin-bottom: 8px;">📖 <b>Smart Highlight:</b> Ayat menyala otomatis saat dibaca.</li>
                    <li style="margin-bottom: 8px;">📜 <b>Auto-Scroll:</b> Layar geser sendiri mengikuti qori.</li>
                    <li style="margin-bottom: 8px;">🔄 <b>Auto-Next Surah:</b> Lanjut ngaji otomatis ke surah berikutnya.</li>
                    <li style="margin-bottom: 8px;">🔍 <b>Smart Search:</b> Cari kota & surah jauh lebih cepat.</li>
                    <li style="margin-bottom: 8px;">📳 <b>Haptic:</b> Getaran halus saat tepat arah Kiblat.</li>
                    <li style="margin-bottom: 8px;">🌙 <b>Dark Mode Fix:</b> Kontras highlight tetap jelas di mode gelap.</li>
                    <li style="margin-bottom: 8px;">📲 <b>PWA Ready:</b> Bisa di-install di HP & akses Offline.</li>
                </ul>
                <p style="font-size: 0.8rem; color: #888; border-top: 1px solid #eee; pt-2; margin-top: 10px;">
                    *Gunakan tombol "Putar Per Ayat" untuk memulai fitur Auto-Play.
                </p>
            </div>
        `,
        icon: 'success',
        confirmButtonText: 'Siap, Cobain! ✅',
        confirmButtonColor: '#004d40',
        
        // Adaptasi warna Pop-up terhadap tema
        background: isDark ? '#1e1e1e' : '#ffffff',
        color: isDark ? '#ffffff' : '#333333',
        
        showClass: {
            popup: 'animate__animated animate__fadeInUp'
        }
    });
}
// Tambahkan pengecekan ini di bagian paling bawah file JS agar pop-up muncul sekali saja
if (localStorage.getItem('appVersion') !== '5.4') {
    setTimeout(showUpdatePopup, 2000); // Muncul setelah 2 detik
    localStorage.setItem('appVersion', '5.4');
}
}

// 2. Fungsi Share WhatsApp (Inisialisasi)
function initWaShare() {
    const waBtn = document.getElementById('waShare');
    if (waBtn) {
        const pesan = encodeURIComponent(
            `Assalamualaikum, cek jadwal Imsakiyah & Al-Quran Digital di sini: ${window.location.href}`
        );
        waBtn.href = `https://wa.me/?text=${pesan}`;
    }
}

// Jalankan fitur saat halaman siap
document.addEventListener('DOMContentLoaded', () => {
    showUpdateNotice();
    initWaShare();
});
