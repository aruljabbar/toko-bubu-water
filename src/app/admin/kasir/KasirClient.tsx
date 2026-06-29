'use client'

import { useState, useEffect, useRef } from 'react';
import { prosesCheckout } from '../../../actions/kasir';
import { bukaShift, tutupShift } from '../../../actions/shift';

type Produk = {
  id: number; barcode: string | null; namaProduk: string; kategori: string | null;
  harga: number; hargaGrosir: number | null; minGrosir: number | null;
  hargaModal: number; hargaModalGrosir: number | null; stok: number; gambarUrl: string | null; satuan: string;
};
type Member = { nomorHp: string; nama: string; poin: number; };
type ItemKeranjang = { produk: Produk; kuantitas: number; };

export default function KasirClient({ daftarProduk, daftarMember, activeShift }: { daftarProduk: Produk[]; daftarMember: Member[]; activeShift: any }) {
  const [keranjang, setKeranjang] = useState<ItemKeranjang[]>([]);
  const [nomorHp, setNomorHp] = useState('');
  const [namaBaru, setNamaBaru] = useState('');
  const [isMemberBaru, setIsMemberBaru] = useState(false);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false); 
  const [poinDigunakan, setPoinDigunakan] = useState(0); 
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('Semua');

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showTutupShiftModal, setShowTutupShiftModal] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setIsClient(true); const saved = localStorage.getItem('bubuKeranjang'); if (saved) setKeranjang(JSON.parse(saved)); }, []);
  useEffect(() => { if (isClient) localStorage.setItem('bubuKeranjang', JSON.stringify(keranjang)); }, [keranjang, isClient]);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) { if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setShowMemberDropdown(false); }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredMembers = daftarMember.filter(m => { if(!nomorHp) return false; const q = nomorHp.toLowerCase(); return m.nomorHp.includes(q) || m.nama.toLowerCase().includes(q); });
  const memberAktif = daftarMember.find(m => m.nomorHp === nomorHp);

  const dapatkanHargaAktif = (item: ItemKeranjang) => (item.produk.minGrosir && item.produk.hargaGrosir && item.kuantitas >= item.produk.minGrosir) ? item.produk.hargaGrosir : item.produk.harga;
  const dapatkanModalAktif = (item: ItemKeranjang) => (item.produk.minGrosir && item.produk.hargaModalGrosir && item.kuantitas >= item.produk.minGrosir) ? item.produk.hargaModalGrosir : item.produk.hargaModal;

  const totalBelanja = keranjang.reduce((acc, item) => acc + (dapatkanHargaAktif(item) * item.kuantitas), 0);
  const totalTagihanAkhir = Math.max(0, totalBelanja - poinDigunakan);
  const kategoriList = ['Semua', ...Array.from(new Set(daftarProduk.map(p => p.kategori).filter(Boolean)))];

  const produkFiltered = daftarProduk.filter(p => {
    const matchSearch = p.namaProduk.toLowerCase().includes(searchQuery.toLowerCase()) || p.barcode?.includes(searchQuery);
    const matchKategori = selectedKategori === 'Semua' || p.kategori === selectedKategori;
    return matchSearch && matchKategori;
  }).sort((a, b) => a.namaProduk.localeCompare(b.namaProduk));

  const tambahKeKeranjang = (produk: Produk) => {
    setKeranjang((prev) => {
      const ada = prev.find(item => item.produk.id === produk.id);
      if (ada) {
        if (ada.kuantitas >= produk.stok) { alert(`Stok ${produk.namaProduk} habis!`); return prev; }
        return prev.map(item => item.produk.id === produk.id ? { ...item, kuantitas: item.kuantitas + 1 } : item);
      }
      if (produk.stok <= 0) { alert(`Stok ${produk.namaProduk} habis!`); return prev; }
      return [...prev, { produk, kuantitas: 1 }];
    });
  };

  const hapusItem = (id: number) => setKeranjang(prev => prev.filter(item => item.produk.id !== id));

  useEffect(() => {
    if (!activeShift) return; 
    let buffer = ''; let timer: NodeJS.Timeout;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'Enter' && buffer.length > 0) {
        e.preventDefault();
        const found = daftarProduk.find(p => p.barcode === buffer);
        if (found) tambahKeKeranjang(found); else alert(`Barcode ${buffer} tidak ditemukan!`);
        buffer = '';
      } else if (e.key.length === 1) {
        buffer += e.key; clearTimeout(timer); timer = setTimeout(() => { buffer = ''; }, 100);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
      if (!/^08[0-9]{8,11}$/.test(nomorHp.trim())) { alert("Format Nomor HP salah! Wajib berawalan '08' (10-13 digit)."); return; }
      if (isMemberBaru && namaBaru.trim() === '') { alert("Isi nama pelanggan baru!"); return; }
      if (isMemberBaru && daftarMember.find(m => m.nomorHp === nomorHp)) { alert("HP sudah ada. Pilih dari menu."); return; }
    }
    setCashReceived(totalTagihanAkhir); 
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async () => {
    setLoading(true);
    const isKasbon = cashReceived < totalTagihanAkhir;
    const kembalian = cashReceived > totalTagihanAkhir ? cashReceived - totalTagihanAkhir : 0;
    const mappedKeranjang = keranjang.map(item => ({ id: item.produk.id, namaProduk: `${item.produk.namaProduk} (${item.produk.satuan})`, kuantitas: item.kuantitas, hargaAktif: dapatkanHargaAktif(item), modalAktif: dapatkanModalAktif(item) }));

    try {
      await prosesCheckout({ nomorHp: nomorHp || 'Tanpa Member', namaBaru: isMemberBaru ? namaBaru : undefined, totalBelanja, potonganPoin: poinDigunakan, shiftId: activeShift.id, cashReceived, kembalian, isKasbon, keranjang: mappedKeranjang });
      alert('Transaksi Sukses Disimpan! 🎉');
      setKeranjang([]); setNomorHp(''); setNamaBaru(''); setCashReceived(0); setPoinDigunakan(0); setShowPaymentModal(false);
      localStorage.removeItem('bubuKeranjang');
    } catch (err) { alert('Gagal memproses pembayaran.'); } finally { setLoading(false); }
  };

  if (!isClient) return null; 

  if (!activeShift) {
    return (
      <div className="flex h-full bg-slate-50 items-center justify-center p-4">
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border w-full max-w-md text-center">
          <div className="text-4xl mb-4">🔐</div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-2">Akses Kasir Terkunci</h2>
          <p className="text-xs md:text-sm text-slate-500 font-semibold mb-6">Harap buka shift dengan menginput saldo modal awal uang laci (pecahan/receh) terlebih dahulu.</p>
          <form action={bukaShift} className="space-y-4">
            <input type="number" name="modalAwal" required placeholder="Contoh: 150000" className="w-full border-2 focus:border-blue-500 focus:ring-0 rounded-xl p-4 text-xl font-black text-slate-800 text-center" />
            <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-xl shadow-md hover:bg-blue-700 transition">🗝️ BUKA SHIFT KASIR</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white border-b px-4 lg:px-6 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm gap-3">
        <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
          <span className="bg-emerald-100 text-emerald-800 px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-black flex items-center gap-1">🟢 SHIFT AKTIF</span>
          <span className="text-[10px] sm:text-xs font-bold text-slate-500">Mulai: {new Date(activeShift.waktuBuka).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', timeStyle: 'short', dateStyle: 'short' })}</span>
          <span className="text-[10px] sm:text-xs font-bold text-slate-500">Modal Laci: Rp {activeShift.modalAwal.toLocaleString('id-ID')}</span>
        </div>
        <button onClick={() => setShowTutupShiftModal(true)} className="bg-rose-50 text-rose-600 border border-rose-200 px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-black hover:bg-rose-100 transition w-full sm:w-auto">🔒 TUTUP SHIFT KASIR</button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 p-4 lg:p-6 flex-1 h-full overflow-hidden">
        
        {/* KOLOM KIRI (DAFTAR PRODUK) */}
        <div className="w-full lg:w-2/3 flex flex-col gap-4 h-full">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 bg-white p-3 sm:p-4 rounded-xl shadow-sm border items-center shrink-0">
            <div className="relative flex-1 w-full">
              <input type="text" placeholder="🔍 Cari Produk atau Scan Barcode..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 pr-8" />
              {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-400 font-bold hover:text-rose-500">✕</button>}
            </div>
            <select value={selectedKategori} onChange={e => setSelectedKategori(e.target.value)} className="w-full sm:w-auto border rounded-lg p-2.5 text-sm bg-white font-bold text-slate-700">
              {kategoriList.map(kat => <option key={kat} value={kat!}>{kat}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4 overflow-y-auto pb-4 h-full pr-1">
            {produkFiltered.map(p => (
              <button key={p.id} onClick={() => tambahKeKeranjang(p)} className="bg-white p-3 rounded-xl shadow-sm border text-left flex flex-col items-center text-center hover:border-blue-500 transition relative">
                {p.stok <= 0 && <div className="absolute inset-0 bg-white/70 flex items-center justify-center font-black text-rose-600 text-lg z-10 rounded-xl">HABIS</div>}
                {p.gambarUrl ? <img src={p.gambarUrl} className="h-14 w-14 lg:h-16 lg:w-16 object-cover rounded-lg border mb-2" /> : <div className="h-14 w-14 lg:h-16 lg:w-16 bg-slate-100 rounded-lg mb-2 flex items-center justify-center text-[10px] font-bold text-slate-400 border">No Img</div>}
                <div className="font-bold text-slate-800 line-clamp-2 text-[11px] lg:text-xs leading-tight w-full">{p.namaProduk}</div>
                <div className="text-[9px] font-bold text-slate-400 mt-1 bg-slate-100 px-1.5 py-0.5 rounded">{p.kategori || 'Umum'}</div>
                <div className="text-[9px] lg:text-[10px] text-slate-400 font-mono mt-1 w-full truncate border-b pb-1">||| {p.barcode || 'No-Code'}</div>
                <div className="mt-auto pt-2 w-full">
                  <div className="text-blue-600 font-black text-xs lg:text-sm">Rp {p.harga.toLocaleString('id-ID')}</div>
                  {p.hargaGrosir && <div className="text-[9px] lg:text-[10px] text-emerald-600 font-bold">Grosir: Rp {p.hargaGrosir.toLocaleString('id-ID')}</div>}
                  <div className="text-[9px] lg:text-[10px] text-slate-500 mt-1 font-semibold border-t pt-1">Sisa: {p.stok} {p.satuan}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* KOLOM KANAN (KERANJANG KASIR) */}
        <div className="w-full lg:w-1/3 bg-white p-4 lg:p-5 rounded-xl shadow-sm border flex flex-col h-[60vh] lg:h-full shrink-0">
          <div className="flex-1 overflow-hidden flex flex-col">
            <h2 className="text-base lg:text-lg font-black text-slate-800 border-b pb-2 mb-4 flex items-center gap-2 shrink-0">🛒 Keranjang Kasir</h2>
            <div className="overflow-y-auto space-y-3 pr-1 flex-1">
              {keranjang.length === 0 ? <p className="text-center text-slate-400 text-xs lg:text-sm py-8 font-medium">Keranjang kosong</p> : 
                keranjang.map(item => {
                  const activePrice = dapatkanHargaAktif(item);
                  return (
                    <div key={item.produk.id} className="flex justify-between items-center text-xs lg:text-sm border-b pb-2 relative group">
                      <button onClick={() => hapusItem(item.produk.id)} className="absolute -left-2 -top-2 bg-rose-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold shadow-sm opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition">✕</button>
                      <div className="flex-1 pr-2 pl-3">
                        <div className="font-bold text-slate-700 line-clamp-1">{item.produk.namaProduk}</div>
                        <div className="text-[10px] lg:text-xs text-slate-400">Rp {activePrice.toLocaleString('id-ID')} / {item.produk.satuan}</div>
                      </div>
                      <div className="flex items-center gap-1 lg:gap-2">
                        <input type="number" step="any" value={item.kuantitas === 0 ? '' : item.kuantitas} onChange={e => {
                          const val = Number(e.target.value);
                          if(val < 0) return;
                          if(val === 0) { setKeranjang(prev => prev.filter(i => i.produk.id !== item.produk.id)); }
                          else if(val > item.produk.stok) alert('Stok tidak cukup!');
                          else setKeranjang(prev => prev.map(i => i.produk.id === item.produk.id ? { ...i, kuantitas: val } : i));
                        }} className="w-12 lg:w-16 border rounded p-1 text-center font-black text-slate-800 bg-slate-50 text-xs lg:text-sm" />
                        <div className="font-bold text-slate-800 text-right w-16 lg:w-20">Rp {(activePrice * item.kuantitas).toLocaleString('id-ID')}</div>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </div>

          <div className="border-t pt-4 space-y-3 mt-4 shrink-0">
            <div className="flex justify-between items-center text-xs lg:text-sm font-bold text-slate-600">
              <span>Total Kotor:</span><span>Rp {totalBelanja.toLocaleString('id-ID')}</span>
            </div>
            {poinDigunakan > 0 && (
              <div className="flex justify-between items-center text-xs lg:text-sm font-bold text-orange-500">
                <span>Diskon Poin:</span><span>-Rp {poinDigunakan.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-lg lg:text-2xl font-black text-blue-700 pt-1 border-t">
              <span>Grand Total:</span><span>Rp {totalTagihanAkhir.toLocaleString('id-ID')}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border space-y-3 relative" ref={wrapperRef}>
              <div>
                <label className="block text-[10px] lg:text-xs font-bold text-slate-600 mb-1">🔍 Cari Member (No. HP / Nama)</label>
                <input type="text" value={nomorHp} onChange={e => { setNomorHp(e.target.value); setShowMemberDropdown(true); setIsMemberBaru(true); setNamaBaru(''); setPoinDigunakan(0); }} onFocus={() => setShowMemberDropdown(true)} placeholder="08123..." className="w-full p-2 border rounded-lg text-xs lg:text-sm bg-white focus:ring-2 focus:ring-blue-500" />
                {showMemberDropdown && nomorHp.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border rounded-lg shadow-xl mt-1 max-h-40 overflow-auto">
                    {filteredMembers.length > 0 ? (
                      filteredMembers.map(m => (
                        <li key={m.nomorHp} onClick={() => { setNomorHp(m.nomorHp); setNamaBaru(m.nama); setIsMemberBaru(false); setShowMemberDropdown(false); setPoinDigunakan(0); }} className="p-2 hover:bg-blue-50 cursor-pointer border-b last:border-0">
                          <div className="font-bold text-slate-800 text-[11px] lg:text-sm">{m.nama} <span className="text-orange-500 text-[10px] lg:text-xs">(Poin: {m.poin})</span></div>
                          <div className="text-[10px] lg:text-xs text-blue-600 font-mono">{m.nomorHp}</div>
                        </li>
                      ))
                    ) : <li className="p-2 text-[10px] lg:text-xs text-slate-500 text-center">Member baru.</li>}
                  </ul>
                )}
              </div>
              
              {nomorHp.trim() !== '' && (
                <>
                  <div>
                    <label className="block text-[10px] lg:text-xs font-bold text-slate-600 mb-1">{isMemberBaru ? '✨ Nama Member Baru (Wajib)' : '👤 Terdaftar Sebagai'}</label>
                    <input type="text" value={namaBaru} onChange={e => setNamaBaru(e.target.value)} disabled={!isMemberBaru} className="w-full p-2 border rounded-lg text-xs lg:text-sm bg-white disabled:bg-slate-100 disabled:text-slate-500 font-bold" />
                  </div>
                  {!isMemberBaru && memberAktif && memberAktif.poin > 0 && (
                    <div className="bg-orange-50 p-2.5 rounded-lg border border-orange-200 flex flex-col gap-2">
                      <div className="text-[10px] lg:text-xs font-black text-orange-700 flex justify-between">
                        <span>🌟 Poin Tersedia: {memberAktif.poin.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="number" value={poinDigunakan === 0 ? '' : poinDigunakan} onChange={e => { const val = Number(e.target.value); if(val > memberAktif.poin) alert('Poin tidak mencukupi!'); else if(val > totalBelanja) alert('Poin tidak boleh melebihi total belanja!'); else setPoinDigunakan(val); }} placeholder="Pakai berapa poin?" className="w-full text-xs p-1.5 rounded border border-orange-300 font-bold" />
                        <button onClick={() => setPoinDigunakan(Math.min(memberAktif.poin, totalBelanja))} className="text-[9px] lg:text-[10px] bg-orange-600 text-white px-2 py-1.5 rounded font-black whitespace-nowrap">Pakai Maksimal</button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <button onClick={initiatePayment} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition text-sm lg:text-base shadow-md">💳 Bayar (Rp {totalTagihanAkhir.toLocaleString('id-ID')})</button>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-xl w-full max-w-md space-y-4">
            <h3 className="text-base lg:text-lg font-black text-slate-800 border-b pb-2">💵 Konfirmasi Pembayaran</h3>
            <div className="flex justify-between text-sm lg:text-base bg-blue-50 text-blue-800 p-3 rounded-xl font-black border border-blue-100">
              <span>Grand Total:</span><span>Rp {totalTagihanAkhir.toLocaleString('id-ID')}</span>
            </div>
            {poinDigunakan > 0 && <div className="text-[10px] lg:text-xs text-orange-600 font-bold text-right italic">Termasuk diskon {poinDigunakan} poin</div>}
            
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600">Pilih Tunai / Kasbon:</label>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setCashReceived(0)} className={`px-3 py-1.5 rounded-lg text-[10px] lg:text-[11px] font-black transition border ${cashReceived === 0 ? 'bg-rose-600 text-white border-rose-600 shadow' : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'}`}>📝 FULL KASBON (Rp 0)</button>
                {getQuickCashOptions(totalTagihanAkhir).map(amt => (
                  <button key={amt} onClick={() => setCashReceived(amt)} className={`px-2 lg:px-3 py-1.5 rounded-lg text-[10px] lg:text-xs font-bold transition border ${cashReceived === amt && cashReceived !== 0 ? 'bg-blue-600 text-white border-blue-600 shadow' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                    {amt === totalTagihanAkhir ? '✅ UANG PAS' : `Rp ${amt.toLocaleString('id-ID')}`}
                  </button>
                ))}
              </div>
              <input type="number" value={cashReceived === 0 ? '' : cashReceived} onChange={e => setCashReceived(Number(e.target.value))} placeholder="0 (Kosongkan untuk Full Kasbon)" className="w-full border-2 focus:border-blue-500 focus:ring-0 rounded-xl p-3 text-lg font-black text-slate-800 text-center" />
            </div>

            <div>
              {cashReceived >= totalTagihanAkhir ? (
                <div className="flex justify-between text-emerald-700 font-black bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-sm lg:text-lg">
                  <span>Kembalian:</span><span>Rp {(cashReceived - totalTagihanAkhir).toLocaleString('id-ID')}</span>
                </div>
              ) : (
                <div className="flex justify-between text-rose-700 font-black bg-rose-50 p-3 rounded-xl border border-rose-200 text-sm lg:text-lg">
                  <span>Dicatat Piutang:</span><span>Rp {(totalTagihanAkhir - cashReceived).toLocaleString('id-ID')}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 lg:gap-3 pt-4 border-t">
              <button onClick={() => setShowPaymentModal(false)} className="flex-1 py-2.5 lg:py-3 rounded-xl bg-slate-100 font-bold text-slate-600 text-sm lg:text-base hover:bg-slate-200">Batal</button>
              <button onClick={handlePaymentSubmit} disabled={loading || (cashReceived < totalTagihanAkhir && !nomorHp)} className="flex-1 py-2.5 lg:py-3 rounded-xl bg-green-600 text-white font-black text-sm lg:text-base hover:bg-green-700 disabled:opacity-50">
                {loading ? 'Proses...' : '✅ Selesai'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showTutupShiftModal && activeShift && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 lg:p-8 rounded-3xl shadow-2xl border w-full max-w-sm text-center space-y-4">
            <h3 className="text-lg lg:text-xl font-black text-rose-600 border-b pb-4">🔒 Tutup Shift Kasir</h3>
            <p className="text-xs lg:text-sm text-slate-500 font-semibold mb-2">Harap hitung semua uang fisik yang ada di dalam laci kasir dan masukkan total nominalnya di bawah ini.</p>
            <form action={tutupShift} className="space-y-4">
              <input type="hidden" name="shiftId" value={activeShift.id} />
              <input type="number" name="uangFisik" required placeholder="3500000" className="w-full border-2 border-rose-200 focus:border-rose-500 rounded-xl p-3 lg:p-4 text-xl lg:text-2xl font-black text-slate-800 text-center bg-rose-50/50" />
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setShowTutupShiftModal(false)} className="flex-1 py-2 lg:py-3 bg-slate-200 rounded-xl font-bold text-slate-600 text-sm lg:text-base">Batal</button>
                <button type="submit" className="flex-1 py-2 lg:py-3 bg-rose-600 text-white rounded-xl font-black hover:bg-rose-700 shadow-md text-sm lg:text-base">Laporkan Laci</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}