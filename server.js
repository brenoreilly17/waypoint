import express from "express";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const MOCK_MODE = false;

const MOCK_RESPONSE = {
  destinations: [
    {
      city: "Lisbon",
      country: "Portugal",
      emoji: "🇵🇹",
      why: "Aer Lingus flies nonstop BOS→LIS in August, bookable with Avios transferred from Amex MR — mild temps, world-class food scene, not overrun with tourists.",
      flightTime: "6h 45m",
      tempF: "82°F high / 65°F low",
      pointsNeeded: "26k Avios via Amex MR",
      coordinates: { lat: 38.7223, lng: -9.1393 },
      outboundFlights: [
        {
          airline: "Aer Lingus",
          route: "BOS → LIS",
          departure: "9:55 PM",
          arrival: "9:40 AM+1",
          points: "26,000 Aer Lingus Avios (transfer from Amex MR)",
          cash: "$5.60",
          bookingSteps: [
            "Transfer 26,000 Amex MR to Aer Lingus AerClub at americanexpress.com/rewards — transfers instantly",
            "Go to aerlingus.com, click Book with Avios, search BOS → LIS for Aug 8",
            "Select the nonstop flight and complete booking — pay ~$5.60 in taxes with any card"
          ]
        }
      ],
      returnFlights: [
        {
          airline: "Aer Lingus",
          route: "LIS → BOS",
          departure: "11:15 AM",
          arrival: "1:45 PM",
          points: "26,000 Aer Lingus Avios (transfer from Amex MR)",
          cash: "$5.60",
          bookingSteps: [
            "Use remaining Aer Lingus Avios balance from same transfer",
            "Go to aerlingus.com, search LIS → BOS for Aug 18, select nonstop and book with Avios"
          ]
        }
      ],
      hotels: [
        {
          name: "Hilton Lisbon",
          program: "Hilton Honors",
          pointsPerNight: "40,000 pts/night",
          cashRate: "~$180/night",
          bookUrl: "https://www.hilton.com/en/search/find-hotels/destination/lisbon-portugal/",
          bookingSteps: [
            "Go to hilton.com and search Lisbon for Aug 8–18",
            "Filter by Use Points, select Hilton Lisbon at 40,000 pts/night",
            "Your 120,000 Hilton points covers 3 free nights — pay cash for remaining nights at ~$180/night"
          ]
        },
        {
          name: "DoubleTree by Hilton Lisbon",
          program: "Hilton Honors",
          pointsPerNight: "30,000 pts/night",
          cashRate: "~$140/night",
          bookUrl: "https://www.hilton.com/en/search/find-hotels/destination/lisbon-portugal/",
          bookingSteps: [
            "Go to hilton.com, search Lisbon for Aug 8–18, filter by Use Points",
            "Select DoubleTree Lisbon at 30,000 pts/night — your 120,000 points covers 4 free nights here"
          ]
        }
      ],
      cashEstimate: "$1,200–1,600",
      localCosts: { uber: "~$8", beer: "~$2", dinner: "~$20" }
    },
    {
      city: "Edinburgh",
      country: "Scotland",
      emoji: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
      why: "Delta flies nonstop BOS→EDI in summer — redeem your Delta SkyMiles directly, cool August weather, incredible hiking and whisky scene.",
      flightTime: "6h 30m",
      tempF: "67°F high / 52°F low",
      pointsNeeded: "30k Delta SkyMiles",
      coordinates: { lat: 55.9533, lng: -3.1883 },
      outboundFlights: [
        {
          airline: "Delta Air Lines",
          route: "BOS → EDI",
          departure: "8:10 PM",
          arrival: "7:45 AM+1",
          points: "30,000 Delta SkyMiles",
          cash: "$5.60",
          bookingSteps: [
            "Go to delta.com, click Shop with Miles, search BOS → EDI for Aug 8",
            "Select the nonstop flight at 30,000 SkyMiles economy",
            "Pay ~$5.60 in taxes at checkout with any card"
          ]
        }
      ],
      returnFlights: [
        {
          airline: "Delta Air Lines",
          route: "EDI → BOS",
          departure: "10:30 AM",
          arrival: "1:15 PM",
          points: "30,000 Delta SkyMiles",
          cash: "$5.60",
          bookingSteps: [
            "Go to delta.com, search EDI → BOS for Aug 18",
            "Select nonstop and book with your remaining SkyMiles"
          ]
        }
      ],
      hotels: [
        {
          name: "Hilton Edinburgh Carlton",
          program: "Hilton Honors",
          pointsPerNight: "35,000 pts/night",
          cashRate: "~$160/night",
          bookUrl: "https://www.hilton.com/en/search/find-hotels/destination/edinburgh-scotland/",
          bookingSteps: [
            "Go to hilton.com, search Edinburgh for Aug 8–18, filter by Use Points",
            "Select Hilton Edinburgh Carlton at 35,000 pts/night",
            "Your 120,000 points covers 3 free nights — pay cash for remaining nights"
          ]
        },
        {
          name: "DoubleTree by Hilton Edinburgh",
          program: "Hilton Honors",
          pointsPerNight: "25,000 pts/night",
          cashRate: "~$120/night",
          bookUrl: "https://www.hilton.com/en/search/find-hotels/destination/edinburgh-scotland/",
          bookingSteps: [
            "Go to hilton.com, search Edinburgh for Aug 8–18, filter by Use Points",
            "Select DoubleTree Edinburgh at 25,000 pts/night — best value, covers nearly 5 nights"
          ]
        }
      ],
      cashEstimate: "$800–1,100",
      localCosts: { uber: "~$12", beer: "~$6", dinner: "~$30" }
    },
    {
      city: "Reykjavik",
      country: "Iceland",
      emoji: "🇮🇸",
      why: "Alaska Airlines flies BOS→KEF nonstop — redeem your Alaska miles for outstanding value, midnight sun in August, dramatic landscapes just outside the city.",
      flightTime: "5h 45m",
      tempF: "58°F high / 46°F low",
      pointsNeeded: "20k Alaska miles",
      coordinates: { lat: 64.1355, lng: -21.8954 },
      outboundFlights: [
        {
          airline: "Alaska Airlines",
          route: "BOS → KEF",
          departure: "6:30 PM",
          arrival: "5:50 AM+1",
          points: "20,000 Alaska Mileage Plan miles",
          cash: "$5.60",
          bookingSteps: [
            "Go to alaskaair.com, search BOS → KEF for Aug 8 using miles",
            "Select the nonstop Icelandair flight bookable with Alaska miles",
            "Pay ~$5.60 in taxes at checkout"
          ]
        }
      ],
      returnFlights: [
        {
          airline: "Alaska Airlines",
          route: "KEF → BOS",
          departure: "12:00 PM",
          arrival: "2:15 PM",
          points: "20,000 Alaska Mileage Plan miles",
          cash: "$5.60",
          bookingSteps: [
            "Go to alaskaair.com, search KEF → BOS for Aug 18",
            "Book return with remaining Alaska miles"
          ]
        }
      ],
      hotels: [
        {
          name: "Hilton Reykjavik Nordica",
          program: "Hilton Honors",
          pointsPerNight: "50,000 pts/night",
          cashRate: "~$220/night",
          bookUrl: "https://www.hilton.com/en/search/find-hotels/destination/reykjavik-iceland/",
          bookingSteps: [
            "Go to hilton.com, search Reykjavik for Aug 8–18, filter by Use Points",
            "Select Hilton Nordica at 50,000 pts/night — your 120,000 points covers 2 free nights"
          ]
        },
        {
          name: "Canopy by Hilton Reykjavik City Centre",
          program: "Hilton Honors",
          pointsPerNight: "40,000 pts/night",
          cashRate: "~$180/night",
          bookUrl: "https://www.hilton.com/en/search/find-hotels/destination/reykjavik-iceland/",
          bookingSteps: [
            "Go to hilton.com, search Reykjavik Aug 8–18, filter by Use Points",
            "Select Canopy Hilton at 40,000 pts/night — 3 free nights with your balance"
          ]
        }
      ],
      cashEstimate: "$1,400–1,800",
      localCosts: { uber: "~$18", beer: "~$12", dinner: "~$45" }
    }
  ]
};

