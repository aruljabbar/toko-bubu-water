'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAdmin } from '../../actions/auth';

export default function AdminLayoutClient({ children, userRole }: { children: React.ReactNode, userRole: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const handleLinkClick = () => setIsOpen(false);

  // Mencegah scroll di belakang saat menu HP dibuka
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
  }, [isOpen]);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      
      {/* OVERLAY GELAP (Saat menu HP dibuka) */}
      {isOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setIsOpen(false)} />}

      {/* SIDEBAR NAVIGASI (Sticky 100dvh agar Full ke bawah di iPad/PC) */}
      <aside className={`fixed lg:sticky top-0 left-0 h-[100dvh] z-50 w-64 bg-slate-900 text-white p-5 flex flex-col justify-between border-r border-slate-800 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="space-y-6 overflow-y-auto pr-1">
          <div className="hidden lg:block">
            <h2 className="text-2xl font-black tracking-tight text-blue-400">🏪 Toko Bubu</h2>
            <p className="text-emerald-400 text-[10px] md:text-xs mt-1.5 font-bold uppercase tracking-widest bg-emerald-900/30 w-fit px-2 py-1 rounded">Login: {userRole}</p>
          </div>
          
          <nav className="flex flex-col gap-1.5 pt-4 lg:pt-0">
            {userRole === 'owner' && (
              <Link href="/admin/dashboard" onClick={handleLinkClick} className={`px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 ${pathname === '/admin/dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>📊 Summary & Dashboard</Link>
            )}
            <Link href="/admin/kasir" onClick={handleLinkClick} className={`px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 ${pathname === '/admin/kasir' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>💳 Kasir Utama (POS)</Link>
            <Link href="/admin/produk" onClick={handleLinkClick} className={`px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 ${pathname === '/admin/produk' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>📦 Katalog Produk</Link>
            <Link href="/admin/request" onClick={handleLinkClick} className={`px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 ${pathname === '/admin/request' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>📝 Request Pelanggan</Link>
            <Link href="/admin/member" onClick={handleLinkClick} className={`px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 ${pathname === '/admin/member' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>👥 Database Pelanggan</Link>
            
            {userRole === 'owner' && (
              <>
                <Link href="/admin/opname" onClick={handleLinkClick} className={`px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 ${pathname === '/admin/opname' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>📋 Audit Stok & Restock</Link>
                <Link href="/admin/piutang" onClick={handleLinkClick} className={`px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 ${pathname === '/admin/piutang' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>💰 Piutang & Member</Link>
                <Link href="/admin/riwayat" onClick={handleLinkClick} className={`px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 ${pathname === '/admin/riwayat' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>📜 Riwayat Laba & Nota</Link>
              </>
            )}
          </nav>
        </div>

        <div className="mt-8 shrink-0 border-t border-slate-800 pt-4">
          <form action={logoutAdmin}>
            <button type="submit" className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold text-rose-400 hover:bg-rose-950/40 transition flex items-center gap-2">🔒 Kunci Layar Utama</button>
          </form>
          <div className="mt-3 text-[10px] text-slate-500 text-center font-bold">Sistem POS Retail v3.0</div>
        </div>
      </aside>

      {/* KONTEN UTAMA WRAPPER (Flex-1 akan otomatis memenuhi seluruh layar) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* HEADER MOBILE (Tampil di HP/iPad Portrait) */}
        <div className="lg:hidden bg-slate-900 text-white p-4 flex justify-between items-center z-30 sticky top-0 shadow-md">
          <div className="flex flex-col">
            <h2 className="text-xl font-black tracking-tight text-blue-400">🏪 Toko Bubu</h2>
          </div>
          <button onClick={() => setIsOpen(!isOpen)} className="text-xl focus:outline-none p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition">
            {isOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* AREA KONTEN HALAMAN */}
        <main className="flex-1 overflow-x-hidden relative">
          {children}
        </main>
      </div>

    </div>
  );
}