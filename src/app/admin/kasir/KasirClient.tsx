'use client'

import { useState } from 'react';
import { prosesCheckout } from '../../../actions/kasir'; // Import fungsi backend

type Produk = {
  id: number;
  namaProduk: string;
  harga: number;
  stok: number;
};

type ItemKeranjang = Produk & { kuantitas: number };

export default function KasirClient({ daftarProduk }: { daftarProduk: Produk[] }) {
  const [keranjang, setKeranjang] = useState<ItemKeranjang[]>([]);
  const [nomorHp, setNomorHp] = useState('');
  const [loading, setLoading] = useState(false); // Untuk animasi loading saat diproses

  const tambahKeKeranjang = (produk: Produk) => {
    // Cek apakah stok cukup
    const itemDiKeranjang = keranjang.find((item) => item.id === produk.id);
    const qtySekarang = itemDiKeranjang ? itemDiKeranjang.kuantitas : 0;
    
    if (qtySekarang >= produk.stok) {
      alert('Stok tidak mencukupi!');
      return;
    }

    setKeranjang((prev) => {
      if (itemDiKeranjang) {
        return prev.map((item) =>
          item.id === produk.id ? { ...item, kuantitas: item.kuantitas + 1 } : item
        );
      }
      return [...prev, { ...produk, kuantitas: 1 }];
    });
  };

  const totalBelanja = keranjang.reduce((total, item) => total + (item.harga * item.kuantitas), 0);

  // FUNGSI EKSEKUSI PEMBAYARAN
  const handleCheckout = async () => {
    setLoading(true);
    try {
      await prosesCheckout({
        nomorHp: nomorHp,
        totalBelanja: totalBelanja,
        keranjang: keranjang,
      });
      
      alert('Transaksi Berhasil Disimpan!');
      setKeranjang([]); // Kosongkan keranjang
      setNomorHp(''); // Kosongkan input nomor HP
    } catch (error) {
      alert('Terjadi kesalahan saat menyimpan transaksi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-6 p-8 min-h-screen bg-gray-50">
      
      {/* KIRI: Daftar Produk (Kode sama seperti sebelumnya) */}
      <div className="w-2/3">
        <h1 className="text-2xl font-bold mb-6">Kasir Toko Bubu</h1>
        <div className="grid grid-cols-3 gap-4">
          {daftarProduk.map((produk) => (
            <button 
              key={produk.id} 
              onClick={() => tambahKeKeranjang(produk)}
              className="bg-white p-4 rounded-lg shadow border hover:border-blue-500 text-left transition"
            >
              <div className="font-semibold">{produk.namaProduk}</div>
              <div className="text-blue-600 font-bold mt-2">Rp {produk.harga.toLocaleString('id-ID')}</div>
              <div className="text-xs text-gray-500 mt-1">Stok: {produk.stok}</div>
            </button>
          ))}
        </div>
      </div>

      {/* KANAN: Keranjang & Pembayaran */}
      <div className="w-1/3 bg-white p-6 rounded-lg shadow border h-fit sticky top-8">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">Keranjang</h2>
        
        <div className="min-h-[200px] mb-4">
          {keranjang.length === 0 ? (
            <p className="text-gray-400 text-center mt-10">Keranjang kosong</p>
          ) : (
            <ul className="space-y-3">
              {keranjang.map((item) => (
                <li key={item.id} className="flex justify-between items-center text-sm">
                  <div>
                    <div className="font-medium">{item.namaProduk}</div>
                    <div className="text-gray-500">{item.kuantitas} x Rp {item.harga.toLocaleString('id-ID')}</div>
                  </div>
                  <div className="font-bold text-gray-800">
                    Rp {(item.kuantitas * item.harga).toLocaleString('id-ID')}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t pt-4 space-y-4">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total:</span>
            <span>Rp {totalBelanja.toLocaleString('id-ID')}</span>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">No HP Pelanggan (Opsional)</label>
            <input 
              type="text" 
              value={nomorHp}
              onChange={(e) => setNomorHp(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 text-sm" 
              placeholder="0812xxxxxx" 
            />
          </div>

          <button 
            onClick={handleCheckout} // Panggil fungsi checkout saat diklik
            className={`w-full py-3 rounded font-bold text-white transition ${keranjang.length === 0 || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
            disabled={keranjang.length === 0 || loading}
          >
            {loading ? 'Memproses...' : `Bayar & Simpan (Rp ${totalBelanja.toLocaleString('id-ID')})`}
          </button>
        </div>
      </div>

    </div>
  );
}