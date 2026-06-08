import { db } from '../../../db';
import { customers, paymentHistory, orders } from '../../../db/schema';
import { desc, gt, eq } from 'drizzle-orm';
import PiutangClient from './PiutangClient';

export default async function HalamanPiutang() {
  const daftarPengutang = await db.select().from(customers).where(gt(customers.akumulasiUtang, 0));
  const riwayatBayar = await db.select().from(paymentHistory).orderBy(desc(paymentHistory.tanggalBayar)).limit(500);
  
  // Ambil data nota yang berstatus kasbon untuk penjelasan sumber utang
  const kasbonOrders = await db.select().from(orders).where(eq(orders.statusPembayaran, 'kasbon')).orderBy(desc(orders.createdAt));

  return <PiutangClient pengutang={daftarPengutang} riwayatBayar={riwayatBayar} kasbonOrders={kasbonOrders} />;
}