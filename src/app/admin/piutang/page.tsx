import { db } from '../../../db';
import { customers, paymentHistory } from '../../../db/schema';
import { desc, gt } from 'drizzle-orm';
import PiutangClient from './PiutangClient';

export default async function HalamanPiutang() {
  const daftarPengutang = await db.select().from(customers).where(gt(customers.akumulasiUtang, 0));
  const riwayatBayar = await db.select().from(paymentHistory).orderBy(desc(paymentHistory.tanggalBayar)).limit(500);

  return <PiutangClient pengutang={daftarPengutang} riwayatBayar={riwayatBayar} />;
}