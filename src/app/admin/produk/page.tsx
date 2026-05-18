import { tambahProduk } from '../../../actions/product';
import { db } from '../../../db';
import { products } from '../../../db/schema';
import { desc } from 'drizzle-orm';

// Ubah komponen menjadi 'async' agar bisa melakukan query ke database
export default async function HalamanProdukAdmin() {
  // Mengambil semua data produk dari database, diurutkan dari yang terbaru (ID terbesar)
  const daftarProduk = await db.select().from(products).orderBy(desc(products.id));

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Manajemen Produk Toko Bubu</h1>
      
      {/* Bagian Atas: Form Tambah Produk */}
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h2 className="text-lg font-semibold mb-4">Tambah Produk Baru</h2>
        <form action={tambahProduk} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Produk</label>
            <input type="text" name="namaProduk" required className="mt-1 block w-full border border-gray-300 rounded-md p-2" placeholder="Cth: Indomie Goreng" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Harga (Rp)</label>
              <input type="number" name="harga" required className="mt-1 block w-full border border-gray-300 rounded-md p-2" placeholder="3000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Stok Awal</label>
              <input type="number" name="stok" required className="mt-1 block w-full border border-gray-300 rounded-md p-2" placeholder="40" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Kategori</label>
            <select name="kategori" className="mt-1 block w-full border border-gray-300 rounded-md p-2">
              <option value="Makanan">Makanan</option>
              <option value="Minuman">Minuman</option>
              <option value="Sembako">Sembako</option>
              <option value="Rokok">Rokok</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition">
            Simpan Produk
          </button>
        </form>
      </div>

      {/* Bagian Bawah: Tabel Daftar Produk */}
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h2 className="text-lg font-semibold mb-4">Daftar Produk Saat Ini</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Produk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {daftarProduk.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">Belum ada produk. Silakan tambah di atas.</td>
                </tr>
              ) : (
                daftarProduk.map((produk) => (
                  <tr key={produk.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{produk.namaProduk}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{produk.kategori}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rp {produk.harga.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{produk.stok}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}