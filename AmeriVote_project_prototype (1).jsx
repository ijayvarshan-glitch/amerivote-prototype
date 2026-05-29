import { useState, useEffect } from "react";

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #root { height: 100%; background: #070F1E; font-family: 'Barlow', sans-serif; }
input, textarea, select { outline: none; }
button { cursor: pointer; }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 2px; }
@keyframes pulse { 0%,100% { opacity:0.3; transform:translateY(0); } 50% { opacity:1; transform:translateY(-7px); } }
@keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
.fade-in { animation: fadeIn 0.3s ease forwards; }
`;

// ── COLORS ────────────────────────────────────────────────────────────────
const C = {
  bg:         "#070F1E",
  card:       "#0D1E35",
  cardAlt:    "#0A1829",
  red:        "#B22234",
  redLight:   "#D94040",
  blue:       "#1A3E7A",
  blueLight:  "#2A5AAA",
  gold:       "#C8970A",
  goldLight:  "#F0B912",
  ink:        "#E8F0FF",
  muted:      "#627A96",
  border:     "rgba(255,255,255,0.07)",
  danger:     "#D94040",
  dangerBg:   "rgba(217,64,64,0.10)",
  success:    "#1E9E60",
  successBg:  "rgba(30,158,96,0.10)",
};

// ── SEED DATA ─────────────────────────────────────────────────────────────
const SEED_VOTERS = [
  { id:"VOT-100001", name:"Jane Smith",       district:"California 28th District", district_id:"ca-28", email:"jane@citizen.gov",    password:"Vote@2026", is_verified:true  },
  { id:"VOT-100002", name:"Michael Johnson",  district:"Texas 7th District",       district_id:"tx-07", email:"michael@citizen.gov", password:"Vote@2026", is_verified:true  },
  { id:"VOT-100003", name:"Maria Garcia",     district:"New York 14th District",   district_id:"ny-14", email:"maria@citizen.gov",   password:"Vote@2026", is_verified:false },
];

const SEED_ELECTIONS = [
  {
    id:"senate-ca-2026", title:"2026 U.S. Senate — California", status:"Live",
    start_at:"2026-05-01T06:00:00Z", end_at:"2026-11-03T22:00:00Z",
    districts:["California 28th District"],
    candidates:[
      { id:"c1", name:"Alexandra Rivera", party:"Democratic Party",  symbol:"D" },
      { id:"c2", name:"Robert Chen",      party:"Republican Party",  symbol:"R" },
      { id:"c3", name:"Dana Walsh",       party:"Independent",       symbol:"I" },
    ],
  },
  {
    id:"house-tx-07-2026", title:"2026 U.S. House — Texas 7th District", status:"Live",
    start_at:"2026-05-01T06:00:00Z", end_at:"2026-11-03T22:00:00Z",
    districts:["Texas 7th District"],
    candidates:[
      { id:"c1", name:"Emma Rodriguez",  party:"Democratic Party", symbol:"D" },
      { id:"c2", name:"James Patterson", party:"Republican Party", symbol:"R" },
    ],
  },
];

const ADMIN = { email:"officer@elections.gov", password:"Admin#2026" };
const DISTRICTS = [
  { id:"ca-28", label:"California 28th District" },
  { id:"tx-07", label:"Texas 7th District"       },
  { id:"ny-14", label:"New York 14th District"   },
  { id:"fl-07", label:"Florida 7th District"     },
  { id:"il-05", label:"Illinois 5th District"    },
];

// ── UTILS ─────────────────────────────────────────────────────────────────
const rh = (n=8) => Array.from({length:n},()=>Math.floor(Math.random()*16).toString(16)).join("");
const uuid = () => `${rh(8)}-${rh(4)}-${rh(4)}-${rh(12)}`;
function calcTally(votes, elections) {
  const res = {};
  for (const e of elections) {
    res[e.id] = {};
    for (const c of e.candidates) res[e.id][c.id] = 0;
  }
  for (const v of votes) {
    if (v.accepted && res[v.electionId]) res[v.electionId][v.candidateId] = (res[v.electionId][v.candidateId]||0) + 1;
  }
  return res;
}

// ── SMALL COMPONENTS ──────────────────────────────────────────────────────
function Badge({ text, color=C.gold }) {
  return (
    <span style={{ display:"inline-block", padding:"2px 9px", borderRadius:20, fontSize:10, fontWeight:700,
      letterSpacing:0.8, textTransform:"uppercase", background:`${color}1A`, color, border:`1px solid ${color}33` }}>
      {text}
    </span>
  );
}

function Card({ children, style={}, accent }) {
  return (
    <div style={{ background:C.card, borderRadius:12, padding:18,
      border:`1px solid ${accent ? `${accent}2E` : C.border}`, ...style }}>
      {children}
    </div>
  );
}

function SecLabel({ children }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
      <div style={{ width:3, height:17, background:C.gold, borderRadius:2 }} />
      <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:12, fontWeight:600, letterSpacing:1.5,
        textTransform:"uppercase", color:C.ink }}>{children}</span>
    </div>
  );
}

function FieldLabel({ children }) {
  return <div style={{ color:C.muted, fontSize:10, fontWeight:700, letterSpacing:1, textTransform:"uppercase", marginBottom:5 }}>{children}</div>;
}

function Input({ label, value, onChange, type="text", placeholder, rows }) {
  const [focused, setFocused] = useState(false);
  const base = { width:"100%", background:C.bg, border:`1px solid ${focused?C.gold:C.border}`,
    borderRadius:8, padding:"10px 13px", color:C.ink, fontSize:13,
    fontFamily:"'Barlow',sans-serif", transition:"border-color 0.18s" };
  return (
    <div style={{ marginBottom:13 }}>
      {label && <FieldLabel>{label}</FieldLabel>}
      {rows
        ? <textarea rows={rows} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
            onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
            style={{ ...base, resize:"vertical", lineHeight:1.5 }} />
        : <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
            onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} style={base} />
      }
    </div>
  );
}

function Btn({ label, onClick, loading=false, variant="primary", small=false, fullWidth=true }) {
  const vars = {
    primary:   { background:C.gold,      color:"#070F1E" },
    secondary: { background:"transparent", color:C.gold,  border:`1px solid ${C.gold}44` },
    danger:    { background:C.red,        color:"#fff"   },
    ghost:     { background:"transparent", color:C.muted, border:`1px solid ${C.border}` },
  };
  return (
    <button onClick={onClick} disabled={loading} style={{
      ...vars[variant], border:"none", borderRadius:8,
      padding: small ? "7px 14px" : "11px 18px",
      width: fullWidth ? "100%" : "auto",
      fontFamily:"'Oswald',sans-serif", fontWeight:600, fontSize:small?11:13,
      letterSpacing:1, textTransform:"uppercase", opacity:loading?0.6:1,
      display:"flex", alignItems:"center", justifyContent:"center", gap:6,
      transition:"opacity 0.15s", ...vars[variant],
    }}>
      {loading ? "Processing…" : label}
    </button>
  );
}

function Msg({ text, error }) {
  if (!text) return null;
  return (
    <div className="fade-in" style={{ marginTop:12, padding:"10px 13px", borderRadius:8, fontSize:12, fontWeight:600,
      background:error?C.dangerBg:C.successBg, color:error?C.danger:C.success,
      border:`1px solid ${error?C.danger:C.success}2E` }}>
      {text}
    </div>
  );
}

function DemoBanner() {
  return (
    <div style={{ background:`linear-gradient(90deg,${C.blue}1A,${C.red}1A)`,
      border:`1px solid ${C.gold}2E`, borderRadius:8, padding:"7px 13px",
      marginBottom:14, display:"flex", alignItems:"center", gap:7,
      fontSize:10, color:C.gold, fontWeight:700, letterSpacing:1, textTransform:"uppercase" }}>
      ⚡ Demo Mode — No backend · All data simulated in memory · Not a real election system
    </div>
  );
}

function OtpRow({ label, value, onChange, onRequest }) {
  return (
    <div style={{ display:"flex", gap:8, marginBottom:13 }}>
      <div style={{ flex:1, marginBottom:0 }}>
        <Input label={label} value={value} onChange={onChange} placeholder="6-digit code" />
      </div>
      <button onClick={onRequest} style={{ marginTop:17, padding:"10px 13px", background:C.blueLight,
        border:"none", borderRadius:8, color:"#fff", fontSize:11, fontWeight:700,
        fontFamily:"'Barlow',sans-serif", letterSpacing:0.5, whiteSpace:"nowrap" }}>
        Get OTP
      </button>
    </div>
  );
}

// ── SCREENS ───────────────────────────────────────────────────────────────

function SplashScreen() {
  return (
    <div style={{ height:"100vh", background:C.bg, display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", textAlign:"center", padding:24 }}>
      <div style={{ fontSize:72, marginBottom:18 }}>🦅</div>
      <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:52, fontWeight:700, color:C.gold, letterSpacing:5 }}>AMERIVOTE</div>
      <div style={{ color:C.muted, fontSize:11, letterSpacing:3, textTransform:"uppercase", marginTop:8 }}>Federal Election System · United States</div>
      <div style={{ display:"flex", gap:10, marginTop:36, justifyContent:"center" }}>
        {[C.red, C.ink, C.blue].map((color, i) => (
          <div key={i} style={{ width:9, height:9, borderRadius:"50%", background:color,
            animation:`pulse 1.2s ${i*0.25}s infinite` }} />
        ))}
      </div>
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin, onRegister, appState }) {
  const [tab, setTab]           = useState("voter");
  const [voterId, setVoterId]   = useState("VOT-100001");
  const [pass, setPass]         = useState("Vote@2026");
  const [otp, setOtp]           = useState("");
  const [email, setEmail]       = useState("officer@elections.gov");
  const [aPass, setAPass]       = useState("Admin#2026");
  const [aOtp, setAOtp]         = useState("");
  const [msg, setMsg]           = useState("");
  const [err, setErr]           = useState(false);

  const notify = (m, e=false) => { setMsg(m); setErr(e); };
  const getOtp = (forAdmin=false) => { const c="123456"; forAdmin?setAOtp(c):setOtp(c); notify(`Demo OTP auto-filled: ${c}`); };

  const loginVoter = () => {
    const v = appState.voters.find(x => x.id === voterId.toUpperCase());
    if (!v)              return notify("Voter registration number not found.", true);
    if (v.password !== pass) return notify("Incorrect password.", true);
    if (otp !== "123456") return notify("Invalid OTP — click Get OTP first.", true);
    appState.log("login", v.id, "Voter authenticated");
    onLogin({ role:"voter", ...v });
  };

  const loginAdmin = () => {
    if (email !== ADMIN.email || aPass !== ADMIN.password) return notify("Invalid credentials.", true);
    if (aOtp !== "123456") return notify("Invalid OTP — click Get OTP first.", true);
    appState.log("admin_login", email, "Election official authenticated");
    onLogin({ role:"admin", email });
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center",
      justifyContent:"center", padding:"24px 16px", position:"relative", overflowY:"auto" }}>
      {/* dot-grid bg */}
      <div style={{ position:"fixed", inset:0, backgroundImage:"radial-gradient(rgba(255,255,255,0.025) 1px,transparent 1px)",
        backgroundSize:"28px 28px", pointerEvents:"none" }} />
      {/* subtle top stripe */}
      <div style={{ position:"fixed", top:0, left:0, right:0, height:3,
        background:`linear-gradient(90deg,${C.red} 0%,${C.red} 33%,#F0F0F0 33%,#F0F0F0 66%,${C.blue} 66%)` }} />

      <div className="fade-in" style={{ width:"100%", maxWidth:420, position:"relative", zIndex:1 }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:26 }}>
          <div style={{ fontSize:56 }}>🦅</div>
          <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:38, fontWeight:700, color:C.gold, letterSpacing:3, marginTop:8 }}>AMERIVOTE</div>
          <div style={{ color:C.muted, fontSize:10, letterSpacing:2.5, textTransform:"uppercase", marginTop:5 }}>
            Federal Election System · U.S.A.
          </div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginTop:10 }}>
            <div style={{ height:1, width:50, background:`linear-gradient(90deg,transparent,${C.border})` }} />
            <span style={{ color:C.muted, fontSize:9, letterSpacing:1 }}>SECURE · TRANSPARENT · DEMOCRATIC</span>
            <div style={{ height:1, width:50, background:`linear-gradient(90deg,${C.border},transparent)` }} />
          </div>
        </div>

        <DemoBanner />

        <div style={{ background:C.cardAlt, borderRadius:8, padding:"9px 13px", marginBottom:14,
          border:`1px solid ${C.border}`, fontSize:11, color:C.muted, lineHeight:1.6 }}>
          <strong style={{ color:C.ink }}>Demo voter:</strong> VOT-100001 / Vote@2026 &nbsp;·&nbsp;
          <strong style={{ color:C.ink }}>Official:</strong> officer@elections.gov / Admin#2026
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", background:C.card, borderRadius:10, padding:4, marginBottom:14, border:`1px solid ${C.border}` }}>
          {[["voter","🗳 Voter Login"],["admin","🏛 Election Official"]].map(([id, lbl]) => (
            <button key={id} onClick={()=>setTab(id)} style={{
              flex:1, padding:"8px 0", border:"none", borderRadius:7,
              background:tab===id?C.gold:"transparent", color:tab===id?"#070F1E":C.muted,
              fontFamily:"'Barlow',sans-serif", fontWeight:700, fontSize:12, letterSpacing:0.3,
              transition:"all 0.18s",
            }}>{lbl}</button>
          ))}
        </div>

        <Card>
          {tab === "voter" ? (
            <>
              <SecLabel>Voter Check-In</SecLabel>
              <Input label="Voter Registration Number" value={voterId} onChange={setVoterId} placeholder="VOT-100001" />
              <Input label="Password" value={pass} onChange={setPass} type="password" placeholder="••••••••" />
              <OtpRow label="One-Time Passcode" value={otp} onChange={setOtp} onRequest={()=>getOtp(false)} />
              <Btn label="Verify Identity & Enter" onClick={loginVoter} />
            </>
          ) : (
            <>
              <SecLabel>Election Official Access</SecLabel>
              <Input label="Official Email" value={email} onChange={setEmail} type="email" placeholder="officer@elections.gov" />
              <Input label="Password" value={aPass} onChange={setAPass} type="password" placeholder="••••••••" />
              <OtpRow label="One-Time Passcode" value={aOtp} onChange={setAOtp} onRequest={()=>getOtp(true)} />
              <Btn label="Access Management Console" onClick={loginAdmin} />
            </>
          )}
          <Msg text={msg} error={err} />
        </Card>

        <button onClick={onRegister} style={{ background:"transparent", border:"none", width:"100%",
          textAlign:"center", color:C.gold, fontFamily:"'Barlow',sans-serif", fontWeight:600,
          fontSize:13, marginTop:14, padding:"8px 0" }}>
          New voter? Register for an account →
        </button>
        <div style={{ textAlign:"center", marginTop:12, color:C.muted, fontSize:9, letterSpacing:1.2 }}>
          AMERIVOTE PROTOTYPE v1.0 · NOT FOR USE IN REAL ELECTIONS
        </div>
      </div>
    </div>
  );
}

