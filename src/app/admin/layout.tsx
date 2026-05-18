import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* Sidebar Navigasi */}
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-blue-400">Toko Bubu</h2>
          <p className="text-slate-400 text-sm mt-1">Admin Panel</p>
        </div>
        
        <nav className="flex flex-col gap-2">
          <Link href="/admin/kasir" className="px-4 py-2 rounded-md hover:bg-slate-800 transition">
            💳 Kasir (POS)
          </Link>
          <Link href="/admin/produk" className="px-4 py-2 rounded-md hover:bg-slate-800 transition">
            📦 Manajemen Produk
          </Link>
          <Link href="/admin/request" className="px-4 py-2 rounded-md hover:bg-slate-800 transition">
            📝 Request Pelanggan
          </Link>
        </nav>

        <div className="mt-auto text-xs text-slate-500">
          Sistem POS v1.0
        </div>
      </aside>

      {/* Area Konten Utama (Tempat page.tsx akan dirender) */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      
    </div>
  );
}