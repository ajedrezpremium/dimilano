import fs from "fs";
import { legalReply } from "./legal-kb.js";

const LEGAL_BASE = `
BASE LEGAL Y ECONÓMICA (España/Galicia, 2026; información general, no dictamen):
· Compra usada: ITP general 8 % en Galicia; vivienda habitual con requisitos: 7 % (no aplicar 8 % a la habitual). Obra nueva: IVA 10 % + AJD 1,5 %; notaría 0,4–0,7 %, registro 0,2–0,3 %, gestoría 300–500 €; el vendedor paga plusvalía municipal e IRPF; no residente: retención 3 %.
· Alquiler de vivienda habitual: LAU 29/1994 y Ley 12/2023; fianza 1 mensualidad; garantía adicional máxima 2 mensualidades; duración 5 años (7 si el arrendador es sociedad); actualización según índice pactado; el propietario declara IRPF.
· Reforma: LOE 38/1999 (10 años estructura, 3 estanqueidad, 1 acabados); licencia o declaración responsable; seguro de responsabilidad civil; IVA 10 % en renovación de vivienda que cumpla requisitos y 21 % en el resto; honorarios técnicos orientativos 8–12 %.
· Documentos habituales: nota simple, escritura, IBI, certificados de comunidad, certificado energético, habitabilidad, arras, presupuesto de obra, contrato de obra y hoja de encargo.
· LÍMITES: no eres abogado ni asesor fiscal; no des dictamen personalizado ni redactes contratos a medida; recomienda abogado/asesor colegiado para el caso concreto; las cifras son orientativas y pueden variar; no prometas resultados.
· Di Milano actúa como intermediario independiente: equilibra los intereses de propietario, comprador/inquilino y proveedores, declara honorarios y posibles conflictos.
`;

const LEGAL_MODE = `
MODO LEGAL Y ECONÓMICO ACTIVO: responde en texto plano, sin Markdown, sin encabezados y sin negritas. Usa 4 bloques muy breves: 1) Clave legal; 2) Qué comprobar o hacer; 3) Coste/impuesto orientativo; 4) Documento o siguiente paso. Máximo 180 palabras. Si faltan datos, haz una sola pregunta. Cita la norma cuando aplique. No des asesoramiento jurídico individual: deriva a profesional colegiado y a los modelos PDF orientativos.
`;

