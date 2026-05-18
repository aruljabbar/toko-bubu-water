'use client'

import { useState, useEffect } from 'react';
import { prosesCheckout } from '../../../actions/kasir';

type Produk = {
  id: number;
  barcode: string | null; // Tambahkan tipe barcode
  namaProduk: string;
  harga: number;
  stok: number;
};

type ItemKeranjang = Produk & { kuantitas: number };

export default function KasirClient({ daftarProduk }: { daftarProduk: Produk[] }) {
  const [keranjang, setKeranjang] = useState<ItemKeranjang[]>([]);
  const [nomorHp, setNomorHp] = useState('');
  const [loading, setLoading] = useState(false);

  // --- FUNGSI TAMBAH KE KERANJANG (Diperbarui sedikit agar bisa dipanggil oleh scanner) ---
  const tambahKeKeranjang = (produk: Produk) => {
    setKeranjang((prev) => {
      const itemDiKeranjang = prev.find((item) => item.id === produk.id);
      const qtySekarang = itemDiKeranjang ? itemDiKeranjang.kuantitas : 0;
      
      if (qtySekarang >= produk.stok) {
        alert(`Stok ${produk.namaProduk} tidak mencukupi!`);
        return prev; // Batalkan penambahan
      }

      if (itemDiKeranjang) {
        return prev.map((item) =>
          item.id === produk.id ? { ...item, kuantitas: item.kuantitas + 1 } : item
        );
      }
      return [...prev, { ...produk, kuantitas: 1 }];
    });
  };

  // --- LOGIKA BARCODE SCANNER ---
  useEffect(() => {
    let buffer = '';
    let timer: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Jika user sedang mengetik di input Nomor HP, abaikan scanner
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Jika tombol yang ditekan adalah huruf/angka (panjangnya 1 karakter)
      if (e.key.length === 1) {
        buffer += e.key;
        
        clearTimeout(timer);
        // Barcode scanner mengetik sangat cepat (biasanya jarak antar huruf < 30ms)
        // Jika jeda lebih dari 50ms, kita anggap itu ketikan manual dan buffer dikosongkan
        timer = setTimeout(() => {
          buffer = ''; 
        }, 50); 
      } 
      // Jika tombol Enter ditekan dan buffer memiliki isi
      else if (e.key === 'Enter' && buffer.length > 0) {
        e.preventDefault();
        const scannedCode = buffer;
        buffer = ''; // Kosongkan buffer untuk scan berikutnya

        // Cari produk berdasarkan barcode
        const produkDitemukan = daftarProduk.find(p => p.barcode === scannedCode);
        
        if (produkDitemukan) {
          tambahKeKeranjang(produkDitemukan);
          // Opsi tambahan: Anda bisa menambahkan suara 'beep' pakai HTML Audio Element di sini
        } else {
          console.log(`Barcode ${scannedCode} tidak terdaftar.`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [daftarProduk]); // Daftar produk menjadi dependency agar data selalu update
  // --------------------------------

  const totalBelanja = keranjang.reduce((total, item) => total + (item.harga * item.kuantitas), 0);
  const handleCheckout = async () => {
    setLoading(true);
    try {
      await prosesCheckout({
        nomorHp: nomorHp,
        totalBelanja: totalBelanja,
        keranjang: keranjang,
      });
      alert('Transaksi Berhasil Disimpan!');
      setKeranjang([]); 
      setNomorHp(''); 
    } catch (error) {
      alert('Terjadi kesalahan saat menyimpan transaksi.');
    } finally {
      setLoading(false);
    }
  };

  // --- FUNGSI BARU: CETAK STRUK BLUETOOTH ---
  const handleCetakStruk = async () => {
    if (keranjang.length === 0) return alert('Keranjang masih kosong!');

    try {
      // 1. Meminta izin ke browser untuk mencari perangkat Bluetooth (Printer)
      // UUID 000018f0... adalah standar umum untuk banyak printer thermal mini
      const device = await (navigator as any).bluetooth.requestDevice({
        // filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }],
        // optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
        acceptAllDevices: true // Jika ingin memperbolehkan semua perangkat (tidak disarankan untuk produksi)
      });

      // 2. Membuka koneksi ke printer
      const server = await device.gatt?.connect();
      const service = await server?.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      const characteristic = await service?.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb'); // Karakteristik untuk 'write'

      if (!characteristic) throw new Error("Karakteristik printer tidak ditemukan");

      // 3. Merangkai teks struk
      let teksStruk = "      TOKO BUBU\n";
      teksStruk += "================================\n";
      keranjang.forEach(item => {
        teksStruk += `${item.namaProduk}\n`;
        teksStruk += `${item.kuantitas} x ${item.harga} = Rp${item.kuantitas * item.harga}\n`;
      });
      teksStruk += "================================\n";
      teksStruk += `TOTAL: Rp${totalBelanja}\n`;
      teksStruk += `No HP: ${nomorHp || '-'}\n`;
      teksStruk += "================================\n";
      teksStruk += "  Terima kasih telah berbelanja\n\n\n\n";

      // 4. Konversi teks ke byte array (Uint8Array) lalu kirim ke printer
      const encoder = new TextEncoder();
      const data = encoder.encode(teksStruk);
      
      // Printer Bluetooth punya batas buffer (biasanya 512 bytes), kita pecah potongannya
      const chunkSize = 100;
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        await characteristic.writeValue(chunk);
      }

      alert("Struk berhasil dicetak!");

    } catch (error) {
      console.error(error);
      alert("Gagal mencetak struk. Pastikan Bluetooth aktif dan printer menyala.");
    }
  };
  // ------------------------------------------

  return (
    <div className="flex gap-6 p-8 min-h-screen bg-gray-50">
      
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

          <div className="flex gap-2">
            <button 
              onClick={handleCetakStruk} 
              className={`flex-1 py-3 rounded font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 transition ${keranjang.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={keranjang.length === 0}
            >
              🖨️ Cetak Struk
            </button>

            <button 
              onClick={handleCheckout} 
              className={`flex-1 py-3 rounded font-bold text-white transition ${keranjang.length === 0 || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
              disabled={keranjang.length === 0 || loading}
            >
              {loading ? 'Memproses...' : 'Simpan & Selesai'}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}