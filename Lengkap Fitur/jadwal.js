let daftarKota = [], fuse, countdownInterval;

async function initJadwal() {
    try {
        const res = await fetch('https://api.myquran.com/v2/sholat/kota/semua');
        const d = await res.json();
        daftarKota = d.data;
        fuse = new Fuse(daftarKota, { keys: ['lokasi'], threshold: 0.4 });
        
        const lastId = localStorage.getItem('lastId');
        if(lastId) pilihKota(lastId, localStorage.getItem('lastNama'));
    } catch(e) { console.error("Gagal load kota"); }
}

// Fitur Pencarian Kota
document.getElementById('inputKota').addEventListener('input', function() {
    const list = document.getElementById('listKota');
    const clearBtn = document.getElementById('clearSearchKota'); 
    const val = this.value;

    if (clearBtn) clearBtn.style.display = val.length > 0 ? 'block' : 'none';
    if(val.length < 1) { list.style.display = 'none'; return; }

    const results = fuse.search(val);
    if (results.length > 0) {
        list.innerHTML = results.slice(0, 8).map((r, index) => {
            const label = index === 0 ? `<span style="color: var(--primary); font-weight: bold; margin-right: 5px;">Maksud anda:</span>` : '';
            return `
                <div class="autocomplete-item" onclick="pilihKota('${r.item.id}','${r.item.lokasi}')" style="display: flex; align-items: center; padding: 12px 15px; border-bottom: 1px solid var(--border); cursor: pointer;">
                    <i class="fas fa-map-marker-alt" style="margin-right:12px; color: #999;"></i>
                    <div style="color: var(--text); font-weight: 500;">${label}${r.item.lokasi}</div>
                </div>`;
        }).join('');
        list.style.display = 'block';
    } else {
        list.style.display = 'none';
    }
});

function clearInputKota() {
    const input = document.getElementById('inputKota');
    input.value = '';
    document.getElementById('listKota').style.display = 'none';
    if (document.getElementById('clearSearchKota')) document.getElementById('clearSearchKota').style.display = 'none';
    input.focus();
}

async function pilihKota(id, nama) {
    const input = document.getElementById('inputKota');
    if(input) input.value = nama;
    document.getElementById('listKota').style.display = 'none';
    
    localStorage.setItem('lastId', id);
    localStorage.setItem('lastNama', nama);

    const t = new Date();
    try {
        const res = await fetch(`https://api.myquran.com/v2/sholat/jadwal/${id}/${t.getFullYear()}/${t.getMonth()+1}/${t.getDate()}`);
        const d = await res.json();
        const j = d.data.jadwal;

        document.getElementById('resultBox').style.display = 'block';
        document.getElementById('resKota').innerText = nama;
        document.getElementById('resImsak').innerText = j.imsak;
        document.getElementById('vSu').innerText = j.subuh;
        document.getElementById('vDz').innerText = j.dzuhur;
        document.getElementById('vAs').innerText = j.ashar;
        document.getElementById('vMa').innerText = j.maghrib;
        document.getElementById('vIs').innerText = j.isya;

        startCountdown(j.imsak, j.maghrib);
    } catch (e) {
        console.error("Gagal mengambil jadwal");
    }
}

function startCountdown(imsakT, maghribT) {
    if(countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
        const now = new Date();
        const parse = (t) => { 
            const [h,m] = t.split(':'); 
            const d = new Date(); 
            d.setHours(h,m,0,0); 
            return d; 
        };
        
        const tImsak = parse(imsakT);
        const tMaghrib = parse(maghribT);
        let target, label;

        if(now < tImsak) { target = tImsak; label = "MENUJU IMSAK"; }
        else if(now < tMaghrib) { target = tMaghrib; label = "MENUJU BUKA PUASA"; }
        else { target = new Date(tImsak.getTime() + 86400000); label = "MENUJU IMSAK BESOK"; }

        const diff = target - now;
        const h = Math.floor(diff/3600000).toString().padStart(2,'0');
        const m = Math.floor((diff%3600000)/60000).toString().padStart(2,'0');
        const s = Math.floor((diff%60000)/1000).toString().padStart(2,'0');
        
        document.getElementById('labelCount').innerText = label;
        document.getElementById('textCount').innerText = `${h}:${m}:${s}`;
        
        if(diff < 1000 && label === "MENUJU BUKA PUASA") {
            const audio = document.getElementById('adzanAudio');
            if(audio) audio.play();
            if(document.getElementById('notifPopup')) document.getElementById('notifPopup').style.display = 'block';
        }
    }, 1000);
}

// GPS & Poster Function tetap sama (sesuai kodingan kamu sebelumnya)
function getLocation() { /* ... kode GPS kamu ... */ }
function resetGpsBtn() { /* ... kode Reset GPS kamu ... */ }
async function downloadPoster() { /* ... kode Poster kamu ... */ }

initJadwal();
