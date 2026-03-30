export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const KV_URL   = process.env.KV_REST_API_URL;
  const KV_TOKEN = process.env.KV_REST_API_TOKEN;

  if (!KV_URL || !KV_TOKEN) {
    return res.status(500).json({ error: "KV not configured" });
  }

  try {
    // Busca total de abertos
    const totalRes = await fetch(`${KV_URL}/get/stats:open:total`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` }
    });
    const totalData = await totalRes.json();
    const totalAbertos = parseInt(totalData.result || "0");

    // Busca lista de leads que abriram
    const keysRes = await fetch(`${KV_URL}/keys/lead:*:events`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` }
    });
    const keysData = await keysRes.json();
    const keys = keysData.result || [];

    // Monta CSV
    const rows = ["nome,empresa,email,status,data envio"];
    for (const key of keys) {
      const email = key.replace("lead:", "").replace(":events", "");
      const eventsRes = await fetch(`${KV_URL}/lrange/${encodeURIComponent(key)}/0/-1`, {
        headers: { Authorization: `Bearer ${KV_TOKEN}` }
      });
      const eventsData = await eventsRes.json();
      const events = eventsData.result || [];
      if (events.length > 0) {
        const first = JSON.parse(events[0]);
        const date = new Date(first.ts).toLocaleDateString("pt-BR");
        rows.push(`—,—,${email},aberto,${date}`);
      }
    }

    res.status(200).json({
      content: rows.join("\n"),
      totalAbertos,
      totalLeads: keys.length
    });

  } catch (e) {
    console.error("log error:", e.message);
    res.status(500).json({ error: e.message });
  }
}
