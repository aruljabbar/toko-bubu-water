import { db } from '../../../db';
import { products } from '../../../db/schema';
import { desc } from 'drizzle-orm';
import { tambahProduk } from '../../../actions/product';

export default async function HalamanProdukAdmin({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q?.toLowerCase() || '';
  const daftarProduk = await db.select().from(products).orderBy(desc(products.id));
  
  const produkTampil = daftarProduk.filter(p => p.namaProduk.toLowerCase().includes(query) || p.barcode?.includes(query) || p.kategori?.toLowerCase().includes(query));

  // Ambil list kategori unik untuk datalist
  const listKategori = Array.from(new Set(daftarProduk.map(p => p.kategori).filter(Boolean)));

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Manajemen Produk Terpadu</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h2 className="text-lg font-semibold mb-4 text-blue-700">Tambah Produk Baru</h2>
        <form action={tambahProduk} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700">Nama Produk</label>
              <input type="text" name="namaProduk" required className="mt-1 w-full border rounded p-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Scan Barcode</label>
              <input type="text" name="barcode" className="mt-1 w-full border rounded p-2 bg-yellow-50 text-sm" placeholder="Arahkan scanner ke sini..." />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded border border-gray-200">
            <div><label className="block text-xs font-bold text-red-700">Harga Modal (Rp)</label><input type="number" name="hargaModal" required className="mt-1 w-full border rounded p-2 text-sm" /></div>
            <div><label className="block text-xs font-bold text-red-700">Modal Grosir (Rp)</label><input type="number" name="hargaModalGrosir" className="mt-1 w-full border rounded p-2 text-sm" /></div>
            <div><label className="block text-xs font-bold text-green-700">Harga Jual (Rp)</label><input type="number" name="harga" required className="mt-1 w-full border rounded p-2 text-sm" /></div>
            <div><label className="block text-xs font-bold text-green-700">Jual Grosir (Rp)</label><input type="number" name="hargaGrosir" className="mt-1 w-full border rounded p-2 text-sm" /></div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div><label className="block text-xs font-medium">Min. Beli Grosir (Qty)</label><input type="number" name="minGrosir" className="mt-1 w-full border rounded p-2 text-sm" /></div>
            <div><label className="block text-xs font-medium">Stok Awal</label><input type="number" name="stok" required className="mt-1 w-full border rounded p-2 text-sm" /></div>
            <div>
              <label className="block text-xs font-medium">Kategori</label>
              <input list="kategori-list" name="kategori" className="mt-1 w-full border rounded p-2 text-sm" placeholder="Ketik atau pilih..." />
              <datalist id="kategori-list">{listKategori.map(k => <option key={k} value={k!} />)}</datalist>
            </div>
            <div><label className="block text-xs font-medium">Link Gambar URL</label><input type="url" name="gambarUrl" className="mt-1 w-full border rounded p-2 text-sm" placeholder="https://..." /></div>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 font-bold">Simpan Produk</button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Daftar Produk Saat Ini</h2>
          <form method="GET">
            <input type="text" name="q" defaultValue={query} placeholder="Cari nama/barcode..." className="border rounded p-2 text-sm w-64" />
            <button type="submit" className="ml-2 bg-gray-200 px-3 py-2 rounded text-sm">Cari</button>
          </form>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Info Barang</th>
                <th className="px-4 py-2 text-left">Kategori</th>
                <th className="px-4 py-2 text-left">Harga Modal</th>
                <th className="px-4 py-2 text-left">Harga Jual</th>
                <th className="px-4 py-2 text-center">Stok</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {produkTampil.map((produk) => (
                <tr key={produk.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 flex items-center gap-3">
                    {produk.gambarUrl ? <img src={produk.gambarUrl} className="w-10 h-10 object-cover rounded border" /> : <div className="w-10 h-10 bg-gray-200 rounded"></div>}
                    <div>
                      <div className="font-bold text-blue-900">{produk.namaProduk}</div>
                      <div className="text-xs text-gray-500 font-mono">{produk.barcode || 'Tanpa Barcode'}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{produk.kategori}</td>
                  <td className="px-4 py-3 text-red-700">
                    <div>Ecer: {produk.hargaModal}</div>
                    {produk.hargaModalGrosir && <div className="text-xs">Grosir: {produk.hargaModalGrosir}</div>}
                  </td>
                  <td className="px-4 py-3 text-green-700 font-bold">
                    <div>Ecer: {produk.harga}</div>
                    {produk.hargaGrosir && <div className="text-xs">Grosir: {produk.hargaGrosir} (Min {produk.minGrosir})</div>}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-lg">{produk.stok}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}