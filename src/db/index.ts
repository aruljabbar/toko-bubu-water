import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Mengambil URL database dari file .env.local
const connectionString = process.env.DATABASE_URL!;

// Membuka koneksi ke Supabase
const client = postgres(connectionString);
export const db = drizzle(client, { schema });