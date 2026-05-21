import { db } from '../../../db';
import { orders, orderItems } from '../../../db/schema';
import { desc, eq } from 'drizzle-orm';

export default async function RiwayatTransaksi({ searchParams }: { searchParams: { hp?: string } }) {
  let daftarOrder;
  if (searchParams.hp) {
    daftarOrder = await db.select().from(orders).where(eq(orders.nomorHpPelanggan, searchParams.hp)).orderBy(desc(orders.createdAt));
  } else {
    daftarOrder = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(50);
  }

  // Ambil detail items untuk menghitung laba kotor
  const semuaItems = await db.select().from(orderItems);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Riwayat Transaksi {searchParams.hp && `(Filter: ${searchParams.hp})`}</h1>
      <div className="bg-white rounded-lg shadow border overflow-hidden p-4">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr><th>Waktu</th><th>Pelanggan</th><th>Status Bayar</th><th>Total Omzet</th><th>Laba Kotor</th></tr>
          </thead>
          <tbody>
            {daftarOrder.map(order => {
              const items = semuaItems.filter(i => i.orderId === order.id);
              // Laba = (Harga Jual - Harga Modal) * Kuantitas
              const laba = items.reduce((acc, item) => acc + ((item.hargaSatuan - item.modalSatuan) * item.kuantitas), 0);

              return (
                <tr key={order.id} className="border-b text-center hover:bg-gray-50">
                  <td className="py-3">{new Date(order.createdAt!).toLocaleString('id-ID')}</td>
                  <td className="py-3">{order.nomorHpPelanggan}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold text-white ${order.statusPembayaran === 'lunas' ? 'bg-green-500' : 'bg-red-500'}`}>{order.statusPembayaran.toUpperCase()}</span>
                  </td>
                  <td className="py-3 font-bold">Rp {order.totalHarga.toLocaleString()}</td>
                  <td className="py-3 text-green-600 font-bold">+ Rp {laba.toLocaleString()}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}