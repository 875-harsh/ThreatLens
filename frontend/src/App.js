import React, { useState } from "react";
import "./App.css";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, Cell, PieChart, Pie,
} from "recharts";

/* ── Sidebar Icons (inline SVG) ─────────────────────────────────── */
const IconMonitor = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);
const IconHistory = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconSettings = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);
const IconRefresh = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);

/* ── Custom chart tooltip ────────────────────────────────────────── */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0D1B30",
      border: "1px solid rgba(0,216,255,0.15)",
      borderRadius: 8,
      padding: "8px 14px",
      fontFamily: "Inter, sans-serif",
      fontSize: 12,
      color: "#C9DEFF",
    }}>
      <span style={{ color: "#4A6FA5", marginRight: 8 }}>{label}</span>
      <strong>{payload[0].value}</strong>
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────── */
const FAKE_IPS = ["8.8.8.8", "1.1.1.1", "45.33.32.156"];
const getIP = () => FAKE_IPS[Math.floor(Math.random() * FAKE_IPS.length)];

function threatColor(pct) {
  if (pct < 25) return { fill: "var(--green)", label: "LOW",    bg: "var(--green-dim)",    border: "var(--green-border)" };
  if (pct < 60) return { fill: "var(--amber)", label: "MEDIUM", bg: "var(--amber-dim)",    border: "rgba(255,193,7,0.28)" };
  return               { fill: "var(--red)",   label: "HIGH",   bg: "var(--red-dim)",      border: "var(--red-border)" };
}

