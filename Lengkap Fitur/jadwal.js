let daftarKota = [], fuse, countdownInterval;

async function initJadwal() {
    try {
        const res = await fetch('https://api.myquran.com/v2/sholat/kota/semua');
        const d = await res.json();
        daftarKota = d.data;
        // Inisialisasi Fuse untuk pencarian yang lebih cerdas
        fuse = new Fuse(daftarKota, { keys: ['lokasi'], threshold: 0.4 });
        
        const lastId = localStorage.getItem('lastId');
        if(lastId) pilihKota(lastId, localStorage.getItem('lastNama'));
    } catch(e) { console.error("Gagal load kota"); }
}

// FIX: Pencarian Kota dengan fitur "Maksud Anda" jika typo
document.getElementById('inputKota').addEventListener('input', function() {
    const list = document.getElementById('listKota');
    const clearBtn = document.getElementById('clearSearchKota'); 
    const val = this.value;

    if (clearBtn) clearBtn.style.display = val.length > 0 ? 'block' : 'none';

    if(val.length < 1) { 
        list.style.display = 'none'; 
        return; 
    }

    const results = fuse.search(val);
    
    if (results.length > 0) {
        // Map hasil pencarian
        list.innerHTML = results.slice(0, 8).map((r, index) => {
            // Jika index 0 (paling atas), tambahkan teks "Maksud anda:"
            const label = index === 0 ? `<span style="color: var(--primary); font-weight: bold; margin-right: 5px;">Maksud anda:</span>` : '';
            
            return `
                <div class="autocomplete-item" onclick="pilihKota('${r.item.id}','${r.item.lokasi}')" style="display: flex; align-items: center; padding: 12px 15px; border-bottom: 1px solid var(--border); cursor: pointer;">
                    <i class="fas fa-map-marker-alt" style="margin-right:12px; color: #999;"></i>
                    <div style="color: var(--text); font-weight: 500;">
                        ${label}${r.item.lokasi}
                    </div>
                </div>
            `;
        }).join('');

        list.style.display = 'block';
    } else {
        list.style.display = 'none';
    }
});

const textShare = `Jadwal Imsakiyah ${nama}:\nImsak: ${j.imsak}\nSubuh: ${j.subuh}\nMaghrib: ${j.maghrib}\n\nCek Realtime: ${window.location.href}`;
        document.getElementById('waShare').href = `https://wa.me/?text=${encodeURIComponent(textShare)}`;

        startLogic(j.imsak, j.maghrib);

// FUNGSI FIX: Menghapus input dan menutup daftar (Fungsi untuk tombol X)
function clearInputKota() {
    const input = document.getElementById('inputKota');
    const list = document.getElementById('listKota');
    const clearBtn = document.getElementById('clearSearchKota');

    input.value = '';
    list.style.display = 'none';
    list.innerHTML = '';
    if (clearBtn) clearBtn.style.display = 'none';
    input.focus();
}

async function pilihKota(id, nama) {
    // Reset tampilan saat memilih
    const input = document.getElementById('inputKota');
    const list = document.getElementById('listKota');
    
    input.value = nama;
    list.style.display = 'none';
    
    // Simpan ke LocalStorage
    localStorage.setItem('lastId', id);
    localStorage.setItem('lastNama', nama);

    const t = new Date();
    try {
        const res = await fetch(`https://api.myquran.com/v2/sholat/jadwal/${id}/${t.getFullYear()}/${t.getMonth()+1}/${t.getDate()}`);
        const d = await res.json();
        const j = d.data.jadwal;

        // Update UI Jadwal
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

        if(now < tImsak) { 
            target = tImsak; 
            label = "MENUJU IMSAK"; 
        } else if(now < tMaghrib) { 
            target = tMaghrib; 
            label = "MENUJU BUKA PUASA"; 
        } else { 
            target = new Date(tImsak.getTime() + 86400000); 
            label = "MENUJU IMSAK BESOK"; 
        }

        const diff = target - now;
        const h = Math.floor(diff/3600000).toString().padStart(2,'0');
        const m = Math.floor((diff%3600000)/60000).toString().padStart(2,'0');
        const s = Math.floor((diff%60000)/1000).toString().padStart(2,'0');
        
        document.getElementById('labelCount').innerText = label;
        document.getElementById('textCount').innerText = `${h}:${m}:${s}`;
        
        // Trigger Adzan/Notif
        if(diff < 1000 && label === "MENUJU BUKA PUASA") {
            const audio = document.getElementById('adzanAudio');
            if(audio) audio.play();
            const notif = document.getElementById('notifPopup');
            if(notif) notif.style.display = 'block';
        }
    }, 1000);
}

