import { useState, useEffect, useRef } from "react";

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

const C = {
  bg: "#0d0d0d",
  surface: "#141414",
  surface2: "#1a1a1a",
  border: "#242424",
  border2: "#2e2e2e",
  text: "#e8e6e1",
  muted: "#6b6966",
  muted2: "#4a4845",
  gold: "#c8a96e",
  goldDim: "#c8a96e22",
  goldBorder: "#c8a96e33",
  white: "#ffffff",
};

const MARQUEE_ITEMS = [
  "Chase Ultimate Rewards", "Marriott Bonvoy", "United MileagePlus",
  "American AAdvantage", "World of Hyatt", "Delta SkyMiles",
  "Amex Membership Rewards", "Hilton Honors", "JetBlue TrueBlue",
  "Bilt Rewards", "Air Canada Aeroplan", "IHG One Rewards",
  "Flying Blue", "British Airways Avios", "Turkish Miles&Smiles",
  "Alaska Mileage Plan", "Virgin Atlantic", "Wyndham Rewards",
  "Citi ThankYou Points", "Capital One Miles", "Southwest Rapid Rewards",
];

function buildBookingUrl(flight, dates) {
  if (!flight?.airline || !flight?.route) return "#";
  const airline = flight.airline.toLowerCase();
  const routeParts = flight.route.replace(/\s/g, "").split("→");
  const from = routeParts[0] || "";
  const to = routeParts[1] || "";
  let depart = "";
  if (dates) {
    const parts = dates.split(/[-–]/);
    if (parts.length >= 1) {
      const d = new Date(parts[0].trim() + " 2026");
      if (!isNaN(d)) depart = `${(d.getMonth()+1).toString().padStart(2,"0")}/${d.getDate().toString().padStart(2,"0")}/2026`;
    }
  }
  if (airline.includes("united")) return `https://www.united.com/en/us/book-flight/united-reservations?from=${from}&to=${to}&cabinType=economy${depart ? `&d=${depart}` : ""}`;
  if (airline.includes("american") || airline.includes("aadvantage")) return `https://www.aa.com/booking/search?from=${from}&to=${to}`;
  if (airline.includes("delta")) return `https://www.delta.com/us/en/book-trip/flight-results?originAirportCode=${from}&destinationAirportCode=${to}`;
  if (airline.includes("jetblue")) return `https://www.jetblue.com/booking/flights?from=${from}&to=${to}`;
  if (airline.includes("alaska")) return `https://www.alaskaair.com/booking/choose-flights/${from}/${to}`;
  if (airline.includes("tap")) return `https://www.flytap.com/en-us/book-flights?origin=${from}&destination=${to}`;
  if (airline.includes("british") || airline.includes("ba")) return `https://www.britishairways.com/travel/redeem/execclub/_gf/en_us?eId=106&from=${from}&to=${to}`;
  if (airline.includes("air france") || airline.includes("flying blue")) return `https://wwws.airfrance.us/search/offers?origin=${from}&destination=${to}`;
  if (airline.includes("aeroplan") || airline.includes("air canada")) return `https://www.aircanada.com/aeroplan/redeem/flight-reward?origin=${from}&destination=${to}`;
  return `https://www.google.com/travel/flights`;
}

async function getSunTimes(lat, lng, dateStr) {
  try {
    const res = await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=${dateStr}&formatted=0`);
    const data = await res.json();
    const fmt = (iso) => new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
    return { sunrise: fmt(data.results.sunrise), sunset: fmt(data.results.sunset) };
  } catch { return { sunrise: "—", sunset: "—" }; }
}

async function getCityPhoto(query) {
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query + " sunny colorful travel")}&per_page=5&orientation=landscape`,
      { headers: { Authorization: import.meta.env.VITE_PEXELS_API_KEY } }
    );
    const data = await res.json();
    const photos = data.photos || [];
    const color = photos.find(p => {
      if (!p.avg_color) return false;
      const r = parseInt(p.avg_color.slice(1, 3), 16);
      const g = parseInt(p.avg_color.slice(3, 5), 16);
      const b = parseInt(p.avg_color.slice(5, 7), 16);
      return (Math.max(r, g, b) - Math.min(r, g, b)) >= 30;
    });
    return (color || photos[0])?.src?.large || null;
  } catch { return null; }
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

