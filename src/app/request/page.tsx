import { db } from '../../db';
import { productRequests } from '../../db/schema';
import { desc } from 'drizzle-orm';
import { submitRequest } from '../../actions/request';

export default async function HalamanRequestPublik() {
  const daftarRequest = await db.select().from(productRequests).orderBy(desc(productRequests.createdAt));

  // Fungsi Sensor No HP (Misal: 081234568448 -> 08******8448)
  const maskPhone = (phone: string) => {
    if (phone.length < 6) return phone;
    return phone.substring(0, 2) + '*'.repeat(phone.length - 6) + phone.slice(-4);
  };

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-black text-center text-slate-800">📝 Layanan Request Barang</h1>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <form action={submitRequest} className="space-y-4">
          <div><label className="block text-sm font-bold text-slate-600 mb-1">Nama Lengkap Barang</label><input type="text" name="namaBarang" required placeholder="Contoh: Susu Beruang Gold" className="w-full border rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-bold text-slate-600 mb-1">Nomor WhatsApp Kamu</label><input type="text" name="nomorHp" required placeholder="0812..." className="w-full border rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-bold text-slate-600 mb-1">URL / Link Gambar Bukti (Opsional)</label><input type="url" name="gambarUrl" placeholder="https://" className="w-full border rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500" /></div>
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-black text-lg hover:bg-blue-700 shadow-md">Kirim Request Sekarang</button>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-black text-slate-800 border-b-2 border-slate-200 pb-2">Status Request Pelanggan Lain</h2>
        {daftarRequest.map((req) => (
          <div key={req.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between">
            <div className="w-2/3">
              <div className="font-black text-slate-800 text-lg flex items-center gap-2">
                {req.namaBarang}
                {req.gambarUrl && <a href={req.gambarUrl} target="_blank" className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold hover:bg-blue-200 transition">🖼️ Cek Gambar</a>}
              </div>
              <div className="text-xs font-bold text-slate-500 mt-1 flex gap-4">
                <span>📱 Peminta: {maskPhone(req.nomorHpPelanggan)}</span>
                <span>🕒 {new Date(req.createdAt!).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}</span>
              </div>
              {req.komentarAdmin && (
                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <div className="text-xs text-emerald-800 italic">" {req.komentarAdmin} "</div>
                  <div className="text-[9px] text-emerald-500 font-bold mt-1 text-right">
                    Dibalas Admin pada: {new Date(req.updatedAt!).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'long', timeStyle: 'short' })}
                  </div>
                </div>
              )}
            </div>
            <div className="w-1/3 flex justify-end">
              <span className={`h-fit px-3 py-1.5 rounded-lg text-[10px] font-black text-white uppercase tracking-wider ${req.status === 'pending' ? 'bg-amber-500 shadow-amber-200' : req.status === 'diterima' ? 'bg-blue-500 shadow-blue-200' : req.status === 'sudah_ada' ? 'bg-emerald-500 shadow-emerald-200' : 'bg-rose-500 shadow-rose-200'} shadow-md`}>
                {req.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}