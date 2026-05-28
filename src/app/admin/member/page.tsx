import { db } from '../../../db';
import { customers } from '../../../db/schema';
import MemberClient from './MemberClient';

export default async function HalamanMemberAdmin() {
  const daftarMember = await db.select().from(customers);
  return <MemberClient daftarMember={daftarMember} />;
}