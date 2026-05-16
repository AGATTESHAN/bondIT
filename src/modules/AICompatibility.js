import React, { useState } from "react";
import { Brain, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { mockApplicants, mockRequirements } from "../mockData";
import { runApplicantScreening } from "../geminiService";

function scoreColor(s) {
  if (s >= 80) return "#15803d";
  if (s >= 60) return "#2563eb";
  if (s >= 40) return "#b45309";
  return "#b91c1c";
}

function gradeBadge(s) {
  if (s >= 80) return "badge-green";
  if (s >= 60) return "badge-blue";
  if (s >= 40) return "badge-yellow";
  return "badge-red";
}

function gradeLabel(s) {
  if (s >= 80) return "Excellent";
  if (s >= 60) return "Good";
  if (s >= 40) return "Fair";
  return "Weak";
}

// Deterministic local scoring (fallback / fast mode)
function localScore(applicant, req) {
  let score = 0;
  const matchedSkills = applicant.skills.filter(s => req.skills.includes(s));
  score += Math.min(30, (matchedSkills.length / Math.max(req.skills.length, 1)) * 30);
  if (applicant.cgpa >= req.minCgpa && applicant.cgpa <= req.maxCgpa) score += 20;
  else if (applicant.cgpa >= req.minCgpa - 0.1) score += 10;
  if (applicant.education === req.education || applicant.education === "Master's") score += 15;
  const matchedLangs = applicant.languages.filter(l => req.languages.includes(l));
  score += Math.min(20, (matchedLangs.length / Math.max(req.languages.length, 1)) * 20);
  if (applicant.experience >= req.minExperience) score += 15;
  else score += Math.floor((applicant.experience / req.minExperience) * 10);
  const reasons = [];
  if (matchedSkills.length) reasons.push(`Knows ${matchedSkills.join(", ")}`);
  if (matchedLangs.length) reasons.push(`Programs in ${matchedLangs.join(", ")}`);
  if (applicant.cgpa >= req.minCgpa) reasons.push(`CGPA ${applicant.cgpa} meets requirement`);
  if (applicant.experience >= req.minExperience) reasons.push(`${applicant.experience}y experience meets minimum`);
  if (!reasons.length) reasons.push("Limited match with current requirements");
  return { score: Math.round(score), reasons };
}

export default function AICompatibility({ sharedState, updateShared }) {
  const { applicants, scoredApplicants } = sharedState;
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("local");
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("all");

  const runAnalysis = async () => {
    const src = applicants.length ? applicants : mockApplicants;
    setLoading(true);
    let results;

    if (mode === "gemini") {
      try {
        const res = await runApplicantScreening(src, mockRequirements);
        if (res?.ranked_applicants) {
          results = res.ranked_applicants.map((r, i) => {
            const orig = src.find(a => a.id === r.id) || src[i];
            return { ...orig, compatibility_score: r.compatibility_score, match_reasons: r.match_reasons, grade: r.grade || gradeLabel(r.compatibility_score) };
          });
        }
      } catch (e) { console.error(e); }
    }

    if (!results) {
      results = src.map(a => {
        const { score, reasons } = localScore(a, mockRequirements);
        return { ...a, compatibility_score: score, match_reasons: reasons, grade: gradeLabel(score) };
      });
    }

    results.sort((a, b) => b.compatibility_score - a.compatibility_score);
    updateShared("scoredApplicants", results);
    setLoading(false);
  };

  const filtered = scoredApplicants.filter(a => {
    if (filter === "excellent") return a.compatibility_score >= 80;
    if (filter === "good") return a.compatibility_score >= 60 && a.compatibility_score < 80;
    if (filter === "weak") return a.compatibility_score < 60;
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <h1>AI Compatibility Analysis</h1>
        <p>Semantic relationship formation between applicants and company requirements</p>
      </div>

      <div className="card mb-12">
        <div className="card-header">
          <div>
            <div className="card-title">AI Engine Configuration</div>
            <div className="card-subtitle">Choose scoring mode and run analysis</div>
          </div>
          <div className="flex-gap">
            <div className="flex-gap">
              <span className="text-sm">Mode:</span>
              <button onClick={() => setMode("local")} className={`badge ${mode === "local" ? "badge-blue" : "badge-gray"}`} style={{ cursor: "pointer", padding: "5px 12px" }}>Fast (Local)</button>
              <button onClick={() => setMode("gemini")} className={`badge ${mode === "gemini" ? "badge-ai" : "badge-gray"}`} style={{ cursor: "pointer", padding: "5px 12px" }}>Gemini AI</button>
            </div>
            <button className="btn btn-primary" onClick={runAnalysis} disabled={loading}>
              {loading ? <><div className="spinner" />Analysing...</> : <><Brain size={13} />Run AI Analysis</>}
            </button>
          </div>
        </div>

        <div className="ai-box">
          <div className="ai-box-header"><div className="ai-dot" />bondIT AI Engine — Relationship Formation</div>
          <p style={{ fontSize: 11, color: "#3730a3" }}>
            {mode === "gemini"
              ? "Using Gemini AI to form semantic relationships. Each applicant is scored against your company requirements across 5 dimensions: Skills (30pts), CGPA (20pts), Education (15pts), Languages (20pts), Experience (15pts)."
              : "Using local AI engine for instant deterministic scoring. Switch to Gemini AI mode for natural language reasoning and deeper insights."}
          </p>
        </div>
      </div>

      {scoredApplicants.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Ranked Applicants — {scoredApplicants.length} analysed</div>
              <div className="card-subtitle">Sorted by compatibility score · Relationship entities formed</div>
            </div>
            <div className="flex-gap">
              {["all", "excellent", "good", "weak"].map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`badge ${filter === f ? "badge-blue" : "badge-gray"}`} style={{ cursor: "pointer", padding: "5px 12px", textTransform: "capitalize" }}>{f}</button>
              ))}
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>Applicant</th>
                  <th>CGPA</th>
                  <th>Experience</th>
                  <th style={{ width: 200 }}>Compatibility Score</th>
                  <th>Grade</th>
                  <th>Match Reasons</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => (
                  <React.Fragment key={a.id}>
                    <tr>
                      <td style={{ fontWeight: 700, color: "#94a3b8" }}>{i + 1}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{a.name}</div>
                        <div className="text-sm">{a.course} · {a.university}</div>
                      </td>
                      <td><span className={`badge ${a.cgpa >= 3.7 ? "badge-green" : "badge-yellow"}`}>{a.cgpa}</span></td>
                      <td>{a.experience}y</td>
                      <td>
                        <div className="score-bar-wrap">
                          <div className="score-bar">
                            <div className="score-bar-fill" style={{ width: `${a.compatibility_score}%`, background: scoreColor(a.compatibility_score) }} />
                          </div>
                          <span className="score-label" style={{ color: scoreColor(a.compatibility_score) }}>{a.compatibility_score}</span>
                        </div>
                      </td>
                      <td><span className={`badge ${gradeBadge(a.compatibility_score)}`}>{a.grade || gradeLabel(a.compatibility_score)}</span></td>
                      <td style={{ maxWidth: 200, fontSize: 11, color: "#475569" }}>{a.match_reasons?.[0]}</td>
                      <td>
                        <button className="btn btn-outline btn-sm" onClick={() => setExpanded(expanded === a.id ? null : a.id)}>
                          {expanded === a.id ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                        </button>
                      </td>
                    </tr>
                    {expanded === a.id && (
                      <tr>
                        <td colSpan={8} style={{ background: "#f8fafc", padding: "12px 16px" }}>
                          <div className="ai-box">
                            <div className="ai-box-header"><Zap size={12} />Relationship Entity — Match Analysis</div>
                            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                              <div>
                                <div className="section-title" style={{ marginBottom: 6 }}>MATCH REASONS</div>
                                {a.match_reasons?.map((r, j) => (
                                  <div key={j} style={{ fontSize: 11, color: "#3730a3", marginBottom: 4 }}>• {r}</div>
                                ))}
                              </div>
                              <div>
                                <div className="section-title" style={{ marginBottom: 6 }}>SKILLS</div>
                                <div className="flex-gap" style={{ flexWrap: "wrap", gap: 4 }}>
                                  {a.skills.map(s => <span key={s} className="badge badge-gray">{s}</span>)}
                                </div>
                                <div className="section-title" style={{ marginBottom: 6, marginTop: 10 }}>LANGUAGES</div>
                                <div className="flex-gap" style={{ flexWrap: "wrap", gap: 4 }}>
                                  {a.languages.map(l => <span key={l} className="badge badge-teal">{l}</span>)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {scoredApplicants.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <Brain size={32} color="#cbd5e1" style={{ margin: "0 auto 12px" }} />
            <p>Run AI Analysis to see ranked applicants. Make sure applicant data is loaded first.</p>
          </div>
        </div>
      )}
    </div>
  );
}
