const https = require("https");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

function registrarAbertura(leadId, ip, userAgent, step) {
  return new Promise((resolve) => {
    const body = JSON.stringify({
      lead_id: leadId,
      ip: ip,
      user_agent: userAgent,
      step: parseInt(step) || 0,
      aberto_em: new Date().toISOString()
    });

    const url = new URL(`${SUPABASE_URL}/rest/v1/email_opens`);

    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Length": Buffer.byteLength(body),
        "Prefer": "return=minimal"
      }
    }, (res) => {
      res.on("data", () => {});
      res.on("end", () => resolve());
    });

    req.on("error", () => resolve());
    req.write(body);
    req.end();
  });
}

module.exports = async (req, res) => {
  const { leadId } = req.query;
  const step = req.query.step || "0";
  const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "";
  const userAgent = req.headers["user-agent"] || "";

  registrarAbertura(leadId, ip, userAgent, step).catch(() => {});

  const pixel = Buffer.from(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "base64"
  );

  res.setHeader("Content-Type", "image/gif");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.end(pixel);
};
