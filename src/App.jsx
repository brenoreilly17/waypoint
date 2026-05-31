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

async function getSunTimes(lat, lng, date) {
  try {
    const res = await fetch(
      `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=${date}&formatted=0`
    );
    const data = await res.json();
    const fmt = (iso) => {
      const d = new Date(iso);
      return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    };
    return { sunrise: fmt(data.results.sunrise), sunset: fmt(data.results.sunset) };
  } catch {
    return { sunrise: "6:00 AM", sunset: "8:30 PM" };
  }
}

function Landing({ onStart }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", fontFamily: "'Inter', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <nav style={{ padding: "20px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "0.5px solid #1a1a1a" }}>
        <span style={{ fontSize: "15px", fontWeight: "600", letterSpacing: "-0.02em", color: "#f5f5f5" }}>Waypoint</span>
        <button onClick={onStart} style={{ padding: "8px 20px", background: "#f5f5f5", color: "#0a0a0a", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}
          onMouseEnter={e => e.target.style.opacity = "0.85"} onMouseLeave={e => e.target.style.opacity = "1"}>
          Get started
        </button>
      </nav>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#1a1a1a", border: "0.5px solid #2a2a2a", borderRadius: "100px", padding: "5px 14px", fontSize: "12px", color: "#666", marginBottom: "32px" }}>
          <span style={{ color: "#c8a96e" }}>✦</span> AI-powered points optimization
        </div>
        <h1 style={{ fontSize: "clamp(40px, 7vw, 80px)", fontWeight: "700", letterSpacing: "-0.04em", lineHeight: "1.05", color: "#f5f5f5", maxWidth: "800px", marginBottom: "24px" }}>
          Your points.<br /><span style={{ color: "#c8a96e" }}>Your next trip.</span>
        </h1>
        <p style={{ fontSize: "18px", color: "#555", maxWidth: "480px", lineHeight: "1.65", marginBottom: "40px" }}>
          Tell us your points and when you want to travel. We'll pick the destination and plan everything — flights, hotels, how to book it all for free.
        </p>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button onClick={onStart} style={{ padding: "14px 28px", background: "#f5f5f5", color: "#0a0a0a", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "500", cursor: "pointer" }}
            onMouseEnter={e => e.target.style.opacity = "0.85"} onMouseLeave={e => e.target.style.opacity = "1"}>
            Plan my trip →
          </button>
          <span style={{ fontSize: "13px", color: "#444" }}>Free to try</span>
        </div>
        <div style={{ display: "flex", gap: "48px", marginTop: "80px", paddingTop: "48px", borderTop: "0.5px solid #1a1a1a" }}>
          {[{ number: "30+", label: "Loyalty programs" }, { number: "150+", label: "Airlines & hotels" }, { number: "$0", label: "Hidden fees" }].map(stat => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: "700", letterSpacing: "-0.03em", color: "#f5f5f5", marginBottom: "4px" }}>{stat.number}</div>
              <div style={{ fontSize: "13px", color: "#555" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <nav style={{ padding: "20px 48px", borderBottom: "0.5px solid #1a1a1a", display: "flex", alignItems: "center" }}>
        <span style={{ fontSize: "15px", fontWeight: "600", letterSpacing: "-0.02em", color: "#f5f5f5" }}>Waypoint</span>
      </nav>
      <div style={{ maxWidth: "520px", margin: "0 auto", padding: "56px 24px", width: "100%" }}>
        <div style={{ fontSize: "12px", fontWeight: "500", color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px" }}>Step 1 of 2</div>
        <h1 style={{ fontSize: "32px", fontWeight: "700", letterSpacing: "-0.03em", color: "#f5f5f5", marginBottom: "8px" }}>Your points balances</h1>
        <p style={{ fontSize: "15px", color: "#555", marginBottom: "36px", lineHeight: "1.5" }}>Enter what you have. Skip anything at zero.</p>
        <div style={{ display: "flex", gap: "4px", marginBottom: "24px", background: "#111", padding: "3px", borderRadius: "8px", width: "fit-content" }}>
          {["bank", "airline", "hotel"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "6px 16px", borderRadius: "6px", border: "none", background: activeTab === tab ? "#222" : "transparent", color: activeTab === tab ? "#f5f5f5" : "#555", fontSize: "13px", fontWeight: activeTab === tab ? "500" : "400", cursor: "pointer", fontFamily: "'Inter', system-ui, sans-serif", transition: "all 0.15s" }}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ marginBottom: "32px" }}>
          {POINTS_DATA[activeTab].map(program => (
            <div key={program.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "0.5px solid #1a1a1a" }}>
              <span style={{ fontSize: "14px", color: points[program.id] ? "#f5f5f5" : "#444", transition: "color 0.15s" }}>{program.name}</span>
              <input type="text" inputMode="numeric" placeholder="0" value={formatDisplay(points[program.id])} onChange={e => handleChange(program.id, e.target.value)}
                style={{ background: "transparent", border: "none", color: "#c8a96e", fontSize: "14px", fontFamily: "'Inter', system-ui, sans-serif", textAlign: "right", width: "120px", outline: "none", fontWeight: "500" }} />
            </div>
          ))}
        </div>
        <button onClick={() => onContinue(points)} style={{ width: "100%", padding: "14px", background: "#f5f5f5", color: "#0a0a0a", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "500", cursor: "pointer", fontFamily: "'Inter', system-ui, sans-serif", marginBottom: "12px" }}
          onMouseEnter={e => e.target.style.opacity = "0.85"} onMouseLeave={e => e.target.style.opacity = "1"}>
          Continue →
        </button>
        <p onClick={() => onContinue({})} style={{ textAlign: "center", fontSize: "13px", color: "#444", cursor: "pointer" }}>Skip for now</p>
      </div>
    </div>
  );
}

function DestCard({ dest, onClick }) {
  const [photo, setPhoto] = useState(null);
  const [sun, setSun] = useState(null);

  useEffect(() => {
    const date = new Date();
    date.setMonth(5);
    date.setDate(10);
    const dateStr = date.toISOString().split("T")[0];
    getSunTimes(dest.coordinates.lat, dest.coordinates.lng, dateStr).then(setSun);
    const query = encodeURIComponent(dest.unsplashQuery || `${dest.city} ${dest.country}`);
    setPhoto(`https://source.unsplash.com/800x600/?${query}`);
  }, [dest]);

  return (
    <div onClick={onClick} style={{ position: "relative", borderRadius: "16px", overflow: "hidden", cursor: "pointer", height: "340px", background: "#111", border: "0.5px solid #222", transition: "transform 0.2s, border-color 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "#c8a96e44"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "#222"; }}>
      {photo && <img src={photo} alt={dest.city} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.6 }} />}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span style={{ fontSize: "28px" }}>{dest.emoji}</span>
          {sun && (
            <div style={{ display: "flex", gap: "10px", fontSize: "11px", color: "rgba(255,255,255,0.7)", background: "rgba(0,0,0,0.4)", padding: "5px 10px", borderRadius: "20px" }}>
              <span>🌅 {sun.sunrise}</span>
              <span>🌇 {sun.sunset}</span>
            </div>
          )}
        </div>
        <div>
          <h3 style={{ fontSize: "28px", fontWeight: "700", letterSpacing: "-0.03em", color: "#fff", marginBottom: "4px", lineHeight: "1.1" }}>{dest.city}</h3>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", marginBottom: "12px" }}>{dest.country}</p>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", marginBottom: "14px", lineHeight: "1.5" }}>{dest.why}</p>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {[{ icon: "✈️", val: dest.flightTime }, { icon: "🌡️", val: dest.tempF }, { icon: "💳", val: dest.pointsNeeded }].map(s => (
              <span key={s.val} style={{ fontSize: "11px", padding: "4px 10px", background: "rgba(255,255,255,0.12)", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: "20px", color: "rgba(255,255,255,0.85)", backdropFilter: "blur(4px)" }}>
                {s.icon} {s.val}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailView({ dest, onBack }) {
  const [photo, setPhoto] = useState(null);
  const [sun, setSun] = useState(null);

  useEffect(() => {
    const query = encodeURIComponent(dest.unsplashQuery || `${dest.city} ${dest.country}`);
    setPhoto(`https://source.unsplash.com/1200x400/?${query}`);
    const date = new Date();
    date.setMonth(5);
    date.setDate(10);
    getSunTimes(dest.coordinates.lat, dest.coordinates.lng, date.toISOString().split("T")[0]).then(setSun);
  }, [dest]);

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: "32px" }}>
      <div style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#555", marginBottom: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
        {title}
        <div style={{ flex: 1, height: "0.5px", background: "#1a1a1a" }} />
      </div>
      {children}
    </div>
  );

  const FlightRow = ({ flight, label }) => (
    <div style={{ background: "#111", border: "0.5px solid #1e1e1e", borderRadius: "10px", padding: "14px 16px", marginBottom: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <div>
          <span style={{ fontSize: "11px", color: "#555", letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</span>
          <div style={{ fontSize: "15px", fontWeight: "600", color: "#f5f5f5", letterSpacing: "-0.02em", marginTop: "2px" }}>{flight.route}</div>
          <div style={{ fontSize: "12px", color: "#555", marginTop: "2px" }}>{flight.airline} · {flight.departure} → {flight.arrival}</div>
        </div>
        <a href={flight.bookUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
          style={{ padding: "7px 14px", background: "#f5f5f5", color: "#0a0a0a", borderRadius: "6px", fontSize: "12px", fontWeight: "500", textDecoration: "none", whiteSpace: "nowrap" }}>
          Book →
        </a>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <span style={{ fontSize: "11px", padding: "3px 8px", background: "#1a1a1a", border: "0.5px solid #2a2a2a", borderRadius: "20px", color: "#c8a96e" }}>{flight.points}</span>
        {flight.cash && (
          <span style={{ fontSize: "11px", padding: "3px 8px", background: "#1a1a1a", border: "0.5px solid #2a2a2a", borderRadius: "20px", color: "#555" }}>+{flight.cash} taxes</span>
        )}
      </div>
    </div>
  );

  const HotelRow = ({ hotel }) => (
    <div style={{ background: "#111", border: "0.5px solid #1e1e1e", borderRadius: "10px", padding: "14px 16px", marginBottom: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: "15px", fontWeight: "600", color: "#f5f5f5", letterSpacing: "-0.02em", marginBottom: "3px" }}>{hotel.name}</div>
          <div style={{ fontSize: "12px", color: "#555", marginBottom: "8px" }}>{hotel.program}</div>
          <div style={{ display: "flex", gap: "8px" }}>
            <span style={{ fontSize: "11px", padding: "3px 8px", background: "#1a1a1a", border: "0.5px solid #2a2a2a", borderRadius: "20px", color: "#c8a96e" }}>{hotel.pointsPerNight}</span>
            <span style={{ fontSize: "11px", padding: "3px 8px", background: "#1a1a1a", border: "0.5px solid #2a2a2a", borderRadius: "20px", color: "#555" }}>{hotel.cashRate} cash</span>
          </div>
        </div>
        <a href={hotel.bookUrl} target="_blank" rel="noopener noreferrer"
          style={{ padding: "7px 14px", background: "#f5f5f5", color: "#0a0a0a", borderRadius: "6px", fontSize: "12px", fontWeight: "500", textDecoration: "none", whiteSpace: "nowrap" }}>
          Book →
        </a>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ position: "relative", height: "280px", overflow: "hidden" }}>
        {photo && <img src={photo} alt={dest.city} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.5 }} />}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(10,10,10,0.3), rgba(10,10,10,1))" }} />
        <div style={{ position: "absolute", bottom: "24px", left: "24px", right: "24px" }}>
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.1)", border: "0.5px solid rgba(255,255,255,0.15)", color: "#fff", padding: "6px 14px", borderRadius: "20px", fontSize: "12px", cursor: "pointer", fontFamily: "'Inter', system-ui, sans-serif", marginBottom: "12px" }}>
            ← Back to destinations
          </button>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div>
              <h1 style={{ fontSize: "36px", fontWeight: "700", letterSpacing: "-0.03em", color: "#fff", marginBottom: "2px" }}>{dest.emoji} {dest.city}</h1>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>{dest.country}</p>
            </div>
            {sun && (
              <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
                <span>🌅 {sun.sunrise}</span>
                <span>🌇 {sun.sunset}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "32px 24px" }}>
        <Section title="Outbound flights">
          {dest.outboundFlights?.map((f, i) => <FlightRow key={i} flight={f} label="Outbound" />)}
        </Section>
        <Section title="Return flights">
          {dest.returnFlights?.map((f, i) => <FlightRow key={i} flight={f} label="Return" />)}
        </Section>
        <Section title="Hotels">
          {dest.hotels?.map((h, i) => <HotelRow key={i} hotel={h} />)}
        </Section>
        <Section title="What to do now">
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {dest.actionSteps?.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#c8a96e22", border: "0.5px solid #c8a96e44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#c8a96e", flexShrink: 0, fontWeight: "600" }}>
                  {i + 1}
                </div>
                <p style={{ fontSize: "14px", color: "#ccc", lineHeight: "1.6", paddingTop: "2px" }}>{step}</p>
              </div>
            ))}
          </div>
        </Section>
        <div style={{ background: "#111", border: "0.5px solid #1e1e1e", borderRadius: "10px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "11px", color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>Estimated cash on top of points</div>
            <div style={{ fontSize: "22px", fontWeight: "700", letterSpacing: "-0.02em", color: "#f5f5f5" }}>{dest.cashEstimate}</div>
          </div>
          <div style={{ fontSize: "12px", color: "#555", textAlign: "right" }}>flights + hotel<br />excludes food & activities</div>
        </div>
      </div>
    </div>
  );
}

function Chat({ points, onBack }) {
  const [messages, setMessages] = useState([{
    role: "ai",
    text: "Hey! Describe the trip you're looking for and I'll find the best destinations using your points.\n\nInclude: dates, departure airport, nonstop preference, weather vibe, what you're looking for, solo or group, and cash budget.\n\nExample: \"June 6–22, EWR, nonstop only, 8am earliest. Mild weather, beach access, good food, not a party city. Solo, $1k cash max.\"",
    destinations: null,
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDest, setSelectedDest] = useState(null);
  const [searchCount, setSearchCount] = useState(0);
  const bottomRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    if (searchCount >= 1) {
      setMessages(prev => [...prev,
        { role: "user", text: input.trim(), destinations: null },
        { role: "paywall", text: "", destinations: null }
      ]);
      setInput("");
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMessage, destinations: null }]);
    setLoading(true);
    setMessages(prev => [...prev, { role: "ai", text: "Searching flights, hotels, and optimizing your points...", destinations: null, loading: true }]);

    try {
      const response = await fetch("http://localhost:3001/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points, tripDescription: userMessage }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "ai",
          text: "Here are your top 3 destinations — click any to see flights, hotels, and exactly how to book:",
          destinations: data.destinations,
          loading: false,
        };
        return updated;
      });
      setSearchCount(prev => prev + 1);
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "ai", text: "Something went wrong. Please try again.", destinations: null, loading: false };
        return updated;
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (selectedDest) {
    return <DetailView dest={selectedDest} onBack={() => setSelectedDest(null)} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", fontFamily: "'Inter', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <nav style={{ padding: "16px 24px", borderBottom: "0.5px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "15px", fontWeight: "600", letterSpacing: "-0.02em", color: "#f5f5f5" }}>Waypoint</span>
        <span onClick={onBack} style={{ fontSize: "12px", color: "#555", cursor: "pointer" }}>← Back</span>
      </nav>
      <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "20px", maxWidth: "780px", width: "100%", margin: "0 auto" }}>
        {messages.map((msg, i) => {
          if (msg.role === "paywall") {
            return (
              <div key={i} style={{ background: "#111", border: "0.5px solid #2a2a2a", borderRadius: "12px", padding: "28px 32px", textAlign: "center" }}>
                <div style={{ fontSize: "20px", fontWeight: "700", letterSpacing: "-0.03em", color: "#f5f5f5", marginBottom: "8px" }}>You've used your free search</div>
                <p style={{ fontSize: "14px", color: "#555", marginBottom: "24px", lineHeight: "1.6" }}>Get unlimited trip planning for $9/month.</p>
                <button style={{ padding: "12px 28px", background: "#f5f5f5", color: "#0a0a0a", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer", fontFamily: "'Inter', system-ui, sans-serif" }}>
                  Unlock Waypoint — $9/mo
                </button>
                <p style={{ marginTop: "12px", fontSize: "12px", color: "#333" }}>Cancel anytime</p>
              </div>
            );
          }
          return (
            <div key={i}>
              <div style={{ display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row", gap: "12px", alignItems: "flex-start", marginBottom: msg.destinations ? "16px" : "0" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: msg.role === "ai" ? "#1a1a1a" : "#c8a96e22", border: `0.5px solid ${msg.role === "ai" ? "#222" : "#c8a96e44"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "600", color: msg.role === "ai" ? "#555" : "#c8a96e", flexShrink: 0 }}>
                  {msg.role === "ai" ? "W" : "B"}
                </div>
                <div style={{ maxWidth: "85%", padding: "12px 16px", borderRadius: "14px", borderTopLeftRadius: msg.role === "ai" ? "4px" : "14px", borderTopRightRadius: msg.role === "user" ? "4px" : "14px", background: msg.role === "ai" ? "#111" : "#1a1a1a", border: `0.5px solid ${msg.role === "ai" ? "#1e1e1e" : "#222"}`, fontSize: "14px", lineHeight: "1.7", color: msg.role === "ai" ? "#aaa" : "#f5f5f5", whiteSpace: "pre-wrap" }}>
                  {msg.loading ? (
                    <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                      {[0,1,2].map(j => (
                        <div key={j} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#444", animation: "bounce 1.2s infinite", animationDelay: `${j * 0.2}s` }} />
                      ))}
                    </div>
                  ) : msg.text}
                </div>
              </div>
              {msg.destinations && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px", marginLeft: "40px" }}>
                  {msg.destinations.map((dest, di) => (
                    <DestCard key={di} dest={dest} onClick={() => setSelectedDest(dest)} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div style={{ padding: "16px 24px 24px", borderTop: "0.5px solid #1a1a1a", maxWidth: "780px", width: "100%", margin: "0 auto" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", background: "#111", border: "0.5px solid #222", borderRadius: "12px", padding: "10px 14px" }}>
          <textarea value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Describe your trip..." rows={1}
            style={{ flex: 1, background: "transparent", border: "none", color: "#f5f5f5", fontSize: "14px", fontFamily: "'Inter', system-ui, sans-serif", outline: "none", resize: "none", lineHeight: "1.5" }} />
          <button onClick={sendMessage} disabled={loading || !input.trim()}
            style={{ width: "32px", height: "32px", borderRadius: "8px", background: loading || !input.trim() ? "#1a1a1a" : "#f5f5f5", border: "none", cursor: loading || !input.trim() ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "15px", color: loading || !input.trim() ? "#333" : "#0a0a0a", transition: "background 0.15s" }}>
            ↑
          </button>
        </div>
        <p style={{ textAlign: "center", fontSize: "11px", color: "#333", marginTop: "8px" }}>First search free - $9/mo after</p>
      </div>
      <style>{`@keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-5px); } }`}</style>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [points, setPoints] = useState({});

  return (
    <div>
      {screen === "landing" && <Landing onStart={() => setScreen("points")} />}
      {screen === "points" && <PointsInput onContinue={(p) => { setPoints(p); setScreen("chat"); }} />}
      {screen === "chat" && <Chat points={points} onBack={() => setScreen("points")} />}
    </div>
  );
}