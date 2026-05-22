import { db } from '../../../db';
import { products, customers } from '../../../db/schema';
import KasirClient from './KasirClient';

export default async function HalamanKasir() {
  const daftarProduk = await db.select().from(products);
  const daftarMember = await db.select().from(customers);

  return <KasirClient daftarProduk={daftarProduk} daftarMember={daftarMember} />;
}