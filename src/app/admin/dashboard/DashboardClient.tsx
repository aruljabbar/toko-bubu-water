'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export default function DashboardClient({ totalOmzet, totalLaba, totalPiutang, produkTerlaris, stokMenipis, chartData, totalTransaksi }: any) {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-2xl font-black text-slate-800">📊 Summary & Kinerja Toko</h1>

      {/* KARTU SUMMARY (Grid seragam dengan truncate) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-blue-100 flex flex-col justify-center h-full">
          <div className="text-slate-500 text-[10px] md:text-xs font-bold mb-1 truncate">TOTAL OMZET KOTOR</div>
          <div className="text-xl md:text-2xl font-black text-blue-600 truncate" title={`Rp ${totalOmzet.toLocaleString('id-ID')}`}>
            Rp {totalOmzet.toLocaleString('id-ID')}
          </div>
        </div>
        
        <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-emerald-100 flex flex-col justify-center h-full">
          <div className="text-slate-500 text-[10px] md:text-xs font-bold mb-1 truncate">TOTAL LABA BERSIH</div>
          <div className="text-xl md:text-2xl font-black text-emerald-600 truncate" title={`Rp ${totalLaba.toLocaleString('id-ID')}`}>
            Rp {totalLaba.toLocaleString('id-ID')}
          </div>
        </div>
        
        <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-rose-100 flex flex-col justify-center h-full">
          <div className="text-slate-500 text-[10px] md:text-xs font-bold mb-1 truncate">PIUTANG (KASBON MEMBER)</div>
          <div className="text-xl md:text-2xl font-black text-rose-600 truncate" title={`Rp ${totalPiutang.toLocaleString('id-ID')}`}>
            Rp {totalPiutang.toLocaleString('id-ID')}
          </div>
        </div>
        
        <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center h-full">
          <div className="text-slate-500 text-[10px] md:text-xs font-bold mb-1 truncate">TOTAL TRANSAKSI (NOTA)</div>
          <div className="text-xl md:text-2xl font-black text-slate-800 truncate" title={`${totalTransaksi} Nota`}>
            {totalTransaksi} <span className="text-sm font-semibold">Nota</span>
          </div>
        </div>

      </div>

      {/* AREA GRAFIK & LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        
        {/* KIRI - CHART */}
        <div className="col-span-1 lg:col-span-2 bg-white p-4 md:p-6 rounded-2xl shadow-sm border flex flex-col min-h-[350px]">
          <h2 className="font-bold text-slate-700 mb-4 md:mb-6 text-sm md:text-base">📈 Grafik Omzet & Laba (7 Hari Terakhir)</h2>
          <div className="flex-1 w-full min-h-[250px] md:min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="tanggal" fontSize={10} tickLine={false} axisLine={false} />
                {/* Agar sumbu Y rapi dan tidak meluap (memakai prefix 'k' untuk ribuan) */}
                <YAxis fontSize={10} tickFormatter={(val) => `Rp${val/1000}k`} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(val: any) => typeof val === 'number' ? `Rp ${val.toLocaleString('id-ID')}` : val} />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Bar dataKey="Omzet" fill="#3b82f6" radius={[4,4,0,0]} maxBarSize={50} />
                <Bar dataKey="Laba" fill="#10b981" radius={[4,4,0,0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* KANAN - ALERT STOK & TERLARIS */}
        <div className="space-y-4 md:space-y-6">
          <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border">
            <h2 className="font-bold text-rose-600 mb-3 text-sm flex items-center gap-2">⚠️ Peringatan Stok Menipis</h2>
            <ul className="space-y-2.5">
              {stokMenipis.length === 0 ? <p className="text-xs text-slate-500 italic">Semua stok terpantau aman.</p> : stokMenipis.map((p: any) => (
                <li key={p.id} className="flex justify-between items-center text-[11px] md:text-xs border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                  <span className="font-semibold text-slate-700 truncate pr-2 max-w-[180px]">{p.namaProduk}</span>
                  <span className={`font-black px-2 py-0.5 rounded whitespace-nowrap ${p.stok <= 0 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                    Sisa {p.stok}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border">
            <h2 className="font-bold text-amber-600 mb-3 text-sm flex items-center gap-2">🔥 Top 5 Produk Terlaris</h2>
            <ul className="space-y-2.5">
              {produkTerlaris.length === 0 ? <p className="text-xs text-slate-500 italic">Belum ada data penjualan.</p> : produkTerlaris.map((p: any, i: number) => (
                <li key={i} className="flex justify-between items-center text-[11px] md:text-xs border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                  <span className="font-semibold text-slate-700 truncate pr-2 max-w-[180px]">{p.nama}</span>
                  <span className="font-black text-amber-600 whitespace-nowrap">{p.qty} Terjual</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}