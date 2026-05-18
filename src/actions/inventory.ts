'use server'

import { db } from '../db';
import { products, inventoryAdjustments } from '../db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function sesuaikanStok(formData: FormData) {
  const productId = Number(formData.get('productId'));
  const stokSistem = Number(formData.get('stokSistem'));
  const stokFisik = Number(formData.get('stokFisik'));
  const alasan = formData.get('alasan') as string;

  const selisih = stokFisik - stokSistem;

  // Jika tidak ada selisih, tidak perlu ada proses database
  if (selisih === 0) return;

  // 1. Update stok utama di tabel produk
  await db.update(products)
    .set({ stok: stokFisik })
    .where(eq(products.id, productId));

  // 2. Catat riwayat perubahannya di tabel audit
  await db.insert(inventoryAdjustments).values({
    productId: productId,
    stokSistem: stokSistem,
    stokFisik: stokFisik,
    selisih: selisih,
    alasan: alasan,
  });

  revalidatePath('/admin/opname');
  revalidatePath('/admin/produk');
}