# Milano Vigo — Agente inmobiliario IA · v1.0

Agente IA 24/7 para el mercado de Vigo: **técnico, comercial y administrativo**.
Inspirado en lo mejor de Kasai, Kontaktu AI, Domus-IA, Zillow AI Mode, Sierra (Redfin) y Claire (reAlpha).

## Qué hace la v1.0

| Capacidad | Sección |
|---|---|
| Chat con memoria conversacional (perfil + score live) | `#agente` |
| Matching lead→inmueble < 5 s, con desglose de "por encaja" | chat + `#propiedades` |
| Búsqueda conversacional por lenguaje natural (Zillow-style) | `#propiedades` |
| Tasación exprés por barrio con rango y renta | `#tasacion` |
| Estimador de reforma + plusvalía | `#tasacion` |
| Radar de mercado por barrio (€/m², alquiler, tendencia) | `#mercado` |
| CRM con pipeline, etapas, CSV y leads demo | `#crm` |
| Agenda de visitas con confirmación y tarea en CRM | modal |
| Voz: reconocimiento (Chrome) y lectura de respuestas | chat |
| ES · GL · EN (roadmap a 35 idiomas) | selector en nav |

## Stack (100 % gratuito)

- **Frontend estático**: HTML + CSS + JS vanilla. Sin build, sin node.
- **GitHub**: repo = fuente de verdad (badges: demo, schema).
- **Vercel**: hosting + `api/config.js` (serverless gratuita) que inyecta las claves por env vars sin hardcodearlas.
- **Supabase**: base de datos `mv_properties`, `mv_leads`, `mv_messages`, `mv_profiles`, `mv_visits` + RLS.

Sin Supabase la web funciona igual en **modo demo** (localStorage). Al conectar Supabase todo escribe en prod.

## Deploy en 4 pasos

### 1 · GitHub
```bash
git init && git add -A && git commit -m "v1.0 Milano Vigo"
git remote add origin https://github.com/USUARIO/milano-vigo.git && git push -u origin main
```

### 2 · Supabase (gratis)
1. Crea proyecto en [supabase.com](https://supabase.com).
2. SQL Editor → pega `supabase/schema.sql` → Run (crea tablas, RLS y seed de 12 inmuebles).
3. Copia en *Project Settings → API*: `URL` y `anon key`.

### 3 · Vercel (gratis)
1. [vercel.com/new](https://vercel.com/new) → importa el repo de GitHub.
2. En **Environment Variables** añade:
   - `MV_SUPABASE_URL` = la URL de tu proyecto
   - `MV_SUPABASE_ANON_KEY` = la anon key
3. Deploy. `api/config.js` servirá las claves al frontend en runtime.

> Alternativa sin Vercel (GitHub Pages / local): rellena `assets/js/config.js` con URL + key.

### 4 · Probar el agente
1. Abre la web → sección 01 y escribe:
   - *"busco piso 2 hab en Bouzas menos de 160k con ascensor"* → match < 5 s
   - *"quiero vender mi piso en Alcabre, 88 m², reformado, 1998, con ascensor"* → tasación instantánea
   - *"¿qué recuerdas de mí?"* → memoria conversacional
   - *"gastos de compraventa"* → bloque técnico-legal de Galicia
2. Ve a `#crm`: tu lead aparece con score, etapa y próxima acción.
3. Pulsa "Cargar leads demo" para ver el pipeline llenito.

## Seguridad / límites v1.0

- La anon key de Supabase es pública por diseño: RLS permite **insertar** leads y **leer** inmuebles publicados, pero **no leer** leads ni mensajes (`mv_leads`, `mv_messages` sin SELECT público).
- Todas las cifras de mercado son **estimaciones orientativas** (el propio agente lo avisa en sus respuestas).
- Riesgos/bordes conocidos hacia v1.1: WhatsApp Business API (Kasai-style), voz telefónica real (Kontaktu-style), LLM real en el chat (clave OpenAI/Gemini opcional), split con CRM externo (Domus-style).