const MODELS = [
  { id: "minimax/minimax-m3.1-flash:free",        max: 500 },
  { id: "google/gemma-4-31b-it:free",             max: 600 },
  { id: "nvidia/nemotron-3-super-120b-a12b:free", max: 600 },
  { id: "openrouter/free",                        max: 500 },
  { id: "google/gemma-4-26b-a4b-it:free",         max: 600 },
  { id: "xingchen-agi/xing4.0-29b-a4b:free",      max: 500 }
];

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const KEY = process.env.OPENROUTER_API_KEY;
  if (!KEY) return res.status(503).json({ error: "LLM no configurado: falta OPENROUTER_API_KEY" });

  let body = {};
  try { body = typeof req.body === "object" ? req.body : JSON.parse(req.body || "{}"); } catch (e) { body = {}; }
  const lang = "es gl en".includes((body.lang || "es")) ? body.lang : "es";
  const mode = body.mode === "legal" ? "legal" : "general";
  const pro = body.profile || {};
  const message = String(body.message || "").slice(0, 1200);
  const history = (Array.isArray(body.history) ? body.history : [])
    .filter(m => m && typeof m.text === "string").slice(-8)
    .map(m => ({ role: m.role === "bot" ? "assistant" : "user", content: String(m.text).slice(0, 800) }));

  if (!message) return res.status(400).json({ error: "message requerido" });
  if (mode === "legal") return res.status(200).json({ text: legalReply(message), model: "legal-kb" });

  const SYSTEM = `Actúas como MILANO, el agente IA 24/7 de Di Milano (constructora + inmobiliaria, dimilano.es, Vigo, Galicia, España). Tres cerebros: técnico, comercial y administrativo.
ESTILO: directo, cercano, sin paja. Responde SIEMPRE en el idioma indicado al final del prompt (español, gallego o inglés) y SIEMPRE en ese idioma exclusivamente. Máximo 120 palabras por respuesta salvo tasación/análisis. Nunca inventes cifras exactas: da rangos y avisa que son orientativas, no tasación pericial. No pienses en voz alta ni muestres razonamiento: da solo la respuesta final al usuario.

CONTEXTO VIGO 2026 (estimaciones orientativas €/m² venta): Bouzas 2.750 · Samil 2.600 · Alcabre 2.400 · Casco Vello 2.350 · Vite 2.250 · O Castro 2.100 · Teis 1.850 · Coia 1.600. Alquiler 8,5–12,5 €/m²/mes; 1 hab desde ~600 €.
GASTOS GALICIA: ITP ~10 % (Pontevedra), notaría 0,4–0,7 %, registro 0,2–0,3 %, gestoría 300–500 €, tasación 300–450 €. Hipoteca: entrada 20 %.
REFORMAS: integral 700–950 €/m²; premium 950–1.400 €/m²; cocina 9–14 k€; baño 4,5–7 k€.
TASACIÓN EXPRÉS si piden valorar: (€/m² zona) × m² × factor edad (pre-1971:0,90 · 70s:0,93 · 80s:0,97 · 90s-2000:1,00 · 2001-2010:1,04 · post-2010:1,08) × estado (reformar:0,84 · reformado:1,06; buen estado:1,00) × ascensor (1,02 / 0,97), rango ±5 %.
COMPORTAMIENTO COMERCIAL: cualifica SIEMPRE (rol comprador/vendedor/inquilino/inversor, presupuesto, habitaciones, zonas, plazo, cómo se llama; pide móvil o email si ya está caliente) con una pregunta corta por turno. Con presupuesto+habitaciones+zonas, da 3 matches del inventario real y ofrece agendar visita. Si venden: pide zona+m²+hab+año+estado y da tasación exprés. Gastos/financiación/mercado/reformas: responde técnico con las parrillas de arriba.
CONTACTO OFICIAL: Constructora Rúa García Olloqui 8 (986 90 90 10 · info@dimilano.es) · Inmobiliaria Praza de Compostela 32 (inmobiliaria@dimilano.es). Si te piden llamada o cita urgente: pasa el contacto de la oficina y sigue cualificando.
${LEGAL_BASE}\n${mode === "legal" ? LEGAL_MODE : ""}\nIMPORTANTE: responde SOLO con el mensaje final, sin razonamiento, sin "Need perhaps", sin listas internas. ${lang === "gl" ? "IDIOMA: GALLEGO." : lang === "en" ? "IDIOMA: INGLÉS." : "IDIOMA: ESPAÑOL."}`;

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
        body: JSON.stringify({ model, messages, max_tokens: max, temperature: 0.3, reasoning: { exclude: true } })
      });
      if (!r.ok) {
        // skip
      } else {
        const j = await r.json();
        const msg = j.choices?.[0]?.message || {};
        let text = msg.content || "";
        if (!text && msg.reasoning) {
          const cand = String(msg.reasoning).replace(/\s+/g, " ").trim();
          const sentences = cand.split(/(?<=[.?!])\s+/).filter(s => s.length > 20);
          text = sentences[sentences.length - 1] || cand.slice(-400);
        }
        let clean = String(text || "").trim();
        clean = clean.replace(/^#{1,6}\s*/gm, "").replace(/\*\*(.*?)\*\*/g, "$1").replace(/`([^`]+)`/g, "$1").trim();
        const junk = /^(User Safety|Safety:|Moderation|I can't|I cannot|As an AI|I'm unable)/i.test(clean);
        const legalOk = mode !== "legal" || /(ITP|IVA|AJD|IRPF|fianza|arras|notar|registro|garant|licencia|contrato|impuesto|plusval|LOE|LAU|comprador|vendedor|propietario|inquilino|seguro|document|tax|contract|deposit|rent|guarantee|insurance|notary|registry|buyer|seller|landlord|tenant)/i.test(clean);
        if (clean && clean.length > (mode === "legal" ? 60 : 20) && !junk && legalOk && !/^(Need |Could |Let's |We need |Better maybe|Di Milano site|One question only|Need perhaps|Orientation:|Maybe |But user|User asks|The user|We should|Answer:|Respond |First,|I should)/i.test(clean)) {
          return res.status(200).json({ text: clean.slice(0, 2200), model });
        }
      }
    } catch (e) {
      // siguiente modelo
    }
  }
  return res.status(200).json({ text: "", fallback: true });
}
