import { useState, useEffect, useRef } from "react";
import { DAFTAR_KATA, KATA_VALID } from "./kata";
import Statistik from "./Statistik";
import { CaraBermain, StatistikRingkas } from "./Samping";
import "./App.css";

const PANJANG_KATA = 5;
const MAKS_TEBAKAN = 6;

// Pengaturan animasi flip. Samakan dengan CSS (animation: flip 0.6s ...)
const JEDA_KOTAK = 300;      // ms jeda antar kotak
const DURASI_ANIMASI = 600;  // ms durasi satu kotak
const DURASI_FLIP = (PANJANG_KATA - 1) * JEDA_KOTAK + DURASI_ANIMASI + 100; // total satu baris

const BARIS_KEYBOARD = [
  "QWERTYUIOP".split(""),
  "ASDFGHJKL".split(""),
  ["ENTER", ..."ZXCVBNM".split(""), "HAPUS"],
];

const KUNCI_STATISTIK = "statistik-tebak-kata";
const STATISTIK_AWAL = {
  main: 0,
  menang: 0,
  streak: 0,
  streakTerbaik: 0,
  distribusi: Array(MAKS_TEBAKAN).fill(0), // berapa kali menang di tebakan ke-1 s/d ke-6
};

function muatStatistik() {
  try {
    const data = JSON.parse(localStorage.getItem(KUNCI_STATISTIK));
    if (data && Array.isArray(data.distribusi)) {
      return { ...STATISTIK_AWAL, ...data };
    }
  } catch {
    // data rusak atau localStorage tidak tersedia, pakai nilai awal
  }
  return STATISTIK_AWAL;
}

function pilihKataAcak() {
  return DAFTAR_KATA[Math.floor(Math.random() * DAFTAR_KATA.length)];
}

function nilai(tebakan, jawaban) {
  const hasil = Array(PANJANG_KATA).fill("abu");
  const sisa = {};

  for (let i = 0; i < PANJANG_KATA; i++) {
    if (tebakan[i] === jawaban[i]) {
      hasil[i] = "hijau";
    } else {
      sisa[jawaban[i]] = (sisa[jawaban[i]] || 0) + 1;
    }
  }

  for (let i = 0; i < PANJANG_KATA; i++) {
    if (hasil[i] !== "hijau" && sisa[tebakan[i]] > 0) {
      hasil[i] = "kuning";
      sisa[tebakan[i]]--;
    }
  }

  return hasil;
}

// Status terbaik tiap huruf dari semua tebakan: hijau > kuning > abu
function statusHuruf(daftarTebakan, jawaban) {
  const prioritas = { abu: 1, kuning: 2, hijau: 3 };
  const status = {};
  daftarTebakan.forEach((kata) => {
    nilai(kata, jawaban).forEach((warna, i) => {
      const huruf = kata[i];
      if (!status[huruf] || prioritas[warna] > prioritas[status[huruf]]) {
        status[huruf] = warna;
      }
    });
  });
  return status;
}

const EMOJI = { hijau: "🟩", kuning: "🟨", abu: "⬛" };

function buatTeksBagikan(daftarTebakan, jawaban) {
  const menang = daftarTebakan[daftarTebakan.length - 1] === jawaban;
  const skor = menang ? daftarTebakan.length : "X";
  const grid = daftarTebakan
    .map((kata) => nilai(kata, jawaban).map((warna) => EMOJI[warna]).join(""))
    .join("\n");
  return `Tebak Kata ${skor}/${MAKS_TEBAKAN}\n\n${grid}`;
}

