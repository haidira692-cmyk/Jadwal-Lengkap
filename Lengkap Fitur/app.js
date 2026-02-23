const APP_VERSION = "5.4"; // Naikkan versi karena banyak fitur baru

function switchPage(page, el) {
    document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    const targetPage = document.getElementById('page-' + page);
    if(targetPage) {
        targetPage.classList.add('active');
        if(el) el.classList.add('active');
        
        if(page === 'quran' && typeof initQuran === 'function') initQuran();
        if(page === 'kiblat' && typeof initKiblat === 'function') initKiblat();
        if(page === 'shalat' && typeof loadBacaanShalat === 'function') loadBacaanShalat();
        window.scrollTo(0,0);
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
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
    
    // Inisialisasi fitur
    showUpdateNotice();
    updateWaLink(); // Fungsi baru untuk link awal
});

setInterval(() => {
    const n = new Date();
    const clockEl = document.getElementById('liveClock');
    const dateEl = document.getElementById('liveDate');
    if(clockEl) clockEl.innerText = n.toLocaleTimeString('id-ID');
    if(dateEl) dateEl.innerText = n.toLocaleDateString('id-ID', {weekday:'long', day:'numeric', month:'long', year:'numeric'});
}, 1000);

// --- PERBAIKAN FITUR POP-UP UPDATE ---
function showUpdateNotice() {
    const lastSeenVersion = localStorage.getItem('lastSeenVersion');
    const isDark = document.body.classList.contains('dark-theme');

    // Hanya muncul jika versi berbeda
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
                <p style="font-size: 0.8rem; color: #888; border-top: 1px solid #eee; padding-top: 10px; margin-top: 10px;">
                    *Gunakan tombol "Putar Per Ayat" untuk memulai fitur Auto-Play.
                </p>
            </div>
            `,
            icon: 'success',
            confirmButtonText: 'Siap, Cobain! ✅',
            confirmButtonColor: '#004d40',
            background: isDark ? '#1e1e1e' : '#ffffff',
            color: isDark ? '#ffffff' : '#333333',
            allowOutsideClick: false,
            showClass: { popup: 'animate__animated animate__fadeInUp' }
        }).then(() => {
            // Simpan ke localStorage SETELAH user klik tombol OK
            localStorage.setItem('lastSeenVersion', APP_VERSION);
        });
    }
}

// --- PERBAIKAN FITUR SHARE WA ---
// Fungsi untuk update link WA secara dinamis sesuai jadwal yang ada
function updateWaLink() {
    const waBtn = document.getElementById('waShare');
    if (!waBtn) return;

    // Ambil data dari UI jika tersedia
    const kota = document.getElementById('resKota')?.innerText || "";
    const imsak = document.getElementById('resImsak')?.innerText || "";
    const maghrib = document.getElementById('vMa')?.innerText || "";

    let text;
    if (imsak && imsak !== "--:--") {
        // Jika jadwal sudah ada, bagikan jadwalnya
        text = `*JADWAL IMSAKIYAH ${kota.toUpperCase()}*%0A🗓️ ${new Date().toLocaleDateString('id-ID', {day:'numeric', month:'long'})}%0A⏰ Imsak: *${imsak}*%0A⏰ Maghrib: *${maghrib}*%0A%0ACek Jadwal Lengkap: ${window.location.href}`;
    } else {
        // Jika belum pilih kota, bagikan link umum
        text = `Assalamualaikum, cek jadwal Imsakiyah & Al-Quran Digital di sini: ${window.location.href}`;
    }

    waBtn.href = `https://wa.me/?text=${text}`;
}

// Pastikan setiap kali pilih kota, link WA ikut terupdate
// (Tambahkan pemicu updateWaLink() di dalam fungsi pilihKota kamu)
