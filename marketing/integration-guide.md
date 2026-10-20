# Integrar el agente sin cambiar su web corporativa

Objetivo: mantener intacta su web actual y añadir la capa IA. Tres niveles según presupuesto y urgencia.

## Opción A — Subdominio + botón (1–2 días, riesgo cero)

- Nuestro proyecto se publica en `agente.dimilano.es` (o `ia.ferreproxim.es`).
- En su web solo se añade un botón o enlace:
  ```html
  <a href="https://agente.dimilano.es" target="_blank" rel="noopener">Hablar con la IA</a>
  ```
- No se toca su CMS, su hosting ni su diseño. Si algo falla, se elimina el enlace.

## Opción B — Widget embebido (2–4 días)

Un único script añade el agente como burbuja/modal dentro de su web:

```html
<script src="https://agente.dimilano.es/widget.js"
        data-agent-url="https://agente.dimilano.es"
        data-label="Hablar con la IA"
        data-color="#d6a94f"
        data-position="right"
        data-lang="es"></script>
```

- **WordPress:** pegar en el footer con un plugin tipo “Insert Headers and Footers”, o en `footer.php` del tema hijo.
- **HTML/PHP estático:** pegar antes de `</body>`.
- El agente se carga **solo al abrir** (iframe diferido): no penaliza la carga de la web.
- El widget oculta el botón flotante propio de la demo para no duplicar.

## Opción C — Integración profunda (1–3 semanas)

| Integración | Cómo |
|---|---|
| Inventario de inmuebles | Sincronización por XML/API desde `/nuestros_pisos` o CRM → Supabase |
| Catálogo WooCommerce | API REST de solo lectura (productos, precios, stock) |
| Formularios de contacto | Enviar a nuestro endpoint + CRM; o webhook a su email/CRM |
| Agendar visitas | Calendario (Google Calendar/Cal.com) + confirmación por WhatsApp/email |
| Carrito | Enlaces `?add-to-cart=SKU` o API de WooCommerce; nunca sustituir su checkout |
| Analítica | Eventos `demo_request`, `visit_booked`, `quote_requested` con UTMs |
| Seguridad | Allowlist de dominios en el widget, CSP, iframe sandbox, RGPD |

## Datos que necesitamos del cliente

1. Confirmación de que podemos alojar el subdominio (CNAME).
2. Acceso de lectura al inventario/catálogo (API, XML o export).
3. Número de WhatsApp Business y email de leads.
4. Logo y colores para el widget.
5. Autorización para publicar el script en su web (o que lo peguen ellos).

## Ventajas de este enfoque

- **No hay migración ni riesgo**: su web sigue igual; nosotros añadimos una capa.
- **Rápido de demostrar**: subdominio + widget en días.
- **Escalable**: cuando quieran, se conectan inventario, CRM y agenda sin rehacer nada.
- **Medible**: cada conversación y lead queda registrada con UTMs y eventos.

## Checklist de entrega

- [ ] Subdominio configurado con HTTPS
- [ ] Widget probado en escritorio y móvil
- [ ] Enlace/CTA en su web
- [ ] Formulario conectado al CRM
- [ ] Email de leads verificado
- [ ] Política de privacidad y aviso de cookies actualizado
- [ ] Eventos de analítica funcionando
