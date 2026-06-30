'use client'

import { useState } from 'react';

export default function LaporanClient({ data }: { data: any[] }) {
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  // 1. FILTER HANYA HARI INI (WIB)
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
  const dataHariIni = data.filter(d => new Date(d.createdAt).toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }) === todayStr);

  // 2. KALKULASI SUMMARY KASIR
  const totalOmzet = dataHariIni.reduce((sum, o) => sum + o.totalHarga, 0);
  // Tunai Diterima = CashReceived dikurangi kembalian. (Jika kasbon, cashReceived adalah uang mukanya)
  const totalTunaiMasuk = dataHariIni.reduce((sum, o) => sum + (o.cashReceived > o.totalHarga ? o.totalHarga : o.cashReceived), 0);
  const totalKasbon = dataHariIni.reduce((sum, o) => sum + Math.max(0, o.totalHarga - o.cashReceived), 0);
  
  // 3. REKAP BARANG TERJUAL
  const rekapBarang: Record<string, number> = {};
  dataHariIni.forEach(o => {
    o.items.forEach((i: any) => {
      rekapBarang[i.namaProduk] = (rekapBarang[i.namaProduk] || 0) + i.kuantitas;
    });
  });
  const listBarangTerjual = Object.entries(rekapBarang).map(([nama, qty]) => ({ nama, qty })).sort((a, b) => b.qty - a.qty);

  // 4. PAGINATION NOTA
  const totalPages = Math.ceil(dataHariIni.length / itemsPerPage);
  const currentData = dataHariIni.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">📄 Laporan Kasir Hari Ini</h1>
      <p className="text-xs md:text-sm font-bold text-slate-500">Tanggal: {new Date().toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      
      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 flex flex-col justify-center">
          <div className="text-[10px] md:text-xs font-bold text-slate-500 mb-1">TOTAL NOTA</div>
          <div className="text-lg md:text-xl font-black text-blue-600">{dataHariIni.length} <span className="text-xs font-bold text-slate-400">Trx</span></div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100 flex flex-col justify-center">
          <div className="text-[10px] md:text-xs font-bold text-slate-500 mb-1">OMZET KOTOR</div>
          <div className="text-lg md:text-xl font-black text-emerald-600">Rp {totalOmzet.toLocaleString('id-ID')}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100 flex flex-col justify-center">
          <div className="text-[10px] md:text-xs font-bold text-slate-500 mb-1">TUNAI MASUK LACI</div>
          <div className="text-lg md:text-xl font-black text-indigo-600">Rp {totalTunaiMasuk.toLocaleString('id-ID')}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-rose-100 flex flex-col justify-center">
          <div className="text-[10px] md:text-xs font-bold text-slate-500 mb-1">DICATAT PIUTANG</div>
          <div className="text-lg md:text-xl font-black text-rose-600">Rp {totalKasbon.toLocaleString('id-ID')}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        
        {/* KOLOM KIRI: DAFTAR NOTA HARI INI */}
        <div className="col-span-1 lg:col-span-2 space-y-4">
          <h2 className="font-bold text-slate-700 text-sm md:text-base border-b pb-2">🧾 Rincian Transaksi Hari Ini</h2>
          
          {currentData.length === 0 ? (
             <p className="text-center py-8 bg-white rounded-xl border text-sm font-bold text-slate-400">Belum ada transaksi hari ini.</p>
          ) : currentData.map((order) => {
            const isExpanded = expandedIds.includes(order.id);
            const itemsToShow = isExpanded ? order.items : order.items.slice(0, 2);

            return (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-3 md:px-4 py-3 flex justify-between items-center border-b">
                  <div>
                    <div className="text-sm md:text-base font-black text-slate-800">Nota #{order.id}</div>
                    <div className="text-[10px] md:text-xs font-bold text-slate-500">{new Date(order.createdAt).toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' })} WIB</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs md:text-sm font-black text-blue-700 uppercase">{order.namaPelanggan}</div>
                    <div className={`text-[9px] md:text-[10px] font-black px-2 py-0.5 rounded uppercase mt-1 inline-block ${order.statusPembayaran === 'lunas' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>{order.statusPembayaran}</div>
                  </div>
                </div>

                <div className="p-3 md:p-4 overflow-x-auto">
                  <table className="w-full text-[11px] md:text-xs text-left min-w-[350px]">
                    <thead className="border-b-2 border-slate-100 text-slate-400 font-bold">
                      <tr><th className="pb-2">Barang</th><th className="pb-2 text-center">Qty</th><th className="pb-2 text-right">Harga</th><th className="pb-2 text-right">Subtotal</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                      {itemsToShow.map((item: any) => (
                        <tr key={item.id}>
                          <td className="py-2 truncate max-w-[150px]">{item.namaProduk}</td>
                          <td className="py-2 text-center bg-slate-50">{item.kuantitas}</td>
                          <td className="py-2 text-right">Rp {item.hargaSatuan.toLocaleString('id-ID')}</td>
                          <td className="py-2 text-right text-slate-900 font-black">Rp {(item.hargaSatuan * item.kuantitas).toLocaleString('id-ID')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {order.items.length > 2 && (
                    <button onClick={() => setExpandedIds(p => p.includes(order.id) ? p.filter(x => x !== order.id) : [...p, order.id])} className="w-full mt-2 py-1.5 bg-slate-100 text-slate-600 text-[10px] md:text-xs font-bold rounded-lg hover:bg-slate-200 transition">
                      {isExpanded ? 'Tutup Detail' : `Lihat ${order.items.length - 2} Barang Lainnya ⬇️`}
                    </button>
                  )}
                </div>

                <div className="bg-slate-50/50 px-3 md:px-4 py-3 border-t flex flex-wrap justify-between items-center gap-2">
                  <div className="text-[10px] md:text-xs text-slate-500 font-bold">
                    Kasbon: <span className="text-rose-600">Rp {Math.max(0, order.totalHarga - order.cashReceived).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="text-xs md:text-sm font-black text-slate-800">
                    TOTAL: <span className="text-blue-700 text-base md:text-lg">Rp {order.totalHarga.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center bg-white p-2 md:p-3 rounded-xl border font-black text-[10px] md:text-xs mt-4">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 md:px-4 py-1.5 md:py-2 bg-slate-100 rounded-lg disabled:opacity-50">KEMBALI</button>
              <span>HAL {page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 md:px-4 py-1.5 md:py-2 bg-slate-100 rounded-lg disabled:opacity-50">LANJUT</button>
            </div>
          )}
        </div>

        {/* KOLOM KANAN: REKAP BARANG KELUAR */}
        <div className="col-span-1">
          <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border sticky top-20">
            <h2 className="font-bold text-slate-700 text-sm md:text-base border-b pb-2 mb-3">📦 Barang Keluar Hari Ini</h2>
            <ul className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {listBarangTerjual.length === 0 ? <p className="text-xs text-slate-400 italic">Belum ada barang terjual.</p> : 
                listBarangTerjual.map((b, i) => (
                  <li key={i} className="flex justify-between items-center text-[11px] md:text-xs border-b border-slate-50 pb-2">
                    <span className="font-semibold text-slate-700 truncate pr-2">{b.nama}</span>
                    <span className="font-black bg-blue-50 text-blue-700 px-2 py-0.5 rounded whitespace-nowrap">{b.qty} x</span>
                  </li>
                ))
              }
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}