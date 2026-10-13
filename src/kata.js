export const DAFTAR_KATA = [
  "BUNGA", "KURSI", "SUSAH", "MURAH", "PAGAR", "RUMAH", "BUKIT", "HUTAN",
  "JALAN", "KAPAL", "LAMPU", "MALAM", "PANAS", "TEMAN", "BERAS", "DAPUR",
  "GARAM", "KAKAK", "PINTU", "SENIN", "TANAH", "UDARA", "WAKTU",
];

// kata valid untuk ditebak, tapi tidak akan jadi jawaban
const KATA_TAMBAHAN = [
  "BUKAN", "MASIH", "BELUM", "SAYUR", "BAKSO", "SEPUR", "TIKUS", "TIANG",
  "BESAR", "KECIL", "PUTIH", "HITAM", "MERAH", "BIRUU", "PAGIH", "SIANG",
  "MASAK", "MINUM", "MANDI", "BAKSO", "ULANG", "PERGI", "DEMAM", "BULAN",
].filter((k) => k.length === 5);

export const KATA_VALID = new Set([...DAFTAR_KATA, ...KATA_TAMBAHAN]);