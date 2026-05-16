import React, { useState } from "react";
import { Network, Info } from "lucide-react";
import { mockApplicants, mockDepartments } from "../mockData";

const DEPT_COLORS = ["#2563eb","#0f766e","#7c3aed","#b45309","#15803d","#b91c1c"];

export default function RelationshipGraph({ sharedState }) {
  const { scoredApplicants, assignments, hiredEmployees } = sharedState;
  const [view, setView] = useState("applicant");
  const [hoveredNode, setHoveredNode] = useState(null);

  const applicants = scoredApplicants.length ? scoredApplicants : mockApplicants.slice(0, 6).map((a, i) => ({
    ...a, compatibility_score: [87, 82, 91, 74, 78, 65][i]
  }));

  const depts = mockDepartments;

  // Layout helpers
  const centerX = 400, centerY = 230;
  const companyNode = { x: centerX, y: centerY, label: "Your Company", type: "company" };

  const applicantNodes = applicants.slice(0, 8).map((a, i) => {
    const angle = (i / Math.min(applicants.length, 8)) * 2 * Math.PI - Math.PI / 2;
    const r = 170;
    return { x: centerX + r * Math.cos(angle), y: centerY + r * Math.sin(angle), label: a.name.split(" ")[0], score: a.compatibility_score, data: a };
  });

  const deptNodes = depts.map((d, i) => {
    const angle = (i / depts.length) * 2 * Math.PI - Math.PI / 2;
    const r = 160;
    return { x: centerX + r * Math.cos(angle), y: centerY + r * Math.sin(angle), label: d.name.split(" ")[0], color: DEPT_COLORS[i], dept: d };
  });

  const employeeAssigned = assignments.length > 0;

  function scoreToColor(s) {
    if (s >= 80) return "#15803d";
    if (s >= 60) return "#2563eb";
    return "#b45309";
  }

  return (
    <div>
      <div className="page-header">
        <h1>Relationship Intelligence Graph</h1>
        <p>Visual semantic network of ecosystem linkages — first-class relationship entities</p>
      </div>

      <div className="flex-gap mb-12">
        <button onClick={() => setView("applicant")} className={`badge ${view === "applicant" ? "badge-blue" : "badge-gray"}`} style={{ cursor: "pointer", padding: "6px 14px", fontSize: 12 }}>Applicant → Company</button>
        <button onClick={() => setView("department")} className={`badge ${view === "department" ? "badge-teal" : "badge-gray"}`} style={{ cursor: "pointer", padding: "6px 14px", fontSize: 12 }}>Employee → Department</button>
      </div>

      {view === "applicant" && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Applicant–Company Relationship Network</div>
              <div className="card-subtitle">Edge thickness represents compatibility score · Hover nodes for details</div>
            </div>
            <span className="badge badge-ai">AI-formed entities</span>
          </div>

          <div className="graph-container" style={{ height: 460 }}>
            <svg width="100%" height="460" viewBox="0 0 800 460">
              {/* Edges */}
              {applicantNodes.map((n, i) => (
                <line key={i}
                  x1={n.x} y1={n.y} x2={companyNode.x} y2={companyNode.y}
                  stroke={scoreToColor(n.score)}
                  strokeWidth={Math.max(1, (n.score / 100) * 4)}
                  strokeOpacity={0.4 + (n.score / 100) * 0.4}
                />
              ))}
              {/* Score labels on edges */}
              {applicantNodes.map((n, i) => (
                <text key={`score-${i}`}
                  x={(n.x + companyNode.x) / 2}
                  y={(n.y + companyNode.y) / 2}
                  fontSize="10" fill={scoreToColor(n.score)} textAnchor="middle" fontWeight="600">
                  {n.score}%
                </text>
              ))}
              {/* Applicant nodes */}
              {applicantNodes.map((n, i) => (
                <g key={`anode-${i}`} style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredNode({ type: "applicant", data: n.data, score: n.score })}
                  onMouseLeave={() => setHoveredNode(null)}>
                  <circle cx={n.x} cy={n.y} r={22} fill={scoreToColor(n.score)} opacity={0.9} />
                  <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="white" fontWeight="700">
                    {n.score}
                  </text>
                  <text x={n.x} y={n.y + 32} textAnchor="middle" fontSize="10" fill="#111827" fontWeight="500">
                    {n.label}
                  </text>
                </g>
              ))}
              {/* Company center node */}
              <g>
                <circle cx={companyNode.x} cy={companyNode.y} r={36} fill="#040531" />
                <text x={companyNode.x} y={companyNode.y - 6} textAnchor="middle" fontSize="11" fill="white" fontWeight="700">bond</text>
                <text x={companyNode.x} y={companyNode.y + 8} textAnchor="middle" fontSize="11" fill="#60a5fa" fontWeight="700">IT</text>
              </g>
            </svg>

            {hoveredNode && (
              <div style={{ position: "absolute", top: 12, right: 12, background: "white", border: "1px solid var(--border)", borderRadius: 8, padding: 14, minWidth: 200, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>{hoveredNode.data?.name}</div>
                <div className="text-sm">{hoveredNode.data?.course}</div>
                <div className="text-sm">{hoveredNode.data?.university} · CGPA {hoveredNode.data?.cgpa}</div>
                <div style={{ marginTop: 8 }}>
                  <span className={`badge ${hoveredNode.score >= 80 ? "badge-green" : hoveredNode.score >= 60 ? "badge-blue" : "badge-yellow"}`}>
                    {hoveredNode.score}% compatible
                  </span>
                </div>
                <div style={{ marginTop: 8 }}>
                  {hoveredNode.data?.match_reasons?.slice(0, 2).map((r, i) => (
                    <div key={i} style={{ fontSize: 11, color: "#475569" }}>• {r}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="graph-legend">
            <div className="legend-item"><div className="legend-dot" style={{ background: "#15803d" }} />Excellent (80+)</div>
            <div className="legend-item"><div className="legend-dot" style={{ background: "#2563eb" }} />Good (60–79)</div>
            <div className="legend-item"><div className="legend-dot" style={{ background: "#b45309" }} />Fair (&lt;60)</div>
            <div className="legend-item" style={{ marginLeft: "auto" }}><Info size={11} />Edge thickness = compatibility strength</div>
          </div>
        </div>
      )}

      {view === "department" && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Employee–Department Assignment Network</div>
              <div className="card-subtitle">
                {employeeAssigned ? "AI-assigned department placements with fit scores" : "Run Department Allocation first to see employee assignments"}
              </div>
            </div>
            <span className="badge badge-teal">Department entities</span>
          </div>

          <div className="graph-container" style={{ height: 460 }}>
            <svg width="100%" height="460" viewBox="0 0 800 460">
              {employeeAssigned ? (
                <>
                  {assignments.map((asgn, i) => {
                    const deptIdx = depts.findIndex(d => d.name === asgn.assigned_department);
                    const dn = deptNodes[deptIdx] || deptNodes[0];
                    const angle = (i / assignments.length) * 2 * Math.PI - Math.PI / 2;
                    const ex = centerX + 200 * Math.cos(angle);
                    const ey = centerY + 200 * Math.sin(angle);
                    const color = DEPT_COLORS[deptIdx % DEPT_COLORS.length];
                    return (
                      <g key={i}>
                        <line x1={ex} y1={ey} x2={dn.x} y2={dn.y} stroke={color} strokeWidth={2} strokeOpacity={0.5} strokeDasharray="4,3" />
                        <circle cx={ex} cy={ey} r={18} fill={color} opacity={0.85} />
                        <text x={ex} y={ey} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="white" fontWeight="700">
                          {asgn.employee_name?.split(" ")[0]?.slice(0, 5)}
                        </text>
                      </g>
                    );
                  })}
                  {deptNodes.map((n, i) => (
                    <g key={i}>
                      <circle cx={n.x} cy={n.y} r={30} fill={n.color} opacity={0.9} />
                      <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="white" fontWeight="700">
                        {n.label}
                      </text>
                    </g>
                  ))}
                </>
              ) : (
                <>
                  {deptNodes.map((n, i) => (
                    <g key={i}>
                      <line x1={n.x} y1={n.y} x2={centerX} y2={centerY} stroke={n.color} strokeWidth={2} strokeOpacity={0.3} />
                      <circle cx={n.x} cy={n.y} r={30} fill={n.color} opacity={0.8} />
                      <text x={n.x} y={n.y - 5} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="white" fontWeight="700">{n.label}</text>
                      <text x={n.x} y={n.y + 44} textAnchor="middle" fontSize="9" fill="#475569">{n.dept.name.split(" ").slice(-1)[0]}</text>
                    </g>
                  ))}
                  <circle cx={centerX} cy={centerY} r={36} fill="#040531" />
                  <text x={centerX} y={centerY - 6} textAnchor="middle" fontSize="11" fill="white" fontWeight="700">bond</text>
                  <text x={centerX} y={centerY + 8} textAnchor="middle" fontSize="11" fill="#60a5fa" fontWeight="700">IT</text>
                </>
              )}
            </svg>
          </div>

          <div className="graph-legend">
            {depts.map((d, i) => (
              <div key={i} className="legend-item"><div className="legend-dot" style={{ background: DEPT_COLORS[i] }} />{d.name}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
