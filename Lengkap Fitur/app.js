const APP_VERSION = "5.6"; // Naikkan versi karena banyak fitur baru

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

    // Event Listener Global untuk fitur Share Promosi
    document.addEventListener('click', (e) => {
        const shareBtn = e.target.closest('#waShare');
        if (shareBtn) {
            e.preventDefault();
            shareKeWhatsApp();
        }
    });
});

setInterval(() => {
    const n = new Date();
    const clockEl = document.getElementById('liveClock');
    const dateEl = document.getElementById('liveDate');
    if(clockEl) clockEl.innerText = n.toLocaleTimeString('id-ID');
    if(dateEl) dateEl.innerText = n.toLocaleDateString('id-ID', {weekday:'long', day:'numeric', month:'long', year:'numeric'});
}, 1000);

// --- FITUR SHARE PROMOSI (FIX TERPOTONG) ---
function shareKeWhatsApp() {
    const elKota = document.getElementById('resKota');
    const elImsak = document.getElementById('resImsak');
    const elMaghrib = document.getElementById('vMa');

    const namaKota = elKota ? elKota.innerText : "";
    const jamImsak = elImsak ? elImsak.innerText : "";
    const jamMaghrib = elMaghrib ? elMaghrib.innerText : "";
    const urlWeb = window.location.origin + window.location.pathname;
    const tgl = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    let pesan = "";

    if (namaKota && jamImsak !== "--:--" && jamImsak !== "") {
        // Gunakan \n untuk baris baru, lalu kita encode di bawah
        pesan = `*JADWAL IMSAKIYAH & SHALAT*\n` +
                `📍 Lokasi: *${namaKota.toUpperCase()}*\n` +
                `🗓️ Tanggal: ${tgl}\n\n` +
                `• Imsak: *${jamImsak}*\n` +
                `• Maghrib/Buka: *${jamMaghrib}*\n\n` +
                `Cek jadwal realtime, Al-Qur'an digital & download poster Ramadhan di sini:\n` +
                `👉 ${urlWeb}`;
    } else {
        pesan = `*Rekomendasi Web Imsakiyah & Al-Qur'an 2026* 🌙\n\n` +
                `Yuk siapin Ramadhan kamu dengan web yang fiturnya lengkap ini:\n` +
                `✅ Jadwal Shalat Realtime\n` +
                `✅ Al-Qur'an Digital & Audio\n` +
                `✅ Download Poster Jadwal 30 Hari\n\n` +
                `Buka di sini:\n` +
                `👉 ${urlWeb}`;
    }

    // FIX: Menggunakan encodeURIComponent agar karakter & dan spasi tidak memutus teks
    const waLink = `https://wa.me/?text=${encodeURIComponent(pesan)}`;
    window.open(waLink, '_blank');
}

// --- PERBAIKAN FITUR POP-UP UPDATE v5.5 ---
// --- PERBAIKAN FITUR POP-UP UPDATE v5.5 ---
function showUpdateNotice() {
    const lastSeenVersion = localStorage.getItem('lastSeenVersion');
    const isDark = document.body.classList.contains('dark-theme');

    if (lastSeenVersion !== APP_VERSION) {
        Swal.fire({
            title: `<strong>Imsakiyah Pro v${APP_VERSION}</strong>`,
            html: `
            <div style="text-align: left; font-size: 0.92rem; line-height: 1.6; font-family: sans-serif;">
                <p>Alhamdulillah, update v5.5 sudah siap menemani ibadahmu! Apa saja yang baru? 🌙</p>
                <ul style="list-style-type: none; padding-left: 5px; margin: 10px 0;">
                    <li style="margin-bottom: 10px;">🎧 <b>Visual Murottal:</b> Kini ada penanda (highlight) otomatis pada ayat yang sedang dibaca.</li>
                    <li style="margin-bottom: 10px;">📲 <b>Seamless WA Share:</b> Link bagikan jadwal sudah diperbaiki (pesan tidak terpotong lagi).</li>
                    <li style="margin-bottom: 10px;">🔍 <b>Smart Quran Search:</b> Cari surah jauh lebih akurat dengan teknologi Fuse.js.</li>
                    <li style="margin-bottom: 10px;">🎨 <b>UI Cleanup:</b> Navigasi surah dan tombol daftar surah kini lebih rapi dan presisi.</li>
                </ul>
                <p style="font-size: 0.8rem; color: #888; border-top: 1px solid #eee; padding-top: 10px; margin-top: 10px;">
                    *Jika tampilan masih berantakan, silakan tekan <b>Ctrl + F5</b> atau hapus cache browser Anda.
                </p>
            </div>
            `,
            icon: 'success',
            confirmButtonText: 'Siap, Cobain Sekarang! ✅',
            confirmButtonColor: '#004d40',
            background: isDark ? '#1e1e1e' : '#ffffff',
            color: isDark ? '#ffffff' : '#333333',
            allowOutsideClick: false,
            showClass: {
                popup: 'animate__animated animate__zoomIn'
            }
        }).then(() => {
            localStorage.setItem('lastSeenVersion', APP_VERSION);
        });
    }
}
