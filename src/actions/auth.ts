'use server'
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginDenganPin(formData: FormData) {
  const pinInput = formData.get('pin') as string;
  const adminPin = process.env.ADMIN_PIN || '123456';
  const kasirPin = process.env.KASIR_PIN || '654321';

  if (pinInput === adminPin) {
    const cookieStore = await cookies();
    cookieStore.set('auth_token', 'bubu-super-admin', { httpOnly: true, path: '/' });
    cookieStore.set('user_role', 'owner', { httpOnly: true, path: '/' });
    redirect('/admin/dashboard');
  } else if (pinInput === kasirPin) {
    const cookieStore = await cookies();
    cookieStore.set('auth_token', 'bubu-super-admin', { httpOnly: true, path: '/' });
    cookieStore.set('user_role', 'kasir', { httpOnly: true, path: '/' });
    redirect('/admin/kasir');
  } else {
    redirect('/login?error=1');
  }
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  cookieStore.delete('user_role');
  redirect('/login');
}