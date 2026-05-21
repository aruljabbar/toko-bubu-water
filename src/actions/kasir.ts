'use server'
import { db } from '../db';
import { orders, orderItems, customers, products, paymentHistory } from '../db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function prosesCheckout(data: any) {
  const { nomorHp, totalBelanja, isKasbon, keranjang } = data;
  const noHpFix = nomorHp || 'Tanpa Member';

  if (nomorHp) {
    const pelanggan = await db.select().from(customers).where(eq(customers.nomorHp, nomorHp));
    if (pelanggan.length > 0) {
      await db.update(customers).set({
        totalTransaksi: (pelanggan[0].totalTransaksi || 0) + 1,
        akumulasiBelanja: (pelanggan[0].akumulasiBelanja || 0) + totalBelanja,
        akumulasiUtang: isKasbon ? (pelanggan[0].akumulasiUtang || 0) + totalBelanja : pelanggan[0].akumulasiUtang,
      }).where(eq(customers.nomorHp, nomorHp));
    } else {
      await db.insert(customers).values({
        nomorHp, nama: 'Pelanggan Baru', akumulasiBelanja: totalBelanja, akumulasiUtang: isKasbon ? totalBelanja : 0,
      });
    }
  }

  const pesananBaru = await db.insert(orders).values({
    nomorHpPelanggan: noHpFix,
    tipePesanan: 'ambil_toko',
    status: 'selesai',
    statusPembayaran: isKasbon ? 'kasbon' : 'lunas',
    totalHarga: Number(totalBelanja),
  }).returning({ id: orders.id });

  // FIXED: Memastikan update stok berjalan dengan benar dengan melooping item
  for (const item of keranjang) {
    const itemId = Number(item.id);
    const qty = Number(item.kuantitas);
    
    await db.insert(orderItems).values({
      orderId: pesananBaru[0].id,
      namaProduk: item.namaProduk,
      kuantitas: qty,
      hargaSatuan: Number(item.hargaAktif),
      modalSatuan: Number(item.modalAktif), // Modal aktif sesuai grosir/eceran
    });

    const produkDb = await db.select().from(products).where(eq(products.id, itemId));
    if (produkDb.length > 0) {
      await db.update(products)
        .set({ stok: produkDb[0].stok - qty })
        .where(eq(products.id, itemId));
    }
  }

  revalidatePath('/admin/kasir');
  revalidatePath('/admin/produk');
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