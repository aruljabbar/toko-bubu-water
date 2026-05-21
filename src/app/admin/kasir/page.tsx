import { db } from '../../../db';
import { products, customers } from '../../../db/schema'; // Pastikan customers di-import
import KasirClient from './KasirClient';

export default async function HalamanKasir() {
  // Ambil semua produk dari database
  const daftarProduk = await db.select().from(products);
  
  // BARU: Ambil semua pelanggan dari database
  const daftarMember = await db.select().from(customers);

  // Render komponen interaktif dan berikan kedua datanya
  return <KasirClient daftarProduk={daftarProduk} daftarMember={daftarMember} />;
}