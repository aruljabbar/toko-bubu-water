'use client'

import { useState } from 'react';
import { tambahProduk, editProduk, hapusProduk } from '../../../actions/product';

export default function ProdukClient({ daftarProduk }: { daftarProduk: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const listKategori = Array.from(new Set(daftarProduk.map(p => p.kategori).filter(Boolean)));
  
  // Real-time Search
  const produkTampil = daftarProduk.filter(p => 
    p.namaProduk.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.barcode?.includes(searchQuery) || 
    p.kategori?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const bukaModalEdit = (produk: any) => {
    setEditData(produk);
    setIsEditModalOpen(true);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">📦 Manajemen Inventaris Produk</h1>

      {/* Form Tambah Produk */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <h2 className="text-base font-bold mb-4 text-blue-600">✨ Tambah Produk Baru</h2>
        <form action={async (formData) => {
          const res = await tambahProduk(formData);
          if (res?.success === false) alert(res.message);
          else alert('Produk berhasil ditambah!');
        }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-bold text-slate-500 mb-1">1. Scan Barcode (Opsional/Unik)</label><input type="text" name="barcode" className="w-full border rounded-lg p-2.5 bg-yellow-50 text-sm" /></div>
            <div><label className="block text-xs font-bold text-slate-500 mb-1">2. Nama Lengkap Produk</label><input type="text" name="namaProduk" required className="w-full border rounded-lg p-2.5 text-sm" /></div>
          </div>
          <div className="grid grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border">
            <div><label className="block text-xs font-bold text-rose-700">Harga Modal (Rp)</label><input type="number" name="hargaModal" required className="w-full border rounded-lg p-2 text-sm" /></div>
            <div><label className="block text-xs font-bold text-rose-700">Modal Grosir (Rp)</label><input type="number" name="hargaModalGrosir" className="w-full border rounded-lg p-2 text-sm" /></div>
            <div><label className="block text-xs font-bold text-emerald-700">Harga Jual (Rp)</label><input type="number" name="harga" required className="w-full border rounded-lg p-2 text-sm" /></div>
            <div><label className="block text-xs font-bold text-emerald-700">Jual Grosir (Rp)</label><input type="number" name="hargaGrosir" className="w-full border rounded-lg p-2 text-sm" /></div>
          </div>
          <div className="grid grid-cols-5 gap-4">
            <div><label className="block text-xs font-bold text-slate-500 mb-1">Min. Grosir</label><input type="number" name="minGrosir" className="w-full border rounded-lg p-2 text-sm" /></div>
            <div><label className="block text-xs font-bold text-slate-500 mb-1">Stok Awal</label><input type="number" name="stok" required className="w-full border rounded-lg p-2 text-sm" /></div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Satuan</label>
              <select name="satuan" className="w-full border rounded-lg p-2 text-sm bg-white">
                <option value="pcs">Pcs</option><option value="bungkus">Bungkus</option><option value="batang">Batang</option><option value="gram">Gram</option><option value="karton">Karton</option><option value="botol">Botol</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Kategori</label>
              <input list="admin-kategori-list" name="kategori" className="w-full border rounded-lg p-2 text-sm" />
              <datalist id="admin-kategori-list">{listKategori.map(k => <option key={k as string} value={k as string} />)}</datalist>
            </div>
            <div><label className="block text-xs font-bold text-slate-500 mb-1">URL Gambar</label><input type="url" name="gambarUrl" className="w-full border rounded-lg p-2 text-sm" /></div>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700">💾 Simpan Produk</button>
        </form>
      </div>

      {/* Tabel Daftar Produk dengan Real-time Search */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-base font-bold text-slate-700">📋 Daftar Detail Produk</h2>
          <div className="relative w-72">
            <input 
              type="text" 
              placeholder="Cari tanpa loading..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border rounded-lg p-2 w-full text-sm pr-8 focus:ring-2 focus:ring-blue-500" 
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2 top-2 text-slate-400 font-bold hover:text-rose-500">✕</button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-slate-50 font-bold text-slate-500">
              <tr>
                <th className="px-4 py-3">Info Barang</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Modal & Jual</th>
                <th className="px-4 py-3 text-center">Stok</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {produkTampil.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 flex gap-3 items-center">
                    {p.gambarUrl ? <img src={p.gambarUrl} className="w-10 h-10 object-cover rounded-lg border" /> : <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] text-slate-400">No Img</div>}
                    <div>
                      <div className="font-bold text-slate-800">{p.namaProduk} <span className="text-[10px] bg-slate-200 px-1 rounded text-slate-600">{p.satuan}</span></div>
                      <div className="text-xs text-slate-400 font-mono">{p.barcode || 'Tanpa Barcode'}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-600">{p.kategori}</td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-rose-600">Modal: Rp {p.hargaModal.toLocaleString('id-ID')}</div>
                    <div className="text-sm text-emerald-600 font-bold">Jual: Rp {p.harga.toLocaleString('id-ID')}</div>
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-base">{p.stok}</td>
                  <td className="px-4 py-3 text-center space-y-1">
                    <button onClick={() => bukaModalEdit(p)} className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded w-full font-bold hover:bg-blue-100">✏️ Edit</button>
                    <form action={hapusProduk} onSubmit={e => { if(!confirm('Hapus permanen?')) e.preventDefault(); }}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="text-xs bg-rose-50 text-rose-600 px-3 py-1 rounded w-full font-bold hover:bg-rose-100">🗑️ Hapus</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit Produk */}
      {isEditModalOpen && editData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="font-bold text-xl mb-4">Edit Produk: {editData.namaProduk}</h2>
            <form action={async (fd) => { await editProduk(fd); setIsEditModalOpen(false); }} className="space-y-4">
              <input type="hidden" name="id" value={editData.id} />
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold">Barcode</label><input type="text" name="barcode" defaultValue={editData.barcode || ''} className="w-full border rounded p-2" /></div>
                <div><label className="text-xs font-bold">Nama Produk</label><input type="text" name="namaProduk" defaultValue={editData.namaProduk} className="w-full border rounded p-2" /></div>
                <div><label className="text-xs font-bold text-rose-600">Harga Modal</label><input type="number" name="hargaModal" defaultValue={editData.hargaModal} className="w-full border rounded p-2" /></div>
                <div><label className="text-xs font-bold text-emerald-600">Harga Jual</label><input type="number" name="harga" defaultValue={editData.harga} className="w-full border rounded p-2" /></div>
                <div><label className="text-xs font-bold text-rose-600">Modal Grosir</label><input type="number" name="hargaModalGrosir" defaultValue={editData.hargaModalGrosir || ''} className="w-full border rounded p-2" /></div>
                <div><label className="text-xs font-bold text-emerald-600">Jual Grosir</label><input type="number" name="hargaGrosir" defaultValue={editData.hargaGrosir || ''} className="w-full border rounded p-2" /></div>
                <div><label className="text-xs font-bold">Stok</label><input type="number" name="stok" defaultValue={editData.stok} className="w-full border rounded p-2 bg-yellow-50" /></div>
                <div><label className="text-xs font-bold">Satuan</label><input type="text" name="satuan" defaultValue={editData.satuan} className="w-full border rounded p-2" /></div>
                <div><label className="text-xs font-bold">Kategori</label><input type="text" name="kategori" defaultValue={editData.kategori || ''} className="w-full border rounded p-2" /></div>
                <div><label className="text-xs font-bold">Min Beli Grosir</label><input type="number" name="minGrosir" defaultValue={editData.minGrosir || ''} className="w-full border rounded p-2" /></div>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-slate-200 py-2 rounded font-bold">Batal</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded font-bold">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}