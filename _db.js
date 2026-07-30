// أداة مشتركة: تتأكد من وجود جدول التسجيلات وتحدّثه إن كان قديمًا
import { sql } from '@vercel/postgres';

async function safe(fn) { try { await fn(); } catch (e) { /* عمود غير موجود — تجاهل */ } }

export async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS registrations (
      id          SERIAL PRIMARY KEY,
      full_name   TEXT NOT NULL,
      age         INTEGER NOT NULL,
      gender      TEXT NOT NULL,
      email       TEXT NOT NULL,
      country     TEXT NOT NULL,
      program     TEXT NOT NULL,
      batch       TEXT,
      pledge      BOOLEAN NOT NULL DEFAULT false,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
  // ترقية جدول قديم إن وُجد — كل عملية مستقلة ولا تُفشل الباقي
  await safe(() => sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS full_name TEXT`);
  await safe(() => sql`ALTER TABLE registrations ALTER COLUMN full_name DROP NOT NULL`);
  await safe(() => sql`ALTER TABLE registrations ALTER COLUMN batch DROP NOT NULL`);
  await safe(() => sql`ALTER TABLE registrations ALTER COLUMN phone DROP NOT NULL`);
  await safe(() => sql`ALTER TABLE registrations ALTER COLUMN city DROP NOT NULL`);
  await safe(() => sql`ALTER TABLE registrations ALTER COLUMN last_name DROP NOT NULL`);
  await safe(() => sql`ALTER TABLE registrations ALTER COLUMN first_name DROP NOT NULL`);
}
