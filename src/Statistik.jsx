import { useState } from "react";

export default function Statistik({ stats, tutup, selesai, mainLagi, teksBagikan }) {
  const [status, setStatus] = useState("");
  const persen = stats.main ? Math.round((stats.menang / stats.main) * 100) : 0;
  const maks = Math.max(...stats.distribusi, 1);

  async function bagikan() {
    try {
      await navigator.clipboard.writeText(teksBagikan);
      setStatus("Tersalin! Tempel ke chat temanmu 📋");
    } catch {
      setStatus("Gagal menyalin, salin manual dari kotak di atas");
    }
    setTimeout(() => setStatus(""), 2500);
  }

  return (
    <div className="overlay" onClick={tutup}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="tutup"
          aria-label="Tutup"
          onMouseDown={(e) => e.preventDefault()}
          onClick={tutup}
        >
          ✕
        </button>

        <h2>Statistik</h2>

        <div className="angka">
          <div><strong>{stats.main}</strong><span>Main</span></div>
          <div><strong>{persen}%</strong><span>Menang</span></div>
          <div><strong>{stats.streak}</strong><span>Streak</span></div>
          <div><strong>{stats.streakTerbaik}</strong><span>Terbaik</span></div>
        </div>

        <h3>Menang di tebakan ke-</h3>
        {stats.distribusi.map((n, i) => (
          <div className="batang-baris" key={i}>
            <span>{i + 1}</span>
            <div
              className={`batang ${n > 0 ? "ada" : ""}`}
              style={{ width: `${Math.max((n / maks) * 100, 8)}%` }}
            >
              {n}
            </div>
          </div>
        ))}

        {selesai && (
          <>
            <pre className="cuplikan">{teksBagikan}</pre>
            <button
              className="bagikan"
              onMouseDown={(e) => e.preventDefault()}
              onClick={bagikan}
            >
              Bagikan
            </button>
            <p className="status-salin">{status}</p>

            <button
              className="main-lagi"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                tutup();
                mainLagi();
              }}
            >
              Main Lagi
            </button>
          </>
        )}
      </div>
    </div>
  );
}