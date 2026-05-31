import { useState, useRef, useEffect } from "react";

const POINTS_DATA = {
  bank: [
    { id: "chase_ur", name: "Chase Ultimate Rewards" },
    { id: "amex_mr", name: "Amex Membership Rewards" },
    { id: "citi_ty", name: "Citi ThankYou Points" },
    { id: "capital_one", name: "Capital One Miles" },
    { id: "bilt", name: "Bilt Rewards" },
  ],
  airline: [
    { id: "united", name: "United MileagePlus" },
    { id: "american", name: "American AAdvantage" },
    { id: "delta", name: "Delta SkyMiles" },
    { id: "turkish", name: "Turkish Miles&Smiles" },
    { id: "jetblue", name: "JetBlue TrueBlue" },
    { id: "alaska", name: "Alaska Mileage Plan" },
    { id: "aeroplan", name: "Air Canada Aeroplan" },
    { id: "flying_blue", name: "Flying Blue (AF/KLM)" },
    { id: "ba_avios", name: "British Airways Avios" },
    { id: "iberia", name: "Iberia Avios" },
    { id: "virgin", name: "Virgin Atlantic" },
    { id: "southwest", name: "Southwest Rapid Rewards" },
  ],
  hotel: [
    { id: "marriott", name: "Marriott Bonvoy" },
    { id: "hyatt", name: "World of Hyatt" },
    { id: "hilton", name: "Hilton Honors" },
    { id: "ihg", name: "IHG One Rewards" },
    { id: "wyndham", name: "Wyndham Rewards" },
  ],
};

const styles = {
  page: {
    background: "#0a0a0a",
    minHeight: "100vh",
    fontFamily: "'Inter', system-ui, sans-serif",
    color: "#f5f5f5",
  },
  container: {
    maxWidth: "520px",
    margin: "0 auto",
    padding: "48px 24px",
  },
  logo: {
    fontSize: "13px",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "#444",
    marginBottom: "40px",
  },
  heading: {
    fontSize: "28px",
    fontWeight: "300",
    letterSpacing: "-0.02em",
    color: "#f5f5f5",
    marginBottom: "8px",
  },
  subheading: {
    fontSize: "14px",
    color: "#555",
    marginBottom: "32px",
    lineHeight: "1.6",
  },
  tabs: {
    display: "flex",
    gap: "6px",
    marginBottom: "24px",
  },
  tab: (active) => ({
    padding: "6px 16px",
    borderRadius: "100px",
    border: `0.5px solid ${active ? "#f5f5f5" : "#222"}`,
    background: active ? "#f5f5f5" : "transparent",
    color: active ? "#0a0a0a" : "#555",
    fontSize: "12px",
    fontWeight: active ? "500" : "400",
    cursor: "pointer",
    fontFamily: "'Inter', system-ui, sans-serif",
    transition: "all 0.15s",
  }),
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "0.5px solid #161616",
  },
  label: (hasValue) => ({
    fontSize: "13px",
    color: hasValue ? "#f5f5f5" : "#444",
    transition: "color 0.15s",
  }),
  input: {
    background: "transparent",
    border: "none",
    color: "#f5f5f5",
    fontSize: "13px",
    fontFamily: "'Inter', system-ui, sans-serif",
    textAlign: "right",
    width: "120px",
    outline: "none",
    padding: "4px 0",
  },
  continueBtn: {
    width: "100%",
    padding: "15px",
    background: "#f5f5f5",
    color: "#0a0a0a",
    border: "none",
    borderRadius: "100px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    marginTop: "32px",
    fontFamily: "'Inter', system-ui, sans-serif",
    letterSpacing: "0.02em",
  },
  skipText: {
    textAlign: "center",
    fontSize: "12px",
    color: "#333",
    marginTop: "16px",
    cursor: "pointer",
  }
};

function PointsInput({ onContinue }) {
  const [activeTab, setActiveTab] = useState("bank");
  const [points, setPoints] = useState({});

  const handleChange = (id, value) => {
    const cleaned = value.replace(/[^0-9]/g, "");
    setPoints(prev => ({ ...prev, [id]: cleaned }));
  };

  const formatDisplay = (val) => {
    if (!val) return "";
    return parseInt(val).toLocaleString();
  };

  const currentPrograms = POINTS_DATA[activeTab];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.logo}>Waypoint</div>

        <h1 style={styles.heading}>Your points balances</h1>
        <p style={styles.subheading}>
          Enter what you have. Skip anything at zero — we'll only use what you tell us.
        </p>

        {/* Tabs */}
        <div style={styles.tabs}>
          {["bank", "airline", "hotel"].map(tab => (
            <button
              key={tab}
              style={styles.tab(activeTab === tab)}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Points rows */}
        <div>
          {currentPrograms.map(program => (
            <div key={program.id} style={styles.row}>
              <span style={styles.label(!!points[program.id])}>
                {program.name}
              </span>
              <input
                style={styles.input}
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={formatDisplay(points[program.id])}
                onChange={e => handleChange(program.id, e.target.value)}
              />
            </div>
          ))}
        </div>

        <button
          style={styles.continueBtn}
          onClick={() => onContinue(points)}
          onMouseEnter={e => e.target.style.opacity = "0.85"}
          onMouseLeave={e => e.target.style.opacity = "1"}
        >
          Continue →
        </button>

        <p style={styles.skipText} onClick={() => onContinue({})}>
          Skip — I'll just describe my trip
        </p>

      </div>
    </div>
  );
}

