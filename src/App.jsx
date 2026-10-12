import { useState, useEffect } from "react";
import { DAFTAR_KATA, KATA_VALID } from "./kata";
import "./App.css";

const PANJANG_KATA = 5;
const MAKS_TEBAKAN = 6;
const BARIS_KEYBOARD = [
  "QWERTYUIOP".split(""),
  "ASDFGHJKL".split(""),
  ["ENTER", ..."ZXCVBNM".split(""), "HAPUS"],
];

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

export default function App() {
  const [kataRahasia, setKataRahasia] = useState(pilihKataAcak);
  const [tebakan, setTebakan] = useState([]);
  const [input, setInput] = useState("");
  const [peringatan, setPeringatan] = useState("");
  const [goyang, setGoyang] = useState(false);

  const menang = tebakan[tebakan.length - 1] === kataRahasia;
  const kalah = !menang && tebakan.length >= MAKS_TEBAKAN;
  const selesai = menang || kalah;
  const warnaKeyboard = statusHuruf(tebakan, kataRahasia);

  function goyangkan() {
    setGoyang(true);
    setTimeout(() => setGoyang(false), 500);
  }

  // dipakai bersama oleh keyboard fisik dan keyboard virtual
  function tekan(tombol) {
    if (selesai) return;
    setPeringatan("");

    if (tombol === "ENTER") {
      if (input.length < PANJANG_KATA) {
        setPeringatan("Huruf belum lengkap");
        goyangkan();
      } else if (!KATA_VALID.has(input)) {
        setPeringatan("Kata tidak ada di daftar");
        goyangkan();
      } else {
        setTebakan([...tebakan, input]);
        setInput("");
      }
    } else if (tombol === "HAPUS") {
      setInput(input.slice(0, -1));
    } else if (input.length < PANJANG_KATA) {
      setInput(input + tombol);
    }
  }

  function mainLagi() {
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

  return (
    <div className="game">
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
                  style={{ "--delay": `${kolom * 150}ms` }}
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
      {selesai && <button className="main-lagi" onClick={mainLagi}>Main Lagi</button>}

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
    </div>
  );
}