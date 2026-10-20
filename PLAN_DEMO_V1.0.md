# PLAN DEMO V1.0 — DIMILANO (Di Milano Vigo)

**Objetivo:** conseguir una reunión de 15 min con Di Milano y cerrar un **piloto de 30 días** del agente inmobiliario IA.
**URL demo:** https://dimilano-vigo.vercel.app
**Estado:** desplejado (Vercel), Supabase live (12 inmuebles), chat IA operativo, CRM de leads, tasación exprés, radar de mercado, ES/GL/EN.

## 1. Checklist antes de la demo (48 h)

| # | Tarea | Quién | Estado |
|---|---|---|---|
| 1 | Conectar subdominio **agente.dimilano.es** (CNAME → cname.vercel-dns.com) | Cliente / yo configuro el proyecto | Pendiente |
| 2 | Sustituir los 12 inmuebles demo por **8–12 inmuebles reales** con fotos, m², precio y zona | Yo (desde CSV/Excel del cliente) | Pendiente |
| 3 | Cambiar teléfonos/emails por los reales de la inmobiliaria | Yo | Hecho (config) |
| 4 | Crédito OpenRouter (~5–10 €) para modelos fiables (evitar 429) | Cliente | Pendiente |
| 5 | Crear email de leads: `leads@dimilano.es` o alias a inmobiliaria@ | Cliente | Pendiente |
| 6 | Probar flujo lead: chat → CRM → aviso email/WhatsApp | Yo | Hecho (demo) |
| 7 | Vídeo 60 s (móvil + escritorio) para enviar antes de la reunión | Yo | Pendiente |
| 8 | One-pager PDF: problema, solución, precio piloto, caso | Yo | Pendiente |

## 2. Guion de la demo (12 minutos)

1. **Comprador (3 min)** — “Busco piso de 2 hab en Bouzas con ascensor, hasta 160k”.
   → El agente cualifica, muestra 3 matches con desglose y ofrece visita.
2. **Vendedor (2 min)** — “Quiero vender mi piso en Alcabre, 88 m², reformado, 1998”.
   → Tasación exprés con rango y comparables de zona.
3. **Reforma (2 min)** — “¿Cuánto cuesta reformar una cocina de 9 m²?”
   → Estimación + plusvalía.
4. **CRM (2 min)** — El lead aparece con score, etapa y próxima acción; agenda de visita.
5. **Mercado (1 min)** — Radar de precios por barrio y renta estimada.
6. **Multi-idioma (1 min)** — Cambio a GL/EN para cliente extranjero.
7. **Cierre (1 min)** — Piloto 30 días, condiciones y siguiente paso.

## 3. Oferta piloto (para enviar tras la demo)

- **30 días de piloto** con agente + CRM + tasador en su web.
- Setup incluido: carga de inmuebles y personalización de marca.
- Precio tras piloto: **299 €/mes** (o 3.000 €/año) con contrato trimestral.
- Métrica de éxito: **10 leads cualificados/mes** y **3 visitas agendadas/semana**; si no se cumple, el piloto se prorroga gratis.

## 4. Materiales de demo

- Enlace directo: https://dimilano-vigo.vercel.app (y QR en la presentación).
- Vídeo 60 s (pendiente).
- One-pager PDF (pendiente).
- Email de seguimiento D+1 (plantilla abajo).

**Email D+1:**
> Hola [nombre], gracias por los 15 minutos. Te dejo el enlace a la demo: [URL]. Como acordamos, puedo cargar vuestros inmuebles reales y dejar el agente con vuestra marca en 48 h. ¿Empezamos el piloto de 30 días?

## 5. KPIs del piloto

- Conversaciones iniciadas/semana
- Leads cualificados/mes (≥10)
- Visitas agendadas/semana (≥3)
- Tiempo de respuesta del agente (<5 s)
- Tasa lead → visita (≥20 %)

## 6. Riesgos y mitigación

| Riesgo | Mitigación |
|---|---|
| Modelos free con 429 | Crédito OpenRouter + fallback local |
| Inmuebles demo poco creíbles | Cargar inventario real antes de la demo |
| Datos de menores/privacidad | Aviso RGPD y consentimiento en el formulario |
| Sin dominio propio | Subdominio agente.dimilano.es |

## 7. Plan de ejecución

- **D-3:** cargar inmuebles reales + dominio + prueba completa en móvil.
- **D-1:** vídeo 60 s + one-pager + email de confirmación con enlace y hora.
- **Día D:** demo guiada de 15 min (Teams/Meet/Zoom), compartir pantalla.
- **D+1:** email de seguimiento + propuesta piloto.
- **D+7:** llamada de cierre; si no, nurturing mensual.
