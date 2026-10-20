// Importa inmuebles desde CSV a Supabase (tabla mv_properties)
// Uso: node scripts/import-inmuebles.mjs data/inmuebles.csv
// Requiere: MV_SUPABASE_URL y SUPABASE_SERVICE_ROLE en .env (o variables de entorno)

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const csvPath = args[0] || path.join('data', 'inmuebles.csv');
if (!fs.existsSync(csvPath)) {
  console.error(`No existe el CSV: ${csvPath}`);
  process.exit(1);
}

// Carga .env básico
const envPath = path.join(process.cwd(), '.env');
const env = {};
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
}

const SUPABASE_URL = (env.MV_SUPABASE_URL || env.SUPABASE_URL || '').replace(/\/$/, '');
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE || env.SUPABASE_SERVICE_ROLE_KEY || '';
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Faltan MV_SUPABASE_URL o SUPABASE_SERVICE_ROLE en .env');
  process.exit(1);
}

function parseCsv(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (ch !== '\r') field += ch;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter(r => r.some(c => c.trim() !== ''));
}

const rows = parseCsv(fs.readFileSync(csvPath, 'utf8'));
const headers = rows.shift();
const idx = Object.fromEntries(headers.map((h, i) => [h.trim(), i]));
const required = ['id', 'title', 'zone', 'm2', 'price'];
for (const r of required) {
  if (!(r in idx)) { console.error(`Falta columna obligatoria: ${r}`); process.exit(1); }
}

const records = rows.map(r => {
  const get = (k) => (idx[k] !== undefined ? String(r[idx[k]] ?? '').trim() : '');
  const num = (k) => { const v = Number(get(k).replace(',', '.')); return Number.isFinite(v) ? v : null; };
  return {
    id: get('id'),
    title: get('title'),
    zone: get('zone').toLowerCase(),
    rooms: num('rooms'),
    m2: num('m2'),
    price: num('price'),
    year: num('year'),
    condition: get('condition') || null,
    elevator: get('elevator').toLowerCase() === 'true',
    features: get('features') ? get('features').split('|').map(s => s.trim()).filter(Boolean) : [],
    description: get('description'),
    rent_estimate: num('rent_estimate'),
  };
}).filter(r => r.id && r.title && r.price);

console.log(`Inmuebles a importar: ${records.length}`);
const res = await fetch(`${SUPABASE_URL}/rest/v1/mv_properties?on_conflict=id`, {
  method: 'POST',
  headers: {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'resolution=merge-duplicates,return=minimal',
  },
  body: JSON.stringify(records),
});

if (!res.ok) {
  console.error('Error Supabase:', res.status, await res.text());
  process.exit(1);
}
console.log('✅ Importación completada.');
