import { db } from '../../../db';
import { customers } from '../../../db/schema';
import { cookies } from 'next/headers';
import MemberClient from './MemberClient';

export default async function HalamanMemberAdmin() {
  const cookieStore = await cookies();
  const userRole = cookieStore.get('user_role')?.value || 'kasir';

  const daftarMember = await db.select().from(customers);
  return <MemberClient daftarMember={daftarMember} userRole={userRole} />;
}