  'use client'

  import { useState } from 'react';
  import { sesuaikanStok } from '../../../actions/inventory';

  type Produk = { id: number; namaProduk: string; stok: number; kategori: string | null; hargaModal: number; harga: number; };

  export default function OpnameClient({ daftarProduk }: { daftarProduk: Produk[] }) {
    const [search, setSearch] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Datatable Search & Sorting Default Alphabetical berdasarkan Nama Produk
    const filteredAndSorted = daftarProduk
      .filter(p => p.namaProduk.toLowerCase().includes(search.toLowerCase()) || p.kategori?.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        return sortOrder === 'asc' ? a.namaProduk.localeCompare(b.namaProduk) : b.namaProduk.localeCompare(a.namaProduk);
      });

    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">📋 Audit Fisik Stok Opname</h1>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border flex gap-4 items-center">
          <input 
            type="text"
            placeholder="🔍 Cari nama produk atau kategori di tabel opname..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs transition"
          >
            Urutan Nama: {sortOrder === 'asc' ? 'A - Z 🔼' : 'Z - A 🔽'}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 font-bold text-slate-500">
              <tr>
                <th className="px-6 py-3 text-left">Nama Produk</th>
                <th className="px-6 py-3 text-left">Harga Modal / Jual</th>
                <th className="px-6 py-3 text-center w-32">Stok Sistem</th>
                <th className="px-6 py-3 text-left">Eksekusi Penyesuaian Fisik Aktual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredAndSorted.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-3 font-bold text-slate-700">{p.namaProduk}</td>
                  <td className="px-6 py-3">
                    <div className="text-xs text-rose-600 font-bold">Modal: Rp {p.hargaModal.toLocaleString('id-ID')}</div>
                    <div className="text-xs text-emerald-600 font-bold">Jual: Rp {p.harga.toLocaleString('id-ID')}</div>
                  </td>
                  <td className="px-6 py-3 text-center font-black text-slate-600 bg-slate-50 text-base">{p.stok}</td>
                  <td className="px-6 py-3">
                    <form action={sesuaikanStok} className="flex gap-3 items-center">
                      <input type="hidden" name="productId" value={p.id} />
                      <input type="hidden" name="stokSistem" value={p.stok} />
                      <input type="number" name="stokFisik" required className="w-24 border rounded-lg p-2 text-center font-black text-slate-800" defaultValue={p.stok} />
                      <input type="text" name="alasan" required placeholder="Sebutkan alasan selisih..." className="flex-1 border rounded-lg p-2 text-xs focus:outline-none" />
                      <button type="submit" className="bg-orange-500 text-white font-black px-4 py-2 rounded-lg text-xs hover:bg-orange-600 transition">Sesuaikan</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }