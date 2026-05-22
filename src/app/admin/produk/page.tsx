import { db } from '../../../db';
import { products } from '../../../db/schema';
import { desc } from 'drizzle-orm';
import { tambahProduk, hapusProduk } from '../../../actions/product';
import DeleteForm from '../DeleteForm'; // IMPORT KOMPONEN BARU

export default async function HalamanProdukAdmin({ searchParams }: { searchParams: Promise<{ q?: string; error?: string }> }) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q?.toLowerCase() || '';
  const errorMsg = resolvedParams.error;

  const daftarProduk = await db.select().from(products).orderBy(desc(products.id));
  
  const produkTampil = daftarProduk.filter(p => 
    p.namaProduk.toLowerCase().includes(query) || 
    p.barcode?.includes(query) || 
    p.kategori?.toLowerCase().includes(query)
  );

  const listKategori = Array.from(new Set(daftarProduk.map(p => p.kategori).filter(Boolean)));

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">📦 Manajemen Inventaris Produk</h1>

      {errorMsg === 'duplicate_barcode' && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold text-sm">
          ⚠️ Gagal Input: Barcode ini sudah terdaftar pada produk lain! Harap gunakan barcode yang unik.
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <h2 className="text-base font-bold mb-4 text-blue-600">✨ Tambah Produk Baru</h2>
        <form action={tambahProduk} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">1. Scan Barcode (Wajib Unik)</label>
              <input type="text" name="barcode" className="w-full border rounded-lg p-2.5 bg-yellow-50/50 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Letakkan kursor disini lalu tembak produk..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">2. Nama Lengkap Produk</label>
              <input type="text" name="namaProduk" required className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Contoh: Indomie Goreng Aceh" />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border">
            <div>
              <label className="block text-xs font-bold text-rose-700 mb-1">Harga Modal Eceran (Rp)</label>
              <input type="number" name="hargaModal" required className="w-full border rounded-lg p-2 text-sm" placeholder="2500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-rose-700 mb-1">Harga Modal Grosir (Rp)</label>
              <input type="number" name="hargaModalGrosir" className="w-full border rounded-lg p-2 text-sm" placeholder="2300" />
            </div>
            <div>
              <label className="block text-xs font-bold text-emerald-700 mb-1">Harga Jual Eceran (Rp)</label>
              <input type="number" name="harga" required className="w-full border rounded-lg p-2 text-sm" placeholder="3000" />
            </div>
            <div>
              <label className="block text-xs font-bold text-emerald-700 mb-1">Harga Jual Grosir (Rp)</label>
              <input type="number" name="hargaGrosir" className="w-full border rounded-lg p-2 text-sm" placeholder="2800" />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Min. Grosir (Qty)</label>
              <input type="number" name="minGrosir" className="w-full border rounded-lg p-2 text-sm" placeholder="40" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Stok Awal</label>
              <input type="number" name="stok" required className="w-full border rounded-lg p-2 text-sm" placeholder="100" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Kategori</label>
              <input list="admin-kategori-list" name="kategori" className="w-full border rounded-lg p-2 text-sm" placeholder="Cari/Ketik Kategori..." />
              <datalist id="admin-kategori-list">
                {listKategori.map(k => <option key={k} value={k!} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">URL Gambar Produk</label>
              <input type="url" name="gambarUrl" className="w-full border rounded-lg p-2 text-sm" placeholder="https://..." />
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-sm">💾 Simpan & Daftarkan Produk</button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-base font-bold text-slate-700">📋 Daftar Detail Produk & Harga Gudang</h2>
          <form method="GET" className="flex gap-2">
            <input type="text" name="q" defaultValue={query} placeholder="Cari nama, barcode, kategori..." className="border rounded-lg p-2 text-sm w-64 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-900 transition">Cari</button>
          </form>
        </div>

        <div className="overflow-x-auto rounded-xl border">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 font-bold text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Info Barang</th>
                <th className="px-4 py-3 text-left">Kategori</th>
                <th className="px-4 py-3 text-left">Detail Harga Modal</th>
                <th className="px-4 py-3 text-left">Detail Harga Jual</th>
                <th className="px-4 py-3 text-center">Stok</th>
                <th className="px-4 py-3 text-center">Aksi CRUD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {produkTampil.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 flex items-center gap-3">
                    {p.gambarUrl ? <img src={p.gambarUrl} className="w-10 h-10 object-cover rounded-lg border" /> : <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] text-slate-400 font-bold">No Img</div>}
                    <div>
                      <div className="font-bold text-slate-800">{p.namaProduk}</div>
                      <div className="text-xs text-slate-400 font-mono">{p.barcode || '⚠️ Tanpa Barcode'}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-semibold">{p.kategori || 'Umum'}</td>
                  <td className="px-4 py-3">
                    <div className="text-rose-600 font-bold">Ecer: Rp {p.hargaModal.toLocaleString('id-ID')}</div>
                    {p.hargaModalGrosir && <div className="text-xs text-rose-400">Grosir: Rp {p.hargaModalGrosir.toLocaleString('id-ID')}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-emerald-600 font-bold">Ecer: Rp {p.harga.toLocaleString('id-ID')}</div>
                    {p.hargaGrosir && <div className="text-xs text-emerald-500 font-semibold">Grosir: Rp {p.hargaGrosir.toLocaleString('id-ID')} (Min {p.minGrosir})</div>}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-slate-800 text-base">{p.stok}</td>
                  <td className="px-4 py-3 text-center">
                    <DeleteForm action={hapusProduk} id={p.id} message={`Hapus permanent produk ${p.namaProduk}?`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}