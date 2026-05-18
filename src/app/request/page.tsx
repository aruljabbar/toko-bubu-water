import { db } from '../../db';
import { productRequests } from '../../db/schema';
import { desc } from 'drizzle-orm';
import { submitRequest } from '../../actions/request';

export default async function HalamanRequestPublik() {
  // Mengambil daftar request untuk ditampilkan ke publik
  const daftarRequest = await db.select().from(productRequests).orderBy(desc(productRequests.createdAt));

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold text-center">Request Barang Toko Bubu</h1>
      <p className="text-center text-gray-600">Barang yang kamu cari belum ada? Request di sini!</p>

      {/* Form Request */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <form action={submitRequest} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Nama Barang yang Diinginkan</label>
            <input type="text" name="namaBarang" required className="mt-1 w-full border rounded p-2" placeholder="Cth: Rokok Marlboro Merah" />
          </div>
          <div>
            <label className="block text-sm font-medium">Nomor HP Kamu (Hanya untuk info jika barang sudah ready)</label>
            <input type="text" name="nomorHp" required className="mt-1 w-full border rounded p-2" placeholder="0812..." />
          </div>
          <div>
            <label className="block text-sm font-medium">Link Gambar Barang (Opsional)</label>
            <input type="text" name="gambarUrl" className="mt-1 w-full border rounded p-2" placeholder="https://..." />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Kirim Request</button>
        </form>
      </div>

      {/* Daftar Request Publik */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold border-b pb-2">Daftar Request Pelanggan</h2>
        {daftarRequest.map((req) => (
          <div key={req.id} className="bg-gray-50 p-4 rounded border flex justify-between items-center">
            <div>
              <div className="font-bold">{req.namaBarang}</div>
              {/* Tampilkan komentar admin jika ada */}
              {req.komentarAdmin && (
                <div className="text-sm text-blue-600 mt-1">Admin: "{req.komentarAdmin}"</div>
              )}
            </div>
            {/* Badge Status */}
            <span className={`px-3 py-1 rounded text-xs font-bold text-white
              ${req.status === 'pending' ? 'bg-yellow-500' : 
                req.status === 'diterima' ? 'bg-green-500' : 
                req.status === 'sudah_ada' ? 'bg-blue-500' : 'bg-red-500'}`}>
              {req.status.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}