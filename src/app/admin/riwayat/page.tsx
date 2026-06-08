import { db } from '../../../db';
import { orders, orderItems, customers } from '../../../db/schema';
import { desc, eq } from 'drizzle-orm';
import RiwayatClient from './RiwayatClient';

export default async function RiwayatTransaksiPage({ searchParams }: { searchParams: Promise<{ hp?: string }> }) {
  const resolvedParams = await searchParams;
  const targetHp = resolvedParams?.hp || ''; // PENTING: Await searchParams

  let queryOrders;
  if (targetHp) {
    queryOrders = await db.select().from(orders).where(eq(orders.nomorHpPelanggan, targetHp)).orderBy(desc(orders.createdAt));
  } else {
    queryOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(500); 
  }

  const itemsAll = await db.select().from(orderItems);
  const allCustomers = await db.select().from(customers);

  const dataLengkap = queryOrders.map(order => {
    const customer = allCustomers.find(c => c.nomorHp === order.nomorHpPelanggan);
    return {
      ...order,
      namaPelanggan: customer ? customer.nama : 'Pelanggan Publik',
      items: itemsAll.filter(i => i.orderId === order.id)
    }
  });

  return <RiwayatClient data={dataLengkap} initialHp={targetHp} />;
}