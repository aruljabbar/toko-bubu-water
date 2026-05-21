import { db } from '../../db';
import { productRequests } from '../../db/schema';
import { desc } from 'drizzle-orm';
import { submitRequest } from '../../actions/request';

export default async function HalamanRequestPublik() {
  const daftarRequest = await db.select().from(productRequests).orderBy(desc(productRequests.createdAt));

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold text-center">Form Request Barang</h1>

      <div className="bg-white p-6 rounded-lg shadow border">
        <form action={submitRequest} className="space-y-4">
          <div><label className="block text-sm font-medium">Nama Barang</label><input type="text" name="namaBarang" required className="mt-1 w-full border p-2 rounded" /></div>
          <div><label className="block text-sm font-medium">No HP Kamu</label><input type="text" name="nomorHp" required className="mt-1 w-full border p-2 rounded" /></div>
          <div><label className="block text-sm font-medium">Link Gambar Barang URL</label><input type="url" name="gambarUrl" className="mt-1 w-full border p-2 rounded" placeholder="https://" /></div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-bold">Kirim Request</button>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold border-b pb-2">Status Request Pelanggan</h2>
        {daftarRequest.map((req) => (
          <div key={req.id} className="bg-gray-50 p-4 rounded border flex justify-between">
            <div>
              <div className="font-bold flex items-center gap-2">
                {req.namaBarang}
                {/* Fitur Klik Gambar di Request */}
                {req.gambarUrl && <a href={req.gambarUrl} target="_blank" className="text-xs bg-blue-100 text-blue-700 px-2 rounded hover:underline">Lihat Gambar</a>}
              </div>
              <div className="text-sm text-gray-500 mt-1">{new Date(req.createdAt!).toLocaleDateString('id-ID')}</div>
              {req.komentarAdmin && <div className="text-sm text-green-700 mt-2 p-2 bg-green-50 rounded">Balasan Admin: "{req.komentarAdmin}"</div>}
            </div>
            <span className={`h-fit px-3 py-1 rounded text-xs font-bold text-white ${req.status === 'pending' ? 'bg-yellow-500' : req.status === 'diterima' ? 'bg-blue-500' : req.status === 'sudah_ada' ? 'bg-green-500' : 'bg-red-500'}`}>
              {req.status.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}