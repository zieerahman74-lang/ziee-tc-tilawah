/* ============================================================
   LPTQ NTB TC Online — Pelatihan Tilawah Online (mirip Zoom)
   - Login email + nama + sandi (Firebase, atau Mode Lokal)
   - Pelatih (Host) membuat sesi TC, peserta gabung dengan kode
   - Video call gratis via Jitsi Meet (tanpa batas waktu)
   - Host & peserta dibedakan: toolbar, mic awal, dan tanda peran
   ============================================================ */

var MODE_FIREBASE = !!window.FIREBASE_CONFIG;
var pengguna = null;      // { nama, email, peran }
var jitsiApi = null;
var db = null, auth = null;

/* ---------------- UTIL ---------------- */
function $(id) { return document.getElementById(id); }

function tampilLayar(nama) {
  ["layar-auth", "layar-dasbor", "layar-meeting"].forEach(function (l) {
    $(l).classList.toggle("aktif", l === nama);
  });
}

function pesanAuth(teks, sukses) {
  var p = $("auth-pesan");
  p.textContent = teks;
  p.className = "pesan " + (sukses ? "sukses" : "gagal");
}

function buatKode() {
  var huruf = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  var k = "";
  for (var i = 0; i < 6; i++) k += huruf[Math.floor(Math.random() * huruf.length)];
  return "TC-" + k;
}

async function hashSandi(sandi) {
  try {
    var data = new TextEncoder().encode("ziee-tc:" + sandi);
    var buf = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buf)).map(function (b) {
      return b.toString(16).padStart(2, "0");
    }).join("");
  } catch (e) {
    // fallback sederhana bila crypto.subtle tidak tersedia
    var h = 0, s = "ziee-tc:" + sandi;
    for (var i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; }
    return "x" + (h >>> 0).toString(16);
  }
}

function formatTanggal(tglStr) {
  if (!tglStr) return "-";
  var hari = ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  var bulan = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  var d = new Date(tglStr + "T00:00:00");
  if (isNaN(d)) return tglStr;
  return hari[d.getDay()] + ", " + d.getDate() + " " + bulan[d.getMonth()] + " " + d.getFullYear();
}

/* ---------------- PENYIMPANAN: MODE LOKAL ---------------- */
var Lokal = {
  ambilUsers: function () { return JSON.parse(localStorage.getItem("ztc_users") || "{}"); },
  simpanUsers: function (u) { localStorage.setItem("ztc_users", JSON.stringify(u)); },
  ambilSesi: function () { return JSON.parse(localStorage.getItem("ztc_sesi") || "[]"); },
  simpanSemuaSesi: function (s) { localStorage.setItem("ztc_sesi", JSON.stringify(s)); },

  daftar: async function (nama, email, sandi, peran) {
    var users = Lokal.ambilUsers();
    if (users[email]) throw new Error("Email sudah terdaftar. Silakan masuk.");
    users[email] = { nama: nama, hash: await hashSandi(sandi), peran: peran };
    Lokal.simpanUsers(users);
    return { nama: nama, email: email, peran: peran };
  },
  masuk: async function (email, sandi) {
    var users = Lokal.ambilUsers();
    var u = users[email];
    if (!u) throw new Error("Email belum terdaftar. Silakan daftar dulu.");
    if (u.hash !== await hashSandi(sandi)) throw new Error("Sandi salah.");
    return { nama: u.nama, email: email, peran: u.peran };
  },
  keluar: async function () {},

  tambahSesi: async function (sesi) {
    var s = Lokal.ambilSesi();
    s.push(sesi);
    Lokal.simpanSemuaSesi(s);
  },
  semuaSesi: async function () { return Lokal.ambilSesi(); },
  hapusSesi: async function (id) {
    Lokal.simpanSemuaSesi(Lokal.ambilSesi().filter(function (x) { return x.id !== id; }));
  }
};

