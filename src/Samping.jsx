export function CaraBermain() {
  return (
    <aside className="samping kiri">
      <h2>Cara Bermain</h2>
      <ul>
        <li>Tebak kata 5 huruf dalam 6 kesempatan.</li>
        <li>Tiap tebakan harus kata yang valid.</li>
        <li>Warna kotak menunjukkan seberapa dekat tebakanmu.</li>
      </ul>

      <div className="contoh">
        <div className="contoh-kotak hijau">K</div>
        <span>Huruf benar, posisi benar</span>
      </div>
      <div className="contoh">
        <div className="contoh-kotak kuning">A</div>
        <span>Huruf ada, tapi posisinya salah</span>
      </div>
      <div className="contoh">
        <div className="contoh-kotak abu">B</div>
        <span>Huruf tidak ada di kata ini</span>
      </div>
    </aside>
  );
}

export function StatistikRingkas({ stats }) {
  const persen = stats.main ? Math.round((stats.menang / stats.main) * 100) : 0;

  let pesan;
  if (stats.main === 0) pesan = "Belum ada permainan. Ayo mulai!";
  else if (stats.streak >= 3) pesan = `Streak ${stats.streak}, jangan sampai putus! 🔥`;
  else if (stats.streak > 0) pesan = "Bagus, pertahankan!";
  else pesan = "Mulai streak barumu sekarang.";

  return (
    <aside className="samping kanan">
      <h2>Statistikmu</h2>
      <div className="ringkas">
        <div><strong>{stats.main}</strong><span>Main</span></div>
        <div><strong>{persen}%</strong><span>Menang</span></div>
        <div><strong>{stats.streak}</strong><span>Streak</span></div>
      </div>
      <p className="semangat">{pesan}</p>
      <p className="terbaik">Streak terbaik: {stats.streakTerbaik}</p>
    </aside>
  );
}