'use client'
import { useState, useEffect } from 'react';
import { prosesCheckout } from '../../../actions/kasir';

type Produk = { 
  id: number; barcode: string | null; namaProduk: string; gambarUrl: string | null;
  harga: number; hargaGrosir: number | null; minGrosir: number | null; 
  hargaModal: number; hargaModalGrosir: number | null; stok: number; 
};
type Member = { nomorHp: string; nama: string };
type ItemKeranjang = Produk & { kuantitas: number };

export default function KasirClient({ daftarProduk, daftarMember }: { daftarProduk: Produk[], daftarMember: Member[] }) {
  const [keranjang, setKeranjang] = useState<ItemKeranjang[]>([]);
  const [nomorHp, setNomorHp] = useState('');
  const [isKasbon, setIsKasbon] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Fitur Baru: Search & Cek Harga Mode
  const [searchQuery, setSearchQuery] = useState('');
  const [cekHargaMode, setCekHargaMode] = useState(false);

  const dapatkanHargaAktif = (item: ItemKeranjang) => (item.minGrosir && item.hargaGrosir && item.kuantitas >= item.minGrosir) ? item.hargaGrosir : item.harga;
  const dapatkanModalAktif = (item: ItemKeranjang) => (item.minGrosir && item.hargaModalGrosir && item.kuantitas >= item.minGrosir) ? item.hargaModalGrosir : item.hargaModal;

  const totalBelanja = keranjang.reduce((total, item) => total + (dapatkanHargaAktif(item) * item.kuantitas), 0);

  const produkTampil = daftarProduk.filter(p => p.namaProduk.toLowerCase().includes(searchQuery.toLowerCase()) || p.barcode?.includes(searchQuery));

  const tambahKeKeranjang = (produk: Produk) => {
    if (cekHargaMode) {
      alert(`CEK HARGA:\n${produk.namaProduk}\nEceran: Rp ${produk.harga.toLocaleString('id-ID')}\nGrosir: Rp ${produk.hargaGrosir?.toLocaleString('id-ID') || '-'}`);
      return;
    }

    setKeranjang((prev) => {
      const itemAda = prev.find((i) => i.id === produk.id);
      if ((itemAda?.kuantitas || 0) >= produk.stok) { alert('Stok tidak cukup!'); return prev; }
      if (itemAda) return prev.map((i) => i.id === produk.id ? { ...i, kuantitas: i.kuantitas + 1 } : i);
      return [...prev, { ...produk, kuantitas: 1 }];
    });
  };

  const ubahKuantitas = (id: number, delta: number) => {
    setKeranjang(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.kuantitas + delta;
        if (newQty > item.stok) { alert('Stok maksimal!'); return item; }
        return { ...item, kuantitas: newQty };
      }
      return item;
    }).filter(item => item.kuantitas > 0)); // Otomatis hapus jika kuantitas 0
  };

  useEffect(() => {
    let buffer = '';
    let timer: NodeJS.Timeout;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key.length === 1) {
        buffer += e.key;
        clearTimeout(timer);
        timer = setTimeout(() => { buffer = ''; }, 50); 
      } else if (e.key === 'Enter' && buffer.length > 0) {
        e.preventDefault();
        const produkDitemukan = daftarProduk.find(p => p.barcode === buffer);
        if (produkDitemukan) tambahKeKeranjang(produkDitemukan);
        else alert('Barcode tidak ditemukan!');
        buffer = ''; 
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [daftarProduk, cekHargaMode]);

  const handleCheckout = async () => {
    setLoading(true);
    const keranjangFix = keranjang.map(i => ({ ...i, hargaAktif: dapatkanHargaAktif(i), modalAktif: dapatkanModalAktif(i) }));
    await prosesCheckout({ nomorHp, totalBelanja, isKasbon, keranjang: keranjangFix });
    alert('Transaksi Berhasil!');
    setKeranjang([]); setNomorHp(''); setIsKasbon(false); setLoading(false);
  };

  return (
    <div className="flex gap-6 p-6 min-h-screen bg-gray-100">
      <div className="w-2/3 flex flex-col gap-4">
        <div className="flex gap-4 items-center bg-white p-4 rounded-lg shadow">
          <input 
            type="text" 
            placeholder="Cari nama barang atau barcode..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border p-2 rounded focus:ring-2 focus:ring-blue-500"
          />
          <button 
            onClick={() => setCekHargaMode(!cekHargaMode)}
            className={`p-2 rounded font-bold text-white ${cekHargaMode ? 'bg-orange-500' : 'bg-gray-400'}`}
          >
            {cekHargaMode ? 'Pindai Mode: CEK HARGA' : 'Pindai Mode: KASIR'}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 overflow-y-auto max-h-[75vh] pb-10">
          {produkTampil.map((produk) => (
            <button key={produk.id} onClick={() => tambahKeKeranjang(produk)} className="bg-white p-3 rounded-lg shadow border hover:border-blue-500 flex flex-col items-center text-center">
              {produk.gambarUrl ? (
                 <img src={produk.gambarUrl} alt="Img" className="h-16 w-16 object-cover rounded mb-2" />
              ) : (
                 <div className="h-16 w-16 bg-gray-200 rounded mb-2 flex items-center justify-center text-xs text-gray-500">No Img</div>
              )}
              <div className="font-semibold text-sm line-clamp-2">{produk.namaProduk}</div>
              <div className="text-blue-600 font-bold mt-auto">Rp {produk.harga.toLocaleString('id-ID')}</div>
              <div className="text-xs text-gray-500">Sisa: {produk.stok}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="w-1/3 bg-white p-6 rounded-lg shadow border flex flex-col h-[90vh]">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">Keranjang</h2>
        <ul className="space-y-3 flex-1 overflow-y-auto pr-2">
          {keranjang.map((item) => {
            const hargaAktif = dapatkanHargaAktif(item);
            const isGrosir = hargaAktif === item.hargaGrosir;
            return (
              <li key={item.id} className="flex justify-between items-center text-sm border-b pb-2">
                <div className="flex-1">
                  <div className="font-medium">{item.namaProduk} {isGrosir && <span className="bg-green-100 text-green-700 px-1 rounded text-[10px]">GROSIR</span>}</div>
                  <div className="text-gray-500">Rp {hargaAktif.toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-gray-100 rounded">
                    <button onClick={() => ubahKuantitas(item.id, -1)} className="px-2 font-bold hover:bg-gray-200">-</button>
                    <span className="w-6 text-center">{item.kuantitas}</span>
                    <button onClick={() => ubahKuantitas(item.id, 1)} className="px-2 font-bold hover:bg-gray-200">+</button>
                  </div>
                  <div className="font-bold w-16 text-right">Rp {(item.kuantitas * hargaAktif).toLocaleString()}</div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="border-t pt-4 space-y-3 mt-auto">
          <div className="flex justify-between font-bold text-xl text-blue-700">
            <span>Total:</span><span>Rp {totalBelanja.toLocaleString('id-ID')}</span>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Cari / Input No HP Pelanggan</label>
            <input 
              list="member-list" 
              type="text" 
              value={nomorHp}
              onChange={(e) => setNomorHp(e.target.value)}
              className="w-full border rounded p-2 text-sm" placeholder="0812..." 
            />
            {/* Datalist untuk autocomplete member */}
            <datalist id="member-list">
              {daftarMember.map(m => <option key={m.nomorHp} value={m.nomorHp}>{m.nama}</option>)}
            </datalist>
          </div>

          <label className="flex items-center gap-2 p-2 rounded bg-red-50 border border-red-200">
            <input type="checkbox" checked={isKasbon} onChange={(e) => setIsKasbon(e.target.checked)} className="w-4 h-4" />
            <span className="text-sm font-bold text-red-700">Catat Kasbon (Wajib No HP)</span>
          </label>

          <button onClick={handleCheckout} disabled={keranjang.length === 0 || loading || (isKasbon && !nomorHp)} className="w-full py-3 rounded font-bold text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400">
            {loading ? 'Proses...' : 'Bayar / Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}