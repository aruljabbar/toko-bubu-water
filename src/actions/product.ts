'use server'

import { db } from '../db';
import { products } from '../db/schema';
import { revalidatePath } from 'next/cache';

export async function tambahProduk(formData: FormData) {
  const barcodeInput = formData.get('barcode') as string;
  const barcode = barcodeInput ? barcodeInput : null;
  const namaProduk = formData.get('namaProduk') as string;
  const harga = Number(formData.get('harga'));
  
  // Tangkap input grosir (jika kosong, jadikan null)
  const hargaGrosirInput = formData.get('hargaGrosir');
  const hargaGrosir = hargaGrosirInput ? Number(hargaGrosirInput) : null;
  const minGrosirInput = formData.get('minGrosir');
  const minGrosir = minGrosirInput ? Number(minGrosirInput) : null;

  const stok = Number(formData.get('stok'));
  const kategori = formData.get('kategori') as string;

  await db.insert(products).values({
    barcode,
    namaProduk,
    harga,
    hargaGrosir,
    minGrosir,
    stok,
    kategori,
  });

  revalidatePath('/admin/produk');
}