function Marquee() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div style={{ overflow: "hidden", borderTop: `0.5px solid ${C.border}`, borderBottom: `0.5px solid ${C.border}`, padding: "12px 0", position: "relative" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "60px", background: `linear-gradient(to right, ${C.bg}, transparent)`, zIndex: 1 }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "60px", background: `linear-gradient(to left, ${C.bg}, transparent)`, zIndex: 1 }} />
      <div style={{ display: "flex", animation: "marquee 40s linear infinite", width: "max-content" }}>
        {items.map((item, i) => (
          <span key={i} style={{ fontSize: "12px", color: C.muted2, padding: "0 20px", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "3px", height: "3px", borderRadius: "50%", background: C.muted2, display: "inline-block", flexShrink: 0 }} />
            {item}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes flyPlane {
          0% { transform: translateX(0px) translateY(0px); }
          25% { transform: translateX(80px) translateY(-10px); }
          50% { transform: translateX(160px) translateY(0px); }
          75% { transform: translateX(80px) translateY(10px); }
          100% { transform: translateX(0px) translateY(0px); }
        }
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
        select option { background: #1a1a1a; color: #e8e6e1; }
        .dim-placeholder::placeholder { color: #2a2a2a; }
      `}</style>
    </div>
  );
}

function Nav({ onHome, onBack, backLabel, onAbout, onMission, showSignIn }) {
  const isMobile = useIsMobile();
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 100, height: "52px", background: "rgba(13,13,13,0.92)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: `0.5px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 24px", gap: isMobile ? "14px" : "20px" }}>
      <span onClick={onHome} style={{ fontSize: "16px", fontWeight: "600", letterSpacing: "-0.02em", color: C.text, cursor: onHome ? "pointer" : "default", flexShrink: 0 }}>Waypoint</span>
      {!isMobile && onAbout && <span onClick={onAbout} style={{ fontSize: "13px", color: C.muted, cursor: "pointer" }} onMouseEnter={e => e.target.style.color = C.text} onMouseLeave={e => e.target.style.color = C.muted}>About</span>}
      {!isMobile && onMission && <span onClick={onMission} style={{ fontSize: "13px", color: C.muted, cursor: "pointer" }} onMouseEnter={e => e.target.style.color = C.text} onMouseLeave={e => e.target.style.color = C.muted}>Our Mission</span>}
      <div style={{ flex: 1 }} />
      {showSignIn && !isMobile && (
        <span style={{ fontSize: "12px", color: C.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", marginRight: onBack ? "16px" : "0" }}>
          <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#2d9e5f", flexShrink: 0 }} />
          Sign in
        </span>
      )}
      {onBack && <span onClick={onBack} style={{ fontSize: "12px", color: C.muted, cursor: "pointer", whiteSpace: "nowrap" }} onMouseEnter={e => e.target.style.color = C.text} onMouseLeave={e => e.target.style.color = C.muted}>{backLabel || "← Back"}</span>}
    </nav>
  );
}

function PlaneLoader({ message }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "48px", padding: "24px" }}>
      <div style={{ position: "relative", width: "240px", height: "60px" }}>
        <div style={{ position: "absolute", bottom: "12px", left: 0, right: 0, height: "0.5px", background: `linear-gradient(to right, transparent, ${C.border2}, transparent)` }} />
        <div style={{ animation: "flyPlane 3s ease-in-out infinite", display: "inline-block" }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill={C.gold}>
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
          </svg>
        </div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "22px", fontWeight: "600", letterSpacing: "-0.02em", color: C.text, marginBottom: "10px" }}>{message || "Finding your destinations..."}</div>
        <div style={{ fontSize: "15px", color: C.muted }}>Searching flights, hotels, and optimizing your points</div>
        <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "24px" }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.gold, animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Landing({ onStart, onAbout, onMission }) {
  const isMobile = useIsMobile();
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column" }}>
      <Nav onAbout={onAbout} onMission={onMission} showSignIn={true} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: isMobile ? "40px 20px 24px" : "60px 24px 24px", textAlign: "center" }}>
        <div className="animate-1" style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: C.goldDim, border: `0.5px solid ${C.goldBorder}`, borderRadius: "100px", padding: "4px 12px", fontSize: "11px", color: C.gold, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "24px" }}>
          <span style={{ fontSize: "8px" }}>●</span> AI-powered points optimization
        </div>
        <h1 className="animate-2" style={{ fontSize: isMobile ? "44px" : "clamp(48px, 6vw, 80px)", fontWeight: "700", letterSpacing: "-0.04em", lineHeight: "1.05", color: C.text, maxWidth: "820px", marginBottom: "20px" }}>
          Your points.<br /><span style={{ color: C.gold }}>Your next trip.</span>
        </h1>
        <p className="animate-3" style={{ fontSize: isMobile ? "15px" : "18px", color: C.muted, maxWidth: "500px", lineHeight: "1.7", marginBottom: "32px", padding: "0 8px" }}>
          Tell us your points and what you're looking for. We'll pick the destination and plan everything — flights, hotels, how to book it all free.
        </p>
        <div className="animate-4" style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "12px", alignItems: "center", marginBottom: isMobile ? "32px" : "40px", width: isMobile ? "100%" : "auto" }}>
          <button onClick={onStart} style={{ padding: "14px 32px", background: C.text, color: C.bg, border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "500", cursor: "pointer", WebkitTapHighlightColor: "transparent", width: isMobile ? "100%" : "auto" }}>
            Plan my trip →
          </button>
          <span style={{ fontSize: "13px", color: C.muted2 }}>Free to try</span>
        </div>
        <div className="animate-5" style={{ display: "flex", gap: isMobile ? "32px" : "64px", paddingTop: "32px", borderTop: `0.5px solid ${C.border}` }}>
          {isMobile
            ? [{ n: "30+", l: "Programs" }, { n: "150+", l: "Airlines & hotels" }, { n: "$0", l: "Fees" }].map(s => (
              <div key={s.l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "20px", fontWeight: "600", color: C.text, marginBottom: "2px" }}>{s.n}</div>
                <div style={{ fontSize: "10px", color: C.muted }}>{s.l}</div>
              </div>
            ))
            : [{ n: "30+", l: "Loyalty programs" }, { n: "150+", l: "Airlines & hotels" }, { n: "$0", l: "Hidden fees" }].map(s => (
              <div key={s.l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "28px", fontWeight: "600", letterSpacing: "-0.03em", color: C.text, marginBottom: "4px" }}>{s.n}</div>
                <div style={{ fontSize: "13px", color: C.muted }}>{s.l}</div>
              </div>
            ))
          }
        </div>
      </div>
      <Marquee />
      {isMobile && (
        <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span onClick={onAbout} style={{ fontSize: "11px", color: C.muted, cursor: "pointer" }}>About</span>
          <span style={{ fontSize: "11px", color: C.muted2 }}>·</span>
          <span onClick={onMission} style={{ fontSize: "11px", color: C.muted, cursor: "pointer" }}>Our Mission</span>
          <span style={{ fontSize: "11px", color: C.muted2 }}>·</span>
          <span style={{ fontSize: "11px", color: C.muted, cursor: "pointer" }}>Sign in</span>
        </div>
      )}
    </div>
  );
}

