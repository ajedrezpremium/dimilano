/* Milano Vigo v1.0 — Capa de datos: Supabase si está configurado, localStorage como fallback */
"use strict";
window.MV_STORE = (function () {
  const cfg = window.MV_CONFIG || {};
  const LS = { P:"mv_profile", L:"mv_leads", C:"mv_convo" };
  let client = null, mode = "local";
  if (window.supabase && cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY) {
    try { client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY); mode = "supabase"; } catch (e) { console.warn("[MV] Supabase init:", e.message); }
  }
  const jget = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
  const jset = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } };

  async function cloud(fn, fallbackArgs, fallbackFn) {
    if (!client) return fallbackFn ? fallbackFn(...fallbackArgs) : undefined;
    try { return await fn(client); } catch (e) { console.warn("[MV] cloud →", e.message); }
    return fallbackFn ? fallbackFn(...fallbackArgs) : undefined;
  }
  function baseLeadFactory(){ return { id:"l-" + Math.random().toString(36).slice(2, 8), created_at:new Date().toISOString(), name:"Invitado", role:null, budget_max:null, rooms:null, zones:[], phone:null, email:null, stage:0, score:0, next_action:"Primer contacto", lang:"es", visits:[] }; }

  return {
    MODE: { get: () => mode, display: () => mode === "supabase" ? "Supabase conectado" : "Modo demo · localStorage" },
    blankLead: baseLeadFactory,
    async saveProfile(p) { jset(LS.P, p); return true; },
    getProfile: () => jget(LS.P, null),
    getConversation: () => jget(LS.C, []),
    pushMessage(m) {
      const C = jget(LS.C, []); C.push({ role: m.role, text: m.text, ts: Date.now() }); jset(LS.C, C.slice(-60));
      const lid = m.leadId || "";
      if (m.role === "user" && lid && client) client.from("mv_messages").insert({ lead_id: lid, role: m.role, text: m.text })
        .then(({ error }) => { if (error) console.warn("[MV] msg →", error.message); });
    },
    resetConversation() { localStorage.removeItem(LS.C); localStorage.removeItem(LS.P); },
    async getLeads() {
      const local = jget(LS.L, null);
      return cloud(async c => {
        const { data, error } = await c.from("mv_leads").select("*").order("created_at", { ascending: false }).limit(50);
        if (error || !data || data.length === 0) return local || [];
        return data.map(x => ({ id: x.id, name: x.name, role: x.role, budget_max: x.budget_max, rooms: x.rooms, zones: x.zones || [], stage: x.stage, score: x.score, next_action: x.next_action, phone: x.phone, lang: x.lang, visits: [], created_at: x.created_at }));
      }, [], () => local || []);
    },
    async saveLead(lead) {
      const local = jget(LS.L, []); const i = local.findIndex(l => l.id === lead.id);
      if (i >= 0) local[i] = lead; else local.unshift(lead);
      jset(LS.L, local.slice(0, 50));
      if (client) try {
        const row = { id: lead.id, name: lead.name, role: lead.role, budget_max: lead.budget_max, rooms: lead.rooms, zones: lead.zones, phone: lead.phone, email: lead.email, stage: lead.stage, score: lead.score, next_action: lead.next_action, lang: lead.lang };
        const { error } = await client.from("mv_leads").insert(row);
        if (error && error.code !== "23505") console.warn("[MV] lead →", error.message); // 23505 = ya guardado
      } catch (e) { /* offline */ }
      return lead;
    },
    clearLocal() { localStorage.removeItem(LS.L); localStorage.removeItem(LS.C); localStorage.removeItem(LS.P); },
    async getProps() {
      return cloud(async c => {
        const { data, error } = await c.from("mv_properties").select("*").eq("published", true);
        if (error || !data || data.length === 0) throw new Error("fallback");
        return data;
      }, [], () => window.MV_DATA.PROPS);
    }
  };
})();
