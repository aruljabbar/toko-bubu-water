import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Fungsi Satpam
export function middleware(request: NextRequest) {
  // Mengecek apakah browser punya cookie 'auth_token'
  const token = request.cookies.get('auth_token')?.value;

  // Jika tidak punya token, tendang kembali ke halaman /login
  if (token !== 'bubu-super-admin') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Jika punya, silakan lewat
  return NextResponse.next();
}

// Aturan: Satpam ini hanya menjaga URL yang berawalan "/admin"
export const config = {
  matcher: ['/admin/:path*'],
}