function About({ onHome, onBack, onAbout, onMission }) {
  const isMobile = useIsMobile();
  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <Nav onHome={onHome} onBack={onBack} backLabel="← Back" onAbout={onAbout} onMission={onMission} />
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: isMobile ? "40px 20px" : "72px 24px" }}>
        <div className="animate-1" style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.gold, marginBottom: "14px" }}>About</div>
        <h1 className="animate-2" style={{ fontSize: isMobile ? "28px" : "38px", fontWeight: "700", letterSpacing: "-0.04em", color: C.text, marginBottom: "24px", lineHeight: "1.1" }}>Built out of frustration.</h1>
        <p className="animate-3" style={{ fontSize: "16px", color: C.muted, lineHeight: "1.9", marginBottom: "18px" }}>
          I'm 24, living in New Jersey, working in fintech in New York City. I have hundreds of thousands of points across Chase, Marriott, and United — and every time I wanted to plan a trip, I spent hours bouncing between Seats.aero, Rooms.aero, Reddit threads, and transfer partner charts just to figure out where I could even afford to go.
        </p>
        <p className="animate-4" style={{ fontSize: "16px", color: C.muted, lineHeight: "1.9" }}>
          That process is broken. The information exists — it's just scattered across a dozen different tools, none of which talk to each other. Waypoint is the single tool I always wanted and nobody had built yet.
        </p>
        <div className="animate-5" style={{ display: "flex", gap: "40px", marginTop: "36px", paddingTop: "28px", borderTop: `0.5px solid ${C.border}` }}>
          {[{ n: "30+", l: "Loyalty programs" }, { n: "60 sec", l: "Avg. time to results" }, { n: "$0", l: "Hidden fees" }].map(s => (
            <div key={s.l}>
              <div style={{ fontSize: "22px", fontWeight: "700", letterSpacing: "-0.03em", color: C.text, marginBottom: "3px" }}>{s.n}</div>
              <div style={{ fontSize: "12px", color: C.muted2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Mission({ onHome, onBack, onAbout, onMission }) {
  const isMobile = useIsMobile();
  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <Nav onHome={onHome} onBack={onBack} backLabel="← Back" onAbout={onAbout} onMission={onMission} />
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: isMobile ? "40px 20px" : "72px 24px" }}>
        <div className="animate-1" style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.gold, marginBottom: "14px" }}>Our Mission</div>
        <h1 className="animate-2" style={{ fontSize: isMobile ? "28px" : "38px", fontWeight: "700", letterSpacing: "-0.04em", color: C.text, marginBottom: "24px", lineHeight: "1.1" }}>
          You shouldn't need to be an expert to travel like one.
        </h1>
        <p className="animate-3" style={{ fontSize: "16px", color: C.muted, lineHeight: "1.9", marginBottom: "18px" }}>
          The people who get the most out of their points — the ones flying business class to Tokyo on 60,000 miles — spent years learning transfer partners, sweet spots, and redemption values. Most people never do.
        </p>
        <p className="animate-4" style={{ fontSize: "16px", color: C.muted, lineHeight: "1.9", marginBottom: "18px" }}>
          Most people have no idea how much value is sitting in their accounts. A sign-up bonus sitting untouched for two years. Marriott points worth three free nights in Lisbon. Chase UR that transfers to a dozen airlines at 1:1.
        </p>
        <p className="animate-5" style={{ fontSize: "16px", color: C.muted, lineHeight: "1.9" }}>
          Waypoint makes that expertise accessible in 60 seconds. Tell us what you have and where you want to go — we'll figure out the rest.
        </p>
      </div>
    </div>
  );
}

function PointsInput({ onContinue, onBack, onHome, onAbout, onMission }) {
  const [activeTab, setActiveTab] = useState("bank");
  const [points, setPoints] = useState({});
  const isMobile = useIsMobile();
  const handleChange = (id, value) => setPoints(prev => ({ ...prev, [id]: value.replace(/[^0-9]/g, "") }));
  const fmt = (val) => val ? parseInt(val).toLocaleString() : "";

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <Nav onHome={onHome} onBack={onBack} backLabel="← Back" onAbout={onAbout} onMission={onMission} />
      <div style={{ maxWidth: "520px", margin: "0 auto", padding: isMobile ? "32px 20px 60px" : "56px 24px" }}>
        <div className="animate-1" style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.gold, marginBottom: "12px" }}>Step 1 of 2</div>
        <h1 className="animate-2" style={{ fontSize: isMobile ? "24px" : "30px", fontWeight: "600", letterSpacing: "-0.03em", color: C.text, marginBottom: "8px" }}>Your points balances</h1>
        <p className="animate-3" style={{ fontSize: "14px", color: C.muted, marginBottom: "32px", lineHeight: "1.6" }}>Enter what you have. Skip anything at zero.</p>
        <div className="animate-4" style={{ display: "inline-flex", gap: "2px", background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: "8px", padding: "3px", marginBottom: "20px" }}>
          {["bank", "airline", "hotel"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "6px 16px", borderRadius: "5px", border: "none", background: activeTab === tab ? C.surface2 : "transparent", color: activeTab === tab ? C.text : C.muted, fontSize: "13px", fontWeight: activeTab === tab ? "500" : "400", transition: "all 0.15s", cursor: "pointer", WebkitTapHighlightColor: "transparent" }}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div className="animate-5" style={{ marginBottom: "32px" }}>
          {POINTS_DATA[activeTab].map(p => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `0.5px solid ${C.border}` }}>
              <span style={{ fontSize: "14px", color: points[p.id] ? C.text : C.muted, transition: "color 0.15s", paddingRight: "12px" }}>{p.name}</span>
              <input type="text" inputMode="numeric" placeholder="0" value={fmt(points[p.id])} onChange={e => handleChange(p.id, e.target.value)}
                style={{ background: C.surface2, border: `0.5px solid ${C.border2}`, borderRadius: "6px", color: C.gold, fontSize: "14px", fontWeight: "500", textAlign: "right", width: "120px", padding: "7px 10px", outline: "none", fontFamily: "inherit", flexShrink: 0 }}
                onFocus={e => e.target.style.borderColor = C.gold}
                onBlur={e => e.target.style.borderColor = C.border2} />
            </div>
          ))}
        </div>
        <button className="animate-6" onClick={() => onContinue(points)} style={{ width: "100%", padding: "14px", background: C.text, color: C.bg, border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "500", marginBottom: "12px", cursor: "pointer", WebkitTapHighlightColor: "transparent" }}>
          Continue →
        </button>
        <p onClick={() => onContinue({})} style={{ textAlign: "center", fontSize: "13px", color: C.muted2, cursor: "pointer", padding: "8px" }}>Skip for now</p>
      </div>
    </div>
  );
}

