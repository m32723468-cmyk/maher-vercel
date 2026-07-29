// أداة مشتركة: تتأكد من وجود جدول التسجيلات
import { sql } from '@vercel/postgres';

export async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS registrations (
      id          SERIAL PRIMARY KEY,
      first_name  TEXT NOT NULL,
      last_name   TEXT NOT NULL,
      age         INTEGER NOT NULL,
      gender      TEXT NOT NULL,
      phone       TEXT NOT NULL,
      email       TEXT NOT NULL,
      country     TEXT NOT NULL,
      city        TEXT NOT NULL,
      program     TEXT NOT NULL,
      batch       TEXT NOT NULL,
      pledge      BOOLEAN NOT NULL DEFAULT false,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
}
