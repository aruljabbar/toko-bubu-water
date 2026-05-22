'use client'

import { useState, useEffect } from 'react';
import { prosesCheckout } from '../../../actions/kasir';

type Produk = {
  id: number;
  barcode: string | null;
  namaProduk: string;
  kategori: string | null;
  harga: number;
  hargaGrosir: number | null;
  minGrosir: number | null;
  hargaModal: number;
  hargaModalGrosir: number | null;
  stok: number;
  gambarUrl: string | null;
};

type Member = { nomorHp: string; nama: string; };
type ItemKeranjang = { produk: Produk; kuantitas: number; };

export default function KasirClient({ daftarProduk, daftarMember }: { daftarProduk: Produk[]; daftarMember: Member[]; }) {
  const [keranjang, setKeranjang] = useState<ItemKeranjang[]>([]);
  const [nomorHp, setNomorHp] = useState('');
  const [namaBaru, setNamaBaru] = useState('');
  const [isMemberBaru, setIsMemberBaru] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('Semua');

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [isPrint, setIsPrint] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (nomorHp.trim() !== '') {
      const match = daftarMember.find(m => m.nomorHp === nomorHp);
      if (match) {
        setNamaBaru(match.nama);
        setIsMemberBaru(false);
      } else {
        setIsMemberBaru(true);
      }
    } else {
      setNamaBaru('');
      setIsMemberBaru(false);
    }
  }, [nomorHp, daftarMember]);

  const dapatkanHargaAktif = (item: ItemKeranjang) => {
    const p = item.produk;
    return (p.minGrosir && p.hargaGrosir && item.kuantitas >= p.minGrosir) ? p.hargaGrosir : p.harga;
  };

  const dapatkanModalAktif = (item: ItemKeranjang) => {
    const p = item.produk;
    return (p.minGrosir && p.hargaModalGrosir && item.kuantitas >= p.minGrosir) ? p.hargaModalGrosir : p.hargaModal;
  };

  const totalBelanja = keranjang.reduce((acc, item) => acc + (dapatkanHargaAktif(item) * item.kuantitas), 0);
  const kategoriList = ['Semua', ...Array.from(new Set(daftarProduk.map(p => p.kategori).filter(Boolean)))];

  const produkFiltered = daftarProduk
    .filter(p => {
      const matchSearch = p.namaProduk.toLowerCase().includes(searchQuery.toLowerCase()) || p.barcode?.includes(searchQuery);
      const matchKategori = selectedKategori === 'Semua' || p.kategori === selectedKategori;
      return matchSearch && matchKategori;
    })
    .sort((a, b) => a.namaProduk.localeCompare(b.namaProduk));

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

  useEffect(() => {
    let buffer = '';
    let timer: NodeJS.Timeout;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key.length === 1) {
        buffer += e.key;
        clearTimeout(timer);
        timer = setTimeout(() => { buffer = ''; }, 40);
      } else if (e.key === 'Enter' && buffer.length > 0) {
        e.preventDefault();
        const scanned = buffer;
        buffer = '';
        const found = daftarProduk.find(p => p.barcode === scanned);
        if (found) tambahKeKeranjang(found);
        else alert(`Barcode ${scanned} tidak ditemukan!`);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [daftarProduk]);

  const handlePaymentSubmit = async () => {
    setLoading(true);
    const isKasbon = cashReceived < totalBelanja;
    const kembalian = cashReceived > totalBelanja ? cashReceived - totalBelanja : 0;

    const mappedKeranjang = keranjang.map(item => ({
      id: item.produk.id,
      namaProduk: item.produk.namaProduk,
      kuantitas: item.kuantitas,
      hargaAktif: dapatkanHargaAktif(item),
      modalAktif: dapatkanModalAktif(item)
    }));

    try {
      await prosesCheckout({
        nomorHp: nomorHp || 'Tanpa Member',
        namaBaru: isMemberBaru ? namaBaru : undefined,
        totalBelanja,
        cashReceived,
        kembalian,
        isKasbon,
        keranjang: mappedKeranjang
      });
      alert('Transaksi Sukses Disimpan! 🎉');
      setKeranjang([]); setNomorHp(''); setNamaBaru(''); setCashReceived(0); setShowPaymentModal(false);
    } catch (err) {
      alert('Gagal memproses pembayaran.');
    } finally { setLoading(false); }
  };

  function updateQty(id: number, val: number) {
    if (val <= 0) { setKeranjang(prev => prev.filter(item => item.produk.id !== id)); return; }
    const p = daftarProduk.find(prod => prod.id === id);
    if (p && val > p.stok) { alert(`Stok maksimal ${p.namaProduk} adalah ${p.stok}`); return; }
    setKeranjang(prev => prev.map(item => item.produk.id === id ? { ...item, kuantitas: val } : item));
  }

  return (
    <div className="flex gap-6 p-6 min-h-screen bg-slate-50">
      <div className="w-2/3 flex flex-col gap-4">
        <div className="flex gap-4 bg-white p-4 rounded-xl shadow-sm border items-center">
          <input 
            type="text" 
            placeholder="🔍 Cari Produk berdasarkan Nama atau Scan Barcode langsung..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <select value={selectedKategori} onChange={e => setSelectedKategori(e.target.value)} className="border rounded-lg p-2.5 text-sm bg-white font-bold text-slate-700">
            {kategoriList.map(kat => <option key={kat} value={kat!}>{kat}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4 max-h-[80vh] overflow-y-auto pb-8">
          {produkFiltered.map(p => (
            <button key={p.id} onClick={() => tambahKeKeranjang(p)} className="bg-white p-4 rounded-xl shadow-sm border text-left flex flex-col justify-between h-44 hover:border-blue-500 transition">
              <div>
                <div className="font-bold text-slate-800 line-clamp-2 text-sm">{p.namaProduk}</div>
                <div className="text-[11px] font-bold text-slate-400 mt-1">📂 Kategori: {p.kategori || 'Umum'}</div>
              </div>
              <div>
                <div className="text-blue-600 font-black text-base">Rp {p.harga.toLocaleString('id-ID')}</div>
                {p.hargaGrosir && <div className="text-[11px] text-emerald-600 font-bold">📦 Grosir: Rp {p.hargaGrosir.toLocaleString('id-ID')} (Min {p.minGrosir})</div>}
                <div className="text-xs text-slate-500 mt-1 font-semibold">📦 Sisa Stok: {p.stok}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="w-1/3 bg-white p-5 rounded-xl shadow-sm border flex flex-col justify-between h-[85vh]">
        <div>
          <h2 className="text-lg font-black text-slate-800 border-b pb-2 mb-4 flex items-center gap-2">🛒 Kasir POS</h2>
          <div className="max-h-[40vh] overflow-y-auto space-y-3 pr-1">
            {keranjang.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-8 font-medium">Keranjang masih kosong</p>
            ) : (
              keranjang.map(item => {
                const activePrice = dapatkanHargaAktif(item);
                return (
                  <div key={item.produk.id} className="flex justify-between items-center text-sm border-b pb-2">
                    <div className="flex-1 pr-2">
                      <div className="font-bold text-slate-700 line-clamp-1">{item.produk.namaProduk}</div>
                      <div className="text-xs text-slate-400">Rp {activePrice.toLocaleString('id-ID')}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        value={item.kuantitas} 
                        onChange={e => updateQty(item.produk.id, Number(e.target.value))}
                        className="w-16 border rounded p-1 text-center font-black text-slate-800"
                      />
                      <div className="font-bold text-slate-800 text-right w-20">Rp {(activePrice * item.kuantitas).toLocaleString('id-ID')}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="border-t pt-4 space-y-4 mt-auto">
          <div className="flex justify-between items-center text-xl font-black text-slate-900">
            <span>Total Tagihan:</span><span className="text-blue-600">Rp {totalBelanja.toLocaleString('id-ID')}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border space-y-2">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">🔍 No. HP Member</label>
              <input type="text" value={nomorHp} onChange={e => setNomorHp(e.target.value)} placeholder="Masukkan nomor HP..." className="w-full p-2 border rounded-lg text-sm bg-white" list="kasir-member-list" />
              <datalist id="kasir-member-list">
                {daftarMember.map(m => <option key={m.nomorHp} value={m.nomorHp}>{m.nama}</option>)}
              </datalist>
            </div>
            {nomorHp.trim() !== '' && (
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">{isMemberBaru ? '✨ Nama Lengkap Member Baru' : '👤 Nama Member Terdaftar'}</label>
                <input type="text" value={namaBaru} onChange={e => setNamaBaru(e.target.value)} disabled={!isMemberBaru} placeholder="Input nama member..." className="w-full p-2 border rounded-lg text-sm bg-white disabled:bg-slate-100" />
              </div>
            )}
          </div>

          <button onClick={() => { if (keranjang.length === 0) return; setCashReceived(totalBelanja); setShowPaymentModal(true); }} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition flex justify-center items-center gap-2">
            💳 Proses Pembayaran
          </button>
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl border w-full max-w-md space-y-4">
            <h3 className="text-lg font-black text-slate-800 border-b pb-2">💵 Konfirmasi Metode Pembayaran</h3>
            <div className="flex justify-between text-sm bg-slate-50 p-3 rounded-xl font-bold">
              <span className="text-slate-500">Total Belanja:</span><span>Rp {totalBelanja.toLocaleString('id-ID')}</span>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Jumlah Uang Tunai (Cash) Diterima</label>
              <input type="number" value={cashReceived} onChange={e => setCashReceived(Number(e.target.value))} className="w-full border rounded-xl p-3 text-lg font-bold text-slate-800" />
            </div>
            <div>
              {cashReceived >= totalBelanja ? (
                <div className="flex justify-between text-emerald-600 font-bold bg-emerald-50 p-2.5 rounded-lg border">
                  <span>Kembalian:</span><span>Rp {(cashReceived - totalBelanja).toLocaleString('id-ID')}</span>
                </div>
              ) : (
                <div className="flex justify-between text-rose-600 font-bold bg-rose-50 p-2.5 rounded-lg border">
                  <span>Sisa Dicatat Jadi Piutang:</span><span>Rp {(totalBelanja - cashReceived).toLocaleString('id-ID')}</span>
                </div>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer">
              <input type="checkbox" checked={isPrint} onChange={e => setIsPrint(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
              <span>🖨️ Cetak Struk Belanja Langsung</span>
            </label>
            <div className="flex gap-3 pt-2 border-t">
              <button onClick={() => setShowPaymentModal(false)} className="flex-1 py-2.5 rounded-xl border font-bold text-slate-500">Batal</button>
              <button onClick={handlePaymentSubmit} disabled={loading || (cashReceived < totalBelanja && !nomorHp)} className="flex-1 py-2.5 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition disabled:bg-slate-300">
                {loading ? 'Menyimpan...' : 'Konfirmasi Selesai'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}