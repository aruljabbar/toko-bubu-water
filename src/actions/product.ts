'use server'

import { db } from '../db';
import { products } from '../db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function tambahProduk(formData: FormData) {
  const barcodeInput = formData.get('barcode') as string;
  const barcode = barcodeInput ? barcodeInput.trim() : null;
  const namaProduk = formData.get('namaProduk') as string;
  const harga = Number(formData.get('harga'));
  const hargaModal = Number(formData.get('hargaModal') || 0);
  const hargaModalGrosir = formData.get('hargaModalGrosir') ? Number(formData.get('hargaModalGrosir')) : null;
  const hargaGrosir = formData.get('hargaGrosir') ? Number(formData.get('hargaGrosir')) : null;
  const minGrosir = formData.get('minGrosir') ? Number(formData.get('minGrosir')) : null;
  const stok = Number(formData.get('stok'));
  const kategori = formData.get('kategori') as string;
  const gambarUrl = formData.get('gambarUrl') as string || null;

  try {
    await db.insert(products).values({
      barcode,
      namaProduk,
      harga,
      hargaModal,
      hargaModalGrosir,
      hargaGrosir,
      minGrosir,
      stok,
      kategori,
      gambarUrl,
    });
  } catch (error: any) {
    // Menangkap error unique constraint barcode tanpa membuat aplikasi crash
    if (error.code === '23505' || error.message?.includes('unique constraint')) {
      redirect('/admin/produk?error=duplicate_barcode');
    }
    throw error;
  }

  revalidatePath('/admin/produk');
  redirect('/admin/produk');
}

export async function hapusProduk(formData: FormData) {
  const id = Number(formData.get('id'));
  await db.delete(products).where(eq(products.id, id));
  revalidatePath('/admin/produk');
}