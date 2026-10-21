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
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const ZONE_ALIASES = {
    "casco vello":"cascovello","casco viejo":"cascovello","berbes":"cascovello","el berbes":"cascovello",
    "bouzas":"bouzas","alcabre":"alcabre","samil":"samil","o castro":"ocastro","castro":"ocastro",
    "coia":"coia","teis":"teis","vite":"vite","nautico":"cascovello"
  };

  /* ---------- NLU: extracción de entidades ---------- */
  function parseZones(t) {
    const out = [];
    for (const [alias, id] of Object.entries(ZONE_ALIASES)) if (t.includes(alias)) out.push(id);
    return [...new Set(out)];
  }
  function parseRooms(t) {
    const m = t.match(/(\d{1,2})\s*(habitacion|dormitor|hab\b|hab\.)/);
    if (m) return clamp(parseInt(m[1], 10), 0, 8);
    if (/estudio|loft/.test(t)) return 0;
    return null;
  }
  function parseM2(t) {
    const m = t.match(/(\d{2,3})\s*(m2|m²|metros)/);
    return m ? clamp(parseInt(m[1], 10), 20, 400) : null;
  }
  function parseMoney(t) {
    const words = /(?:presupuesto|hasta|menos de|maximo|por debajo de|no mas de|unos|sobre|entre)/;
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
    const m = raw.match(/(?:me llamo|mi nombre es|soy)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,20})/);
    return m ? m[1] : null;
  }
  function parseTimeline(t) {
    if (/inmediato|urgente|ya\b|este mes|este trimestre|me mudo/.test(t)) return "0-3 meses";
    if (/3 a?6|medio ano|por verano/.test(t)) return "3-6 meses";
    if (/proximo ano|ano que viene|mas adelante|sin prisa/.test(t)) return "6-12 meses";
    return null;
  }
  function parseCondition(t) {
    if (/para reformar|a reformar|situacion para reformar|obra\b|reformar\b/.test(t) && /mi|vender|tasar|piso que tengo/.test(t)) return "reformar";
    if (/reformado|nuevo|actualizado|rehabilitado/.test(t)) return "reformado";
    if (/bien conservado|buen estado|cuidado/.test(t)) return "bueno";
    return null;
  }
  function detectIntent(t) {
    if (/visita|agendar|enseñame|ensename|verlo|ver el piso|ver los pisos|cuando puedo ver|puedo ver/.test(t)) return "visit";
    if (/llamar|llamada|telefono|whatsapp|correo|email|contacto|contactar|contactame|quien eres|oficina|direccion/.test(t)) return "contact";
    if (/cuanto vale|cuanto vale mi|tasar|tasacion|valor de mi|pon mi|quiero vender|vender mi|soy propietario/.test(t)) return "sell";
    if (/gastos|impuesto|itp|notaria|registro|hipoteca|financiac|prestamo|cuanto cuesta comprar/.test(t)) return "costs";
    if (/reform|obra de reforma|renovar|cuanto cuesta reformar/.test(t)) return "renov";
    if (/alquilar|alquiler|piso de alquiler/.test(t)) return "rent";
    if (/que sabes de mi|recuerdas|que te he contado|tu memoria/.test(t)) return "memory";
    if (/mercado|precio medio|como esta el mercado|tendencia|analisis|comparativa/.test(t)) return "market";
    if (/comprar|busco|quiero piso|quiero casa|apartamento|inver|chollo|oportunidad/.test(t)) return "buy";
    if (/hola|buenas|buenos dias|buenas tardes|buenas noches/.test(t)) return "greet";
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
    if (!L) return "No tengo cargada la base legal en este momento.";
    if (topic === "documentacion" || topic === "general") {
      return "⚖️ Asesoría legal y económica de Di Milano\nPuedo orientarte sobre compraventa, alquiler, reforma, fiscalidad y garantías entre propietario, cliente y proveedor.\n\n📄 Documentación descargable:\n" + L.DOCS.map(d => "· " + d.title + " — " + d.desc).join("\n") + "\n\nDime tu caso (comprar, vender, alquilar o reformar) y te digo qué revisar, qué coste orientativo tiene y qué documento te conviene.\n\n⚠️ " + L.DISCLAIMER;
    }
    const T = L.TOPICS[topic];
    if (!T) return "Puedo ayudarte con compraventa, alquiler, reforma, fiscalidad y garantías. ¿Sobre cuál quieres que profundice?";
    const docs = legalDocs(T.docs);
    return T.icon + " " + T.title + "\n" + T.intro + "\n\n" + T.bullets.map(b => "• " + b).join("\n") + (docs ? "\n\n📄 Documentos: " + docs + " (descargables en la sección Legal)." : "") + "\n\n⚠️ " + L.DISCLAIMER;
  }
  function legalChips() {
    return ["Impuestos de compraventa en Galicia", "Fianza y garantía del alquiler", "Licencias y garantías de reforma", "Ver documentación PDF"];
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
    L.next_action = L.visits.length ? "Visita " + L.visits[0].slot
      : P.phone ? "Llamar / WhatsApp para cerrar cita"
      : P.role === "vendedor" ? "Enviar informe de tasación por email"
      : "Enviar 3 matches + agenda de visitas";
    S().saveLead(L);
    return P.score;
  }
  function scoreLabel(s) { return s >= 70 ? "HOT · lead caliente" : s >= 45 ? "WARM · tibio" : "COLD · aún frío"; }

  /* ---------- matching (<5 s) ---------- */
  function match(q) {
    const t0 = performance.now();
    const list = D().PROPS.map(p => {
      let sc = 0; const why = [];
      if (q.budget_max && p.price <= q.budget_max) { sc += 35; why.push("≤ " + eur(q.budget_max)); }
      else if (q.budget_max && p.price > q.budget_max * 1.1) sc -= 30;
      if (q.rooms !== null && q.rooms !== undefined && p.rooms === q.rooms) { sc += 25; why.push(q.rooms + " hab"); }
      if (q.rooms === 0 && p.rooms === 0) { sc += 25; why.push("estudio"); }
      if (q.zones && q.zones.includes(p.zone)) { sc += 25; why.push(D().ZONES.find(z => z.id === p.zone).name); }
      if (q.condition && p.condition === q.condition) { sc += 10; why.push("estado"); }
      if (q.elevator !== null && q.elevator !== undefined && p.elevator === q.elevator) { sc += 5; if (q.elevator) why.push("con ascensor"); }
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
      reformNote: cond === "reformar" ? "Como está para reformar: suma obra tipo " + eur(D().RENOV.integral.m2eur[0] * m2) + "–" + eur(D().RENOV.integral.m2eur[1] * m2) + " al reponer." : null,
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
        out.push(dd.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "short" }) + " · " + h);
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
    const wantsElevator = /con ascensor/.test(t) ? true : null;
    const intent = detectIntent(t);
    const legalTopic = detectLegalTopic(t);
    if ((MODE === "legal" || legalTopic) && !(intent === "renov" && /cuanto cuesta|estimar|coste de reforma/.test(t))) {
      if (legalTopic) add(legalAnswer(legalTopic));
      else add(legalAnswer("general"));
      add("", { chips: legalChips() });
      return finish(replies, actions, t);
    }

    if (/invierto|inversor|rentar|alquilar para|yield|cap rate/.test(t)) P.role = "inversor";
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
    if (/con ascensor/.test(t) && intent === "sell") P.propAsc = true;

    /* manandles a hola / memoria */
    if (first && intent === "other") {
      add(L().hello);
      add("", { chips: ["Busco piso para comprar", "Quiero vender mi piso", "¿Cuánto valdría mi piso?", "Gastos de compraventa en Vigo", "¿Qué recuerdas de mí?"] });
      return finish(replies, actions, t);
    }
    if (intent === "contact") {
      const B = window.MV_BRAND || {};
      add("Constructora: Rúa García Olloqui 8, 36201 Vigo · " + (B.telDisplay || "986 90 90 10") + " · " + (B.emailGeneral || "info@dimilano.es") + "\nInmobiliaria: Praza de Compostela 32, 36201 Vigo · " + (B.emailInmo || "inmobiliaria@dimilano.es") + "\nYo me encargo del resto: cualifícate aquí y mi equipo te llama.");
      actions.push({ type: "contact", tel: B.telRaw || "+34986909010", email: B.emailInmo || "inmobiliaria@dimilano.es", site: B.site || "https://www.dimilano.es/contacto" });
      add("", { chips: ["Busco piso para comprar", "Quiero vender mi piso"] });
      return finish(replies, actions, t);
    }
    if (intent === "greet" || (first && intent === "other")) {
      add(L().hello.split("\n").slice(-1)[0] + "\n¿Qué buscas hoy — comprar, alquilar o vender?");
      return finish(replies, actions, t);
    }
    if (intent === "memory") {
      const kn = [];
      if (P.name) kn.push("te llamas " + P.name);
      if (P.role) kn.push("tu rol: " + P.role);
      if (P.budget_max) kn.push("presupuesto hasta " + eur(P.budget_max));
      if (P.rooms !== null) kn.push(P.rooms + " hab");
      if (P.zones.length) kn.push("zonas: " + P.zones.map(z => D().ZONES.find(x => x.id === z).name).join(", "));
      if (P.timeline) kn.push("plazo " + P.timeline);
      if (P.phone) kn.push("tel " + P.phone);
      if (!kn.length) add("Aún no me has contado nada. Cuéntame qué buscas y lo iré recordando.");
      else add(L().back + kn.join(" · ") + ".\n(Todo esto está ya en tu ficha del CRM.)");
      return finish(replies, actions, t);
    }

    /* ------- VENDEDOR / TASACIÓN ------- */
    if (intent === "sell" || ((!P.role || P.role === "vendedor") && /tas/.test(t))) {
      const missing = [];
      if (!P.propZone) missing.push("zona");
      if (!P.propM2) missing.push("m²");
      if (missing.length) {
        if (!P.name && first) add("Perfecto, te ayudo a vender. Antes, ¿cómo te llamas?");
        add(missing.includes("zona") && !P.propM2
          ? "Necesito dos datos: en qué zona está el piso y cuántos m² tiene."
          : "Dame la " + missing.join(" y el ") + " del piso.");
      } else {
        const v = valuate(P.propZone, P.propM2, P.propRooms, P.propYear || 1985, P.propCond || "bueno", P.propAsc !== false);
        add(P.name ? P.name + ", mi tasación exprés para tu piso en " + v.zone + " (" + P.propM2 + " m²):"
                   : "Tasación exprés para tu piso en " + v.zone + " (" + P.propM2 + " m²):");
        add("· Valor orientativo: " + eur(v.low) + " – " + eur(v.high) + "\n· Punto medio: " + eur(v.mid) + " (" + eur(v.baseM2) + "/m²)\n· Alquiler estimado: " + eur(v.rent) + "/mes (renta " + v.yieldPct + " %)\n" + (v.reformNote ? "· " + v.reformNote + "\n" : "") + "\n⚠️ Estimación orientativa, no tasación pericial.");
        if (!P.phone || !P.email) add("¿Te preparo el informe completo en PDF? Pásame un móvil o email.");
        else add("Informe listo para enviar a " + (P.phone || P.email) + ". ¿Te llamo hoy para fijar estrategia de salida?");
        P.lead.budget_max = v.mid;
      }
      return finish(replies, actions, t);
    }

    /* ------- COSTES ------- */
    if (intent === "costs") {
      const C = D().COSTS;
      add("Costes de compraventa orientativos (Vigo, Galicia):\n· " + C.itp + "\n· Notaría: " + C.notaria + "\n· Registro: " + C.registro + "\n· Gestoría: " + C.gestoria + "\n· Tasación (con hipoteca): " + C.tasacion + "\n· " + C.hipoteca + "\n\nEjemplo rápido: piso de " + eur(150000) + " → ITP " + eur(15000) + " + resto de gastos ≈ " + eur(1700) + "–" + eur(2500) + " + financiación.\n⚠️ Orientativo: la asesora lo fija en tu operación.");
      add("", { chips: ["Busco 2 hab en Bouzas", "¿Y si compro bajo y reformo?"] });
      return finish(replies, actions, t);
    }

    /* ------- REFORMA ------- */
    if (intent === "renov") {
      const m = m2 || P.propM2 || 75;
      const lvl = /premium|cocina|banos|baños|climatiz/.test(t) ? "premium" : (m && P.propCond === "reformar" && P.propM2 ? "integral" : (m && P.propM2 ? "integral" : "integral"));
      const r = reformCost(m, lvl);
      add("Reforma " + lvl + " estimada para " + m + " m²: " + eur(r.from) + " – " + eur(r.to) + " (" + eur(D().RENOV.integral.m2eur[0]) + "–" + eur(D().RENOV.integral.m2eur[1]) + "/m²).\n" + r.note + "\n\nTáctica probada en Vigo: comprar bajo + reformar sube el valor final por encima del coste cuando compras bajo de media de zona.");
      add("", { chips: ["Estimar reforma de 75 m² premium", "Muéstrame pisos para reformar"] });
      const mm = match({ budget_max: P.budget_max, rooms: null, zones: [], condition: "reformar", elevator: null });
      actions.push({ type: "properties", ids: mm.results.map(x => x.p.id).filter(id => { const p = D().PROPS.find(q => q.id === id); return p.condition === "reformar"; }), ms: mm.ms, why: "pisos con tesis de reforma" });
      return finish(replies, actions, t);
    }

    /* ------- MERCADO ------- */
    if (intent === "market") {
      const zid = zs[0] || P.zones[0] || "bouzas";
      const z = D().ZONES.find(x => x.id === zid);
      add("Radar " + z.name + ": " + eur(z.priceM2) + "/m² de venta (" + z.trend + " interanual) · alquiler: " + eur(Math.round(z.rentM2 * 60 / 10) * 10) + "/mes para un estándar de 60 m².\n" + z.note + "\n⚠️ Estimaciones orientativas del agente.");
      add("", { chips: ["Comparemos 3 zonas", "Busco chollo en " + z.name] });
      return finish(replies, actions, t);
    }

    /* ------- ALQUILER ------- */
    if (intent === "rent") {
      const zone = zs[0] || P.zones[0] || "cascovello";
      const z = D().ZONES.find(x => x.id === zone);
      const est = rooms !== null ? rooms : 1;
      add("Para alquilar: en " + z.name + " un " + (est === 0 ? "estudio" : est + " hab") + " ronda los " + eur(Math.round(z.rentM2 * (est === 0 ? 45 : est * 35 + 5) / 10) * 10) + "/mes.\n¿Te preparo matches de compra y cuenta de rentabilidad, o buscas directo rental? En Vigo la vacacional rents fuerte en Samil y Berbés.");
      add("", { chips: ["Prefiero comprar", "Pisos de inversión en Casco Vello"] });
      return finish(replies, actions, t);
    }

    /* ------- VISITAS ------- */
    if (intent === "visit") {
      const named = D().PROPS.find(p => t.includes(nor(p.title).split(" ").filter(w => w.length > 5)[0] || "___"));
      const prop = named || (match({ budget_max: P.budget_max, rooms: P.rooms, zones: P.zones, elevator: null, condition: null }).results[0] || {}).p;
      if (prop) {
        add("Vamos con la visita de “" + prop.title + "” (" + D().ZONES.find(z => z.id === prop.zone).name + ", " + eur(prop.price) + ").");
        actions.push({ type: "scheduler", propId: prop.id });
      } else add("Dime qué piso quieres ver — podemos listar los que mejor te encajan primero.");
      return finish(replies, actions, t);
    }

    /* ------- COMPRA / MATCHING ------- */
    if (intent === "buy" || (P.role === "comprador" && intent === "other")) {
      if (!P.rooms && P.rooms !== 0) { add("Anótalo: ¿cuántas habitaciones quieres? (estudio, 2 hab, 3 hab…)"); }
      else if (!P.budget_max) { add(P.rooms === 0 ? "Los estudios en Vigo van de ~" + eur(95000) + " a " + eur(139000) + " según zona. ¿Hasta cuánto quieres llegar?" : "En Vigo ese formato va desde " + eur(D().ZONES.find(z => z.id === "coia").priceM2 * 100) + " (Coia) hasta " + eur(D().ZONES.find(z => z.id === "bouzas").priceM2 * 100) + " (Bouzas) según zona y estado. ¿Hasta cuánto llega tu presupuesto?"); }
      else {
        const mm = match({ budget_max: P.budget_max, rooms: P.rooms, zones: P.zones, elevator: wantsElevator, condition: null });
        if (P.name) add(P.name + ", emparejado en " + mm.ms + " ms:");
        else add("Emparejado en " + mm.ms + " ms con tu perfil:" + (P.budget_max ? " hasta " + eur(P.budget_max) : "") + (P.rooms !== null ? " · " + P.rooms + " hab" : "") + (P.zones.length ? " · " + P.zones.map(z => D().ZONES.find(x => x.id === z).name).join("/") : ""));
        const top = mm.results[0];
        if (top) {
          const wp = mm.results.map(x => x.p.title + " (" + D().ZONES.find(z => z.id === x.p.zone).name + ", " + eur(x.p.price) + ", " + (x.p.roomLabel || x.p.rooms + " hab") + ")").join("\n");
          add(wp + "\n\n¿Quieres visualizar alguna? Te agendo en el horario que elijas." + (P.phone ? "\nTe lo mando también por WhatsApp al " + P.phone + "." : ""));
          actions.push({ type: "properties", ids: mm.results.map(x => x.p.id), ms: mm.ms, why: mm.results.map(x => x.why.join(" · ")).join(" | ") });
        } else {
          add("Ajusta el presupuesto o zona para encajar mejor. ¿Ampliamos el listón?");
        }
      }
      if (P.score >= 60 && !P.phone && !P.email) add("Para mandarte los matches y agenda con notificaciones: ¿un móvil o email?");
      return finish(replies, actions, t);
    }

    /* ------- fallback ------- */
    add("Puedo ayudarte con: compraventa, alquiler, tasación, reformas, gastos y financiación de Galicia, análisis por zona y visitas. ¿Por dónde empezamos? O si prefieres, elige:");
    add("", { chips: ["Busco piso para comprar", "Quiero vender mi piso", "Gastos de compra en Vigo", "¿Qué recuerdas de mí?"] });
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
