import { db } from '../../../db';
import { productRequests } from '../../../db/schema';
import { desc } from 'drizzle-orm';
import { updateStatusRequest, hapusRequest } from '../../../actions/adminRequest';
import DeleteForm from '../DeleteForm';

export default async function AdminRequestPage() {
  const daftarRequest = await db.select().from(productRequests).orderBy(desc(productRequests.createdAt));

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">📝 Manajemen Request Pelanggan</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border overflow-x-auto w-full">
        <table className="min-w-[700px] w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 font-bold text-slate-500 text-[10px] md:text-xs uppercase">
            <tr>
              <th className="px-4 md:px-6 py-3 text-left">Pelanggan & Waktu</th>
              <th className="px-4 md:px-6 py-3 text-left">Nama Barang</th>
              <th className="px-4 md:px-6 py-3 text-left">Tanggapan Admin</th>
              <th className="px-4 md:px-6 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100 text-xs md:text-sm">
            {daftarRequest.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400 font-medium">Belum ada request masuk.</td>
              </tr>
            ) : (
              daftarRequest.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/40">
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <div className="font-bold text-slate-800">{req.nomorHpPelanggan}</div>
                    <div className="text-[9px] md:text-[10px] text-slate-400 font-semibold mt-0.5">
                      📅 {new Date(req.createdAt!).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <div className="font-bold text-slate-700">{req.namaBarang}</div>
                    {req.gambarUrl && (
                      <a href={req.gambarUrl} target="_blank" className="text-blue-600 text-[10px] font-bold hover:underline inline-block mt-1">🔗 Lihat Gambar</a>
                    )}
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <form action={updateStatusRequest} className="flex gap-1 md:gap-2 items-center">
                      <input type="hidden" name="id" value={req.id} />
                      <select name="status" defaultValue={req.status} className="text-[10px] md:text-xs border rounded p-1.5 md:p-2 font-bold bg-white text-slate-700">
                        <option value="pending">Pending</option>
                        <option value="diterima">Diterima</option>
                        <option value="sudah_ada">Sudah Ready</option>
                        <option value="ditolak">Ditolak</option>
                      </select>
                      <input type="text" name="komentar" defaultValue={req.komentarAdmin || ''} placeholder="Catatan admin..." className="text-[10px] md:text-xs border rounded p-1.5 md:p-2 w-32 md:w-48" />
                      <button type="submit" className="bg-blue-600 text-white px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs rounded font-bold hover:bg-blue-700 transition">Update</button>
                    </form>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-center">
                    <DeleteForm action={hapusRequest} id={req.id} message="Hapus permanent request ini?" />
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