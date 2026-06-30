'use server'

import { db } from '../db';
import { orders, orderItems, customers, products, paymentHistory } from '../db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function prosesCheckout(data: any) {
  const { nomorHp, namaBaru, totalBelanja, cashReceived, kembalian, isKasbon, shiftId, keranjang } = data;
  const noHpFix = nomorHp || 'Tanpa Member';

  const poinDidapat = Math.round(totalBelanja / 1000);
  const totalLabaKotor = keranjang.reduce((acc: number, item: any) => acc + ((item.hargaAktif - item.modalAktif) * item.kuantitas), 0);

  if (nomorHp && nomorHp !== 'Tanpa Member') {
    const pelanggan = await db.select().from(customers).where(eq(customers.nomorHp, nomorHp));
    if (pelanggan.length > 0) {
      await db.update(customers).set({
        totalTransaksi: pelanggan[0].totalTransaksi + 1,
        akumulasiBelanja: pelanggan[0].akumulasiBelanja + totalBelanja,
        akumulasiUtang: isKasbon ? pelanggan[0].akumulasiUtang + (totalBelanja - cashReceived) : pelanggan[0].akumulasiUtang,
        akumulasiLaba: pelanggan[0].akumulasiLaba + totalLabaKotor,
        poin: pelanggan[0].poin + poinDidapat
      }).where(eq(customers.nomorHp, nomorHp));
    } else {
      await db.insert(customers).values({
        nomorHp, nama: namaBaru || 'Pelanggan Baru', totalTransaksi: 1, akumulasiBelanja: totalBelanja,
        akumulasiUtang: isKasbon ? (totalBelanja - cashReceived) : 0, akumulasiLaba: totalLabaKotor, poin: poinDidapat
      });
    }
  }

  const pesananBaru = await db.insert(orders).values({
    shiftId: shiftId || null, nomorHpPelanggan: noHpFix, tipePesanan: 'ambil_toko', status: 'selesai',
    statusPembayaran: isKasbon ? 'kasbon' : 'lunas', totalHarga: totalBelanja, potonganPoin: 0, 
    cashReceived: cashReceived, kembalian: kembalian,
  }).returning({ id: orders.id });

  for (const item of keranjang) {
    await db.insert(orderItems).values({
      orderId: pesananBaru[0].id, namaProduk: item.namaProduk, kuantitas: Number(item.kuantitas),
      hargaSatuan: Number(item.hargaAktif), modalSatuan: Number(item.modalAktif || 0),
    });
    const produkDb = await db.select().from(products).where(eq(products.id, Number(item.id)));
    if (produkDb.length > 0) {
      await db.update(products).set({ stok: Math.max(0, produkDb[0].stok - Number(item.kuantitas)) }).where(eq(products.id, Number(item.id)));
    }
  }
  revalidatePath('/admin/kasir'); revalidatePath('/admin/produk'); revalidatePath('/admin/dashboard'); revalidatePath('/admin/riwayat');
  return { success: true };
}

export async function hapusNotaDanRetur(formData: FormData) {
  const orderId = Number(formData.get('orderId'));
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  
  for (const item of items) {
    const lastParenIndex = item.namaProduk.lastIndexOf(' (');
    const namaOri = lastParenIndex !== -1 ? item.namaProduk.substring(0, lastParenIndex) : item.namaProduk;
    const produkDb = await db.select().from(products).where(eq(products.namaProduk, namaOri));
    if (produkDb.length > 0) {
      await db.update(products).set({ stok: produkDb[0].stok + item.kuantitas }).where(eq(products.id, produkDb[0].id));
    }
  }
  await db.delete(orders).where(eq(orders.id, orderId));
  revalidatePath('/admin/riwayat'); revalidatePath('/admin/produk'); revalidatePath('/admin/dashboard');
}

// PERBAIKAN: Hapus Item Parsial
export async function hapusItemNota(formData: FormData) {
  const orderId = Number(formData.get('orderId'));
  const itemId = Number(formData.get('itemId'));

  const itemData = await db.select().from(orderItems).where(eq(orderItems.id, itemId));
  if (itemData.length === 0) return;
  const item = itemData[0];

  // 1. Kembalikan Stok Barang Gudang (Memotong nama satuan di dalam kurung)
  const lastParenIndex = item.namaProduk.lastIndexOf(' (');
  const namaOri = lastParenIndex !== -1 ? item.namaProduk.substring(0, lastParenIndex) : item.namaProduk;
  
  const produkDb = await db.select().from(products).where(eq(products.namaProduk, namaOri));
  if (produkDb.length > 0) {
    await db.update(products).set({ stok: produkDb[0].stok + item.kuantitas }).where(eq(products.id, produkDb[0].id));
  }

  // 2. Sesuaikan Total Harga Nota
  const orderData = await db.select().from(orders).where(eq(orders.id, orderId));
  if (orderData.length > 0) {
    const order = orderData[0];
    const nilaiItem = item.hargaSatuan * item.kuantitas;
    const newTotal = order.totalHarga - nilaiItem;
    await db.update(orders).set({ totalHarga: Math.max(0, newTotal) }).where(eq(orders.id, orderId));

    // 3. Tarik kembali akumulasi belanja dari pelanggan
    if (order.nomorHpPelanggan !== 'Tanpa Member') {
      const pelanggan = await db.select().from(customers).where(eq(customers.nomorHp, order.nomorHpPelanggan));
      if (pelanggan.length > 0) {
        const labaItem = (item.hargaSatuan - item.modalSatuan) * item.kuantitas;
        await db.update(customers).set({
          akumulasiBelanja: Math.max(0, pelanggan[0].akumulasiBelanja - nilaiItem),
          akumulasiLaba: Math.max(0, pelanggan[0].akumulasiLaba - labaItem),
        }).where(eq(customers.nomorHp, order.nomorHpPelanggan));
      }
    }
  }

  // 4. Hapus Item dari database
  await db.delete(orderItems).where(eq(orderItems.id, itemId));
  
  // Jika ini adalah item terakhir di nota tersebut, hapus juga notanya.
  const sisaItem = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  if (sisaItem.length === 0) {
    await db.delete(orders).where(eq(orders.id, orderId));
  }

  revalidatePath('/admin/riwayat'); revalidatePath('/admin/produk'); revalidatePath('/admin/dashboard');
}

export async function lunasiKasbon(formData: FormData) {
  const nomorHp = formData.get('nomorHp') as string;
  const nominalBayar = Number(formData.get('nominalBayar'));

  const pelanggan = await db.select().from(customers).where(eq(customers.nomorHp, nomorHp));
  if (pelanggan.length > 0) {
    const sisaUtang = pelanggan[0].akumulasiUtang - nominalBayar;
    await db.update(customers).set({ akumulasiUtang: sisaUtang < 0 ? 0 : sisaUtang }).where(eq(customers.nomorHp, nomorHp));
  }

  await db.insert(paymentHistory).values({ nomorHpPelanggan: nomorHp, nominalBayar });
  revalidatePath('/admin/piutang');
} 