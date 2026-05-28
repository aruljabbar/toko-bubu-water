import { db } from '../../../db';
import { orders, orderItems } from '../../../db/schema';
import { desc, eq } from 'drizzle-orm';

export default async function RiwayatTransaksiPage({ searchParams }: { searchParams: Promise<{ hp?: string }> }) {
  const resolvedParams = await searchParams;
  const targetHp = resolvedParams.hp;

  let queryOrders;
  if (targetHp) {
    queryOrders = await db.select().from(orders).where(eq(orders.nomorHpPelanggan, targetHp)).orderBy(desc(orders.createdAt));
  } else {
    queryOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  const itemsAll = await db.select().from(orderItems);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">📜 Riwayat Laba & Transaksi POS</h1>
      {targetHp && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-700 font-bold rounded-xl text-sm flex justify-between items-center">
          <span>🎯 Memfilter data belanja member: {targetHp}</span>
          <a href="/admin/riwayat" className="text-xs bg-white text-blue-600 px-2.5 py-1 rounded border shadow-sm font-bold">Reset</a>
        </div>
      )}

      <div className="space-y-4">
        {queryOrders.length === 0 ? (
          <p className="text-slate-400 text-center py-12 bg-white rounded-xl border">Tidak ditemukan riwayat transaksi.</p>
        ) : (
          queryOrders.map((order) => {
            const associatedItems = itemsAll.filter(i => i.orderId === order.id);
            
            // Hitung akumulasi keuntungan bersih per ID Transaksi tunggal
            const totalProfit = associatedItems.reduce((acc, item) => {
              return acc + ((item.hargaSatuan - item.modalSatuan) * item.kuantitas);
            }, 0);

            return (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b flex justify-between items-center text-xs font-bold text-slate-600">
                  <div className="flex gap-4">
                    <span>ID NOTA: #{order.id}</span>
                    <span>🕒 {new Date(order.createdAt!).toLocaleString('id-ID')}</span>
                    <span>👤 Pelanggan: {order.nomorHpPelanggan}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] text-white ${order.statusPembayaran === 'lunas' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {order.statusPembayaran.toUpperCase()}
                  </span>
                </div>

                <div className="p-4">
                  <table className="w-full text-xs text-left text-slate-600">
                    <thead>
                      <tr className="border-b text-slate-400 font-bold">
                        <th className="pb-2">Nama Barang</th>
                        <th className="pb-2 text-center w-16">Qty</th>
                        <th className="pb-2 text-right">Harga Jual</th>
                        <th className="pb-2 text-right text-emerald-600">Laba Bersih</th>
                      </tr>
                    </thead>
                    <tbody>
                      {associatedItems.map((item) => (
                      <tr key={item.id} className="border-b border-slate-50 last:border-0">
                        <td className="py-2 font-semibold text-slate-700">{item.namaProduk}</td>
                        <td className="py-2 text-center font-bold">{item.kuantitas}</td>
                        <td className="py-2 text-right">
                          <div className="text-emerald-600 font-bold">Jual: Rp {item.hargaSatuan.toLocaleString('id-ID')}</div>
                          <div className="text-xs text-rose-500">Modal: Rp {item.modalSatuan.toLocaleString('id-ID')}</div>
                        </td>
                        <td className="py-2 text-right text-emerald-600 font-black">
                          +Rp {((item.hargaSatuan - item.modalSatuan) * item.kuantitas).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-slate-50/50 px-4 py-2.5 border-t flex justify-between items-center text-xs font-bold">
                  <div className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                    Laba Bersih Nota: +Rp {totalProfit.toLocaleString()}
                  </div>
                  <div className="text-slate-800 text-sm">
                    Total Transaksi: <span className="text-blue-600 font-black">Rp {order.totalHarga.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}