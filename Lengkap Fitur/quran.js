let allSurah = [], fuseSurah;
let currentSurahNo = 1;

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
        listContainer.innerHTML = `<p style="color:red; text-align:center; padding:20px;">Koneksi API Terblokir. Periksa internet kamu.</p>`;
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

function filterSurah() {
    const input = document.getElementById('cariSurah');
    const clearBtn = document.getElementById('clearSearch');
    const val = input.value.toLowerCase();
    
    clearBtn.style.display = val ? 'block' : 'none';

    if (!val) {
        renderQuran(allSurah);
        return;
    }

    if (fuseSurah) {
        const hasilCari = fuseSurah.search(val).map(r => r.item);
        renderQuran(hasilCari);
    }
}

function clearSearch() {
    const input = document.getElementById('cariSurah');
    input.value = '';
    filterSurah();
    input.focus();
}

async function loadAyat(no, nama) {
    currentSurahNo = no;
    Swal.fire({ title: 'Memuat Surah ' + nama, didOpen: () => Swal.showLoading() });
    
    try {
        const res = await fetch(`https://equran.id/api/v2/surat/${no}`);
        const json = await res.json();
        const data = json.data;
        const ayatList = data.ayat;

        document.getElementById('quranHeader').style.display = 'none';
        document.getElementById('surahList').style.display = 'none';
        
        const ayatView = document.getElementById('ayatView');
        ayatView.style.display = 'block';
        
        // Render Header Ayat dengan Navigasi & Audio
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
                <p>${data.arti}</p>
                <audio id="murottal" src="${data.audioFull['05']}"></audio>
                <button id="btnPlay" class="btn-play-murottal" onclick="toggleAudio()">
                    <i class="fas fa-play"></i> Putar Murottal
                </button>
            </div>

            <div id="isiAyat">
                ${ayatList.map(a => `
                    <div class="ayat-box">
                        <div class="arabic-container">
                            <p class="arabic-text-main">
                                ${a.teksArab} 
                                <span class="ayat-number-circle">${a.nomorAyat}</span>
                            </p>
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
        Swal.close();
    } catch (e) {
        Swal.fire("Waduh", "Gagal memuat ayat. Server mungkin sedang down.", "error");
    }
}

function navSurah(no) {
    const surah = allSurah.find(s => s.nomor === no);
    if (surah) loadAyat(surah.nomor, surah.namaLatin);
}

function toggleAudio() {
    const audio = document.getElementById('murottal');
    const btn = document.getElementById('btnPlay');
    if (audio.paused) {
        audio.play();
        btn.innerHTML = '<i class="fas fa-pause"></i> Berhentikan';
        btn.classList.add('is-playing');
    } else {
        audio.pause();
        btn.innerHTML = '<i class="fas fa-play"></i> Putar Murottal';
        btn.classList.remove('is-playing');
    }
}

function backToSurah() {
    // Matikan audio jika masih bunyi saat kembali
    const audio = document.getElementById('murottal');
    if(audio) audio.pause();
    
    document.getElementById('quranHeader').style.display = 'block';
    document.getElementById('surahList').style.display = 'block';
    document.getElementById('ayatView').style.display = 'none';
    window.scrollTo(0, 0);
}