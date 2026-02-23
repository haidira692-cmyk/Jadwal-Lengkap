let qiblaAngle = 295; 
let isVibrating = false;

function initKiblat() {
    const status = document.getElementById('angleText');
    status.innerText = "Mendeteksi Lokasi...";

    // 1. Ambil Lokasi untuk hitung sudut kiblat
    navigator.geolocation.getCurrentPosition(pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        
        const latK = 21.4225 * Math.PI/180;
        const lngK = 39.8262 * Math.PI/180;
        const latP = lat * Math.PI/180;
        const lngP = lng * Math.PI/180;

        const y = Math.sin(lngK - lngP);
        const x = Math.cos(latP) * Math.tan(latK) - Math.sin(latP) * Math.cos(lngK - lngP);
        qiblaAngle = Math.atan2(y, x) * 180 / Math.PI;
        if(qiblaAngle < 0) qiblaAngle += 360;

        status.innerHTML = `Sudut Kiblat: <b>${Math.round(qiblaAngle)}°</b>`;
        
        // 2. Minta Izin Sensor Magnetometer (Penting untuk iOS)
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(response => {
                    if (response == 'granted') {
                        startCompass();
                    } else {
                        alert("Izin sensor ditolak.");
                    }
                })
                .catch(console.error);
        } else {
            startCompass(); // Untuk Android / Browser Desktop
        }
    }, () => {
        status.innerText = "Gagal akses GPS.";
    });
}

function startCompass() {
    // Gunakan event 'deviceorientationabsolute' agar lebih akurat terhadap utara sejati
    if ('ondeviceorientationabsolute' in window) {
        window.addEventListener('deviceorientationabsolute', handleCompass);
    } else {
        window.addEventListener('deviceorientation', handleCompass);
    }
}

function handleCompass(e) {
    let alpha = e.alpha; // Nilai mentah dari sensor
    let heading = 0;

    // 1. Deteksi Heading (Arah Utara)
    if (e.webkitCompassHeading) {
        // Khusus iOS (Sudah mengarah ke utara sejati)
        heading = e.webkitCompassHeading;
    } else if (e.absolute || e.type === 'deviceorientationabsolute') {
        // Android / Browser yang mendukung orientasi absolut
        heading = 360 - alpha;
    } else {
        // Laptop biasanya masuk ke sini (heading tetap 0 karena sensor tidak ada)
        heading = alpha; 
    }

    if (heading !== null) {
        const compass = document.getElementById('compassImg');
        
        /* RUMUS:
           - heading: arah HP sekarang terhadap utara
           - qiblaAngle: arah Ka'bah terhadap utara
           Agar jarum/piringan menunjuk ke Ka'bah di posisi 'Atas' (0°), 
           maka rotasi adalah selisihnya.
        */
        const rotation = qiblaAngle - heading;
        
        // Gunakan transisi smooth agar tidak patah-patah
        compass.style.transform = `rotate(${rotation}deg)`;

        // 2. Logika Getar & Indikator (Tepat di sudut 0 derajat)
        // Kita normalize sudut agar berada di rentang 0-360
        const normalizedRotation = (rotation % 360 + 360) % 360;
        
        // Jika sudut mendekati 0 atau 360 (artinya mengarah tepat ke Ka'bah)
        if (normalizedRotation < 3 || normalizedRotation > 357) {
            if (!isVibrating) {
                if (navigator.vibrate) navigator.vibrate(50);
                isVibrating = true;
                document.querySelector('.kaaba-mark').style.filter = "drop-shadow(0 0 10px #e63946) brightness(1.5)";
            }
        } else {
            isVibrating = false;
            document.querySelector('.kaaba-mark').style.filter = "none";
        }
    }
}