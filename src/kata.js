// Kata yang bisa jadi jawaban: kata umum yang dikenal banyak orang
const JAWABAN = [
  // rumah & benda
  "RUMAH", "KURSI", "PINTU", "LAMPU", "PAGAR", "DAPUR", "KAMAR", "KELAS", "SUMUR",
  "PISAU", "GARPU", "GELAS", "BOTOL", "KASUR", "KIPAS", "SABUN", "KUNCI", "MESIN",
  "JAKET", "EMBER", "KAPAL", "MOBIL", "BECAK",
  // alam
  "BUNGA", "BUKIT", "HUTAN", "JALAN", "TANAH", "UDARA", "DANAU", "PULAU", "KEBUN",
  "SAWAH", "HUJAN", "ANGIN", "BADAI", "PETIR", "BULAN", "PASIR", "KABUT", "GEMPA",
  // waktu
  "MALAM", "SIANG", "BESOK", "SENIN", "KAMIS", "JUMAT", "SABTU", "TAHUN", "DETIK",
  "MENIT", "WAKTU",
  // warna
  "MERAH", "PUTIH", "HITAM", "HIJAU",
  // orang & keluarga
  "TEMAN", "KAKAK", "NENEK", "KAKEK", "PAMAN", "MURID", "SUPIR",
  // tubuh
  "WAJAH", "MULUT", "LIDAH", "LEHER", "PERUT", "LUTUT", "DARAH", "KULIT",
  // makanan & minuman
  "BERAS", "GARAM", "JERUK", "TEMPE", "BAKSO", "BUBUR", "CABAI", "TOMAT", "TELUR",
  "MAKAN", "MINUM", "KECAP", "SAYUR", "MASAK",
  // hewan
  "BUAYA", "DOMBA", "ELANG", "GAJAH", "SINGA", "MACAN", "BEBEK", "ANGSA", "KODOK",
  "SEMUT", "LALAT", "LEBAH", "UDANG", "ZEBRA", "TIKUS",
  // sifat & keadaan
  "BESAR", "KECIL", "PANAS", "MURAH", "SUSAH", "BURUK", "CEPAT", "TEBAL", "TIPIS",
  "BERAT", "KERAS", "MANIS", "PAHIT", "PEDAS", "KOTOR", "INDAH", "BODOH", "RAJIN",
  "MALAS", "SEDIH", "MARAH", "TAKUT", "LAPAR", "LELAH", "SEHAT", "SAKIT", "LEMAH",
  "DEKAT", "SALAH", "BENAR", "MUDAH", "SULIT", "GELAP", "BASAH", "TAJAM", "BULAT",
  "LURUS", "GEMUK", "KURUS", "HEBAT", "BAGUS", "JUJUR", "DEMAM",
  // kegiatan
  "TIDUR", "DUDUK", "TULIS", "KERJA", "LIHAT", "TANYA", "JAWAB", "BAYAR", "AMBIL",
  "ANTAR", "KIRIM", "TUTUP", "TURUN", "MASUK", "MULAI", "MANDI", "PERGI",
  // hal abstrak & lainnya
  "CINTA", "BENCI", "RINDU", "MIMPI", "HIDUP", "AGAMA", "PASAR", "HARGA", "PAJAK",
  "TUGAS", "UJIAN", "NILAI", "TINTA", "MUSIK", "JUARA", "KALAH", "LAMPU",
  // sepak bola
  "WASIT", "KIPER", "SKUAD", "SEPAK", "PIALA",
];

// Kata tambahan: diterima sebagai tebakan, tapi tidak akan jadi jawaban
const TAMBAHAN = [
  "BUKAN", "MASIH", "BELUM", "SUDAH", "TIDAK", "KALAU", "BOLEH", "HARUS", "MAMPU",
  "SEBAB", "UNTUK", "SEMUA", "HANYA", "TERUS", "TIANG", "SEPUR", "ULANG", "LUKIS",
  "GERAK", "TARIK", "TUANG", "PENUH", "GARIS", "TITIK", "ANGKA", "HURUF", "SURAT",
  "KABAR", "PUISI", "NOVEL", "KOMIK", "NOMOR", "LAYAR", "KABEL", "JALUR", "SISIR",
  "BETIS", "TUMIT", "EMBUN", "SALJU", "SUNYI", "SEJUK", "LICIN", "KASAR", "HALUS",
  "DATAR", "TEGAK", "BOTAK", "KASIH", "SETIA", "JELEK", "BATUK", "PILEK", "RAMAI",
  "SIKAT", "KAMUS", "RAPOR", "PAKAI", "PAKAN", "BUKTI", "FAKTA", "SENJA", "SUBUH",
  "FAJAR", "PANAH", "DAMAI", "BELOK", "BIASA", "PALSU", "UTANG", "LUNAS", "BAKAT",
  "SENAM", "LARIS", "MINTA", "TOLAK", "BANTU", "BELAH", "RAJUT", "JAHIT", "BASUH",
  "TUNAI", "BAKAR", "BARAT", "TIMUR", "UTARA", "KOTAK",
];

// Pastikan semua kata huruf kapital, 5 huruf, tanpa duplikat. Yang bermasalah dilaporkan di Console.
function bersihkan(daftar, nama) {
  const hasil = new Set();
  daftar.forEach((kata) => {
    const k = kata.toUpperCase();
    if (!/^[A-Z]{5}$/.test(k)) {
      console.warn(`[${nama}] bukan 5 huruf, dilewati: ${kata}`);
    } else if (hasil.has(k)) {
      console.warn(`[${nama}] duplikat: ${k}`);
    } else {
      hasil.add(k);
    }
  });
  return [...hasil];
}

export const DAFTAR_KATA = bersihkan(JAWABAN, "JAWABAN");
export const KATA_VALID = new Set([...DAFTAR_KATA, ...bersihkan(TAMBAHAN, "TAMBAHAN")]);