// ── REGISTER ──────────────────────────────────────────────────────────────
function RegisterScreen({ onBack, appState }) {
  const [f, setF] = useState({ voter_id:"", name:"", email:"", district_id:"ca-28", id_token:"demo-state-id", password:"", otp:"" });
  const [msg, setMsg] = useState(""); const [err, setErr] = useState(false);
  const set = k => v => setF(p => ({ ...p, [k]:v }));
  const getOtp = () => { set("otp")("123456"); setMsg("Demo OTP auto-filled: 123456"); setErr(false); };

  const submit = () => {
    if (!f.voter_id||!f.name||!f.email||!f.password) return (setMsg("All fields are required."), setErr(true));
    if (f.otp !== "123456") return (setMsg("Invalid OTP — click Get OTP first."), setErr(true));
    if (appState.voters.find(v => v.id === f.voter_id.toUpperCase())) return (setMsg("That registration number is already taken."), setErr(true));
    const district = DISTRICTS.find(d => d.id === f.district_id);
    appState.addVoter({ id:f.voter_id.toUpperCase(), name:f.name, email:f.email, district:district?.label||f.district_id,
      district_id:f.district_id, password:f.password, is_verified:true });
    appState.log("voter_registration", f.voter_id, `Registered: ${f.name}`);
    setMsg("✓ Registration successful! Redirecting to login…"); setErr(false);
    setTimeout(onBack, 1800);
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, padding:"24px 16px", overflowY:"auto" }}>
      <div className="fade-in" style={{ maxWidth:440, margin:"0 auto" }}>
        <button onClick={onBack} style={{ background:"transparent", border:"none", color:C.gold,
          fontWeight:700, fontSize:13, marginBottom:14, padding:0 }}>← Back to Login</button>
        <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:28, color:C.ink, letterSpacing:1, marginBottom:4 }}>VOTER REGISTRATION</div>
        <div style={{ color:C.muted, fontSize:13, marginBottom:18 }}>Register to participate in U.S. federal elections</div>
        <DemoBanner />
        <Card>
          <SecLabel>New Voter Registration</SecLabel>
          <Input label="Voter Registration Number (create new)" value={f.voter_id} onChange={set("voter_id")} placeholder="e.g. VOT-200001" />
          <Input label="Full Legal Name" value={f.name} onChange={set("name")} placeholder="First Middle Last" />
          <Input label="Email Address" value={f.email} onChange={set("email")} type="email" placeholder="you@example.com" />
          <div style={{ marginBottom:13 }}>
            <FieldLabel>Congressional District</FieldLabel>
            <select value={f.district_id} onChange={e=>set("district_id")(e.target.value)} style={{ width:"100%",
              background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 13px",
              color:C.ink, fontSize:13, fontFamily:"'Barlow',sans-serif" }}>
              {DISTRICTS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
            </select>
          </div>
          <Input label="State ID / Verification Token" value={f.id_token} onChange={set("id_token")} placeholder="State-issued token" />
          <Input label="Create Password" value={f.password} onChange={set("password")} type="password" placeholder="Min 8 characters" />
          <OtpRow label="One-Time Passcode" value={f.otp} onChange={set("otp")} onRequest={getOtp} />
          <Btn label="Submit Registration" onClick={submit} />
          <Msg text={msg} error={err} />
        </Card>
      </div>
    </div>
  );
}

