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

  const prompt = `You are Waypoint, an expert AI travel planner specializing in points and miles optimization. You have a warm, knowledgeable tone — like a well-traveled friend who knows exactly how to use points.

The user has the following points balances:
${pointsSummary || "No points entered — focus on cash-efficient options"}

The user's trip request:
"${tripDescription}"

Search the web for current flight options, award availability, hotel options, and weather for the dates mentioned. Then provide exactly 3 destination recommendations.

For each destination:
1. A conversational opening line explaining why it fits perfectly
2. FLIGHT: Which points to use, which airline, approximate points cost, and departure info from their nearest airport
3. HOTEL: Which points program, specific property name, approximate points per night
4. TRANSFER BONUS: Any active transfer bonuses that apply right now
5. VIBE: 2-3 sentences on what it's actually like — beaches, bars, food, crowds
6. CASH ESTIMATE: Estimated total cash spend on top of points

Keep it conversational and specific. You're texting a friend, not writing a report. Use their actual points balances to give real redemption strategies. Be honest if a destination requires more points than they have.

End with: "Want me to dig deeper into any of these, or should I try different destinations?"`;

  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{ role: "user", content: prompt }],
    });

    for await (const chunk of stream) {
      if (
        chunk.type === "content_block_delta" &&
        chunk.delta?.type === "text_delta"
      ) {
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Waypoint server running on port ${PORT}`);
});