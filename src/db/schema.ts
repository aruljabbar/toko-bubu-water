import { pgTable, serial, text, integer, real, timestamp } from 'drizzle-orm/pg-core';

export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  nomorHp: text('nomor_hp').notNull().unique(),
  nama: text('nama').notNull(),
  totalTransaksi: integer('total_transaksi').default(0),
  akumulasiBelanja: integer('akumulasi_belanja').default(0),
  akumulasiUtang: integer('akumulasi_utang').default(0),
  akumulasiLaba: integer('akumulasi_laba').default(0), // BARU: Laba dari member ini
  createdAt: timestamp('created_at').defaultNow(),
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  barcode: text('barcode').unique(),
  namaProduk: text('nama_produk').notNull(),
  kategori: text('kategori'),
  satuan: text('satuan').notNull().default('pcs'), 
  hargaModal: integer('harga_modal').notNull().default(0),
  hargaModalGrosir: integer('harga_modal_grosir'),
  harga: integer('harga').notNull(),
  hargaGrosir: integer('harga_grosir'),
  minGrosir: integer('min_grosir'),
  stok: real('stok').notNull().default(0), // UBAH: Jadi real agar bisa koma (0.5 kg)
  gambarUrl: text('gambar_url'),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  nomorHpPelanggan: text('nomor_hp_pelanggan').notNull(),
  tipePesanan: text('tipe_pesanan').notNull(),
  status: text('status').notNull().default('selesai'),
  totalHarga: integer('total_harga').notNull(),
  cashReceived: integer('cash_received').default(0),
  kembalian: integer('kembalian').default(0),
  catatan: text('catatan'),
  linkTracking: text('link_tracking'),
  statusPembayaran: text('status_pembayaran').notNull().default('lunas'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  namaProduk: text('nama_produk').notNull(),
  kuantitas: real('kuantitas').notNull(), // UBAH: Jadi real (desimal)
  hargaSatuan: integer('harga_satuan').notNull(),
  modalSatuan: integer('modal_satuan').notNull().default(0),
});

export const productRequests = pgTable('product_requests', {
  id: serial('id').primaryKey(),
  nomorHpPelanggan: text('nomor_hp_pelanggan').notNull(),
  namaBarang: text('nama_barang').notNull(),
  gambarUrl: text('gambar_url'),
  status: text('status').notNull().default('pending'),
  komentarAdmin: text('komentar_admin'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const inventoryAdjustments = pgTable('inventory_adjustments', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  stokSistem: real('stok_sistem').notNull(), // UBAH: Jadi real (desimal)
  stokFisik: real('stok_fisik').notNull(),   // UBAH: Jadi real (desimal)
  selisih: real('selisih').notNull(),        // UBAH: Jadi real (desimal)
  alasan: text('alasan').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const paymentHistory = pgTable('payment_history', {
  id: serial('id').primaryKey(),
  nomorHpPelanggan: text('nomor_hp_pelanggan').notNull(),
  nominalBayar: integer('nominal_bayar').notNull(),
  tanggalBayar: timestamp('tanggal_bayar').defaultNow(),
});