// ── VOTER ─────────────────────────────────────────────────────────────────
function VoterScreen({ session, onLogout, appState }) {
  const [tab, setTab]         = useState("ballot");
  const [selElec, setSelElec] = useState(appState.elections[0]?.id||"");
  const [selCand, setSelCand] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [msg, setMsg]         = useState(""); const [err, setErr] = useState(false);

  const tallies = calcTally(appState.votes, appState.elections);
  const election = appState.elections.find(e => e.id === selElec);
  const alreadyVoted = appState.votes.some(v => v.nullifier===`${selElec}:${session.id}` && v.accepted);

  const castVote = () => {
    if (!selCand)              return (setMsg("Please select a candidate."), setErr(true));
    if (confirm!=="I CONFIRM") return (setMsg("Type exactly: I CONFIRM"), setErr(true));
    if (alreadyVoted)          return (setMsg("You have already cast your ballot in this election."), setErr(true));
    setLoading(true);
    setTimeout(() => {
      const receiptCode = rh(24);
      const receiptHash = rh(64);
      const vote = { id:uuid(), electionId:selElec, candidateId:selCand, district_id:session.district_id,
        nullifier:`${selElec}:${session.id}`, receiptHash, accepted:true, at:new Date().toISOString() };
      appState.addVote(vote);
      appState.log("vote_cast", session.id, `Election: ${selElec} | Receipt: ${receiptHash.slice(0,12)}…`);
      setReceipt({ code:receiptCode, hash:receiptHash, merkle:rh(64), bulletin:rh(64) });
      setMsg("✓ Ballot accepted and recorded to bulletin board."); setErr(false);
      setConfirm(""); setLoading(false);
    }, 900);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:C.bg }}>
      {/* Header */}
      <div style={{ background:C.card, borderBottom:`1px solid ${C.border}`, padding:"11px 18px",
        display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:17, color:C.gold, letterSpacing:2 }}>🦅 AMERIVOTE</div>
          <div style={{ color:C.muted, fontSize:10, letterSpacing:1.2 }}>VOTER PORTAL</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ textAlign:"right" }}>
            <div style={{ color:C.ink, fontSize:12, fontWeight:600 }}>{session.name}</div>
            <div style={{ color:C.muted, fontSize:10 }}>{session.district||session.district_id}</div>
          </div>
          <Btn label="Sign Out" onClick={onLogout} variant="ghost" small fullWidth={false} />
        </div>
      </div>
      {/* Voter strip */}
      <div style={{ background:C.cardAlt, borderBottom:`1px solid ${C.border}`, padding:"7px 18px", display:"flex", gap:28 }}>
        {[["Voter ID",session.id],["District",session.district_id?.toUpperCase()],["Status",session.is_verified?"Verified ✓":"Pending"]].map(([lbl,val])=>(
          <div key={lbl}>
            <div style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:1, textTransform:"uppercase" }}>{lbl}</div>
            <div style={{ color: lbl==="Status"&&session.is_verified ? C.success : C.ink, fontSize:12, fontWeight:600, marginTop:2 }}>{val}</div>
          </div>
        ))}
      </div>
      {/* Tabs */}
      <div style={{ display:"flex", borderBottom:`1px solid ${C.border}` }}>
        {[["ballot","🗳 Ballot"],["results","📊 Results"],["transparency","🔍 Transparency"]].map(([id,lbl])=>(
          <button key={id} onClick={()=>setTab(id)} style={{ flex:1, padding:"11px 0", border:"none", background:"transparent",
            borderBottom:`2px solid ${tab===id?C.gold:"transparent"}`, color:tab===id?C.gold:C.muted,
            fontFamily:"'Barlow',sans-serif", fontWeight:700, fontSize:12, letterSpacing:0.3, transition:"all 0.15s" }}>{lbl}</button>
        ))}
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:16 }}>

        {/* BALLOT */}
        {tab==="ballot" && (
          <div className="fade-in" style={{ maxWidth:560, margin:"0 auto" }}>
            {alreadyVoted && (
              <div style={{ background:C.successBg, border:`1px solid ${C.success}2E`, borderRadius:10,
                padding:14, marginBottom:16, color:C.success, fontWeight:600, fontSize:13 }}>
                ✓ Your ballot has been cast in this election. Thank you for participating.
              </div>
            )}
            {/* Election selector */}
            <Card style={{ marginBottom:16 }}>
              <SecLabel>Select Election</SecLabel>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {appState.elections.map(e => (
                  <button key={e.id} onClick={()=>{setSelElec(e.id);setSelCand("");setReceipt(null);}} style={{
                    padding:"12px 14px", borderRadius:8, border:`1.5px solid ${selElec===e.id?C.gold:C.border}`,
                    background:selElec===e.id?`${C.gold}0D`:C.bg, textAlign:"left",
                    display:"flex", justifyContent:"space-between", alignItems:"center", transition:"all 0.15s" }}>
                    <div>
                      <div style={{ color:C.ink, fontSize:13, fontWeight:600, fontFamily:"'Barlow',sans-serif" }}>{e.title}</div>
                      <div style={{ color:C.muted, fontSize:10, marginTop:2 }}>
                        {new Date(e.start_at).toLocaleDateString()} – {new Date(e.end_at).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge text={e.status} color={e.status==="Live"?C.success:C.muted} />
                  </button>
                ))}
              </div>
            </Card>

            {election && (
              <>
                <SecLabel>Select Your Candidate</SecLabel>
                {election.candidates.map(c => {
                  const pc = c.party.includes("Dem") ? C.blueLight : c.party.includes("Rep") ? C.red : C.gold;
                  return (
                    <div key={c.id} onClick={()=>!alreadyVoted&&setSelCand(c.id)} style={{
                      padding:"13px 15px", borderRadius:10, border:`1.5px solid ${selCand===c.id?C.gold:C.border}`,
                      background:selCand===c.id?`${C.gold}0A`:C.card, display:"flex", alignItems:"center", gap:13,
                      marginBottom:9, cursor:alreadyVoted?"default":"pointer", transition:"all 0.15s" }}>
                      <div style={{ width:42, height:42, borderRadius:8, background:`${pc}22`, display:"flex",
                        alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:17, fontWeight:700, color:pc }}>{c.symbol}</span>
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ color:C.ink, fontWeight:700, fontSize:14 }}>{c.name}</div>
                        <div style={{ color:C.muted, fontSize:11, marginTop:2 }}>{c.party}</div>
                      </div>
                      <div style={{ width:20, height:20, borderRadius:"50%", border:`2px solid ${selCand===c.id?C.gold:C.muted}`,
                        display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {selCand===c.id && <div style={{ width:10, height:10, borderRadius:"50%", background:C.gold }} />}
                      </div>
                    </div>
                  );
                })}

                {!alreadyVoted && (
                  <Card style={{ marginTop:16 }}>
                    <SecLabel>Confirm & Submit Ballot</SecLabel>
                    <Input label='Type "I CONFIRM" to authorize your vote' value={confirm} onChange={setConfirm} placeholder="I CONFIRM" />
                    <Btn label="Cast Official Ballot" onClick={castVote} loading={loading} />
                  </Card>
                )}
                <Msg text={msg} error={err} />

                {receipt && (
                  <Card style={{ marginTop:16, borderColor:`${C.success}30` }} accent={C.success}>
                    <SecLabel>🗳 Official Ballot Receipt</SecLabel>
                    {[["Receipt Code",receipt.code],["Receipt Hash",receipt.hash],["Merkle Root Snapshot",receipt.merkle]].map(([lbl,val])=>(
                      <div key={lbl} style={{ marginBottom:12 }}>
                        <FieldLabel>{lbl}</FieldLabel>
                        <div style={{ background:C.bg, borderRadius:6, padding:"8px 10px", color:C.success,
                          fontSize:10, fontFamily:"monospace", wordBreak:"break-all", lineHeight:1.5 }}>{val}</div>
                      </div>
                    ))}
                    <div style={{ color:C.muted, fontSize:11, marginTop:4 }}>
                      Keep your receipt code. Use it to verify your ballot on the public observer portal.
                    </div>
                  </Card>
                )}
              </>
            )}
          </div>
        )}

        {/* RESULTS */}
        {tab==="results" && (
          <div className="fade-in" style={{ maxWidth:560, margin:"0 auto" }}>
            {appState.elections.map(e => {
              const et = tallies[e.id]||{};
              const total = Object.values(et).reduce((a,b)=>a+b,0);
              return (
                <Card key={e.id} style={{ marginBottom:16 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                    <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:16, color:C.ink, flex:1, marginRight:12 }}>{e.title}</div>
                    <Badge text={e.status} color={e.status==="Live"?C.success:C.muted} />
                  </div>
                  {e.candidates.map(c => {
                    const count = et[c.id]||0;
                    const pct = total>0?(count/total)*100:0;
                    const pc = c.party.includes("Dem")?"#4A80CC":c.party.includes("Rep")?"#CC4444":C.gold;
                    return (
                      <div key={c.id} style={{ marginBottom:13 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                          <span style={{ color:C.ink, fontSize:13, fontWeight:600 }}>{c.name}
                            <span style={{ color:C.muted, fontWeight:400, fontSize:11 }}> ({c.party.split(" ")[0]})</span></span>
                          <span style={{ color:C.gold, fontWeight:700, fontSize:13 }}>{count}
                            <span style={{ color:C.muted, fontWeight:400, fontSize:10 }}> ({pct.toFixed(1)}%)</span></span>
                        </div>
                        <div style={{ height:8, background:C.border, borderRadius:4, overflow:"hidden" }}>
                          <div style={{ height:"100%", width:`${pct}%`, background:pc, borderRadius:4, transition:"width 0.5s ease" }} />
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ color:C.muted, fontSize:11, marginTop:8 }}>Total recorded: {total}</div>
                </Card>
              );
            })}
            <div style={{ color:C.muted, fontSize:11, textAlign:"center", padding:"4px 0" }}>
              Certified results published after polls close on election day.
            </div>
          </div>
        )}

        {/* TRANSPARENCY */}
        {tab==="transparency" && (
          <div className="fade-in" style={{ maxWidth:560, margin:"0 auto" }}>
            <Card style={{ marginBottom:16 }}>
              <SecLabel>Observer Verification Package</SecLabel>
              <p style={{ color:C.muted, fontSize:13, lineHeight:1.7, marginBottom:16 }}>
                Citizens, journalists, courts, and accredited election monitors can independently verify results without learning how any individual voted. This package is publicly accessible.
              </p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:0 }}>
                {[["Active Elections",appState.elections.length],["Accepted Ballots",appState.votes.filter(v=>v.accepted).length],
                  ["Audit Entries",appState.auditLog.length],["Public Entries",appState.votes.filter(v=>v.accepted).length]].map(([lbl,val])=>(
                  <div key={lbl} style={{ background:C.bg, borderRadius:8, padding:12, border:`1px solid ${C.border}` }}>
                    <div style={{ color:C.muted, fontSize:9, fontWeight:700, letterSpacing:1, textTransform:"uppercase" }}>{lbl}</div>
                    <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:28, color:C.ink, marginTop:4 }}>{val}</div>
                  </div>
                ))}
              </div>
            </Card>

            {appState.votes.filter(v=>v.accepted).length > 0 && (
              <Card style={{ marginBottom:16 }}>
                <SecLabel>Bulletin Board Entries</SecLabel>
                {appState.votes.filter(v=>v.accepted).map((v,i)=>(
                  <div key={i} style={{ padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
                    <div style={{ marginBottom:4 }}><Badge text="accepted_ballot_receipt" color={C.gold} /></div>
                    <div style={{ color:C.muted, fontSize:10, fontFamily:"monospace" }}>{v.receiptHash}</div>
                    <div style={{ color:C.muted, fontSize:9, marginTop:2 }}>{new Date(v.at).toLocaleString()}</div>
                  </div>
                ))}
              </Card>
            )}

            <Card>
              <SecLabel>How to Verify</SecLabel>
              {["Confirm the election manifest was published before any ballot receipts.",
                "Rebuild the Merkle root from all accepted_receipt_hashes in this package.",
                "Compare the public tally with accepted receipts after polls close.",
                "Trace audit_head through the signed audit chain during certification.",
                "Report discrepancies to your State Election Authority or the EAC."
              ].map((s,i)=>(
                <div key={i} style={{ display:"flex", gap:10, padding:"8px 0",
                  borderBottom:i<4?`1px solid ${C.border}`:"none" }}>
                  <span style={{ fontFamily:"'Oswald',sans-serif", color:C.gold, fontWeight:700, minWidth:20, flexShrink:0 }}>{i+1}.</span>
                  <span style={{ color:C.muted, fontSize:13, lineHeight:1.5 }}>{s}</span>
                </div>
              ))}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// ── ADMIN ─────────────────────────────────────────────────────────────────
function AdminScreen({ session, onLogout, appState }) {
  const [tab, setTab] = useState("overview");
  const [f, setF] = useState({ title:"", start_at:"2026-06-01T06:00:00Z", end_at:"2026-11-03T22:00:00Z",
    districts:"California 28th District", candidates:"Candidate One\nCandidate Two" });
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState(""); const [err, setErr] = useState(false);
  const set = k => v => setF(p => ({ ...p, [k]:v }));
  const tallies = calcTally(appState.votes, appState.elections);

  const createElection = () => {
    if (!f.title) return (setMsg("Election title required."), setErr(true));
    const names = f.candidates.split(/\n|,/).map(s=>s.trim()).filter(Boolean);
    if (names.length<2) return (setMsg("At least 2 candidates required."), setErr(true));
    const election = { id:`election-${rh(8)}`, title:f.title, status:"Live",
      start_at:f.start_at, end_at:f.end_at,
      districts:f.districts.split(",").map(s=>s.trim()).filter(Boolean),
      candidates:names.map((name,i)=>({ id:`c${i+1}`, name,
        party:["Democratic Party","Republican Party","Independent","Green Party"][i]||"Independent",
        symbol:["D","R","I","G"][i]||"X" })) };
    appState.addElection(election);
    appState.log("election_created", session.email, `Created: ${f.title}`);
    setMsg("✓ Election created successfully."); setErr(false);
    setF(p=>({ ...p, title:"", candidates:"Candidate One\nCandidate Two" }));
    setCreating(false);
  };

  const readiness = [
    { feature:"Storage Engine",       current:"In-memory React state (demo only)",          production:"Replicated PostgreSQL + PgBouncer / Firebase Firestore",        authority:"CISA Infrastructure Guidelines" },
    { feature:"Identity Verification", current:"Mock form fields",                           production:"SSA / State DMV / DHS SAVE database API",                       authority:"DHS & State Election Codes" },
    { feature:"Cryptographic Keys",   current:"No signing or HSM",                          production:"FIPS 140-2 HSM · AWS CloudHSM · Google Cloud KMS",              authority:"NIST FIPS 140-2" },
    { feature:"Voter Privacy (ZKP)",  current:"No zero-knowledge proofs",                   production:"ZK Circuits (Circom+SnarkJS) or blind-signature ballot auth",    authority:"EAC Certification" },
    { feature:"Audit Ledger",         current:"Mutable in-memory array",                    production:"Immutable ledger — AWS QLDB or Sigstore transparency log",       authority:"HAVA § 301 Compliance" },
    { feature:"Infrastructure",       current:"Single-process browser demo",                production:"Multi-region Kubernetes + Cloudflare WAF + DDoS Shield",         authority:"CISA Election Security" },
    { feature:"Legal Certification",  current:"No certification",                           production:"EAC VVSG 2.0 audit + State election authority approval",         authority:"Election Assistance Commission" },
    { feature:"Accessibility",        current:"Basic web UI",                               production:"Section 508 / WCAG 2.1 AA · Multi-language · Screen readers",   authority:"ADA & Rehabilitation Act" },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:C.bg }}>
      {/* Header */}
      <div style={{ background:C.card, borderBottom:`1px solid ${C.border}`, padding:"11px 18px",
        display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:17, color:C.gold, letterSpacing:2 }}>🦅 AMERIVOTE</div>
          <div style={{ color:C.muted, fontSize:10, letterSpacing:1.2 }}>ELECTIONS MANAGEMENT CONSOLE</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ textAlign:"right" }}>
            <div style={{ color:C.ink, fontSize:11, fontWeight:600 }}>{session.email}</div>
            <Badge text="Election Official" color={C.gold} />
          </div>
          <Btn label="Sign Out" onClick={onLogout} variant="ghost" small fullWidth={false} />
        </div>
      </div>
      {/* Tabs */}
      <div style={{ display:"flex", borderBottom:`1px solid ${C.border}` }}>
        {[["overview","📋 Dashboard"],["create","➕ New Election"],["readiness","⚙️ System Status"]].map(([id,lbl])=>(
          <button key={id} onClick={()=>setTab(id)} style={{ flex:1, padding:"11px 0", border:"none", background:"transparent",
            borderBottom:`2px solid ${tab===id?C.gold:"transparent"}`, color:tab===id?C.gold:C.muted,
            fontFamily:"'Barlow',sans-serif", fontWeight:700, fontSize:12, letterSpacing:0.3 }}>{lbl}</button>
        ))}
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:16 }}>

        {/* DASHBOARD */}
        {tab==="overview" && (
          <div className="fade-in" style={{ maxWidth:720, margin:"0 auto" }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:18 }}>
              {[["🗳 Votes Cast",appState.votes.filter(v=>v.accepted).length],
                ["👥 Registered",appState.voters.length],
                ["📋 Active Elections",appState.elections.filter(e=>e.status==="Live").length]
              ].map(([lbl,val])=>(
                <Card key={lbl}>
                  <div style={{ color:C.muted, fontSize:10, fontWeight:700, letterSpacing:0.8, textTransform:"uppercase" }}>{lbl}</div>
                  <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:38, color:C.gold, marginTop:6 }}>{val}</div>
                </Card>
              ))}
            </div>

            <Card style={{ marginBottom:16 }}>
              <SecLabel>Live Tally</SecLabel>
              {appState.elections.map(e => {
                const et = tallies[e.id]||{};
                const total = Object.values(et).reduce((a,b)=>a+b,0);
                return (
                  <div key={e.id} style={{ marginBottom:16, paddingBottom:16, borderBottom:`1px solid ${C.border}` }}>
                    <div style={{ color:C.ink, fontWeight:600, fontSize:13, marginBottom:9 }}>{e.title}</div>
                    {e.candidates.map(c => {
                      const count = et[c.id]||0;
                      const pct = total>0?(count/total)*100:0;
                      const pc = c.party.includes("Dem")?"#4A80CC":c.party.includes("Rep")?"#CC4444":C.gold;
                      return (
                        <div key={c.id} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                          <span style={{ color:C.muted, fontSize:12, width:150, flexShrink:0 }}>{c.name}</span>
                          <div style={{ flex:1, height:7, background:C.border, borderRadius:4, overflow:"hidden" }}>
                            <div style={{ height:"100%", width:`${pct}%`, background:pc, borderRadius:4 }} />
                          </div>
                          <span style={{ color:C.gold, fontWeight:700, fontSize:12, minWidth:28, textAlign:"right" }}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </Card>

            <Card style={{ marginBottom:16 }}>
              <SecLabel>Voter Register</SecLabel>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                  <thead>
                    <tr>{["Voter ID","Name","District","Verified"].map(h=>(
                      <th key={h} style={{ textAlign:"left", padding:"6px 10px", color:C.muted, fontWeight:700,
                        letterSpacing:0.5, borderBottom:`1px solid ${C.border}`, fontSize:10, textTransform:"uppercase" }}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {appState.voters.map((v,i)=>(
                      <tr key={v.id} style={{ background:i%2===0?"transparent":C.cardAlt }}>
                        <td style={{ padding:"8px 10px", color:C.gold, fontFamily:"monospace", fontSize:11 }}>{v.id}</td>
                        <td style={{ padding:"8px 10px", color:C.ink, fontWeight:600 }}>{v.name}</td>
                        <td style={{ padding:"8px 10px", color:C.muted }}>{v.district||v.district_id}</td>
                        <td style={{ padding:"8px 10px" }}><Badge text={v.is_verified?"Verified":"Pending"} color={v.is_verified?C.success:C.muted} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card>
              <SecLabel>Audit Trail</SecLabel>
              {appState.auditLog.slice(0,14).map((log,i)=>(
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
                  padding:"8px 0", borderBottom:i<Math.min(13,appState.auditLog.length-1)?`1px solid ${C.border}`:"none" }}>
                  <div>
                    <Badge text={log.action} color={log.action.includes("vote")?C.success:log.action.includes("login")?C.gold:C.muted} />
                    <div style={{ color:C.muted, fontSize:11, marginTop:4 }}>{log.details}</div>
                  </div>
                  <div style={{ color:C.muted, fontSize:10, textAlign:"right", flexShrink:0, marginLeft:10 }}>
                    <div>{log.actor}</div>
                    <div>{new Date(log.at).toLocaleString()}</div>
                  </div>
                </div>
              ))}
              {appState.auditLog.length===0 && <div style={{ color:C.muted, fontSize:13 }}>No audit events yet.</div>}
            </Card>
          </div>
        )}

        {/* CREATE */}
        {tab==="create" && (
          <div className="fade-in" style={{ maxWidth:560, margin:"0 auto" }}>
            <Card>
              <SecLabel>Create New Election</SecLabel>
              <Input label="Election Title" value={f.title} onChange={set("title")} placeholder="2026 U.S. Senate Primary — California" />
              <Input label="Start Date (ISO 8601)" value={f.start_at} onChange={set("start_at")} placeholder="2026-06-01T06:00:00Z" />
              <Input label="End Date (ISO 8601)"   value={f.end_at}   onChange={set("end_at")}   placeholder="2026-11-03T22:00:00Z" />
              <Input label="Districts (comma-separated)" value={f.districts} onChange={set("districts")} placeholder="California 28th District, ..." />
              <Input label="Candidates (one per line)" value={f.candidates} onChange={set("candidates")} rows={4} placeholder={"Candidate One\nCandidate Two"} />
              <Btn label="Create Election" onClick={createElection} loading={creating} />
              <Msg text={msg} error={err} />
            </Card>
          </div>
        )}

        {/* READINESS */}
        {tab==="readiness" && (
          <div className="fade-in" style={{ maxWidth:720, margin:"0 auto" }}>
            <Card style={{ marginBottom:16, borderColor:`${C.gold}2E` }} accent={C.gold}>
              <SecLabel>Production Readiness Assessment</SecLabel>
              <p style={{ color:C.muted, fontSize:13, lineHeight:1.7 }}>
                AmeriVote is a functional UI prototype only. It cannot be used in real U.S. federal or state elections.
                Real systems must pass VSTL certification under VVSG 2.0 and receive state election authority approval.
              </p>
            </Card>

            {readiness.map((item,i)=>(
              <Card key={i} style={{ marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                  <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:14, color:C.ink, letterSpacing:0.5, flex:1, marginRight:10 }}>{item.feature}</div>
                  <Badge text="Not Ready" color={C.danger} />
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:10 }}>
                  <div>
                    <FieldLabel>Current (Demo)</FieldLabel>
                    <div style={{ color:C.muted, fontSize:12, lineHeight:1.5 }}>{item.current}</div>
                  </div>
                  <div>
                    <div style={{ color:C.gold, fontSize:10, fontWeight:700, letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>Production Requirement</div>
                    <div style={{ color:C.ink, fontSize:12, lineHeight:1.5 }}>{item.production}</div>
                  </div>
                </div>
                <div style={{ paddingTop:8, borderTop:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ color:C.muted, fontSize:10 }}>Governing Authority:</span>
                  <Badge text={item.authority} color={C.blueLight} />
                </div>
              </Card>
            ))}

            <Card style={{ borderColor:`${C.danger}2E` }} accent={C.danger}>
              <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                <span style={{ fontSize:22 }}>⚠️</span>
                <div>
                  <div style={{ color:C.danger, fontWeight:700, fontSize:13, marginBottom:5 }}>Legal & Regulatory Boundary</div>
                  <div style={{ color:C.muted, fontSize:12, lineHeight:1.7 }}>
                    All U.S. federal and state elections are governed by the <strong style={{color:C.ink}}>Help America Vote Act (HAVA)</strong>, state
                    election codes, and EAC certification requirements. Any real voting system must complete independent testing
                    by an accredited <strong style={{color:C.ink}}>Voting System Testing Laboratory (VSTL)</strong> under
                    VVSG 2.0 guidelines, and receive approval from the relevant state's chief election official.
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]     = useState("splash");
  const [session, setSession]   = useState(null);
  const [elections, setElections] = useState(SEED_ELECTIONS);
  const [voters, setVoters]       = useState(SEED_VOTERS);
  const [votes, setVotes]         = useState([]);
  const [auditLog, setAuditLog]   = useState([]);

  const appState = {
    elections, voters, votes, auditLog,
    addElection: e => setElections(p => [...p, e]),
    addVoter:    v => setVoters(p => [...p, v]),
    addVote:     v => setVotes(p => [...p, v]),
    log: (action, actor, details) =>
      setAuditLog(p => [{ id:uuid(), action, actor, details, at:new Date().toISOString() }, ...p]),
  };

  useEffect(() => { const t = setTimeout(() => setScreen("login"), 2000); return () => clearTimeout(t); }, []);

  const handleLogin = s => { setSession(s); setScreen(s.role==="admin"?"admin":"voter"); };
  const handleLogout = () => {
    if (session) appState.log("logout", session.id||session.email, "User signed out");
    setSession(null); setScreen("login");
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      {screen==="splash"    && <SplashScreen />}
      {screen==="login"     && <LoginScreen    onLogin={handleLogin} onRegister={()=>setScreen("register")} appState={appState} />}
      {screen==="register"  && <RegisterScreen onBack={()=>setScreen("login")} appState={appState} />}
      {screen==="voter"     && session && <VoterScreen  session={session} onLogout={handleLogout} appState={appState} />}
      {screen==="admin"     && session && <AdminScreen  session={session} onLogout={handleLogout} appState={appState} />}
    </>
  );
}
