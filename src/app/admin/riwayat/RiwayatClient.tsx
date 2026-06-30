'use client'
import { useState } from 'react';
import { hapusNotaDanRetur, hapusItemNota } from '../../../actions/kasir';

export default function RiwayatClient({ data, initialHp, userRole }: any) {
  const [search, setSearch] = useState(initialHp || '');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  const filtered = data.filter((d:any) => d.nomorHpPelanggan.includes(search) || d.id.toString().includes(search) || d.namaPelanggan.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentData = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-4">
      <h1 className="text-xl md:text-2xl font-black text-slate-800">📜 Buku Riwayat Nota</h1>
      
      <div className="bg-white p-3 rounded-xl shadow-sm border flex gap-3">
        <input type="text" placeholder="🔍 Cari ID Nota atau Nama Pelanggan..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="w-full border rounded-lg p-3 text-sm font-bold bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="space-y-4">
        {currentData.length === 0 ? <p className="text-center py-8 bg-white rounded-xl border text-sm font-bold text-slate-400">Tidak ada riwayat.</p> : 
          currentData.map((order:any) => {
            const isExpanded = expandedIds.includes(order.id);
            const totalProfit = order.items.reduce((acc:number, item:any) => acc + ((item.hargaSatuan - item.modalSatuan) * item.kuantitas), 0);

            return (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-100 px-4 py-3 flex justify-between items-center border-b">
                  <div>
                    <div className="text-base font-black text-blue-700">Nota #{order.id}</div>
                    <div className="text-xs font-bold text-slate-500">{new Date(order.createdAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-slate-800 uppercase">{order.namaPelanggan}</div>
                    <div className={`text-[10px] font-black px-2 py-0.5 rounded uppercase mt-1 inline-block ${order.statusPembayaran === 'lunas' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>{order.statusPembayaran}</div>
                  </div>
                </div>

                <div className="p-4 overflow-x-auto">
                  <table className="w-full text-xs text-left min-w-[400px]">
                    <thead className="border-b-2 border-slate-200 text-slate-500 font-black">
                      <tr>
                        <th className="pb-2">Barang</th><th className="pb-2 text-center">Qty</th><th className="pb-2 text-right">Harga</th><th className="pb-2 text-right">Subtotal</th>
                        {userRole === 'owner' && <th className="pb-2 text-center w-12">Retur</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                      {(isExpanded ? order.items : order.items.slice(0, 2)).map((item: any) => (
                        <tr key={item.id}>
                          <td className="py-2">{item.namaProduk}</td>
                          <td className="py-2 text-center bg-slate-50">{item.kuantitas}</td>
                          <td className="py-2 text-right">Rp {item.hargaSatuan.toLocaleString('id-ID')}</td>
                          <td className="py-2 text-right text-emerald-700">Rp {(item.hargaSatuan * item.kuantitas).toLocaleString('id-ID')}</td>
                          {userRole === 'owner' && (
                            <td className="py-2 text-center">
                              {/* PERBAIKAN: Gunakan onClick untuk preventDefault konfirmasi agar Next.js Action jalan lancar */}
                              <form action={hapusItemNota}>
                                <input type="hidden" name="orderId" value={order.id} />
                                <input type="hidden" name="itemId" value={item.id} />
                                <button type="submit" onClick={e => { if(!confirm(`Retur ${item.namaProduk}? Stok otomatis kembali dan tagihan disesuaikan!`)) e.preventDefault(); }} className="bg-rose-500 text-white rounded px-2.5 py-1 text-[9px] font-black shadow hover:bg-rose-600 transition">X</button>
                              </form>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {order.items.length > 2 && (
                    <button onClick={() => setExpandedIds(p => p.includes(order.id) ? p.filter(x => x !== order.id) : [...p, order.id])} className="w-full mt-3 py-2 bg-blue-50 text-blue-700 text-xs font-black rounded-xl hover:bg-blue-100 transition">
                      {isExpanded ? 'Tutup Detail' : `Buka ${order.items.length - 2} Barang Lainnya ⬇️`}
                    </button>
                  )}
                </div>

                <div className="bg-slate-50 px-4 py-3 border-t flex flex-wrap justify-between items-center gap-3">
                  <div className="text-xs md:text-sm font-black text-slate-800">TOTAL: <span className="text-blue-700 text-lg md:text-xl">Rp {order.totalHarga.toLocaleString('id-ID')}</span></div>
                  
                  <div className="flex gap-2 items-center">
                    {userRole === 'owner' && (
                      <>
                        <div className="text-[10px] text-emerald-600 font-black bg-emerald-100 px-2 py-1 rounded">Laba: +Rp {totalProfit.toLocaleString('id-ID')}</div>
                        <form action={hapusNotaDanRetur}>
                          <input type="hidden" name="orderId" value={order.id} />
                          <button type="submit" onClick={e => { if(!confirm('YAKIN HAPUS KESELURUHAN NOTA INI? Stok barang akan otomatis dikembalikan ke gudang!')) e.preventDefault(); }} className="bg-rose-600 text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow hover:bg-rose-700">HAPUS NOTA & RETUR</button>
                        </form>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        }
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-white p-3 rounded-xl border font-black text-xs">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-slate-100 rounded-lg disabled:opacity-50">KEMBALI</button>
          <span>HALAMAN {page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 bg-slate-100 rounded-lg disabled:opacity-50">LANJUT</button>
        </div>
      )}
    </div>
  );
}