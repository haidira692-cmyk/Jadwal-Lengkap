const APP_VERSION = "5.0"; // Naikkan versi karena banyak fitur baru

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
                <div style="text-align: left; font-size: 0.9rem; line-height: 1.5;">
                    <p style="margin-bottom: 10px; font-weight: bold; color: var(--primary);">Apa yang baru di update ini?</p>
                    <ul style="padding-left: 18px; margin: 0;">
                        <li style="margin-bottom: 8px;"><b>Murottal Audio:</b> Dengarkan lantunan ayat langsung di dalam aplikasi.</li>
                        <li style="margin-bottom: 8px;"><b>Navigasi Surah:</b> Pindah ke surah sebelum/sesudah dengan sekali klik tanpa balik ke daftar.</li>
                        <li style="margin-bottom: 8px;"><b>UI Refresh:</b> Tampilan Al-Quran lebih proporsional (Anti-Lonjong) dan nyaman dibaca.</li>
                        <li style="margin-bottom: 8px;"><b>Smart Dark Mode:</b> Perbaikan box terjemahan agar tidak silau di malam hari.</li>
                        <li><b>Tombol Share:</b> Bagikan jadwal imsakiyah dengan tampilan tombol WhatsApp yang baru.</li>
                    </ul>
                </div>`,
            confirmButtonText: 'Mulai Menjelajah!',
            confirmButtonColor: '#004d40',
            backdrop: `rgba(0, 77, 64, 0.2)`,
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