'use server'

import { db } from '../db';
import { productRequests } from '../db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function updateStatusRequest(formData: FormData) {
  // Mengambil data dari form admin
  const id = Number(formData.get('id'));
  const status = formData.get('status') as string;
  const komentar = formData.get('komentar') as string;

  // Update data di database
  await db.update(productRequests)
    .set({ 
      status: status, 
      komentarAdmin: komentar || null 
    })
    .where(eq(productRequests.id, id));

  // Refresh halaman admin dan halaman publik agar datanya tersinkronisasi instan
  revalidatePath('/admin/request');
  revalidatePath('/request'); 
}