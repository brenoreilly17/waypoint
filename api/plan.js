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

  const { points, tripDescription } = req.body;

  const pointsSummary = Object.entries(points || {})
    .filter(([_, v]) => parseInt(v) > 0)
    .map(([k, v]) => `${k}: ${parseInt(v).toLocaleString()}`)
    .join("\n");

  const prompt = `You are Waypoint, a travel planning API. Respond with ONLY a valid JSON object — no text, no markdown, no backticks.

THE USER HAS ONLY THESE LOYALTY POINTS. DO NOT REFERENCE ANY OTHER PROGRAM:
${pointsSummary || "No points — recommend cash only"}

STRICT RULES:
- ONLY recommend flights bookable with the programs listed above or their transfer partners
- ONLY recommend hotels bookable with the hotel programs listed above
- If a program is not listed, the user does not have it — do not mention it
- Transfer partners you may suggest ONLY if the base program is listed:
  * Capital One → Aeroplan, Turkish, Avianca, British Airways, Air France/KLM, Flying Blue, Singapore, Wyndham
  * Chase UR → United, Hyatt, Marriott, British Airways, Air France/KLM, Singapore, Southwest, Aer Lingus
  * Amex MR → Delta, British Airways, Air France/KLM, Singapore, ANA, Emirates, Hilton, Marriott
  * Bilt → United, American, Hyatt, Air Canada, Alaska
  * Marriott Bonvoy → airlines at 3:1 ratio (60k = 25k miles)
  * Citi ThankYou → Air France/KLM, Singapore, Turkish, Avianca, Cathay
- bookingSteps must ONLY reference programs the user actually has
- bookingSteps are ONLY about transferring points and booking — NO sightseeing tips, NO travel advice
- Each destination needs exactly 2 bookingSteps arrays: one for the flight, one for the hotel
- tempF must include both high AND low (e.g. "77°F high / 63°F low")
- pointsNeeded must specify which program and transfer path (e.g. "60k Capital One → Aeroplan")

Trip request: "${tripDescription}"

Search the web for real nonstop flights, award availability, hotels, and weather.

Return ONLY this JSON:
{"destinations":[{"city":"Lisbon","country":"Portugal","emoji":"🇵🇹","why":"One sentence why this fits using their actual points.","flightTime":"7h","tempF":"77°F high / 63°F low","pointsNeeded":"60k Capital One → Aeroplan","coordinates":{"lat":38.7223,"lng":-9.1393},"outboundFlights":[{"airline":"United Airlines","route":"EWR → LIS","departure":"9:55 PM","arrival":"9:30 AM+1","points":"30,000 Aeroplan (transfer from Capital One)","cash":"$5.60","bookingSteps":["Transfer 30,000 Capital One miles to Aeroplan at capitalone.com/rewards — transfers instantly","Go to aeroplan.com, search EWR to LIS on your departure date, select United flight, pay ~$5.60 in taxes"]}],"returnFlights":[{"airline":"TAP Air Portugal","route":"LIS → EWR","departure":"1:15 PM","arrival":"4:20 PM","points":"30,000 Aeroplan (transfer from Capital One)","cash":"$5.60","bookingSteps":["Search LIS to EWR on aeroplan.com on your return date","Select TAP Air Portugal flight and complete booking with your Aeroplan miles"]}],"hotels":[{"name":"Sheraton Lisboa","program":"Marriott Bonvoy","pointsPerNight":"40,000 pts/night","cashRate":"~$200/night","bookUrl":"https://www.marriott.com","bookingSteps":["Go to marriott.com and search Sheraton Lisboa for your dates","Filter by Use Points, select your room, confirm at checkout — 5th night free on award stays of 5+ nights"]}],"cashEstimate":"$400-600","unsplashQuery":"Lisbon Portugal city travel","localCosts":{"uber":"~$8","beer":"~$3","dinner":"~$20"}}]}

Replace ALL example values with real searched data. Return ONLY the JSON.`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = response.content.find(b => b.type === "text");
    if (!textBlock) return res.status(500).json({ error: "No response from AI" });

    let jsonText = textBlock.text.trim()
      .replace(/^```json\n?/, "").replace(/^```\n?/, "").replace(/```$/, "").trim();
    const firstBrace = jsonText.indexOf("{");
    const lastBrace = jsonText.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) jsonText = jsonText.slice(firstBrace, lastBrace + 1);

    res.json(JSON.parse(jsonText));
  } catch (err) {
    console.error("Plan error:", err.message);
    res.status(500).json({ error: err.message });
  }
};