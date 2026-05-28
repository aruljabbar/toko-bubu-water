import Link from 'next/link';
import { logoutAdmin } from '../../actions/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <aside className="w-64 bg-slate-900 text-white p-5 flex flex-col justify-between border-r border-slate-800">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-blue-400">🏪 Toko Bubu</h2>
            <p className="text-slate-400 text-xs mt-0.5 font-bold">Super Admin POS Dashboard</p>
          </div>
          
          <nav className="flex flex-col gap-1.5">
            <Link href="/admin/kasir" className="px-4 py-2.5 rounded-xl font-bold text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition flex items-center gap-2">
              💳 Kasir Utama (POS)
            </Link>
            <Link href="/admin/produk" className="px-4 py-2.5 rounded-xl font-bold text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition flex items-center gap-2">
              📦 Manajemen Produk
            </Link>
            <Link href="/admin/opname" className="px-4 py-2.5 rounded-xl font-bold text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition flex items-center gap-2">
              📋 Audit Stok Opname
            </Link>
            <Link href="/admin/request" className="px-4 py-2.5 rounded-xl font-bold text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition flex items-center gap-2">
              📝 Request Pelanggan
            </Link>
            <Link href="/admin/piutang" className="px-4 py-2.5 rounded-xl font-bold text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition flex items-center gap-2">
              💰 Piutang & Member
            </Link>
            <Link href="/admin/member" className="px-4 py-2.5 rounded-xl font-bold text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition flex items-center gap-2">
            👥 Manajemen Pelanggan
            </Link>
            <Link href="/admin/riwayat" className="px-4 py-2.5 rounded-xl font-bold text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition flex items-center gap-2">
              📜 Riwayat Laba & Nota
            </Link>
          </nav>
        </div>

        <div>
          <form action={logoutAdmin}>
            <button type="submit" className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold text-rose-400 hover:bg-rose-950/40 transition flex items-center gap-2">
              🔒 Kunci Layar Utama
            </button>
          </form>
          <div className="mt-4 text-[10px] text-slate-500 text-center font-bold">
            Sistem POS Retail v1.5
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto max-h-screen">
        {children}
      </main>
    </div>
  );
}