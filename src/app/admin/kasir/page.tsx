import { db } from '../../../db';
import { products, customers, shifts } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import KasirClient from './KasirClient';

export default async function HalamanKasir() {
  const daftarProduk = await db.select().from(products);
  const daftarMember = await db.select().from(customers);
  
  // Cek apakah ada shift yang sedang Open
  const openShift = await db.select().from(shifts).where(eq(shifts.status, 'open'));

  return <KasirClient daftarProduk={daftarProduk} daftarMember={daftarMember} activeShift={openShift[0] || null} />;
}