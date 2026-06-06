const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { city, country, dates, vibe, travelers } = req.body;

  const prompt = `You are a travel planning API. Return ONLY valid JSON, no other text.

Generate a day-by-day itinerary for:
- Destination: ${city}, ${country}
- Dates: ${dates || "not specified"}
- Travelers: ${travelers || "Solo"}
- Vibe: ${vibe || "general sightseeing"}

Return this exact JSON structure:
{"days":[{"day":1,"date":"Jun 6","title":"Arrival & First Impressions","description":"2-3 sentences describing the day."},{"day":2,"date":"Jun 7","title":"Day title","description":"Activities for the day."}]}

Generate the right number of days based on the dates. Max 14 days. Return ONLY the JSON.`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = response.content.find(b => b.type === "text");
    let jsonText = textBlock.text.trim()
      .replace(/^```json\n?/, "").replace(/^```\n?/, "").replace(/```$/, "").trim();
    const first = jsonText.indexOf("{");
    const last = jsonText.lastIndexOf("}");
    if (first !== -1 && last !== -1) jsonText = jsonText.slice(first, last + 1);
    res.json(JSON.parse(jsonText));
  } catch (err) {
    console.error("Itinerary error:", err.message);
    res.status(500).json({ error: err.message });
  }
};