import { db } from '../../../db';
import { customers, paymentHistory } from '../../../db/schema';
import { desc, gt } from 'drizzle-orm';
import { lunasiKasbon } from '../../../actions/kasir';
import Link from 'next/link';

export default async function HalamanPiutang() {
  const daftarPengutang = await db.select().from(customers).where(gt(customers.akumulasiUtang, 0));
  const riwayatBayar = await db.select().from(paymentHistory).orderBy(desc(paymentHistory.tanggalBayar)).limit(15);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">💰 Manajemen Piutang & Member</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="font-bold text-base mb-4 text-rose-600">Tagihan Kasbon Berjalan</h2>
          <ul className="space-y-4">
            {daftarPengutang.map(p => (
              <li key={p.id} className="border-b pb-4 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    {/* FIXED: Link mengarah secara tepat ke halaman filter transaksi per nomor HP */}
                    <Link href={`/admin/riwayat?hp=${p.nomorHp}`} className="font-black text-blue-600 hover:underline text-sm flex items-center gap-1">
                      📱 {p.nomorHp} ↗
                    </Link>
                    <div className="text-xs text-slate-400 font-bold mt-0.5">👤 Member: {p.nama}</div>
                  </div>
                  <div className="text-rose-600 font-black text-base bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                    Rp {p.akumulasiUtang?.toLocaleString()}
                  </div>
                </div>
                <form action={lunasiKasbon} className="flex gap-2 mt-1">
                  <input type="hidden" name="nomorHp" value={p.nomorHp} />
                  <input type="number" name="nominalBayar" required placeholder="Nominal pembayaran..." className="border p-2 rounded-lg text-sm flex-1 bg-slate-50 focus:bg-white" />
                  <button type="submit" className="bg-green-600 text-white font-bold px-4 rounded-lg text-xs hover:bg-green-700 transition">Terima Uang</button>
                </form>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border h-fit">
          <h2 className="font-bold text-base mb-4 text-green-600">Riwayat Setoran Pembayaran</h2>
          <table className="min-w-full text-xs text-left">
            <thead>
              <tr className="border-b text-slate-400 font-bold">
                <th className="pb-2">Tanggal / Jam</th>
                <th className="pb-2">No. HP Pelanggan</th>
                <th className="pb-2 text-right">Nominal Masuk</th>
              </tr>
            </thead>
            <tbody>
              {riwayatBayar.map(r => (
                <tr key={r.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-2 text-slate-400">{new Date(r.tanggalBayar!).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td className="py-2 font-bold text-slate-700">{r.nomorHpPelanggan}</td>
                  <td className="py-2 text-right text-green-600 font-black">+Rp {r.nominalBayar.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}