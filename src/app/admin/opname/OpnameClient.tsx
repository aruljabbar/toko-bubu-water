'use client'

import { useState } from 'react';
import { sesuaikanStok } from '../../../actions/inventory';

export default function OpnameClient({ daftarProduk, historyOpname }: any) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  
  // PERBAIKAN: State lokal agar item langsung hilang seketika saat tombol Sesuai diklik
  const [localAudited, setLocalAudited] = useState<number[]>([]);

  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
  const idsAuditedToday = historyOpname.filter((h:any) => new Date(h.createdAt).toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }) === todayStr).map((h:any) => h.productId);

  const filteredAndSorted = daftarProduk.filter((p:any) => {
    // Sembunyikan item yang sudah diaudit HARI INI (dari Database ATAU dari klik sesaat yang lalu)
    if((idsAuditedToday.includes(p.id) || localAudited.includes(p.id)) && search === '') return false;
    return p.namaProduk.toLowerCase().includes(search.toLowerCase()) || p.kategori?.toLowerCase().includes(search.toLowerCase());
  }).sort((a:any, b:any) => a.namaProduk.localeCompare(b.namaProduk));

  const currentProducts = filteredAndSorted.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);

  // FUNGSI KHUSUS TOMBOL SESUAI
  const handleSesuai = async (p: any) => {
    // 1. Hilangkan dari tampilan sekarang juga (Anti Lemot)
    setLocalAudited(prev => [...prev, p.id]);
    
    // 2. Kirim aksi ke database di background
    const fd = new FormData(); 
    fd.append('productId', p.id); 
    fd.append('stokSistem', p.stok); 
    fd.append('stokFisik', p.stok); 
    fd.append('alasan', 'Sesuai (Check Harian)');
    await sesuaikanStok(fd);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <h1 className="text-xl md:text-2xl font-black text-slate-800">📋 Audit Fisik Stok (Harian)</h1>
      
      <div className="bg-white p-3 rounded-xl shadow-sm border flex gap-3 items-center">
        <input type="text" placeholder="🔍 Cari spesifik (Memunculkan barang yang sudah diaudit)..." value={search} onChange={e => {setSearch(e.target.value); setPage(1);}} className="flex-1 p-2 md:p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto w-full">
        <table className="min-w-[700px] w-full text-xs md:text-sm divide-y divide-slate-200">
          <thead className="bg-slate-50 font-bold text-slate-500 text-left uppercase">
            <tr><th className="px-4 py-3 w-1/2">Nama Produk & Gambar</th><th className="px-4 py-3 text-center w-24">Stok Sistem</th><th className="px-4 py-3">Audit Aktual</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {currentProducts.length === 0 ? (
              <tr><td colSpan={3} className="text-center py-10 font-bold text-slate-400 italic text-sm">Semua barang telah diaudit hari ini. 🎉</td></tr>
            ) : currentProducts.map((p:any) => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-bold text-slate-700 whitespace-nowrap flex items-center gap-3">
                  {p.gambarUrl ? <img src={p.gambarUrl} className="w-10 h-10 object-cover rounded border" /> : <div className="w-10 h-10 bg-slate-100 rounded text-[8px] flex items-center justify-center font-semibold text-slate-400">No Img</div>}
                  {p.namaProduk}
                </td>
                <td className="px-4 py-3 text-center font-black bg-slate-50">{p.stok}</td>
                <td className="px-4 py-3">
                  <form action={sesuaikanStok} className="flex gap-2 items-center" onSubmit={() => setLocalAudited(prev => [...prev, p.id])}>
                    <input type="hidden" name="productId" value={p.id} />
                    <input type="hidden" name="stokSistem" value={p.stok} />
                    <input type="number" step="any" name="stokFisik" required className="w-16 md:w-20 border border-slate-300 rounded p-1.5 md:p-2 text-center font-black text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" defaultValue={p.stok} />
                    <input type="text" name="alasan" placeholder="Alasan jika berbeda..." className="w-24 md:w-40 border border-slate-300 rounded p-1.5 md:p-2 text-[10px] md:text-xs outline-none focus:ring-2 focus:ring-blue-500" />
                    <button type="submit" className="bg-orange-500 text-white font-black px-2 md:px-3 py-1.5 md:py-2 rounded text-[10px] md:text-xs shadow hover:bg-orange-600 transition">Ubah</button>
                    {/* TOMBOL SESUAI (Cepat) */}
                    <button type="button" onClick={() => handleSesuai(p)} className="bg-emerald-500 text-white font-black px-2 md:px-3 py-1.5 md:py-2 rounded text-[10px] md:text-xs shadow hover:bg-emerald-600 transition flex items-center gap-1">✅ Sesuai</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-white p-3 rounded-xl border shadow-sm">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-1.5 bg-slate-100 rounded-lg font-bold text-xs hover:bg-slate-200 transition disabled:opacity-50">Prev</button>
          <span className="text-xs font-bold text-slate-500">Hal {page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-1.5 bg-slate-100 rounded-lg font-bold text-xs hover:bg-slate-200 transition disabled:opacity-50">Next</button>
        </div>
      )}

      {/* History Opname dengan Gambar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border mt-8 overflow-x-auto w-full">
        <h2 className="text-sm font-black mb-4 border-b pb-2 text-slate-800">🕰️ History Riwayat Audit</h2>
        <table className="min-w-[600px] w-full text-[10px] md:text-xs text-left">
          <thead className="text-slate-400 font-bold border-b border-slate-100"><tr><th className="pb-2">Waktu (WIB)</th><th className="pb-2">Nama Produk</th><th className="pb-2 text-center">Ubah Stok</th><th className="pb-2">Catatan/Alasan</th></tr></thead>
          <tbody className="divide-y divide-slate-50">
            {historyOpname.slice(0, 15).map((h:any) => (
              <tr key={h.id} className="hover:bg-slate-50">
                <td className="py-2.5 text-slate-500 font-semibold">{new Date(h.createdAt!).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'short', timeStyle: 'short' })}</td>
                <td className="py-2.5 font-bold text-slate-700 flex items-center gap-2">
                  {h.gambarUrl ? <img src={h.gambarUrl} className="w-6 h-6 object-cover rounded shadow-sm border" /> : <div className="w-6 h-6 bg-slate-100 rounded" />} {h.namaProduk}
                </td>
                <td className="py-2.5 text-center">
                  <span className={`font-black px-2 py-0.5 rounded shadow-sm ${h.selisih > 0 ? 'bg-emerald-100 text-emerald-700' : h.selisih < 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'}`}>{h.selisih > 0 ? `+${h.selisih}` : h.selisih}</span>
                </td>
                <td className="py-2.5 italic text-slate-500 font-medium">"{h.alasan}"</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}