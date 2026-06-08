import { db } from '../../../db';
import { products } from '../../../db/schema';
import { desc } from 'drizzle-orm';
import { cookies } from 'next/headers';
import ProdukClient from './ProdukClient';

export default async function HalamanProdukAdmin() {
  const cookieStore = await cookies();
  const userRole = cookieStore.get('user_role')?.value || 'kasir';

  const daftarProduk = await db.select().from(products).orderBy(desc(products.id));
  return <ProdukClient daftarProduk={daftarProduk} userRole={userRole} />;
}