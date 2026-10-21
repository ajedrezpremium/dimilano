# WhatsApp Business — plan de integración (DIMILANO)

## Datos confirmados (21/10/2026)

- **Número WhatsApp Business:** +34 660 60 84 04. En enlaces `wa.me`: `34660608404`. En la API: formato E.164 `+34660608404`.
- **Email administrador de Meta:** diana@dimilano.es. Debe ser un buzón real y accesible; recomendable que sea alias corporativo (`whatsapp@dimilano.es`) para no depender de una persona.
- **Fijo de oficina:** 986 90 90 10. No es el número de la API; se mantiene como contacto general.
- **Requisito crítico:** el número de la API no puede estar activo a la vez en WhatsApp personal o WhatsApp Business app. Si ya tiene WhatsApp, hay que migrarlo o liberarlo antes de conectarlo a Cloud API.

## Checklist de alta en Meta

- [ ] Portfolio de Meta Business creado y verificado (nombre legal, CIF, dirección, web y dominio).
- [ ] Cuenta de WhatsApp Business (WABA) creada.
- [ ] App de Meta con producto WhatsApp; usuario del sistema y token permanente.
- [ ] Número +34 660 60 84 04 verificado por SMS/llamada y dado de alta en la WABA.
- [ ] Nombre visible aprobado: “Di Milano” o “Di Milano Vigo”.
- [ ] Webhook: `https://dimilano-vigo.vercel.app/api/whatsapp/webhook`.
- [ ] Variables en Vercel: `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_BUSINESS_ACCOUNT_ID`, `WHATSAPP_VERIFY_TOKEN`, `META_APP_SECRET`.
- [ ] Firma `X-Hub-Signature-256` validada en el webhook.
- [ ] Método de pago de Meta configurado (la API no es gratuita como WhatsApp personal).
- [ ] Política de privacidad, opt-in y base jurídica publicados.
- [ ] Plantillas aprobadas: confirmación de visita, recordatorio 24 h, recordatorio 2 h, tasación lista y seguimiento post-visita.
- [ ] Prueba de extremo a extremo: mensaje entrante → agente → respuesta → registro en CRM.

## Plazos y costes

- Alta y verificación: 3–7 días laborables si la documentación está lista.
- Aprobación de plantillas: 24–48 h.
- Coste: por conversación/plantilla según tarifa de Meta para España; un BSP puede añadir cuota mensual. No es el WhatsApp Business gratuito.

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