// GPS LOGIC (Sudah termasuk Integrasi ke pilihKota)
function getLocation() {
    const btn = document.getElementById('btnGps');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mendeteksi...';

    navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        try {
            const res = await fetch(`https://api.myquran.com/v2/sholat/kota/lokasi/${lat}/${lon}`);
            const data = await res.json();
            
            if(data.status && data.data) {
                pilihKota(data.data.id, data.data.lokasi);
                Swal.fire({ title: 'Lokasi Ditemukan', text: data.data.lokasi, icon: 'success', timer: 1500, showConfirmButton: false });
            } else {
                // Fallback ke OpenStreetMap jika API MyQuran tidak menemukan ID Kota
                const osm = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                const resOsm = await osm.json();
                const namaWilayah = resOsm.address.city || resOsm.address.town || resOsm.address.county || "";
                
                if(namaWilayah) {
                    const hasilPencarian = fuse.search(namaWilayah);
                    if (hasilPencarian.length > 0) {
                        const kotaTerpilih = hasilPencarian[0].item;
                        pilihKota(kotaTerpilih.id, kotaTerpilih.lokasi);
                        Swal.fire({
                            title: "Lokasi Disesuaikan",
                            text: `Terdeteksi di ${namaWilayah}, disesuaikan ke ${kotaTerpilih.lokasi}`,
                            icon: "success",
                            timer: 2000,
                            showConfirmButton: false
                        });
                    } else { throw new Error(); }
                } else { throw new Error(); }
            }
        } catch (e) {
            Swal.fire("Info", "Gagal deteksi otomatis. Silakan pilih kota manual.", "warning");
        }
        resetGpsBtn();
    }, () => {
        Swal.fire("Gagal", "Akses GPS ditolak.", "error");
        resetGpsBtn();
    }, { timeout: 10000 });
}

function resetGpsBtn() {
    const btn = document.getElementById('btnGps');
    if(btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-location-arrow"></i> Deteksi Lokasi Otomatis';
    }
}

// Fitur Download Poster (Ramadhan 2026)
async function downloadPoster() {
    const id = localStorage.getItem('lastId');
    const nama = localStorage.getItem('lastNama');
    if (!id) return Swal.fire("Pilih Kota", "Pilih lokasi terlebih dahulu.", "warning");

    Swal.fire({ title: 'Menyusun Poster...', text: 'Mengolah data 30 hari', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
        const [resFeb, resMar] = await Promise.all([
            fetch(`https://api.myquran.com/v2/sholat/jadwal/${id}/2026/02`),
            fetch(`https://api.myquran.com/v2/sholat/jadwal/${id}/2026/03`)
        ]);
        
        const dataFeb = await resFeb.json();
        const dataMar = await resMar.json();
        const pBody = document.getElementById('pBody');
        
        document.getElementById('pKota').innerText = "KOTA/KAB. " + nama.toUpperCase();

        const semuaHari = [...dataFeb.data.jadwal, ...dataMar.data.jadwal];
        const jadwalRamadhan = semuaHari.filter(item => item.date >= "2026-02-18" && item.date <= "2026-03-19");

        pBody.innerHTML = jadwalRamadhan.map((d, i) => {
            const tgl = d.date.split('-').reverse().slice(0,2).join('/'); 
            return `<tr>
                <td>${i+1}</td>
                <td><b>${tgl}</b></td>
                <td style="color:#d32f2f">${d.imsak}</td>
                <td>${d.subuh}</td>
                <td>${d.dzuhur}</td>
                <td>${d.ashar}</td>
                <td style="background:#fff9c4">${d.maghrib}</td>
                <td>${d.isya}</td>
            </tr>`;
        }).join('');

        setTimeout(() => {
            html2canvas(document.querySelector("#poster-area"), { scale: 3, useCORS: true }).then(canvas => {
                const link = document.createElement('a');
                link.download = `Jadwal_Ramadhan_${nama.replace(/ /g,'_')}.png`;
                link.href = canvas.toDataURL();
                link.click();
                Swal.close();
            });
        }, 1000);
    } catch(e) { Swal.fire("Gagal", "Error mengambil data poster.", "error"); }
}

initJadwal();

