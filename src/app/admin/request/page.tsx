import { db } from '../../../db';
import { productRequests } from '../../../db/schema';
import { desc } from 'drizzle-orm';
import { updateStatusRequest } from '../../../actions/adminRequest';

export default async function AdminRequestPage() {
  // Mengambil semua request terbaru
  const daftarRequest = await db.select().from(productRequests).orderBy(desc(productRequests.createdAt));

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Kelola Request Pelanggan</h1>
      
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pelanggan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Barang</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi & Balasan Admin</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {daftarRequest.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">Belum ada request dari pelanggan.</td>
              </tr>
            ) : (
              daftarRequest.map((req) => (
                <tr key={req.id}>
                  {/* Info Pelanggan (Hanya tampil di admin) */}
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{req.nomorHpPelanggan}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(req.createdAt!).toLocaleDateString('id-ID')}
                    </div>
                  </td>
                  
                  {/* Info Barang */}
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-800">{req.namaBarang}</div>
                    {req.gambarUrl && (
                      <a href={req.gambarUrl} target="_blank" className="text-blue-500 text-xs hover:underline">
                        Lihat Gambar
                      </a>
                    )}
                  </td>
                  
                  {/* Form Update Status & Komentar */}
                  <td className="px-6 py-4">
                    <form action={updateStatusRequest} className="flex gap-2 items-start">
                      <input type="hidden" name="id" value={req.id} />
                      
                      <div className="flex-1 space-y-2">
                        <select 
                          name="status" 
                          defaultValue={req.status}
                          className="w-full text-sm border-gray-300 rounded-md p-1.5 border"
                        >
                          <option value="pending">Pending</option>
                          <option value="diterima">Terima Rekomendasi</option>
                          <option value="sudah_ada">Produk Sudah Ada</option>
                          <option value="ditolak">Tolak / Tidak Dijual</option>
                        </select>
                        
                        <input 
                          type="text" 
                          name="komentar" 
                          defaultValue={req.komentarAdmin || ''} 
                          placeholder="Beri komentar publik (opsional)..." 
                          className="w-full text-sm border-gray-300 rounded-md p-1.5 border"
                        />
                      </div>

                      <button type="submit" className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700">
                        Update
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}