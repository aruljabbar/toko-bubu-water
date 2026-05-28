'use server'

import { db } from '../db';
import { products } from '../db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function tambahProduk(formData: FormData) {
  const barcodeInput = formData.get('barcode') as string;
  const barcode = barcodeInput ? barcodeInput.trim() : null;
  
  try {
    await db.insert(products).values({
      barcode,
      namaProduk: formData.get('namaProduk') as string,
      harga: Number(formData.get('harga')),
      hargaModal: Number(formData.get('hargaModal') || 0),
      hargaModalGrosir: formData.get('hargaModalGrosir') ? Number(formData.get('hargaModalGrosir')) : null,
      hargaGrosir: formData.get('hargaGrosir') ? Number(formData.get('hargaGrosir')) : null,
      minGrosir: formData.get('minGrosir') ? Number(formData.get('minGrosir')) : null,
      stok: Number(formData.get('stok')),
      kategori: formData.get('kategori') as string,
      satuan: formData.get('satuan') as string || 'pcs',
      gambarUrl: formData.get('gambarUrl') as string || null,
    });
  } catch (error: any) {
    if (error.code === '23505' || error.message?.includes('unique constraint')) {
      return { success: false, message: 'Barcode sudah digunakan!' };
    }
  }
  revalidatePath('/admin/produk');
  return { success: true };
}

export async function editProduk(formData: FormData) {
  const id = Number(formData.get('id'));
  const barcodeInput = formData.get('barcode') as string;
  
  await db.update(products).set({
    barcode: barcodeInput ? barcodeInput.trim() : null,
    namaProduk: formData.get('namaProduk') as string,
    harga: Number(formData.get('harga')),
    hargaModal: Number(formData.get('hargaModal') || 0),
    hargaModalGrosir: formData.get('hargaModalGrosir') ? Number(formData.get('hargaModalGrosir')) : null,
    hargaGrosir: formData.get('hargaGrosir') ? Number(formData.get('hargaGrosir')) : null,
    minGrosir: formData.get('minGrosir') ? Number(formData.get('minGrosir')) : null,
    stok: Number(formData.get('stok')),
    kategori: formData.get('kategori') as string,
    satuan: formData.get('satuan') as string || 'pcs',
    gambarUrl: formData.get('gambarUrl') as string || null,
  }).where(eq(products.id, id));

  revalidatePath('/admin/produk');
}

export async function hapusProduk(formData: FormData) {
  await db.delete(products).where(eq(products.id, Number(formData.get('id'))));
  revalidatePath('/admin/produk');
}