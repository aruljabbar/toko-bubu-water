'use server'

import { db } from '../db';
import { products } from '../db/schema';
import { revalidatePath } from 'next/cache';

export async function tambahProduk(formData: FormData) {
  const barcodeInput = formData.get('barcode') as string;
  const barcode = barcodeInput ? barcodeInput : null; // Ubah kosong menjadi null agar tidak error unik
  const namaProduk = formData.get('namaProduk') as string;
  const harga = Number(formData.get('harga'));
  const stok = Number(formData.get('stok'));
  const kategori = formData.get('kategori') as string;

  await db.insert(products).values({
    barcode, // Masukkan ke database
    namaProduk,
    harga,
    stok,
    kategori,
  });

  revalidatePath('/admin/produk');
}