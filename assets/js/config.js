/* Config Di Milano (dimilano.es)
   Supabase: URL+anon (la anon key es pública por diseño; el DELETE/SELECT de leads queda protegido por RLS).
   OpenRouter SOLO vía serverless (/api/chat) con env var OPENROUTER_API_KEY — nunca aquí.
   Marca y contacto oficiales (usados por compartir, footer y agente). */
window.MV_CONFIG = {
  SUPABASE_URL: "https://iovxhiidqpgadptqjtok.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvdnhoaWlkcXBnYWRwdHFqdG9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0OTY5OTQsImV4cCI6MjEwODA3Mjk5NH0.9KjgLW7Zw6qyW9G9awPZzMuHdqQnzHomC3Djye-FDwk"
};
window.MV_BRAND = {
  name: "Di Milano",
  agentName: "Milano Agent",
  site: "https://www.dimilano.es",
  logo: "https://www.dimilano.es/img/logo%20Di%20Milano.svg",
  telDisplay: "986 90 90 10",
  telRaw: "+34986909010",
  whatsapp: "+34660608404", // confirmado 21/10/2026 — WhatsApp Business
  whatsappDisplay: "660 60 84 04",
  emailGeneral: "info@dimilano.es",
  emailInmo: "inmobiliaria@dimilano.es",
  instagram: "https://www.instagram.com/dimilanovigo/",
  linkedin: "https://www.linkedin.com/company/di-milano-vigo/"
};
