import { useState, useEffect } from "react";

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

function buildBookingUrl(flight) {
  if (!flight?.airline || !flight?.route) return "#";
  const airline = flight.airline.toLowerCase();
  const routeParts = flight.route.replace(/\s/g, "").split("→");
  const from = routeParts[0] || "";
  const to = routeParts[1] || "";
  if (airline.includes("united")) return `https://www.united.com/en/us/book-flight/united-reservations?from=${from}&to=${to}&cabinType=economy`;
  if (airline.includes("american") || airline.includes("aadvantage")) return `https://www.aa.com/booking/search?from=${from}&to=${to}`;
  if (airline.includes("delta")) return `https://www.delta.com/us/en/book-trip/flight-results?originAirportCode=${from}&destinationAirportCode=${to}`;
  if (airline.includes("jetblue")) return `https://www.jetblue.com/booking/flights?from=${from}&to=${to}`;
  if (airline.includes("alaska")) return `https://www.alaskaair.com/booking/choose-flights/${from}/${to}`;
  if (airline.includes("tap")) return `https://www.flytap.com/en-us/book-flights?origin=${from}&destination=${to}`;
  if (airline.includes("british") || airline.includes("ba")) return `https://www.britishairways.com/travel/redeem/execclub/_gf/en_us?eId=106&from=${from}&to=${to}`;
  if (airline.includes("air france") || airline.includes("flying blue")) return `https://wwws.airfrance.us/search/offers?origin=${from}&destination=${to}`;
  return `https://www.google.com/travel/flights`;
}

async function getSunTimes(lat, lng, date) {
  try {
    const res = await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=${date}&formatted=0`);
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
        @keyframes flyPlane { 0% { left: 0px; } 50% { left: calc(100% - 32px); } 100% { left: 0px; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        select option { background: #1a1a1a; color: #e8e6e1; }
      `}</style>
    </div>
  );
}

function Nav({ onHome, onBack, backLabel, onAbout, onMission }) {
  const isMobile = useIsMobile();
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 100, height: "52px", background: "rgba(13,13,13,0.92)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: `0.5px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 20px", gap: isMobile ? "14px" : "20px" }}>
      <span onClick={onHome} style={{ fontSize: "14px", fontWeight: "600", letterSpacing: "-0.02em", color: C.text, cursor: onHome ? "pointer" : "default", flexShrink: 0 }}>
        Waypoint
      </span>
      {!isMobile && onAbout && <span onClick={onAbout} style={{ fontSize: "13px", color: C.muted, cursor: "pointer" }} onMouseEnter={e => e.target.style.color = C.text} onMouseLeave={e => e.target.style.color = C.muted}>About</span>}
      {!isMobile && onMission && <span onClick={onMission} style={{ fontSize: "13px", color: C.muted, cursor: "pointer" }} onMouseEnter={e => e.target.style.color = C.text} onMouseLeave={e => e.target.style.color = C.muted}>Our Mission</span>}
      <div style={{ flex: 1 }} />
      {onBack && (
        <span onClick={onBack} style={{ fontSize: "12px", color: C.muted, cursor: "pointer", whiteSpace: "nowrap" }}
          onMouseEnter={e => e.target.style.color = C.text} onMouseLeave={e => e.target.style.color = C.muted}>
          {backLabel || "← Back"}
        </span>
      )}
    </nav>
  );
}

function PlaneLoader({ message }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "32px", padding: "24px" }}>
      <div style={{ position: "relative", width: "200px", height: "48px" }}>
        <div style={{ position: "absolute", bottom: "8px", left: 0, right: 0, height: "0.5px", background: `linear-gradient(to right, transparent, ${C.border2}, transparent)` }} />
        <div style={{ position: "absolute", bottom: "0px", animation: "flyPlane 2.5s ease-in-out infinite" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill={C.gold}>
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
          </svg>
        </div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "15px", color: C.text, marginBottom: "8px", fontWeight: "500" }}>{message || "Finding your destinations..."}</div>
        <div style={{ fontSize: "12px", color: C.muted }}>Searching flights, hotels, and optimizing your points</div>
      </div>
    </div>
  );
}

