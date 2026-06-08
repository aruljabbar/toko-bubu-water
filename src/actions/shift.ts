'use server'

import { db } from '../db';
import { shifts, orders } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function bukaShift(formData: FormData) {
  const modalAwal = Number(formData.get('modalAwal'));
  await db.insert(shifts).values({ modalAwal, status: 'open' });
  revalidatePath('/admin/kasir');
}

export async function tutupShift(formData: FormData) {
  const shiftId = Number(formData.get('shiftId'));
  const uangFisik = Number(formData.get('uangFisik'));

  const shiftOrders = await db.select().from(orders).where(eq(orders.shiftId, shiftId));
  
  // Hitung total uang tunai masuk & kembalian keluar selama shift
  const totalCashMasuk = shiftOrders.reduce((sum, o) => sum + o.cashReceived, 0);
  const totalCashKeluar = shiftOrders.reduce((sum, o) => sum + o.kembalian, 0);

  const shiftData = await db.select().from(shifts).where(eq(shifts.id, shiftId));
  if(shiftData.length > 0) {
    const modalAwal = shiftData[0].modalAwal;
    const uangSeharusnya = modalAwal + totalCashMasuk - totalCashKeluar;
    const selisih = uangFisik - uangSeharusnya; // Minus berarti nombok

    await db.update(shifts).set({
      waktuTutup: new Date(),
      status: 'closed',
      totalCashMasuk,
      totalCashKeluar,
      uangFisik,
      selisih
    }).where(eq(shifts.id, shiftId));
  }
  revalidatePath('/admin/kasir');
}