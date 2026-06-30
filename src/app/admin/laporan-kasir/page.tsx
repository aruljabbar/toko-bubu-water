import { db } from '../../../db';
import { orders, orderItems, customers } from '../../../db/schema';
import { desc } from 'drizzle-orm';
import LaporanClient from './LaporanClient';

export default async function LaporanKasirPage() {
  // Ambil 500 transaksi terakhir, kita filter Hari Ini di sisi Client agar lebih mudah urusan Timezone
  const latestOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(500);
  const itemsAll = await db.select().from(orderItems);
  const allCustomers = await db.select().from(customers);

  const dataLengkap = latestOrders.map(order => {
    const customer = allCustomers.find(c => c.nomorHp === order.nomorHpPelanggan);
    return {
      ...order,
      namaPelanggan: customer ? customer.nama : 'Pelanggan Publik',
      items: itemsAll.filter(i => i.orderId === order.id)
    }
  });

  return <LaporanClient data={dataLengkap} />;
}