function Landing({ onStart, onAbout, onMission }) {
  const isMobile = useIsMobile();
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column" }}>
      <Nav onAbout={onAbout} onMission={onMission} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: isMobile ? "60px 20px 32px" : "80px 24px 0", textAlign: "center" }}>
        <div className="animate-1" style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: C.goldDim, border: `0.5px solid ${C.goldBorder}`, borderRadius: "100px", padding: "4px 12px", fontSize: "11px", color: C.gold, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "24px" }}>
          <span style={{ fontSize: "8px" }}>●</span> AI-powered points optimization
        </div>
        <h1 className="animate-2" style={{ fontSize: isMobile ? "44px" : "clamp(40px, 6vw, 72px)", fontWeight: "700", letterSpacing: "-0.04em", lineHeight: "1.05", color: C.text, maxWidth: "720px", marginBottom: "16px" }}>
          Your points.<br /><span style={{ color: C.gold }}>Your next trip.</span>
        </h1>
        <p className="animate-3" style={{ fontSize: isMobile ? "15px" : "17px", color: C.muted, maxWidth: "440px", lineHeight: "1.7", marginBottom: "32px", padding: "0 8px" }}>
          Tell us your points and what you're looking for. We'll pick the destination and plan everything — flights, hotels, how to book it all free.
        </p>
        <div className="animate-4" style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "12px", alignItems: "center", marginBottom: isMobile ? "32px" : "60px", width: isMobile ? "100%" : "auto" }}>
          <button onClick={onStart} style={{ padding: "14px 28px", background: C.text, color: C.bg, border: "none", borderRadius: "7px", fontSize: "15px", fontWeight: "500", cursor: "pointer", WebkitTapHighlightColor: "transparent", width: isMobile ? "100%" : "auto" }}>
            Plan my trip →
          </button>
          <span style={{ fontSize: "12px", color: C.muted2 }}>Free to try</span>
        </div>
        <div className="animate-5" style={{ display: "flex", gap: isMobile ? "32px" : "48px", paddingTop: "32px", borderTop: `0.5px solid ${C.border}`, marginBottom: "24px" }}>
          {isMobile
            ? [{ n: "30+", l: "Programs" }, { n: "150+", l: "Airlines & hotels" }, { n: "$0", l: "Fees" }].map(s => (
              <div key={s.l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "20px", fontWeight: "600", color: C.text, marginBottom: "2px" }}>{s.n}</div>
                <div style={{ fontSize: "10px", color: C.muted }}>{s.l}</div>
              </div>
            ))
            : [{ n: "30+", l: "Loyalty programs" }, { n: "150+", l: "Airlines & hotels" }, { n: "$0", l: "Hidden fees" }].map(s => (
              <div key={s.l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "24px", fontWeight: "600", letterSpacing: "-0.03em", color: C.text, marginBottom: "4px" }}>{s.n}</div>
                <div style={{ fontSize: "12px", color: C.muted }}>{s.l}</div>
              </div>
            ))
          }
        </div>
      </div>
      <Marquee />
      <div style={{ padding: isMobile ? "14px 20px" : "16px 24px", display: "flex", alignItems: "center", gap: "8px" }}>
        {isMobile ? (
          <>
            <span onClick={onAbout} style={{ fontSize: "11px", color: C.muted, cursor: "pointer" }}>About</span>
            <span style={{ fontSize: "11px", color: C.muted2 }}>·</span>
            <span onClick={onMission} style={{ fontSize: "11px", color: C.muted, cursor: "pointer" }}>Our Mission</span>
          </>
        ) : (
          <>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#2d9e5f" }} />
            <span style={{ fontSize: "12px", color: C.muted2 }}>
              Already have an account?{" "}
              <span style={{ color: C.muted, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px" }}>Sign in</span>
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function About({ onHome, onBack, onAbout, onMission }) {
  const isMobile = useIsMobile();
  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <Nav onHome={onHome} onBack={onBack} backLabel="← Back" onAbout={onAbout} onMission={onMission} />
      <div style={{ maxWidth: "580px", margin: "0 auto", padding: isMobile ? "40px 20px" : "64px 24px" }}>
        <div className="animate-1" style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.gold, marginBottom: "14px" }}>About</div>
        <h1 className="animate-2" style={{ fontSize: isMobile ? "28px" : "34px", fontWeight: "700", letterSpacing: "-0.04em", color: C.text, marginBottom: "20px", lineHeight: "1.15" }}>Built out of frustration.</h1>
        <p className="animate-3" style={{ fontSize: "15px", color: C.muted, lineHeight: "1.85", marginBottom: "16px" }}>
          I'm 24, living in New Jersey, working in fintech in New York City. I have hundreds of thousands of points across Chase, Marriott, and United — and every time I wanted to plan a trip, I spent hours bouncing between Seats.aero, Rooms.aero, Reddit threads, and transfer partner charts just to figure out where I could even afford to go.
        </p>
        <p className="animate-4" style={{ fontSize: "15px", color: C.muted, lineHeight: "1.85" }}>
          That process is broken. The information exists — it's just scattered across a dozen different tools, none of which talk to each other. Waypoint is the single tool I always wanted and nobody had built yet.
        </p>
        <div className="animate-5" style={{ display: "flex", gap: "32px", marginTop: "32px", paddingTop: "24px", borderTop: `0.5px solid ${C.border}` }}>
          {[{ n: "30+", l: "Loyalty programs" }, { n: "60 sec", l: "Avg. time to results" }, { n: "$0", l: "Hidden fees" }].map(s => (
            <div key={s.l}>
              <div style={{ fontSize: "20px", fontWeight: "700", letterSpacing: "-0.03em", color: C.text, marginBottom: "3px" }}>{s.n}</div>
              <div style={{ fontSize: "11px", color: C.muted2 }}>{s.l}</div>
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
      <div style={{ maxWidth: "580px", margin: "0 auto", padding: isMobile ? "40px 20px" : "64px 24px" }}>
        <div className="animate-1" style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.gold, marginBottom: "14px" }}>Our Mission</div>
        <h1 className="animate-2" style={{ fontSize: isMobile ? "28px" : "34px", fontWeight: "700", letterSpacing: "-0.04em", color: C.text, marginBottom: "20px", lineHeight: "1.15" }}>
          You shouldn't need to be an expert to travel like one.
        </h1>
        <p className="animate-3" style={{ fontSize: "15px", color: C.muted, lineHeight: "1.85", marginBottom: "16px" }}>
          The people who get the most out of their points — the ones flying business class to Tokyo on 60,000 miles — spent years learning transfer partners, sweet spots, and redemption values. Most people never do.
        </p>
        <p className="animate-4" style={{ fontSize: "15px", color: C.muted, lineHeight: "1.85", marginBottom: "16px" }}>
          Most people have no idea how much value is sitting in their accounts. A sign-up bonus sitting untouched for two years. Marriott points worth three free nights in Lisbon. Chase UR that transfers to a dozen airlines at 1:1.
        </p>
        <p className="animate-5" style={{ fontSize: "15px", color: C.muted, lineHeight: "1.85" }}>
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
      <div style={{ maxWidth: "480px", margin: "0 auto", padding: isMobile ? "32px 20px 60px" : "48px 24px" }}>
        <div className="animate-1" style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.gold, marginBottom: "12px" }}>Step 1 of 2</div>
        <h1 className="animate-2" style={{ fontSize: isMobile ? "24px" : "28px", fontWeight: "600", letterSpacing: "-0.03em", color: C.text, marginBottom: "8px" }}>Your points balances</h1>
        <p className="animate-3" style={{ fontSize: "14px", color: C.muted, marginBottom: "28px", lineHeight: "1.6" }}>Enter what you have. Skip anything at zero.</p>
        <div className="animate-4" style={{ display: "inline-flex", gap: "2px", background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: "8px", padding: "3px", marginBottom: "20px" }}>
          {["bank", "airline", "hotel"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "6px 14px", borderRadius: "5px", border: "none", background: activeTab === tab ? C.surface2 : "transparent", color: activeTab === tab ? C.text : C.muted, fontSize: "12px", fontWeight: activeTab === tab ? "500" : "400", transition: "all 0.15s", cursor: "pointer", WebkitTapHighlightColor: "transparent" }}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div className="animate-5" style={{ marginBottom: "28px" }}>
          {POINTS_DATA[activeTab].map(p => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: `0.5px solid ${C.border}` }}>
              <span style={{ fontSize: "13px", color: points[p.id] ? C.text : C.muted, transition: "color 0.15s", paddingRight: "12px" }}>{p.name}</span>
              <input type="text" inputMode="numeric" placeholder="0" value={fmt(points[p.id])} onChange={e => handleChange(p.id, e.target.value)}
                style={{ background: C.surface2, border: `0.5px solid ${C.border2}`, borderRadius: "5px", color: C.gold, fontSize: "13px", fontWeight: "500", textAlign: "right", width: "110px", padding: "6px 8px", outline: "none", fontFamily: "inherit", flexShrink: 0 }}
                onFocus={e => e.target.style.borderColor = C.gold}
                onBlur={e => e.target.style.borderColor = C.border2} />
            </div>
          ))}
        </div>
        <button className="animate-6" onClick={() => onContinue(points)} style={{ width: "100%", padding: "14px", background: C.text, color: C.bg, border: "none", borderRadius: "7px", fontSize: "15px", fontWeight: "500", marginBottom: "12px", cursor: "pointer", WebkitTapHighlightColor: "transparent" }}>
          Continue →
        </button>
        <p onClick={() => onContinue({})} style={{ textAlign: "center", fontSize: "12px", color: C.muted2, cursor: "pointer", padding: "8px" }}>Skip for now</p>
      </div>
    </div>
  );
}

