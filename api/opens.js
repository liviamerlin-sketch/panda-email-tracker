export default async function handler(req, res) {
  const { id } = req.query;
 
  if (!id) {
    return res.status(400).json({ error: "id obrigatorio" });
  }
 
  try {
    const KV_URL   = process.env.KV_REST_API_URL;
    const KV_TOKEN = process.env.KV_REST_API_TOKEN;
    const leadId   = Buffer.from(id, "base64").toString("utf8");
 
    const response = await fetch(
      `${KV_URL}/llen/${encodeURIComponent(`lead:${leadId}:events`)}`,
      { headers: { Authorization: `Bearer ${KV_TOKEN}` } }
    );
 
    const data = await response.json();
    const count = data.result || 0;
 
    return res.status(200).json({
      email:  leadId,
      opened: count > 0,
      opens:  count,
    });
  } catch (e) {
    console.error("KV error:", e.message);
    return res.status(500).json({ error: "Erro ao consultar KV" });
  }
}
 
