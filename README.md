# 🕌 LPTQ NTB TC Online — Pelatihan Tilawah

Aplikasi web (mirip Zoom) khusus untuk **Training Center (TC) Tilawah online LPTQ NTB**: ada **Pelatih (Host)** dan **Peserta TC** dengan tampilan & kontrol yang dibedakan. Bisa dibuka di **HP maupun laptop** lewat browser, **gratis**, tanpa perlu install dari Play Store.

## ✨ Fitur
- Login / daftar dengan **email + nama + sandi** (Mode Lokal; opsional Firebase agar tersinkron antar-perangkat)
- Peran **Pelatih** (buat sesi & dapat kode ruang) dan **Peserta** (gabung pakai kode)
- Video & audio call lewat **Jitsi Meet** (server publik gratis, tanpa batas waktu), sudah termasuk:
  - Kamera & pengaturan interface
  - **Spotlight / fokus 1 peserta** membaca
  - **Mute / unmute peserta** oleh pelatih (moderator)
  - Chat, angkat tangan, dan rekam sesi
- Tampilan responsif (HP + laptop), bisa "Install" sebagai aplikasi (PWA)

## 🔑 Kode Pelatih
Untuk mendaftar sebagai **Pelatih** dibutuhkan kode rahasia. Default: `TILAWAH2026`
(ubah di file `firebase-config.js` pada baris `window.KODE_PELATIH`).

## 🚀 Cara publikasi ke GitHub Pages (gratis, permanen)
1. Buat repository **baru & kosong** di https://github.com/new (mis. nama `ziee-tc-tilawah`, set **Public**, jangan centang "Add a README").
2. Di folder ini, jalankan (ganti `USERNAME` dengan username GitHub Anda):
   ```bash
   git remote add origin https://github.com/USERNAME/ziee-tc-tilawah.git
   git push -u origin main
   ```
3. Buka repo di GitHub → **Settings → Pages** → bagian *Build and deployment* → Source: **Deploy from a branch** → Branch: **main** / folder **/ (root)** → **Save**.
4. Tunggu ±1 menit. Aplikasi tayang di:
   `https://USERNAME.github.io/ziee-tc-tilawah/`

Bagikan link itu ke pelatih & peserta. Selesai! 🎉

## 💻 Menjalankan di komputer sendiri (uji lokal)
```bash
npx http-server . -p 8321 -c-1
```
Lalu buka `http://localhost:8321`.

## ☁️ (Opsional) Sinkron akun antar-perangkat dengan Firebase
Secara default aplikasi memakai **Mode Lokal** (akun tersimpan di masing-masing perangkat).
Agar satu akun bisa dipakai di HP & laptop, isi konfigurasi Firebase di `firebase-config.js`
(petunjuk lengkap ada di dalam file tersebut).
