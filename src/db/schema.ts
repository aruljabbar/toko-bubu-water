import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';

// Tabel Pelanggan
export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  nomorHp: text('nomor_hp').notNull().unique(),
  nama: text('nama').notNull(),
  totalTransaksi: integer('total_transaksi').default(0),
  akumulasiBelanja: integer('akumulasi_belanja').default(0),
  akumulasiUtang: integer('akumulasi_utang').default(0), // TAMBAHAN: Catatan kasbon
  createdAt: timestamp('created_at').defaultNow(),
});

// Tabel Produk (Update)
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  barcode: text('barcode').unique(), // TAMBAHAN: Kolom barcode (opsional & unik)
  namaProduk: text('nama_produk').notNull(),
  kategori: text('kategori'),
  harga: integer('harga').notNull(),
  hargaGrosir: integer('harga_grosir'), // TAMBAHAN: Harga jika beli banyak
  minGrosir: integer('min_grosir'), // TAMBAHAN: Minimal beli (misal: 40 untuk 1 dus)
  stok: integer('stok').notNull().default(0),
  gambarUrl: text('gambar_url'),
});

// Tabel Pesanan Utama (Orders)
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  nomorHpPelanggan: text('nomor_hp_pelanggan').notNull(),
  tipePesanan: text('tipe_pesanan').notNull(), // Contoh isian: 'ambil_toko' atau 'kirim'
  status: text('status').notNull().default('menunggu'), // 'menunggu', 'diproses', 'selesai'
  totalHarga: integer('total_harga').notNull(),
  catatan: text('catatan'),
  linkTracking: text('link_tracking'), // Tempat Anda menaruh link GoSend manual nanti
  statusPembayaran: text('status_pembayaran').notNull().default('lunas'), // TAMBAHAN: 'lunas' atau 'kasbon'
  createdAt: timestamp('created_at').defaultNow(),
});

// Tabel Detail Pesanan (Untuk mencatat barang apa saja di dalam satu pesanan)
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id),
  namaProduk: text('nama_produk').notNull(),
  kuantitas: integer('kuantitas').notNull(),
  hargaSatuan: integer('harga_satuan').notNull(),
});

// Tabel Request Barang dari Pelanggan
export const productRequests = pgTable('product_requests', {
  id: serial('id').primaryKey(),
  nomorHpPelanggan: text('nomor_hp_pelanggan').notNull(),
  namaBarang: text('nama_barang').notNull(),
  gambarUrl: text('gambar_url'), // Link gambar dari Supabase Storage
  status: text('status').notNull().default('pending'), // 'pending', 'diterima', 'ditolak', 'sudah_ada'
  komentarAdmin: text('komentar_admin'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tabel Riwayat Penyesuaian Stok (Audit Trail)
export const inventoryAdjustments = pgTable('inventory_adjustments', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').notNull().references(() => products.id),
  stokSistem: integer('stok_sistem').notNull(),
  stokFisik: integer('stok_fisik').notNull(),
  selisih: integer('selisih').notNull(),
  alasan: text('alasan').notNull(), // Misalnya: "Barang kedaluwarsa", "Hilang", "Salah hitung awal"
  createdAt: timestamp('created_at').defaultNow(),
});

// TAMBAHAN BARU: Tabel Riwayat Pelunasan
export const paymentHistory = pgTable('payment_history', {
  id: serial('id').primaryKey(),
  nomorHpPelanggan: text('nomor_hp_pelanggan').notNull(),
  nominalBayar: integer('nominal_bayar').notNull(),
  tanggalBayar: timestamp('tanggal_bayar').defaultNow(),
});