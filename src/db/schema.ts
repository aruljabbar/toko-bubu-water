import { pgTable, serial, text, integer, real, timestamp } from 'drizzle-orm/pg-core';

export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  nomorHp: text('nomor_hp').notNull().unique(),
  nama: text('nama').notNull(),
  totalTransaksi: integer('total_transaksi').notNull().default(0), // FIXED: Tambah .notNull()
  akumulasiBelanja: integer('akumulasi_belanja').notNull().default(0), // FIXED
  akumulasiUtang: integer('akumulasi_utang').notNull().default(0), // FIXED
  akumulasiLaba: integer('akumulasi_laba').notNull().default(0), // FIXED
  poin: integer('poin').notNull().default(0), // FIXED: Tambah .notNull()
  createdAt: timestamp('created_at').defaultNow(),
});

export const shifts = pgTable('shifts', {
  id: serial('id').primaryKey(),
  waktuBuka: timestamp('waktu_buka').defaultNow(),
  waktuTutup: timestamp('waktu_tutup'),
  modalAwal: integer('modal_awal').notNull(),
  totalCashMasuk: integer('total_cash_masuk').notNull().default(0), // FIXED
  totalCashKeluar: integer('total_cash_keluar').notNull().default(0), // FIXED
  uangFisik: integer('uang_fisik'), // Boleh null karena belum diinput saat shift baru buka
  selisih: integer('selisih'), // Boleh null
  status: text('status').notNull().default('open'),
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  barcode: text('barcode').unique(),
  namaProduk: text('nama_produk').notNull(),
  kategori: text('kategori'),
  satuan: text('satuan').notNull().default('pcs'), 
  hargaModal: integer('harga_modal').notNull().default(0),
  hargaModalGrosir: integer('harga_modal_grosir'), // Boleh null jika tidak ada harga grosir
  harga: integer('harga').notNull(),
  hargaGrosir: integer('harga_grosir'),
  minGrosir: integer('min_grosir'),
  stok: real('stok').notNull().default(0),
  gambarUrl: text('gambar_url'),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  shiftId: integer('shift_id').references(() => shifts.id),
  nomorHpPelanggan: text('nomor_hp_pelanggan').notNull(),
  tipePesanan: text('tipe_pesanan').notNull(),
  status: text('status').notNull().default('selesai'),
  totalHarga: integer('total_harga').notNull(),
  potonganPoin: integer('potongan_poin').notNull().default(0), // FIXED
  cashReceived: integer('cash_received').notNull().default(0), // FIXED
  kembalian: integer('kembalian').notNull().default(0), // FIXED
  catatan: text('catatan'),
  linkTracking: text('link_tracking'),
  statusPembayaran: text('status_pembayaran').notNull().default('lunas'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  namaProduk: text('nama_produk').notNull(),
  kuantitas: real('kuantitas').notNull(),
  hargaSatuan: integer('harga_satuan').notNull(),
  modalSatuan: integer('modal_satuan').notNull().default(0), // FIXED
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
  stokSistem: real('stok_sistem').notNull(),
  stokFisik: real('stok_fisik').notNull(),  
  selisih: real('selisih').notNull(),       
  alasan: text('alasan').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const paymentHistory = pgTable('payment_history', {
  id: serial('id').primaryKey(),
  nomorHpPelanggan: text('nomor_hp_pelanggan').notNull(),
  nominalBayar: integer('nominal_bayar').notNull(),
  tanggalBayar: timestamp('tanggal_bayar').defaultNow(),
});