/* Di Milano — /api/chat (Vercel serverless)
   Proxy OpenRouter (modelos free) con megaprompt del agente.
   Claves SOLO por env vars: OPENROUTER_API_KEY. */
const MODELS = [
  { id: "minimax/minimax-m3.1-flash:free",   max: 700 },
  { id: "google/gemma-4-26b-a4b-it:free",    max: 700 },
  { id: "xingchen-agi/xing4.0-29b-a4b:free", max: 700 }
];

// Heurísticas para descartar razonamiento interno que se cuela
const NOISE = /^(Need |Could |Let's |Let’s |We need |Better maybe|Di Milano site|One question only|Need perhaps|Orientation:|Maybe |But |Yet |Wait|Hmm|So |Then |If |Also |The response|Current language|First:|Second:|OK\.|Okay|<[^>]*>|"reply")/i;

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const KEY = process.env.OPENROUTER_API_KEY;
  if (!KEY) return res.status(503).json({ error: "LLM no configurado: falta OPENROUTER_API_KEY" });

  let body = {};
  try { body = typeof req.body === "object" ? req.body : JSON.parse(req.body || "{}"); } catch (e) { body = {}; }
  const lang = ["es", "gl", "en"].includes(body.lang || "es") ? body.lang : "es";
  const pro = body.profile || {};
  const message = String(body.message || "").slice(0, 1200);
  const history = (Array.isArray(body.history) ? body.history : [])
    .filter(m => m && typeof m.text === "string").slice(-8)
    .map(m => ({ role: m.role === "bot" ? "assistant" : "user", content: String(m.text).slice(0, 800) }));

  if (!message) return res.status(400).json({ error: "message requerido" });

  const SYSTEM = `Eres MILANO, agente IA 24/7 de Di Milano (constructora + inmobiliaria, dimilano.es, Vigo, Galicia). Tres cerebros: técnico, comercial y administrativo.

# FORMATO DE SALIDA (obligatorio)
Responde ÚNICAMENTE con JSON válido en una línea, sin markdown ni backticks:
{"reply":"<tu mensaje al usuario>"}
Nada más. Sin razonamiento visible, sin análisis previo, sin alternativas.

# ESTILO
Directo, cercano, máximo 120 palabras (tasación/análisis pueden llegar a 180). Nunca inventes cifras exactas: rangos + aviso "orientativo, no tasación pericial". Una sola pregunta por turno. ${lang === "gl" ? "IDIOMA OBLIGATORIO: GALLEGO." : lang === "en" ? "LANGUAGE REQUIRED: ENGLISH." : "IDIOMA OBLIGATORIO: ESPAÑOL."}

# CONTEXTO VIGO 2026 (orientativo €/m² venta)
Bouzas 2.750 · Samil 2.600 · Alcabre 2.400 · Casco Vello 2.350 · Vite 2.250 · O Castro 2.100 · Teis 1.850 · Coia 1.600. Alquiler 8,5–12,5 €/m²/mes; 1 hab desde ~600 €.

# GASTOS GALICIA
ITP ~10 % (Pontevedra) · notaría 0,4–0,7 % · registro 0,2–0,3 % · gestoría 300–500 € · tasación 300–450 € · hipoteca: entrada 20 %.

# REFORMAS
Integral 700–950 €/m² · premium 950–1.400 €/m² · cocina 9–14 k€ · baño 4,5–7 k€ · suelo 30–45 €/m².

# TASACIÓN EXPRÉS
(€/m² zona) × m² × edad (pre-1971:0,90 · 70s:0,93 · 80s:0,97 · 90s-2000:1,00 · 2001-2010:1,04 · post-2010:1,08) × estado (reformar:0,84 · bueno:1,00 · reformado:1,06) × ascensor (1,02/0,97), rango ±5 %.

# COMERCIAL
Cualifica SIEMPRE: rol (comprador/vendedor/inquilino/inversor), presupuesto, habitaciones, zonas, plazo, nombre; móvil/email cuando esté caliente. Con presupuesto+habitaciones+zonas: 3 matches + ofrece agendar visita. Vendedor: pide zona+m²+hab+año+estado y da tasación exprés. Técnico (gastos, financiación, mercado, reformas): usa las parrillas de arriba.

# CONTACTO OFICIAL
Constructora Rúa García Olloqui 8, 36201 Vigo (986 90 90 10 · WhatsApp 660 60 84 04 · info@dimilano.es) · Inmobiliaria Praza de Compostela 32 (inmobiliaria@dimilano.es).`;

  const perfil = [
    pro.role ? "rol: " + pro.role : null,
    pro.budget_max ? "presupuesto: ≤ " + pro.budget_max + " EUR" : null,
    pro.rooms !== undefined && pro.rooms !== null ? pro.rooms + " hab (0 estudio)" : null,
    Array.isArray(pro.zones) && pro.zones.length ? "zonas: " + pro.zones.join(", ") : null,
    pro.phone ? "tel: " + pro.phone : null,
    pro.name ? "nombre: " + pro.name : null
  ].filter(Boolean).join(" · ");

  const messages = [
    { role: "system", content: SYSTEM },
    ...(perfil ? [{ role: "system", content: "Perfil registrado del visitante (memoria): " + perfil }] : []),
    ...history,
    { role: "user", content: message }
  ];

  for (const { id: model, max } of MODELS) {
    try {
      const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: "Bearer " + KEY, "Content-Type": "application/json", "HTTP-Referer": "https://www.dimilano.es", "X-Title": "Di Milano Agent IA" },
        body: JSON.stringify({ model, messages, max_tokens: max, temperature: 0.3 })
      });
      if (!r.ok) continue;
      const j = await r.json();
      const msg = j.choices?.[0]?.message || {};
      const raw = String(msg.content || msg.reasoning || "");
      // 1) intenta parsear el JSON {"reply": "..."} (directo o embebido)
      const mJson = raw.match(/\{[\s\S]*?"reply"[\s\S]*?\}/);
      let text = "";
      if (mJson) {
        try { text = JSON.parse(mJson[0]).reply || ""; } catch (e) {
          text = mJson[0].replace(/[\s\S]*"reply"\s*:\s*"/, "").replace(/"\s*\}\s*$/, "");
        }
      } else {
        const mCut = raw.match(/"reply"\s*:\s*"([\s\S]*)/);
        if (mCut) text = mCut[1].replace(/"\s*\}[\s\S]*$/, "");
      }
      // 2) si no hay JSON válido, usa content si no parece razonamiento
      if (!text && msg.content && !NOISE.test(msg.content.trim())) text = msg.content.trim();
      if (text && text.length > 8 && !NOISE.test(text.trim())) {
        return res.status(200).json({ text: text.slice(0, 2200), model });
      }
    } catch (e) { /* siguiente modelo */ }
  }
  return res.status(200).json({ text: "", fallback: true });
}
