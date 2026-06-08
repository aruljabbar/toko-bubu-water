'use server'

import { db } from '../db';
import { orders, orderItems, customers, products, paymentHistory } from '../db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function prosesCheckout(data: any) {
  const { nomorHp, namaBaru, totalBelanja, cashReceived, kembalian, isKasbon, potonganPoin, shiftId, keranjang } = data;
  const noHpFix = nomorHp || 'Tanpa Member';

  const totalTagihanAkhir = totalBelanja - potonganPoin;
  
  // Poin yang didapat: Kelipatan 1000 = 1 poin. (Dihitung dari tagihan akhir setelah potong poin)
  const poinDidapat = Math.floor(totalTagihanAkhir / 1000);

  // Laba bersih nota. (Jika diskon poin, laba toko berkurang)
  const totalLabaKotor = keranjang.reduce((acc: number, item: any) => acc + ((item.hargaAktif - item.modalAktif) * item.kuantitas), 0);
  const labaBersihAkhir = totalLabaKotor - potonganPoin;

  if (nomorHp && nomorHp !== 'Tanpa Member') {
    const pelanggan = await db.select().from(customers).where(eq(customers.nomorHp, nomorHp));
    if (pelanggan.length > 0) {
      await db.update(customers).set({
        totalTransaksi: (pelanggan[0].totalTransaksi || 0) + 1,
        akumulasiBelanja: (pelanggan[0].akumulasiBelanja || 0) + totalTagihanAkhir,
        akumulasiUtang: isKasbon ? (pelanggan[0].akumulasiUtang || 0) + (totalTagihanAkhir - cashReceived) : pelanggan[0].akumulasiUtang,
        akumulasiLaba: (pelanggan[0].akumulasiLaba || 0) + labaBersihAkhir,
        poin: (pelanggan[0].poin || 0) - potonganPoin + poinDidapat // Kurangi poin dipakai, tambah poin baru
      }).where(eq(customers.nomorHp, nomorHp));
    } else {
      await db.insert(customers).values({
        nomorHp,
        nama: namaBaru || 'Pelanggan Baru',
        totalTransaksi: 1,
        akumulasiBelanja: totalTagihanAkhir,
        akumulasiUtang: isKasbon ? (totalTagihanAkhir - cashReceived) : 0,
        akumulasiLaba: labaBersihAkhir,
        poin: poinDidapat // Member baru langsung dapat poin
      });
    }
  }

  const pesananBaru = await db.insert(orders).values({
    shiftId: shiftId || null,
    nomorHpPelanggan: noHpFix,
    tipePesanan: 'ambil_toko',
    status: 'selesai',
    statusPembayaran: isKasbon ? 'kasbon' : 'lunas',
    totalHarga: totalTagihanAkhir, // Harga yang dicatat adalah yang sudah diskon poin
    potonganPoin: potonganPoin,
    cashReceived: cashReceived,
    kembalian: kembalian,
  }).returning({ id: orders.id });

  const newOrderId = pesananBaru[0].id;

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
  revalidatePath('/admin/member');
  revalidatePath('/admin/dashboard');
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