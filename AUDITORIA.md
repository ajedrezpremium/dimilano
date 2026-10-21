# Auditoría v1.1.1 — Web + Agente IA Di Milano
*Fecha: 21-oct-2026 · Producción: https://dimilano-theta.vercel.app (dominio final: agente.dimilano.es, DNS pendiente) · Repo: github.com/ajedrezpremium/dimilano*

## 1. Scorecard

| Área | Nota | Evidencia |
|---|---|---|
| Funcionalidad | 9/10 | Chat con memoria+score, matching, tasación, reformas, radar mercado, CRM, scheduler — QA E2E OK |
| UX / Responsive | 8,5/10 | Sin scroll horizontal en móvil (390px), 15 botones share, 3 controles de voz |
| i18n | 8/10 | ES/GL/EN en UI y agente local; switch verificado en producción |
| Robustez | 7/10 | LLM free con 429 intermitentes → fallback al motor local siempre responde |
| Rendimiento | 8/10 | 0,9–2,6 s warm · ~17 s primera visita (cold start + CDN, sin build) |
| Seguridad | 8/10 | Claves solo en serverless; anon key pública por diseño; RLS activo |
| SEO | 7/10 | Title/meta correctos; falta sitemap.xml, robots.txt, OG image |
| Legal (RGPD) | 8/10 | 4 páginas legales oficiales enlazadas; falta checkbox de consentimiento en formularios |
| Observabilidad | 5/10 | Sin analytics ni alertas; solo logs Vercel/Supabase |

## 2. QA ejecutado en producción (browser headless)
- **0 errores JS**, 1 aviso de red (ver hallazgo H2). HTTP 200, title correcto.
- Chat comprador: respuesta + score visibles ✅ · Búsqueda NL ("terraza en Samil") ✅ · Tasación con resultado € ✅
- Footer: 11 enlaces a dimilano.es ✅ · Share ×15 ✅ · Voz ×3 ✅ · Móvil sin overflow ✅ · i18n ES→EN ✅
- LLM `/api/chat`: ES ~100 %, EN ~100 %, GL ~25–50 % (429 upstream en modelos free; el motor local cubre el resto en gallego correcto).

## 3. Hallazgos

**H1 · LLM free inestable (media)** — Los modelos `:free` de OpenRouter devuelven 429 frecuentes; GL es el idioma más afectado. El JSON-mode (`{"reply":...}`) + filtros anti-razonamiento ya aplicados dejaron ES/EN sólidos.
→ **P0/P1**: añadir un modelo de pago barato como primario (Minimax M2 o gpt-oss-20b ≈ 0,2–0,5 $/1M tokens: <5 €/mes con este tráfico) dejando los free como respaldo.

**H2 · 409 en mv_leads (bajo)** — Reinsertar el mismo `visitor_id` devuelve 409; el código lo ignora, pero pinta un error en consola del navegador (mala imagen si un desarrollador la abre).
→ **P1**: comprobar existencia con `GET ?visitor_id=eq…` antes del insert (o `Prefer: resolution=merge-duplicates` tras crear unique constraint).

**H3 · DNS agente.dimilano.es (alto impacto, 5 min)** — Vercel ya tiene asignado el dominio pero `agente.dimilano.es` no resuelve (NXDOMAIN).
→ **P0**: en el panel DNS de dimilano.es, crear `CNAME agente → cname.vercel-dns.com` (o A 76.76.21.21). Redirección 301 de dimilano.es/agente opcional.

**H4 · WhatsApp v1.2 sin credenciales Meta** — Endpoint diseñado (verify + inbound + Graph reply). Bloqueado por falta de token/phone-number-id de Meta Business.
→ **P1**: dar de alta WhatsApp Business API (Meta) y configurar `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN` en Vercel.

**H5 · Sin analytics (medio)** — No se mide nada: conversaciones, leads, origen.
→ **P1**: Plausible (sin cookies, RGPD-friendly) o GA4 + evento `lead_creado` en `saveLead`.

**H6 · RGPD formulario (medio)** — El formulario guarda teléfono/email sin checkbox de consentimiento.
→ **P1**: checkbox "Acepto la política de privacidad" (required) antes de guardar lead + registro de fecha de consentimiento en `mv_leads`.

**H7 · SEO técnico (bajo)** — Falta `robots.txt`, `sitemap.xml`, OG image y `lang="gl"` dinámico.
→ **P2**: sitemap con las páginas + props indexables, OG image con logo Di Milano.

**H8 · Sin tests ni CI (bajo)** — QA manual por skill de browser.
→ **P2**: suite Playwright (los scripts ya existen en temp) + GitHub Actions que corre en cada push.

**H9 · Rate-limit /api/chat (bajo)** — Endpoint abierto; un abuso consumiría la cuota free de OpenRouter.
→ **P2**: cooldown simple por IP (memoria del serverless o Upstash Redis) 10 req/min.

**H10 · Datos de conversación (informativo)** — `mv_messages` guarda todo el texto; útil para reentrenar TT y detectar intención. Sin PII sensible (teléfono solo en leads).

## 4. Propuesta de mejora continua (ciclo semanal)
1. **Lunes**: revisar logs Vercel (errores 5xx) + leads nuevos en Supabase.
2. **Top 10 preguntas reales** de `mv_messages` → ajustar respuestas locales (TT) y SYSTEM prompt del LLM.
3. **Métricas objetivo mes 1**: ≥50 conversaciones, ≥15 leads con teléfono, ≥5 visitas agendadas, fallback LLM <20 %.
4. **Release train**: v1.2 WhatsApp → v1.3 LLM de pago + RAG con catálogo real (scraper semanal de dimilano.es/nuestros_pisos → `mv_properties`) → v1.4 CRM interno con Supabase Auth → v1.5 valorador avanzado + informes PDF.

## 5. Roadmap priorizado
| P | Ítem | Esfuerzo |
|---|---|---|
| P0 | DNS agente.dimilano.es (cliente) | 5 min |
| P1 | LLM de pago primario + fallbacks free | 30 min |
| P1 | Fix 409 mv_leads | 20 min |
| P1 | Checkbox RGPD + analytics | 1 h |
| P1 | WhatsApp webhook (requiere Meta) | 2 h |
| P2 | SEO (sitemap/robots/OG) | 1 h |
| P2 | Tests E2E + CI | 3 h |
| P2 | Rate-limit + security headers | 1 h |
