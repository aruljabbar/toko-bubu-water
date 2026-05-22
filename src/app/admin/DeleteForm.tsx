'use client'

export default function DeleteForm({ 
  action, 
  id, 
  message 
}: { 
  action: (payload: FormData) => void, 
  id: number, 
  message: string 
}) {
  return (
    <form action={action} onSubmit={e => { if(!confirm(message)) e.preventDefault(); }}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-xs bg-rose-50 border border-rose-200 text-rose-600 font-black px-3 py-1.5 rounded-xl hover:bg-rose-100 transition shadow-sm">
        🗑️ Hapus
      </button>
    </form>
  );
}