export default function App() {
  const [kataRahasia, setKataRahasia] = useState(pilihKataAcak);
  const [tebakan, setTebakan] = useState([]);
  const [tampil, setTampil] = useState(0); // jumlah tebakan yang animasi flip-nya sudah selesai
  const [input, setInput] = useState("");
  const [peringatan, setPeringatan] = useState("");
  const [goyang, setGoyang] = useState(false);
  const [tema, setTema] = useState(
    () =>
      localStorage.getItem("tema") ??
      (window.matchMedia("(prefers-color-scheme: light)").matches ? "terang" : "gelap")
  );
  const [stats, setStats] = useState(muatStatistik);
  const [modal, setModal] = useState(false);
  const timerFlip = useRef([]);

  const menang = tebakan[tebakan.length - 1] === kataRahasia;
  const kalah = !menang && tebakan.length >= MAKS_TEBAKAN;
  const selesai = menang || kalah;
  // hasil baru boleh diumumkan setelah semua animasi selesai
  const hasilTampil = selesai && tampil >= tebakan.length;
  const warnaKeyboard = statusHuruf(tebakan.slice(0, tampil), kataRahasia);
  const teksBagikan = hasilTampil ? buatTeksBagikan(tebakan, kataRahasia) : "";

  function goyangkan() {
    setGoyang(true);
    setTimeout(() => setGoyang(false), 500);
  }

  // dipanggil sekali saat game berakhir (setelah animasi selesai)
  function catatHasil(menangGame, jumlahTebakan) {
    setStats((prev) => {
      const baru = { ...prev, main: prev.main + 1 };
      if (menangGame) {
        baru.menang = prev.menang + 1;
        baru.streak = prev.streak + 1;
        baru.streakTerbaik = Math.max(prev.streakTerbaik, baru.streak);
        baru.distribusi = prev.distribusi.map((n, i) =>
          i === jumlahTebakan - 1 ? n + 1 : n
        );
      } else {
        baru.streak = 0;
      }
      return baru;
    });
    setModal(true);
  }

  // dipakai bersama oleh keyboard fisik dan keyboard virtual
  function tekan(tombol) {
    if (selesai || modal) return;
    setPeringatan("");

    if (tombol === "ENTER") {
      if (input.length < PANJANG_KATA) {
        setPeringatan("Huruf belum lengkap");
        goyangkan();
      } else if (!KATA_VALID.has(input)) {
        setPeringatan("Kata tidak ada di daftar");
        goyangkan();
      } else {
        const daftarBaru = [...tebakan, input];
        const menangSekarang = input === kataRahasia;
        const gameBerakhir = menangSekarang || daftarBaru.length >= MAKS_TEBAKAN;

        setTebakan(daftarBaru);
        setInput("");

        // setelah animasi baris ini selesai, munculkan warna keyboard dan hasilnya
        const id = setTimeout(() => {
          setTampil((n) => Math.max(n, daftarBaru.length));
          if (gameBerakhir) catatHasil(menangSekarang, daftarBaru.length);
        }, DURASI_FLIP);
        timerFlip.current.push(id);
      }
    } else if (tombol === "HAPUS") {
      setInput(input.slice(0, -1));
    } else if (input.length < PANJANG_KATA) {
      setInput(input + tombol);
    }
  }

  function mainLagi() {
    timerFlip.current.forEach(clearTimeout);
    timerFlip.current = [];
    setKataRahasia(pilihKataAcak());
    setTebakan([]);
    setTampil(0);
    setInput("");
    setPeringatan("");
  }

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Enter") tekan("ENTER");
      else if (e.key === "Backspace") tekan("HAPUS");
      else if (/^[a-zA-Z]$/.test(e.key)) tekan(e.key.toUpperCase());
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }); // tanpa dependency array: dipasang ulang tiap render, jadi selalu pakai state terbaru

  useEffect(() => {
    function geser(e) {
      document.documentElement.style.setProperty("--x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--y", `${e.clientY}px`);
    }
    window.addEventListener("mousemove", geser);
    return () => window.removeEventListener("mousemove", geser);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.tema = tema;
    localStorage.setItem("tema", tema);
  }, [tema]);

  // simpan statistik tiap kali berubah
  useEffect(() => {
    try {
      localStorage.setItem(KUNCI_STATISTIK, JSON.stringify(stats));
    } catch {
      // abaikan kalau penyimpanan penuh atau tidak tersedia
    }
  }, [stats]);

  return (
    <div className="game">
      <button
        className="tombol-statistik"
        aria-label="Lihat statistik"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setModal(true)}
      >
        📊
      </button>

      <button
        className="toggle-tema"
        aria-label="Ganti tema"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setTema(tema === "gelap" ? "terang" : "gelap")}
      >
        {tema === "gelap" ? "☀️" : "🌙"}
      </button>

      <CaraBermain />
      <StatistikRingkas stats={stats} />

      <h1>Tebak Kata</h1>

      <div className="papan">
        {Array.from({ length: MAKS_TEBAKAN }).map((_, baris) => {
          const sudahDikirim = baris < tebakan.length;
          const kata = tebakan[baris] ?? (baris === tebakan.length ? input : "");
          const warna = sudahDikirim ? nilai(kata, kataRahasia) : [];

          return (
            <div
              className={`baris ${baris === tebakan.length && goyang ? "goyang" : ""}`}
              key={baris}
            >
              {Array.from({ length: PANJANG_KATA }).map((_, kolom) => (
                <div
                  className={`kotak ${warna[kolom] ?? ""} ${
                    kata[kolom] && !sudahDikirim ? "terisi" : ""
                  }`}
                  style={{ "--delay": `${kolom * JEDA_KOTAK}ms` }}
                  key={kolom}
                >
                  {kata[kolom] ?? ""}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <p className="peringatan">{peringatan}</p>

      {hasilTampil && menang && <p className="pesan">Kamu menang! 🎉</p>}
      {hasilTampil && kalah && <p className="pesan">Kalah. Jawabannya: {kataRahasia}</p>}
      {hasilTampil && <button className="main-lagi" onClick={mainLagi}>Main Lagi</button>}

      <div className="keyboard">
        {BARIS_KEYBOARD.map((baris, i) => (
          <div className="baris-keyboard" key={i}>
            {baris.map((tombol) => (
              <button
                key={tombol}
                className={`tombol ${warnaKeyboard[tombol] ?? ""} ${tombol.length > 1 ? "lebar" : ""}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => tekan(tombol)}
              >
                {tombol}
              </button>
            ))}
          </div>
        ))}
      </div>

      {modal && (
        <Statistik
          stats={stats}
          tutup={() => setModal(false)}
          selesai={hasilTampil}
          mainLagi={mainLagi}
          teksBagikan={teksBagikan}
        />
      )}
    </div>
  );
}