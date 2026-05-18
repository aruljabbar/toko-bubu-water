'use server'

import { db } from '../db';
import { productRequests } from '../db/schema';
import { revalidatePath } from 'next/cache';

export async function submitRequest(formData: FormData) {
  const namaBarang = formData.get('namaBarang') as string;
  const nomorHp = formData.get('nomorHp') as string;
  
  // Untuk MVP, kita anggap gambar diupload ke layanan pihak ketiga (seperti imgbb) 
  // dan user memasukkan link-nya, atau kita kosongi dulu jika tidak ada.
  const gambarUrl = formData.get('gambarUrl') as string || null;

  await db.insert(productRequests).values({
    nomorHpPelanggan: nomorHp, // Disimpan tapi tidak ditampilkan ke publik
    namaBarang: namaBarang,
    gambarUrl: gambarUrl,
    status: 'pending',
  });

  revalidatePath('/request'); 
}