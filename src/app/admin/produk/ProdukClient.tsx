'use client'

import { useState } from 'react';
import { tambahProduk, editProduk, hapusProduk, restockProduk } from '../../../actions/product';

export default function ProdukClient({ daftarProduk, userRole }: { daftarProduk: any[], userRole: string }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const listKategori = Array.from(new Set(daftarProduk.map(p => p.kategori).filter(Boolean)));
  const listSatuan = Array.from(new Set(daftarProduk.map(p => p.satuan).filter(Boolean)));
  
  const produkTampil = daftarProduk.filter(p => 
    p.namaProduk.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.barcode?.includes(searchQuery) || 
    p.kategori?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 md:space-y-8">
      <h1 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">📦 Katalog Inventaris Produk</h1>

      {userRole === 'owner' && (
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border">
          <h2 className="text-sm md:text-base font-bold mb-4 text-blue-600">✨ Tambah Produk Baru</h2>
          <form action={async (formData) => {
            const res = await tambahProduk(formData);
            if (res?.success === false) alert(res.message);
            else alert('Produk berhasil ditambah!');
          }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-[10px] md:text-xs font-bold text-slate-500 mb-1">1. Scan Barcode (Opsional)</label><input type="text" name="barcode" className="w-full border rounded-lg p-2 md:p-2.5 bg-yellow-50 text-sm" /></div>
              <div><label className="block text-[10px] md:text-xs font-bold text-slate-500 mb-1">2. Nama Lengkap Produk</label><input type="text" name="namaProduk" required className="w-full border rounded-lg p-2 md:p-2.5 text-sm" /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border">
              <div><label className="block text-[10px] md:text-xs font-bold text-rose-700">Harga Modal (Rp)</label><input type="number" name="hargaModal" required className="w-full border rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-[10px] md:text-xs font-bold text-rose-700">Modal Grosir (Rp)</label><input type="number" name="hargaModalGrosir" className="w-full border rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-[10px] md:text-xs font-bold text-emerald-700">Harga Jual (Rp)</label><input type="number" name="harga" required className="w-full border rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-[10px] md:text-xs font-bold text-emerald-700">Jual Grosir (Rp)</label><input type="number" name="hargaGrosir" className="w-full border rounded-lg p-2 text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
              <div><label className="block text-[10px] md:text-xs font-bold text-slate-500 mb-1">Min. Grosir</label><input type="number" name="minGrosir" className="w-full border rounded-lg p-2 text-sm" /></div>
              <div><label className="block text-[10px] md:text-xs font-bold text-slate-500 mb-1">Stok Awal</label><input type="number" step="any" name="stok" required className="w-full border rounded-lg p-2 text-sm" /></div>
              <div>
                <label className="block text-[10px] md:text-xs font-bold text-slate-500 mb-1">Satuan</label>
                <input list="admin-satuan-list" name="satuan" className="w-full border rounded-lg p-2 text-sm bg-white" defaultValue="pcs" />
                <datalist id="admin-satuan-list">{listSatuan.map(s => <option key={s as string} value={s as string} />)}</datalist>
              </div>
              <div>
                <label className="block text-[10px] md:text-xs font-bold text-slate-500 mb-1">Kategori</label>
                <input list="admin-kategori-list" name="kategori" className="w-full border rounded-lg p-2 text-sm" />
                <datalist id="admin-kategori-list">{listKategori.map(k => <option key={k as string} value={k as string} />)}</datalist>
              </div>
              <div className="col-span-2 lg:col-span-1"><label className="block text-[10px] md:text-xs font-bold text-slate-500 mb-1">URL Gambar</label><input type="url" name="gambarUrl" className="w-full border rounded-lg p-2 text-sm" /></div>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 text-sm">💾 Simpan Produk</button>
          </form>
        </div>
      )}

      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-3">
          <h2 className="text-sm md:text-base font-bold text-slate-700">📋 Daftar Detail Produk</h2>
          <div className="relative w-full md:w-72">
            <input type="text" placeholder="Pencarian cepat..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="border rounded-lg p-2 w-full text-sm pr-8 focus:ring-2 focus:ring-blue-500" />
            {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-2 top-2 text-slate-400 font-bold hover:text-rose-500">✕</button>}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border w-full">
          <table className="min-w-full text-xs md:text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50 font-bold text-slate-500">
              <tr>
                <th className="px-3 md:px-4 py-3">Info Barang</th>
                <th className="px-3 md:px-4 py-3">Kategori</th>
                {userRole === 'owner' && <th className="px-3 md:px-4 py-3">Modal</th>}
                <th className="px-3 md:px-4 py-3">Harga Jual</th>
                <th className="px-3 md:px-4 py-3 text-center">Stok</th>
                {userRole === 'owner' && <th className="px-3 md:px-4 py-3 text-center">Aksi Manajemen</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {produkTampil.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="px-3 md:px-4 py-3 flex gap-2 md:gap-3 items-center min-w-[200px]">
                    {p.gambarUrl ? <img src={p.gambarUrl} className="w-8 h-8 md:w-10 md:h-10 object-cover rounded-lg border shrink-0" /> : <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-100 rounded-lg flex items-center justify-center text-[8px] md:text-[10px] text-slate-400 shrink-0">No Img</div>}
                    <div>
                      <div className="font-bold text-slate-800 truncate max-w-[150px] md:max-w-xs">{p.namaProduk} <span className="text-[9px] md:text-[10px] bg-slate-200 px-1 rounded text-slate-600">{p.satuan}</span></div>
                      <div className="text-[10px] md:text-xs text-slate-400 font-mono">{p.barcode || 'Tanpa Barcode'}</div>
                    </div>
                  </td>
                  <td className="px-3 md:px-4 py-3 font-semibold text-slate-600">{p.kategori}</td>
                  
                  {userRole === 'owner' && (
                    <td className="px-3 md:px-4 py-3">
                      <div className="text-[11px] md:text-xs text-rose-600 font-bold">Rp {p.hargaModal.toLocaleString('id-ID')}</div>
                    </td>
                  )}
                  
                  <td className="px-3 md:px-4 py-3">
                    <div className="text-xs md:text-sm text-emerald-600 font-black">Rp {p.harga.toLocaleString('id-ID')}</div>
                    {p.hargaGrosir && <div className="text-[9px] md:text-[10px] text-slate-500 font-bold mt-0.5">Grosir: Rp {p.hargaGrosir.toLocaleString('id-ID')}</div>}
                  </td>
                  <td className="px-3 md:px-4 py-3 text-center font-bold text-sm md:text-base">{p.stok}</td>
                  
                  {userRole === 'owner' && (
                    <td className="px-3 md:px-4 py-3 text-center flex flex-col gap-1 min-w-[120px]">
                      <button onClick={() => { setEditData(p); setIsRestockModalOpen(true); }} className="text-[9px] md:text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-1 rounded font-bold hover:bg-emerald-100 uppercase">📦 Beli Stok</button>
                      <button onClick={() => { setEditData(p); setIsEditModalOpen(true); }} className="text-[10px] md:text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded font-bold hover:bg-blue-100">✏️ Edit</button>
                      <form action={hapusProduk} onSubmit={e => { if(!confirm('Hapus permanen?')) e.preventDefault(); }}>
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit" className="text-[10px] md:text-xs bg-rose-50 text-rose-600 px-3 py-1 rounded w-full font-bold hover:bg-rose-100">🗑️ Hapus</button>
                      </form>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isRestockModalOpen && editData && userRole === 'owner' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 md:p-6 w-full max-w-sm shadow-xl">
            <h2 className="font-black text-emerald-700 mb-2">📦 Beli Stok Baru</h2>
            <form action={async (fd) => { await restockProduk(fd); setIsRestockModalOpen(false); }} className="space-y-4">
              <input type="hidden" name="id" value={editData.id} />
              <div className="flex justify-between text-xs md:text-sm bg-slate-50 p-2 rounded border">
                <span>Stok Lama: <b>{editData.stok}</b></span>
                <span className="text-rose-600">Modal Lama: <b>Rp {editData.hargaModal.toLocaleString('id-ID')}</b></span>
              </div>
              <div><label className="text-[10px] md:text-xs font-bold text-slate-700">Jumlah Barang Masuk (Qty)</label><input type="number" step="any" name="qtyMasuk" required className="w-full border-2 border-emerald-200 rounded p-2 md:p-3 text-base md:text-lg font-bold" /></div>
              <div><label className="text-[10px] md:text-xs font-bold text-slate-700">Harga Beli Satuan Baru</label><input type="number" name="modalBaru" required defaultValue={editData.hargaModal} className="w-full border-2 border-emerald-200 rounded p-2 md:p-3 text-base md:text-lg font-bold" /></div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsRestockModalOpen(false)} className="flex-1 bg-slate-200 py-2 rounded font-bold text-sm">Batal</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-2 rounded font-bold text-sm">Hitung Average</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && editData && userRole === 'owner' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 md:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="font-bold text-lg md:text-xl mb-4">Edit Produk: {editData.namaProduk}</h2>
            <form action={async (fd) => { await editProduk(fd); setIsEditModalOpen(false); }} className="space-y-3 md:space-y-4">
              <input type="hidden" name="id" value={editData.id} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div><label className="text-[10px] md:text-xs font-bold">Barcode</label><input type="text" name="barcode" defaultValue={editData.barcode || ''} className="w-full border rounded p-1.5 md:p-2 text-sm" /></div>
                <div><label className="text-[10px] md:text-xs font-bold">Nama Produk</label><input type="text" name="namaProduk" defaultValue={editData.namaProduk} className="w-full border rounded p-1.5 md:p-2 text-sm" /></div>
                <div><label className="text-[10px] md:text-xs font-bold text-rose-600">Harga Modal Eceran</label><input type="number" name="hargaModal" defaultValue={editData.hargaModal} className="w-full border rounded p-1.5 md:p-2 text-sm" /></div>
                <div><label className="text-[10px] md:text-xs font-bold text-emerald-600">Harga Jual Eceran</label><input type="number" name="harga" defaultValue={editData.harga} className="w-full border rounded p-1.5 md:p-2 text-sm" /></div>
                <div><label className="text-[10px] md:text-xs font-bold text-rose-600">Harga Modal Grosir</label><input type="number" name="hargaModalGrosir" defaultValue={editData.hargaModalGrosir || ''} className="w-full border rounded p-1.5 md:p-2 text-sm" /></div>
                <div><label className="text-[10px] md:text-xs font-bold text-emerald-600">Harga Jual Grosir</label><input type="number" name="hargaGrosir" defaultValue={editData.hargaGrosir || ''} className="w-full border rounded p-1.5 md:p-2 text-sm" /></div>
                <div><label className="text-[10px] md:text-xs font-bold">Satuan</label><input list="admin-satuan-list" name="satuan" defaultValue={editData.satuan} className="w-full border rounded p-1.5 md:p-2 text-sm" /></div>
                <div><label className="text-[10px] md:text-xs font-bold">Kategori</label><input type="text" name="kategori" defaultValue={editData.kategori || ''} className="w-full border rounded p-1.5 md:p-2 text-sm" /></div>
                <div><label className="text-[10px] md:text-xs font-bold">Min Beli Grosir</label><input type="number" name="minGrosir" defaultValue={editData.minGrosir || ''} className="w-full border rounded p-1.5 md:p-2 text-sm" /></div>
                <div><label className="text-[10px] md:text-xs font-bold">URL Gambar</label><input type="url" name="gambarUrl" defaultValue={editData.gambarUrl || ''} className="w-full border rounded p-1.5 md:p-2 text-sm" /></div>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-slate-200 py-2 rounded font-bold text-slate-700 text-sm">Batal</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded font-bold text-sm">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}