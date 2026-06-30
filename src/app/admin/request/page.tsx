import { db } from '../../../db';
import { productRequests } from '../../../db/schema';
import { desc } from 'drizzle-orm';
import { cookies } from 'next/headers';
import RequestClient from './RequestClient';

export default async function AdminRequestPage() {
  const cookieStore = await cookies();
  const userRole = cookieStore.get('user_role')?.value || 'kasir';
  
  // Ambil semua data dari database dari yang paling baru
  const daftarRequest = await db.select().from(productRequests).orderBy(desc(productRequests.createdAt));

  return <RequestClient daftarRequest={daftarRequest} userRole={userRole} />;
}