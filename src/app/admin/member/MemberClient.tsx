'use client'

import { useState } from 'react';
import { editMember, hapusMember } from '../../../actions/member';
import Link from 'next/link';

export default function MemberClient({ daftarMember }: { daftarMember: any[] }) {
  const [search, setSearch] = useState('');
  const [editData, setEditData] = useState<any>(null);

  const filtered = daftarMember.filter(m => m.nama.toLowerCase().includes(search.toLowerCase()) || m.nomorHp.includes(search));

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-slate-800">👥 Manajemen Database Pelanggan</h1>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <div className="flex justify-between items-center mb-6">
          <input type="text" placeholder="🔍 Cari nama atau no HP..." value={search} onChange={e => setSearch(e.target.value)} className="border rounded-lg p-2.5 text-sm w-72 focus:ring-2 focus:ring-blue-500" />
        </div>

        <table className="min-w-full text-sm text-left">
          <thead className="bg-slate-50 font-bold text-slate-500">
            <tr>
              <th className="px-4 py-3">Nama & Kontak</th>
              <th className="px-4 py-3 text-center">Total Transaksi</th>
              <th className="px-4 py-3 text-right">Akumulasi Belanja</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(m => (
              <tr key={m.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="font-bold text-slate-800">{m.nama}</div>
                  <div className="text-xs text-blue-600 font-mono mt-0.5">{m.nomorHp}</div>
                </td>
                <td className="px-4 py-3 text-center font-bold text-lg">{m.totalTransaksi}</td>
                <td className="px-4 py-3 text-right font-bold text-emerald-600">Rp {m.akumulasiBelanja.toLocaleString('id-ID')}</td>
                <td className="px-4 py-3 flex justify-center gap-2">
                  <Link href={`/admin/riwayat?hp=${m.nomorHp}`} className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-200">Riwayat</Link>
                  <button onClick={() => setEditData(m)} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100">Edit</button>
                  <form action={hapusMember} onSubmit={e => { if(!confirm('Hapus member ini?')) e.preventDefault(); }}>
                    <input type="hidden" name="id" value={m.id} />
                    <button type="submit" className="bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-rose-100">Hapus</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-96 shadow-xl">
            <h2 className="font-bold text-lg mb-4">Edit Data Pelanggan</h2>
            <form action={async (fd) => { await editMember(fd); setEditData(null); }} className="space-y-4">
              <input type="hidden" name="id" value={editData.id} />
              <div><label className="text-xs font-bold">Nama Lengkap</label><input type="text" name="nama" defaultValue={editData.nama} className="w-full border rounded p-2" /></div>
              <div><label className="text-xs font-bold">Nomor WhatsApp</label><input type="text" name="nomorHp" defaultValue={editData.nomorHp} className="w-full border rounded p-2" /></div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setEditData(null)} className="flex-1 bg-slate-100 py-2 rounded font-bold">Batal</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded font-bold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}