/* ═══════════════════════════════════════════════════════════════════
   APP
═══════════════════════════════════════════════════════════════════ */
function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [result,   setResult]   = useState(null);
  const [history,  setHistory]  = useState([]);
  const [loading,  setLoading]  = useState(false);

  /* ── Derived values ── */
  const threatCount = history.filter(h =>  h.suspicious).length;
  const safeCount   = history.filter(h => !h.suspicious).length;
  const threatPct   = history.length > 0 ? Math.round((threatCount / history.length) * 100) : 0;
  const tc          = threatColor(threatPct);
  const riskScore   = result && !result.error ? Number(result.riskScore) || 0 : 0;

  const barData = [
    { name: "Safe",   value: safeCount   },
    { name: "Threat", value: threatCount },
  ];

  const donutRaw = [
    { name: "Safe",   value: safeCount,   fill: "#00E676" },
    { name: "Threat", value: threatCount, fill: "#FF4560" },
  ];
  const donutData = safeCount === 0 && threatCount === 0
    ? [{ name: "None", value: 1, fill: "#1E3460" }]
    : donutRaw;

  /* ── API handlers ── */
  const loadHistory = async () => {
    try {
      const res  = await fetch("http://localhost:8080/api/history");
      const data = await res.json();
      setHistory(data);
    } catch { /* silent */ }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Forwarded-For": getIP() },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) { setResult({ error: "Invalid username or password" }); return; }
      const data = await res.json();
      setResult(data);
      loadHistory();
    } catch {
      setResult({ error: "Server error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUsername(""); setPassword(""); setResult(null); setHistory([]);
  };

  const onKey = e => e.key === "Enter" && !loading && handleLogin();

  /* ════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════ */
  return (
    <div className="app-shell">

      {/* ══ SIDEBAR ══════════════════════════════════════════════ */}
      <aside className="sidebar">
        <div className="sidebar-logo">🛡️</div>
        <nav className="sidebar-nav">
          <button className="nav-btn active" title="Monitor"><IconMonitor /></button>
          <button className="nav-btn" title="History"><IconHistory /></button>
        </nav>
        <div className="sidebar-footer">
          <div className="sys-dot" title="System Online" />
        </div>
      </aside>

      {/* ══ LOGIN PANEL ══════════════════════════════════════════ */}
      <section className="login-panel">
        <div className="login-content">
          {/* Brand */}
          <div className="brand-block">
            <div className="shield-wrap">
              <div className="shield-ring" aria-hidden="true" />
              <div className="shield-inner">🛡️</div>
            </div>
            <h1 className="brand-name">Threat<em>Lens</em></h1>
            <p className="brand-sub">Intelligent Threat Analysis</p>
          </div>

          {/* Form */}
          <div className="form-fields">
            <div className="form-field">
              <label className="field-label">Username</label>
              <input
                className="field-input"
                placeholder="Enter username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={onKey}
                autoComplete="username"
              />
            </div>
            <div className="form-field">
              <label className="field-label">Password</label>
              <input
                className="field-input"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={onKey}
                autoComplete="current-password"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="btn-row">
            <button className="btn btn-primary" onClick={handleLogin} disabled={loading}>
              {loading
                ? <><span className="spinner" />Analyzing…</>
                : <><span>🔐</span>Secure Login</>}
            </button>
            <button className="btn btn-ghost" onClick={handleReset}>Reset</button>
          </div>

          {/* Error */}
          {result?.error && (
            <div className="error-pill">⚠️ {result.error}</div>
          )}

          {/* Analysis result */}
          {result && !result.error && (
            <div className="result-panel">
              <div className="result-header">
                <span className="result-header-lbl">Analysis Result</span>
                <span className={`status-badge ${result.suspicious ? "threat" : "safe"}`}>
                  {result.suspicious ? "🚨 Suspicious" : "✅ Safe Login"}
                </span>
              </div>
              <div className="result-body">
                <div className="result-field">
                  <span className="result-field-lbl">Location</span>
                  <span className="result-field-val">📍 {result.location || "—"}</span>
                </div>
                <div className="result-field">
                  <span className="result-field-lbl">Risk Score</span>
                  <div className="risk-gauge">
                    <div className="risk-track">
                      <div className="risk-fill" style={{ width: `${Math.min(riskScore, 100)}%` }} />
                    </div>
                    <span className="risk-val">{riskScore}</span>
                  </div>
                </div>
                {result.location && (
                  <iframe
                    className="result-map"
                    title="location-map"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(result.location)}&output=embed`}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══ DASHBOARD PANEL ══════════════════════════════════════ */}
      <section className="dash-panel">
        {/* Topbar */}
        <div className="dash-topbar">
          <div className="dash-topbar-left">
            <div className="live-dot" />
            <span className="dash-title">Monitoring Dashboard</span>
          </div>
          <div className="dash-topbar-right">
            <span className="sys-tag"><span className="dot" />API ACTIVE</span>
            <span className="sys-tag"><span className="dot" />UPTIME 99.9%</span>
            <button className="btn-refresh" onClick={loadHistory}>
              <IconRefresh /> REFRESH
            </button>
          </div>
        </div>

        <div className="dash-content">

          {/* Threat Level */}
          <div className="threat-level-row">
            <span className="tl-label">Threat Level</span>
            <div className="tl-track">
              <div
                className="tl-fill"
                style={{ width: `${threatPct}%`, background: tc.fill }}
              />
            </div>
            <span className="tl-pct" style={{ color: tc.fill }}>
              {threatPct}%
            </span>
            <span
              className="tl-status"
              style={{ background: tc.bg, color: tc.fill, border: `1px solid ${tc.border}` }}
            >
              {tc.label}
            </span>
          </div>

          {/* Stats Bento */}
          <div className="stats-bento">
            <div className="stat-tile">
              <div className="stat-tile-icon">📊</div>
              <div className="stat-tile-label">Total Logins</div>
              <div className="stat-tile-value neutral">{history.length}</div>
              <div className="stat-tile-sub">all time</div>
            </div>
            <div className="stat-tile">
              <div className="stat-tile-icon">🚨</div>
              <div className="stat-tile-label">Threats</div>
              <div className="stat-tile-value danger">{threatCount}</div>
              <div className="stat-tile-sub">suspicious</div>
            </div>
            <div className="stat-tile">
              <div className="stat-tile-icon">✅</div>
              <div className="stat-tile-label">Safe</div>
              <div className="stat-tile-value success">{safeCount}</div>
              <div className="stat-tile-sub">verified</div>
            </div>
            <div className="stat-tile">
              <div className="stat-tile-icon">⚡</div>
              <div className="stat-tile-label">Threat Rate</div>
              <div
                className="stat-tile-value"
                style={{ color: tc.fill }}
              >
                {threatPct}<span style={{ fontSize: 16 }}>%</span>
              </div>
              <div className="stat-tile-sub">of total</div>
            </div>
          </div>

          {/* Charts */}
          <div className="charts-row">
            {/* Bar Chart */}
            <div className="chart-card">
              <span className="card-title">Login Risk Breakdown</span>
              <ResponsiveContainer width="100%" height={190}>
                <BarChart
                  data={barData}
                  barSize={44}
                  margin={{ top: 4, right: 10, bottom: 0, left: -22 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(0,216,255,0.06)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#4A6FA5", fontSize: 12, fontFamily: "Inter" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#4A6FA5", fontSize: 11, fontFamily: "Inter" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{ fill: "rgba(0,216,255,0.04)" }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    <Cell fill="#00E676" />
                    <Cell fill="#FF4560" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Donut Chart */}
            <div className="chart-card">
              <span className="card-title">Threat Distribution</span>
              <div className="donut-wrap">
                <PieChart width={180} height={180}>
                  <Pie
                    data={donutData}
                    cx={85}
                    cy={85}
                    innerRadius={56}
                    outerRadius={78}
                    paddingAngle={donutData.length > 1 ? 3 : 0}
                    dataKey="value"
                    stroke="none"
                  >
                    {donutData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
                <div className="donut-center">
                  <span
                    className={`donut-pct ${
                      history.length === 0 ? "empty"
                      : threatPct > 49 ? "threat" : "safe"
                    }`}
                  >
                    {history.length === 0 ? "—" : `${100 - threatPct}%`}
                  </span>
                  <span className="donut-sub">safe rate</span>
                </div>
              </div>
              <div className="donut-legend">
                <div className="legend-row">
                  <span className="legend-dot" style={{ background: "#00E676" }} />
                  Safe
                  <span className="legend-count">{safeCount}</span>
                </div>
                <div className="legend-row">
                  <span className="legend-dot" style={{ background: "#FF4560" }} />
                  Threat
                  <span className="legend-count">{threatCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* History Table */}
          <div className="table-card">
            <div className="table-card-header">
              <span className="card-title">Login History</span>
              <span className="sys-tag">
                {history.length} {history.length === 1 ? "entry" : "entries"}
              </span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>IP Address</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="table-empty">
                      No data yet — click Refresh to load login history
                    </td>
                  </tr>
                ) : (
                  history.map((h, i) => (
                    <tr key={i}>
                      <td>{h.username}</td>
                      <td><span className="ip-mono">{h.ipAddress}</span></td>
                      <td>
                        <span className={`row-badge ${h.suspicious ? "threat" : "safe"}`}>
                          {h.suspicious ? "⚠ Threat" : "✓ Safe"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
