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
// SERVER VIDEO (Jitsi Meet) — TANPA BATAS WAKTU
// ------------------------------------------------------------
// CATATAN: "meet.jit.si" (server resmi) MEMUTUS rapat setelah
// 5 menit bila tidak ada moderator yang login akun Google.
// Karena itu kita pakai server komunitas yang benar-benar bebas.
//
// Server pertama = utama. Sisanya cadangan otomatis bila yang
// utama sedang mati/tak bisa dijangkau.
//
// PENTING: semua peserta harus berada di SERVER YANG SAMA agar
// bisa saling bertemu. Karena itu server ikut ditulis di link
// undangan (&srv=...), jadi peserta otomatis mengikuti host.
// ============================================================
window.JITSI_SERVERS = [
  "meet.ffmuc.net",     // Freifunk München (Jerman) — utama, stabil
  "framatalk.org",      // Framasoft (Prancis) — cadangan 1
  "meet.mayfirst.org"   // May First (AS) — cadangan 2
];

// ============================================================
// 13 RUANGAN TC TETAP (tampil otomatis di SEMUA perangkat)
// ------------------------------------------------------------
// Ganti "TC Cabang 01" dst. dengan nama cabang asli LPTQ NTB.
// Kode boleh diganti (huruf/angka, diawali "TC-"). Kode inilah
// yang menjadi alamat ruangan — jangan ada yang kembar.
// ============================================================
window.RUANGAN_BAWAAN = [
  { judul: "TC Tilawah Al-Qur'an",        kode: "TC-TILAWAH" },
  { judul: "TC Tartil / Murottal",        kode: "TC-MUROTTAL" },
  { judul: "TC Tahfidz 1 Juz",            kode: "TC-TAHFIDZ1" },
  { judul: "TC Tahfidz 5 Juz",            kode: "TC-TAHFIDZ5" },
  { judul: "TC Tahfidz 10 Juz",           kode: "TC-TAHFIDZ10" },
  { judul: "TC Tahfidz 20 Juz",           kode: "TC-TAHFIDZ20" },
  { judul: "TC Tahfidz 30 Juz",           kode: "TC-TAHFIDZ30" },
  { judul: "TC Qira'at Sab'ah",           kode: "TC-QIRAAT" },
  { judul: "TC Tafsir Al-Qur'an",         kode: "TC-TAFSIR" },
  { judul: "TC Fahmil Qur'an",            kode: "TC-FAHMIL" },
  { judul: "TC Syarhil Qur'an",           kode: "TC-SYARHIL" },
  { judul: "TC Khattil Qur'an (Kaligrafi)", kode: "TC-KHAT" },
  { judul: "TC Karya Tulis Ilmiah Al-Qur'an", kode: "TC-KTIQ" }
];
