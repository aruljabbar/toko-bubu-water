'use client'
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import Link from 'next/link';

export default function DashboardClient({ rawOrders, rawOrderItems, totalPiutang, stokMenipis }: any) {
  // STATE FILTER
  const [filterType, setFilterType] = useState('7hari'); 
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  
  // STATE FILTER TOP 5 PRODUK
  const [topFilter, setTopFilter] = useState<'qty' | 'omzet' | 'laba'>('qty');

  const now = new Date();
  const getWibDate = (d: Date) => new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
  
  // 1. FILTER TRANSAKSI
  const filteredOrders = rawOrders.filter((o: any) => {
    const oDate = getWibDate(new Date(o.createdAt));
    const today = getWibDate(now);
    
    if (filterType === 'hari_ini') return oDate.toDateString() === today.toDateString();
    if (filterType === '7hari') { const limit = new Date(today); limit.setDate(limit.getDate() - 7); return oDate >= limit; }
    if (filterType === 'bulan_ini') return oDate.getMonth() === today.getMonth() && oDate.getFullYear() === today.getFullYear();
    if (filterType === 'tahun_ini') return oDate.getFullYear() === today.getFullYear();
    if (filterType === 'custom' && customStart && customEnd) {
      const s = new Date(customStart); const e = new Date(customEnd); e.setHours(23,59,59);
      return oDate >= s && oDate <= e;
    }
    return true;
  });

  const validOrderIds = filteredOrders.map((o:any) => o.id);
  const filteredItems = rawOrderItems.filter((i:any) => validOrderIds.includes(i.orderId));

  const totalOmzet = filteredOrders.reduce((acc:number, o:any) => acc + o.totalHarga, 0);
  const totalLaba = filteredItems.reduce((acc:number, i:any) => acc + ((i.hargaSatuan - i.modalSatuan) * i.kuantitas), 0);

  // 2. STATISTIK PRODUK TOP 5
  const statsMap: Record<string, { qty: number, omzet: number, laba: number }> = {};
  filteredItems.forEach((i:any) => {
    if(!statsMap[i.namaProduk]) statsMap[i.namaProduk] = { qty: 0, omzet: 0, laba: 0 };
    statsMap[i.namaProduk].qty += i.kuantitas;
    statsMap[i.namaProduk].omzet += (i.hargaSatuan * i.kuantitas);
    statsMap[i.namaProduk].laba += ((i.hargaSatuan - i.modalSatuan) * i.kuantitas);
  });
  
  const topQty = Object.entries(statsMap).map(([nama, data]) => ({ nama, val: data.qty })).sort((a,b) => b.val - a.val).slice(0,5);
  const topOmzet = Object.entries(statsMap).map(([nama, data]) => ({ nama, val: data.omzet })).sort((a,b) => b.val - a.val).slice(0,5);
  const topLaba = Object.entries(statsMap).map(([nama, data]) => ({ nama, val: data.laba })).sort((a,b) => b.val - a.val).slice(0,5);

  // 3. GENERATE RANGKA WAKTU GRAFIK (DIROMBAK TOTAL AGAR DINAMIS & AKURAT)
  const generateChartData = () => {
    const dataMap: Record<string, { Omzet: number, Laba: number }> = {};
    const today = getWibDate(now);

    if (filterType === 'hari_ini') {
      const label = today.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      dataMap[label] = { Omzet: 0, Laba: 0 };
    } 
    else if (filterType === '7hari') {
      for(let i = 6; i >= 0; i--) {
        const d = new Date(today); d.setDate(d.getDate() - i);
        const label = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        dataMap[label] = { Omzet: 0, Laba: 0 };
      }
    }
    else if (filterType === 'bulan_ini') {
      // Cetak dari tanggal 1 sampai akhir bulan ini
      const endDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      for(let i = 1; i <= endDay; i++) {
        const d = new Date(today.getFullYear(), today.getMonth(), i);
        const label = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        dataMap[label] = { Omzet: 0, Laba: 0 };
      }
    }
    else if (filterType === 'tahun_ini') {
      // Cetak 12 Bulan dalam setahun
      for(let i = 0; i < 12; i++) {
        const d = new Date(today.getFullYear(), i, 1);
        const label = d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
        dataMap[label] = { Omzet: 0, Laba: 0 };
      }
    }
    else if (filterType === 'custom' && customStart && customEnd) {
      const start = new Date(customStart);
      const end = new Date(customEnd);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const limitDays = Math.min(diffDays, 60); // Max rentang hari agar browser tidak hang
      for(let i = 0; i <= limitDays; i++) {
        const d = new Date(start); d.setDate(d.getDate() + i);
        const label = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        dataMap[label] = { Omzet: 0, Laba: 0 };
      }
    }

    // Masukkan data transaksi ke dalam rangkanya
    filteredOrders.forEach((o:any) => {
      const oDate = getWibDate(new Date(o.createdAt));
      let label = '';
      if (filterType === 'tahun_ini') {
        label = oDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      } else {
        label = oDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      }

      if(dataMap[label] !== undefined) {
        dataMap[label].Omzet += o.totalHarga;
        const items = filteredItems.filter((i:any) => i.orderId === o.id);
        dataMap[label].Laba += items.reduce((acc:number, i:any) => acc + ((i.hargaSatuan - i.modalSatuan) * i.kuantitas), 0);
      }
    });

    return Object.keys(dataMap).map(k => ({ tanggal: k, ...dataMap[k] }));
  };

  const chartData = generateChartData();

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-xl md:text-2xl font-black text-slate-800">📊 Dashboard Kinerja Toko</h1>
        
        <div className="flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-xl shadow-sm border w-full md:w-auto">
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="border rounded-lg p-2 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="hari_ini">Hari Ini</option>
            <option value="7hari">7 Hari Terakhir</option>
            <option value="bulan_ini">Bulan Ini</option>
            <option value="tahun_ini">Tahun Ini</option>
            <option value="custom">Pilih Tanggal Manual</option>
          </select>
          {filterType === 'custom' && (
            <div className="flex items-center gap-2">
              <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="border rounded-lg p-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none" />
              <span className="text-xs font-bold text-slate-500">-</span>
              <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="border rounded-lg p-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-blue-100 flex flex-col justify-center h-full">
          <div className="text-slate-500 text-[10px] md:text-xs font-bold mb-1 truncate">TOTAL OMZET (SESUAI FILTER)</div>
          <div className="text-xl md:text-2xl font-black text-blue-600 truncate">Rp {totalOmzet.toLocaleString('id-ID')}</div>
        </div>
        <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-emerald-100 flex flex-col justify-center h-full">
          <div className="text-slate-500 text-[10px] md:text-xs font-bold mb-1 truncate">LABA BERSIH (SESUAI FILTER)</div>
          <div className="text-xl md:text-2xl font-black text-emerald-600 truncate">Rp {totalLaba.toLocaleString('id-ID')}</div>
        </div>
        <Link href="/admin/piutang" className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-rose-100 flex flex-col justify-center h-full hover:bg-rose-50 transition">
          <div className="text-slate-500 text-[10px] md:text-xs font-bold mb-1 truncate flex items-center gap-1">PIUTANG (GLOBAL) ↗</div>
          <div className="text-xl md:text-2xl font-black text-rose-600 truncate">Rp {totalPiutang.toLocaleString('id-ID')}</div>
        </Link>
        <Link href="/admin/riwayat" className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center h-full hover:bg-slate-50 transition">
          <div className="text-slate-500 text-[10px] md:text-xs font-bold mb-1 truncate flex items-center gap-1">TOTAL TRANSAKSI ↗</div>
          <div className="text-xl md:text-2xl font-black text-slate-800 truncate">{filteredOrders.length} Nota</div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* WADAH GRAFIK DIBUAT OVERFLOW UNTUK HP */}
        <div className="col-span-1 lg:col-span-2 bg-white p-4 md:p-6 rounded-2xl shadow-sm border flex flex-col">
          <h2 className="font-bold text-slate-700 mb-4 text-sm md:text-base">📈 Grafik Analitik</h2>
          
          <div className="flex-1 w-full min-h-[300px] overflow-x-auto overflow-y-hidden pb-4">
            {/* Lebar min-w-full jika hari sedikit, atau 800px jika data full 1 bulan agar grafiknya tidak gepeng */}
            <div className={`h-full ${chartData.length > 7 ? 'min-w-[800px]' : 'min-w-full'}`}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  
                  {/* PENGATURAN X-AXIS YANG MEMAKSA SEMUA TANGGAL TAMPIL MIRING */}
                  <XAxis 
                    dataKey="tanggal" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    interval={0} // Memaksa setiap tanggal untuk muncul (TIDAK ADA YANG DI-SKIP)
                    angle={-40}  // Tulisan dimiringkan agar muat
                    textAnchor="end" // Posisi text dirapikan
                  />
                  
                  <YAxis fontSize={10} tickFormatter={(val) => `Rp${val/1000}k`} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(val: any) => typeof val === 'number' ? `Rp ${val.toLocaleString('id-ID')}` : val} />
                  <Legend wrapperStyle={{ fontSize: '10px', bottom: 0 }} />
                  <Bar dataKey="Omzet" fill="#3b82f6" radius={[4,4,0,0]} maxBarSize={50} />
                  <Bar dataKey="Laba" fill="#10b981" radius={[4,4,0,0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-4 md:space-y-6">
          <Link href="/admin/produk" className="block bg-white p-4 md:p-5 rounded-2xl shadow-sm border hover:border-rose-300 transition">
            <h2 className="font-bold text-rose-600 mb-3 text-sm flex items-center gap-2">⚠️ Stok Menipis ↗</h2>
            <ul className="space-y-2">
              {stokMenipis.length === 0 ? <p className="text-xs text-slate-500 italic">Semua stok terpantau aman.</p> : 
                stokMenipis.slice(0,4).map((p: any) => (
                  <li key={p.id} className="flex justify-between items-center text-[10px] md:text-xs border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                    <span className="font-semibold text-slate-700 truncate pr-2">{p.namaProduk}</span>
                    <span className="font-black px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded whitespace-nowrap">Sisa {p.stok}</span>
                  </li>
                ))
              }
            </ul>
          </Link>

          {/* TOP 5 TERLARIS DENGAN TOMBOL TAB */}
          <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 border-b border-slate-100 pb-3">
              <h2 className="font-bold text-amber-600 text-sm flex items-center gap-2">🔥 Top 5 Terlaris</h2>
              <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
                <button onClick={() => setTopFilter('qty')} className={`flex-1 sm:flex-none text-[9px] md:text-[10px] font-bold px-3 py-1.5 rounded transition ${topFilter === 'qty' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500 hover:text-slate-800'}`}>Qty (Pcs)</button>
                <button onClick={() => setTopFilter('omzet')} className={`flex-1 sm:flex-none text-[9px] md:text-[10px] font-bold px-3 py-1.5 rounded transition ${topFilter === 'omzet' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>Omzet</button>
                <button onClick={() => setTopFilter('laba')} className={`flex-1 sm:flex-none text-[9px] md:text-[10px] font-bold px-3 py-1.5 rounded transition ${topFilter === 'laba' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-800'}`}>Laba</button>
              </div>
            </div>

            <ul className="space-y-3">
              {topQty.length === 0 && <p className="text-xs text-slate-500 italic text-center py-4">Belum ada data penjualan.</p>}
              
              {topFilter === 'qty' && topQty.map((p, i) => (
                <li key={i} className="flex justify-between items-center text-[11px] md:text-xs border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                  <span className="font-semibold text-slate-700 truncate pr-2 max-w-[200px]">{p.nama}</span>
                  <span className="font-black text-slate-700 bg-slate-100 px-2 py-1 rounded whitespace-nowrap">{p.val} x</span>
                </li>
              ))}

              {topFilter === 'omzet' && topOmzet.map((p, i) => (
                <li key={i} className="flex justify-between items-center text-[11px] md:text-xs border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                  <span className="font-semibold text-slate-700 truncate pr-2 max-w-[200px]">{p.nama}</span>
                  <span className="font-black text-blue-700 bg-blue-50 px-2 py-1 rounded whitespace-nowrap">Rp {(p.val/1000).toFixed(0)}k</span>
                </li>
              ))}

              {topFilter === 'laba' && topLaba.map((p, i) => (
                <li key={i} className="flex justify-between items-center text-[11px] md:text-xs border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                  <span className="font-semibold text-slate-700 truncate pr-2 max-w-[200px]">{p.nama}</span>
                  <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-1 rounded whitespace-nowrap">Rp {(p.val/1000).toFixed(0)}k</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}