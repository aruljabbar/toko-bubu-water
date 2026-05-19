'use server'

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginDenganPin(formData: FormData) {
  const pinInput = formData.get('pin') as string;
  const pinRahasia = process.env.ADMIN_PIN || '123456';

  if (pinInput === pinRahasia) {
    // Beri "kartu pas" (cookie) yang berlaku selama 30 hari
    const cookiesStore = await cookies();
    cookiesStore.set('auth_token', 'bubu-super-admin', {
      httpOnly: true, // Aman dari serangan hacker/XSS
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 hari
      path: '/',
    });
    // Jika benar, lempar ke halaman kasir
    redirect('/admin/kasir');
  } else {
    // Lempar kembali ke login dengan kode error jika salah
    redirect('/login?error=1');
  }
}

// Fungsi untuk keluar (logout)
export async function logoutAdmin() {
  const cookiesStore = await cookies();
  cookiesStore.delete('auth_token');
  redirect('/login');
}