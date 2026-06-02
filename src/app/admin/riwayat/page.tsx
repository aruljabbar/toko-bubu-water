import { db } from '../../../db';
import { orders, orderItems } from '../../../db/schema';
import { desc } from 'drizzle-orm';
import RiwayatClient from './RiwayatClient';

export default async function RiwayatTransaksiPage() {
  const queryOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(500); // Batasi 500 trx terakhir utk performa
  const itemsAll = await db.select().from(orderItems);

  // Satukan data agar mudah diolah Client Component
  const dataLengkap = queryOrders.map(order => ({
    ...order,
    items: itemsAll.filter(i => i.orderId === order.id)
  }));

  return <RiwayatClient data={dataLengkap} />;
}