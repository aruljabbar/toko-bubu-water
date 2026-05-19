import { db } from '../../../db';
import { customers, paymentHistory } from '../../../db/schema';
import { desc, gt } from 'drizzle-orm';
import { lunasiKasbon } from '../../../actions/kasir';

export default async function HalamanPiutang() {
  // Hanya ambil pelanggan yang utangnya lebih dari 0
  const daftarPengutang = await db.select().from(customers).where(gt(customers.akumulasiUtang, 0));
  const riwayatBayar = await db.select().from(paymentHistory).orderBy(desc(paymentHistory.tanggalBayar)).limit(10);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Buku Kasbon / Piutang</h1>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="font-bold mb-4">Daftar Tagihan Aktif</h2>
          <ul className="space-y-4">
            {daftarPengutang.map(p => (
              <li key={p.id} className="border-b pb-4 flex justify-between items-center">
                <div>
                  <div className="font-bold">{p.nomorHp}</div>
                  <div className="text-red-600 text-sm">Utang: Rp {p.akumulasiUtang?.toLocaleString('id-ID')}</div>
                </div>
                <form action={lunasiKasbon} className="flex gap-2">
                  <input type="hidden" name="nomorHp" value={p.nomorHp} />
                  <input type="number" name="nominalBayar" required placeholder="Nominal cicil/lunas..." className="border p-1 rounded text-sm w-32" />
                  <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded text-sm font-bold">Bayar</button>
                </form>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="font-bold mb-4">Riwayat Pembayaran Terbaru</h2>
          <ul className="space-y-2 text-sm">
            {riwayatBayar.map(r => (
              <li key={r.id} className="flex justify-between text-gray-600">
                <span>{r.nomorHpPelanggan}</span>
                <span className="text-green-600 font-bold">+ Rp {r.nominalBayar.toLocaleString('id-ID')}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}