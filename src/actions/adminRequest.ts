'use server'

import { db } from '../db';
import { productRequests } from '../db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function updateStatusRequest(formData: FormData) {
  const id = Number(formData.get('id'));
  const status = formData.get('status') as string;
  const komentar = formData.get('komentar') as string;

  await db.update(productRequests)
    .set({ status: status, komentarAdmin: komentar || null })
    .where(eq(productRequests.id, id));

  revalidatePath('/admin/request');
  revalidatePath('/request'); 
}

export async function hapusRequest(formData: FormData) {
  const id = Number(formData.get('id'));
  await db.delete(productRequests).where(eq(productRequests.id, id));
  revalidatePath('/admin/request');
}