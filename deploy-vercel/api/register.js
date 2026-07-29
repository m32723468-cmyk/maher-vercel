// POST /api/register — استقبال تسجيل جديد وتخزينه في Postgres
import { sql } from '@vercel/postgres';
import { ensureTable } from './_db.js';

const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const isPhone = (s) => /^[0-9+\s]{6,20}$/.test(s);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, errors: ['الطريقة غير مسموحة'] });
  }

  const b = req.body || {};
  const errors = [];
  const req_fields = ['firstName', 'lastName', 'age', 'gender', 'phone', 'email', 'country', 'city', 'program', 'batch'];
  for (const k of req_fields) {
    if (!b[k] || String(b[k]).trim() === '') errors.push(`الحقل ${k} مطلوب`);
  }
  if (b.pledge !== true) errors.push('يجب الموافقة على التعهّد');
  if (b.email && !isEmail(b.email)) errors.push('صيغة البريد الإلكتروني غير صحيحة');
  if (b.phone && !isPhone(b.phone)) errors.push('صيغة رقم الهاتف غير صحيحة');
  if (b.age && (isNaN(+b.age) || +b.age < 5 || +b.age > 120)) errors.push('العمر غير صالح');
  if (b.gender && !['ذكر', 'أنثى'].includes(b.gender)) errors.push('الجنس غير صالح');
  if (errors.length) return res.status(400).json({ ok: false, errors });

  try {
    await ensureTable();
    const r = await sql`
      INSERT INTO registrations (first_name, last_name, age, gender, phone, email, country, city, program, batch, pledge)
      VALUES (${b.firstName.trim()}, ${b.lastName.trim()}, ${+b.age}, ${b.gender}, ${b.phone.trim()},
              ${b.email.trim()}, ${b.country}, ${b.city.trim()}, ${b.program}, ${b.batch}, ${!!b.pledge})
      RETURNING id;
    `;
    return res.status(201).json({ ok: true, id: r.rows[0].id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, errors: ['خطأ في الخادم'] });
  }
}
