import React, { useState } from "react";
import { ClipboardCheck, UserCheck, UserX, CheckCircle } from "lucide-react";
import { mockApplicants } from "../mockData";

export default function InterviewDecision({ sharedState, updateShared }) {
  const { scoredApplicants, selectedForInterview, hiredEmployees } = sharedState;
  const [tab, setTab] = useState("shortlist");

  const source = scoredApplicants.length ? scoredApplicants : mockApplicants.map((a, i) => ({
    ...a, compatibility_score: [87, 82, 91, 74, 78, 65, 88, 70, 75, 83][i]
  })).sort((a, b) => b.compatibility_score - a.compatibility_score);

  const shortlisted = source.filter(a => a.compatibility_score >= 65);
  const isSelected = (id) => selectedForInterview.includes(id);
  const isHired = (id) => hiredEmployees.some(e => e.id === id);

  const toggleInterview = (id) => {
    if (isSelected(id)) updateShared("selectedForInterview", selectedForInterview.filter(x => x !== id));
    else updateShared("selectedForInterview", [...selectedForInterview, id]);
  };

  const markHired = () => {
    const hired = source.filter(a => isSelected(a.id));
    updateShared("hiredEmployees", hired);
  };

  const removeHired = (id) => {
    updateShared("hiredEmployees", hiredEmployees.filter(e => e.id !== id));
  };

  return (
    <div>
      <div className="page-header">
        <h1>Interview Decision Workflow</h1>
        <p>Select candidates for interview, then mark hired employees for department allocation</p>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 16 }}>
        <div className="kpi-card">
          <div className="kpi-label">AI Shortlisted</div>
          <div className="kpi-value">{shortlisted.length}</div>
          <div className="kpi-sub">Score ≥ 65%</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Selected for Interview</div>
          <div className="kpi-value">{selectedForInterview.length}</div>
          <div className="kpi-sub">Admin selected</div>
        </div>
        <div className="kpi-card" style={{ borderTop: "3px solid var(--success)" }}>
          <div className="kpi-label">Hired Employees</div>
          <div className="kpi-value">{hiredEmployees.length}</div>
          <div className="kpi-sub">Ready for allocation</div>
        </div>
      </div>

      <div className="tab-bar">
        <button className={`tab ${tab === "shortlist" ? "active" : ""}`} onClick={() => setTab("shortlist")}>AI Shortlist</button>
        <button className={`tab ${tab === "hired" ? "active" : ""}`} onClick={() => setTab("hired")}>Hired Employees ({hiredEmployees.length})</button>
      </div>

      {tab === "shortlist" && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">AI-Shortlisted Candidates</div>
              <div className="card-subtitle">Tick candidates to select for interview, then confirm hiring</div>
            </div>
            <div className="flex-gap">
              {selectedForInterview.length > 0 && (
                <button className="btn btn-primary" onClick={markHired}>
                  <CheckCircle size={13} />Confirm {selectedForInterview.length} as Hired
                </button>
              )}
            </div>
          </div>

          <div className="ai-box" style={{ marginBottom: 14 }}>
            <div className="ai-box-header"><div className="ai-dot" />AI Recommendation</div>
            <p style={{ fontSize: 11, color: "#3730a3" }}>
              Top recommendation: <strong>{shortlisted[0]?.name}</strong> ({shortlisted[0]?.compatibility_score}% match).
              Select candidates manually based on AI scores, then mark hired after interviews.
            </p>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 40 }}>Select</th>
                  <th>Candidate</th>
                  <th>CGPA</th>
                  <th>Experience</th>
                  <th>AI Score</th>
                  <th>Match Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {shortlisted.map((a) => (
                  <tr key={a.id} style={{ background: isSelected(a.id) ? "#f0fdf4" : isHired(a.id) ? "#eff6ff" : "white" }}>
                    <td>
                      {!isHired(a.id) && (
                        <input type="checkbox" checked={isSelected(a.id)} onChange={() => toggleInterview(a.id)}
                          style={{ width: 15, height: 15, cursor: "pointer", accentColor: "var(--primary)" }} />
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{a.name}</div>
                      <div className="text-sm">{a.course} · {a.university}</div>
                    </td>
                    <td><span className={`badge ${a.cgpa >= 3.7 ? "badge-green" : "badge-yellow"}`}>{a.cgpa}</span></td>
                    <td>{a.experience}y</td>
                    <td>
                      <div className="score-bar-wrap">
                        <div className="score-bar">
                          <div className="score-bar-fill" style={{
                            width: `${a.compatibility_score}%`,
                            background: a.compatibility_score >= 80 ? "#15803d" : "#2563eb"
                          }} />
                        </div>
                        <span className="score-label" style={{ color: a.compatibility_score >= 80 ? "#15803d" : "#2563eb" }}>{a.compatibility_score}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 11, color: "#475569", maxWidth: 180 }}>{a.match_reasons?.[0] || "Meets core requirements"}</td>
                    <td>
                      {isHired(a.id) ? <span className="badge badge-green"><UserCheck size={10} style={{ marginRight: 4 }} />Hired</span>
                        : isSelected(a.id) ? <span className="badge badge-blue">Selected</span>
                          : <span className="badge badge-gray">Shortlisted</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "hired" && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Hired Employees — Ready for Department Allocation</div>
          </div>
          {hiredEmployees.length === 0 ? (
            <div className="empty-state">
              <UserCheck size={32} color="#cbd5e1" style={{ margin: "0 auto 12px" }} />
              <p>No employees hired yet. Select candidates and confirm hiring from the Shortlist tab.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Employee</th><th>CGPA</th><th>Skills</th><th>Languages</th><th>AI Score</th><th></th></tr>
                </thead>
                <tbody>
                  {hiredEmployees.map(e => (
                    <tr key={e.id}>
                      <td><div style={{ fontWeight: 600 }}>{e.name}</div><div className="text-sm">{e.course}</div></td>
                      <td><span className="badge badge-green">{e.cgpa}</span></td>
                      <td><div className="flex-gap" style={{ flexWrap: "wrap", gap: 4 }}>{e.skills.slice(0, 2).map(s => <span key={s} className="badge badge-gray">{s}</span>)}</div></td>
                      <td><div className="flex-gap" style={{ flexWrap: "wrap", gap: 4 }}>{e.languages.map(l => <span key={l} className="badge badge-teal">{l}</span>)}</div></td>
                      <td><span className="badge badge-green">{e.compatibility_score}%</span></td>
                      <td><button className="btn btn-outline btn-sm" onClick={() => removeHired(e.id)}><UserX size={11} />Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
