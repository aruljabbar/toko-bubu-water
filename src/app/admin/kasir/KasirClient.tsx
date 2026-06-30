'use client'

import { useState, useEffect, useRef } from 'react';
import { prosesCheckout } from '../../../actions/kasir';
import { bukaShift, tutupShift } from '../../../actions/shift';

export default function KasirClient({ daftarProduk, daftarMember, activeShift }: any) {
  const [keranjang, setKeranjang] = useState<any[]>([]);
  const [nomorHp, setNomorHp] = useState('');
  const [namaBaru, setNamaBaru] = useState('');
  const [isMemberBaru, setIsMemberBaru] = useState(false);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('Semua');
  const [pageProd, setPageProd] = useState(1);
  const itemsPerPage = 12;

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTutupShiftModal, setShowTutupShiftModal] = useState(false);
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => { 
    setIsClient(true);
    const saved = localStorage.getItem('bubuKeranjang'); 
    if (saved) setKeranjang(JSON.parse(saved)); 
  }, []);
  
  useEffect(() => { 
    if(isClient) localStorage.setItem('bubuKeranjang', JSON.stringify(keranjang)); 
  }, [keranjang, isClient]);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) { 
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setShowMemberDropdown(false); 
    }
    document.addEventListener("mousedown", handleClickOutside); 
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredMembers = daftarMember.filter((m:any) => { 
    if(!nomorHp) return false; 
    const q = nomorHp.toLowerCase(); 
    return m.nomorHp.includes(q) || m.nama.toLowerCase().includes(q); 
  });
  
  const dapatkanHargaAktif = (item: any) => (item.produk.minGrosir && item.produk.hargaGrosir && item.kuantitas >= item.produk.minGrosir) ? item.produk.hargaGrosir : item.produk.harga;
  const totalBelanja = keranjang.reduce((acc, item) => acc + (dapatkanHargaAktif(item) * item.kuantitas), 0);
  
  const kategoriList: string[] = ['Semua', ...Array.from(new Set(daftarProduk.map((p:any) => p.kategori).filter(Boolean))) as string[]];

  const produkFiltered = daftarProduk.filter((p:any) => {
    return (p.namaProduk.toLowerCase().includes(searchQuery.toLowerCase()) || p.barcode?.includes(searchQuery)) &&
           (selectedKategori === 'Semua' || p.kategori === selectedKategori);
  }).sort((a:any, b:any) => a.namaProduk.localeCompare(b.namaProduk));

  const currentProducts = produkFiltered.slice((pageProd - 1) * itemsPerPage, pageProd * itemsPerPage);
  const totalPages = Math.ceil(produkFiltered.length / itemsPerPage);

  const tambahKeKeranjang = (produk: any) => {
    setKeranjang((prev) => {
      const ada = prev.find(item => item.produk.id === produk.id);
      if (ada) {
        if (ada.kuantitas >= produk.stok) { alert(`Stok habis!`); return prev; }
        return prev.map(item => item.produk.id === produk.id ? { ...item, kuantitas: item.kuantitas + 1 } : item);
      }
      if (produk.stok <= 0) { alert(`Stok habis!`); return prev; }
      return [{ produk, kuantitas: 1 }, ...prev]; 
    });
  };

  const hapusItem = (id: number) => setKeranjang(prev => prev.filter(item => item.produk.id !== id));
  const hapusSemua = () => { if(confirm('Kosongkan semua keranjang?')) setKeranjang([]); };

  useEffect(() => {
    if (!activeShift) return; 
    let buffer = ''; let timer: NodeJS.Timeout;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'Enter' && buffer.length > 0) {
        e.preventDefault(); const found = daftarProduk.find((p:any) => p.barcode === buffer);
        if (found) tambahKeKeranjang(found); else alert(`Barcode ${buffer} tidak ditemukan!`);
        buffer = '';
      } else if (e.key.length === 1) { 
        buffer += e.key; clearTimeout(timer); timer = setTimeout(() => { buffer = ''; }, 100); 
      }
    };
    window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown);
  }, [daftarProduk, activeShift]);

  const getQuickCashOptions = (total: number) => {
    if (total <= 0) return [];
    const options = new Set<number>([total]); 
    const thresholds = [5000, 10000, 20000, 50000, 100000];
    thresholds.forEach(t => { const ceil = Math.ceil(total / t) * t; if (ceil > total) options.add(ceil); });
    if (total > 100000) {
       const base = Math.floor(total / 100000) * 100000;
       const remainder = total % 100000;
       if (remainder > 0 && remainder < 50000) options.add(base + 50000);
       options.add(base + 100000);
    }
    return Array.from(options).sort((a,b) => a - b);
  };

  const initiatePayment = () => {
    if (keranjang.length === 0) return;
    if (nomorHp.trim() !== '') {
      if (!/^08[0-9]{8,11}$/.test(nomorHp.trim())) { alert("Format Nomor HP salah! Wajib berawalan '08' (10-13 digit angka)."); return; }
      if (isMemberBaru && namaBaru.trim() === '') { alert("Isi nama pelanggan baru!"); return; }
    }
    setCashReceived(totalBelanja); setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async () => {
    setLoading(true);
    const isKasbon = cashReceived < totalBelanja;
    const mapped = keranjang.map(item => ({ 
      id: item.produk.id, 
      namaProduk: `${item.produk.namaProduk} (${item.produk.satuan})`, 
      kuantitas: item.kuantitas, 
      hargaAktif: dapatkanHargaAktif(item), 
      modalAktif: (item.produk.minGrosir && item.produk.hargaModalGrosir && item.kuantitas >= item.produk.minGrosir) ? item.produk.hargaModalGrosir : item.produk.hargaModal 
    }));

    try {
      await prosesCheckout({ 
        nomorHp: nomorHp || 'Tanpa Member', 
        namaBaru: isMemberBaru ? namaBaru : undefined, 
        totalBelanja, 
        shiftId: activeShift.id, 
        cashReceived, 
        kembalian: cashReceived > totalBelanja ? cashReceived - totalBelanja : 0, 
        isKasbon, 
        keranjang: mapped 
      });
      alert('Transaksi Sukses! 🎉'); 
      setKeranjang([]); setNomorHp(''); setNamaBaru(''); setShowPaymentModal(false); 
      localStorage.removeItem('bubuKeranjang');
    } catch (err) { 
      alert('Gagal memproses pembayaran.'); 
    } finally { 
      setLoading(false); 
    }
  };

  if (!isClient) return null; 

  if (!activeShift) {
    return (
      <div className="flex min-h-screen bg-slate-50 items-center justify-center p-4">
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-md text-center border border-slate-200">
          <div className="text-4xl mb-4">🔐</div><h2 className="text-xl md:text-2xl font-black text-slate-800 mb-2">Akses Kasir Terkunci</h2>
          <p className="text-xs md:text-sm text-slate-500 font-semibold mb-6">Harap buka shift dengan menginput saldo modal awal uang laci kasir.</p>
          <form action={bukaShift} className="space-y-4">
            <input type="number" name="modalAwal" required placeholder="Contoh: 150000" className="w-full border-2 focus:border-blue-500 rounded-xl p-4 text-xl font-black text-center text-slate-800 bg-slate-50 outline-none" />
            <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-700 shadow-md transition">🗝️ BUKA SHIFT & LACI KASIR</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <div className="bg-white border-b px-4 lg:px-6 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm gap-3 shrink-0">
        <div className="flex flex-wrap gap-3 items-center">
          <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-[10px] md:text-xs font-black">🟢 SHIFT AKTIF</span>
          <span className="text-[10px] md:text-xs font-bold text-slate-500">Mulai: {new Date(activeShift.waktuBuka).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', timeStyle: 'short', dateStyle: 'short' })}</span>
          <span className="text-[10px] md:text-xs font-bold text-slate-500">Modal Laci: Rp {activeShift.modalAwal.toLocaleString('id-ID')}</span>
        </div>
        <button onClick={() => setShowTutupShiftModal(true)} className="bg-rose-50 text-rose-600 border border-rose-200 px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-black hover:bg-rose-100 w-full sm:w-auto transition">🔒 TUTUP SHIFT KASIR</button>
      </div>

      {/* PERBAIKAN: flex-1 min-h-0 Mencegah konten melar dan mendorong footer ke bawah. */}
      <div className="flex flex-col-reverse lg:flex-row gap-4 p-4 lg:p-6 flex-1 min-h-0 overflow-hidden">
        
        {/* KOLOM KIRI - PRODUK */}
        <div className="w-full lg:w-2/3 flex flex-col gap-4 h-full min-h-0">
          <div className="flex gap-2 bg-white p-3 rounded-xl shadow-sm border items-center shrink-0">
            <input type="text" placeholder="🔍 Cari / Scan Barcode..." value={searchQuery} onChange={e => {setSearchQuery(e.target.value); setPageProd(1);}} className="flex-1 border rounded-lg p-2 md:p-2.5 text-xs md:text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            <select value={selectedKategori} onChange={e => {setSelectedKategori(e.target.value); setPageProd(1);}} className="border rounded-lg p-2 md:p-2.5 text-xs md:text-sm font-bold bg-slate-50 outline-none">
              {kategoriList.map(kat => <option key={kat} value={kat}>{kat}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 gap-3 overflow-y-auto pr-1 items-start flex-1 min-h-0 pb-4">
            {currentProducts.map((p:any) => (
              <button key={p.id} onClick={() => tambahKeKeranjang(p)} className="bg-white p-2 md:p-3 rounded-xl shadow-sm border flex flex-col items-center text-center hover:border-blue-500 relative transition-colors group">
                {p.stok <= 0 && <div className="absolute inset-0 bg-white/70 flex items-center justify-center font-black text-rose-600 z-10 rounded-xl text-lg backdrop-blur-[1px]">HABIS</div>}
                {p.gambarUrl ? <img src={p.gambarUrl} className="h-12 w-12 md:h-16 md:w-16 object-cover rounded-lg border mb-1.5" /> : <div className="h-12 w-12 md:h-16 md:w-16 bg-slate-100 rounded-lg mb-1.5 flex items-center justify-center text-[8px] md:text-[10px] text-slate-400 font-bold group-hover:bg-blue-50 transition">No Img</div>}
                <div className="font-bold text-slate-800 line-clamp-2 text-[10px] md:text-xs leading-tight w-full h-[28px] md:h-[32px] overflow-hidden">{p.namaProduk}</div>
                <div className="text-[8px] md:text-[10px] text-slate-400 font-mono mt-1 w-full truncate border-b pb-1">||| {p.barcode || 'No-Code'}</div>
                <div className="mt-1 w-full">
                  <div className="text-blue-600 font-black text-[11px] md:text-sm">Rp {p.harga.toLocaleString('id-ID')}</div>
                  <div className="text-[8px] md:text-[10px] text-slate-500 font-semibold border-t border-slate-100 pt-0.5 mt-0.5">Sisa: {p.stok} {p.satuan}</div>
                </div>
              </button>
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-between items-center bg-white p-2 md:p-3 rounded-xl border shrink-0 shadow-sm">
              <button onClick={() => setPageProd(p => Math.max(1, p - 1))} disabled={pageProd === 1} className="px-3 md:px-4 py-1.5 md:py-2 bg-slate-100 rounded-lg font-bold text-[10px] md:text-xs disabled:opacity-50 text-slate-600 hover:bg-slate-200 transition">Prev</button>
              <span className="text-[10px] md:text-xs font-bold text-slate-500">Hal {pageProd} / {totalPages}</span>
              <button onClick={() => setPageProd(p => Math.min(totalPages, p + 1))} disabled={pageProd === totalPages} className="px-3 md:px-4 py-1.5 md:py-2 bg-slate-100 rounded-lg font-bold text-[10px] md:text-xs disabled:opacity-50 text-slate-600 hover:bg-slate-200 transition">Next</button>
            </div>
          )}
        </div>

        {/* KOLOM KANAN - KERANJANG */}
        <div className="w-full lg:w-1/3 bg-white p-4 lg:p-5 rounded-xl shadow-sm border flex flex-col max-h-[50vh] lg:max-h-full shrink-0">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2 md:pb-3 mb-2 shrink-0">
            <h2 className="text-sm md:text-lg font-black text-slate-800">🛒 Keranjang Kasir</h2>
            {keranjang.length > 0 && <button onClick={hapusSemua} className="text-[9px] md:text-xs bg-rose-50 text-rose-600 border border-rose-200 px-2 md:px-3 py-1 md:py-1.5 rounded-lg font-bold hover:bg-rose-100 transition">🗑️ Kosongkan</button>}
          </div>
          
          {/* PERBAIKAN: flex-1 min-h-0 agar list keranjang bisa di-scroll secara independen */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
            {keranjang.length === 0 ? <p className="text-center text-slate-400 text-xs py-8 italic font-semibold">Belum ada barang di keranjang</p> : 
              keranjang.map(item => (
                <div key={item.produk.id} className="flex justify-between items-center text-[10px] md:text-xs border-b border-slate-100 pb-2 group relative">
                  <button onClick={() => hapusItem(item.produk.id)} className="absolute -left-1 -top-1 bg-rose-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-black shadow opacity-100 lg:opacity-0 lg:group-hover:opacity-100 z-10 transition-opacity">✕</button>
                  <div className="flex-1 pr-1 pl-3">
                    <div className="font-bold text-slate-800 line-clamp-1">{item.produk.namaProduk}</div>
                    <div className="text-[9px] md:text-[10px] text-slate-500">Rp {dapatkanHargaAktif(item).toLocaleString('id-ID')} / {item.produk.satuan}</div>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2">
                    <input type="number" step="any" value={item.kuantitas === 0 ? '' : item.kuantitas} onChange={e => {
                      const val = Number(e.target.value);
                      if(val < 0) return;
                      if(val === 0) hapusItem(item.produk.id);
                      else if(val > item.produk.stok) alert('Stok gudang tidak cukup!');
                      else setKeranjang(prev => prev.map(i => i.produk.id === item.produk.id ? { ...i, kuantitas: val } : i));
                    }} className="w-12 md:w-16 border border-slate-200 rounded p-1 text-center font-black bg-slate-50 text-slate-800 outline-none focus:ring-1 focus:ring-blue-500" />
                    <div className="font-bold text-blue-700 text-right w-16 md:w-20">Rp {(dapatkanHargaAktif(item) * item.kuantitas).toLocaleString('id-ID')}</div>
                  </div>
                </div>
              ))
            }
          </div>

          <div className="shrink-0 border-t border-slate-200 pt-3 md:pt-4 space-y-3 md:space-y-4 mt-2 bg-white">
            <div className="flex justify-between items-center text-lg md:text-2xl font-black text-slate-800">
              <span>TOTAL:</span><span className="text-blue-600">Rp {totalBelanja.toLocaleString('id-ID')}</span>
            </div>
            
            <div className="bg-slate-50 p-2 md:p-3 rounded-xl border border-slate-200 space-y-2 relative" ref={wrapperRef}>
              <label className="block text-[9px] md:text-xs font-bold text-slate-600">🔍 Cari / Tambah Member</label>
              <input type="text" value={nomorHp} onChange={e => { setNomorHp(e.target.value); setShowMemberDropdown(true); setIsMemberBaru(true); setNamaBaru(''); }} onFocus={() => setShowMemberDropdown(true)} placeholder="Nomor HP Pelanggan..." className="w-full p-2 border rounded-lg text-xs md:text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none" />
              
              {showMemberDropdown && nomorHp.length > 0 && (
                <ul className="absolute z-20 w-full bg-white border rounded-lg shadow-xl max-h-40 overflow-auto top-12 left-0">
                  {filteredMembers.length > 0 ? filteredMembers.map((m:any) => (
                    <li key={m.nomorHp} onClick={() => { setNomorHp(m.nomorHp); setNamaBaru(m.nama); setIsMemberBaru(false); setShowMemberDropdown(false); }} className="p-2 md:p-3 hover:bg-blue-50 cursor-pointer border-b border-slate-100">
                      <div className="font-bold text-[11px] md:text-sm text-slate-800">{m.nama}</div><div className="text-[10px] md:text-xs text-blue-600 font-mono">{m.nomorHp}</div>
                    </li>
                  )) : <li className="p-3 text-[10px] md:text-xs text-center text-slate-500 font-semibold italic">Dicatat sebagai member baru.</li>}
                </ul>
              )}
              
              {nomorHp.trim() !== '' && (
                <input type="text" value={namaBaru} onChange={e => setNamaBaru(e.target.value)} disabled={!isMemberBaru} placeholder="Nama Pelanggan Baru (Wajib)..." className="w-full p-2 border rounded-lg text-xs md:text-sm font-bold text-slate-800 disabled:bg-slate-100 disabled:text-slate-500 outline-none focus:ring-2 focus:ring-blue-500" />
              )}
            </div>
            
            <button onClick={initiatePayment} className="w-full bg-blue-600 text-white font-black py-3 rounded-xl hover:bg-blue-700 shadow-md text-sm md:text-base tracking-wide transition">💳 BAYAR TAGIHAN</button>
          </div>
        </div>
      </div>

      {/* MODAL PEMBAYARAN KASIR */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-xl w-full max-w-md space-y-4 border border-slate-200">
            <h3 className="text-base md:text-lg font-black text-slate-800 border-b pb-2">💵 Konfirmasi Metode Pembayaran</h3>
            <div className="flex justify-between items-center bg-blue-50 text-blue-800 p-3 md:p-4 rounded-xl font-black border border-blue-100 text-base md:text-lg">
              <span>Total Tagihan:</span><span>Rp {totalBelanja.toLocaleString('id-ID')}</span>
            </div>
            <div className="space-y-3">
              <label className="block text-[10px] md:text-xs font-bold text-slate-600">Pilih Pecahan Tunai Diterima / Kasbon:</label>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setCashReceived(0)} className="px-3 py-1.5 md:py-2 rounded-lg text-[10px] md:text-xs font-black border bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 transition">📝 KASBON (Rp 0)</button>
                {getQuickCashOptions(totalBelanja).map(amt => (
                  <button key={amt} onClick={() => setCashReceived(amt)} className={`px-3 py-1.5 md:py-2 rounded-lg text-[10px] md:text-xs font-black transition border shadow-sm ${cashReceived === amt && cashReceived !== 0 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}>
                    {amt === totalBelanja ? '✅ UANG PAS' : `Rp ${amt.toLocaleString('id-ID')}`}
                  </button>
                ))}
              </div>
              <input type="number" value={cashReceived === 0 ? '' : cashReceived} onChange={e => setCashReceived(Number(e.target.value))} placeholder="0 (Kosongkan jika Full Kasbon)" className="w-full border-2 focus:border-blue-500 rounded-xl p-3 text-lg md:text-xl font-black text-center text-slate-800 bg-slate-50 outline-none transition" />
            </div>
            
            <div className="pt-2">
              {cashReceived >= totalBelanja ? (
                <div className="flex justify-between text-emerald-700 font-black bg-emerald-50 p-3 md:p-4 rounded-xl text-sm md:text-lg border border-emerald-200"><span>Kembalian:</span><span>Rp {(cashReceived - totalBelanja).toLocaleString('id-ID')}</span></div>
              ) : (
                <div className="flex justify-between text-rose-700 font-black bg-rose-50 p-3 md:p-4 rounded-xl text-sm md:text-lg border border-rose-200"><span>Catat Piutang:</span><span>Rp {(totalBelanja - cashReceived).toLocaleString('id-ID')}</span></div>
              )}
            </div>

            <div className="flex gap-2 md:gap-3 pt-2">
              <button onClick={() => setShowPaymentModal(false)} className="flex-1 py-2.5 md:py-3 bg-slate-100 text-slate-600 font-bold text-sm md:text-base rounded-xl hover:bg-slate-200 transition">Batal</button>
              <button onClick={handlePaymentSubmit} disabled={loading || (cashReceived < totalBelanja && !nomorHp)} className="flex-1 py-2.5 md:py-3 bg-emerald-600 text-white font-black text-sm md:text-base rounded-xl hover:bg-emerald-700 transition shadow-md disabled:opacity-50">Selesai & Simpan</button>
            </div>
          </div>
        </div>
      )}

      {showTutupShiftModal && activeShift && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 md:p-8 rounded-3xl w-full max-w-sm text-center space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="text-lg md:text-xl font-black text-rose-600 border-b pb-4">🔒 Tutup Shift Laci Kasir</h3>
            <p className="text-[10px] md:text-xs font-semibold text-slate-500 mb-2">Hitung seluruh uang fisik di laci kasir sekarang dan masukkan totalnya untuk kroscek sistem.</p>
            <form action={tutupShift} className="space-y-4">
              <input type="hidden" name="shiftId" value={activeShift.id} />
              <input type="number" name="uangFisik" required placeholder="Uang Fisik Laci..." className="w-full border-2 border-rose-200 focus:border-rose-500 rounded-xl p-3 md:p-4 text-xl md:text-2xl font-black text-center text-rose-900 bg-rose-50 outline-none" />
              <div className="flex gap-2 md:gap-3 pt-2">
                <button type="button" onClick={() => setShowTutupShiftModal(false)} className="flex-1 py-2.5 md:py-3 bg-slate-200 text-slate-600 font-bold rounded-xl text-xs md:text-sm hover:bg-slate-300 transition">Batal</button>
                <button type="submit" className="flex-1 py-2.5 md:py-3 bg-rose-600 text-white font-black rounded-xl text-xs md:text-sm hover:bg-rose-700 shadow-md transition">Laporkan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}