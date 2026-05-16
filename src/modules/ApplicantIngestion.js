import React, { useState } from "react";
import { Upload, Plus, Trash2, CheckCircle, FileText } from "lucide-react";
import { mockApplicants, mockRequirements } from "../mockData";

export default function ApplicantIngestion({ sharedState, updateShared, companyData }) {
  const { applicants } = sharedState;
  const [req, setReq] = useState(mockRequirements);
  const [activeTab, setActiveTab] = useState("applicants");
  const [loaded, setLoaded] = useState(false);

  const loadDemoData = () => {
    updateShared("applicants", mockApplicants);
    setLoaded(true);
  };

  const removeApplicant = (id) => {
    updateShared("applicants", applicants.filter(a => a.id !== id));
  };

  const updateReq = (key, val) => setReq(r => ({ ...r, [key]: val }));

  const skillsOptions = ["React", "Vue.js", "Node.js", "Django", "Python", "JavaScript", "Java", "Machine Learning", "SQL", "AWS", "Docker", "TypeScript", "Kotlin", "C++", "Spring Boot"];
  const langOptions = ["Python", "JavaScript", "Java", "TypeScript", "R", "Kotlin", "C++", "Bash", "Scala", "Julia"];

  const toggleArr = (arr, val) => arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];

  return (
    <div>
      <div className="page-header">
        <h1>Applicant Ingestion</h1>
        <p>Configure company requirements and load applicant data into the system</p>
      </div>

      <div className="tab-bar">
        {["applicants", "requirements"].map(t => (
          <button key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
            {t === "applicants" ? "Applicant Data" : "Company Requirements"}
          </button>
        ))}
      </div>

      {activeTab === "applicants" && (
        <div>
          <div className="card mb-12">
            <div className="card-header">
              <div>
                <div className="card-title">Load Applicant Data</div>
                <div className="card-subtitle">Import applicants via file upload or load demo dataset</div>
              </div>
              <div className="flex-gap">
                <button className="btn btn-outline btn-sm"><Upload size={12} />Upload CSV/JSON</button>
                <button className="btn btn-primary btn-sm" onClick={loadDemoData}>
                  <FileText size={12} />Load Demo Data ({mockApplicants.length} applicants)
                </button>
              </div>
            </div>
            {loaded && (
              <div className="ai-box">
                <div className="ai-box-header"><CheckCircle size={12} />Data Loaded Successfully</div>
                <p style={{ fontSize: 11, color: "#3730a3" }}>{mockApplicants.length} applicants ingested. Proceed to AI Compatibility Analysis to rank them against your requirements.</p>
              </div>
            )}
          </div>

          {applicants.length > 0 && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">Applicant Registry — {applicants.length} records</div>
                <span className="badge badge-blue">{applicants.filter(a => a.status === "pending").length} pending review</span>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th><th>University</th><th>Course</th><th>CGPA</th>
                      <th>Education</th><th>Experience</th><th>Skills</th><th>Languages</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {applicants.map(a => (
                      <tr key={a.id}>
                        <td><div style={{ fontWeight: 600 }}>{a.name}</div><div className="text-sm">{a.email}</div></td>
                        <td>{a.university}</td>
                        <td style={{ maxWidth: 120 }}>{a.course}</td>
                        <td><span className={`badge ${a.cgpa >= 3.7 ? "badge-green" : a.cgpa >= 3.5 ? "badge-yellow" : "badge-red"}`}>{a.cgpa}</span></td>
                        <td>{a.education}</td>
                        <td>{a.experience}y</td>
                        <td style={{ maxWidth: 150 }}>
                          <div className="flex-gap" style={{ flexWrap: "wrap", gap: 4 }}>
                            {a.skills.slice(0, 2).map(s => <span key={s} className="badge badge-gray">{s}</span>)}
                            {a.skills.length > 2 && <span className="badge badge-gray">+{a.skills.length - 2}</span>}
                          </div>
                        </td>
                        <td>
                          <div className="flex-gap" style={{ flexWrap: "wrap", gap: 4 }}>
                            {a.languages.slice(0, 2).map(l => <span key={l} className="badge badge-teal">{l}</span>)}
                          </div>
                        </td>
                        <td>
                          <button className="btn btn-outline btn-sm" onClick={() => removeApplicant(a.id)}>
                            <Trash2 size={11} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {applicants.length === 0 && (
            <div className="card">
              <div className="empty-state">
                <Upload size={32} color="#cbd5e1" style={{ margin: "0 auto 12px" }} />
                <p>No applicants loaded. Upload a file or load demo data to begin.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "requirements" && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Company Requirements</div>
            <div className="card-subtitle">These define how the AI scores and ranks applicants</div>
          </div>

          <div className="grid-2" style={{ gap: 20 }}>
            <div>
              <div className="section-title" style={{ marginBottom: 12 }}>CGPA Range</div>
              <div className="flex-gap">
                <div>
                  <label className="text-sm">Min CGPA</label>
                  <input type="number" step="0.1" min="0" max="4" value={req.minCgpa}
                    onChange={e => updateReq("minCgpa", parseFloat(e.target.value))}
                    style={{ width: 80, padding: "6px 10px", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12, marginTop: 4 }} />
                </div>
                <div>
                  <label className="text-sm">Max CGPA</label>
                  <input type="number" step="0.1" min="0" max="4" value={req.maxCgpa}
                    onChange={e => updateReq("maxCgpa", parseFloat(e.target.value))}
                    style={{ width: 80, padding: "6px 10px", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12, marginTop: 4 }} />
                </div>
                <div>
                  <label className="text-sm">Min Experience (yrs)</label>
                  <input type="number" min="0" max="10" value={req.minExperience}
                    onChange={e => updateReq("minExperience", parseInt(e.target.value))}
                    style={{ width: 80, padding: "6px 10px", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12, marginTop: 4 }} />
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <div className="section-title" style={{ marginBottom: 12 }}>Education Level</div>
                <div className="flex-gap" style={{ flexWrap: "wrap" }}>
                  {["Bachelor's", "Master's", "PhD", "Diploma"].map(e => (
                    <button key={e} onClick={() => updateReq("education", e)}
                      className={`badge ${req.education === e ? "badge-blue" : "badge-gray"}`}
                      style={{ cursor: "pointer", padding: "5px 12px", fontSize: 12 }}>{e}</button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="section-title" style={{ marginBottom: 12 }}>Required Skills (select all that apply)</div>
              <div className="flex-gap" style={{ flexWrap: "wrap", gap: 6 }}>
                {skillsOptions.map(s => (
                  <button key={s} onClick={() => updateReq("skills", toggleArr(req.skills, s))}
                    className={`badge ${req.skills.includes(s) ? "badge-blue" : "badge-gray"}`}
                    style={{ cursor: "pointer", padding: "5px 12px", fontSize: 12 }}>{s}</button>
                ))}
              </div>

              <div style={{ marginTop: 20 }}>
                <div className="section-title" style={{ marginBottom: 12 }}>Required Programming Languages</div>
                <div className="flex-gap" style={{ flexWrap: "wrap", gap: 6 }}>
                  {langOptions.map(l => (
                    <button key={l} onClick={() => updateReq("languages", toggleArr(req.languages, l))}
                      className={`badge ${req.languages.includes(l) ? "badge-teal" : "badge-gray"}`}
                      style={{ cursor: "pointer", padding: "5px 12px", fontSize: 12 }}>{l}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="ai-box" style={{ marginTop: 20 }}>
            <div className="ai-box-header"><div className="ai-dot" />Requirements Stored</div>
            <p style={{ fontSize: 11, color: "#3730a3" }}>
              CGPA {req.minCgpa}–{req.maxCgpa} · {req.education}+ · {req.minExperience}y+ experience ·
              Skills: {req.skills.join(", ") || "None selected"} ·
              Languages: {req.languages.join(", ") || "None selected"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