/* ---------------- PENYIMPANAN: MODE FIREBASE ---------------- */
var Fb = {
  daftar: async function (nama, email, sandi, peran) {
    var kred = await auth.createUserWithEmailAndPassword(email, sandi);
    await kred.user.updateProfile({ displayName: nama });
    await db.collection("pengguna").doc(email).set({ nama: nama, peran: peran });
    return { nama: nama, email: email, peran: peran };
  },
  masuk: async function (email, sandi) {
    await auth.signInWithEmailAndPassword(email, sandi);
    var doc = await db.collection("pengguna").doc(email).get();
    var d = doc.exists ? doc.data() : {};
    return { nama: d.nama || email, email: email, peran: d.peran || "peserta" };
  },
  keluar: async function () { await auth.signOut(); },

  tambahSesi: async function (sesi) {
    await db.collection("sesi").doc(sesi.id).set(sesi);
  },
  semuaSesi: async function () {
    var snap = await db.collection("sesi").get();
    var arr = [];
    snap.forEach(function (d) { arr.push(d.data()); });
    return arr;
  },
  hapusSesi: async function (id) { await db.collection("sesi").doc(id).delete(); }
};

function Simpan() { return MODE_FIREBASE ? Fb : Lokal; }

function muatSkrip(src) {
  return new Promise(function (res, rej) {
    var s = document.createElement("script");
    s.src = src; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
}

async function siapkanFirebase() {
  var v = "10.12.2";
  await muatSkrip("https://www.gstatic.com/firebasejs/" + v + "/firebase-app-compat.js");
  await muatSkrip("https://www.gstatic.com/firebasejs/" + v + "/firebase-auth-compat.js");
  await muatSkrip("https://www.gstatic.com/firebasejs/" + v + "/firebase-firestore-compat.js");
  firebase.initializeApp(window.FIREBASE_CONFIG);
  auth = firebase.auth();
  db = firebase.firestore();
}

/* ---------------- AUTH UI ---------------- */
function pilihTab(mana) {
  $("tab-masuk").classList.toggle("aktif", mana === "masuk");
  $("tab-daftar").classList.toggle("aktif", mana === "daftar");
  $("form-masuk").classList.toggle("tersembunyi", mana !== "masuk");
  $("form-daftar").classList.toggle("tersembunyi", mana !== "daftar");
  pesanAuth("", true);
}

function gantiPeranDaftar() {
  var p = $("daftar-peran").value;
  $("wadah-kode-pelatih").classList.toggle("tersembunyi", p === "peserta");
  $("label-kode-khusus").textContent = p === "admin" ? "Kode Admin" : "Kode Pelatih";
}

async function prosesDaftar(e) {
  e.preventDefault();
  var nama = $("daftar-nama").value.trim();
  var email = $("daftar-email").value.trim().toLowerCase();
  var sandi = $("daftar-sandi").value;
  var peran = $("daftar-peran").value;
  var kodeKhusus = $("daftar-kode-pelatih").value.trim();

  if (peran === "pelatih" && kodeKhusus !== window.KODE_PELATIH) {
    pesanAuth("Kode Pelatih salah. Minta kode ke admin, atau daftar sebagai peserta.", false);
    return;
  }
  if (peran === "admin" && kodeKhusus !== window.KODE_ADMIN) {
    pesanAuth("Kode Admin salah.", false);
    return;
  }

  try {
    pengguna = await Simpan().daftar(nama, email, sandi, peran);
    sessionStorage.setItem("ztc_login", JSON.stringify(pengguna));
    pesanAuth("Pendaftaran berhasil!", true);
    bukaDasbor();
  } catch (err) {
    pesanAuth(terjemahError(err), false);
  }
}

async function prosesMasuk(e) {
  e.preventDefault();
  var email = $("masuk-email").value.trim().toLowerCase();
  var sandi = $("masuk-sandi").value;
  try {
    pengguna = await Simpan().masuk(email, sandi);
    sessionStorage.setItem("ztc_login", JSON.stringify(pengguna));
    bukaDasbor();
  } catch (err) {
    pesanAuth(terjemahError(err), false);
  }
}

function terjemahError(err) {
  var k = (err && err.code) || "";
  if (k.indexOf("email-already-in-use") >= 0) return "Email sudah terdaftar. Silakan masuk.";
  if (k.indexOf("invalid-credential") >= 0 || k.indexOf("wrong-password") >= 0) return "Email atau sandi salah.";
  if (k.indexOf("user-not-found") >= 0) return "Email belum terdaftar. Silakan daftar dulu.";
  if (k.indexOf("weak-password") >= 0) return "Sandi terlalu pendek (minimal 6 karakter).";
  if (k.indexOf("network") >= 0) return "Gangguan jaringan. Periksa internet Anda.";
  return err.message || "Terjadi kesalahan. Coba lagi.";
}

async function keluar() {
  try { await Simpan().keluar(); } catch (e) {}
  sessionStorage.removeItem("ztc_login");
  pengguna = null;
  $("form-masuk").reset();
  $("form-daftar").reset();
  pilihTab("masuk");
  tampilLayar("layar-auth");
}

/* ---------------- DASBOR ---------------- */
function bukaDasbor() {
  var labelPeran = { admin: "🛡️ Admin", pelatih: "🎓 Pelatih (Host)", peserta: "🧕 Peserta TC" };
  $("dasbor-nama").textContent = pengguna.nama;
  $("dasbor-peran").textContent = labelPeran[pengguna.peran] || "🧕 Peserta TC";
  $("bagian-pelatih").classList.toggle("tersembunyi", pengguna.peran !== "admin");
  tampilLayar("layar-dasbor");
  muatDaftarSesi();

  // Datang lewat link undangan? Langsung masukkan ke ruang sesi.
  if (kodeUndangan) {
    var k = kodeUndangan;
    kodeUndangan = null;
    history.replaceState(null, "", location.pathname);
    mulaiMeeting(k, "Sesi TC Tilawah");
  }
}

function ruanganBawaan() {
  return (window.RUANGAN_BAWAAN || []).map(function (r, i) {
    return { id: "bawaan-" + i, judul: r.judul, kode: r.kode, pembuatNama: "Admin LPTQ NTB", bawaan: true };
  });
}

async function muatDaftarSesi() {
  var wadah = $("daftar-sesi");
  wadah.innerHTML = '<p class="ket">Memuat…</p>';
  var sesi = [];
  try { sesi = await Simpan().semuaSesi(); } catch (e) {
    wadah.innerHTML = '<p class="ket">Gagal memuat jadwal: ' + e.message + "</p>";
    return;
  }
  sesi = ruanganBawaan().concat(sesi);
  sesi.sort(function (a, b) { return (a.judul || "").localeCompare(b.judul || ""); });

  if (!sesi.length) {
    wadah.innerHTML = '<p class="ket">' +
      (pengguna.peran === "admin"
        ? "Belum ada ruangan. Buat ruangan TC untuk tiap cabang di atas."
        : "Gunakan <b>link atau kode ruangan dari admin</b> cabang Anda (daftar ruangan hanya tampil di perangkat admin).") + "</p>";
    return;
  }

  wadah.innerHTML = "";
  sesi.forEach(function (s) {
    var div = document.createElement("div");
    div.className = "item-sesi";
    var adminKah = pengguna.peran === "admin" && !s.bawaan; // ruangan bawaan tidak bisa dihapus
    div.innerHTML =
      '<div class="info">' +
        '<div class="judul"></div>' +
        '<div class="detail">Kode: <span class="kode">' + s.kode + "</span> · 👤 Dibuat: <span class='pembuat'></span></div>" +
      "</div>" +
      '<div class="aksi">' +
        '<button class="tombol kecil emas btn-masuk">Masuk</button>' +
        '<button class="tombol kecil abu btn-undang">Salin Undangan</button>' +
        (adminKah ? '<button class="tombol kecil merah btn-hapus">Hapus</button>' : "") +
      "</div>";
    div.querySelector(".judul").textContent = s.judul;
    div.querySelector(".pembuat").textContent = s.pembuatNama || "-";
    div.querySelector(".btn-masuk").onclick = function () { mulaiMeeting(s.kode, s.judul); };
    div.querySelector(".btn-undang").onclick = function () { salinUndangan(s.kode, s.judul); };
    if (adminKah) {
      div.querySelector(".btn-hapus").onclick = async function () {
        if (!confirm('Hapus ruangan "' + s.judul + '"?')) return;
        await Simpan().hapusSesi(s.id);
        muatDaftarSesi();
      };
    }
    wadah.appendChild(div);
  });
}

async function buatSesi(e) {
  e.preventDefault();
  var kodeCustom = $("ruang-kode").value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  var kode = kodeCustom ? "TC-" + kodeCustom : buatKode();

  // Cegah kode kembar (termasuk 13 ruangan bawaan)
  var sudahAda = ruanganBawaan();
  try { sudahAda = sudahAda.concat(await Simpan().semuaSesi()); } catch (err) {}
  if (sudahAda.some(function (x) { return x.kode === kode; })) {
    alert("Kode " + kode + " sudah dipakai ruangan lain. Gunakan kode khusus yang berbeda.");
    return;
  }

  var sesi = {
    id: "s" + Date.now(),
    judul: $("sesi-judul").value.trim(),
    kode: kode,
    pembuatEmail: pengguna.email,
    pembuatNama: pengguna.nama
  };
  try {
    await Simpan().tambahSesi(sesi);
    e.target.reset();
    muatDaftarSesi();
    alert("Ruangan dibuat!\n\n" + sesi.judul +
      "\nKode: " + sesi.kode +
      "\nLink: " + location.origin + location.pathname + "?kode=" + sesi.kode +
      "\n\nKlik \"Salin Undangan\" di daftar ruangan, lalu kirim ke pelatih & peserta cabang tersebut lewat WA.");
  } catch (err) {
    alert("Gagal membuat ruangan: " + err.message);
  }
}

function salinUndangan(kode, judul) {
  var link = location.origin + location.pathname + "?kode=" + kode;
  var teks = "Undangan " + (judul || "Sesi TC Tilawah") + " — LPTQ NTB TC Online\n" +
    "Kode ruangan: " + kode + "\n" +
    "Klik untuk gabung: " + link + "\n" +
    "(Masuk/daftar dulu, setelah itu otomatis masuk ruangan)";
  function beres() { alert("Undangan \"" + (judul || kode) + "\" disalin!\nTempel & kirim lewat WA ke pelatih dan peserta cabang tersebut."); }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(teks).then(beres, function () { prompt("Salin undangan ini:", teks); });
  } else {
    prompt("Salin undangan ini:", teks);
  }
}

function gabungDenganKode(e) {
  e.preventDefault();
  var kode = $("input-kode").value.trim().toUpperCase();
  if (!kode) return;
  if (kode.indexOf("TC-") !== 0) kode = "TC-" + kode;
  mulaiMeeting(kode, "Sesi TC Tilawah");
}

/* ---------------- MEETING (JITSI) ---------------- */
var kodeAktif = "";
var kodeUndangan = null;   // kode dari link undangan (?kode=TC-XXXXXX)

// Server Jitsi bebas-batas-waktu (bisa diganti di firebase-config.js)
var JITSI_SERVER = window.JITSI_SERVER || "meet.ffmuc.net";
var jitsiSiap = null; // promise pemuatan external_api.js

function siapkanJitsi() {
  if (!jitsiSiap) {
    jitsiSiap = (typeof JitsiMeetExternalAPI !== "undefined")
      ? Promise.resolve()
      : muatSkrip("https://" + JITSI_SERVER + "/external_api.js");
  }
  return jitsiSiap;
}

async function mulaiMeeting(kode, judul) {
  kodeAktif = kode;
  var adalahHost = pengguna.peran === "pelatih" || pengguna.peran === "admin";

  try {
    await siapkanJitsi();
  } catch (e) {
    alert("Gagal memuat mesin video dari " + JITSI_SERVER + ".\nPeriksa koneksi internet lalu coba lagi.");
    return;
  }

  $("meeting-judul").textContent = judul || "Sesi TC";
  $("meeting-kode").textContent = "Kode ruang: " + kode;
  var badge = $("meeting-peran");
  badge.textContent = pengguna.peran === "admin" ? "🛡️ ADMIN — Pengelola"
    : (adalahHost ? "🎓 HOST — Pelatih" : "🧕 Peserta TC");
  badge.className = "badge-peran " + (adalahHost ? "host" : "peserta");
  tampilLayar("layar-meeting");

  // Host (pelatih) mendapat toolbar lengkap moderator;
  // peserta hanya tombol dasar agar sesi tetap tertib.
  var tombolHost = [
    "microphone", "camera", "desktop", "chat", "raisehand",
    "participants-pane", "tileview", "toggle-camera", "settings",
    "mute-everyone", "mute-video-everyone", "recording",
    "security", "invite", "fullscreen", "hangup"
  ];
  var tombolPeserta = [
    "microphone", "camera", "chat", "raisehand",
    "tileview", "toggle-camera", "settings", "fullscreen", "hangup"
  ];

  var namaRuang = "LPTQNTBTC-" + kode.replace(/[^A-Za-z0-9]/g, "");
  jitsiApi = new JitsiMeetExternalAPI(JITSI_SERVER, {
    roomName: namaRuang,
    parentNode: $("wadah-jitsi"),
    lang: "id",
    userInfo: { displayName: pengguna.nama + (pengguna.peran === "admin" ? " 🛡️ (Admin)" : adalahHost ? " 🎓 (Pelatih/Host)" : " (Peserta)"), email: pengguna.email },
    configOverwrite: {
      prejoinConfig: { enabled: true },
      startWithAudioMuted: !adalahHost,   // peserta masuk dengan mic senyap
      disableDeepLinking: true,
      subject: (judul || "Sesi TC Tilawah") + " — LPTQ NTB",
      toolbarButtons: adalahHost ? tombolHost : tombolPeserta
    },
    interfaceConfigOverwrite: {
      SHOW_JITSI_WATERMARK: false,
      MOBILE_APP_PROMO: false
    }
  });

  jitsiApi.addListener("readyToClose", tinggalkanMeeting);
}

function tinggalkanMeeting() {
  if (jitsiApi) { try { jitsiApi.dispose(); } catch (e) {} jitsiApi = null; }
  $("wadah-jitsi").innerHTML = "";
  bukaDasbor();
}

function salinKode() {
  salinUndangan(kodeAktif, $("meeting-judul").textContent);
}

/* ---------------- MULAI ---------------- */
(async function init() {
  $("mode-info").textContent = MODE_FIREBASE
    ? "☁️ Mode Online (Firebase) — akun & jadwal tersinkron di semua perangkat."
    : "📱 Mode Lokal — akun & jadwal tersimpan di perangkat ini. Video call tetap online: cukup bagikan kode ruang.";

  if (MODE_FIREBASE) {
    try { await siapkanFirebase(); }
    catch (e) {
      MODE_FIREBASE = false;
      $("mode-info").textContent = "⚠️ Firebase gagal dimuat — beralih ke Mode Lokal.";
    }
  }

  // Muat mesin video lebih awal supaya masuk ruang terasa cepat
  siapkanJitsi().catch(function () { jitsiSiap = null; });

  // Link undangan: https://.../?kode=TC-XXXXXX
  var paramKode = new URLSearchParams(location.search).get("kode");
  if (paramKode) {
    kodeUndangan = paramKode.trim().toUpperCase();
    if (kodeUndangan.indexOf("TC-") !== 0) kodeUndangan = "TC-" + kodeUndangan;
  }

  var tersimpan = sessionStorage.getItem("ztc_login");
  if (tersimpan) {
    pengguna = JSON.parse(tersimpan);
    bukaDasbor();
  } else {
    tampilLayar("layar-auth");
    if (kodeUndangan) {
      pesanAuth("Anda diundang ke sesi " + kodeUndangan + ". Silakan Masuk atau Daftar dulu — setelah itu otomatis masuk ruang.", true);
    }
  }
})();