const app = express();
app.use(cors());
app.use(express.json());

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.post("/api/plan", async (req, res) => {
  if (MOCK_MODE) {
    await new Promise(r => setTimeout(r, 2000));
    return res.json(MOCK_RESPONSE);
  }

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
  * Amex MR → Aer Lingus Avios, Air Canada Aeroplan, ANA, British Airways Avios, Air France/KLM Flying Blue, Cathay Pacific Asia Miles, Delta SkyMiles, Emirates, Etihad, Hawaiian, Iberia Avios, JetBlue, Qantas, Singapore KrisFlyer, Virgin Atlantic, Hilton Honors, Marriott Bonvoy
  * Chase UR → United MileagePlus, Aer Lingus Avios, Air Canada Aeroplan, Air France/KLM Flying Blue, British Airways Avios, Emirates, Iberia Avios, Singapore KrisFlyer, Southwest, Virgin Atlantic, World of Hyatt, Marriott Bonvoy
  * Capital One → Air Canada Aeroplan, Air France/KLM Flying Blue, Avianca LifeMiles, British Airways Avios, Cathay Pacific, Emirates, Etihad, Finnair, Qantas, Singapore KrisFlyer, TAP Air Portugal, Turkish Miles&Smiles, Wyndham Rewards
  * Bilt → Air Canada Aeroplan, Alaska Mileage Plan, American AAdvantage, British Airways Avios, Air France/KLM Flying Blue, Cathay Pacific, Emirates, Hawaiian, World of Hyatt, IHG One Rewards, Marriott Bonvoy, United MileagePlus, Virgin Atlantic
  * Citi ThankYou → Avianca LifeMiles, Cathay Pacific, Air France/KLM Flying Blue, JetBlue, Qantas, Singapore KrisFlyer, Turkish Miles&Smiles, Virgin Atlantic, Wyndham Rewards
  * Marriott Bonvoy → 40+ airlines at 3:1 ratio (60k Bonvoy = 25k airline miles)
- bookingSteps must ONLY reference programs the user actually has
- bookingSteps are booking steps ONLY — no sightseeing, no travel tips
- cashEstimate must be a SHORT NUMBER ONLY like "$800-1,200" — never a sentence or explanation
- tempF must include both high AND low
- Always return exactly 2 hotels per destination
- Never return N/A for points — if you can't find a points redemption pick a different destination
- Never return "cash only" — always find a valid transfer path

Trip request: "${tripDescription}"

Search the web for real nonstop flights, award availability, hotels, and weather.

Return ONLY this JSON:
{"destinations":[{"city":"Lisbon","country":"Portugal","emoji":"🇵🇹","why":"One sentence why this fits using their actual points.","flightTime":"7h","tempF":"82°F high / 65°F low","pointsNeeded":"26k Avios via Amex MR","coordinates":{"lat":38.7223,"lng":-9.1393},"outboundFlights":[{"airline":"Aer Lingus","route":"BOS → LIS","departure":"9:55 PM","arrival":"9:40 AM+1","points":"26,000 Aer Lingus Avios (transfer from Amex MR)","cash":"$5.60","bookingSteps":["Transfer 26,000 Amex MR to Aer Lingus AerClub at americanexpress.com/rewards","Go to aerlingus.com, search BOS to LIS, select nonstop, pay ~$5.60 in taxes"]}],"returnFlights":[{"airline":"Aer Lingus","route":"LIS → BOS","departure":"11:15 AM","arrival":"1:45 PM","points":"26,000 Aer Lingus Avios","cash":"$5.60","bookingSteps":["Search LIS to BOS on aerlingus.com for return date","Book with remaining Avios balance"]}],"hotels":[{"name":"Hilton Lisbon","program":"Hilton Honors","pointsPerNight":"40,000 pts/night","cashRate":"~$180/night","bookUrl":"https://www.hilton.com","bookingSteps":["Go to hilton.com, search Lisbon for your dates, filter by Use Points","Select Hilton Lisbon at 40,000 pts/night and complete booking"]},{"name":"DoubleTree Lisbon","program":"Hilton Honors","pointsPerNight":"30,000 pts/night","cashRate":"~$140/night","bookUrl":"https://www.hilton.com","bookingSteps":["Go to hilton.com, search Lisbon, filter by Use Points","Select DoubleTree at 30,000 pts/night — better value for your balance"]}],"cashEstimate":"$1,200–1,600","localCosts":{"uber":"~$8","beer":"~$2","dinner":"~$20"}}]}

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
    console.error("Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/itinerary", async (req, res) => {
  const { city, country, dates, vibe, travelers } = req.body;
  const prompt = `Generate a day-by-day itinerary for ${city}, ${country}. Dates: ${dates}. Travelers: ${travelers}. Vibe: ${vibe}. Return ONLY JSON: {"days":[{"day":1,"date":"Aug 8","title":"Arrival & First Impressions","description":"2-3 sentences about the day."}]}`;
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
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Waypoint server running on port ${PORT}`));