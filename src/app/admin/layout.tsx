import { cookies } from 'next/headers';
import AdminLayoutClient from './AdminLayoutClient';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const userRole = cookieStore.get('user_role')?.value || 'kasir';

  return <AdminLayoutClient userRole={userRole}>{children}</AdminLayoutClient>;
}