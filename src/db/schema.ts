import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  nomorHp: text('nomor_hp').notNull().unique(),
  nama: text('nama').notNull(),
  totalTransaksi: integer('total_transaksi').default(0),
  akumulasiBelanja: integer('akumulasi_belanja').default(0),
  akumulasiUtang: integer('akumulasi_utang').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  barcode: text('barcode').unique(),
  namaProduk: text('nama_produk').notNull(),
  kategori: text('kategori'),
  hargaModal: integer('harga_modal').notNull().default(0), // BARU: Modal eceran
  hargaModalGrosir: integer('harga_modal_grosir'), // BARU: Modal grosir
  harga: integer('harga').notNull(),
  hargaGrosir: integer('harga_grosir'),
  minGrosir: integer('min_grosir'),
  stok: integer('stok').notNull().default(0),
  gambarUrl: text('gambar_url'), // BARU: URL Gambar produk
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  nomorHpPelanggan: text('nomor_hp_pelanggan').notNull(),
  tipePesanan: text('tipe_pesanan').notNull(),
  status: text('status').notNull().default('menunggu'),
  totalHarga: integer('total_harga').notNull(),
  catatan: text('catatan'),
  linkTracking: text('link_tracking'),
  statusPembayaran: text('status_pembayaran').notNull().default('lunas'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id),
  namaProduk: text('nama_produk').notNull(),
  kuantitas: integer('kuantitas').notNull(),
  hargaSatuan: integer('harga_satuan').notNull(),
  modalSatuan: integer('modal_satuan').notNull().default(0), // BARU: Untuk rekap laba per transaksi
});

export const productRequests = pgTable('product_requests', {
  id: serial('id').primaryKey(),
  nomorHpPelanggan: text('nomor_hp_pelanggan').notNull(),
  namaBarang: text('nama_barang').notNull(),
  gambarUrl: text('gambar_url'),
  status: text('status').notNull().default('pending'),
  komentarAdmin: text('komentar_admin'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const inventoryAdjustments = pgTable('inventory_adjustments', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').notNull().references(() => products.id),
  stokSistem: integer('stok_sistem').notNull(),
  stokFisik: integer('stok_fisik').notNull(),
  selisih: integer('selisih').notNull(),
  alasan: text('alasan').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const paymentHistory = pgTable('payment_history', {
  id: serial('id').primaryKey(),
  nomorHpPelanggan: text('nomor_hp_pelanggan').notNull(),
  nominalBayar: integer('nominal_bayar').notNull(),
  tanggalBayar: timestamp('tanggal_bayar').defaultNow(),
});