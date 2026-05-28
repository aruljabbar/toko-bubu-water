import { db } from '../../../db';
import { products } from '../../../db/schema';
import { desc } from 'drizzle-orm';
import ProdukClient from './ProdukClient';

export default async function HalamanProdukAdmin() {
  const daftarProduk = await db.select().from(products).orderBy(desc(products.id));
  return <ProdukClient daftarProduk={daftarProduk} />;
}