'use server'

import { db } from '../db';
import { customers } from '../db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function editMember(formData: FormData) {
  const id = Number(formData.get('id'));
  await db.update(customers).set({
    nama: formData.get('nama') as string,
    nomorHp: formData.get('nomorHp') as string,
  }).where(eq(customers.id, id));
  revalidatePath('/admin/member');
}

export async function hapusMember(formData: FormData) {
  await db.delete(customers).where(eq(customers.id, Number(formData.get('id'))));
  revalidatePath('/admin/member');
}