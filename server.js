import express from "express";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.post("/api/plan", async (req, res) => {
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

{"destinations":[{"city":"Lisbon","country":"Portugal","emoji":"🇵🇹","why":"One sentence why it fits their exact constraints.","flightTime":"7h","tempF":"77°F","pointsNeeded":"60k miles","coordinates":{"lat":38.7223,"lng":-9.1393},"outboundFlights":[{"airline":"United Airlines","route":"EWR → LIS","departure":"9:55 PM","arrival":"9:30 AM+1","points":"30,000 United miles","cash":"$5.60","bookUrl":"https://www.united.com/en/us/flights/deals/awards"}],"returnFlights":[{"airline":"TAP Air Portugal","route":"LIS → EWR","departure":"1:15 PM","arrival":"4:20 PM","points":"30,000 United miles","cash":"$5.60","bookUrl":"https://www.united.com/en/us/flights/deals/awards"}],"hotels":[{"name":"Andaz Lisbon","program":"World of Hyatt","pointsPerNight":"21,000 pts/night","cashRate":"~$280/night","bookUrl":"https://www.hyatt.com/andaz/lishr-andaz-lisbon"},{"name":"Sheraton Lisboa","program":"Marriott Bonvoy","pointsPerNight":"40,000 pts/night","cashRate":"~$200/night","bookUrl":"https://www.marriott.com"}],"actionSteps":["Transfer 60,000 Chase UR to United MileagePlus at chase.com/transfer","Book EWR to LIS nonstop on united.com using your United miles","Transfer 50,000 Chase UR to World of Hyatt for 2 free nights","Book Andaz Lisbon at hyatt.com using your Hyatt points"],"cashEstimate":"$400-600","unsplashQuery":"Lisbon Portugal city travel","localCosts":{"uber":"~$8","beer":"~$3","dinner":"~$20"}},{"city":"Split","country":"Croatia","emoji":"🇭🇷","why":"One sentence why it fits.","flightTime":"8h 45m","tempF":"79°F","pointsNeeded":"60k miles","coordinates":{"lat":43.5081,"lng":16.4402},"outboundFlights":[{"airline":"United Airlines","route":"EWR → SPU","departure":"6:00 PM","arrival":"10:30 AM+1","points":"30,000 United miles","cash":"$5.60","bookUrl":"https://www.united.com/en/us/flights/deals/awards"}],"returnFlights":[{"airline":"United Airlines","route":"SPU → EWR","departure":"1:00 PM","arrival":"5:30 PM","points":"30,000 United miles","cash":"$5.60","bookUrl":"https://www.united.com/en/us/flights/deals/awards"}],"hotels"[{"name":"Radisson Blu Split","program":"Radisson Rewards","pointsPerNight":"50,000 pts/night","cashRate":"~$180/night","bookUrl":"https://www.radissonhotels.com"}],"actionSteps":["Transfer 60,000 Chase UR to United MileagePlus","Book EWR to SPU nonstop on united.com","Pay cash for hotel — Split has limited points hotels","Budget ~$180/night for 4-star options"],"cashEstimate":"$500-700","unsplashQuery":"Split Croatia Adriatic coast","localCosts":{"uber":"~$6","beer":"~$3","dinner":"~$18"}},{"city":"Azores","country":"Portugal","emoji":"🇵🇹","why":"One sentence why it fits.","flightTime":"4h 30m","tempF":"68°F","pointsNeeded":"30k UR","coordinates":{"lat":37.7412,"lng":-25.6756},"outboundFlights":[{"airline":"United Airlines","route":"EWR → PDL","departure":"9:00 PM","arrival":"7:30 AM+1","points":"30,000 Chase UR via Aeroplan","cash":"$5.60","bookUrl":"https://www.united.com/en/us/flights/deals/awards"}],"returnFlights":[{"airline":"United Airlines","route":"PDL → EWR","departure":"1:00 PM","arrival":"3:30 PM","points":"30,000 Chase UR via Aeroplan","cash":"$5.60","bookUrl":"https://www.united.com/en/us/flights/deals/awards"}],"hotels":[{"name":"Terra Nostra Garden Hotel","program":"Cash only","pointsPerNight":"N/A","cashRate":"~$150/night","bookUrl":"https://www.terranostragardenhotel.com"}],"actionSteps":["Transfer 30,000 Chase UR to Aeroplan at chase.com/transfer","Book EWR to PDL nonstop on united.com","Pay cash for boutique hotels — Azores has limited chain options","Budget $150/night for excellent local properties"],"cashEstimate":"$300-450","unsplashQuery":"Azores Portugal volcanic island","localCosts":{"uber":"~$5","beer":"~$2","dinner":"~$15"}}]}

Use real data from your web search. Replace ALL example values with actual current information based on the user's specific request. The example JSON above is just the structure — fill it with real searched data. Return ONLY the JSON object, absolutely nothing else.`;

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
});

const PORT = 3001;

app.post("/api/itinerary", async (req, res) => {
  const { city, country, dates, vibe, travelers } = req.body;

  const prompt = `You are a travel planning API. Return ONLY valid JSON, no other text.

Generate a day-by-day itinerary for:
- Destination: ${city}, ${country}
- Dates: ${dates || "not specified"}
- Travelers: ${travelers || "Solo"}
- Vibe: ${vibe || "general sightseeing"}

Return this exact JSON structure:
{"days":[{"day":1,"date":"Jun 6","title":"Arrival & First Impressions","description":"2-3 sentences describing the day's activities, neighborhood to stay in, where to eat dinner."},{"day":2,"date":"Jun 7","title":"Day title","description":"Activities for the day."}]}

Generate the right number of days based on the dates. If it's a beach/resort trip keep days relaxed. If city trip make each day purposeful. Max 14 days. Return ONLY the JSON.`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });
    const textBlock = response.content.find(b => b.type === "text");
    let jsonText = textBlock.text.trim().replace(/^```json\n?/, "").replace(/^```\n?/, "").replace(/```$/, "").trim();
    const first = jsonText.indexOf("{");
    const last = jsonText.lastIndexOf("}");
    if (first !== -1 && last !== -1) jsonText = jsonText.slice(first, last + 1);
    res.json(JSON.parse(jsonText));
  } catch (err) {
    console.error("Itinerary error:", err.message);
    res.status(500).json({ error: "Could not generate itinerary" });
  }
});

app.listen(PORT, () => {
  console.log(`Waypoint server running on port ${PORT}`);
});