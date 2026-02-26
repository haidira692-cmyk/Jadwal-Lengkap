let allSurah = [], fuseSurah;
let currentSurahNo = 1;
let currentAyatIndex = 0;
let isPlaying = false;
let ayatAudio = new Audio();

async function initQuran() {
    const listContainer = document.getElementById('surahList');
    if (allSurah.length > 0) return;
    
    listContainer.innerHTML = "<p style='text-align:center; padding:20px;'>Menghubungkan ke API Al-Quran...</p>";
    
    try {
        const res = await fetch('https://equran.id/api/v2/surat');
        const json = await res.json();
        allSurah = json.data; 

        fuseSurah = new Fuse(allSurah, { 
            keys: ['namaLatin', 'arti'], 
            threshold: 0.3 
        });
        
        renderQuran(allSurah);
    } catch (e) {
        console.error("Fetch Error:", e);
        listContainer.innerHTML = `<p style="color:red; text-align:center; padding:20px;">Koneksi API Terblokir.</p>`;
    }
}

function renderQuran(data) {
    const listContainer = document.getElementById('surahList');
    if (!data || data.length === 0) return;

    listContainer.innerHTML = data.map(s => `
        <div class="surah-item" onclick="loadAyat(${s.nomor}, '${s.namaLatin.replace(/'/g, "\\'")}')">
            <div class="surah-no">${s.nomor}</div>
            <div style="flex:1">
                <b class="surah-name-title">${s.namaLatin}</b><br>
                <small class="surah-arti-text">${s.arti}</small>
            </div>
            <div class="arabic-name-list">${s.nama}</div>
        </div>
    `).join('');
}