function TripForm({ points, onResults, onBack, onHome, onAbout, onMission }) {
  const TOTAL_STEPS = 7;
  const [step, setStep] = useState(1);
  const [airports, setAirports] = useState([]);
  const [airportInput, setAirportInput] = useState("");
  const [dates, setDates] = useState("");
  const [flexDates, setFlexDates] = useState(false);
  const [connections, setConnections] = useState("");
  const [departurePref, setDeparturePref] = useState("");
  const [travelers, setTravelers] = useState("");
  const [budget, setBudget] = useState("");
  const [vibe, setVibe] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const isMobile = useIsMobile();

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100); }, [step]);

  const addAirport = () => {
    const code = airportInput.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3);
    if (code.length === 3 && !airports.includes(code)) setAirports(prev => [...prev, code]);
    setAirportInput("");
    inputRef.current?.blur();
  };

  const removeAirport = (code) => setAirports(prev => prev.filter(a => a !== code));
  const goNext = () => setStep(s => Math.min(s + 1, TOTAL_STEPS));
  const goPrev = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    const tripDescription = [
      `Origin airports: ${airports.join(", ")}`,
      `Dates: ${dates}${flexDates ? " (flexible by a few days)" : ""}`,
      `Connections: ${connections || "Any"}`,
      `Preferred departure time: ${departurePref || "Any time"}`,
      `Travelers: ${travelers || "Solo"}`,
      `Cash comfort level: ${budget || "flexible"}`,
      `Trip vibe: ${vibe}`,
    ].join("\n");
    try {
      const response = await fetch("/api/plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ points, tripDescription }) });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      onResults(data.destinations, { origin: airports.join(", "), dates: dates + (flexDates ? " (flexible)" : ""), connections, travelers, budget, vibe });
    } catch { setError("Something went wrong. Please try again."); setLoading(false); }
  };

  if (loading) return <PlaneLoader message="Finding your destinations..." />;

  const progress = (step / TOTAL_STEPS) * 100;

  const stepStyle = {
    animation: "fadeUp 0.3s ease forwards",
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", textAlign: "center",
    minHeight: "calc(100vh - 55px)",
    padding: isMobile ? "40px 24px" : "60px 40px",
    maxWidth: "600px", margin: "0 auto", width: "100%",
  };

  const questionStyle = {
    fontSize: isMobile ? "28px" : "36px",
    fontWeight: "700", letterSpacing: "-0.03em",
    color: C.text, lineHeight: "1.15", marginBottom: "12px",
  };

  const hintStyle = { fontSize: "15px", color: C.muted, marginBottom: "36px", lineHeight: "1.6" };

  const bigInputStyle = {
    background: "transparent", border: "none",
    borderBottom: `2px solid ${C.gold}`,
    color: C.text, fontSize: isMobile ? "24px" : "30px",
    fontWeight: "600", textAlign: "center",
    outline: "none", width: "100%", maxWidth: "360px",
    padding: "8px 0", letterSpacing: "0.02em", fontFamily: "inherit",
  };

  const pillStyle = (selected) => ({
    padding: isMobile ? "12px 22px" : "14px 28px",
    border: `0.5px solid ${selected ? C.gold : C.border2}`,
    borderRadius: "40px", fontSize: isMobile ? "14px" : "15px",
    color: selected ? C.gold : C.muted,
    background: selected ? C.goldDim : "transparent",
    cursor: "pointer", transition: "all 0.15s",
    fontFamily: "inherit", WebkitTapHighlightColor: "transparent",
  });

  const continueBtn = (onClick, disabled = false) => (
    <button onClick={onClick} disabled={disabled} style={{ marginTop: "40px", padding: "13px 36px", background: disabled ? C.surface2 : C.text, color: disabled ? C.muted2 : C.bg, border: `0.5px solid ${disabled ? C.border2 : "transparent"}`, borderRadius: "8px", fontSize: "15px", fontWeight: "500", cursor: disabled ? "default" : "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
      Continue →
    </button>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(13,13,13,0.92)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: `0.5px solid ${C.border}` }}>
        <div style={{ height: "52px", display: "grid", gridTemplateColumns: "1fr auto 1.03fr", alignItems: "center", padding: "0 24px" }}>
          <span onClick={onHome} style={{ fontSize: "16px", fontWeight: "600", color: C.text, cursor: "pointer" }}>Waypoint</span>
          <span style={{ fontSize: "12px", color: C.muted2, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>Step {step} of {TOTAL_STEPS}</span>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <span onClick={step > 1 ? goPrev : onBack} style={{ fontSize: "12px", color: C.muted, cursor: "pointer" }}>← Back</span>
          </div>
        </div>
        <div style={{ height: "2px", background: C.surface2, position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: `${progress}%`, background: C.gold, transition: "width 0.4s ease" }} />
        </div>
      </nav>

      <div style={{ display: "flex", justifyContent: "center" }}>
        {step === 1 && (
          <div style={stepStyle} key="s1">
            <div style={questionStyle}>Where are you flying from?</div>
            <div style={hintStyle}>Enter a 3-letter airport code and press Enter.<br />Add multiple if you're flexible.</div>
            <input ref={inputRef} value={airportInput}
              className="dim-placeholder"
              onChange={e => setAirportInput(e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3))}
              onKeyDown={e => { if ((e.key === "Enter" || e.key === " ") && airportInput.length === 3) { e.preventDefault(); addAirport(); } }}
              onBlur={() => {}}
              placeholder={airports.length === 0 ? "EWR" : ""} style={bigInputStyle} />
            {airports.length > 0 && (
              <div style={{ display: "flex", gap: "8px", marginTop: "16px", flexWrap: "wrap", justifyContent: "center" }}>
                {airports.map(a => (
                  <span key={a} style={{ background: C.surface2, border: `0.5px solid ${C.border2}`, borderRadius: "6px", padding: "5px 12px", fontSize: "14px", color: C.text, fontWeight: "500", display: "flex", alignItems: "center", gap: "6px" }}>
                    {a} <span onClick={() => removeAirport(a)} style={{ color: C.muted, cursor: "pointer", fontSize: "16px" }}>×</span>
                  </span>
                ))}
              </div>
            )}
            <div style={{ fontSize: "12px", color: C.muted2, marginTop: "12px" }}>Press Enter to add · type another to add more</div>
            {continueBtn(goNext, airports.length === 0)}
          </div>
        )}

        {step === 2 && (
          <div style={stepStyle} key="s2">
            <div style={questionStyle}>When do you want to travel?</div>
            <div style={hintStyle}>Enter your approximate travel window.</div>
            <input ref={inputRef} value={dates} onChange={e => setDates(e.target.value)}
              className="dim-placeholder"
              onKeyDown={e => { if (e.key === "Enter" && dates.length > 4) goNext(); }}
              placeholder="Jul 15 – Jul 25"
              style={{ ...bigInputStyle, fontSize: isMobile ? "20px" : "26px" }} />
            <div style={{ fontSize: "12px", color: C.muted2, marginTop: "12px" }}>e.g. Jul 15 – Jul 25</div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "20px", cursor: "pointer" }} onClick={() => setFlexDates(f => !f)}>
              <div style={{ width: "18px", height: "18px", borderRadius: "4px", border: `0.5px solid ${flexDates ? C.gold : C.border2}`, background: flexDates ? C.goldDim : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", flexShrink: 0 }}>
                {flexDates && <span style={{ fontSize: "11px", color: C.gold }}>✓</span>}
              </div>
              <span style={{ fontSize: "13px", color: C.muted }}>My dates are flexible by a few days</span>
            </div>
            {continueBtn(goNext, dates.length < 5)}
          </div>
        )}

        {step === 3 && (
          <div style={stepStyle} key="s3">
            <div style={questionStyle}>How many stops are you ok with?</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
              {["Nonstop only", "Up to 1 stop", "Up to 2 stops", "No preference"].map(opt => (
                <button key={opt} style={pillStyle(connections === opt)} onClick={() => { setConnections(opt); setTimeout(goNext, 300); }}>{opt}</button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div style={stepStyle} key="s4">
            <div style={questionStyle}>When do you prefer to fly?</div>
            <div style={hintStyle}>For your outbound flight.</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
              {[
                { label: "Morning", sub: "Before noon" },
                { label: "Afternoon", sub: "Noon – 6pm" },
                { label: "Evening", sub: "After 6pm" },
                { label: "No preference", sub: "Any time" },
              ].map(opt => (
                <button key={opt.label} style={{ ...pillStyle(departurePref === opt.label), display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "16px 28px" }}
                  onClick={() => { setDeparturePref(opt.label); setTimeout(goNext, 300); }}>
                  <span style={{ fontSize: "15px", fontWeight: "500" }}>{opt.label}</span>
                  <span style={{ fontSize: "12px", opacity: 0.7 }}>{opt.sub}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div style={stepStyle} key="s5">
            <div style={questionStyle}>Who's traveling?</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
              {["Solo", "Couple", "Group of friends", "Family"].map(opt => (
                <button key={opt} style={pillStyle(travelers === opt)} onClick={() => { setTravelers(opt); setTimeout(goNext, 300); }}>{opt}</button>
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          <div style={stepStyle} key="s6">
            <div style={questionStyle}>What's your cash comfort level?</div>
            <div style={hintStyle}>How much are you ok spending out of pocket on this trip,<br />on top of what your points cover?</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
              {["Under $500", "$500–1,000", "$1,000–2,000", "$2,000+", "Flexible"].map(opt => (
                <button key={opt} style={pillStyle(budget === opt)} onClick={() => { setBudget(opt); setTimeout(goNext, 300); }}>{opt}</button>
              ))}
            </div>
          </div>
        )}

        {step === 7 && (
          <div style={stepStyle} key="s7">
            <div style={questionStyle}>Describe your ideal trip.</div>
            <div style={hintStyle}>Weather, vibe, activities — anything that matters to you.</div>
            <textarea ref={inputRef} value={vibe}
  onChange={e => { setVibe(e.target.value); e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
  className="dim-placeholder"
  placeholder="Mild weather, beach access, good food scene, not too touristy..."
  style={{ background: "transparent", border: "none", borderBottom: `2px solid ${C.gold}`, color: C.text, fontSize: isMobile ? "16px" : "18px", textAlign: "center", outline: "none", width: "100%", maxWidth: "480px", padding: "8px 0", fontFamily: "inherit", resize: "none", height: "60px", lineHeight: "1.6", overflow: "hidden" }} />
            {error && <div style={{ fontSize: "13px", color: "#e05555", marginTop: "16px" }}>{error}</div>}
            <button onClick={handleSubmit} disabled={vibe.length < 10} style={{ marginTop: "32px", padding: "14px 40px", background: vibe.length < 10 ? C.surface2 : C.gold, color: vibe.length < 10 ? C.muted2 : "#0d0d0d", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "600", cursor: vibe.length < 10 ? "default" : "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
              Find my destinations →
            </button>
            <div style={{ fontSize: "12px", color: C.muted2, marginTop: "12px" }}>Takes about 30 seconds</div>
          </div>
        )}
      </div>
    </div>
  );
}

function DestCard({ dest, onClick, index }) {
  const [photo, setPhoto] = useState(null);
  const [sun, setSun] = useState(null);
  const [hovered, setHovered] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const d = new Date(2026, 6, 15);
    getSunTimes(dest.coordinates.lat, dest.coordinates.lng, d.toISOString().split("T")[0]).then(setSun);
    getCityPhoto(`${dest.city} ${dest.country} city landmark colorful`).then(setPhoto);
  }, [dest]);

  return (
    <div className={`animate-${Math.min(index + 2, 6)}`} onClick={onClick}
      onMouseEnter={() => !isMobile && setHovered(true)}
      onMouseLeave={() => !isMobile && setHovered(false)}
      style={{ display: "flex", flexDirection: isMobile ? "column" : "row", height: isMobile ? "auto" : "190px", background: C.surface, border: `0.5px solid ${hovered ? C.border2 : C.border}`, borderRadius: "12px", overflow: "hidden", cursor: "pointer", marginBottom: "12px", transform: hovered ? "translateY(-2px)" : "translateY(0)", boxShadow: hovered ? "0 8px 32px rgba(0,0,0,0.4)" : "none", transition: "all 0.2s ease", WebkitTapHighlightColor: "transparent" }}>
      <div style={{ width: isMobile ? "100%" : "240px", height: isMobile ? "200px" : "100%", flexShrink: 0, position: "relative", overflow: "hidden", background: C.surface2 }}>
        {photo ? <img src={photo} alt={dest.city} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }} />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "52px" }}>{dest.emoji}</div>}
        <div style={{ position: "absolute", inset: 0, background: isMobile ? "linear-gradient(to bottom, transparent 30%, rgba(20,20,20,0.9) 100%)" : "linear-gradient(to right, transparent 50%, rgba(20,20,20,0.7) 100%)" }} />
        {isMobile && (
          <div style={{ position: "absolute", bottom: "12px", left: "14px", right: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "18px" }}>{dest.emoji}</span>
              <span style={{ fontSize: "18px", fontWeight: "600", letterSpacing: "-0.02em", color: C.white }}>{dest.city}</span>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>· {dest.country}</span>
            </div>
          </div>
        )}
      </div>
      <div style={{ flex: 1, padding: "20px 22px", display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>
        {!isMobile && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "2px" }}>
                <span style={{ fontSize: "16px", flexShrink: 0 }}>{dest.emoji}</span>
                <span style={{ fontSize: "19px", fontWeight: "600", letterSpacing: "-0.02em", color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{dest.city}</span>
              </div>
              <div style={{ fontSize: "12px", color: C.muted, marginLeft: "23px" }}>{dest.country}</div>
            </div>
            <span style={{ fontSize: "12px", color: C.muted, border: `0.5px solid ${C.border2}`, borderRadius: "5px", padding: "4px 10px", whiteSpace: "nowrap", flexShrink: 0 }}>View details →</span>
          </div>
        )}
        <div style={{ fontSize: "13px", color: C.muted, lineHeight: "1.6", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: isMobile ? 3 : 2, WebkitBoxOrient: "vertical", marginBottom: isMobile ? "12px" : "0" }}>{dest.why}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
            {[dest.flightTime && `✈ ${dest.flightTime}`, dest.tempF && `🌡 ${dest.tempF}`, dest.pointsNeeded && `💳 ${dest.pointsNeeded}`].filter(Boolean).map(s => (
              <span key={s} style={{ fontSize: "11px", padding: "3px 8px", background: C.surface2, border: `0.5px solid ${C.border2}`, borderRadius: "20px", color: C.muted, whiteSpace: "nowrap" }}>{s}</span>
            ))}
          </div>
          {sun && <div style={{ fontSize: "11px", color: C.muted2, whiteSpace: "nowrap", flexShrink: 0 }}>🌅 {sun.sunrise} · 🌇 {sun.sunset}</div>}
        </div>
        {isMobile && <div style={{ fontSize: "12px", color: C.muted2, marginTop: "8px" }}>Tap to see flights, hotels & how to book →</div>}
      </div>
    </div>
  );
}

function Results({ destinations, form, onRefine, onSelect, onHome, onAbout, onMission }) {
  const isMobile = useIsMobile();
  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <Nav onHome={onHome} onAbout={onAbout} onMission={onMission} onBack={onRefine} backLabel="← Refine search" />
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: isMobile ? "24px 16px 80px" : "40px 24px 80px" }}>
        <div className="animate-1" style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: isMobile ? "20px" : "26px", fontWeight: "600", letterSpacing: "-0.03em", color: C.text, marginBottom: "12px" }}>3 destinations for your trip</h1>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {[form.origin && `✈ ${form.origin}`, form.dates && `📅 ${form.dates}`, form.connections, form.travelers, form.budget].filter(Boolean).map(pill => (
              <span key={pill} style={{ fontSize: "12px", padding: "4px 11px", background: C.surface, border: `0.5px solid ${C.border2}`, borderRadius: "20px", color: C.muted }}>{pill}</span>
            ))}
          </div>
        </div>
        {destinations.map((dest, i) => <DestCard key={i} dest={dest} index={i} onClick={() => onSelect(dest)} />)}
      </div>
    </div>
  );
}

function Tooltip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-flex" }}>
      <span onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} onClick={() => setShow(s => !s)}
        style={{ width: "16px", height: "16px", borderRadius: "50%", background: C.surface2, border: `0.5px solid ${C.border2}`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: C.muted, cursor: "pointer", marginLeft: "6px", verticalAlign: "middle", flexShrink: 0 }}>?</span>
      {show && (
        <div style={{ position: "absolute", bottom: "120%", left: "50%", transform: "translateX(-50%)", background: C.surface2, border: `0.5px solid ${C.border2}`, borderRadius: "8px", padding: "10px 14px", fontSize: "12px", color: C.muted, lineHeight: "1.6", width: "240px", zIndex: 200, boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}>
          {text}
        </div>
      )}
    </span>
  );
}

function HowToBook({ steps, isOpen, onToggle }) {
  return (
    <div style={{ marginTop: "10px" }}>
      <button onClick={onToggle} style={{ display: "flex", alignItems: "center", gap: "6px", background: isOpen ? C.goldDim : "transparent", border: `0.5px solid ${isOpen ? C.goldBorder : C.border2}`, borderRadius: "6px", padding: "6px 12px", fontSize: "12px", color: isOpen ? C.gold : C.muted, cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit" }}>
        <span>💡</span>
        How to book with points
        <span style={{ fontSize: "10px", transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", display: "inline-block" }}>▼</span>
      </button>
      {isOpen && (
        <div style={{ marginTop: "10px", padding: "14px 16px", background: C.surface2, border: `0.5px solid ${C.border2}`, borderRadius: "8px" }}>
          {steps?.map((step, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: i < steps.length - 1 ? "10px" : "0" }}>
              <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: C.goldDim, border: `0.5px solid ${C.goldBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: C.gold, flexShrink: 0, fontWeight: "600" }}>{i + 1}</div>
              <p style={{ fontSize: "12px", color: C.muted, lineHeight: "1.6", margin: 0 }}>{step}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DetailView({ dest, form, onBack, onHome, onAbout, onMission }) {
  const [photo, setPhoto] = useState(null);
  const [sun, setSun] = useState(null);
  const [openHow, setOpenHow] = useState({});
  const isMobile = useIsMobile();
  const toggleHow = (key) => setOpenHow(prev => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => {
    getCityPhoto(`${dest.city} ${dest.country} city landmark colorful`).then(setPhoto);
    const d = new Date(2026, 6, 15);
    getSunTimes(dest.coordinates.lat, dest.coordinates.lng, d.toISOString().split("T")[0]).then(setSun);
    window.scrollTo(0, 0);
  }, [dest]);

  const SectionLabel = ({ children }) => (
    <div style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted2, marginBottom: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
      {children}<div style={{ flex: 1, height: "0.5px", background: C.border }} />
    </div>
  );

  const FlightRow = ({ flight, label, howKey }) => (
    <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: "10px", padding: "16px 18px", marginBottom: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px", gap: "12px" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: "11px", color: C.muted2, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>{label}</div>
          <div style={{ fontSize: isMobile ? "15px" : "17px", fontWeight: "600", letterSpacing: "-0.02em", color: C.text, marginBottom: "3px" }}>{flight.route}</div>
          <div style={{ fontSize: "13px", color: C.muted }}>{flight.airline}</div>
          {flight.departure && flight.arrival && <div style={{ fontSize: "13px", color: C.text, marginTop: "3px" }}>{flight.departure} → {flight.arrival}</div>}
        </div>
        <a href={buildBookingUrl(flight, form?.dates)} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
          style={{ padding: "8px 16px", background: C.text, color: C.bg, borderRadius: "7px", fontSize: "13px", fontWeight: "500", whiteSpace: "nowrap", flexShrink: 0, textDecoration: "none" }}>
          Book →
        </a>
      </div>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "11px", padding: "3px 9px", background: C.goldDim, border: `0.5px solid ${C.goldBorder}`, borderRadius: "20px", color: C.gold }}>{flight.points}</span>
        {flight.cash && <span style={{ fontSize: "11px", padding: "3px 9px", background: C.surface2, border: `0.5px solid ${C.border2}`, borderRadius: "20px", color: C.muted }}>+{flight.cash} taxes</span>}
      </div>
      {flight.bookingSteps?.length > 0 && <HowToBook steps={flight.bookingSteps} isOpen={openHow[howKey]} onToggle={() => toggleHow(howKey)} />}
    </div>
  );

  const HotelRow = ({ hotel, howKey }) => (
    <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: "10px", padding: "16px 18px", marginBottom: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: "16px", fontWeight: "600", letterSpacing: "-0.01em", color: C.text, marginBottom: "3px" }}>{hotel.name}</div>
          <div style={{ fontSize: "13px", color: C.muted, marginBottom: "10px" }}>{hotel.program}</div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", padding: "3px 9px", background: C.goldDim, border: `0.5px solid ${C.goldBorder}`, borderRadius: "20px", color: C.gold }}>{hotel.pointsPerNight}</span>
            <span style={{ fontSize: "11px", padding: "3px 9px", background: C.surface2, border: `0.5px solid ${C.border2}`, borderRadius: "20px", color: C.muted }}>{hotel.cashRate} cash</span>
          </div>
        </div>
        <a href={hotel.bookUrl || "#"} target="_blank" rel="noopener noreferrer"
          style={{ padding: "8px 16px", background: C.text, color: C.bg, borderRadius: "7px", fontSize: "13px", fontWeight: "500", whiteSpace: "nowrap", flexShrink: 0, textDecoration: "none" }}>
          Book →
        </a>
      </div>
      {hotel.bookingSteps?.length > 0 && <HowToBook steps={hotel.bookingSteps} isOpen={openHow[howKey]} onToggle={() => toggleHow(howKey)} />}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <div style={{ position: "relative", height: isMobile ? "260px" : "380px", overflow: "hidden", background: C.surface2 }}>
        {photo && <img src={photo} alt={dest.city} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.55 }} />}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(13,13,13,0.2), rgba(13,13,13,0.95))" }} />
        <div style={{ position: "absolute", inset: 0, padding: isMobile ? "16px" : "24px 32px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <button onClick={onBack} style={{ alignSelf: "flex-start", background: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.12)", color: C.text, padding: "7px 16px", borderRadius: "20px", fontSize: "13px", cursor: "pointer" }}>← Back</button>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <span style={{ fontSize: isMobile ? "22px" : "28px" }}>{dest.emoji}</span>
                <h1 style={{ fontSize: isMobile ? "32px" : "52px", fontWeight: "700", letterSpacing: "-0.03em", color: C.white }}>{dest.city}</h1>
              </div>
              <div style={{ fontSize: "15px", color: "rgba(255,255,255,0.5)", marginLeft: isMobile ? "32px" : "38px" }}>{dest.country}</div>
            </div>
            {sun && (
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "13px", color: "rgba(255,255,255,0.6)", textAlign: "right" }}>
                <span>🌅 {sun.sunrise}</span>
                <span>🌇 {sun.sunset}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: isMobile ? "24px 16px 80px" : "40px 32px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "32px", marginBottom: "32px" }}>
          <div>
            <SectionLabel>Outbound flight</SectionLabel>
            {dest.outboundFlights?.slice(0, 1).map((f, i) => <FlightRow key={i} flight={f} label="Outbound" howKey={`out-${i}`} />)}
          </div>
          <div>
            <SectionLabel>Return flight</SectionLabel>
            {dest.returnFlights?.slice(0, 1).map((f, i) => <FlightRow key={i} flight={f} label="Return" howKey={`ret-${i}`} />)}
          </div>
        </div>
        <div style={{ marginBottom: "32px" }}>
          <SectionLabel>Hotels</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "10px" }}>
            {dest.hotels?.map((h, i) => <HotelRow key={i} hotel={h} howKey={`hotel-${i}`} />)}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px", marginBottom: "32px" }}>
          <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: "10px", padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
              <div style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted2 }}>Estimated cash on top of points</div>
              <Tooltip text="Covers award flight taxes/fees plus hotel nights not fully redeemable with your points. Based on typical redemption rates for your specific programs. Actual costs vary." />
            </div>
            <div style={{ fontSize: isMobile ? "28px" : "36px", fontWeight: "700", letterSpacing: "-0.03em", color: C.text, marginBottom: "4px" }}>{dest.cashEstimate}</div>
            <div style={{ fontSize: "12px", color: C.muted2 }}>flights + hotel · excl. food & activities</div>
          </div>
          {dest.localCosts && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
              {[{ icon: "🚗", label: "Avg Uber", val: dest.localCosts.uber }, { icon: "🍺", label: "Beer", val: dest.localCosts.beer }, { icon: "🍽️", label: "Dinner", val: dest.localCosts.dinner }].map(item => item.val && (
                <div key={item.label} style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: "10px", padding: "14px 10px", textAlign: "center" }}>
                  <div style={{ fontSize: "22px", marginBottom: "6px" }}>{item.icon}</div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: C.text, marginBottom: "3px" }}>{item.val}</div>
                  <div style={{ fontSize: "10px", color: C.muted2 }}>{item.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [points, setPoints] = useState({});
  const [destinations, setDestinations] = useState([]);
  const [selectedDest, setSelectedDest] = useState(null);
  const [form, setForm] = useState({});

  const navHandlers = {
    onHome: () => { setSelectedDest(null); setScreen("landing"); },
    onAbout: () => { setSelectedDest(null); setScreen("about"); },
    onMission: () => { setSelectedDest(null); setScreen("mission"); },
  };

  if (selectedDest) return <DetailView dest={selectedDest} form={form} onBack={() => setSelectedDest(null)} {...navHandlers} />;

  return (
    <div>
      {screen === "landing" && <Landing onStart={() => setScreen("points")} {...navHandlers} />}
      {screen === "about" && <About onBack={() => setScreen("landing")} {...navHandlers} />}
      {screen === "mission" && <Mission onBack={() => setScreen("landing")} {...navHandlers} />}
      {screen === "points" && <PointsInput onContinue={(p) => { setPoints(p); setScreen("trip"); }} onBack={() => setScreen("landing")} {...navHandlers} />}
      {screen === "trip" && <TripForm points={points} onResults={(dests, f) => { setDestinations(dests); setForm(f); setScreen("results"); }} onBack={() => setScreen("points")} {...navHandlers} />}
      {screen === "results" && <Results destinations={destinations} form={form} onRefine={() => setScreen("trip")} onSelect={setSelectedDest} {...navHandlers} />}
    </div>
  );
}