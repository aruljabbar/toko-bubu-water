'use client'

import { useState } from 'react';
import Link from 'next/link';
import { lunasiKasbon } from '../../../actions/kasir';

export default function PiutangClient({ pengutang, riwayatBayar }: { pengutang: any[], riwayatBayar: any[] }) {
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil(riwayatBayar.length / itemsPerPage);
  const currentRiwayat = riwayatBayar.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">💰 Manajemen Piutang & Member</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="font-bold text-base mb-4 text-rose-600 border-b pb-2">Tagihan Kasbon Berjalan</h2>
          <ul className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {pengutang.length === 0 ? <p className="text-xs text-slate-500 text-center">Buku piutang bersih! 🎉</p> : 
              pengutang.map(p => (
              <li key={p.id} className="border p-4 rounded-xl bg-slate-50 flex flex-col gap-3 hover:border-blue-300 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <Link href={`/admin/riwayat?hp=${p.nomorHp}`} className="font-black text-blue-600 hover:underline text-sm flex items-center gap-1">📱 {p.nomorHp} ↗</Link>
                    <div className="text-xs text-slate-500 font-bold mt-1">👤 Member: {p.nama}</div>
                  </div>
                  <div className="text-rose-600 font-black text-base bg-white px-3 py-1.5 rounded-lg border border-rose-100 shadow-sm">
                    Rp {p.akumulasiUtang?.toLocaleString('id-ID')}
                  </div>
                </div>
                <form action={lunasiKasbon} className="flex gap-2">
                  <input type="hidden" name="nomorHp" value={p.nomorHp} />
                  <input type="number" name="nominalBayar" required placeholder="Masukan nominal pelunasan..." className="border p-2 rounded-lg text-sm flex-1 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold" />
                  <button type="submit" className="bg-emerald-600 text-white font-bold px-4 rounded-lg text-xs hover:bg-emerald-700 transition shadow">Terima Uang</button>
                </form>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col h-fit">
          <h2 className="font-bold text-base mb-4 text-emerald-600 border-b pb-2">Riwayat Setoran Pembayaran</h2>
          <table className="min-w-full text-xs text-left">
            <thead>
              <tr className="text-slate-400 font-bold"><th className="pb-3">Waktu (WIB)</th><th className="pb-3">No. HP Pelanggan</th><th className="pb-3 text-right">Nominal Masuk</th></tr>
            </thead>
            <tbody>
              {currentRiwayat.map(r => (
                <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="py-3 text-slate-500">{new Date(r.tanggalBayar!).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td className="py-3 font-bold text-slate-700">{r.nomorHpPelanggan}</td>
                  <td className="py-3 text-right text-emerald-600 font-black">+Rp {r.nominalBayar.toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 bg-slate-100 rounded font-bold text-xs disabled:opacity-50 text-slate-600">Prev</button>
              <span className="text-xs font-bold text-slate-400">Hal {page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 bg-slate-100 rounded font-bold text-xs disabled:opacity-50 text-slate-600">Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}