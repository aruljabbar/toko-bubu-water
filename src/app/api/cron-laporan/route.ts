import { NextResponse } from 'next/server';
import { db } from '../../../db';
import { orders } from '../../../db/schema';
import { gte, lte, and } from 'drizzle-orm';

// Di Next.js App Router, file API ditulis menggunakan fungsi GET, POST, dll
export async function GET(request: Request) {
  // Opsi keamanan: Pastikan API ini hanya bisa dipanggil oleh sistem Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // 1. Tentukan rentang waktu untuk "Hari Ini" (WIB - Waktu Indonesia Barat)
    const sekarang = new Date();
    // Konversi ke zona waktu lokal untuk memastikan hitungan hari tepat
    const awalHari = new Date(sekarang.setHours(0, 0, 0, 0));
    const akhirHari = new Date(sekarang.setHours(23, 59, 59, 999));

    // 2. Tarik data dari Drizzle ORM
    const pesananHariIni = await db.select().from(orders).where(
      and(
        gte(orders.createdAt, awalHari),
        lte(orders.createdAt, akhirHari)
      )
    );

    // 3. Kalkulasi Omzet
    const totalPesanan = pesananHariIni.length;
    const totalOmzet = pesananHariIni.reduce((acc, order) => acc + order.totalHarga, 0);

    // 4. Siapkan Teks Pesan WhatsApp
    const tanggalFormat = new Date().toLocaleDateString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const pesanWa = `*Laporan Harian Toko Bubu* 📈\n`
      + `Tanggal: ${tanggalFormat}\n\n`
      + `Total Transaksi: *${totalPesanan} struk*\n`
      + `Total Omzet: *Rp ${totalOmzet.toLocaleString('id-ID')}*\n\n`
      + `Selamat istirahat bos! 🚀`;

    // 5. Kirim pesan menggunakan API Fonnte
    const fonnteResponse = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': process.env.FONNTE_TOKEN!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        target: process.env.NOMOR_WA_OWNER!,
        message: pesanWa,
        countryCode: '62', // Kode negara Indonesia
      })
    });

    if (!fonnteResponse.ok) throw new Error('Gagal kirim WA');

    return NextResponse.json({ success: true, message: 'Laporan berhasil dikirim' });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan' }, { status: 500 });
  }
}