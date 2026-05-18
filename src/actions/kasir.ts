'use server'

import { db } from '../db';
import { orders, orderItems, customers, products } from '../db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// Mendefinisikan tipe data yang akan diterima dari Front-End
type DataCheckout = {
  nomorHp: string;
  totalBelanja: number;
  keranjang: { id: number; namaProduk: string; harga: number; kuantitas: number }[];
};

export async function prosesCheckout(data: DataCheckout) {
  const { nomorHp, totalBelanja, keranjang } = data;
  const noHpFix = nomorHp || 'Tanpa Member'; // Jika kasir tidak mengisi nomor HP

  // 1. Catat Pelanggan (Logika "Member" Internal)
  if (nomorHp) {
    const pelanggan = await db.select().from(customers).where(eq(customers.nomorHp, nomorHp));
    
    if (pelanggan.length > 0) {
      // Jika pelanggan sudah ada, tambahkan riwayat belanjanya
      await db.update(customers)
        .set({
          totalTransaksi: (pelanggan[0].totalTransaksi || 0) + 1,
          akumulasiBelanja: (pelanggan[0].akumulasiBelanja || 0) + totalBelanja,
        })
        .where(eq(customers.nomorHp, nomorHp));
    } else {
      // Jika nomor HP baru, buat profil pelanggan baru
      await db.insert(customers).values({
        nomorHp: nomorHp,
        nama: 'Pelanggan Toko', // Nama default, nanti bisa diedit di dashboard admin
        totalTransaksi: 1,
        akumulasiBelanja: totalBelanja,
      });
    }
  }

  // 2. Buat Pesanan Utama (Nota)
  const pesananBaru = await db.insert(orders).values({
    nomorHpPelanggan: noHpFix,
    tipePesanan: 'ambil_toko', // Karena ini transaksi fisik di kasir
    status: 'selesai', // Langsung selesai karena bayar di tempat
    totalHarga: totalBelanja,
  }).returning({ id: orders.id }); // Mengambil ID pesanan yang baru saja dibuat

  const orderId = pesananBaru[0].id;

  // 3. Simpan Detail Barang dan Potong Stok
  for (const item of keranjang) {
    // Simpan ke tabel order_items
    await db.insert(orderItems).values({
      orderId: orderId,
      namaProduk: item.namaProduk,
      kuantitas: item.kuantitas,
      hargaSatuan: item.harga,
    });

    // Cari stok produk saat ini lalu potong sesuai kuantitas yang dibeli
    const produkDb = await db.select().from(products).where(eq(products.id, item.id));
    if (produkDb.length > 0) {
      await db.update(products)
        .set({ stok: produkDb[0].stok - item.kuantitas })
        .where(eq(products.id, item.id));
    }
  }

  // 4. Refresh tampilan aplikasi
  revalidatePath('/admin/kasir');
  revalidatePath('/admin/produk'); // Refresh halaman produk agar stok ter-update
  
  return { success: true };
}