import { db } from '../../../db';
import { orders, orderItems, customers, products } from '../../../db/schema';
import { desc } from 'drizzle-orm';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  // Ambil semua data mentah dari database
  const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
  const allOrderItems = await db.select().from(orderItems);
  const allCustomers = await db.select().from(customers);
  const allProducts = await db.select().from(products).orderBy(products.stok);

  // Kalkulasi Piutang Global (Karena piutang tidak terpengaruh filter tanggal)
  const totalPiutang = allCustomers.reduce((acc, c) => acc + (c.akumulasiUtang || 0), 0);
  
  // Logika Peringatan Stok Menipis (Stok <= 10)
  const stokMenipis = allProducts.filter(p => p.stok <= 10).slice(0, 8);

  // Lempar data mentah ke Client Component agar bisa di-filter berdasarkan tanggal secara dinamis
  return (
    <DashboardClient 
      rawOrders={allOrders} 
      rawOrderItems={allOrderItems} 
      totalPiutang={totalPiutang} 
      stokMenipis={stokMenipis}
    />
  );
}