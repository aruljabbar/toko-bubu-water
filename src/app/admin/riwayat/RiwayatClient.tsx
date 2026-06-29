'use client'

import { useState } from 'react';

export default function RiwayatClient({ data, initialHp }: { data: any[], initialHp: string }) {
  const [search, setSearch] = useState(initialHp || '');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const filtered = data.filter(d => 
    d.nomorHpPelanggan.includes(search) || 
    d.id.toString().includes(search) ||
    d.namaPelanggan.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentData = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">📜 Riwayat Laba & Nota POS</h1>
      
      <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <input 
          type="text" placeholder="🔍 Cari ID Nota, No HP, atau Nama Pelanggan..." 
          value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} 
          className="w-full sm:w-96 border rounded-lg p-2 md:p-2.5 text-xs md:text-sm focus:ring-2 focus:ring-blue-500" 
        />
        <div className="text-[10px] md:text-xs font-bold text-slate-500">Total Transaksi: {filtered.length} Nota</div>
      </div>

      <div className="space-y-4">
        {currentData.length === 0 ? (
          <p className="text-slate-400 text-center py-12 bg-white rounded-xl border text-sm">Tidak ditemukan riwayat transaksi.</p>
        ) : (
          currentData.map((order) => {
            const isExpanded = expandedIds.includes(order.id);
            const itemsToShow = isExpanded ? order.items : order.items.slice(0, 3);
            const sisaItem = order.items.length - 3;
            
            const totalProfit = order.items.reduce((acc: number, item: any) => acc + ((item.hargaSatuan - item.modalSatuan) * item.kuantitas), 0);

            return (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="bg-slate-50 px-3 md:px-4 py-3 border-b flex flex-col sm:flex-row justify-between sm:items-center text-[10px] md:text-xs font-bold text-slate-600 gap-2">
                  <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">NOTA: #{order.id}</span>
                    <span>🕒 {new Date(order.createdAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}</span>
                    <span>👤 {order.namaPelanggan} ({order.nomorHpPelanggan})</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] md:text-[10px] text-white uppercase w-fit ${order.statusPembayaran === 'lunas' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                    {order.statusPembayaran}
                  </span>
                </div>

                <div className="p-3 md:p-4 overflow-x-auto">
                  <table className="w-full text-[10px] md:text-xs text-left text-slate-600 min-w-[400px]">
                    <thead>
                      <tr className="border-b text-slate-400 font-bold">
                        <th className="pb-2">Nama Barang</th><th className="pb-2 text-center w-12 md:w-16">Qty</th><th className="pb-2 text-right">Harga Jual / Modal</th><th className="pb-2 text-right text-emerald-600">Laba Bersih</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemsToShow.map((item: any) => (
                        <tr key={item.id} className="border-b border-slate-50 last:border-0">
                          <td className="py-2 font-semibold text-slate-700 whitespace-nowrap">{item.namaProduk}</td>
                          <td className="py-2 text-center font-bold bg-slate-50 rounded">{item.kuantitas}</td>
                          <td className="py-2 text-right whitespace-nowrap">
                            <div className="text-emerald-700 font-bold">J: Rp {item.hargaSatuan.toLocaleString('id-ID')}</div>
                            <div className="text-[9px] md:text-[10px] text-rose-500 font-semibold">M: Rp {item.modalSatuan.toLocaleString('id-ID')}</div>
                          </td>
                          <td className="py-2 text-right text-emerald-600 font-black whitespace-nowrap">+Rp {((item.hargaSatuan - item.modalSatuan) * item.kuantitas).toLocaleString('id-ID')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {sisaItem > 0 && (
                    <button onClick={() => toggleExpand(order.id)} className="w-full mt-2 py-1.5 bg-slate-100 text-slate-600 text-[10px] md:text-xs font-bold rounded-lg hover:bg-slate-200 transition">
                      {isExpanded ? 'Sembunyikan' : `Tampilkan ${sisaItem} Item Lainnya ⬇️`}
                    </button>
                  )}
                </div>

                <div className="bg-slate-50/50 px-3 md:px-4 py-2.5 border-t flex flex-col sm:flex-row justify-between sm:items-center text-[10px] md:text-xs font-bold gap-2">
                  <div className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 shadow-sm w-fit">
                    Total Laba: +Rp {totalProfit.toLocaleString('id-ID')}
                  </div>
                  <div className="text-slate-800 text-xs md:text-sm sm:text-right flex flex-col">
                    <div>
                      Omzet: <span className="text-blue-600 font-black">Rp {order.totalHarga.toLocaleString('id-ID')}</span>
                    </div>
                    {order.statusPembayaran === 'kasbon' && (
                      <div className="text-[9px] md:text-[10px] text-rose-600 mt-0.5">
                        (Dibayar: Rp {order.cashReceived.toLocaleString('id-ID')} | Kasbon: Rp {(order.totalHarga - order.cashReceived).toLocaleString('id-ID')})
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 md:px-4 py-1.5 md:py-2 bg-white border rounded-lg font-bold text-xs md:text-sm disabled:opacity-50">⬅️ Prev</button>
          <span className="px-3 md:px-4 py-1.5 md:py-2 font-bold text-xs md:text-sm text-slate-600">Hal {page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 md:px-4 py-1.5 md:py-2 bg-white border rounded-lg font-bold text-xs md:text-sm disabled:opacity-50">Next ➡️</button>
        </div>
      )}
    </div>
  );
}