function AirportInput({ value, onChange }) {
  const [input, setInput] = useState("");
  const airports = value ? value.split(",").map(a => a.trim()).filter(Boolean) : [];
  const addAirport = (code) => {
    const cleaned = code.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3);
    if (cleaned.length === 3 && !airports.includes(cleaned)) onChange([...airports, cleaned].join(", "));
    setInput("");
  };
  const removeAirport = (code) => onChange(airports.filter(a => a !== code).join(", "));
  return (
    <div style={{ background: C.surface, border: `0.5px solid ${C.border2}`, borderRadius: "7px", padding: "8px 10px", display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center", minHeight: "44px" }}>
      {airports.map(a => (
        <span key={a} style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: C.surface2, border: `0.5px solid ${C.border2}`, borderRadius: "5px", padding: "4px 8px", fontSize: "13px", color: C.text, fontWeight: "500" }}>
          {a}
          <span onClick={() => removeAirport(a)} style={{ color: C.muted, cursor: "pointer", fontSize: "16px", lineHeight: "1", padding: "0 2px" }}>×</span>
        </span>
      ))}
      <input value={input}
        onChange={e => setInput(e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3))}
        onKeyDown={e => { if ((e.key === "Enter" || e.key === "," || e.key === " ") && input.length === 3) { e.preventDefault(); addAirport(input); } }}
        onBlur={() => { if (input.length === 3) addAirport(input); }}
        placeholder={airports.length === 0 ? "Type EWR, press Enter..." : "Add another..."}
        style={{ border: "none", background: "transparent", color: C.text, fontSize: "13px", fontFamily: "inherit", outline: "none", minWidth: "120px", flex: 1, padding: "2px 0" }} />
    </div>
  );
}

