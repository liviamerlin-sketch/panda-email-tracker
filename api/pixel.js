export default async function handler(req, res) {
  const { id, seq = "1" } = req.query;
 
  if (id) {
    try {
      const KV_URL   = process.env.KV_REST_API_URL;
      const KV_TOKEN = process.env.KV_REST_API_TOKEN;
      const leadId   = Buffer.from(id, "base64").toString("utf8");
      const entry    = JSON.stringify({
        event: "open",
        seq,
        ts: Date.now(),
        ua: req.headers["user-agent"] || ""
      });
 
      await fetch(`${KV_URL}/rpush/${encodeURIComponent(`lead:${leadId}:events`)}/${encodeURIComponent(entry)}`, {
        headers: { Authorization: `Bearer ${KV_TOKEN}` }
      });
 
      await fetch(`${KV_URL}/incr/stats:open:total`, {
        headers: { Authorization: `Bearer ${KV_TOKEN}` }
      });
    } catch (e) {
      console.error("KV error:", e.message);
    }
  }
 
  const pixel = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");
  res.setHeader("Content-Type", "image/gif");
  res.setHeader("Cache-Control", "no-store, no-cache");
  res.send(pixel);
}
