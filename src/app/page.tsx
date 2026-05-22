import { db } from '../db';
import { products } from '../db/schema';
import { desc } from 'drizzle-orm';
import KatalogClient from './KatalogClient';

export default async function LandingPage() {
  const katalog = await db.select().from(products).orderBy(desc(products.id));
  return <KatalogClient katalog={katalog} />;
}