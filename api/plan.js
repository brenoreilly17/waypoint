import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { points, tripDescription } = req.body;

  const pointsSummary = Object.entries(points)
    .filter(([_, v]) => parseInt(v) > 0)
    .map(([k, v]) => `${k}: ${parseInt(v).toLocaleString()}`)
    .join("\n");

  const prompt = `You are Waypoint, a travel planning API. You MUST respond with ONLY a valid JSON object — no text before it, no text after it, no markdown, no backticks, no explanation whatsoever. If you add anything other than raw JSON, the application will break.

The user's points balances:
${pointsSummary || "No points entered"}

Their trip request:
"${tripDescription}"

Search the web for nonstop flights, award availability, hotel options, and weather for the dates and airports mentioned.

Return ONLY this exact JSON structure with exactly 3 destinations:

{"destinations":[{"city":"Lisbon","country":"Portugal","emoji":"🇵🇹","why":"One sentence why it fits their exact constraints.","flightTime":"7h","tempF":"77°F","pointsNeeded":"60k miles","coordinates":{"lat":38.7223,"lng":-9.1393},"outboundFlights":[{"airline":"United Airlines","route":"EWR → LIS","departure":"9:55 PM","arrival":"9:30 AM+1","points":"30,000 United miles","cash":"$5.60","bookUrl":"https://www.united.com/en/us/flights/deals/awards"}],"returnFlights":[{"airline":"TAP Air Portugal","route":"LIS → EWR","departure":"1:15 PM","arrival":"4:20 PM","points":"30,000 United miles","cash":"$5.60","bookUrl":"https://www.united.com/en/us/flights/deals/awards"}],"hotels":[{"name":"Andaz Lisbon","program":"World of Hyatt","pointsPerNight":"21,000 pts/night","cashRate":"~$280/night","bookUrl":"https://www.hyatt.com/andaz/lishr-andaz-lisbon"},{"name":"Sheraton Lisboa","program":"Marriott Bonvoy","pointsPerNight":"40,000 pts/night","cashRate":"~$200/night","bookUrl":"https://www.marriott.com"}],"actionSteps":["Transfer 60,000 Chase UR to United MileagePlus at chase.com/transfer","Book EWR to LIS nonstop on united.com using your United miles","Transfer 50,000 Chase UR to World of Hyatt for 2 free nights","Book Andaz Lisbon at hyatt.com using your Hyatt points"],"cashEstimate":"$400-600","unsplashQuery":"Lisbon Portugal city travel","localCosts":{"uber":"~$8","beer":"~$3","dinner":"~$20"}}]}

Use real data from your web search. Replace ALL example values with actual current information based on the user's specific request. Return ONLY the JSON object, nothing else.`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = response.content.find(b => b.type === "text");
    if (!textBlock) {
      return res.status(500).json({ error: "No response from AI" });
    }

    let jsonText = textBlock.text.trim();
    jsonText = jsonText.replace(/^```json\n?/, "").replace(/^```\n?/, "").replace(/```$/, "").trim();
    const firstBrace = jsonText.indexOf("{");
    const lastBrace = jsonText.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonText = jsonText.slice(firstBrace, lastBrace + 1);
    }

    const data = JSON.parse(jsonText);
    res.json(data);
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Something went wrong: " + err.message });
  }
}