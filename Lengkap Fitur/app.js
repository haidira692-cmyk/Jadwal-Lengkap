const APP_VERSION = "5.3"; // Naikkan versi karena banyak fitur baru

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

    if (lastSeenVersion !== APP_VERSION) {
        Swal.fire({
            title: `<strong>Imsakiyah Pro v${APP_VERSION}</strong>`,
            icon: 'success',
            html: `
                <div style="text-align: left; font-size: 0.95rem; line-height: 1.6; color: var(--text);">
                    <p>Alhamdulillah, beberapa fitur baru telah hadir untukmu: 🚀</p>
                    <ul style="list-style-type: none; padding-left: 5px;">
                        <li>🔍 <b>Smart Search:</b> Autocomplete kota lebih cepat.</li>
                        <li>🤔 <b>Saran Typo:</b> "Maksud Anda" untuk koreksi nama kota.</li>
                        <li>🧭 <b>Kompas Fix:</b> Posisi piringan kini presisi di tengah.</li>
                        <li>📳 <b>Haptic:</b> HP bergetar saat tepat arah Kiblat.</li>
                        <li>🌙 <b>Dark Mode:</b> Kontras terjemahan lebih sejuk.</li>
                        <li>❌ <b>Quick Clear:</b> Hapus pencarian sekali klik.</li>
                        <li>📲 <b>PWA Ready:</b> Aplikasi kini bisa diinstal langsung di HP!</li>
                        <li>📡 <b>Offline Mode:</b> Tetap bisa diakses meski tanpa internet.</li>
                    </ul>
                    <p style="margin-top: 15px; font-style: italic; font-size: 0.85rem; color: #888;">
                        *Klik ikon 'Install' di browser untuk menyimpan ke layar utama.
                    </p>
                </div>
            `,
            confirmButtonText: 'Mulai Menjelajah!',
            confirmButtonColor: '#004d40',
            
            // OTOMATISASI WARNA BERDASARKAN TEMA
            background: isDarkMode ? '#1e1e1e' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#333333',
            
            showClass: {
                popup: 'animate__animated animate__fadeInUp'
            }
        }).then(() => {
            // Simpan versi agar tidak muncul lagi kecuali ada update baru
            localStorage.setItem('lastSeenVersion', APP_VERSION);
        });
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