function Tooltip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-flex" }}>
      <span onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} onClick={() => setShow(s => !s)}
        style={{ width: "16px", height: "16px", borderRadius: "50%", background: C.surface2, border: `0.5px solid ${C.border2}`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: C.muted, cursor: "pointer", marginLeft: "6px", verticalAlign: "middle", flexShrink: 0 }}>
        ?
      </span>
      {show && (
        <div style={{ position: "absolute", bottom: "120%", left: "50%", transform: "translateX(-50%)", background: C.surface2, border: `0.5px solid ${C.border2}`, borderRadius: "8px", padding: "10px 14px", fontSize: "12px", color: C.muted, lineHeight: "1.6", width: "240px", zIndex: 200, boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}>
          {text}
        </div>
      )}
    </span>
  );
}

function TripForm({ points, onResults, onBack, onHome, onAbout, onMission }) {
  const [form, setForm] = useState({ origin: "", dates: "", connections: "Nonstop only", earliestDep: "8:00 AM or later", returnDep: "12:00 PM or later", travelers: "Solo", budget: "", vibe: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMobile = useIsMobile();
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const inputStyle = { width: "100%", padding: "10px 12px", background: C.surface, border: `0.5px solid ${C.border2}`, borderRadius: "7px", color: C.text, fontSize: "14px", fontFamily: "inherit", outline: "none", WebkitAppearance: "none" };
  const labelStyle = { fontSize: "11px", color: C.muted, letterSpacing: "0.04em", display: "flex", alignItems: "center", marginBottom: "7px" };

  const handleSubmit = async () => {
    if (!form.origin || !form.dates || !form.vibe) { setError("Please fill in departure airports, dates, and trip vibe."); return; }
    setError(null);
    setLoading(true);
    const tripDescription = `Origin airports: ${form.origin}\nDates: ${form.dates}\nConnections: ${form.connections}\nEarliest departure: ${form.earliestDep}\nReturn earliest departure: ${form.returnDep}\nTravelers: ${form.travelers}\nCash budget on top of points: ${form.budget || "flexible"}\nTrip vibe: ${form.vibe}`.trim();
    try {
      const response = await fetch("/api/plan", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points, tripDescription }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      onResults(data.destinations, form);
    } catch { setError("Something went wrong. Please try again."); }
    setLoading(false);
  };

  if (loading) return <PlaneLoader message="Finding your destinations..." />;

  const timeOptions = ["Any time","5:00 AM or later","6:00 AM or later","7:00 AM or later","8:00 AM or later","9:00 AM or later","10:00 AM or later","11:00 AM or later","12:00 PM or later","1:00 PM or later","2:00 PM or later","3:00 PM or later","4:00 PM or later","5:00 PM or later","6:00 PM or later","7:00 PM or later","8:00 PM or later","9:00 PM or later","10:00 PM or later"];
  const returnOptions = ["Any time","6:00 AM or later","7:00 AM or later","8:00 AM or later","9:00 AM or later","10:00 AM or later","11:00 AM or later","12:00 PM or later","1:00 PM or later","2:00 PM or later","3:00 PM or later","4:00 PM or later","5:00 PM or later","6:00 PM or later"];

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <Nav onHome={onHome} onBack={onBack} backLabel="← Back" onAbout={onAbout} onMission={onMission} />
      <div style={{ maxWidth: "520px", margin: "0 auto", padding: isMobile ? "32px 20px 80px" : "48px 24px 80px" }}>
        <div className="animate-1" style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.gold, marginBottom: "12px" }}>Step 2 of 2</div>
        <h1 className="animate-2" style={{ fontSize: isMobile ? "24px" : "28px", fontWeight: "600", letterSpacing: "-0.03em", color: C.text, marginBottom: "8px" }}>Tell us about your trip</h1>
        <p className="animate-3" style={{ fontSize: "14px", color: C.muted, marginBottom: "28px", lineHeight: "1.6" }}>The more detail you give, the better your recommendations.</p>
        <div className="animate-4" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={labelStyle}>Departure airports</label>
            <AirportInput value={form.origin} onChange={v => set("origin", v)} />
            <div style={{ fontSize: "11px", color: C.muted2, marginTop: "5px" }}>Type a 3-letter code and press Enter. Add multiple.</div>
          </div>
          <div>
            <label style={labelStyle}>Travel dates</label>
            <input style={inputStyle} placeholder="Jun 6 - Jun 22" value={form.dates} onChange={e => set("dates", e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={labelStyle}>Connections</label>
              <select style={{ ...inputStyle, cursor: "pointer" }} value={form.connections} onChange={e => set("connections", e.target.value)}>
                <option>Nonstop only</option><option>Up to 1 stop</option><option>Any</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Earliest outbound</label>
              <select style={{ ...inputStyle, cursor: "pointer" }} value={form.earliestDep} onChange={e => set("earliestDep", e.target.value)}>
                {timeOptions.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={labelStyle}>Earliest return</label>
              <select style={{ ...inputStyle, cursor: "pointer" }} value={form.returnDep} onChange={e => set("returnDep", e.target.value)}>
                {returnOptions.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Traveling</label>
              <select style={{ ...inputStyle, cursor: "pointer" }} value={form.travelers} onChange={e => set("travelers", e.target.value)}>
                <option>Solo</option><option>Couple</option><option>Group of friends</option><option>Family</option>
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>
              Cash budget on top of points
              <Tooltip text="This covers your estimated out-of-pocket costs beyond points: hotel nights not covered, meals, Ubers, activities, and cash co-pays on award flights. We factor in local cost of living for each destination." />
            </label>
            <input style={inputStyle} placeholder="$1,000" value={form.budget} onChange={e => set("budget", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Describe your ideal trip</label>
            <textarea style={{ ...inputStyle, resize: "none", height: "110px", lineHeight: "1.6" }}
              placeholder="Mild weather, not too hot. Beach access with good bars but not a party destination. Good food scene..."
              value={form.vibe} onChange={e => set("vibe", e.target.value)} />
            <div style={{ fontSize: "11px", color: C.muted2, marginTop: "5px" }}>Weather, vibe, activities, anything that matters to you.</div>
          </div>
          {error && <div style={{ fontSize: "13px", color: "#e05555", background: "#e0555511", border: "0.5px solid #e0555533", borderRadius: "7px", padding: "10px 14px" }}>{error}</div>}
          <button onClick={handleSubmit} style={{ width: "100%", padding: "14px", background: C.text, color: C.bg, border: "none", borderRadius: "7px", fontSize: "15px", fontWeight: "500", cursor: "pointer", WebkitTapHighlightColor: "transparent" }}>
            Find my destinations →
          </button>
        </div>
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
    const d = new Date(2026, 5, 10);
    getSunTimes(dest.coordinates.lat, dest.coordinates.lng, d.toISOString().split("T")[0]).then(setSun);
    getCityPhoto(`${dest.city} ${dest.country} city landmark colorful`).then(setPhoto);
  }, [dest]);

  return (
    <div className={`animate-${Math.min(index + 2, 6)}`} onClick={onClick}
      onMouseEnter={() => !isMobile && setHovered(true)}
      onMouseLeave={() => !isMobile && setHovered(false)}
      style={{ display: "flex", flexDirection: isMobile ? "column" : "row", height: isMobile ? "auto" : "160px", background: C.surface, border: `0.5px solid ${hovered ? C.border2 : C.border}`, borderRadius: "12px", overflow: "hidden", cursor: "pointer", marginBottom: "10px", transform: hovered ? "translateY(-2px)" : "translateY(0)", boxShadow: hovered ? "0 8px 32px rgba(0,0,0,0.4)" : "none", transition: "all 0.2s ease", WebkitTapHighlightColor: "transparent" }}>
      <div style={{ width: isMobile ? "100%" : "180px", height: isMobile ? "180px" : "100%", flexShrink: 0, position: "relative", overflow: "hidden", background: C.surface2 }}>
        {photo
          ? <img src={photo} alt={dest.city} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }} />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px" }}>{dest.emoji}</div>
        }
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
      <div style={{ flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>
        {!isMobile && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                <span style={{ fontSize: "15px", flexShrink: 0 }}>{dest.emoji}</span>
                <span style={{ fontSize: "16px", fontWeight: "600", letterSpacing: "-0.02em", color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{dest.city}</span>
              </div>
              <div style={{ fontSize: "11px", color: C.muted, marginLeft: "21px" }}>{dest.country}</div>
            </div>
            <span style={{ fontSize: "11px", color: C.muted, border: `0.5px solid ${C.border2}`, borderRadius: "5px", padding: "3px 8px", whiteSpace: "nowrap", flexShrink: 0 }}>View →</span>
          </div>
        )}
        <div style={{ fontSize: isMobile ? "13px" : "12px", color: C.muted, lineHeight: "1.55", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: isMobile ? 3 : 2, WebkitBoxOrient: "vertical", marginBottom: isMobile ? "10px" : "0" }}>{dest.why}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {[dest.flightTime && `✈ ${dest.flightTime}`, dest.tempF && `🌡 ${dest.tempF}`, dest.pointsNeeded && `💳 ${dest.pointsNeeded}`].filter(Boolean).map(s => (
              <span key={s} style={{ fontSize: "10px", padding: "3px 7px", background: C.surface2, border: `0.5px solid ${C.border2}`, borderRadius: "20px", color: C.muted, whiteSpace: "nowrap" }}>{s}</span>
            ))}
          </div>
          {sun && <div style={{ fontSize: "10px", color: C.muted2, whiteSpace: "nowrap", flexShrink: 0 }}>🌅 {sun.sunrise}</div>}
        </div>
        {isMobile && <div style={{ fontSize: "11px", color: C.muted2, marginTop: "8px" }}>Tap to see flights, hotels & itinerary →</div>}
      </div>
    </div>
  );
}

function Results({ destinations, form, onRefine, onSelect, onHome, onAbout, onMission }) {
  const isMobile = useIsMobile();
  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <Nav onHome={onHome} onAbout={onAbout} onMission={onMission} onBack={onRefine} backLabel="← Refine search" />
      <div style={{ maxWidth: "620px", margin: "0 auto", padding: isMobile ? "24px 16px 80px" : "36px 24px 80px" }}>
        <div className="animate-1" style={{ marginBottom: "20px" }}>
          <h1 style={{ fontSize: isMobile ? "20px" : "22px", fontWeight: "600", letterSpacing: "-0.03em", color: C.text, marginBottom: "10px" }}>3 destinations for your trip</h1>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {[form.origin && `✈ ${form.origin}`, form.dates && `📅 ${form.dates}`, form.connections, form.travelers, form.budget && `💵 ${form.budget}`].filter(Boolean).map(pill => (
              <span key={pill} style={{ fontSize: "11px", padding: "3px 9px", background: C.surface, border: `0.5px solid ${C.border2}`, borderRadius: "20px", color: C.muted }}>{pill}</span>
            ))}
          </div>
        </div>
        {destinations.map((dest, i) => <DestCard key={i} dest={dest} index={i} onClick={() => onSelect(dest)} />)}
      </div>
    </div>
  );
}

function DetailView({ dest, form, onBack, onHome, onAbout, onMission }) {
  const [photo, setPhoto] = useState(null);
  const [sun, setSun] = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [loadingItinerary, setLoadingItinerary] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    getCityPhoto(`${dest.city} ${dest.country} city landmark colorful`).then(setPhoto);
    const d = new Date(2026, 5, 10);
    getSunTimes(dest.coordinates.lat, dest.coordinates.lng, d.toISOString().split("T")[0]).then(setSun);
    window.scrollTo(0, 0);
    loadItinerary();
  }, [dest]);

  const loadItinerary = async () => {
    setLoadingItinerary(true);
    try {
      const response = await fetch("/api/itinerary", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: dest.city, country: dest.country, dates: form?.dates, vibe: form?.vibe, travelers: form?.travelers }),
      });
      const data = await response.json();
      if (data.days) setItinerary(data.days);
    } catch { setItinerary(null); }
    setLoadingItinerary(false);
  };

  const SectionLabel = ({ children }) => (
    <div style={{ fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted2, marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
      {children}<div style={{ flex: 1, height: "0.5px", background: C.border }} />
    </div>
  );

  const FlightRow = ({ flight, label }) => (
    <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: "8px", padding: "14px 16px", marginBottom: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px", gap: "12px" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: "10px", color: C.muted2, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>{label}</div>
          <div style={{ fontSize: isMobile ? "14px" : "16px", fontWeight: "600", letterSpacing: "-0.02em", color: C.text, marginBottom: "3px" }}>{flight.route}</div>
          <div style={{ fontSize: "12px", color: C.muted }}>{flight.airline}</div>
          {flight.departure && flight.arrival && <div style={{ fontSize: "12px", color: C.text, marginTop: "3px" }}>{flight.departure} → {flight.arrival}</div>}
        </div>
        <a href={buildBookingUrl(flight)} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
          style={{ padding: "8px 14px", background: C.text, color: C.bg, borderRadius: "6px", fontSize: "12px", fontWeight: "500", whiteSpace: "nowrap", flexShrink: 0, textDecoration: "none", WebkitTapHighlightColor: "transparent" }}>
          Book →
        </a>
      </div>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "11px", padding: "3px 8px", background: C.goldDim, border: `0.5px solid ${C.goldBorder}`, borderRadius: "20px", color: C.gold }}>{flight.points}</span>
        {flight.cash && <span style={{ fontSize: "11px", padding: "3px 8px", background: C.surface2, border: `0.5px solid ${C.border2}`, borderRadius: "20px", color: C.muted }}>+{flight.cash} taxes</span>}
      </div>
    </div>
  );

  const HotelRow = ({ hotel }) => (
    <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: "8px", padding: "14px 16px", marginBottom: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: "15px", fontWeight: "600", letterSpacing: "-0.01em", color: C.text, marginBottom: "2px" }}>{hotel.name}</div>
          <div style={{ fontSize: "12px", color: C.muted, marginBottom: "10px" }}>{hotel.program}</div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", padding: "3px 8px", background: C.goldDim, border: `0.5px solid ${C.goldBorder}`, borderRadius: "20px", color: C.gold }}>{hotel.pointsPerNight}</span>
            <span style={{ fontSize: "11px", padding: "3px 8px", background: C.surface2, border: `0.5px solid ${C.border2}`, borderRadius: "20px", color: C.muted }}>{hotel.cashRate} cash</span>
          </div>
        </div>
        <a href={hotel.bookUrl || "#"} target="_blank" rel="noopener noreferrer"
          style={{ padding: "8px 14px", background: C.text, color: C.bg, borderRadius: "6px", fontSize: "12px", fontWeight: "500", whiteSpace: "nowrap", flexShrink: 0, textDecoration: "none" }}>
          Book →
        </a>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <div style={{ position: "relative", height: isMobile ? "240px" : "300px", overflow: "hidden", background: C.surface2 }}>
        {photo && <img src={photo} alt={dest.city} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.55 }} />}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(13,13,13,0.2), rgba(13,13,13,0.95))" }} />
        <div style={{ position: "absolute", inset: 0, padding: isMobile ? "16px" : "20px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <button onClick={onBack} style={{ alignSelf: "flex-start", background: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.12)", color: C.text, padding: "6px 14px", borderRadius: "20px", fontSize: "12px", cursor: "pointer", WebkitTapHighlightColor: "transparent" }}>
            ← Back
          </button>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{ fontSize: isMobile ? "20px" : "24px" }}>{dest.emoji}</span>
                <h1 style={{ fontSize: isMobile ? "28px" : "36px", fontWeight: "700", letterSpacing: "-0.03em", color: C.white }}>{dest.city}</h1>
              </div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginLeft: isMobile ? "28px" : "34px" }}>{dest.country}</div>
            </div>
            {sun && (
              <div style={{ display: "flex", flexDirection: "column", gap: "3px", fontSize: "11px", color: "rgba(255,255,255,0.55)", textAlign: "right" }}>
                <span>🌅 {sun.sunrise}</span>
                <span>🌇 {sun.sunset}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: isMobile ? "24px 16px 80px" : "32px 24px 80px" }}>
        <div style={{ marginBottom: "24px" }}>
          <SectionLabel>Outbound flight</SectionLabel>
          {dest.outboundFlights?.slice(0, 1).map((f, i) => <FlightRow key={i} flight={f} label="Outbound" />)}
        </div>
        <div style={{ marginBottom: "24px" }}>
          <SectionLabel>Return flight</SectionLabel>
          {dest.returnFlights?.slice(0, 1).map((f, i) => <FlightRow key={i} flight={f} label="Return" />)}
        </div>
        <div style={{ marginBottom: "24px" }}>
          <SectionLabel>Hotels</SectionLabel>
          {dest.hotels?.map((h, i) => <HotelRow key={i} hotel={h} />)}
        </div>
        <div style={{ marginBottom: "24px" }}>
          <SectionLabel>What to do now</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {dest.actionSteps?.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start", background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: C.goldDim, border: `0.5px solid ${C.goldBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: C.gold, flexShrink: 0, fontWeight: "600" }}>{i + 1}</div>
                <p style={{ fontSize: "13px", color: C.text, lineHeight: "1.6", paddingTop: "1px", margin: 0 }}>{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: "8px", padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div>
            <div style={{ fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted2, marginBottom: "6px" }}>Estimated cash on top of points</div>
            <div style={{ fontSize: isMobile ? "24px" : "28px", fontWeight: "700", letterSpacing: "-0.03em", color: C.text }}>{dest.cashEstimate}</div>
          </div>
          <div style={{ fontSize: "11px", color: C.muted2, textAlign: "right", lineHeight: "1.6" }}>flights + hotel<br />excl. food & activities</div>
        </div>

        {dest.localCosts && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "24px" }}>
            {[{ icon: "🚗", label: "Avg Uber", val: dest.localCosts.uber }, { icon: "🍺", label: "Beer", val: dest.localCosts.beer }, { icon: "🍽️", label: "Dinner", val: dest.localCosts.dinner }].map(item => item.val && (
              <div key={item.label} style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: "8px", padding: "12px 10px", textAlign: "center" }}>
                <div style={{ fontSize: "20px", marginBottom: "4px" }}>{item.icon}</div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: C.text, marginBottom: "2px" }}>{item.val}</div>
                <div style={{ fontSize: "10px", color: C.muted2 }}>{item.label}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginBottom: "24px" }}>
          <SectionLabel>Day by day itinerary</SectionLabel>
          {loadingItinerary ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", background: C.surface, borderRadius: "8px", border: `0.5px solid ${C.border}` }}>
              <span style={{ animation: "spin 1s linear infinite", display: "inline-block", fontSize: "16px" }}>✈</span>
              <span style={{ fontSize: "13px", color: C.muted }}>Building your itinerary...</span>
            </div>
          ) : itinerary ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {itinerary.map((day, i) => (
                <div key={i} style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: "8px", padding: "14px 16px" }}>
                  <div style={{ fontSize: "11px", color: C.gold, fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "5px" }}>Day {day.day}{day.date ? ` · ${day.date}` : ""}</div>
                  <div style={{ fontSize: "14px", fontWeight: "500", color: C.text, marginBottom: "5px" }}>{day.title}</div>
                  <div style={{ fontSize: "12px", color: C.muted, lineHeight: "1.6" }}>{day.description}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: "13px", color: C.muted, padding: "16px", background: C.surface, borderRadius: "8px", border: `0.5px solid ${C.border}` }}>
              Itinerary unavailable for this destination.
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