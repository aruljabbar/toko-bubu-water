'use server'

import { db } from '../db';
import { products } from '../db/schema';
import { revalidatePath } from 'next/cache';

export async function tambahProduk(formData: FormData) {
  // Mengambil data dari inputan form
  const namaProduk = formData.get('namaProduk') as string;
  const harga = Number(formData.get('harga'));
  const stok = Number(formData.get('stok'));
  const kategori = formData.get('kategori') as string;

  // Insert data ke database menggunakan Drizzle
  await db.insert(products).values({
    namaProduk,
    harga,
    stok,
    kategori,
  });

  // Me-refresh halaman agar data terbaru langsung muncul tanpa perlu reload browser
  revalidatePath('/admin/produk');
}