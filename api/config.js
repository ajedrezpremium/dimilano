/* Milano Vigo v1.0 — API serverless para Vercel: expone env vars al frontend sin hardcodearlas */
export default function handler(req, res) {
  res.setHeader("Cache-Control", "max-age=0, no-store");
  res.status(200).json({
    SUPABASE_URL: process.env.MV_SUPABASE_URL || "",
    SUPABASE_ANON_KEY: process.env.MV_SUPABASE_ANON_KEY || ""
  });
}
