/* Milano Vigo v1.0 — Motor del agente IA
   Roles: técnico · comercial · administrativo
   NLU por reglas + memoria conversacional + matching <5 s + tasación + reformas + CRM */
"use strict";
window.MV_AGENT = (function () {
  const D = () => window.MV_DATA;
  const S = () => window.MV_STORE;

  /* ---------- utilidades ---------- */
  const nor = s => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const eur = n => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
  const rnd = (a, b) => Math.round(a + Math.random() * (b - a));
  const MT = o => (o && typeof o === "object" && !Array.isArray(o)) ? (o[P.lang] || o.es) : o;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const ZONE_ALIASES = {
    "casco vello":"cascovello","casco viejo":"cascovello","berbes":"cascovello","el berbes":"cascovello",
    "bouzas":"bouzas","alcabre":"alcabre","samil":"samil","o castro":"ocastro","castro":"ocastro",
    "coia":"coia","teis":"teis","vite":"vite","nautico":"cascovello","old town":"cascovello","old quarter":"cascovello"
  };

  /* ---------- NLU: extracción de entidades ---------- */
  function parseZones(t) {
    const out = [];
    for (const [alias, id] of Object.entries(ZONE_ALIASES)) if (t.includes(alias)) out.push(id);
    return [...new Set(out)];
  }
  function parseRooms(t) {
    const m = t.match(/(\d{1,2})\s*(habitacion|dormitor|hab\b|hab\.|bedroom|bed\b)/);
    if (m) return clamp(parseInt(m[1], 10), 0, 8);
    if (/estudio|loft|studio/.test(t)) return 0;
    return null;
  }
  function parseM2(t) {
    const m = t.match(/(\d{2,3})\s*(m2|m²|metros)/);
    return m ? clamp(parseInt(m[1], 10), 20, 400) : null;
  }
  function parseMoney(t) {
    const words = /(?:presupuesto|hasta|menos de|maximo|por debajo de|no mas de|unos|sobre|entre|ata\b|under|less than|up to|\bmax\b)/;
    const m1 = t.match(/(\d{1,3})\s*(?:[.,](\d{1,3}))?\s*(?:k\b|k€|kilos?|mil)/);
    if (m1) { const a = +m1[1], b = m1[2] ? +m1[2] : (/(k\b|k€|kilos?)/.test(m1[0]) ? 0 : 0); return (a * 1000 + (m1[2] ? b : 0)); }
    const m2 = t.match(/(\d{1,3}(?:[.]\d{3})+)(?!\d)/);
    if (m2) return parseInt(m2[1].replace(/[.]/g, ""), 10);
    const m3 = t.match(/(\d{4,6})\s*(?:€|eurs|euros)?/);
    if (m3 && (words.test(t) || /[€]|euros|eur\b/.test(t) || +m3[1] >= 40000)) return parseInt(m3[1], 10);
    return null;
  }
  function parseYear(t) { const m = t.match(/\b(19[5-9]\d|20[0-2]\d)\b/); return m ? +m[1] : null; }
  function parsePhone(t) { const m = t.replace(/[\s.-]/g, "").match(/(?:\+34|34)?([6789]\d{8})/); return m ? "+34 " + m[1].replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3") : null; }
  function parseEmail(t) { const m = t.match(/[\w.+-]+@[\w-]+\.[\w.]{2,}/); return m ? m[0] : null; }
  function parseName(t, raw) {
    const m = raw.match(/(?:me llamo|mi nombre es|soy|my name is|i'?m|chamome|o meu nome e|son)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,20})/);
    return m ? m[1] : null;
  }
  function parseTimeline(t) {
    if (/inmediato|urgente|ya\b|este mes|este trimestre|me mudo|immediately|\basap\b|this month|urxente/.test(t)) return "0-3 meses";
    if (/3 a?6|medio ano|por verano|next summer|no veran/.test(t)) return "3-6 meses";
    if (/proximo ano|ano que viene|mas adelante|sin prisa|next year|no rush|o ano que ven|sen presa/.test(t)) return "6-12 meses";
    return null;
  }
  function parseCondition(t) {
    if (/(para reformar|a reformar|situacion para reformar|obra\b|reformar\b|to renovate|needs work)\b/.test(t) && /mi|vender|tasar|piso que tengo|my (flat|apartment|place)|\bsell\b|valuation/.test(t)) return "reformar";
    if (/reformad|nuevo|actualizado|rehabilitado|renovated|refurbished/.test(t)) return "reformado";
    if (/bien conservado|buen estado|cuidado|good condition|well kept|ben conservado|bo estado/.test(t)) return "bueno";
    return null;
  }
  function detectIntent(t) {
    if (/visita|agendar|enseñame|ensename|verlo|ver el piso|ver los pisos|cuando puedo ver|puedo ver|book|viewing|see the (flat|listing|propert)|amosa|ver o piso|ver os pisos|cando podo ver/.test(t)) return "visit";
    if (/llamar|llamada|telefono|whatsapp|correo|email|contacto|contactar|contactame|quien eres|oficina|direccion|\bcall\b|phone|contact|office|address|chamar|chamada|enderezo|quen es/.test(t)) return "contact";
    if (/cuanto vale|tasar|tasacion|valor de mi|pon mi|quiero vender|vender mi|soy propietario|\bsell\b|(worth|valuation)\b|value my|\bowner\b|canto vale|quero vender/.test(t)) return "sell";
    if (/gastos|impuesto|\bitp\b|notaria|registro|hipoteca|financiac|prestamo|cuanto cuesta comprar|\btaxes\b|notary|conveyancing|mortgage|financing|closing costs|imposto|rexistro|hipoteca|financiacion|custos de compra/.test(t)) return "costs";
    if (/reform|obra de reforma|renovar|cuanto cuesta reformar|renovat|refurbish|remodel/.test(t)) return "renov";
    if (/alquilar|alquiler|piso de alquiler|\brent\b|rental|alugar|alugueiro/.test(t)) return "rent";
    if (/que sabes de mi|recuerdas|que te he contado|tu memoria|remember|know about me|\bmemory\b|recordas|que sabes de min/.test(t)) return "memory";
    if (/mercado|precio medio|como esta el mercado|tendencia|analisis|comparativa|\bmarket\b|average price|\btrend\b|\banalysis\b|prezo medio|analise/.test(t)) return "market";
    if (/comprar|busco|quiero piso|quiero casa|apartamento|inver|chollo|oportunidad|\bbuy\b|looking for|want a (flat|house|apartment)|\bbargain\b|quero (piso|casa)/.test(t)) return "buy";
    if (/hola|buenas|buenos dias|buenas tardes|buenas noches|\bhello\b|\bhi\b|good (morning|afternoon|evening)|\bola\b|bos dias|boas (tardes|noites)/.test(t)) return "greet";
    return "other";
  }


  /* ---------- legal & económico ---------- */
  function detectLegalTopic(t) {
    if (/documentacion|documentos?|pdf|checklist|plantilla|modelo de contrato/.test(t)) return "documentacion";
    if (/impuesto|iva\b|irpf|itp\b|ajd\b|plusvalia|fiscal|hacienda|deduccion/.test(t)) return "fiscalidad";
    if (/fianza|alquiler|alquilar|arrendamiento|lau\b|inquilino|casero|renta mensual|garantia adicional/.test(t)) return "alquiler";
    if (/arras|notaria|notario|registro de la propiedad|escritura|nota simple|cargas|compraventa|comprar vivienda|vender vivienda/.test(t)) return "compraventa";
    if (/reforma|licencia|seguro decenal|loe\b|arquitecto|aparejador|habitabilidad|certificado energetico|contrato de obra/.test(t)) return "reforma";
    if (/garantia|aval|proveedor|seguro de responsabilidad|incumplimiento|penalizacion/.test(t)) return "garantias";
    if (/legal|abogado|juridico|asesoria|normativa|ley\b/.test(t)) return "general";
    return null;
  }
  function legalDocs(ids) {
    const L = window.MV_LEGAL;
    if (!L) return "";
    return (ids || []).map(id => (L.DOCS.find(d => d.id === id) || {}).title).filter(Boolean).join(" · ");
  }
  function legalAnswer(topic) {
    const L = window.MV_LEGAL;
    if (!L) return lp().legalNone;
    if (topic === "documentacion" || topic === "general") {
      return lp().legalHead + L.DOCS.map(d => "· " + d.title + " — " + d.desc).join("\n") + lp().legalCta + lp().legalWarn;
    }
    const T = L.TOPICS[topic];
    if (!T) return lp().legalNoTopic;
    const docs = legalDocs(T.docs);
    return T.icon + " " + T.title + "\n" + T.intro + "\n\n" + T.bullets.map(b => "• " + b).join("\n") + (docs ? lp().legalDocs(docs) + lp().legalWarn : "\n\n⚠️ " + lp().legalWarn);
  }
  function legalChips() {
    return lp().chipsLegal;
  }

  /* ---------- memoria ---------- */
  function blankProfile() {
    return { name:null, role:null, budget_max:null, rooms:null, zones:[], timeline:null, motive:null,
             phone:null, email:null, propZone:null, propM2:null, propRooms:null, propYear:null, propCond:null, propAsc:null,
             score:0, lang:"es", lead:S().blankLead() };
  }
  let P = blankProfile();
  let MODE = "general";

  function reScore() {
    let s = 0;
    if (P.role) s += 5;
    if (P.budget_max) s += 30;
    if (P.rooms !== null && P.role === "comprador") s += 20;
    if (P.zones.length) s += 25;
    if (P.role === "vendedor" && P.propM2 && P.propZone) s = Math.max(s, 65);
    if (P.timeline) s += 10;
    if (P.phone || P.email) s += 15;
    P.score = clamp(s, 0, 100);
    const L = P.lead;
    L.name = P.name || L.name; L.role = P.role; L.budget_max = P.budget_max; L.rooms = P.rooms;
    L.zones = P.zones; L.phone = P.phone; L.email = P.email; L.score = P.score;
    L.lang = P.lang;
    L.stage = L.visits.length ? 2 : (P.role === "vendedor" && P.propM2 && P.propZone ? 1 : (P.role ? 1 : 0));
    L.next_action = L.visits.length ? lp().nxtVisit(L.visits[0].slot)
      : P.phone ? lp().nxtCall
      : P.role === "vendedor" ? lp().nxtReport
      : lp().nxtMatch;
    S().saveLead(L);
    return P.score;
  }
  function scoreLabel(s) { return s >= 70 ? lp().scoreHot : s >= 45 ? lp().scoreWarm : lp().scoreCold; }

  /* ---------- matching (<5 s) ---------- */
  function match(q) {
    const t0 = performance.now();
    const list = D().PROPS.map(p => {
      let sc = 0; const why = [];
      if (q.budget_max && p.price <= q.budget_max) { sc += 35; why.push("≤ " + eur(q.budget_max)); }
      else if (q.budget_max && p.price > q.budget_max * 1.1) sc -= 30;
      if (q.rooms !== null && q.rooms !== undefined && p.rooms === q.rooms) { sc += 25; why.push(lp().whyHab(q.rooms)); }
      if (q.rooms === 0 && p.rooms === 0) { sc += 25; why.push(lp().whyStudy); }
      if (q.zones && q.zones.includes(p.zone)) { sc += 25; why.push(D().ZONES.find(z => z.id === p.zone).name); }
      if (q.condition && p.condition === q.condition) { sc += 10; why.push(lp().whyCond); }
      if (q.elevator !== null && q.elevator !== undefined && p.elevator === q.elevator) { sc += 5; if (q.elevator) why.push(lp().whyLift); }
      return { p, sc, why };
    });
    list.sort((a, b) => b.sc - a.sc);
    const ms = performance.now() - t0;
    return { results: list.slice(0, 3), ms: Math.round(ms) };
  }

  /* ---------- tasación ---------- */
  function valuate(zoneId, m2, rooms, year, cond, asc) {
    const z = D().ZONES.find(x => x.id === zoneId) || D().ZONES[0];
    const ageF = year < 1971 ? .90 : year < 1981 ? .93 : year < 1991 ? .97 : year < 2001 ? 1.00 : year < 2011 ? 1.04 : 1.08;
    const condF = cond === "reformar" ? .84 : cond === "reformado" ? 1.06 : 1.00;
    const ascF = asc ? 1.02 : .97;
    let price = z.priceM2 * m2 * ageF * condF * ascF;
    if (rooms && rooms >= 4) price *= 1.02;
    const mid = Math.round(price / 500) * 500;
    return {
      mid, low: Math.round(mid * .95 / 500) * 500, high: Math.round(mid * 1.05 / 500) * 500,
      rent: Math.round(m2 * z.rentM2 / 10) * 10, zone: z.name,
      baseM2: Math.round(mid / m2),
      reformNote: cond === "reformar" ? lp().reformNote(eur(D().RENOV.integral.m2eur[0] * m2), eur(D().RENOV.integral.m2eur[1] * m2)) : null,
      yieldPct: ((Math.round(m2 * z.rentM2 / 10) * 10) * 12 / Math.max(1, mid) * 100).toFixed(1).replace(".", ",")
    };
  }
  function reformCost(m2, level) {
    const R = D().RENOV, r = R[level] || R.integral;
    return { from: r.m2eur[0] * m2, to: r.m2eur[1] * m2, note: r.note };
  }

  /* ---------- agenda de visitas ---------- */
  function nextSlots() {
    const out = []; const d = new Date(); let i = 1;
    const times = [""];
    const hrs = ["11:00", "13:00", "17:30", "19:00"];
    while (out.length < 5) {
      const dd = new Date(d); dd.setDate(d.getDate() + i);
      if (dd.getDay() !== 0) {
        const h = hrs[(i - 1) % hrs.length];
        out.push(dd.toLocaleDateString(P.lang === "en" ? "en-GB" : "es-ES", { weekday: "long", day: "numeric", month: "short" }) + " · " + h);
      }
      i++;
    }
    return out;
  }

  /* ---------- idioma ---------- */
  const TT = {
    es:{ back:"Me tienes en la memoria: ", hello:"Soy Milano, el agente IA de Di Milano 🤵 24/7: técnico, comercial y administrativo.\nTrabajo con el mercado de Vigo y su ría. ¿Qué te trae por aquí?" },
    gl:{ back:"Lembrote: ", hello:"Son Milano, o axente IA de Di Milano 🤵 24/7: técnico, comercial e administrativo.\nTraballo co mercado de Vigo e a súa ría. Que te trae por aquí?" },
    en:{ back:"I remember you: ", hello:"I'm Milano, Di Milano's AI agent 🤵 24/7: technical, commercial and administrative.\nI work the Vigo market and its estuary. What brings you here?" }
  };
  const L = () => TT[P.lang] || TT.es;

  /* ---------- pack de plantillas por idioma ---------- */
  const LP = {
    es: {
      greetQ: "¿Qué buscas hoy — comprar, alquilar o vender?",
      memNone: "Aún no me has contado nada. Cuéntame qué buscas y lo iré recordando.",
      memName: n => "te llamas " + n, memRole: r => "tu rol: " + r, memBud: b => "presupuesto hasta " + eur(b),
      memHab: r => r + " hab", memZones: zs => "zonas: " + zs, memTl: tl => "plazo " + tl, memTel: p => "tel " + p,
      memSuf: ".\n(Todo esto está ya en tu ficha del CRM.)",
      sellName: "Perfecto, te ayudo a vender. Antes, ¿cómo te llamas?",
      sellAsk2: "Necesito dos datos: en qué zona está el piso y cuántos m² tiene.",
      sellAsk: miss => "Dame " + (miss[0] === "zona" ? "la zona" : "los m²") + " del piso.",
      sellHead: (n, z, m) => (n ? n + ", " : "") + "mi tasación exprés para tu piso en " + z + " (" + m + " m²):",
      sellBody: v => "· Valor orientativo: " + eur(v.low) + " – " + eur(v.high) + "\n· Punto medio: " + eur(v.mid) + " (" + eur(v.baseM2) + "/m²)\n· Alquiler estimado: " + eur(v.rent) + "/mes (renta " + v.yieldPct + " %)\n" + (v.reformNote ? "· " + v.reformNote + "\n" : "") + "\n⚠️ Estimación orientativa, no tasación pericial.",
      sellPdf: "¿Te preparo el informe completo en PDF? Pásame un móvil o email.",
      sellReady: c => "Informe listo para enviar a " + c + ". ¿Te llamo hoy para fijar estrategia de salida?",
      costsHead: "Costes de compraventa orientativos (Vigo, Galicia):\n· ",
      costsNot: "\n· Notaría: ", costsReg: "\n· Registro: ", costsGes: "\n· Gestoría: ", costsTas: "\n· Tasación (con hipoteca): ",
      costsEx: (a, b, c) => "\n\nEjemplo rápido: piso de " + a + " → ITP " + b + " + resto de gastos ≈ " + c + " + financiación.",
      costsWarn: "\n⚠️ Orientativo: la asesora lo fija en tu operación.",
      chipsCosts: ["Busco 2 hab en Bouzas", "¿Y si compro bajo y reformo?"],
      renovLbl: { lavado: "Lavado de cara", integral: "Reforma integral", premium: "Reforma premium" },
      renovHead: (lbl, m, f, t, p) => lbl + " estimada para " + m + " m²: " + f + " – " + t + " (" + p + "/m²).\n",
      studioW: "estudio", habsW: r => r + " hab", whyHab: r => r + " hab", whyStudy: "estudio", whyCond: "estado", whyLift: "con ascensor",
      renovTactic: "\n\nTáctica probada en Vigo: comprar bajo + reformar sube el valor final por encima del coste cuando compras bajo de media de zona.",
      chipsRenov: ["Estimar reforma de 75 m² premium", "Muéstrame pisos para reformar"],
      marketHead: (z, pm, tr, rent) => "Radar " + z + ": " + pm + "/m² de venta (" + tr + " interanual) · alquiler: " + rent + "/mes para un estándar de 60 m².\n",
      marketWarn: "\n⚠️ Estimaciones orientativas del agente.",
      chipsMarket: z => ["Comparemos 3 zonas", "Busco chollo en " + z],
      rentHead: (z, ty, r) => "Para alquilar: en " + z + " un " + ty + " ronda los " + r + "/mes.",
      rentQ: "\n¿Te preparo matches de compra y cuenta de rentabilidad, o buscas directo rental? En Vigo la renta vacacional es fuerte en Samil y Berbés.",
      chipsRent: ["Prefiero comprar", "Pisos de inversión en Casco Vello"],
      visitHead: (t2, z, p) => "Vamos con la visita de “" + t2 + "” (" + z + ", " + p + ").",
      visitAsk: "Dime qué piso quieres ver — podemos listar los que mejor te encajan primero.",
      buyRooms: "Anótalo: ¿cuántas habitaciones quieres? (estudio, 2 hab, 3 hab…)",
      buyStudio: (a, b) => "Los estudios en Vigo van de ~" + a + " a " + b + " según zona. ¿Hasta cuánto quieres llegar?",
      buyFormat: (a, b) => "En Vigo ese formato va desde " + a + " (Coia) hasta " + b + " (Bouzas) según zona y estado. ¿Hasta cuánto llega tu presupuesto?",
      buyMatched: (n, ms, b, r, zs) => (n ? n + ", " : "") + "emparejado en " + ms + " ms con tu perfil:" + (b ? " hasta " + b : "") + (r !== null ? " · " + r + " hab" : "") + (zs ? " · " + zs : ""),
      buyList: wp => wp + "\n\n¿Quieres visualizar alguna? Te agendo en el horario que elijas.",
      buyWa: p => "\nTe lo mando también por WhatsApp al " + p + ".",
      buyNone: "Ajusta el presupuesto o zona para encajar mejor. ¿Ampliamos el listón?",
      buyContact: "Para mandarte los matches y agenda con notificaciones: ¿un móvil o email?",
      chipsHello: ["Busco piso para comprar", "Quiero vender mi piso", "¿Cuánto valdría mi piso?", "Gastos de compraventa en Vigo", "¿Qué recuerdas de mí?"],
      chipsBuy: ["Busco piso para comprar", "Quiero vender mi piso"],
      fallback: "Puedo ayudarte con: compraventa, alquiler, tasación, reformas, gastos y financiación de Galicia, análisis por zona y visitas. ¿Por dónde empezamos? O si prefieres, elige:",
      chipsFall: ["Busco piso para comprar", "Quiero vender mi piso", "Gastos de compra en Vigo", "¿Qué recuerdas de mí?"],
      legalNone: "No tengo cargada la base legal en este momento.",
      legalNoTopic: "Puedo ayudarte con compraventa, alquiler, reforma, fiscalidad y garantías. ¿Sobre cuál quieres que profundice?",
      legalHead: "⚖️ Asesoría legal y económica de Di Milano\nPuedo orientarte sobre compraventa, alquiler, reforma, fiscalidad y garantías entre propietario, cliente y proveedor.\n\n📄 Documentación descargable:\n",
      legalCta: "\n\nDime tu caso (comprar, vender, alquilar o reformar) y te digo qué revisar, qué coste orientativo tiene y qué documento te conviene.\n\n⚠️ ",
      legalDocs: d => "\n\n📄 Documentos: " + d + " (descargables en la sección Legal).\n\n⚠️ ",
      legalWarn: "Contenido orientativo; no sustituye asesoramiento jurídico profesional.",
      chipsLegal: ["Impuestos de compraventa en Galicia", "Fianza y garantía del alquiler", "Licencias y garantías de reforma", "Ver documentación PDF"],
      nxtVisit: v => "Visita " + v, nxtCall: "Llamar / WhatsApp para cerrar cita", nxtReport: "Enviar informe de tasación por email", nxtMatch: "Enviar 3 matches + agenda de visitas",
      scoreHot: "HOT · lead caliente", scoreWarm: "WARM · tibio", scoreCold: "COLD · aún frío",
      reformNote: (a, b) => "Como está para reformar: suma obra tipo " + a + "–" + b + " al reponer.",
      contact: B => "Constructora: Rúa García Olloqui 8, 36201 Vigo · " + (B.telDisplay || "986 90 90 10") + " · WhatsApp " + (B.whatsappDisplay || "660 60 84 04") + " · " + (B.emailGeneral || "info@dimilano.es") + "\nInmobiliaria: Praza de Compostela 32, 36201 Vigo · " + (B.emailInmo || "inmobiliaria@dimilano.es") + "\nYo me encargo del resto: cualifícate aquí y mi equipo te llama."
    },
    gl: {
      greetQ: "Que buscas hoxe — comprar, alugar ou vender?",
      memNone: "Aínda non me contaches nada. Conto que buscas e vouo recordando.",
      memName: n => "chámache " + n, memRole: r => "o teu rol: " + r, memBud: b => "orzamento ata " + eur(b),
      memHab: r => r + " dormitorios", memZones: zs => "zonas: " + zs, memTl: tl => "prazo " + tl, memTel: p => "tel " + p,
      memSuf: ".\n(Todo isto xa está na túa ficha do CRM.)",
      sellName: "Perfecto, axúdoche a vender. Antes, como te chamas?",
      sellAsk2: "Necesito dous datos: en que zona está o piso e cantos m² ten.",
      sellAsk: miss => "Dame " + (miss[0] === "zona" ? "a zona" : "os m²") + " do piso.",
      sellHead: (n, z, m) => (n ? n + ", " : "") + "a miña tasación exprés para o teu piso en " + z + " (" + m + " m²):",
      sellBody: v => "· Valor orientativo: " + eur(v.low) + " – " + eur(v.high) + "\n· Punto medio: " + eur(v.mid) + " (" + eur(v.baseM2) + "/m²)\n· Alugueiro estimado: " + eur(v.rent) + "/mes (renda " + v.yieldPct + " %)\n" + (v.reformNote ? "· " + v.reformNote + "\n" : "") + "\n⚠️ Estimación orientativa, non tasación pericial.",
      sellPdf: "Queres que che prepare o informe completo en PDF? Pásame un móbil ou email.",
      sellReady: c => "Informe listo para enviar a " + c + ". Chámote hoxe para pechar a estratexia de saída?",
      costsHead: "Custos de compravenda orientativos (Vigo, Galicia):\n· ",
      costsNot: "\n· Notaría: ", costsReg: "\n· Rexistro: ", costsGes: "\n· Xestión: ", costsTas: "\n· Tasación (con hipoteca): ",
      costsEx: (a, b, c) => "\n\nExemplo rápido: piso de " + a + " → ITP " + b + " + resto de custos ≈ " + c + " + financiación.",
      costsWarn: "\n⚠️ Orientativo: a asesoría fíxao na túa operación.",
      chipsCosts: ["Busco 2 hab en Bouzas", "E se compro baixo e reformo?"],
      renovLbl: { lavado: "Lavado de cara", integral: "Reforma integral", premium: "Reforma premium" },
      renovHead: (lbl, m, f, t, p) => lbl + " estimada para " + m + " m²: " + f + " – " + t + " (" + p + "/m²).\n",
      studioW: "estudio", habsW: r => r + " hab", whyHab: r => r + " hab", whyStudy: "estudio", whyCond: "estado", whyLift: "con ascensor",
      renovTactic: "\n\nTáctica probada en Vigo: comprar baixo + reformar sube o valor final por riba do custo cando compras baixo a media da zona.",
      chipsRenov: ["Estimar reforma de 75 m² premium", "Ensíname pisos para reformar"],
      marketHead: (z, pm, tr, rent) => "Radar " + z + ": " + pm + "/m² de venda (" + tr + " interanual) · alugueiro: " + rent + "/mes para un estándar de 60 m².\n",
      marketWarn: "\n⚠️ Estimacións orientativas do axente.",
      chipsMarket: z => ["Comparemos 3 zonas", "Busco chollo en " + z],
      rentHead: (z, ty, r) => "Para alugar: en " + z + " un " + ty + " rolda os " + r + "/mes.",
      rentQ: "\nQueres que che prepare matches de compra e conta de rendibilidade, ou buscas alugueiro directo? En Vigo a renda vacacional é forte en Samil e Berbés.",
      chipsRent: ["Prefiro comprar", "Pisos de investimento no Casco Vello"],
      visitHead: (t2, z, p) => "Imos coa visita de “" + t2 + "” (" + z + ", " + p + ").",
      visitAsk: "Dime que piso queres ver — podemos listar os que mellor che encaixan primeiro.",
      buyRooms: "Anótao: cantas habitacións queres? (estudio, 2 hab, 3 hab…)",
      buyStudio: (a, b) => "Os estudios en Vigo van duns " + a + " a " + b + " segundo zona. Ata canto queres chegar?",
      buyFormat: (a, b) => "En Vigo ese formato vai dende " + a + " (Coia) ata " + b + " (Bouzas) segundo zona e estado. Ata canto chega o teu orzamento?",
      buyMatched: (n, ms, b, r, zs) => (n ? n + ", " : "") + "emparellado en " + ms + " ms co teu perfil:" + (b ? " ata " + b : "") + (r !== null ? " · " + r + " hab" : "") + (zs ? " · " + zs : ""),
      buyList: wp => wp + "\n\nQueres ver algum? Agéndoche no horario que elixas.",
      buyWa: p => "\nEnvióucheo tamén por WhatsApp ao " + p + ".",
      buyNone: "Axusta o orzamento ou a zona para encaixar mellor. Ampliamos o listón?",
      buyContact: "Para mandarche os matches e a axenda con notificacións: un móbil ou email?",
      chipsHello: ["Busco piso para comprar", "Quero vender o meu piso", "Canto valería o meu piso?", "Custos de compravenda en Vigo", "Que recordas de min?"],
      chipsBuy: ["Busco piso para comprar", "Quero vender o meu piso"],
      fallback: "Podo axudarte con: compravenda, alugueiro, tasación, reformas, custos e financiación de Galicia, análise por zona e visitas. Por onde comezamos? Ou, se prefires, escolle:",
      chipsFall: ["Busco piso para comprar", "Quero vender o meu piso", "Custos de compra en Vigo", "Que recordas de min?"],
      legalNone: "Non teño cargada a base legal neste momento.",
      legalNoTopic: "Podo axudarte con compravenda, alugueiro, reforma, fiscalidade e garantías. Sobre cal queres que aprofunde?",
      legalHead: "⚖️ Asesoría legal e económica de Di Milano\nPodo orientarte sobre compravenda, alugueiro, reforma, fiscalidade e garantías entre propietario, cliente e provedor.\n\n📄 Documentación descargable:\n",
      legalCta: "\n\nDime o teu caso (comprar, vender, alquilar ou reformar) e dígote que revisar, que custo orientativo ten e que documento che convén.\n\n⚠️ ",
      legalDocs: d => "\n\n📄 Documentos: " + d + " (descargables na sección Legal).\n\n⚠️ ",
      legalWarn: "Contido orientativo; non substitúe asesoramento xurídico profesional.",
      chipsLegal: ["Impostos de compravenda en Galicia", "Fianza e garantía do alugueiro", "Licenzas e garantías da reforma", "Ver documentación PDF"],
      nxtVisit: v => "Visita " + v, nxtCall: "Chamar / WhatsApp para pechar cita", nxtReport: "Enviar informe de tasación por email", nxtMatch: "Enviar 3 matches + axenda de visitas",
      scoreHot: "HOT · lead quente", scoreWarm: "WARM · morno", scoreCold: "COLD · aínda frío",
      reformNote: (a, b) => "Como está para reformar: suma obra tipo " + a + "–" + b + " ao repor.",
      contact: B => "Constructora: Rúa García Olloqui 8, 36201 Vigo · " + (B.telDisplay || "986 90 90 10") + " · WhatsApp " + (B.whatsappDisplay || "660 60 84 04") + " · " + (B.emailGeneral || "info@dimilano.es") + "\nInmobiliaria: Praza de Compostela 32, 36201 Vigo · " + (B.emailInmo || "inmobiliaria@dimilano.es") + "\nDo resto encárgome eu: cualifícate aquí e o meu equipo chámache."
    },
    en: {
      greetQ: "What brings you today — buying, renting or selling?",
      memNone: "You haven't told me anything yet. Tell me what you're after and I'll keep remembering it.",
      memName: n => "your name is " + n, memRole: r => "your role: " + r, memBud: b => "budget up to " + eur(b),
      memHab: r => r + " beds", memZones: zs => "zones: " + zs, memTl: tl => "timeline " + tl, memTel: p => "tel " + p,
      memSuf: ".\n(All of this is already in your CRM file.)",
      sellName: "Great, I'll help you sell. First — what's your name?",
      sellAsk2: "I need two things: which zone the flat is in and how many m² it has.",
      sellAsk: miss => "Give me the " + (miss[0] === "zona" ? "zone" : "m²") + " of the flat.",
      sellHead: (n, z, m) => (n ? n + ", " : "") + "here's my express valuation for your flat in " + z + " (" + m + " m²):",
      sellBody: v => "· Orientative value: " + eur(v.low) + " – " + eur(v.high) + "\n· Midpoint: " + eur(v.mid) + " (" + eur(v.baseM2) + "/m²)\n· Estimated rent: " + eur(v.rent) + "/month (yield " + v.yieldPct + " %)\n" + (v.reformNote ? "· " + v.reformNote + "\n" : "") + "\n⚠️ Orientative estimate, not a formal appraisal.",
      sellPdf: "Shall I prepare the full PDF report? Share a mobile number or email.",
      sellReady: c => "Report ready to send to " + c + ". Shall I call you today to set an exit strategy?",
      costsHead: "Orientative buying costs (Vigo, Galicia):\n· ",
      costsNot: "\n· Notary: ", costsReg: "\n· Registry: ", costsGes: "\n· Conveyancing: ", costsTas: "\n· Valuation (with mortgage): ",
      costsEx: (a, b, c) => "\n\nQuick example: a " + a + " flat → ITP " + b + " + remaining costs ≈ " + c + " + financing.",
      costsWarn: "\n⚠️ Orientative: our advisor confirms it for your deal.",
      chipsCosts: ["2-bed flat in Bouzas", "What if I buy low and renovate?"],
      renovLbl: { lavado: "Face-lift", integral: "Full renovation", premium: "Premium renovation" },
      renovHead: (lbl, m, f, t, p) => lbl + " for " + m + " m²: " + f + " – " + t + " (" + p + "/m²).\n",
      studioW: "studio", habsW: r => r + " bed", whyHab: r => r + " bed(s)", whyStudy: "studio", whyCond: "condition", whyLift: "with lift",
      renovTactic: "\n\nProven tactic in Vigo: buying low + renovating lifts the final value above the cost when you buy below the zone average.",
      chipsRenov: ["Estimate a 75 m² premium renovation", "Show me flats to renovate"],
      marketHead: (z, pm, tr, rent) => "Radar " + z + ": " + pm + "/m² sale price (" + tr + " year-on-year) · rent: " + rent + "/month for a standard 60 m² flat.\n",
      marketWarn: "\n⚠️ Orientative estimates by the agent.",
      chipsMarket: z => ["Let's compare 3 zones", "Looking for a bargain in " + z],
      rentHead: (z, ty, r) => "To rent: a " + ty + " in " + z + " runs about " + r + "/month.",
      rentQ: "\nShall I prepare purchase matches and a profitability check, or are you after a rental? In Vigo, short-term rentals are strong in Samil and Berbés.",
      chipsRent: ["I'd rather buy", "Investment flats in Casco Vello"],
      visitHead: (t2, z, p) => "Let's set up the viewing of “" + t2 + "” (" + z + ", " + p + ").",
      visitAsk: "Tell me which flat you'd like to see — I can list the best fits first.",
      buyRooms: "Noted: how many bedrooms do you want? (studio, 2 bed, 3 bed…)",
      buyStudio: (a, b) => "Studios in Vigo run from ~" + a + " to " + b + " depending on zone. What's your ceiling?",
      buyFormat: (a, b) => "In Vigo that format starts at " + a + " (Coia) up to " + b + " (Bouzas) depending on zone and condition. How high does your budget go?",
      buyMatched: (n, ms, b, r, zs) => (n ? n + ", " : "") + "matched in " + ms + " ms with your profile:" + (b ? " up to " + b : "") + (r !== null ? " · " + r + " bed" : "") + (zs ? " · " + zs : ""),
      buyList: wp => wp + "\n\nWant to view any of them? I'll book you in at your preferred time.",
      buyWa: p => "\nI'll also send it to you on WhatsApp at " + p + ".",
      buyNone: "Tweak the budget or zone for a better fit. Shall we stretch the range?",
      buyContact: "To send you matches and a schedule with notifications: a mobile number or email?",
      chipsHello: ["I'm looking for a flat to buy", "I want to sell my flat", "What's my flat worth?", "Buying costs in Vigo", "What do you remember about me?"],
      chipsBuy: ["I'm looking for a flat to buy", "I want to sell my flat"],
      fallback: "I can help with: buying/selling, rentals, valuation, renovations, Galician taxes and financing, zone analysis and viewings. Where shall we start? Or pick:",
      chipsFall: ["I'm looking for a flat to buy", "I want to sell my flat", "Buying costs in Vigo", "What do you remember about me?"],
      legalNone: "The legal knowledge base isn't loaded right now.",
      legalNoTopic: "I can help with conveyancing, rentals, renovation, taxation and guarantees. Which one shall we dig into?",
      legalHead: "⚖️ Di Milano legal & economic advisory\nI can guide you on conveyancing, rentals, renovation, taxation and guarantees between owner, client and supplier.\n\n📄 Downloadable documents:\n",
      legalCta: "\n\nTell me your case (buying, selling, renting or renovating) and I'll tell you what to check, the orientative cost and which document you need.\n\n⚠️ ",
      legalDocs: d => "\n\n📄 Documents: " + d + " (downloadable in the Legal section).\n\n⚠️ ",
      legalWarn: "Orientative content; it does not replace professional legal advice.",
      chipsLegal: ["Taxes on property sales in Galicia", "Deposit and rental guarantee", "Renovation licences and warranties", "View PDF documentation"],
      nxtVisit: v => "Viewing " + v, nxtCall: "Call / WhatsApp to close the appointment", nxtReport: "Send valuation report by email", nxtMatch: "Send 3 matches + viewing schedule",
      scoreHot: "HOT · hot lead", scoreWarm: "WARM · warm lead", scoreCold: "COLD · still cold",
      reformNote: (a, b) => "As it needs renovating: add works of about " + a + "–" + b + " to restore it.",
      contact: B => "Construction HQ: Rúa García Olloqui 8, 36201 Vigo · " + (B.telDisplay || "986 90 90 10") + " · WhatsApp " + (B.whatsappDisplay || "660 60 84 04") + " · " + (B.emailGeneral || "info@dimilano.es") + "\nReal-estate office: Praza de Compostela 32, 36201 Vigo · " + (B.emailInmo || "inmobiliaria@dimilano.es") + "\nI'll handle the rest: qualify yourself here and my team will call you."
    }

  };
  const lp = () => LP[P.lang] || LP.es;

  /* ---------- moteur principal: respond(text) ---------- */
  async function respond(raw) {
    const t = nor(raw);
    const replies = [], actions = [];
    const add = (text, meta) => replies.push({ text, meta });
    if (!P.lead) P.lead = S().blankLead();
    const first = !S().getConversation().length;

    /* extracción + memoria */
    const name = parseName(t, raw), phone = parsePhone(t), email = parseEmail(t);
    if (name) P.name = name;
    if (phone) P.phone = phone;
    if (email) P.email = email;
    const money = parseMoney(t), rooms = parseRooms(t), m2 = parseM2(t), year = parseYear(raw), tl = parseTimeline(t);
    const zs = parseZones(t), cond = parseCondition(t);
    const wantsElevator = /(con ascensor|with lift|with elevator|con ascensor)/.test(t) ? true : null;
    const intent = detectIntent(t);
    const legalTopic = detectLegalTopic(t);
    if ((MODE === "legal" || legalTopic) && !(intent === "renov" && /cuanto cuesta|estimar|coste de reforma/.test(t))) {
      if (legalTopic) add(legalAnswer(legalTopic));
      else add(legalAnswer("general"));
      add("", { chips: legalChips() });
      return finish(replies, actions, t);
    }

    if (/invierto|inversor|rentar|alquilar para|yield|cap rate|\binvestor\b|inverstidor/.test(t)) P.role = "inversor";
    if (intent === "rent" && P.role !== "vendedor") P.role = P.role || "inquilino";
    if (intent === "sell") P.role = "vendedor";
    if (intent === "buy" && P.role !== "vendedor") P.role = P.role || "comprador";
    if (money && intent !== "sell") P.budget_max = money;
    if (rooms !== null && intent !== "sell") P.rooms = rooms;
    if (zs.length && intent !== "sell") P.zones = [...new Set([...P.zones, ...zs])];
    if (tl) P.timeline = tl;
    if (cond && intent === "sell") P.propCond = cond;
    if (year && intent === "sell") P.propYear = year;
    if (zs.length && (intent === "sell")) P.propZone = zs[0];
    if (m2 && (intent === "sell")) P.propM2 = m2;
    if (rooms !== null && intent === "sell") P.propRooms = rooms;
    if (/(con ascensor|with lift|with elevator)/.test(t) && intent === "sell") P.propAsc = true;

    /* manandles a hola / memoria */
    if (first && intent === "other") {
      add(L().hello);
      add("", { chips: lp().chipsHello });
      return finish(replies, actions, t);
    }
    if (intent === "contact") {
      const B = window.MV_BRAND || {};
      add(lp().contact(B));
      actions.push({ type: "contact", tel: B.telRaw || "+34986909010", email: B.emailInmo || "inmobiliaria@dimilano.es", site: B.site || "https://www.dimilano.es/contacto" });
      add("", { chips: lp().chipsBuy });
      return finish(replies, actions, t);
    }
    if (intent === "greet" || (first && intent === "other")) {
      add(L().hello.split("\n").slice(-1)[0] + "\n" + lp().greetQ);
      return finish(replies, actions, t);
    }
    if (intent === "memory") {
      const kn = [];
      if (P.name) kn.push(lp().memName(P.name));
      if (P.role) kn.push(lp().memRole(P.role));
      if (P.budget_max) kn.push(lp().memBud(P.budget_max));
      if (P.rooms !== null) kn.push(lp().memHab(P.rooms));
      if (P.zones.length) kn.push(lp().memZones(P.zones.map(z => D().ZONES.find(x => x.id === z).name).join(", ")));
      if (P.timeline) kn.push(lp().memTl(P.timeline));
      if (P.phone) kn.push(lp().memTel(P.phone));
      if (!kn.length) add(lp().memNone);
      else add(L().back + kn.join(" · ") + lp().memSuf);
      return finish(replies, actions, t);
    }

    /* ------- VENDEDOR / TASACIÓN ------- */
    if (intent === "sell" || ((!P.role || P.role === "vendedor") && /tas/.test(t))) {
      const missing = [];
      if (!P.propZone) missing.push("zona");
      if (!P.propM2) missing.push("m²");
      if (missing.length) {
        if (!P.name && first) add(lp().sellName);
        add(missing.length === 2 ? lp().sellAsk2 : lp().sellAsk(missing));
      } else {
        const v = valuate(P.propZone, P.propM2, P.propRooms, P.propYear || 1985, P.propCond || "bueno", P.propAsc !== false);
        add(lp().sellHead(P.name, v.zone, P.propM2));
        add(lp().sellBody(v));
        if (!P.phone || !P.email) add(lp().sellPdf);
        else add(lp().sellReady(P.phone || P.email));
        P.lead.budget_max = v.mid;
      }
      return finish(replies, actions, t);
    }

    /* ------- COSTES ------- */
    if (intent === "costs") {
      const C = D().COSTS;
      add(lp().costsHead + MT(C.itp) + lp().costsNot + MT(C.notaria) + lp().costsReg + MT(C.registro) + lp().costsGes + MT(C.gestoria) + lp().costsTas + MT(C.tasacion) + "\n· " + MT(C.hipoteca) + lp().costsEx(eur(150000), eur(15000), eur(1700) + "–" + eur(2500)) + lp().costsWarn);
      add("", { chips: lp().chipsCosts });
      return finish(replies, actions, t);
    }

    /* ------- REFORMA ------- */
    if (intent === "renov") {
      const m = m2 || P.propM2 || 75;
      const lvl = /premium|cocina|banos|baños|climatiz/.test(t) ? "premium" : (m && P.propCond === "reformar" && P.propM2 ? "integral" : (m && P.propM2 ? "integral" : "integral"));
      const r = reformCost(m, lvl);
      add(lp().renovHead(lp().renovLbl[lvl] || lvl, m, eur(r.from), eur(r.to), eur(D().RENOV.integral.m2eur[0]) + "–" + eur(D().RENOV.integral.m2eur[1])) + MT(r.note) + lp().renovTactic);
      add("", { chips: lp().chipsRenov });
      const mm = match({ budget_max: P.budget_max, rooms: null, zones: [], condition: "reformar", elevator: null });
      actions.push({ type: "properties", ids: mm.results.map(x => x.p.id).filter(id => { const p = D().PROPS.find(q => q.id === id); return p.condition === "reformar"; }), ms: mm.ms, why: "pisos con tesis de reforma" });
      return finish(replies, actions, t);
    }

    /* ------- MERCADO ------- */
    if (intent === "market") {
      const zid = zs[0] || P.zones[0] || "bouzas";
      const z = D().ZONES.find(x => x.id === zid);
      add(lp().marketHead(z.name, eur(z.priceM2), z.trend, eur(Math.round(z.rentM2 * 60 / 10) * 10)) + MT(z.note) + lp().marketWarn);
      add("", { chips: lp().chipsMarket(z.name) });
      return finish(replies, actions, t);
    }

    /* ------- ALQUILER ------- */
    if (intent === "rent") {
      const zone = zs[0] || P.zones[0] || "cascovello";
      const z = D().ZONES.find(x => x.id === zone);
      const est = rooms !== null ? rooms : 1;
      add(lp().rentHead(z.name, est === 0 ? lp().studioW : lp().habsW(est), eur(Math.round(z.rentM2 * (est === 0 ? 45 : est * 35 + 5) / 10) * 10)) + lp().rentQ);
      add("", { chips: lp().chipsRent });
      return finish(replies, actions, t);
    }

    /* ------- VISITAS ------- */
    if (intent === "visit") {
      const named = D().PROPS.find(p => t.includes(nor(p.title).split(" ").filter(w => w.length > 5)[0] || "___"));
      const prop = named || (match({ budget_max: P.budget_max, rooms: P.rooms, zones: P.zones, elevator: null, condition: null }).results[0] || {}).p;
      if (prop) {
        add(lp().visitHead(prop.title, D().ZONES.find(z => z.id === prop.zone).name, eur(prop.price)));
        actions.push({ type: "scheduler", propId: prop.id });
      } else add(lp().visitAsk);
      return finish(replies, actions, t);
    }

    /* ------- COMPRA / MATCHING ------- */
    if (intent === "buy" || (P.role === "comprador" && intent === "other")) {
      if (!P.rooms && P.rooms !== 0) { add(lp().buyRooms); }
      else if (!P.budget_max) { add(P.rooms === 0 ? lp().buyStudio(eur(95000), eur(139000)) : lp().buyFormat(eur(D().ZONES.find(z => z.id === "coia").priceM2 * 100), eur(D().ZONES.find(z => z.id === "bouzas").priceM2 * 100))); }
      else {
        const mm = match({ budget_max: P.budget_max, rooms: P.rooms, zones: P.zones, elevator: wantsElevator, condition: null });
        add(lp().buyMatched(P.name, mm.ms, P.budget_max ? eur(P.budget_max) : null, P.rooms,
          P.zones.length ? P.zones.map(z => D().ZONES.find(x => x.id === z).name).join("/") : null));
        const top = mm.results[0];
        if (top) {
          const wp = mm.results.map(x => x.p.title + " (" + D().ZONES.find(z => z.id === x.p.zone).name + ", " + eur(x.p.price) + ", " + (x.p.roomLabel || x.p.rooms + " hab") + ")").join("\n");
          add(lp().buyList(wp) + (P.phone ? lp().buyWa(P.phone) : ""));
          actions.push({ type: "properties", ids: mm.results.map(x => x.p.id), ms: mm.ms, why: mm.results.map(x => x.why.join(" · ")).join(" | ") });
        } else {
          add(lp().buyNone);
        }
      }
      if (P.score >= 60 && !P.phone && !P.email) add(lp().buyContact);
      return finish(replies, actions, t);
    }

    /* ------- fallback ------- */
    add(lp().fallback);
    add("", { chips: lp().chipsFall });
    return finish(replies, actions, t);
  }

  async function finish(replies, actions, t) {
    const score = reScore();
    S().saveProfile(P);
    return { replies, actions, score, scoreLabel: scoreLabel(score), profile: { ...P }, lang: P.lang };
  }

  async function init() {
    P = (await S().getProfile()) || blankProfile();
    if (!P.lead) P.lead = S().blankLead();
    return P;
  }
  function reset() { S().resetConversation(); P = blankProfile(); MODE = "general"; return P; }
  const profile = () => ({ ...P });
  const lang = l => { P.lang = l; S().saveProfile(P); };

  function setMode(m) { MODE = m === "legal" ? "legal" : "general"; return MODE; }
  function getMode() { return MODE; }
  return { init, respond, reset, profile, match, valuate, reformCost, nextSlots, reScore, scoreLabel, setLang: lang, setMode, getMode, legalTopic: detectLegalTopic };
})();
