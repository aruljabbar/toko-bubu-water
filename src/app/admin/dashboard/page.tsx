import { db } from '../../../db';
import { orders, orderItems, customers, products } from '../../../db/schema';
import { desc, sql } from 'drizzle-orm';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const allOrders = await db.select().from(orders);
  const allOrderItems = await db.select().from(orderItems);
  const allCustomers = await db.select().from(customers);
  const allProducts = await db.select().from(products).orderBy(products.stok);

  // Kalkulasi Summary
  const totalOmzet = allOrders.reduce((acc, o) => acc + o.totalHarga, 0);
  const totalLaba = allOrderItems.reduce((acc, i) => acc + ((i.hargaSatuan - i.modalSatuan) * i.kuantitas), 0);
  const totalPiutang = allCustomers.reduce((acc, c) => acc + (c.akumulasiUtang || 0), 0);
  
  // Produk Terlaris
  const produkLarisMap: Record<string, number> = {};
  allOrderItems.forEach(item => {
    produkLarisMap[item.namaProduk] = (produkLarisMap[item.namaProduk] || 0) + item.kuantitas;
  });
  const produkTerlaris = Object.entries(produkLarisMap)
    .map(([nama, qty]) => ({ nama, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Logika Stok Menipis (Berdasarkan Stok <= 10)
  const stokMenipis = allProducts.filter(p => p.stok <= 10).slice(0, 8);

  // Grafik 7 Hari Terakhir
  const omzetHarian: Record<string, number> = {};
  const labaHarian: Record<string, number> = {};
  
  allOrders.forEach(o => {
    const tgl = new Date(o.createdAt!).toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', day: '2-digit', month: 'short' });
    omzetHarian[tgl] = (omzetHarian[tgl] || 0) + o.totalHarga;
    
    // Hitung laba per nota untuk grafik
    const items = allOrderItems.filter(i => i.orderId === o.id);
    const labaNota = items.reduce((acc, i) => acc + ((i.hargaSatuan - i.modalSatuan) * i.kuantitas), 0);
    labaHarian[tgl] = (labaHarian[tgl] || 0) + labaNota;
  });

  const chartData = Object.keys(omzetHarian).map(tgl => ({
    tanggal: tgl,
    Omzet: omzetHarian[tgl],
    Laba: labaHarian[tgl],
  })).slice(-7); // Ambil 7 hari terakhir

  return (
    <DashboardClient 
      totalOmzet={totalOmzet} 
      totalLaba={totalLaba} 
      totalPiutang={totalPiutang} 
      produkTerlaris={produkTerlaris}
      stokMenipis={stokMenipis}
      chartData={chartData}
      totalTransaksi={allOrders.length}
    />
  );
}