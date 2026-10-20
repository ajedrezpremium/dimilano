/* Milano Vigo v1.0 — Orquestación UI */
"use strict";
(function () {
  const $ = id => document.getElementById(id);
  const D = () => window.MV_DATA;
  const A = () => window.MV_AGENT;
  const S = () => window.MV_STORE;
  const eur = n => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(Math.round(n));
  let LANG = localStorage.getItem("mv_lang") || "es";
  let lastProfile = null;

  /* ---------- i18n ---------- */
  const I18N = {
    es: {
      nav_agent:"Agente IA", nav_props:"Propiedades", nav_tas:"Tasación", nav_merc:"Mercado", nav_crm:"CRM",
      cta_chat:"Hablar con la IA", cta_chat2:"Probar el agente ahora", cta_props:"Ver inmuebles",
      hero_badge:"Vigo · Ría de Pontevedra · 2026",
      hero_t1:"Tu agente inmobiliario de IA", hero_t2:"técnico, comercial y administrativo.",
      hero_sub:"Cualifica compradores, agenda visitas, tasa vivienda, estima tu reforma y gestiona el CRM — con memoria conversacional, en segundos y sin dormirse jamás.",
      stat1:"Emparejamiento lead→vivienda", stat2:"Agente siempre activo", stat3:"Del flujo técnico-comercial-administrativo", stat4:"Español, galego, inglés (+ roadmap 35 idiomas)",
      fc2_t:"Visita agendada", fc2_s:"Jueves 17:30 · Casco Vello", fc3_t:"Lead cualificado", fc3_s:"Score 82 / 100 · Presupuesto 165 k€",
      sec1_k:"01 · El agente", sec1_h:"Habla con él. Te recuerda, te cualifica, te empareja.",
      sec1_sub:"Compórtate como un comprador o vendedor real: el agente extrae presupuesto, zonas, plazos y financiación del lenguaje natural, guarda la memoria en tu navegador y la escribe en el CRM en vivo.",
      sec2_k:"02 · Búsqueda conversacional", sec2_h:"Busca en lenguaje natural, no con filtros.",
      sec2_sub:"Zillow-style: escribe lo que quieres y el motor lo analiza, filtra y explica por qué te encaja cada inmueble.",
      sec3_k:"03 · Tasación instantánea + reformas", sec3_h:"¿Cuánto vale tu piso? ¿Y su techo reformado?",
      sec3_sub:"Valoración por barrio con rango de confianza y, como Zillow AI Mode, coste estimado de tu reforma antes de llamar a nadie.",
      sec4_k:"04 · Radar de mercado", sec4_h:"Vigo por barrios: precio, alquiler y tendencia.",
      sec4_sub:"Estimaciones orientativas por zona: la IA no inventa cifras exactas — las acota y avisa antes de que inviertas.",
      sec5_k:"05 · Un agente, tres cerebros", sec5_h:"Técnico. Comercial. Administrativo.",
      role1_t:"Técnico", role2_t:"Comercial", role3_t:"Administrativo",
      role1_a:"Inspección técnica digital de fichas: antigüedad, eficiencia energética, ITE, ascensor, barreras.",
      role1_b:"Plan de obra: reformas por m², costes y viabilidad de cada proyecto.",
      role1_c:"Revisión documental: notas simples, cargas, deudas y estatutos de comunidad.",
      role2_a:"Cualificación de leads: presupuesto, zona, plazo, financiación, motivo.",
      role2_b:"Matching <5 s a inventario y contraofertas basadas en datos.",
      role2_c:"Copy de anuncios para Idealista, Fotocasa y Habitaclia, con la memoria del comprador.",
      role3_a:"CRM en vivo: pipeline, etapas, score y próxima acción.",
      role3_b:"Gastos de Galicia: ITP 10 % (Pontevedra), notaría, registro, gestoría.",
      role3_c:"Agenda de visitas, recordatorios y seguimiento post-visita automático.",
      sec6_k:"06 · CRM administrativo", sec6_h:"Todo lo que el agente conversa, acaba en el pipeline.",
      sec6_sub:"Demo local en v1.0 (localStorage); al conectar Supabase, cada conversación escribe directamente en tu base de datos.",
      crm_mode:"Modo demo · localStorage", crm1:"Leads captados", crm2:"Leads calientes (score > 70)", crm3:"Visitas agendadas", crm4:"Pipeline estimado",
      crm_t1:"Lead", crm_t2:"Rol", crm_t3:"Presupuesto", crm_t4:"Zonas", crm_t5:"Etapa", crm_t6:"Próxima acción",
      crm_seed:"Cargar leads demo", crm_clear:"Vaciar CRM", crm_export:"Exportar CSV",
      share_lbl:"Comparte o copia", copied:"¡Copiado! Ya puedes pegarlo con Ctrl+V", shared:"Compartiendo…",
      foot_msg:"Tu constructora e inmobiliaria en Vigo de confianza, te acompañamos para hacer de tus proyectos una realidad.",
      foot_cta:"Contacta", f_menu:"Menú", f_tienda:"Tienda", f_serv:"Servicios", f_nos:"Sobre nosotros", f_contacta:"Contacta",
      f_services:"Servicios", f_cons:"Constructora", f_inmo:"Inmobiliaria", f_port:"Portafolio", f_valor:"Valora tu inmueble",
      f_priv:"Política de privacidad", f_legal:"Aviso legal", f_term:"Términos y condiciones de uso", f_cookies:"Política de cookies",
      tas_t:"Tasación exprés", tas_zone:"Zona", tas_m2:"M² construidos", tas_rooms:"Habitaciones", tas_year:"Año de construcción", tas_cond:"Estado",
      cond1:"Para reformar", cond2:"Bien conservado", cond3:"Reformado recientemente", tas_asc:"Tiene ascensor", tas_btn:"Tasar ahora",
      tas_res_t:"Resultado", tas_empty:"Rellena el formulario y pulsa “Tasar ahora”.",
      ref_t:"Estimador de reforma", ref_s:"Qué superficie quieres reformar y con qué alcance. Ideal para comprar bajo y subir el valor.",
      ref_m2:"M² a reformar", ref_level:"Alcance", ref1:"Lavado de cara (pintura, suelo)", ref2:"Reforma integral", ref3:"Integral premium (cocina, baños, climatización)",
      ref_zone:"Zona (para valorar plusvalía)", ref_btn:"Estimar coste y retorno",
      mem_title:"Memoria viva del agente", mem_sub:"Lo que ya sabe de ti —se guarda y se escribe al CRM en tiempo real.",
      score:"Nivel de cualificación", score_empty:"Aún frío · sigue conversando", match_t:"Matching en milisegundos",
      online:"en línea · respondiendo en <1 s", send:"Enviar", search:"Buscar", confirm:"Confirmar visita",
      ph_chat:"Escribe: “busco piso 2 hab en Bouzas menos de 160k con ascensor”",
      ph_nl:"“ático reformado frente a la ría con vistas, presupuesto 170k”", ph_name:"Tu nombre", ph_phone:"Móvil / WhatsApp",
      foot5:"© 2026 Di Milano · Todas las cifras de este sitio son estimaciones orientativas del agente IA, no tasación pericial."
    },
    en: {
      nav_agent:"AI Agent", nav_props:"Properties", nav_tas:"Valuation", nav_merc:"Market", nav_crm:"CRM",
      cta_chat:"Chat with the AI", cta_chat2:"Try the agent now", cta_props:"View listings",
      hero_badge:"Vigo · Ría de Pontevedra · 2026",
      hero_t1:"Your AI real-estate agent —", hero_t2:"technical, commercial and administrative.",
      hero_sub:"Qualifies buyers, books viewings, values homes, estimates your renovation and drives the CRM — conversational memory, seconds-fast, never asleep.",
      stat1:"Lead→listing matching", stat2:"Always-on agent", stat3:"Of the technical-commercial-administrative flow", stat4:"Spanish, Galician, English (+ 35-language roadmap)",
      fc2_t:"Viewing booked", fc2_s:"Thursday 17:30 · Casco Vello", fc3_t:"Lead qualified", fc3_s:"Score 82 / 100 · Budget €165k",
      sec1_k:"01 · The agent", sec1_h:"Talk to it. It remembers, qualifies and matches you.",
      sec1_sub:"Act like a real buyer or seller: the agent extracts budget, zones, timelines and financing from natural language, keeps memory in your browser and writes to the CRM live.",
      sec2_k:"02 · Conversational search", sec2_h:"Search in natural language, not with filters.",
      sec2_sub:"Zillow-style: type what you want and the engine parses, filters and explains why each listing fits.",
      sec3_k:"03 · Instant valuation + renovation", sec3_h:"What is your home worth? And its renovated ceiling?",
      sec3_sub:"Barrio-level valuation with a confidence range and — Zillow AI Mode style — your renovation cost before you call anyone.",
      sec4_k:"04 · Market radar", sec4_h:"Vigo by neighbourhood: price, rent, trend.",
      sec4_sub:"Orientative estimates by zone: the AI never invents exact figures — it bounds them and warns before you invest.",
      sec5_k:"05 · One agent, three brains", sec5_h:"Technical. Commercial. Administrative.",
      role1_t:"Technical", role2_t:"Commercial", role3_t:"Administrative",
      role1_a:"Digital inspection of files: age, energy rating, ITE, elevator, accessibility.",
      role1_b:"Works plan: renovations per m², costs and feasibility of each project.",
      role1_c:"Document review: land-registry notes, charges, debts and community statutes.",
      role2_a:"Lead qualification: budget, zone, timeline, financing, motive.",
      role2_b:"5-second matching to inventory and data-driven counter-offers.",
      role2_c:"Listing copy for Idealista, Fotocasa & Habitaclia, with buyer memory.",
      role3_a:"Live CRM: pipeline, stages, score and next action.",
      role3_b:"Galician costs: 10% ITP (Pontevedra), notary, registry, conveyancing.",
      role3_c:"Viewing agenda, reminders and automatic post-viewing follow-up.",
      sec6_k:"06 · Administrative CRM", sec6_h:"Everything the agent discusses ends up in the pipeline.",
      sec6_sub:"Local demo in v1.0 (localStorage); once Supabase is connected, every conversation writes straight to your database.",
      crm_mode:"Demo mode · localStorage", crm1:"Leads captured", crm2:"Hot leads (score > 70)", crm3:"Viewings booked", crm4:"Estimated pipeline",
      crm_t1:"Lead", crm_t2:"Role", crm_t3:"Budget", crm_t4:"Zones", crm_t5:"Stage", crm_t6:"Next action",
      crm_seed:"Load demo leads", crm_clear:"Clear CRM", crm_export:"Export CSV",
      share_lbl:"Share or copy", copied:"Copied! Now paste it with Ctrl+V", shared:"Sharing…",
      foot_msg:"Your trusted construction and real-estate company in Vigo: we walk with you to turn your projects into reality.",
      foot_cta:"Contact", f_menu:"Menu", f_tienda:"Shop", f_serv:"Services", f_nos:"About us", f_contacta:"Contact",
      f_services:"Services", f_cons:"Construction", f_inmo:"Real estate", f_port:"Portfolio", f_valor:"Value your property",
      f_priv:"Privacy policy", f_legal:"Legal notice", f_term:"Terms & conditions of use", f_cookies:"Cookie policy",
      tas_t:"Express valuation", tas_zone:"Zone", tas_m2:"Built m²", tas_rooms:"Bedrooms", tas_year:"Year built", tas_cond:"Condition",
      cond1:"To renovate", cond2:"Well kept", cond3:"Recently renovated", tas_asc:"Has lift", tas_btn:"Value it now",
      tas_res_t:"Result", tas_empty:"Fill the form and press “Value it now”.",
      ref_t:"Renovation estimator", ref_s:"How much surface you want to renovate and to what scope. Great to buy low and lift value.",
      ref_m2:"M² to renovate", ref_level:"Scope", ref1:"Face-lift (paint, floors)", ref2:"Full renovation", ref3:"Premium full (kitchen, baths, AC)",
      ref_zone:"Zone (for uplift)", ref_btn:"Estimate cost & return",
      mem_title:"The agent's living memory", mem_sub:"What it already knows about you — stored and written to the CRM in real time.",
      score:"Qualification level", score_empty:"Still cold · keep chatting", match_t:"Matching in milliseconds",
      online:"online · replying in <1 s", send:"Send", search:"Search", confirm:"Confirm viewing",
      ph_chat:"Type: “2-bed flat in Bouzas under 160k with lift”",
      ph_nl:"“renovated attic facing the estuary with views, budget 170k”", ph_name:"Your name", ph_phone:"Mobile / WhatsApp",
      foot5:"© 2026 Di Milano · All figures on this site are orientative AI-agent estimates, not sworn appraisals."
    },
    gl: {
      nav_agent:"Axente IA", nav_props:"Propiedades", nav_tas:"Tasación", nav_merc:"Mercado", nav_crm:"CRM",
      cta_chat:"Falar coa IA", cta_chat2:"Probar o axente agora", cta_props:"Ver inmobles",
      hero_badge:"Vigo · Ría de Pontevedra · 2026",
      hero_t1:"O teu axente inmobiliario de IA —", hero_t2:"técnico, comercial e administrativo.",
      hero_sub:"Cualifica compradores, axenda visitas, tasa vivenda, estima a túa reforma e xestiona o CRM — con memoria conversacional, en segundos e sen durmirse xamais.",
      stat1:"Emparellamento lead→vivenda", stat2:"Axente sempre activo", stat3:"Do fluxo técnico-comercial-administrativo", stat4:"Galego, castelán, inglés (+ folla de ruta 35 idiomas)",
      fc2_t:"Visita agendada", fc2_s:"Xoves 17:30 · Casco Vello", fc3_t:"Lead cualificado", fc3_s:"Score 82 / 100 · Orzamento 165 k€",
      sec1_k:"01 · O axente", sec1_h:"Fala con el. Lémbrate, cualifícate, emparéate.",
      sec1_sub:"Cómpórtate como un comprador ou vendedor real: o axente extrae orzamento, zonas, prazos e financiación da linguaxe natural, garda a memoria no teu navegador e escríbea no CRM en vivo.",
      sec2_k:"02 · Busca conversacional", sec2_h:"Busca en linguaxe natural, sen filtros.",
      sec2_sub:"Á estilo Zillow: escribe o que queres e o motor analízao, filtra e explica por que te serve cada inmoble.",
      sec3_k:"03 · Tasación instantánea + reformas", sec3_h:"Canto vale a túa vivenda? E o seu teito reformado?",
      sec3_sub:"Valoración por barrio con rango de confianza e, ao estilo Zillow AI Mode, custo estimado da reforma antes de chamar a ninguén.",
      sec4_k:"04 · Radar de mercado", sec4_h:"Vigo por barrios: prezo, alugueiro e tendencia.",
      sec4_sub:"Estimacións orientativas por zona: a IA non inventa cifras exactas — acótaas e avisa antes de que inviertas.",
      sec5_k:"05 · Un axente, tres cerebros", sec5_h:"Técnico. Comercial. Administrativo.",
      role1_t:"Técnico", role2_t:"Comercial", role3_t:"Administrativo",
      role1_a:"Inspección técnica dixital de fichas: antigüidade, eficiencia enerxética, ITE, ascensor, barreiras.",
      role1_b:"Plan de obra: reformas por m², custos e viabilidade de cada proxecto.",
      role1_c:"Revisión documental: notas simples, cargas, débedas e estatutos da comunidade.",
      role2_a:"Cualificación de leads: orzamento, zona, prazo, financiación, motivo.",
      role2_b:"Emparellamento <5 s ao inventario e contraofertas con datos.",
      role2_c:"Copy de anuncios para Idealista, Fotocasa e Habitaclia, co memoria do comprador.",
      role3_a:"CRM en vivo: pipeine, etapas, score e próxima acción.",
      role3_b:"Gastos de Galicia: ITP 10 % (Pontevedra), notaría, rexistro, xestión.",
      role3_c:"Axenda de visitas, recordatorios e seguimento post-visita automático.",
      sec6_k:"06 · CRM administrativo", sec6_h:"Todo o que o axente conversa, remata no pipeine.",
      sec6_sub:"Demo local na v1.0 (localStorage); ao conectar Supabase, cada conversación escribe directo na túa base de datos.",
      crm_mode:"Modo demo · localStorage", crm1:"Leads captados", crm2:"Leads quentes (score > 70)", crm3:"Visitas agendadas", crm4:"Pipeine estimado",
      crm_t1:"Lead", crm_t2:"Rol", crm_t3:"Orzamento", crm_t4:"Zonas", crm_t5:"Etapa", crm_t6:"Próxima acción",
      crm_seed:"Cargar leads demo", crm_clear:"Baleirar CRM", crm_export:"Exportar CSV",
      share_lbl:"Comparte ou copia", copied:"Copiado! Agora pégao con Ctrl+V", shared:"Compartindo…",
      foot_msg:"A túa construtora e inmobiliaria de confianza en Vigo: acompañámoste para facer dos teus proxectos unha realidade.",
      foot_cta:"Contacta", f_menu:"Menú", f_tienda:"Tenda", f_serv:"Servizos", f_nos:"Sobre nós", f_contacta:"Contacta",
      f_services:"Servizos", f_cons:"Construtora", f_inmo:"Inmobiliaria", f_port:"Portafolio", f_valor:"Valora o teu inmoble",
      f_priv:"Política de privacidade", f_legal:"Aviso legal", f_term:"Termos e condicións de uso", f_cookies:"Política de cookies",
      tas_t:"Tasación exprés", tas_zone:"Zona", tas_m2:"M² construídos", tas_rooms:"Dormitorios", tas_year:"Ano de construción", tas_cond:"Estado",
      cond1:"Para reformar", cond2:"Bo conservado", cond3:"Reformado hai pouco", tas_asc:"Ten ascensor", tas_btn:"Tasar agora",
      tas_res_t:"Resultado", tas_empty:"Enche o formulario e preme “Tasar agora”.",
      ref_t:"Estimador de reforma", ref_s:"Que superficie queres reformar e con que alcance. Ideal para comprar baixo e subir o valor.",
      ref_m2:"M² a reformar", ref_level:"Alcance", ref1:"Lavado de cara (pintura, chan)", ref2:"Reforma integral", ref3:"Integral premium (cociña, baños, climatización)",
      ref_zone:"Zona (para valorar plusvalía)", ref_btn:"Estimar custo e retorno",
      mem_title:"Memoria viva do axente", mem_sub:"O que xa sabe de ti —gárdase e escríbese ao CRM en tempo real.",
      score:"Nivel de cualificación", score_empty:"Aínda frío · segue conversando", match_t:"Emparellamento en milisegundos",
      online:"en liña · responde en <1 s", send:"Enviar", search:"Buscar", confirm:"Confirmar visita",
      ph_chat:"Escribe: “busco piso 2 hab en Bouzas por menos de 160k con ascensor”",
      ph_nl:"“ático reformado fronte á ría con vistas, orzamento 170k”", ph_name:"O teu nome", ph_phone:"Móbil / WhatsApp",
      foot5:"© 2026 Di Milano · Todalas cifras deste sitio son estimacións orientativas do axente IA, non tasación pericial."
    }
  };
  function applyLang() {
    const d = I18N[LANG] || I18N.es;
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const k = el.getAttribute("data-i18n"); if (!d[k]) return;
      const ctrl = el.querySelector("input,select,textarea,button");
      if (ctrl) {
        let tn = el.firstChild;
        if (tn && tn.nodeType === 3) tn.textContent = d[k];
        else if (tn && tn.nodeType === 1) el.prepend(document.createTextNode(d[k] + " "));
        else el.prepend(document.createTextNode(d[k]));
      } else el.textContent = d[k];
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(el => { const k = el.getAttribute("data-i18n-ph"); if (d[k]) el.placeholder = d[k]; });
    document.documentElement.lang = LANG === "gl" ? "gl" : LANG;
    localStorage.setItem("mv_lang", LANG);
    A().setLang(LANG);
    const modeEl = $("dbMode");
    if (modeEl) modeEl.textContent = S().MODE.display();
    modeEl.classList.toggle("cloud", S().MODE.get() === "supabase");
  }

  /* ---------- chat ---------- */
  function bubble(text, who, meta) {
    const log = $("chatLog");
    const div = document.createElement("div");
    div.className = "bubble " + who;
    div.textContent = text;
    if (meta && meta.chips) {/* chips se renderizan fuera */}
    log.appendChild(div);
    const cp = document.createElement("button");
    cp.className = "copy-btn"; cp.type = "button"; cp.title = "Copiar"; cp.textContent = "⧉";
    cp.dataset.raw = text;
    div.appendChild(cp);
    if (meta && meta.time) {
      const sm = document.createElement("small");
      sm.textContent = meta.time;
      div.appendChild(sm);
    }
    log.scrollTop = log.scrollHeight;
  }
  function pushLead(name) {
    const lead = (lastProfile && lastProfile.lead) || S().blankLead();
    return lead;
  }
  function renderChips(list) {
    const box = $("chips");
    box.innerHTML = "";
    (list || []).forEach(c => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "chip-btn"; b.textContent = c;
      b.onclick = () => sendChat(c);
      box.appendChild(b);
    });
  }
  /* ---------- cerebro LLM (OpenRouter vía /api/chat) con fallback al motor local ---------- */
  async function cloudChat(text, profile) {
    try {
      const hist = S().getConversation().slice(-8);
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang: LANG, message: text, profile, history: hist })
      });
      if (!r.ok) return null;
      const j = await r.json();
      return j && j.text ? j.text : null;
    } catch (e) { return null; } // sin Vercel serverless → motor local
  }

  async function sendChat(text) {
    if (!text.trim()) return;
    bubble(text, "user");
    $("chatInput").value = "";
    typing(true);
    try {
      const r = await A().respond(text);
      const cloud = await cloudChat(text, { lang: LANG, role: r.profile.role, budget_max: r.profile.budget_max, rooms: r.profile.rooms, zones: r.profile.zones, name: r.profile.name, phone: r.profile.phone });
      await new Promise(res => setTimeout(res, cloud ? 250 : 450));
      typing(false);
      S().pushMessage({ role: "user", text, leadId: r.profile.lead && r.profile.lead.cloudId ? r.profile.lead.cloudId : (r.profile.lead || {}).id });
      if (cloud) {
        bubble(cloud, "bot");
        if (speechEnabled) speak(cloud);
        (r.replies || []).forEach(rp => { if (rp.meta && rp.meta.chips) renderChips(rp.meta.chips); });
      } else {
        (r.replies || []).forEach((rp, i) => {
          if (rp.text) bubble(rp.text, "bot", { time: i === 0 && r.score >= 70 ? ["⚡ lead caliente · score " + r.score + "/100"] : null });
          if (rp.meta && rp.meta.chips) renderChips(rp.meta.chips);
        });
        if (speechEnabled) {
          const last = [...(r.replies || [])].reverse().find(x => x.text);
          if (last) speak(last.text);
        }
      }
      lastProfile = r.profile;
      updateMemory(r);
      r.actions.forEach(a => { handleAction(a); });
    } catch (e) {
      console.error("[MV] agent error", e);
      typing(false);
      toast("He tenido un fallo interno, inténtalo de nuevo 🙏");
    }
    renderCRM();
  }
  function typing(on) {
    const log = $("chatLog");
    let el = $("typing");
    if (on && !el) {
      el = document.createElement("div");
      el.className = "bubble bot"; el.id = "typing"; el.textContent = "…";
      log.appendChild(el); log.scrollTop = log.scrollHeight;
    } else if (!on && el) el.remove();
  }
  function updateMemory(r) {
    const p = r.profile; const list = $("memList");
    const rows = [
      ["Nombre", p.name], ["Rol", p.role], ["Presupuesto", p.budget_max ? eur(p.budget_max) : null],
      ["Habitaciones", p.rooms !== null ? (p.rooms === 0 ? "Estudio" : p.rooms + " hab") : null],
      ["Zonas", p.zones.map(z => D().ZONES.find(x => x.id === z).name).join(", ")],
      ["Plazo", p.timeline], ["Móvil", p.phone], ["Ficha Vendedor", p.propZone ? (D().ZONES.find(x => x.id === p.propZone).name + ", " + (p.propM2 || "?") + " m²") : null]
    ];
    list.innerHTML = "";
    rows.forEach(([k, v]) => {
      if (!v) return;
      const li = document.createElement("li");
      li.innerHTML = "<span>" + k + "</span><b>" + v + "</b>";
      list.appendChild(li);
    });
    $("scoreVal").textContent = p.score + "/100";
    $("scoreBar").style.width = p.score + "%";
    $("scoreLabel").textContent = r.scoreLabel;
    $("scoreLabel").style.color = p.score >= 70 ? "var(--green)" : p.score >= 45 ? "var(--gold2)" : "var(--muted)";
    const mb = $("matchBox");
    const act = (r.actions || []).find(a => a.type === "properties" && a.why);
    if (act) { mb.hidden = false; $("matchTime").textContent = act.ms + " ms"; $("matchWhy").textContent = "Por qué encaja: " + act.why; }
  }
  function handleAction(a) {
    if (a.type === "properties" && a.ids && a.ids.length) {
      renderProps({ onlyIds: a.ids });
      const top = D().PROPS.find(p => p.id === a.ids[0]);
      if (top) shareData = { text: "Match de Di Milano: " + top.title + " (" + eur(top.price) + ", Vigo)", url: (window.MV_BRAND || {}).site + "/nuestros_pisos" };
      const sec = $("propiedades"); sec.scrollIntoView({ behavior: "smooth" });
    } else if (a.type === "scheduler") {
      openScheduler(a.propId);
    }
  }

  /* ---------- propiedades ---------- */
  /* WhatsApp: enlace contextual */
  function waNumber() {
    const b = window.MV_BRAND || {};
    return String(b.whatsapp || b.telRaw || '').replace(/\D/g, '');
  }
  function waLink(p) {
    const z = p ? D().ZONES.find(x => x.id === p.zone) : null;
    const txt = p
      ? 'Hola, vengo de la web de Di Milano. Me interesa "' + p.title + '" (' + eur(p.price) + ', ' + (z ? z.name : '') + '). Quiero agendar una visita.'
      : 'Hola, vengo de la web de Di Milano. Quiero información y agendar una visita.';
    return 'https://wa.me/' + waNumber() + '?text=' + encodeURIComponent(txt);
  }
  async function renderProps(filter) {
    const props = D().PROPS;
    const grid = $("propGrid"); grid.innerHTML = "";
    let list = props;
    const nlRes = $("nlResult");
    if (filter && filter.onlyIds) {
      list = props.filter(p => filter.onlyIds.includes(p.id));
      const ms = filter.ms !== undefined ? filter.ms : null;
      nlRes.textContent = list.length + "/" + props.length + " inmuebles emparejados" + (ms !== null ? " · " + Math.max(ms, 1) + " ms · " + filter.why : "") + " (matching <5 s garantizado)";
    } else if (filter) {
      list = props.filter(p => filter.ids.includes(p.id));
      nlRes.textContent = list.length + "/" + props.length + " inmuebles · " + filter.why + " · " + filter.ms + " ms";
    }
    if (!list.length) { nlRes.textContent = "Sin coincidencias — pídeselo al agente en el chat, ajusta zonas o sugerimos similares."; }
    list.forEach((p, i) => {
      const z = D().ZONES.find(x => x.id === p.zone);
      const card = document.createElement("article");
      card.className = "prop-card";
      card.innerHTML =
        '<div class="prop-media frame-' + ((i % 5) + 1) + '">' + z.name + (p.condLabel === undefined ? "" : "") + '</div>' +
        '<div class="prop-tag">' + p.condition + "</div>" +
        '<div class="prop-body"><div class="prop-zone">' + z.name + '</div><h3>' + p.title + '</h3>' +
        '<div class="prop-meta"><span>' + (p.rooms === 0 ? "Estudio" : p.rooms + " hab") + '</span><span>' + p.m2 + ' m²</span><span>' + p.year + '</span><span>' + (p.elevator ? "ascensor" : "sin ascensor") + '</span></div>' +
        '<div class="prop-price">' + eur(p.price) + ' <small>· ' + eur(p.price / p.m2) + '/m² · alquiler ~' + eur(p.m2 * z.rentM2) + '/mes</small></div>' +
        '<div class="prop-actions"><button class="btn btn-gold btn-sm" data-visit="' + p.id + '">Agendar visita</button><a class="btn btn-ghost btn-sm" href="' + waLink(p) + '" target="_blank" rel="noopener">WhatsApp</a><a class="btn btn-ghost btn-sm" href="#agente">Pedir análisis</a><button class="share-btn sm" data-share="x" data-prop="' + p.id + '" title="Compartir/X y copiar">↗</button></div></div>';
      grid.appendChild(card);
    });
    grid.querySelectorAll("[data-visit]").forEach(b => b.onclick = () => openScheduler(b.getAttribute("data-visit")));
    grid.querySelectorAll("[data-prop]").forEach(b => b.onclick = () => {
      const p = D().PROPS.find(x => x.id === b.getAttribute("data-prop"));
      const txt = p ? p.title + " · " + eur(p.price) + " · " + (D().ZONES.find(z => z.id === p.zone) || {}).name + " · Di Milano Vigo" : "";
      doShare("native", txt, (window.MV_BRAND || {}).site + "/nuestros_pisos");
    });
  }

  /* ---------- NL search ---------- */
  function nlSearch(text) {
    const t = text.toLowerCase();
    let budget = null, rooms = null, zones = [];
    const mK = t.match(/(\d{1,3})(?:[.,](\d+))?\s*(k|mil)/);
    if (mK) budget = parseInt(mK[1], 10) * 1000 + (mK[2] ? parseInt(mK[2], 10) : 0) * 100;
    if (!budget) { const mB = t.match(/(\d{2,3}\.\d{3}|\d{5,6})/); if (mB) budget = parseInt(mB[1].replace(/\./g, ""), 10); }
    if (!budget) { const mE = t.match(/(\d{2,3})\s*(mil|euros|€|eur)/); if (mE && mE[1] >= 60) budget = parseInt(mE[1], 10) * 1000; }
    const mR = t.match(/(\d{1,2})\s*(hab|habitacion|dormitor)/);
    if (mR) rooms = parseInt(mR[1], 10); else if (/estudio/.test(t)) rooms = 0;
    for (const [alias, id] of Object.entries(window.MV_AGENT_ZONE_ALIASES || {})) if (t.includes(alias)) zones.push(id);
    const wantReform = /reformar|obra|renovar/.test(t);
    const wantReformed = /reformad|nuevo|áctic|atico/.test(t);
    const wantLift = /con ascensor/.test(t);
    const t0 = performance.now();
    const scores = D().PROPS.map(p => {
      let sc = 0;
      if (budget && p.price <= budget) sc += 35; else if (budget && p.price > budget * 1.1) sc -= 40;
      if (rooms !== null && p.rooms === rooms) sc += 25;
      if (zones.length && zones.includes(p.zone)) sc += 30;
      if (wantReform && p.condition === "reformar") sc += 18;
      if (wantReformed && p.condition === "reformado") sc += 12;
      if (wantLift && p.elevator) sc += 8; else if (wantLift && !p.elevator) sc -= 20;
      return { p, sc, why: [budget ? "presupuesto ≤ " + eur(budget) : null, rooms !== null ? rooms + " hab" : null, zones.length ? zones.map(z => D().ZONES.find(x => x.id === z).name).join("/") : null, wantLift ? "con ascensor" : null].filter(Boolean).join(" · ") };
    }).filter(x => x.sc > 5).sort((a, b) => b.sc - a.sc).slice(0, 6);
    const ms = Math.round(performance.now() - t0);
    if (!scores.length) { $("nlResult").textContent = "Sin coincidencias para → “" + text + "” · cuéntaselo mejor al agente en el chat."; $("propGrid").innerHTML = ""; return; }
    renderProps({ ids: scores.map(x => x.p.id), why: scores[0].why, ms });
  }

  /* ---------- tasación ---------- */
  function initZones() {
    const zsel = $("tasZone"), zsel2 = $("refZoneEst");
    if (!zsel) return;
    D().ZONES.forEach(z => {
      zsel.add(new Option(z.name + " — " + eur(z.priceM2) + "/m²", z.id));
      zsel2.add(new Option(z.name, z.id));
    });
    $("tasZone").value = "bouzas"; $("refZoneEst").value = "bouzas";
  }
  function doValuation(ev) {
    ev.preventDefault();
    const zoneId = $("tasZone").value, m2 = +$("tasM2").value, rooms = +$("tasRooms").value,
          year = +$("tasYear").value, cond = $("tasCond").value, asc = $("tasAsc").checked;
    if (m2 < 20) { toast("Buen intento — jugando con m² <20. Pon algo real 🙂"); return; }
    const v = A().valuate(zoneId, m2, rooms, year, cond, asc);
    const out = $("tasOut");
    out.innerHTML =
      '<div class="big-price">' + eur(v.mid) + '</div>' +
      '<div class="range">rango ' + eur(v.low) + " – " + eur(v.high) + '</div>' +
      "<table><tr><td>€/m² resultado</td><td>" + eur(v.baseM2) + '</td></tr>' +
      '<tr><td>Alquiler estimado</td><td>' + eur(v.rent) + '/mes</td></tr>' +
      '<tr><td>Rental bruta</td><td>' + v.yieldPct + ' %</td></tr>' +
      (v.reformNote ? '<tr><td>Techo tras reforma</td><td>' + eur(v.mid * 1.12) + '</td></tr><tr><td>Obra estimada</td><td>' + eur(A().reformCost(m2, "integral").from) + " – " + eur(A().reformCost(m2, "integral").to) + "</td></tr>" : '') +
      "</table>" +
      '<p class="note">⚠️ Estimación orientativa del agente (no tasación pericial). Facilita informes medianos al conocer nota registral, estado real y vista.</p>';
    toast("Tasación en tu ficha del CRM · generada en " + Math.round(80 + Math.random() * 120) + " ms");
    shareData = { text: "Tasación IA Di Milano: mi piso en " + v.zone + " vale ~" + eur(v.mid) + " (" + eur(v.baseM2) + "/m²)", url: (window.MV_BRAND || {}).site + "/valorador" };
  }
  function doReform(ev) {
    ev.preventDefault();
    const m2 = +$("refM2").value, level = $("refLevel").value, zoneId = $("refZoneEst").value;
    if (m2 < 10) { toast("M² reales, por favor 🙂"); return; }
    const r = A().reformCost(m2, level);
    const z = D().ZONES.find(x => x.id === zoneId);
    const uplift = Math.round(m2 * z.priceM2 * 0.16);
    const mid = (r.from + r.to) / 2;
    $("refOut").innerHTML =
      "<table>" +
      '<tr><td>' + (level === "lavado" ? "Lavado de cara" : level === "premium" ? "Reforma premium" : "Reforma integral") + " · " + m2 + ' m²</td><td>' + eur(r.from) + " – " + eur(r.to) + "</td></tr>" +
      "<tr><td>Nuevo valor estimado del inmueble</td><td>" + eur(z.priceM2 * m2) + "</td></tr>" +
      "<tr><td>Plusvalía esperada al reformar (zona " + z.name + ')</td><td class="green">+' + eur(uplift) + "</td></tr>" +
      "<tr><td>Margen estimado</td><td>" + (uplift - mid > 0 ? '<span class="green">+' + eur(uplift - mid) + "</span>" : '<span style="color:var(--red)">−' + eur(mid - uplift) + "</span>") + "</td></tr>" +
      "</table>" +
      '<p class="note" style="font-size:.72rem;color:var(--muted);margin-top:10px">' + r.note + " · Reformas con valor creciente en Barrio " + z.name + " (estimación orientativa).</p>";
  }

  /* ---------- scheduler ---------- */
  let pendingProp = null;
  function openScheduler(propId) {
    const p = D().PROPS.find(x => x.id === propId); if (!p) return;
    pendingProp = p;
    $("modalTitle").textContent = "Agendar visita";
    $("modalProp").textContent = p.title + " · " + D().ZONES.find(z => z.id === p.zone).name + " · " + eur(p.price);
    const slots = A().nextSlots();
    const list = $("slotList"); list.innerHTML = "";
    $("slotConfirm").hidden = true;
    slots.forEach(s => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "slot-btn"; b.innerHTML = "📅 <b>" + s.split(" · ")[0] + "</b><br><span style='color:var(--gold)'>" + s.split(" · ")[1] + "</span>";
      b.onclick = () => confirmSlot(s);
      list.appendChild(b);
    });
    $("modal").hidden = false;
  }
  function confirmSlot(slot) {
    $("slotConfirmText").textContent = "Visitamos “" + pendingProp.title + "” · " + slot + ". ¿A qué nombre lo dejamos?";
    $("slotConfirm").hidden = false;
    $("slotConfirm").dataset.slot = slot;
    $("visitName").value = (lastProfile && lastProfile.name) || "";
  }
  async function closeScheduler() {
    const p = pendingProp;
    const name = $("visitName").value.trim(), phone = $("visitPhone").value.trim(), slot = $("slotConfirm").dataset.slot;
    if (!p || !$("slotConfirm").dataset.slot) return $("modal").hidden = true;
    if (!name) { toast("Dinos tu nombre para dejarlo agendado"); return; }
    const prof = A().profile();
    prof.name = twinDeep(prof.name, name);
    prof.phone = phone || prof.phone;
    prof.role = prof.role || "comprador";
    prof.lead = prof.lead && prof.lead.name ? prof.lead : S().blankLead();
    prof.lead.name = name; if (phone) prof.lead.phone = "+34 " + phone.replace(/\D/g, "");
    prof.lead.visits.push({ property: p.title, slot });
    prof.lead.stage = 2; prof.lead.next_action = "Visita " + slot + " · " + p.title;
    await S().saveLead(prof.lead);
    A().setState ? A().setState(prof) : null;
    $("modal").hidden = true;
    toast("✅ Visita " + slot + " — te confirmamos por WhatsApp");
    renderCRM();
  }
  function twinDeep(a, b) { return b || a; }

  /* ---------- CRM ---------- */
  const STAGES = ["Nuevo", "Cualificado", "Visita agendada", "Oferta", "Cerrado"];
  async function renderCRM() {
    const leads = await S().getLeads();
    $("crmLeads").textContent = leads.length;
    $("crmHot").textContent = leads.filter(l => (l.score || 0) >= 70).length;
    const visitCount = leads.reduce((n, l) => n + ((l.visits || []).length ? 1 : 0), 0);
    $("crmVisits").textContent = visitCount;
    const pipeline = leads.reduce((n, l) => n + (l.budget_max || 0), 0);
    $("crmValue").textContent = pipeline ? eur(pipeline) : "0 €";
    const body = $("crmBody");
    body.innerHTML = "";
    if (!leads.length) {
      body.innerHTML = '<tr><td colspan="7" class="muted">Nada aún: conversa con el agente en la sección 01 y verás aquí los leads con su score en vivo.</td></tr>';
      return;
    }
    leads.forEach(l => {
      const tr = document.createElement("tr");
      tr.innerHTML =
        "<td><b>" + (l.name || "Invitado") + "</b>" + (l.phone ? '<br><span class="muted" style="font-size:.72rem">' + l.phone + "</span>" : "") + "</td>" +
        "<td>" + (l.role || "—") + "</td>" +
        '<td><span style="font-family:var(--mono);color:' + ((l.score || 0) >= 70 ? "var(--green)" : "var(--gold2)") + '">' + (l.score || 0) + "</span></td>" +
        "<td>" + (l.budget_max ? eur(l.budget_max) : "—") + "</td>" +
        "<td>" + ((l.zones || []).map(z => (D().ZONES.find(x => x.id === z) || {}).name).filter(Boolean).join(", ") || "—") + "</td>" +
        '<td><span class="stage s' + (l.stage || 0) + '">' + STAGES[l.stage || 0] + "</span></td>" +
        "<td>" + (l.next_action || "—") + "</td>";
      body.appendChild(tr);
    });
    exportCSV(leads);
  }
  function exportCSV(leads) {
    const rows = [["name", "role", "budget_max", "rooms", "zones", "phone", "stage", "score", "next_action"]];
    (leads || []).forEach(l => rows.push([l.name, l.role, l.budget_max, l.rooms, (l.zones || []).join("|"), l.phone, STAGES[l.stage || 0], l.score, l.next_action]));
    const csv = rows.map(r => r.map(c => '"' + String(c == null ? "" : c).replace(/"/g, "'") + '"').join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const a = $("crmExport");
    a.href = URL.createObjectURL(blob);
  }
  async function seedDemo() {
    const mk = (name, role, budget, rooms, zones, stage, score, next) =>
      Object.assign(S().blankLead(), { name, role, budget_max: budget, rooms, zones, stage, score, next_action: next, lang: LANG });
    await S().saveLead(mk("Demo · Marina", "comprador", 140000, 2, ["bouzas", "cascovello"], 1, 75, "Enviar 3 matches + agenda de visitas"));
    await S().saveLead(mk("Demo · Luis", "vendedor", 189000, 3, ["alcabre"], 1, 68, "Enviar informe de tasación por email"));
    await S().saveLead(mk("Demo · Keila", "inversor", 110000, 2, ["coia"], 2, 82, "Visita jueves 17:30 · para reformar Coia"));
    await S().saveLead(mk("Demo · pqrs", "comprador", 95000, 0, ["cascovello"], 0, 40, "Reconducir si pican"));
    renderCRM(); toast("Leads demo cargados");
  }

  /* ---------- toast & misc ---------- */
  let toastT = null;
  function toast(txt) {
    const t = $("toast"); t.textContent = txt; t.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 3600);
  }

  /* ---------- voz TTS (femenina / masculina) y STT ---------- */
  let voicePref = localStorage.getItem("mv_voiceGender") || "f"; // f | m | off
  const FEMALE_HINTS = /monica|monika|mónica|sabina|estrella|helena|laura|isidora|elvira|esperanza|female|samantha|victoria|allison|ava|zira|sonia|libby|karen|female|emma|partutá|luciana|ximena|iulia|amelie|amelía|milena|paulina|female|zoila/i;
  const MALE_HINTS  = /pablo|gustavo|diego|álvaro|alvaro|jorge|male|alex|daniel|fred|tom|male|juan|rasmus|male|stefan|carlos|homme/i;
  function pickVoice(lang) {
    const vs = (window.speechSynthesis && speechSynthesis.getVoices() || []).filter(v =>
      v.lang.toLowerCase().startsWith(lang.slice(0, 2)) || (lang === "gl" && v.lang.toLowerCase().startsWith("es")));
    if (!vs.length) return null;
    const wantF = voicePref === "f";
    const hit = vs.find(v => wantF ? FEMALE_HINTS.test(v.name) : MALE_HINTS.test(v.name));
    return hit || vs[0];
  }
  function speak(text) {
    if (!window.speechSynthesis || voicePref === "off" || !speechEnabled) return;
    try { speechSynthesis.cancel(); } catch (e) {}
    const clean = text.replace(/⚠️|·|—/g, " ").replace(/\n+/g, ". ").replace(/[·—⚠️]/g, "").slice(0, 420);
    const u = new SpeechSynthesisUtterance(clean);
    const v = pickVoice(LANG);
    if (v) u.voice = v;
    u.lang = { es: "es-ES", gl: "gl-ES", en: "en-US" }[LANG] || "es-ES";
    if (v) u.lang = v.lang;
    u.rate = 1.02; u.pitch = voicePref === "m" ? 0.92 : 1.08;
    speechSynthesis.speak(u);
  }
  function setVoicePref(g) {
    voicePref = g; localStorage.setItem("mv_voiceGender", g);
    if (g !== "off" && !speechEnabled) { speechEnabled = true; }
    speechEnabled = voicePref === "off" ? false : true;
    $("voiceToggle").style.borderColor = speechEnabled ? "var(--gold)" : "";
    if (!speechEnabled && window.speechSynthesis) { try { speechSynthesis.cancel(); } catch (e) {} }
    if (speechEnabled) { const B = window.MV_BRAND || {}; speak((voicePref === "m" ? "Voz masculina activada. " : "Voz femenina activada. ") + (B.name || "Di Milano")); }
    toast("Voz: " + (g === "f" ? "femenina ♀" : g === "m" ? "masculina ♂" : "silencio"));
  }
  if (window.speechSynthesis) speechSynthesis.addEventListener && speechSynthesis.addEventListener("voiceschanged", () => { pickVoice(LANG); });

  /* ---------- compartir · RRSS · copiar ---------- */
  function shareUrl(kind, text, url) {
    const t = encodeURIComponent(text), u = encodeURIComponent(url);
    switch (kind) {
      case "x": return "https://twitter.com/intent/tweet?text=" + t + "&url=" + u;
      case "whatsapp": return "https://wa.me/?text=" + t + "%20" + u;
      case "facebook": return "https://www.facebook.com/sharer/sharer.php?u=" + u + "&quote=" + t;
      case "linkedin": return "https://www.linkedin.com/sharing/share-offsite/?url=" + u;
      default: return null;
    }
  }
  async function doShare(kind, text, url) {
    text = text || ((window.MV_BRAND || {}).name || "Di Milano") + " · Agente IA inmobiliario en Vigo";
    url = url || (window.location.href.split("#")[0]);
    if (kind === "copy") {
      try { await navigator.clipboard.writeText(text + " → " + url); }
      catch (e) { fallbackCopy(text + " → " + url); }
      toast((I18N[LANG] || I18N.es).copied);
      return;
    }
    if (kind === "native" && navigator.share) {
      try { await navigator.share({ title: "Di Milano", text, url }); toast((I18N[LANG] || I18N.es).shared); } catch (e) { /* cancelado */ }
      return;
    }
    const link = kind === "native"
      ? null
      : shareUrl(kind, text, url);
    if (link) window.open(link, "_blank", "noopener,width=640,height=560");
    else if (kind === "native") doShare("copy", text, url);
  }
  function fallbackCopy(txt) {
    const ta = document.createElement("textarea");
    ta.value = txt; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    ta.remove();
  }
  let shareData = null;
  function bindShareButtons() {
    document.querySelectorAll("[data-share]").forEach(b => {
      if (b.hasAttribute("data-prop")) return; // las tarjetas comparten su ficha
      b.onclick = () => doShare(b.dataset.share, (shareData || {}).text, (shareData || {}).url);
    });
  }

  /* ---------- init ---------- */
  let speechEnabled = false;
  async function init() {
    // Config en runtime de Vercel (env vars) → merge si existe api/config.js
    try {
      const r = await fetch("/api/config"); if (r.ok) {
        const j = await r.json();
        if (j.SUPABASE_URL && j.SUPABASE_ANON_KEY && !window.MV_CONFIG.SUPABASE_URL) window.MV_CONFIG = j;
      }
    } catch (e) { /* GitHub Pages: sin serverless, seguirá config.js */ }
    await A().init();
    initZones();
    applyLang();
    $("langSelect").value = LANG;
    $("langSelect").onchange = e => { LANG = e.target.value; applyLang(); };
    renderProps();
    renderCRM();
    renderZoneGrid();
    // saludo del agente
    const prof = A().profile();
    if (prof.name) bubble("De vuelta, " + prof.name + ". Retomamos por donde lo dejamos — di “¿qué recuerdas de mí?” para el repaso.", "bot");
    else bubble("Te presento tu agente de Milano Vigo. Pregúntame por tasación, pisos, gastos en Galicia o reformas — o dime directamente lo que buscas.", "bot");
    updateMemory({ profile: prof, score: prof.score || 0, scoreLabel: prof.score >= 70 ? "HOT · lead caliente" : prof.score >= 45 ? "WARM · tibio" : "COLD · aún frío", actions: [] });
    $("resetChat").onclick = async () => { A().reset(); $("chatLog").innerHTML = ""; $("memList").innerHTML = ""; $("scoreVal").textContent = "—"; $("scoreBar").style.width = "0%"; renderChips(["Busco piso para comprar", "Quiero vender mi piso", "¿Cuánto valdría mi piso?"]); toast("Memoria borrada"); };
    $("voiceToggle").onclick = () => setVoicePref(voicePref === "off" ? "f" : "off");
    $("voiceFemale").onclick = () => setVoicePref("f");
    $("voiceMale").onclick = () => setVoicePref("m");
    $("voiceToggle").style.borderColor = (voicePref !== "off") ? "var(--gold)" : "";
    speechEnabled = voicePref !== "off";
    // copiar de burbujas (copiar → pegar con Ctrl+V)
    $("chatLog").addEventListener("click", e => {
      const b = e.target.closest(".copy-btn");
      if (!b) return;
      const txt = b.dataset.raw || "";
      (navigator.clipboard && navigator.clipboard.writeText(txt) ? navigator.clipboard.writeText(txt) : Promise.reject())
        .then(() => toast((I18N[LANG] || I18N.es).copied))
        .catch(() => { fallbackCopy(txt); toast((I18N[LANG] || I18N.es).copied); });
    });
    bindShareButtons();
    $("chatForm").addEventListener("submit", e => { e.preventDefault(); sendChat($("chatInput").value); });
    $("nlForm").addEventListener("submit", e => { e.preventDefault(); nlSearch($("nlInput").value); });
    $("tasForm").addEventListener("submit", doValuation);
    $("refForm").addEventListener("submit", doReform);
    $("modalClose").onclick = () => { $("modal").hidden = true; };
    $("visitConfirmBtn").onclick = closeScheduler;
    $("modal").addEventListener("click", e => { if (e.target === $("modal")) $("modal").hidden = true; });
    $("crmSeed").onclick = seedDemo;
    $("crmClear").onclick = () => { S().clearLocal(); renderCRM(); toast("CRM vaciado"); };
    // voz: reconocimiento
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const mic = $("micBtn"); mic.hidden = false;
      let rec = null;
      mic.onclick = () => {
        if (rec) { rec.stop(); return; }
        rec = new SR(); rec.lang = { es: "es-ES", gl: "gl-ES", en: "en-US" }[LANG] || "es-ES";
        rec.onresult = ev => { $("chatInput").value = ev.results[0][0].transcript; rec = null; mic.classList.remove("listening"); };
        rec.onerror = () => { rec = null; mic.classList.remove("listening"); };
        rec.onend = () => { mic.classList.remove("listening"); };
        mic.classList.add("listening");
        rec.start();
      };
    }
  }
  function renderZoneGrid() {
    const grid = $("zoneGrid"); grid.innerHTML = "";
    D().ZONES.forEach(z => {
      const c = document.createElement("div");
      c.className = "zone-card";
      c.innerHTML = "<h3>" + z.name + ' <span class="zone-trend">' + z.trend + '</span></h3>' +
        '<div class="zone-price">' + eur(z.priceM2) + '<small> /m² venta</small></div>' +
        '<div style="font-size:.8rem;color:var(--gold)">alquiler ~' + eur(z.rentM2 * 70) + "/mes (70 m²)</div>" +
        "<p style=\"margin-top:8px\">" + z.note + "</p>";
      grid.appendChild(c);
    });
  }
  document.addEventListener("DOMContentLoaded", init);
})();


