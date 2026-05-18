import { db } from '../../../db';
import { products, inventoryAdjustments } from '../../../db/schema';
import { desc, eq } from 'drizzle-orm';
import { sesuaikanStok } from '../../../actions/inventory';

export default async function HalamanOpname() {
  // Ambil data produk untuk form
  const daftarProduk = await db.select().from(products).orderBy(desc(products.id));
  
  // Ambil data riwayat untuk tabel audit (Kita lakukan join sederhana manual)
  const riwayatMentah = await db.select().from(inventoryAdjustments).orderBy(desc(inventoryAdjustments.createdAt));
  const riwayatAudit = riwayatMentah.map(riwayat => {
    const produkTerkait = daftarProduk.find(p => p.id === riwayat.productId);
    return { ...riwayat, namaProduk: produkTerkait?.namaProduk || 'Produk Dihapus' };
  });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Audit Stok (Stock Opname)</h1>
      
      {/* Bagian Atas: Form Eksekusi Opname */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-lg font-semibold mb-4 text-blue-700">Form Penyesuaian Fisik</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Produk</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Stok Sistem</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Stok Fisik Aktual</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Alasan Selisih</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {daftarProduk.map((produk) => (
                <tr key={produk.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium">{produk.namaProduk}</td>
                  <td className="px-4 py-3 text-sm text-center bg-gray-100 font-bold">{produk.stok}</td>
                  
                  <td colSpan={3} className="p-0">
                    <form action={sesuaikanStok} className="flex gap-2 p-2 items-center w-full">
                      <input type="hidden" name="productId" value={produk.id} />
                      <input type="hidden" name="stokSistem" value={produk.stok} />
                      
                      <input 
                        type="number" 
                        name="stokFisik" 
                        required 
                        placeholder="Angka real..." 
                        className="w-24 border rounded p-1.5 text-sm"
                        defaultValue={produk.stok} 
                      />
                      
                      <input 
                        type="text" 
                        name="alasan" 
                        required 
                        placeholder="Alasan selisih..." 
                        className="flex-1 border rounded p-1.5 text-sm"
                      />
                      
                      <button type="submit" className="bg-orange-500 text-white px-3 py-1.5 rounded text-sm hover:bg-orange-600 font-bold">
                        Sesuaikan
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bagian Bawah: Log Riwayat Audit (Ledger) */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-lg font-semibold mb-4 text-slate-700">Buku Besar Penyesuaian (Audit Log)</h2>
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-2 text-left text-slate-600">Tanggal</th>
              <th className="px-4 py-2 text-left text-slate-600">Produk</th>
              <th className="px-4 py-2 text-center text-slate-600">Perubahan</th>
              <th className="px-4 py-2 text-left text-slate-600">Alasan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {riwayatAudit.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-4 text-gray-500">Belum ada riwayat penyesuaian stok.</td></tr>
            ) : (
              riwayatAudit.map(log => (
                <tr key={log.id}>
                  <td className="px-4 py-2 text-gray-500">{new Date(log.createdAt!).toLocaleString('id-ID')}</td>
                  <td className="px-4 py-2 font-medium">{log.namaProduk}</td>
                  <td className="px-4 py-2 text-center">
                    <span className={`px-2 py-1 rounded font-bold text-xs ${log.selisih > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {log.selisih > 0 ? `+${log.selisih}` : log.selisih}
                    </span>
                    <span className="text-gray-400 text-xs block mt-1">({log.stokSistem} → {log.stokFisik})</span>
                  </td>
                  <td className="px-4 py-2 text-gray-600 italic">{log.alasan}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}