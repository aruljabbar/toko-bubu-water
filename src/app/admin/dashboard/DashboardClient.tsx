'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export default function DashboardClient({ totalOmzet, totalLaba, totalPiutang, produkTerlaris, stokMenipis, chartData, totalTransaksi }: any) {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-slate-800">📊 Summary & Kinerja Toko</h1>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-100">
          <div className="text-slate-500 text-xs font-bold mb-1">TOTAL OMZET KOTOR</div>
          <div className="text-2xl font-black text-blue-600">Rp {totalOmzet.toLocaleString('id-ID')}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100">
          <div className="text-slate-500 text-xs font-bold mb-1">TOTAL LABA BERSIH</div>
          <div className="text-2xl font-black text-emerald-600">Rp {totalLaba.toLocaleString('id-ID')}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-rose-100">
          <div className="text-slate-500 text-xs font-bold mb-1">PIUTANG (KASBON MEMBER)</div>
          <div className="text-2xl font-black text-rose-600">Rp {totalPiutang.toLocaleString('id-ID')}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="text-slate-500 text-xs font-bold mb-1">TOTAL TRANSAKSI (NOTA)</div>
          <div className="text-2xl font-black text-slate-800">{totalTransaksi} Nota</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="font-bold text-slate-700 mb-6">📈 Grafik Omzet & Laba (7 Hari Terakhir)</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="tanggal" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickFormatter={(val) => `Rp${val/1000}k`} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} formatter={(val: any) => typeof val === 'number' ? `Rp ${val.toLocaleString('id-ID')}` : val} />
                <Legend />
                <Bar dataKey="Omzet" fill="#3b82f6" radius={[4,4,0,0]} />
                <Bar dataKey="Laba" fill="#10b981" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border">
            <h2 className="font-bold text-rose-600 mb-3 text-sm flex items-center gap-2">⚠️ Peringatan Stok Menipis</h2>
            <ul className="space-y-3">
              {stokMenipis.map((p: any) => (
                <li key={p.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                  <span className="font-semibold text-slate-700 truncate pr-2">{p.namaProduk}</span>
                  <span className={`font-black px-2 py-0.5 rounded text-[10px] ${p.stok <= 0 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                    Sisa {p.stok}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border">
            <h2 className="font-bold text-amber-600 mb-3 text-sm flex items-center gap-2">🔥 Top 5 Produk Terlaris</h2>
            <ul className="space-y-3">
              {produkTerlaris.map((p: any, i: number) => (
                <li key={i} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                  <span className="font-semibold text-slate-700 truncate pr-2">{p.nama}</span>
                  <span className="font-black text-amber-600">{p.qty} Terjual</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}