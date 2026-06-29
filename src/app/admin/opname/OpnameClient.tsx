'use client'

import { useState } from 'react';
import { sesuaikanStok } from '../../../actions/inventory';

type Produk = { id: number; namaProduk: string; stok: number; kategori: string | null; hargaModal: number; harga: number; satuan: string; };
type History = { id: number; namaProduk: string; stokSistem: number; stokFisik: number; selisih: number; alasan: string; createdAt: Date | null; };

export default function OpnameClient({ daftarProduk, historyOpname }: { daftarProduk: Produk[], historyOpname: History[] }) {
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredAndSorted = daftarProduk
    .filter(p => p.namaProduk.toLowerCase().includes(search.toLowerCase()) || p.kategori?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortOrder === 'asc' ? a.namaProduk.localeCompare(b.namaProduk) : b.namaProduk.localeCompare(a.namaProduk));

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <h1 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">📋 Audit Fisik Stok Opname</h1>
      
      <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border flex flex-col md:flex-row gap-3 items-start md:items-center">
        <input type="text" placeholder="🔍 Cari nama produk atau kategori..." value={search} onChange={e => setSearch(e.target.value)} className="w-full md:flex-1 p-2 border rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')} className="w-full md:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs transition">Urutan Nama: {sortOrder === 'asc' ? 'A - Z 🔼' : 'Z - A 🔽'}</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto w-full">
        <table className="min-w-[600px] w-full text-xs md:text-sm divide-y divide-slate-200">
          <thead className="bg-slate-50 font-bold text-slate-500 text-left">
            <tr>
              <th className="px-4 py-3">Nama Produk</th>
              <th className="px-4 py-3">Harga Pokok & Jual</th>
              <th className="px-4 py-3 text-center">Stok Sistem</th>
              <th className="px-4 py-3">Penyesuaian Fisik Aktual</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredAndSorted.map(p => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-bold text-slate-700 whitespace-nowrap">{p.namaProduk} <span className="text-[9px] md:text-[10px] bg-slate-100 px-1 rounded">{p.satuan}</span></td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-[10px] md:text-xs text-rose-600 font-bold">Modal: Rp {p.hargaModal.toLocaleString('id-ID')}</div>
                  <div className="text-[10px] md:text-xs text-emerald-600 font-bold">Jual: Rp {p.harga.toLocaleString('id-ID')}</div>
                </td>
                <td className="px-4 py-3 text-center font-black text-slate-600 bg-slate-50 text-sm md:text-base">{p.stok}</td>
                <td className="px-4 py-3">
                  <form action={sesuaikanStok} className="flex gap-2 items-center">
                    <input type="hidden" name="productId" value={p.id} />
                    <input type="hidden" name="stokSistem" value={p.stok} />
                    <input type="number" step="any" name="stokFisik" required className="w-16 md:w-20 border rounded-lg p-1.5 text-center font-black text-slate-800" defaultValue={p.stok} />
                    <input type="text" name="alasan" required placeholder="Alasan selisih..." className="w-32 md:flex-1 border rounded-lg p-1.5 text-[10px] md:text-xs focus:outline-none" />
                    <button type="submit" className="bg-orange-500 text-white font-black px-2 md:px-4 py-1.5 rounded-lg text-[10px] md:text-xs hover:bg-orange-600 transition">Sesuaikan</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border mt-8 overflow-x-auto w-full">
        <h2 className="text-sm md:text-lg font-black text-slate-800 mb-4 border-b pb-2 whitespace-nowrap">🕰️ History Riwayat Penyesuaian Stok (30 Terakhir)</h2>
        <table className="min-w-[500px] w-full text-[10px] md:text-sm text-left">
          <thead className="text-slate-400 font-bold">
            <tr><th className="pb-2">Waktu (WIB)</th><th className="pb-2">Produk</th><th className="pb-2 text-center">Perubahan</th><th className="pb-2">Alasan</th></tr>
          </thead>
          <tbody>
            {historyOpname.map(h => (
              <tr key={h.id} className="border-b border-slate-50">
                <td className="py-2 text-slate-500">{new Date(h.createdAt!).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'short', timeStyle: 'short' })}</td>
                <td className="py-2 font-bold text-slate-700">{h.namaProduk}</td>
                <td className="py-2 text-center">
                  <div className={`font-black px-1.5 py-0.5 inline-block rounded ${h.selisih > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {h.selisih > 0 ? `+${h.selisih}` : h.selisih}
                  </div>
                  <div className="text-[8px] md:text-[10px] text-slate-400 mt-0.5">{h.stokSistem} ➔ {h.stokFisik}</div>
                </td>
                <td className="py-2 text-slate-600 italic">"{h.alasan}"</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}