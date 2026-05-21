import { db } from '../db';
import { products } from '../db/schema';
import { desc } from 'drizzle-orm';
import Link from 'next/link';

export default async function LandingPage() {
  const katalog = await db.select().from(products).orderBy(desc(products.id));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white p-6 text-center shadow-md">
        <h1 className="text-3xl font-extrabold tracking-tight">Toko Bubu</h1>
        <p className="mt-2 text-blue-100">Belanja Hemat, Lengkap, dan Cepat</p>
        <div className="mt-4 flex justify-center gap-4">
          <Link href="/request" className="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded-full font-bold shadow transition">Request Barang</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-8">
        <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">Katalog Produk Kami</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {katalog.map((p) => (
            <div key={p.id} className="bg-white rounded-lg shadow border p-3 flex flex-col items-center text-center">
              {p.gambarUrl ? (
                 <img src={p.gambarUrl} alt={p.namaProduk} className="h-24 w-24 object-cover rounded mb-3" />
              ) : (
                 <div className="h-24 w-24 bg-gray-100 rounded mb-3 flex items-center justify-center text-gray-400 text-xs">No Image</div>
              )}
              <h3 className="font-semibold text-sm text-gray-800 line-clamp-2">{p.namaProduk}</h3>
              <div className="text-blue-600 font-extrabold mt-auto pt-2">Rp {p.harga.toLocaleString('id-ID')}</div>
              {p.hargaGrosir && <div className="text-[10px] text-green-600 mt-1">Grosir: Rp {p.hargaGrosir}</div>}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}