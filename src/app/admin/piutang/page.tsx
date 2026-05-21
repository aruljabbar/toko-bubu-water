import { db } from '../../../db';
import { customers, paymentHistory } from '../../../db/schema';
import { desc, gt } from 'drizzle-orm';
import { lunasiKasbon } from '../../../actions/kasir';
import Link from 'next/link';

export default async function HalamanPiutang() {
  const daftarPengutang = await db.select().from(customers).where(gt(customers.akumulasiUtang, 0));
  const riwayatBayar = await db.select().from(paymentHistory).orderBy(desc(paymentHistory.tanggalBayar)).limit(20);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Buku Piutang & Member</h1>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="font-bold mb-4 text-red-600">Tagihan Belum Lunas</h2>
          <ul className="space-y-4">
            {daftarPengutang.map(p => (
              <li key={p.id} className="border-b pb-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <Link href={`/admin/riwayat?hp=${p.nomorHp}`} className="font-bold text-blue-600 hover:underline">{p.nomorHp} ↗</Link>
                    <div className="text-xs text-gray-500">{p.nama}</div>
                  </div>
                  <div className="text-red-600 font-bold text-lg">Rp {p.akumulasiUtang?.toLocaleString()}</div>
                </div>
                <form action={lunasiKasbon} className="flex gap-2">
                  <input type="hidden" name="nomorHp" value={p.nomorHp} />
                  <input type="number" name="nominalBayar" required placeholder="Nominal bayar..." className="border p-2 rounded text-sm flex-1 bg-gray-50" />
                  <button type="submit" className="bg-green-600 text-white px-4 rounded text-sm font-bold">Terima Dana</button>
                </form>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="font-bold mb-4 text-green-600">Riwayat Pembayaran Cicilan</h2>
          <table className="min-w-full text-sm">
            <thead><tr className="border-b text-left text-gray-500"><th>Tanggal</th><th>Member</th><th>Nominal</th></tr></thead>
            <tbody>
              {riwayatBayar.map(r => (
                <tr key={r.id} className="border-b">
                  <td className="py-2">{new Date(r.tanggalBayar!).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                  <td className="py-2 font-medium">{r.nomorHpPelanggan}</td>
                  <td className="py-2 text-green-600 font-bold">+ Rp {r.nominalBayar.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}