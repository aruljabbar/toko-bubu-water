'use server'
import { db } from '../db';
import { orders, orderItems, customers, products, paymentHistory } from '../db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// Fungsi Checkout (Diperbarui untuk Kasbon)
export async function prosesCheckout(data: any) {
  const { nomorHp, totalBelanja, isKasbon, keranjang } = data;
  const noHpFix = nomorHp || 'Tanpa Member';

  if (nomorHp) {
    const pelanggan = await db.select().from(customers).where(eq(customers.nomorHp, nomorHp));
    if (pelanggan.length > 0) {
      await db.update(customers).set({
        totalTransaksi: (pelanggan[0].totalTransaksi || 0) + 1,
        akumulasiBelanja: (pelanggan[0].akumulasiBelanja || 0) + totalBelanja,
        // Jika isKasbon true, tambah akumulasi utangnya
        akumulasiUtang: isKasbon ? (pelanggan[0].akumulasiUtang || 0) + totalBelanja : pelanggan[0].akumulasiUtang,
      }).where(eq(customers.nomorHp, nomorHp));
    } else {
      await db.insert(customers).values({
        nomorHp: nomorHp,
        nama: 'Pelanggan Toko',
        akumulasiBelanja: totalBelanja,
        akumulasiUtang: isKasbon ? totalBelanja : 0,
      });
    }
  }

  const pesananBaru = await db.insert(orders).values({
    nomorHpPelanggan: noHpFix,
    tipePesanan: 'ambil_toko',
    status: 'selesai',
    statusPembayaran: isKasbon ? 'kasbon' : 'lunas',
    totalHarga: totalBelanja,
  }).returning({ id: orders.id });

  // ... (Logika insert orderItems dan potong stok tetap sama seperti sebelumnya)

  revalidatePath('/admin/kasir');
  revalidatePath('/admin/piutang');
  return { success: true };
}

// FUNGSI BARU: Bayar Kasbon
export async function lunasiKasbon(formData: FormData) {
  const nomorHp = formData.get('nomorHp') as string;
  const nominalBayar = Number(formData.get('nominalBayar'));

  // 1. Kurangi total utang pelanggan
  const pelanggan = await db.select().from(customers).where(eq(customers.nomorHp, nomorHp));
  if (pelanggan.length > 0) {
    const sisaUtang = (pelanggan[0].akumulasiUtang || 0) - nominalBayar;
    await db.update(customers)
      .set({ akumulasiUtang: sisaUtang < 0 ? 0 : sisaUtang })
      .where(eq(customers.nomorHp, nomorHp));
  }

  // 2. Catat riwayat pembayaran
  await db.insert(paymentHistory).values({
    nomorHpPelanggan: nomorHp,
    nominalBayar: nominalBayar,
  });

  revalidatePath('/admin/piutang');
}