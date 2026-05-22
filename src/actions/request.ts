'use server'

import { db } from '../db';
import { productRequests } from '../db/schema';
import { revalidatePath } from 'next/cache';

export async function submitRequest(formData: FormData) {
  try {
    await db.insert(productRequests).values({
      nomorHpPelanggan: formData.get('nomorHp') as string,
      namaBarang: formData.get('namaBarang') as string,
      gambarUrl: (formData.get('gambarUrl') as string) || null,
      status: 'pending',
    });
    revalidatePath('/request');
  } catch (error) {
    console.error("Gagal melakukan input request", error);
  }
}