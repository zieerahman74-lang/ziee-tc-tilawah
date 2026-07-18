// ============================================================
// KONFIGURASI FIREBASE (OPSIONAL)
// ------------------------------------------------------------
// Tanpa diisi: aplikasi tetap jalan dalam MODE LOKAL
//   (akun tersimpan di perangkat masing-masing; video call
//    tetap online lintas perangkat lewat kode ruang).
//
// Supaya akun & jadwal sesi tersinkron di SEMUA perangkat:
// 1. Buka https://console.firebase.google.com (gratis)
// 2. Buat proyek baru -> tambahkan "Web app"
// 3. Aktifkan Authentication -> Email/Password
// 4. Aktifkan Cloud Firestore (mode production, atur rules)
// 5. Salin objek firebaseConfig dari Firebase ke bawah ini
// ============================================================

window.FIREBASE_CONFIG = null;

// Contoh (ganti null di atas dengan objek seperti ini):
// window.FIREBASE_CONFIG = {
//   apiKey: "AIza...",
//   authDomain: "proyek-anda.firebaseapp.com",
//   projectId: "proyek-anda",
//   storageBucket: "proyek-anda.appspot.com",
//   messagingSenderId: "123456789",
//   appId: "1:123456789:web:abcdef"
// };

// Kode rahasia untuk mendaftar sebagai PELATIH (ubah sesuka Anda):
window.KODE_PELATIH = "TILAWAH2026";

// Kode rahasia untuk mendaftar sebagai ADMIN (pembuat ruangan TC):
window.KODE_ADMIN = "ADMINLPTQ2026";

// ============================================================
// SERVER VIDEO (Jitsi Meet)
// ------------------------------------------------------------
// "meet.jit.si" resmi tapi MEMBATASI 5 MENIT tanpa login Google.
// Pakai server publik gratis tanpa batas waktu, mis.:
//   "meet.ffmuc.net"  (Freifunk Muenchen, Jerman — stabil & bebas)
// Bila server penuh/bermasalah, cukup ganti nilai di bawah ini.
// ============================================================
window.JITSI_SERVER = "meet.ffmuc.net";
