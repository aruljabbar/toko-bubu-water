'use server'

import { db } from '../db';
import { orders, orderItems, customers, products, paymentHistory } from '../db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function prosesCheckout(data: any) {
  const { nomorHp, namaBaru, totalBelanja, cashReceived, kembalian, isKasbon, keranjang } = data;
  const noHpFix = nomorHp || 'Tanpa Member';

  // 1. Kelola Data Pelanggan / Akumulasi Utang Piutang
  if (nomorHp && nomorHp !== 'Tanpa Member') {
    const pelanggan = await db.select().from(customers).where(eq(customers.nomorHp, nomorHp));
    if (pelanggan.length > 0) {
      await db.update(customers).set({
        totalTransaksi: (pelanggan[0].totalTransaksi || 0) + 1,
        akumulasiBelanja: (pelanggan[0].akumulasiBelanja || 0) + totalBelanja,
        akumulasiUtang: isKasbon ? (pelanggan[0].akumulasiUtang || 0) + (totalBelanja - cashReceived) : pelanggan[0].akumulasiUtang,
      }).where(eq(customers.nomorHp, nomorHp));
    } else {
      await db.insert(customers).values({
        nomorHp,
        nama: namaBaru || 'Pelanggan Baru',
        totalTransaksi: 1,
        akumulasiBelanja: totalBelanja,
        akumulasiUtang: isKasbon ? (totalBelanja - cashReceived) : 0,
      });
    }
  }

  // 2. Buat ID Transaksi Utama
  const pesananBaru = await db.insert(orders).values({
    nomorHpPelanggan: noHpFix,
    tipePesanan: 'ambil_toko',
    status: 'selesai',
    statusPembayaran: isKasbon ? 'kasbon' : 'lunas',
    totalHarga: totalBelanja,
    cashReceived: cashReceived,
    kembalian: kembalian,
  }).returning({ id: orders.id });

  const newOrderId = pesananBaru[0].id;

  // 3. Loop Deteksi Pengurangan Stok Rigid & Penyimpanan Modal Per Item
  for (const item of keranjang) {
    await db.insert(orderItems).values({
      orderId: newOrderId,
      namaProduk: item.namaProduk,
      kuantitas: Number(item.kuantitas),
      hargaSatuan: Number(item.hargaAktif),
      modalSatuan: Number(item.modalAktif || 0),
    });

    const produkDb = await db.select().from(products).where(eq(products.id, Number(item.id)));
    if (produkDb.length > 0) {
      await db.update(products)
        .set({ stok: Math.max(0, produkDb[0].stok - Number(item.kuantitas)) })
        .where(eq(products.id, Number(item.id)));
    }
  }

  revalidatePath('/admin/kasir');
  revalidatePath('/admin/produk');
  revalidatePath('/admin/piutang');
  revalidatePath('/admin/riwayat');
  return { success: true };
}

export async function lunasiKasbon(formData: FormData) {
  const nomorHp = formData.get('nomorHp') as string;
  const nominalBayar = Number(formData.get('nominalBayar'));

  const pelanggan = await db.select().from(customers).where(eq(customers.nomorHp, nomorHp));
  if (pelanggan.length > 0) {
    const sisaUtang = (pelanggan[0].akumulasiUtang || 0) - nominalBayar;
    await db.update(customers).set({ akumulasiUtang: sisaUtang < 0 ? 0 : sisaUtang }).where(eq(customers.nomorHp, nomorHp));
  }

  await db.insert(paymentHistory).values({ nomorHpPelanggan: nomorHp, nominalBayar });
  revalidatePath('/admin/piutang');
}