// GET /api/registrations — قائمة المسجّلين (للإدارة)
// حماية بمفتاح، ويدعم التصفية: ?gender=ذكر|أنثى  و  ?program=...
import { sql } from '@vercel/postgres';
import { ensureTable } from './_db.js';

export default async function handler(req, res) {
  const ADMIN_KEY = process.env.ADMIN_KEY || 'maher14*2-=sd';
  if (req.headers['x-admin-key'] !== ADMIN_KEY) {
    return res.status(401).json({ ok: false, error: 'غير مصرّح' });
  }

  // حذف مسجّل: DELETE /api/registrations?id=123
  if (req.method === 'DELETE') {
    const id = +req.query.id;
    if (!id) return res.status(400).json({ ok: false, error: 'معرّف غير صالح' });
    try {
      await ensureTable();
      await sql`DELETE FROM registrations WHERE id=${id}`;
      return res.json({ ok: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false, error: 'خطأ في الخادم' });
    }
  }

  try {
    await ensureTable();
    const { gender, program } = req.query;
    let result;
    if (gender && program) {
      result = await sql`SELECT * FROM registrations WHERE gender=${gender} AND program=${program} ORDER BY created_at DESC`;
    } else if (gender) {
      result = await sql`SELECT * FROM registrations WHERE gender=${gender} ORDER BY created_at DESC`;
    } else if (program) {
      result = await sql`SELECT * FROM registrations WHERE program=${program} ORDER BY created_at DESC`;
    } else {
      result = await sql`SELECT * FROM registrations ORDER BY created_at DESC`;
    }
    return res.json({ ok: true, count: result.rowCount, rows: result.rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'خطأ في الخادم' });
  }
}
