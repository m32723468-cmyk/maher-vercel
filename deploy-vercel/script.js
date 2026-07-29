/* ============================================================
   ملتقى ماهر الإلكتروني — منطق صفحة التسجيل
   ------------------------------------------------------------
   • يشغّل أنيميشن المقدمة ثم يُظهر النموذج.
   • يتحقق من الحقول، يحدّث شريط التقدّم وعلامات ✓.
   • عند الإرسال يرسل POST إلى API_URL ثم يعرض شاشة النجاح.
   ============================================================ */

// 🔗 عنوان الـAPI — غيّره لعنوان خادمك الحقيقي عند ربط الـbackend
//    مثال: 'https://api.maher.com/register'
const API_URL = '/api/register';

// 🧪 وضع العرض: عند true يعرض شاشة النجاح حتى بدون خادم (لأغراض التجربة).
//    ⚠️ بعد ربط الـAPI الحقيقي، غيّره إلى false.
const DEMO_MODE = false;

const FIELDS = ['firstName', 'lastName', 'age', 'gender', 'phone', 'email', 'country', 'city', 'program', 'batch'];

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- عناصر ---------- */
  const intro       = document.getElementById('intro');
  const page        = document.getElementById('page');
  const skipBtn     = document.getElementById('skipBtn');
  const form        = document.getElementById('form');
  const progressFill= document.getElementById('progressFill');
  const progressNum = document.getElementById('progressNum');
  const genderInput = document.getElementById('gender');
  const genderBtns  = document.querySelectorAll('.gender-btn');
  const submitBtn   = document.getElementById('submitBtn');
  const formError   = document.getElementById('formError');
  const success     = document.getElementById('success');
  const pledge      = document.getElementById('pledge');

  /* ---------- المقدمة ---------- */
  let t1, t2;
  function showForm() {
    if (intro.classList.contains('hide')) return;
    intro.classList.add('hide');
    page.classList.add('show');
    setTimeout(() => intro.classList.add('done'), 900);
  }
  t1 = setTimeout(showForm, 3200);
  skipBtn.addEventListener('click', () => { clearTimeout(t1); clearTimeout(t2); showForm(); });

  /* ---------- تنظيف المدخلات ---------- */
  const ageEl   = document.getElementById('age');
  const phoneEl = document.getElementById('phone');
  ageEl.addEventListener('input', () => { ageEl.value = ageEl.value.replace(/[^0-9]/g, ''); });
  phoneEl.addEventListener('input', () => { phoneEl.value = phoneEl.value.replace(/[^0-9+\s]/g, ''); });

  /* ---------- الجنس ---------- */
  genderBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      genderBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      genderInput.value = btn.dataset.gender;
      update();
    });
  });

  /* ---------- قراءة القيم ---------- */
  function values() {
    return {
      firstName: form.firstName.value.trim(),
      lastName:  form.lastName.value.trim(),
      age:       form.age.value.trim(),
      gender:    genderInput.value.trim(),
      phone:     form.phone.value.trim(),
      email:     form.email.value.trim(),
      country:   form.country.value.trim(),
      city:      form.city.value.trim(),
      program:   form.program.value.trim(),
      batch:     form.batch.value.trim(),
      pledge:    pledge.checked,
    };
  }

  /* ---------- تحديث الحالة (✓ + التقدّم + الزر) ---------- */
  function update() {
    const v = values();
    let filled = 0;

    FIELDS.forEach(k => {
      if (String(v[k]) !== '') filled++;
    });

    // علامات ✓ على الحقول النصية
    ['firstName', 'lastName', 'age', 'phone', 'email', 'city'].forEach(k => {
      const wrap = form[k].closest('.input-wrap');
      if (wrap) wrap.classList.toggle('filled', form[k].value.trim() !== '');
    });

    const pct = Math.round((filled / FIELDS.length) * 100);
    progressFill.style.width = pct + '%';
    progressNum.textContent = pct + '%';
    submitBtn.disabled = !(filled === FIELDS.length && pledge.checked);
  }

  form.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('input', update);
    el.addEventListener('change', update);
  });

  /* ---------- الإرسال ---------- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const v = values();
    if (FIELDS.some(k => v[k] === '') || !v.pledge || submitBtn.dataset.sending === '1') return;

    submitBtn.dataset.sending = '1';
    submitBtn.textContent = 'جارٍ الإرسال…';
    formError.textContent = '';

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(v),
      });
      if (!res.ok) throw new Error('bad status ' + res.status);
      showSuccess();
    } catch (err) {
      if (DEMO_MODE) {
        // وضع التجربة فقط — بدون خادم
        showSuccess();
      } else {
        formError.textContent = 'تعذّر إرسال البيانات، حاول مرة أخرى';
        submitBtn.dataset.sending = '';
        submitBtn.textContent = 'إرسال الطلب';
      }
    }
  });

  function showSuccess() {
    success.hidden = false;
  }

  update();
});
