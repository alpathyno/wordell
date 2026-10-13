import { useState, useEffect, useRef } from "react";
import { DAFTAR_KATA, KATA_VALID } from "./kata";
import { CaraBermain, StatistikRingkas } from "./Samping";
import Statistik from "./Statistik";
import "./App.css";

const PANJANG_KATA = 5;
const MAKS_TEBAKAN = 6;
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
    .map((kata) =>
      nilai(kata, jawaban)
        .map((warna) => EMOJI[warna])
        .join(""),
    )
    .join("\n");
  return `Tebak Kata ${skor}/${MAKS_TEBAKAN}\n\n${grid}`;
}

export default function App() {
  const [kataRahasia, setKataRahasia] = useState(pilihKataAcak);
  const [tebakan, setTebakan] = useState([]);
  const [input, setInput] = useState("");
  const [peringatan, setPeringatan] = useState("");
  const [goyang, setGoyang] = useState(false);
  const [tema, setTema] = useState(
    () =>
      localStorage.getItem("tema") ??
      (window.matchMedia("(prefers-color-scheme: light)").matches
        ? "terang"
        : "gelap"),
  );
  const [stats, setStats] = useState(muatStatistik);
  const [modal, setModal] = useState(false);
  const timerModal = useRef(null);

  const menang = tebakan[tebakan.length - 1] === kataRahasia;
  const kalah = !menang && tebakan.length >= MAKS_TEBAKAN;
  const selesai = menang || kalah;
  const warnaKeyboard = statusHuruf(tebakan, kataRahasia);
  const teksBagikan = selesai ? buatTeksBagikan(tebakan, kataRahasia) : "";

  function goyangkan() {
    setGoyang(true);
    setTimeout(() => setGoyang(false), 500);
  }

  // dipanggil sekali saat game berakhir
  function catatHasil(menangGame, jumlahTebakan) {
    setStats((prev) => {
      const baru = { ...prev, main: prev.main + 1 };
      if (menangGame) {
        baru.menang = prev.menang + 1;
        baru.streak = prev.streak + 1;
        baru.streakTerbaik = Math.max(prev.streakTerbaik, baru.streak);
        baru.distribusi = prev.distribusi.map((n, i) =>
          i === jumlahTebakan - 1 ? n + 1 : n,
        );
      } else {
        baru.streak = 0;
      }
      return baru;
    });
    // tunggu animasi flip selesai baru tampilkan modal
    timerModal.current = setTimeout(() => setModal(true), 1800);
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
        setTebakan(daftarBaru);
        setInput("");

        const menangSekarang = input === kataRahasia;
        if (menangSekarang || daftarBaru.length >= MAKS_TEBAKAN) {
          catatHasil(menangSekarang, daftarBaru.length);
        }
      }
    } else if (tombol === "HAPUS") {
      setInput(input.slice(0, -1));
    } else if (input.length < PANJANG_KATA) {
      setInput(input + tombol);
    }
  }

  function mainLagi() {
    clearTimeout(timerModal.current);
    setKataRahasia(pilihKataAcak());
    setTebakan([]);
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
          const kata =
            tebakan[baris] ?? (baris === tebakan.length ? input : "");
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
                  style={{ "--delay": `${kolom * 300}ms` }}
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

      {menang && <p className="pesan">Kamu menang! 🎉</p>}
      {kalah && <p className="pesan">Kalah. Jawabannya: {kataRahasia}</p>}
      {selesai && (
        <button className="main-lagi" onClick={mainLagi}>
          Main Lagi
        </button>
      )}

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
          selesai={selesai}
          mainLagi={mainLagi}
          teksBagikan={teksBagikan}
        />
      )}
    </div>
  );
}
