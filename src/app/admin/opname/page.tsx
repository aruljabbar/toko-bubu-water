import { db } from '../../../db';
import { products } from '../../../db/schema';
import { desc } from 'drizzle-orm';
import OpnameClient from './OpnameClient';

export default async function HalamanOpname() {
  const daftarProduk = await db.select().from(products).orderBy(desc(products.id));
  return <OpnameClient daftarProduk={daftarProduk} />;
}