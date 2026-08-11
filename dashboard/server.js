const http = require('http');
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------
// Load dashboard/.env (simple parser, no deps)
// ---------------------------------------------------------------
function loadEnv(file) {
  const result = {};
  try {
    const raw = fs.readFileSync(file, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      result[key] = val;
    }
  } catch {}
  return result;
}

const env = loadEnv(path.join(__dirname, '.env'));

const SUPA_URL = env.DASHBOARD_URL || process.env.DASHBOARD_URL || '';
const SERVICE_ROLE = env.DASHBOARD_SERVICE_ROLE || process.env.DASHBOARD_SERVICE_ROLE || '';
const PASSWORD = env.DASHBOARD_PASSWORD || process.env.DASHBOARD_PASSWORD || '';
const PORT = Number(env.PORT || process.env.PORT || 4000);

const GB = (n) => (Number.isFinite(n) ? Number(n).toLocaleString('ar-EG') : '—');

// ---------------------------------------------------------------
// Supabase REST helper (service_role bypasses RLS)
// ---------------------------------------------------------------
async function supabaseGet(tablePath, params) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${SUPA_URL}/rest/v1/${tablePath}?${qs}`, {
    headers: {
      apikey: SERVICE_ROLE,
      Authorization: `Bearer ${SERVICE_ROLE}`,
      Accept: 'application/json',
    },
  });
  if (!res.ok) throw new Error(`GET ${tablePath} → ${res.status} ${res.statusText}`);
  return res.json();
}

function dayKey(iso) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function hoursLabel(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${GB(h)} س ${m} د`;
  return `${m} د`;
}

// ---------------------------------------------------------------
// Load & aggregate
// ---------------------------------------------------------------
async function loadStats() {
  const [profiles, gameState, sessions] = await Promise.all([
    supabaseGet('profiles', {
      select: 'id,display_name,gender,age,country,city,created_at,last_seen_at',
      order: 'last_seen_at.desc',
      limit: '1000',
    }),
    supabaseGet('game_state', {
      select: 'user_id,state,last_saved_at',
      limit: '1000',
    }),
    supabaseGet('sessions', {
      select: 'user_id,device_id,started_at,ended_at,duration_seconds',
      order: 'started_at.desc',
      limit: '100000',
    }),
  ]);

  // hasanat per user
  const hasanatByUser = {};
  let totalHasanat = 0;
  for (const row of gameState || []) {
    const h = Number(row.state?.hasanat || 0);
    hasanatByUser[row.user_id] = h;
    totalHasanat += h;
  }

  // usage per day
  const usageByDay = {};
  let totalSeconds = 0;
  let todaySeconds = 0;
  const anonDevices = new Set();
  const connectedSessionSeconds = {};
  const today = dayKey(new Date());

  for (const s of sessions || []) {
    const dur = Number(s.duration_seconds || 0);
    totalSeconds += dur;
    const key = dayKey(s.started_at);
    usageByDay[key] = (usageByDay[key] || 0) + dur;
    if (key === today) todaySeconds += dur;
    if (s.user_id) {
      connectedSessionSeconds[s.user_id] = (connectedSessionSeconds[s.user_id] || 0) + dur;
    } else if (s.device_id) {
      anonDevices.add(s.device_id);
    }
  }

  const days = Object.keys(usageByDay).sort().reverse().slice(0, 7);

  // per-user table
  const rows = [];
  const nameById = {};
  for (const p of profiles || []) nameById[p.id] = p.display_name || p.email || p.id.slice(0, 8);
  const allIds = new Set([...Object.keys(hasanatByUser), ...Object.keys(nameById)]);
  for (const id of allIds) {
    const prof = (profiles || []).find((p) => p.id === id) || {};
    rows.push({
      name: prof.display_name || prof.email || nameById[id] || id.slice(0, 8),
      gender: prof.gender || '—',
      country: prof.country || prof.city || '—',
      hasanat: hasanatByUser[id] || 0,
      usageSec: connectedSessionSeconds[id] || 0,
      lastSeen: prof.last_seen_at || '—',
    });
  }
  rows.sort((a, b) => b.hasanat - a.hasanat);

  return {
    connectedUsers: (profiles || []).length,
    anonDevices: anonDevices.size,
    totalHasanat,
    totalHours: totalSeconds,
    todaySeconds,
    days,
    usageByDay,
    rows,
  };
}

