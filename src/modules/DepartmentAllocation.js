import React, { useState } from "react";
import { Building2, Brain, Plus, Trash2 } from "lucide-react";
import { mockDepartments, mockApplicants } from "../mockData";
import { runDepartmentAssignment } from "../geminiService";

const DEPT_COLORS = ["#2563eb","#0f766e","#7c3aed","#b45309","#15803d","#b91c1c"];

function localAssign(employees, departments) {
  return employees.map(emp => {
    let best = null, bestScore = -1;
    departments.forEach(dept => {
      const skillMatch = emp.skills.filter(s => dept.skills.includes(s)).length;
      const langMatch = emp.languages.filter(l => dept.languages.includes(l)).length;
      const score = (skillMatch / Math.max(dept.skills.length, 1)) * 60 + (langMatch / Math.max(dept.languages.length, 1)) * 40;
      if (score > bestScore) { bestScore = score; best = dept; }
    });
    const matchedSkills = emp.skills.filter(s => best?.skills.includes(s));
    const matchedLangs = emp.languages.filter(l => best?.languages.includes(l));
    const reasons = [];
    if (matchedSkills.length) reasons.push(`${matchedSkills.join(", ")} aligns with ${best?.name}`);
    if (matchedLangs.length) reasons.push(`Uses ${matchedLangs.join(", ")} matching dept stack`);
    if (!reasons.length) reasons.push(`Best available fit for ${emp.name}`);
    return {
      employee_id: emp.id, employee_name: emp.name,
      assigned_department: best?.name || departments[0]?.name,
      fit_score: Math.round(bestScore),
      fit_reasons: reasons
    };
  });
}

