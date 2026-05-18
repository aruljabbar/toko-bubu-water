import { db } from '../../../db';
import { products } from '../../../db/schema';
import KasirClient from './KasirClient';

export default async function HalamanKasir() {
  // Ambil semua produk dari database
  const daftarProduk = await db.select().from(products);

  // Render komponen interaktif dan berikan data produknya
  return <KasirClient daftarProduk={daftarProduk} />;
}