'use client'

import { useState } from 'react';
import Link from 'next/link';

type Product = {
  id: number; namaProduk: string; harga: number; hargaGrosir: number | null;
  minGrosir: number | null; stok: number; kategori: string | null; gambarUrl: string | null; satuan: string;
};

export default function KatalogClient({ katalog }: { katalog: Product[] }) {
  const [search, setSearch] = useState('');
  const [kategori, setKategori] = useState('Semua');

  // FIXED: Deklarasi string[] yang tegas
  const kategoriList: string[] = ['Semua', ...Array.from(new Set(katalog.map(p => p.kategori).filter(Boolean))) as string[]];

  const filtered = katalog.filter(p => {
    const matchSearch = p.namaProduk.toLowerCase().includes(search.toLowerCase()) || p.kategori?.toLowerCase().includes(search.toLowerCase());
    const matchKategori = kategori === 'Semua' || p.kategori === kategori;
    return matchSearch && matchKategori;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-blue-600 text-white p-6 md:p-8 text-center shadow-md">
        <h1 className="text-2xl md:text-3xl font-black">🏪 Toko Bubu Katalog</h1>
        <p className="mt-1 text-blue-100 text-xs md:text-sm font-semibold">Daftar Ketersediaan Stok Barang Real-time</p>
        <div className="mt-4">
          <Link href="/request" className="bg-orange-500 hover:bg-orange-600 px-4 md:px-6 py-2 rounded-full font-bold shadow transition text-[10px] md:text-xs inline-block">
            📝 Klik Disini Untuk Request Barang Pelanggan
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="bg-white p-3 md:p-4 rounded-2xl shadow-sm border flex flex-col md:flex-row gap-3 md:gap-4 items-center justify-between">
          <input 
            type="text" placeholder="🔍 Cari produk favoritmu disini..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full md:w-96 border rounded-xl p-2.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2 flex-wrap justify-center w-full md:w-auto">
            {kategoriList.map(kat => (
              <button 
                key={kat} onClick={() => setKategori(kat)}
                className={`px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition whitespace-nowrap ${kategori === kat ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {kat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {filtered.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border p-3 flex flex-col justify-between hover:shadow-sm transition">
              <div className="flex flex-col items-center">
                {p.gambarUrl ? (
                  <img src={p.gambarUrl} className="h-20 w-20 md:h-24 md:w-24 object-cover rounded-xl border mb-2" alt={p.namaProduk} />
                ) : (
                  <div className="h-20 w-20 md:h-24 md:w-24 bg-slate-50 rounded-xl mb-2 flex items-center justify-center text-slate-400 text-[10px] font-bold border">No Image</div>
                )}
                <h3 className="font-bold text-[11px] md:text-xs text-slate-800 text-center line-clamp-2 w-full">{p.namaProduk}</h3>
                <span className="text-[8px] md:text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded mt-1">{p.kategori || 'Umum'}</span>
              </div>
              <div className="mt-3 border-t pt-2 text-center w-full">
                <div className="text-blue-600 font-black text-xs md:text-sm">Rp {p.harga.toLocaleString('id-ID')}</div>
                {p.hargaGrosir && (
                  <div className="text-[9px] md:text-[10px] text-emerald-600 font-bold">
                    Grosir: Rp {p.hargaGrosir.toLocaleString('id-ID')} <span className="text-slate-400 block font-normal">(Min Beli: {p.minGrosir} {p.satuan})</span>
                  </div>
                )}
                <div className="text-[9px] md:text-[10px] font-bold text-slate-500 mt-2 bg-slate-50 p-1 rounded border border-slate-100">📦 Stok Tersedia: {p.stok} {p.satuan}</div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}