// ---------------------------------------------------------------
// HTML
// ---------------------------------------------------------------
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function render(stats) {
  const bars = stats.days
    .map((d) => {
      const sec = stats.usageByDay[d] || 0;
      const minutes = Math.round(sec / 60);
      const max = Math.max(...stats.days.map((x) => stats.usageByDay[x] || 0), 1);
      const pct = Math.round((sec / max) * 100);
      return `<div class="bar-item"><div class="bar" style="height:${Math.max(pct, 4)}%"><span>${minutes} د</span></div><div class="bar-label">${esc(d.slice(5))}</div></div>`;
    })
    .join('');

  const rows = stats.rows
    .map(
      (r, i) => `<tr>
        <td>${i + 1}</td>
        <td>${esc(r.name)}</td>
        <td>${esc(r.gender)}</td>
        <td>${esc(r.country)}</td>
        <td class="gold">${GB(r.hasanat)}</td>
        <td>${hoursLabel(r.usageSec)}</td>
        <td class="dim">${esc((r.lastSeen || '').slice(0, 10))}</td>
      </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>داشبورد ابنِ جنتك</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background: #0B1E16; color: #E8E6DC; padding: 24px; }
  h1 { color: #D4AF37; font-size: 22px; margin-bottom: 4px; }
  .sub { color: #8BA; margin-bottom: 20px; font-size: 13px; }
  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 14px; margin-bottom: 24px; }
  .card { background: #0E2A1F; border: 1px solid rgba(212,175,55,0.18); border-radius: 14px; padding: 16px; }
  .card .label { font-size: 12px; color: #9AB8AC; margin-bottom: 8px; }
  .card .value { font-size: 26px; font-weight: 800; color: #F5EFD8; }
  .card .value.gold { color: #D4AF37; }
  .section { font-size: 15px; font-weight: 700; color: #D4AF37; margin: 24px 0 12px; }
  .bars { display: flex; align-items: flex-end; gap: 14px; height: 150px; padding: 10px; background: #0E2A1F; border-radius: 14px; border: 1px solid rgba(212,175,55,0.18); }
  .bar-item { flex: 1; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; height: 100%; gap: 4px; }
  .bar { width: 100%; max-width: 46px; background: linear-gradient(180deg, #D4AF37, #8a6d1f); border-radius: 6px 6px 0 0; display: flex; align-items: flex-start; justify-content: center; padding-top: 4px; }
  .bar span { font-size: 10px; color: #021A13; font-weight: 700; }
  .bar-label { font-size: 10px; color: #9AB8AC; }
  table { width: 100%; border-collapse: collapse; background: #0E2A1F; border-radius: 14px; overflow: hidden; font-size: 13px; }
  th, td { padding: 9px 10px; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.06); }
  th { color: #D4AF37; font-weight: 700; font-size: 12px; background: rgba(212,175,55,0.06); }
  td.gold { color: #D4AF37; font-weight: 800; }
  td.dim { color: #7f9a8f; }
  tr:last-child td { border-bottom: none; }
  .muted { color: #9AB8AC; font-size: 12px; }
  @media (max-width: 600px) { .cards { grid-template-columns: 1fr 1fr; } }
</style>
</head>
<body>
  <h1>داشبورد ابنِ جنتك</h1>
  <div class="sub">لوحة إحصاءات المطور — ${new Date().toLocaleString('ar-EG')}</div>

  <div class="cards">
    <div class="card"><div class="label">المتصلون (جيمايل)</div><div class="value">${GB(stats.connectedUsers)}</div></div>
    <div class="card"><div class="label">أجهزة مجهولة</div><div class="value">${GB(stats.anonDevices)}</div></div>
    <div class="card"><div class="label">الاستخدام اليوم (ساعات)</div><div class="value gold">${(stats.todaySeconds / 3600).toFixed(1)}</div></div>
    <div class="card"><div class="label">إجمالي ساعات الاستخدام</div><div class="value">${(stats.totalHours / 3600).toFixed(1)}</div></div>
    <div class="card"><div class="label">الحسنات المتراكمة (مجموع)</div><div class="value gold">${GB(stats.totalHasanat)}</div></div>
  </div>

  <div class="section">الاستخدام آخر 7 أيام</div>
  <div class="bars">${bars}</div>

  <div class="section">الحسنات لكل مستخدم</div>
  <table>
    <thead><tr><th>#</th><th>الاسم</th><th>الجنس</th><th>البلد/المدينة</th><th>الحسنات</th><th>الاستخدام</th><th>آخر نشاط</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <p class="muted" style="margin-top:14px">الداشبورد يقرأ عبر مفتاح service_role من جداول profiles و game_state و sessions.</p>
</body>
</html>`;
}

// ---------------------------------------------------------------
// HTTP server
// ---------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (url.pathname !== '/') {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('غير موجود');
    return;
  }

  if (PASSWORD && url.searchParams.get('pw') !== PASSWORD) {
    res.writeHead(401, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('كلمة المرور غير صحيحة. أضف ?pw=كلمة_المرور إلى الرابط');
    return;
  }

  if (!SUPA_URL || !SERVICE_ROLE) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('املأ DASHBOARD_URL و DASHBOARD_SERVICE_ROLE في dashboard/.env');
    return;
  }

  try {
    const stats = await loadStats();
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(render(stats));
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`خطأ في جلب البيانات: ${e.message}`);
  }
});

server.listen(PORT, () => {
  console.log(`\n  📊 داشبورد ابنِ جنتك يعمل على:  http://localhost:${PORT}\n`);
  if (!SUPA_URL || !SERVICE_ROLE) {
    console.log('  ⚠️  قم بملء dashboard/.env (DASHBOARD_URL + DASHBOARD_SERVICE_ROLE) ثم أعد التشغيل.\n');
  }
});