/* Mapa bajo demanda (sin cargar Google hasta el clic) */
document.querySelectorAll('.map-toggle').forEach(function(btn){btn.addEventListener('click',function(){var wrap=btn.nextElementSibling;if(!wrap)return;if(wrap.hidden){if(!wrap.querySelector('iframe')){var iframe=document.createElement('iframe');iframe.src=btn.dataset.map;iframe.loading='lazy';iframe.title='Mapa de la sede';iframe.style.width='100%';iframe.style.height='220px';iframe.style.border='0';iframe.style.borderRadius='12px';wrap.appendChild(iframe);}wrap.hidden=false;btn.textContent='🗺 Ocultar mapa';}else{wrap.hidden=true;btn.textContent='🗺 Ver mapa';}});});

/* WhatsApp flotante + continuar desde el chat */
(function () {
  var n = waNumber();
  if (!n) return;
  var f = document.getElementById('waFloat');
  if (f) f.href = 'https://wa.me/' + n + '?text=' + encodeURIComponent('Hola, vengo de la web de Di Milano. Quiero información y agendar una visita.');
  var c = document.getElementById('waChat');
  if (c) {
    c.href = 'https://wa.me/' + n;
    c.addEventListener('click', function (e) {
      e.preventDefault();
      var log = document.getElementById('chatLog');
      var msgs = log ? log.querySelectorAll('.msg.user, .user, [data-role=user]') : [];
      var last = msgs.length ? msgs[msgs.length - 1].innerText.trim() : '';
      var txt = 'Hola, vengo de la web de Di Milano. Quiero agendar una visita.' + (last ? ' Contexto: ' + last : '');
      window.open('https://wa.me/' + n + '?text=' + encodeURIComponent(txt), '_blank');
    });
  }
})();

/* ---------- TEMA CLARO/OSCURO ---------- */
(function(){var root=document.documentElement;var btn=document.getElementById('themeToggle');function paint(){if(!btn)return;var dark=root.getAttribute('data-theme')==='dark';btn.textContent=dark?'☀️':'🌙';btn.title=dark?'Cambiar a tema claro':'Cambiar a tema oscuro';btn.setAttribute('aria-label',btn.title);}if(btn){paint();btn.addEventListener('click',function(){var next=root.getAttribute('data-theme')==='dark'?'light':'dark';root.setAttribute('data-theme',next);try{localStorage.setItem('site_theme',next);}catch(e){}paint();});}})();

/* Modo embebido: evitar duplicar botones flotantes */
if (window.self !== window.top) { document.documentElement.classList.add('po-embedded'); }
