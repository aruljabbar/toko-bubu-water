import { loginDenganPin } from '../../actions/auth';

export default function HalamanLogin({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm text-center border-t-4 border-blue-600">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Toko Bubu</h1>
        <p className="text-sm text-slate-500 mb-6">Masukkan PIN untuk masuk ke panel admin</p>

        {searchParams.error && (
          <div className="bg-red-100 text-red-600 p-2 rounded-md mb-4 text-sm font-semibold">
            PIN yang Anda masukkan salah!
          </div>
        )}

        <form action={loginDenganPin} className="space-y-4">
          <input 
            type="password" 
            name="pin"
            maxLength={6}
            required
            autoFocus // Langsung fokus ke inputan ini saat halaman dibuka
            className="w-full text-center text-3xl tracking-[1em] p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••"
          />
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            Buka Kunci
          </button>
        </form>
        
        <div className="mt-6 text-xs text-slate-400">
          Sistem Point of Sale v1.0
        </div>
      </div>
    </div>
  );
}