function Landing({ onStart }) {
  return (
    <div style={{
      background: "#0a0a0a",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', system-ui, sans-serif",
      padding: "24px"
    }}>
      <div style={{
        fontSize: "13px",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: "#444",
        marginBottom: "48px"
      }}>
        Waypoint
      </div>

      <h1 style={{
        fontSize: "clamp(36px, 6vw, 64px)",
        fontWeight: "300",
        color: "#f5f5f5",
        textAlign: "center",
        lineHeight: "1.15",
        letterSpacing: "-0.02em",
        marginBottom: "20px",
        maxWidth: "700px"
      }}>
        Travel anywhere.<br />
        <span style={{ color: "#666" }}>Pay almost nothing.</span>
      </h1>

      <p style={{
        fontSize: "16px",
        color: "#555",
        textAlign: "center",
        lineHeight: "1.7",
        maxWidth: "440px",
        marginBottom: "48px",
      }}>
        Tell us your points balances and what you're looking for. We'll find the best destination and show you exactly how to get there.
      </p>

      <button
        style={{
          background: "#f5f5f5",
          color: "#0a0a0a",
          border: "none",
          padding: "15px 36px",
          borderRadius: "100px",
          fontSize: "14px",
          fontWeight: "500",
          cursor: "pointer",
          letterSpacing: "0.02em",
        }}
        onClick={onStart}
        onMouseEnter={e => e.target.style.opacity = "0.85"}
        onMouseLeave={e => e.target.style.opacity = "1"}
      >
        Plan my trip →
      </button>

      <p style={{
        marginTop: "32px",
        fontSize: "12px",
        color: "#333",
        letterSpacing: "0.05em"
      }}>
        Free to try · No credit card required
      </p>
    </div>
  );
}

function Chat({ points, onBack }) {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: `Hey! Tell me about the trip you're looking for — dates, vibe, where you're flying from, weather preferences, budget. The more you share the better.\n\nFor example: "June 6–22, flying EWR, nonstop only, no earlier than 8am. Want somewhere mild, beach access, good food, not too touristy. Solo, $1k cash max, rest on points."`
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const pointsSummary = Object.entries(points)
    .filter(([_, v]) => parseInt(v) > 0)
    .map(([k, v]) => `${k}: ${parseInt(v).toLocaleString()}`)
    .join(", ");

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);

    const aiMessage = { role: "ai", text: "" };
    setMessages(prev => [...prev, aiMessage]);

    try {
      const response = await fetch("http://localhost:3001/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points, tripDescription: userMessage }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "ai",
                  text: updated[updated.length - 1].text + parsed.text
                };
                return updated;
              });
            }
          } catch (e) {}
        }
      }
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "ai",
          text: "Something went wrong. Please try again."
        };
        return updated;
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={{
      background: "#0a0a0a",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 24px",
        borderBottom: "0.5px solid #1a1a1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <span style={{ fontSize: "13px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#444" }}>
          Waypoint
        </span>
        <span
          onClick={onBack}
          style={{ fontSize: "12px", color: "#444", cursor: "pointer" }}
        >
          ← Back
        </span>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        maxWidth: "680px",
        width: "100%",
        margin: "0 auto",
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex",
            flexDirection: msg.role === "user" ? "row-reverse" : "row",
            gap: "10px",
            alignItems: "flex-start",
          }}>
            {/* Avatar */}
            <div style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: msg.role === "ai" ? "#1a1a1a" : "#1a2a1a",
              border: `0.5px solid ${msg.role === "ai" ? "#222" : "#2a3a2a"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              color: msg.role === "ai" ? "#666" : "#6a9a6a",
              flexShrink: 0,
            }}>
              {msg.role === "ai" ? "W" : "B"}
            </div>

            {/* Bubble */}
            <div style={{
              maxWidth: "80%",
              padding: "12px 16px",
              borderRadius: "16px",
              borderTopLeftRadius: msg.role === "ai" ? "4px" : "16px",
              borderTopRightRadius: msg.role === "user" ? "4px" : "16px",
              background: msg.role === "ai" ? "#111" : "#1a2a1a",
              border: `0.5px solid ${msg.role === "ai" ? "#1e1e1e" : "#2a3a2a"}`,
              fontSize: "14px",
              lineHeight: "1.7",
              color: msg.role === "ai" ? "#ccc" : "#a0c0a0",
              whiteSpace: "pre-wrap",
            }}>
              {msg.text}
              {msg.role === "ai" && loading && i === messages.length - 1 && msg.text === "" && (
                <span style={{ color: "#444" }}>thinking...</span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "16px 24px",
        borderTop: "0.5px solid #1a1a1a",
        display: "flex",
        gap: "10px",
        alignItems: "flex-end",
        maxWidth: "680px",
        width: "100%",
        margin: "0 auto",
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Describe your trip..."
          rows={1}
          style={{
            flex: 1,
            background: "#111",
            border: "0.5px solid #222",
            borderRadius: "20px",
            padding: "10px 16px",
            color: "#f5f5f5",
            fontSize: "14px",
            fontFamily: "'Inter', system-ui, sans-serif",
            outline: "none",
            resize: "none",
            lineHeight: "1.5",
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            background: loading || !input.trim() ? "#1a1a1a" : "#f5f5f5",
            border: "none",
            cursor: loading || !input.trim() ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: "16px",
          }}
        >
          ↑
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [points, setPoints] = useState({});

  const handleStart = () => setScreen("points");
  const handlePointsContinue = (pointsData) => {
    setPoints(pointsData);
    setScreen("chat");
  };

  return (
    <div>
      {screen === "landing" && <Landing onStart={handleStart} />}
      {screen === "points" && <PointsInput onContinue={handlePointsContinue} />}
      {screen === "chat" && (
        <Chat points={points} onBack={() => setScreen("points")} />
      )}
    </div>
  );
}