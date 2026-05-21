'use server'
import { db } from '../db';
import { products } from '../db/schema';
import { revalidatePath } from 'next/cache';

export async function tambahProduk(formData: FormData) {
  const barcode = formData.get('barcode') as string || null;
  const gambarUrl = formData.get('gambarUrl') as string || null;
  
  await db.insert(products).values({
    barcode,
    namaProduk: formData.get('namaProduk') as string,
    kategori: formData.get('kategori') as string,
    hargaModal: Number(formData.get('hargaModal') || 0),
    hargaModalGrosir: formData.get('hargaModalGrosir') ? Number(formData.get('hargaModalGrosir')) : null,
    harga: Number(formData.get('harga')),
    hargaGrosir: formData.get('hargaGrosir') ? Number(formData.get('hargaGrosir')) : null,
    minGrosir: formData.get('minGrosir') ? Number(formData.get('minGrosir')) : null,
    stok: Number(formData.get('stok')),
    gambarUrl,
  });

  revalidatePath('/admin/produk');
  revalidatePath('/'); // Refresh halaman publik
}