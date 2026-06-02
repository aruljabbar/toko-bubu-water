import { db } from '../../../db';
import { products, inventoryAdjustments } from '../../../db/schema';
import { desc } from 'drizzle-orm';
import OpnameClient from './OpnameClient';

export default async function HalamanOpname() {
  const daftarProduk = await db.select().from(products).orderBy(desc(products.id));
  const riwayatMentah = await db.select().from(inventoryAdjustments).orderBy(desc(inventoryAdjustments.createdAt)).limit(30);
  
  const historyOpname = riwayatMentah.map(r => {
    const p = daftarProduk.find(x => x.id === r.productId);
    return { ...r, namaProduk: p?.namaProduk || 'Produk Dihapus' };
  });

  return <OpnameClient daftarProduk={daftarProduk} historyOpname={historyOpname} />;
}