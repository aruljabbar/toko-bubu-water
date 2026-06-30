'use client'

import { useState } from 'react';
import { updateStatusRequest, hapusRequest } from '../../../actions/adminRequest';

export default function RequestClient({ daftarRequest, userRole }: { daftarRequest: any[], userRole: string }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Fitur pencarian cepat
  const filtered = daftarRequest.filter(req => 
    req.nomorHpPelanggan.includes(search) || 
    req.namaBarang.toLowerCase().includes(search.toLowerCase())
  );

  // Logika Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentData = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <h1 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">📝 Manajemen Request Pelanggan</h1>
        <div className="text-[10px] md:text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-lg border shadow-sm">
          Total Request: {filtered.length}
        </div>
      </div>

      <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border">
        <input 
          type="text" 
          placeholder="🔍 Cari berdasarkan Nomor HP atau Nama Barang..." 
          value={search} 
          onChange={e => { setSearch(e.target.value); setPage(1); }} 
          className="w-full md:w-96 border rounded-lg p-2 md:p-2.5 text-xs md:text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
        />
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border overflow-x-auto w-full">
        <table className="min-w-[800px] w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 font-bold text-slate-500 text-[10px] md:text-xs uppercase">
            <tr>
              <th className="px-4 md:px-6 py-3 text-left w-48">Pelanggan & Waktu</th>
              <th className="px-4 md:px-6 py-3 text-left">Nama Barang</th>
              <th className="px-4 md:px-6 py-3 text-left">Tanggapan Admin</th>
              <th className="px-4 md:px-6 py-3 text-center w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100 text-xs md:text-sm">
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-400 font-bold italic text-xs md:text-sm">
                  Tidak ada data request pelanggan.
                </td>
              </tr>
            ) : (
              currentData.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <div className="font-bold text-slate-800 bg-blue-50 text-blue-700 px-2 py-1 rounded w-fit mb-1">{req.nomorHpPelanggan}</div>
                    <div className="text-[9px] md:text-[10px] text-slate-500 font-semibold mt-1">
                      📅 {new Date(req.createdAt!).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </td>
                  
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <div className="font-bold text-slate-700 leading-snug">{req.namaBarang}</div>
                    {req.gambarUrl && (
                      <a href={req.gambarUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-[9px] md:text-[10px] font-black hover:underline inline-flex items-center gap-1 mt-1.5 bg-blue-50 px-2 py-0.5 rounded">
                        🔗 Lihat Referensi Gambar
                      </a>
                    )}
                  </td>
                  
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <form action={updateStatusRequest} className="flex flex-col sm:flex-row gap-1.5 md:gap-2 items-start sm:items-center">
                      <input type="hidden" name="id" value={req.id} />
                      <select name="status" defaultValue={req.status} className="text-[10px] md:text-xs border border-slate-200 rounded-lg p-1.5 md:p-2 font-bold bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-auto">
                        <option value="pending">Pending ⏳</option>
                        <option value="diterima">Diterima ✅</option>
                        <option value="sudah_ada">Sudah Ready 📦</option>
                        <option value="ditolak">Ditolak ❌</option>
                      </select>
                      <input 
                        type="text" 
                        name="komentar" 
                        defaultValue={req.komentarAdmin || ''} 
                        placeholder="Beri catatan ke pelanggan..." 
                        className="text-[10px] md:text-xs border border-slate-200 rounded-lg p-1.5 md:p-2 w-full sm:w-40 md:w-56 focus:ring-2 focus:ring-blue-500 outline-none" 
                      />
                      <button type="submit" className="bg-blue-600 text-white px-3 py-1.5 md:py-2 text-[10px] md:text-xs rounded-lg font-bold hover:bg-blue-700 transition shadow-sm w-full sm:w-auto">
                        Update
                      </button>
                    </form>
                  </td>
                  
                  <td className="px-4 md:px-6 py-3 md:py-4 text-center">
                    {/* LOGIKA OTORISASI HAPUS: Hanya muncul jika rolenya adalah 'owner' */}
                    {userRole === 'owner' ? (
                      <form action={hapusRequest} onSubmit={e => { if(!confirm('Yakin ingin menghapus permanen request ini?')) e.preventDefault(); }}>
                        <input type="hidden" name="id" value={req.id} />
                        <button type="submit" className="bg-rose-50 text-rose-600 border border-rose-200 px-2 md:px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-bold hover:bg-rose-100 hover:text-rose-700 transition shadow-sm w-full">
                          Hapus
                        </button>
                      </form>
                    ) : (
                      <span className="text-[9px] md:text-[10px] text-slate-400 font-bold italic bg-slate-100 px-2 py-1 rounded">No Access</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Kontrol Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-white p-2 md:p-3 rounded-xl border shadow-sm font-black text-[10px] md:text-xs mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition">KEMBALI</button>
          <span className="text-slate-500">HALAMAN {page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition">LANJUT</button>
        </div>
      )}
    </div>
  );
}