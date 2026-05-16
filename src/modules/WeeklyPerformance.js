import React, { useState } from "react";
import { BarChart3, Star, AlertTriangle, TrendingUp, RefreshCw } from "lucide-react";
import { mockApplicants, mockDepartments, mockWeeklyRatings } from "../mockData";
import { runWeeklyReport } from "../geminiService";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const STAR_LABELS = ["", "Needs significant improvement", "Below expectations", "Meets expectations", "Exceeds expectations", "Outstanding performer"];
const DEPT_COLORS = ["#2563eb","#0f766e","#7c3aed","#b45309","#15803d","#b91c1c"];

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="stars">
      {[1,2,3,4,5].map(s => (
        <span key={s} className={`star ${(hover || value) >= s ? "filled" : "empty"}`}
          onClick={() => onChange(s)} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}>★</span>
      ))}
    </div>
  );
}

export default function WeeklyPerformance({ sharedState, updateShared }) {
  const { assignments, hiredEmployees, weeklyRatings } = sharedState;
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [tab, setTab] = useState("rate");

  const employees = assignments.length ? assignments.map(a => ({
    id: a.employee_id, name: a.employee_name, department: a.assigned_department
  })) : mockApplicants.slice(0, 5).map((a, i) => ({
    id: a.id, name: a.name, department: mockDepartments[i % mockDepartments.length].name
  }));

  const currentWeek = (weeklyRatings.length || mockWeeklyRatings.length) + 1;

  const setRating = (id, val) => setRatings(r => ({ ...r, [id]: val }));

  const submitRatings = async () => {
    if (Object.keys(ratings).length === 0) return;
    setLoading(true);
    const newEntry = { week: currentWeek, ratings };
    const allRatings = [...(weeklyRatings.length ? weeklyRatings : mockWeeklyRatings), newEntry];
    updateShared("weeklyRatings", allRatings);
    try {
      const res = await runWeeklyReport(employees, ratings, currentWeek);
      if (res) { setReport(res); setTab("report"); }
      else generateLocalReport(allRatings);
    } catch { generateLocalReport(allRatings); }
    setLoading(false);
  };

  const generateLocalReport = (allRatings) => {
    const deptAvg = {};
    const empReports = employees.map(emp => {
      const thisWeekRating = ratings[emp.id] || 3;
      const prevRatings = allRatings.slice(-3).map(w => w.ratings[emp.id] || 3);
      const lowStreak = prevRatings.filter(r => r <= 2).length >= 2;
      const action = lowStreak ? "Reshuffle Recommended" : thisWeekRating <= 2 ? "Review Recommended" : "Confirm placement";
      if (!deptAvg[emp.department]) deptAvg[emp.department] = [];
      deptAvg[emp.department].push(thisWeekRating);
      return { name: emp.name, department: emp.department, rating: thisWeekRating, label: STAR_LABELS[thisWeekRating], action, reshuffle_suggestion: lowStreak ? "Consider reassignment to better-fit department" : null };
    });
    const deptAvgFinal = {};
    Object.entries(deptAvg).forEach(([k, v]) => { deptAvgFinal[k] = +(v.reduce((a, b) => a + b, 0) / v.length).toFixed(1); });
    const top = empReports.reduce((a, b) => a.rating > b.rating ? a : b);
    setReport({ week_number: currentWeek, summary: `Week ${currentWeek} completed. ${empReports.filter(e => e.action === "Confirm placement").length} employees performing well.`, department_averages: deptAvgFinal, employee_reports: empReports, top_performer: top.name, flag_count: empReports.filter(e => e.action !== "Confirm placement").length });
    setTab("report");
  };

  const historicData = (mockWeeklyRatings).map(w => {
    const avg = Object.values(w.ratings).reduce((a, b) => a + b, 0) / Object.values(w.ratings).length;
    return { week: `Week ${w.week}`, avg: +avg.toFixed(1) };
  });

  const radarData = mockDepartments.slice(0, 5).map((d, i) => ({
    dept: d.name.split(" ")[0], score: [4.6, 4.1, 3.9, 4.3, 3.7][i]
  }));

  return (
    <div>
      <div className="page-header">
        <h1>Weekly Performance Intelligence</h1>
        <p>Rate employees weekly · AI generates reports · Identifies reshuffling opportunities</p>
      </div>

      <div className="tab-bar">
        <button className={`tab ${tab === "rate" ? "active" : ""}`} onClick={() => setTab("rate")}>Rate Employees</button>
        <button className={`tab ${tab === "report" ? "active" : ""}`} onClick={() => setTab("report")}>Weekly Report {report && `(Week ${report.week_number})`}</button>
        <button className={`tab ${tab === "analytics" ? "active" : ""}`} onClick={() => setTab("analytics")}>Analytics</button>
      </div>

      {tab === "rate" && (
        <div>
          <div className="card mb-12">
            <div className="card-header">
              <div>
                <div className="card-title">Week {currentWeek} — Employee Ratings</div>
                <div className="card-subtitle">Rate each employee's performance this week</div>
              </div>
              <button className="btn btn-primary" onClick={submitRatings} disabled={loading || Object.keys(ratings).length === 0}>
                {loading ? <><div className="spinner" />Generating...</> : <><BarChart3 size={13} />Generate AI Report</>}
              </button>
            </div>

            <div className="ai-box" style={{ marginBottom: 14 }}>
              <div className="ai-box-header"><div className="ai-dot" />Rating Intelligence</div>
              <p style={{ fontSize: 11, color: "#3730a3" }}>
                Ratings are stored as performance entities and linked to employee–department assignments.
                AI uses rating history to detect underperformance patterns and recommend reshuffling.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {employees.map((emp, i) => (
                <div key={emp.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 14px", background: "#f8fafc", borderRadius: 8, border: "1px solid var(--border)" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{emp.name}</div>
                    <div className="text-sm">{emp.department}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <StarRating value={ratings[emp.id] || 0} onChange={(v) => setRating(emp.id, v)} />
                    {ratings[emp.id] && <div style={{ fontSize: 10, color: "#475569", marginTop: 4 }}>{STAR_LABELS[ratings[emp.id]]}</div>}
                  </div>
                  <span className={`badge ${ratings[emp.id] >= 4 ? "badge-green" : ratings[emp.id] >= 3 ? "badge-blue" : ratings[emp.id] ? "badge-red" : "badge-gray"}`}>
                    {ratings[emp.id] ? `${ratings[emp.id]}★` : "Not rated"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "report" && report && (
        <div>
          <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: 16 }}>
            <div className="kpi-card"><div className="kpi-label">Week</div><div className="kpi-value">{report.week_number}</div></div>
            <div className="kpi-card"><div className="kpi-label">Top Performer</div><div style={{ fontSize: 14, fontWeight: 700, marginTop: 6 }}>{report.top_performer}</div></div>
            <div className="kpi-card" style={{ borderTop: report.flag_count > 0 ? "3px solid var(--warning)" : "3px solid var(--success)" }}>
              <div className="kpi-label">Flagged</div>
              <div className="kpi-value" style={{ color: report.flag_count > 0 ? "var(--warning)" : "var(--success)" }}>{report.flag_count}</div>
            </div>
            <div className="kpi-card"><div className="kpi-label">Summary</div><div style={{ fontSize: 11, color: "#475569", marginTop: 6 }}>{report.summary}</div></div>
          </div>

          {report.flag_count > 0 && (
            <div style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 8, padding: 14, marginBottom: 12, display: "flex", gap: 10 }}>
              <AlertTriangle size={16} color="#b45309" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 12, color: "#b45309" }}>{report.flag_count} employee(s) require attention</div>
                <div style={{ fontSize: 11, color: "#92400e" }}>Review or reshuffle recommended based on performance pattern</div>
              </div>
            </div>
          )}

          <div className="card mb-12">
            <div className="card-header"><div className="card-title">Employee Performance Report</div></div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Employee</th><th>Department</th><th>Rating</th><th>Label</th><th>Action</th><th>Note</th></tr></thead>
                <tbody>
                  {report.employee_reports?.map((e, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{e.name}</td>
                      <td>{e.department}</td>
                      <td><div className="stars">{[1,2,3,4,5].map(s => <span key={s} className={`star ${e.rating >= s ? "filled" : "empty"}`} style={{ fontSize: 12, cursor: "default" }}>★</span>)}</div></td>
                      <td className="text-sm">{e.label}</td>
                      <td>
                        <span className={`badge ${e.action === "Confirm placement" ? "badge-green" : e.action === "Reshuffle Recommended" ? "badge-red" : "badge-yellow"}`}>
                          {e.action === "Reshuffle Recommended" && <RefreshCw size={9} style={{ marginRight: 4 }} />}
                          {e.action}
                        </span>
                      </td>
                      <td className="text-sm">{e.reshuffle_suggestion || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">Department Averages</div></div>
            <div className="flex-gap" style={{ flexWrap: "wrap", gap: 12 }}>
              {Object.entries(report.department_averages || {}).map(([dept, avg], i) => (
                <div key={dept} style={{ background: "#f8fafc", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px", minWidth: 140 }}>
                  <div style={{ fontSize: 11, color: "#475569", marginBottom: 4 }}>{dept}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: avg >= 4 ? "var(--success)" : avg >= 3 ? "var(--primary)" : "var(--danger)" }}>{avg}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8" }}>/ 5.0 avg</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "report" && !report && (
        <div className="card"><div className="empty-state"><Star size={32} color="#cbd5e1" style={{ margin: "0 auto 12px" }} /><p>No report generated yet. Rate employees and click Generate AI Report.</p></div></div>
      )}

      {tab === "analytics" && (
        <div className="grid-2">
          <div className="card">
            <div className="card-header"><div className="card-title">Performance Trend</div></div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={historicData}>
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Bar dataKey="avg" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">Department Radar</div></div>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="dept" tick={{ fontSize: 10 }} />
                <Radar name="Score" dataKey="score" stroke="#0f766e" fill="#0f766e" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