export default function DepartmentAllocation({ sharedState, updateShared }) {
  const { hiredEmployees, assignments } = sharedState;
  const [depts, setDepts] = useState(mockDepartments);
  const [loading, setLoading] = useState(false);
  const [newDept, setNewDept] = useState("");
  const [tab, setTab] = useState("allocation");

  const employees = hiredEmployees.length ? hiredEmployees : mockApplicants.slice(0, 5).map((a, i) => ({
    ...a, compatibility_score: [87, 91, 82, 78, 74][i]
  }));

  const runAllocation = async () => {
    setLoading(true);
    try {
      const res = await runDepartmentAssignment(employees, depts);
      if (res?.assignments?.length) { updateShared("assignments", res.assignments); }
      else { updateShared("assignments", localAssign(employees, depts)); }
    } catch { updateShared("assignments", localAssign(employees, depts)); }
    setLoading(false);
  };

  const addDept = () => {
    if (!newDept.trim()) return;
    setDepts(d => [...d, { id: `d${Date.now()}`, name: newDept.trim(), skills: [], languages: [] }]);
    setNewDept("");
  };

  const removeDept = (id) => setDepts(d => d.filter(x => x.id !== id));

  const deptSummary = {};
  assignments.forEach(a => {
    if (!deptSummary[a.assigned_department]) deptSummary[a.assigned_department] = [];
    deptSummary[a.assigned_department].push(a);
  });

  return (
    <div>
      <div className="page-header">
        <h1>Department Allocation</h1>
        <p>AI assigns hired employees to departments based on skills and semantic fit</p>
      </div>

      <div className="tab-bar">
        <button className={`tab ${tab === "allocation" ? "active" : ""}`} onClick={() => setTab("allocation")}>Allocation Engine</button>
        <button className={`tab ${tab === "departments" ? "active" : ""}`} onClick={() => setTab("departments")}>Departments ({depts.length})</button>
        <button className={`tab ${tab === "results" ? "active" : ""}`} onClick={() => setTab("results")}>Results ({assignments.length})</button>
      </div>

      {tab === "allocation" && (
        <div>
          <div className="card mb-12">
            <div className="card-header">
              <div>
                <div className="card-title">AI Department Assignment Engine</div>
                <div className="card-subtitle">Semantic matching: employee skills → department requirements</div>
              </div>
              <button className="btn btn-teal" onClick={runAllocation} disabled={loading}>
                {loading ? <><div className="spinner" />Assigning...</> : <><Brain size={13} />Run AI Allocation</>}
              </button>
            </div>
            <div className="ai-box">
              <div className="ai-box-header"><div className="ai-dot" />Assignment Logic</div>
              <p style={{ fontSize: 11, color: "#3730a3" }}>
                AI evaluates each employee's skills and languages against all department requirements.
                Each employee is assigned to their highest-fit department with an explainable reason.
                Assignments are stored as reusable relationship entities.
              </p>
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>Employees to Allocate ({employees.length})</div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Employee</th><th>Top Skills</th><th>Score</th></tr></thead>
                  <tbody>
                    {employees.map(e => (
                      <tr key={e.id}>
                        <td><div style={{ fontWeight: 600 }}>{e.name}</div><div className="text-sm">{e.course}</div></td>
                        <td><div className="flex-gap" style={{ flexWrap: "wrap", gap: 3 }}>{e.skills.slice(0, 2).map(s => <span key={s} className="badge badge-gray">{s}</span>)}</div></td>
                        <td><span className="badge badge-blue">{e.compatibility_score}%</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>Target Departments ({depts.length})</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {depts.map((d, i) => (
                  <div key={d.id} className="flex-gap" style={{ padding: "8px 10px", background: "#f8fafc", borderRadius: 6, border: "1px solid var(--border)" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: DEPT_COLORS[i % DEPT_COLORS.length], flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{d.name}</div>
                      <div className="text-sm">{d.skills.slice(0, 3).join(", ")}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "departments" && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Manage Departments</div>
          </div>
          <div className="flex-gap mb-12">
            <input value={newDept} onChange={e => setNewDept(e.target.value)} placeholder="New department name..."
              style={{ flex: 1, padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }}
              onKeyDown={e => e.key === "Enter" && addDept()} />
            <button className="btn btn-primary btn-sm" onClick={addDept}><Plus size={12} />Add</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {depts.map((d, i) => (
              <div key={d.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", background: "#f8fafc", borderRadius: 8, border: "1px solid var(--border)" }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: DEPT_COLORS[i % DEPT_COLORS.length], marginTop: 3, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{d.name}</div>
                  <div style={{ marginTop: 6 }}>
                    <div className="flex-gap" style={{ flexWrap: "wrap", gap: 4 }}>
                      {d.skills.map(s => <span key={s} className="badge badge-gray">{s}</span>)}
                    </div>
                    <div className="flex-gap" style={{ flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                      {d.languages.map(l => <span key={l} className="badge badge-teal">{l}</span>)}
                    </div>
                  </div>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => removeDept(d.id)}><Trash2 size={11} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "results" && (
        assignments.length === 0 ? (
          <div className="card"><div className="empty-state"><Building2 size={32} color="#cbd5e1" style={{ margin: "0 auto 12px" }} /><p>No assignments yet. Run AI Allocation first.</p></div></div>
        ) : (
          <div>
            <div className="grid-2 mb-12">
              {Object.entries(deptSummary).map(([dept, members], i) => (
                <div key={dept} className="card" style={{ borderLeft: `3px solid ${DEPT_COLORS[i % DEPT_COLORS.length]}` }}>
                  <div className="card-header">
                    <div className="card-title">{dept}</div>
                    <span className="badge badge-blue">{members.length} employee{members.length > 1 ? "s" : ""}</span>
                  </div>
                  {members.map(m => (
                    <div key={m.employee_id} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid #f1f5f9" }}>
                      <div className="flex-between">
                        <span style={{ fontWeight: 600, fontSize: 12 }}>{m.employee_name}</span>
                        <span className="badge badge-green">{m.fit_score}% fit</span>
                      </div>
                      {m.fit_reasons?.map((r, j) => <div key={j} className="text-sm" style={{ marginTop: 3 }}>• {r}</div>)}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="card">
              <div className="card-header"><div className="card-title">All Assignments</div></div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Employee</th><th>Assigned Department</th><th>Fit Score</th><th>Primary Reason</th></tr></thead>
                  <tbody>
                    {assignments.map((a, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{a.employee_name}</td>
                        <td>
                          <div className="flex-gap">
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: DEPT_COLORS[depts.findIndex(d => d.name === a.assigned_department) % DEPT_COLORS.length] }} />
                            {a.assigned_department}
                          </div>
                        </td>
                        <td>
                          <div className="score-bar-wrap">
                            <div className="score-bar"><div className="score-bar-fill" style={{ width: `${a.fit_score}%`, background: "#0f766e" }} /></div>
                            <span className="score-label" style={{ color: "#0f766e" }}>{a.fit_score}</span>
                          </div>
                        </td>
                        <td className="text-sm">{a.fit_reasons?.[0]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
