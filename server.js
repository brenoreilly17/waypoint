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

  const prompt = `You are Waypoint, an expert in loyalty points and travel optimization.

The user's points balances:
${pointsSummary || "No points entered"}

Their trip request:
"${tripDescription}"

Search the web for nonstop flights, award availability, hotel options, and weather for the dates and airports mentioned.

Return ONLY a valid JSON object with NO markdown, no backticks, no explanation. Just raw JSON in exactly this structure:

{
  "destinations": [
    {
      "city": "Lisbon",
      "country": "Portugal",
      "emoji": "🇵🇹",
      "why": "One sentence why this fits their exact constraints",
      "flightTime": "7h",
      "tempF": "75°F",
      "pointsNeeded": "60k miles",
      "coordinates": { "lat": 38.7223, "lng": -9.1393 },
      "outboundFlights": [
        {
          "airline": "United Airlines",
          "route": "EWR → LIS",
          "departure": "9:55 PM",
          "arrival": "9:30 AM+1",
          "points": "30,000 United miles",
          "cash": "$5.60",
          "bookUrl": "https://www.united.com/en/us/flights/deals/awards"
        }
      ],
      "returnFlights": [
        {
          "airline": "TAP Air Portugal",
          "route": "LIS → EWR",
          "departure": "1:15 PM",
          "arrival": "4:20 PM",
          "points": "30,000 United miles",
          "cash": "$5.60",
          "bookUrl": "https://www.united.com/en/us/flights/deals/awards"
        }
      ],
      "hotels": [
        {
          "name": "Andaz Lisbon",
          "program": "World of Hyatt",
          "pointsPerNight": "21,000–25,000 pts/night",
          "cashRate": "~$280/night",
          "bookUrl": "https://www.hyatt.com/andaz/lishr-andaz-lisbon"
        }
      ],
      "actionSteps": [
        "Transfer 60,000 Chase UR → United MileagePlus at chase.com/transfer",
        "Book EWR→LIS nonstop on united.com using your United miles",
        "Transfer 100,000 Chase UR → World of Hyatt for 4 free nights",
        "Book Andaz Lisbon at hyatt.com using your Hyatt points"
      ],
      "cashEstimate": "$400–600",
      "unsplashQuery": "Lisbon Portugal"
    }
  ]
}

Return exactly 3 destinations. Be specific with real flight times, real hotel names, and real booking URLs. Use the user's actual points balances to calculate what they can afford. Keep actionSteps to 4 steps max.`;

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

    const data = JSON.parse(jsonText);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Waypoint server running on port ${PORT}`);
});