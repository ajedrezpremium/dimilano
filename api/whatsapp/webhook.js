/**
 * WhatsApp Cloud API — webhook (scaffold)
 * Verificación: GET ?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...
 * Recepción: POST con eventos de Meta.
 *
 * Requiere en Vercel:
 *  - WHATSAPP_VERIFY_TOKEN
 *  - WHATSAPP_TOKEN (para responder)
 *  - WHATSAPP_PHONE_NUMBER_ID
 *  - MV_SUPABASE_URL / SUPABASE_SERVICE_ROLE (para guardar leads)
 *
 * TODO producción:
 *  - Validar firma X-Hub-Signature-256 con APP_SECRET.
 *  - Enviar mensajes con la Graph API.
 *  - Integrar con el agente IA y el CRM (commercial_leads / mv_leads).
 */
export default async function handler(req, res) {
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' && token && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      res.setHeader('Content-Type', 'text/plain');
      return res.status(200).send(challenge);
    }
    return res.status(403).end();
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const value = body?.entry?.[0]?.changes?.[0]?.value;
      const msg = value?.messages?.[0];
      if (msg) {
        const from = msg.from;
        const text = msg.text?.body || msg.button?.text || msg.interactive?.button_reply?.title || '';
        console.log('[whatsapp] inbound', { from, type: msg.type, text });
        // TODO: guardar en Supabase (mv_leads / mv_messages) y responder con el agente.
      }
      return res.status(200).json({ received: true });
    } catch (err) {
      console.error('[whatsapp] error', err);
      return res.status(200).json({ received: true });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).end();
}
