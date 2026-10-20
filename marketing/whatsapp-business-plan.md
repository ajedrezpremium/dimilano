# WhatsApp Business — plan de integración (DIMILANO)

## Estado actual (implementado)
- Botón flotante de WhatsApp en la web.
- CTA por inmueble: “WhatsApp” con mensaje que incluye título, precio y zona.
- Enlace “Continuar por WhatsApp” desde el chat, con el contexto de la última consulta.
- Número configurable en `assets/js/config.js` (`whatsapp`).

## Fase 2 — WhatsApp Cloud API (2–4 semanas)
1. **Meta Business + verificación** y número dedicado (puede ser el mismo con WhatsApp Business).
2. **Cloud API** (directa o vía BSP: 360dialog, Twilio, Wati…). Requiere `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`.
3. **Webhook** ya incluido en `api/whatsapp/webhook.js` (verificación + recepción; pendiente firma y envío).
4. **Plantillas aprobadas** por Meta:
   - `visita_confirmacion` · `recordatorio_visita_24h` · `recordatorio_visita_2h`
   - `tasacion_lista` · `inmuebles_recomendados` · `seguimiento_post_visita`
5. **Bandeja compartida** con handoff a humano y registro en CRM.

## Fase 3 — Proceso completo (1–2 meses)
- Agenda de visitas con huecos reales (calendario del equipo) y confirmación por WhatsApp.
- Recordatorios automáticos y reducción de no-shows.
- Tasación exprés enviada como PDF por WhatsApp.
- Seguimiento post-visita y nurturing (compras futuras, venta).
- Encuestas de satisfacción y solicitud de reseñas.
- Métricas: conversaciones, leads, visitas agendadas, no-shows, cierre.

## Requisitos y cumplimiento
- Opt-in explícito del usuario (“Acepto recibir mensajes por WhatsApp”).
- Enlace a la política de privacidad en la primera conversación.
- Ventana de 24 h para mensajes libres; fuera de ella, plantillas aprobadas.
- No usar listas compradas; riesgo de bloqueo.
- RGPD: base jurídica, conservación y derecho de supresión.

## Costes orientativos
- Cloud API: coste por conversación/plantilla según Meta y país (orientativo 0,03–0,10 €/mensaje; consultar tarifa vigente).
- BSP: cuota mensual + margen por mensaje (20–50 €/mes para empezar).
- Implementación: incluida en el piloto; automatizaciones avanzadas como proyecto aparte.

## KPIs del piloto
- Tiempo de primera respuesta < 2 min.
- Conversaciones → visita agendada ≥ 20 %.
- Reducción de no-shows ≥ 30 %.
- Leads cualificados/mes ≥ 10.