// Update fungsi loadAyat untuk menerima parameter autoPlay
async function loadAyat(no, nama, autoPlay = false) {
    currentSurahNo = no;
    currentAyatIndex = 0;
    
    // Matikan audio lama jika bukan perpindahan otomatis
    if (!autoPlay) {
        isPlaying = false;
        ayatAudio.pause();
    }
    
    Swal.fire({ 
        title: 'Memuat Surah ' + nama, 
        timer: 800, 
        showConfirmButton: false, 
        didOpen: () => Swal.showLoading() 
    });
    
    try {
        const res = await fetch(`https://equran.id/api/v2/surat/${no}`);
        const json = await res.json();
        const data = json.data;
        const ayatList = data.ayat;

        document.getElementById('quranHeader').style.display = 'none';
        document.getElementById('surahList').style.display = 'none';
        const ayatView = document.getElementById('ayatView');
        ayatView.style.display = 'block';
        
        // Render Header Ayat dengan Navigasi yang dikembalikan
        ayatView.innerHTML = `
            <div class="quran-nav-header">
                <button class="btn-nav-main" onclick="backToSurah()">← Daftar Surah</button>
                <div class="nav-prev-next">
                    <button class="btn-nav-side" onclick="navSurah(${no - 1})" ${no <= 1 ? 'disabled' : ''}>← Seb</button>
                    <button class="btn-nav-side" onclick="navSurah(${no + 1})" ${no >= 114 ? 'disabled' : ''}>Sel →</button>
                </div>
            </div>

            <div class="audio-player-card">
                <h3>${data.namaLatin} (${data.nama})</h3>
                <p id="audioStatus">${autoPlay ? '✨ Sedang Mengaji...' : 'Siap diputar'}</p>
                <button id="btnPlay" class="btn-play-murottal" onclick="toggleSmartAudio()">
                    <i class="fas fa-${autoPlay ? 'pause' : 'play'}"></i> ${autoPlay ? 'Berhentikan' : 'Putar Ayat'}
                </button>
            </div>

            <div id="isiAyat">
                ${ayatList.map((a, index) => `
                    <div class="ayat-box" id="ayat-box-${index}" data-audio="${a.audio['05']}">
                        <div class="arabic-container">
                            <p class="arabic-text-main">${a.teksArab} <span class="ayat-number-circle">${a.nomorAyat}</span></p>
                        </div>
                        <div class="translation-container">
                            <p class="translation-text-main">${a.teksIndonesia}</p>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="bottom-nav-surah">
                 <button class="btn-nav-side" onclick="navSurah(${no - 1})" ${no <= 1 ? 'disabled' : ''}>Surah Sebelumnya</button>
                 <button class="btn-nav-side" onclick="navSurah(${no + 1})" ${no >= 114 ? 'disabled' : ''}>Surah Selanjutnya</button>
            </div>
        `;
        
        window.scrollTo(0, 0);

        // Pasang listener audio
        ayatAudio.onended = () => {
            currentAyatIndex++;
            playSequence(document.querySelectorAll('.ayat-box'));
        };

        // Jika autoPlay dipicu dari surah sebelumnya, langsung mainkan
        if (autoPlay) {
            isPlaying = true;
            playSequence(document.querySelectorAll('.ayat-box'));
        }

    } catch (e) {
        console.error("Gagal memuat surah:", e);
        Swal.fire("Waduh", "Koneksi ke server Al-Quran terputus.", "error");
    }
}

function toggleSmartAudio() {
    const btn = document.getElementById('btnPlay');
    const ayatList = document.querySelectorAll('.ayat-box');

    if (!isPlaying) {
        isPlaying = true;
        btn.innerHTML = '<i class="fas fa-pause"></i> Berhentikan';
        document.getElementById('audioStatus').innerText = "Sedang Mengaji...";
        playSequence(ayatList);
    } else {
        isPlaying = false;
        ayatAudio.pause();
        btn.innerHTML = '<i class="fas fa-play"></i> Lanjutkan';
        document.getElementById('audioStatus').innerText = "Dipause";
    }
}

function playSequence(elements) {
    if (!isPlaying) return;

    document.querySelectorAll('.ayat-box').forEach(el => el.classList.remove('ayat-highlight-active'));

    if (currentAyatIndex < elements.length) {
        const targetEl = document.getElementById(`ayat-box-${currentAyatIndex}`);
        const audioUrl = targetEl.getAttribute('data-audio');

        targetEl.classList.add('ayat-highlight-active');
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

        ayatAudio.src = audioUrl;
        ayatAudio.play().catch(e => console.log("Autoplay blocked by browser", e));
    } else {
        // SURAH SELESAI -> PINDAH & LANGSUNG PUTAR
        if (currentSurahNo < 114) {
            const nextNo = currentSurahNo + 1;
            const nextSurah = allSurah.find(s => s.nomor === nextNo);
            if (nextSurah) {
                // Beri jeda 1 detik sebelum pindah surah agar tidak kaget
                setTimeout(() => {
                    loadAyat(nextSurah.nomor, nextSurah.namaLatin, true); // true = autoPlay
                }, 1500);
            }
        } else {
            isPlaying = false;
            document.getElementById('audioStatus').innerText = "Khatam Al-Quran";
        }
    }
}

function backToSurah() {
    isPlaying = false;
    ayatAudio.pause();
    document.getElementById('quranHeader').style.display = 'block';
    document.getElementById('surahList').style.display = 'block';
    document.getElementById('ayatView').style.display = 'none';
}

function navSurah(no) {
    const surah = allSurah.find(s => s.nomor === no);
    if (surah) loadAyat(surah.nomor, surah.namaLatin);
}

// --- TEMPEL DI SINI (BAGIAN PALING BAWAH) ---

function filterSurah() {
    const input = document.getElementById('cariSurah');
    const clearBtn = document.getElementById('clearSearch');
    const query = input.value;

    // Tampilkan/Sembunyikan tombol X (clear)
    if (clearBtn) {
        clearBtn.style.display = query.length > 0 ? 'block' : 'none';
    }

    if (!query) {
        renderQuran(allSurah);
        return;
    }

    // Gunakan Fuse untuk pencarian cerdas
    if (fuseSurah) {
        const results = fuseSurah.search(query);
        const filteredData = results.map(r => r.item);
        renderQuran(filteredData);
    } else {
        // Fallback jika fuse belum siap
        const manualFilter = allSurah.filter(s => 
            s.namaLatin.toLowerCase().includes(query.toLowerCase()) || 
            s.arti.toLowerCase().includes(query.toLowerCase())
        );
        renderQuran(manualFilter);
    }
}

function clearSearch() {
    const input = document.getElementById('cariSurah');
    if (input) {
        input.value = '';
        filterSurah(); // Memanggil filterSurah untuk mereset daftar ke awal
        input.focus();
    }
}
