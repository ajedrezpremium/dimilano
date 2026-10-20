# Di Milano Vigo — Agente inmobiliario IA · v1.0

Agente IA 24/7 para **Di Milano** (constructora e inmobiliaria en Vigo, [dimilano.es](https://www.dimilano.es/)): **técnico, comercial y administrativo**.
Inspirado en lo mejor de Kasai, Kontaktu AI, Domus-IA, Zillow AI Mode, Sierra (Redfin) y Claire (reAlpha).

## Qué hace la v1.0

| Capacidad | Sección |
|---|---|
| Chat con memoria conversacional (perfil + score live) | `#agente` |
| Matching lead→inmueble < 5 s, con desglose de "por encaja" | chat + `#propiedades` |
| Búsqueda conversacional por lenguaje natural (Zillow-style) | `#propiedades` |
| Tasación exprés por barrio con rango y renta | `#tasacion` + [dimilano.es/valorador](https://www.dimilano.es/valorador) |
| Estimador de reforma + plusvalía | `#tasacion` |
| Radar de mercado por barrio (€/m², alquiler, tendencia) | `#mercado` |
| CRM con pipeline, etapas, CSV y leads demo | `#crm` |
| Agenda de visitas con confirmación y tarea en CRM | modal |
| Voz: TTS femenina (♀) o masculina (♂) en ES/GL/EN + dictado | chat |
| Compartir en X · WhatsApp · Facebook · LinkedIn + copiar/pegar | hero, tarjetas y burbujas |
| ES · GL · EN (roadmap a 35 idiomas) | selector en nav |
| Footer oficial con logo, contacto, menú, servicios y legal | footer |

## Stack (100 % gratuito)

- **Frontend estático**: HTML + CSS + JS vanilla. Sin build, sin node.
- **GitHub**: repo = fuente de verdad (https://github.com/ajedrezpremium/dimilano).
- **Vercel**: hosting + `api/chat.js` (serverless gratuita) que proxy OpenRouter (LLM de modelos free) y `api/config.js` que inyecta claves por env vars sin hardcodearlas.
- **Supabase**: base `mv_properties`, `mv_leads`, `mv_messages`, `mv_profiles`, `mv_visits` + RLS. Schema aplicado: 5 tablas + seed de 12 inmuebles.
- **OpenRouter**: cerebro LLM del agente (por defecto `minimax/minimax-m3.1-flash:free` con fallbacks a `gemma-4` y `xing4.0`). Sin key → motor de reglas local se hace cargo automáticamente.

Sin Supabase la web funciona igual en **modo demo** (localStorage). Al conectar Supabase todo escribe en prod.

## Deploy en 4 pasos

### 1 · GitHub
```bash
git remote add origin https://github.com/ajedrezpremium/dimilano.git
git push -u origin main
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
   - `OPENROUTER_API_KEY` = tu key de OpenRouter (modelos free)
3. Deploy. `api/config.js` y `api/chat.js` serviran las claves al frontend en runtime.

> Alternativa sin Vercel (GitHub Pages / local): rellena `assets/js/config.js` con URL + key. El LLM de OpenRouter solo funciona vía serverless; sin él, el motor de reglas local responde igual (offline-first).

### 4 · Probar el agente
1. Abre la web → sección 01 y escribe:
   - *"busco piso 2 hab en Bouzas menos de 160k con ascensor"* → match < 5 s
   - *"quiero vender mi piso en Alcabre, 88 m², reformado, 1998, con ascensor"* → tasación instantánea
   - *"¿qué recuerdas de mí?"* → memoria conversacional
   - *"gastos de compraventa"* → bloque técnico-legal de Galicia
2. Ve a `#crm`: tu lead aparece con score, etapa y próxima acción.
3. Pulsa "Cargar leads demo" para ver el pipeline llenito.

## Seguridad / límites v1.0

- La anon key de Supabase es pública por diseño: RLS permite **insertar** leads/mensajes/visitas y **leer** inmuebles publicados, pero **no leer** leads ni mensajes (`mv_leads`, `mv_messages` sin SELECT público).
- `OPENROUTER_API_KEY` y claves sensibles van SOLO por env vars (`.env` local y Vercel); `.env` está gitignored. Nunca hardcodear en `assets/js/`.
- Todas las cifras de mercado son **estimaciones orientativas** (el propio agente lo avisa en sus respuestas).
- Marca, logo y datos de contacto: [dimilano.es](https://www.dimilano.es/) (Constructora: Rúa García Olloqui 8 · Inmobiliaria: Praza de Compostela 32 · 986 90 90 10).
- Voces TTS dependen del navegador (Chrome/Edge: mejor catálogo). Gallego TTS usa voz castellana como fallback si el sistema no trae `gl`.
- Riesgos/bordes conocidos hacia v1.1: WhatsApp Business API (Kasai-style), voz telefónica real (Kontaktu-style), LLM real en el chat (clave OpenAI/Gemini opcional), split con CRM externo (Domus-style).
