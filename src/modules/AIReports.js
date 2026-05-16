import React, { useState } from "react";
import { Send, Brain } from "lucide-react";
import { askAI } from "../geminiService";
import { mockApplicants, mockDepartments, mockWeeklyRatings } from "../mockData";

const QUICK_QUESTIONS = [
  "Who are the top 3 performers this month?",
  "Which employees should be reshuffled?",
  "Which department has the highest average rating?",
  "Summarize the hiring pipeline status",
  "Which applicants were rejected and why?",
];

export default function AIReports({ sharedState = {} }) {
  const { 
    scoredApplicants = [], 
    hiredEmployees = [], 
    assignments = [], 
    weeklyRatings = [] 
  } = sharedState;

  const [messages, setMessages] = useState([
    { role: "ai", text: "Hello! I'm the bondIT AI Engine. Ask me anything about your applicants, employees, department assignments, or performance data." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const context = {
    applicants: scoredApplicants.length ? scoredApplicants : mockApplicants,
    employees: hiredEmployees.length ? hiredEmployees : [],
    assignments: assignments.length ? assignments : [],
    departments: mockDepartments,
    weeklyRatings: weeklyRatings.length ? weeklyRatings : mockWeeklyRatings,
  };

  // Safe entity rating counter helper
  const totalRatingsCount = context.weeklyRatings.reduce(
    (a, w) => a + Object.keys(w?.ratings || {}).length, 
    0
  );

  const sendMessage = async (question) => {
    const q = question || input.trim();
    if (!q) return;

    setMessages(m => [...m, { role: "user", text: q }]);
    
    // Only clear input if user manually pressed send or typed enter 
    if (!question) {
      setInput("");
    }

    setLoading(true);
    try {
      const res = await askAI(q, context);
      
      // Resilient fallback configuration
      const answer = res?.answer || 
                     (typeof res === "string" ? res : null) || 
                     "I couldn't retrieve a specific answer. Please check that your data is loaded and try again.";
                     
      setMessages(m => [...m, { role: "ai", text: answer }]);
    } catch {
      setMessages(m => [...m, { role: "ai", text: "AI query failed. Please check your Gemini API key in the .env file." }]);
    }
    setLoading(false);
  };

  const summaryCards = [
    { label: "Total Applicants", value: context.applicants.length, sub: "in registry" },
    { label: "Hired Employees", value: context.employees.length, sub: "confirmed" },
    { label: "Departments Active", value: mockDepartments.length, sub: "in system" },
    { label: "Relationship Entities", value: context.applicants.length + context.assignments.length + totalRatingsCount, sub: "formed by AI" },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>AI Reports</h1>
        <p>Conversational intelligence — query your ecosystem data in plain English</p>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        {summaryCards.map(c => (
          <div key={c.label} className="kpi-card">
            <div className="kpi-label">{c.label}</div>
            <div className="kpi-value">{c.value}</div>
            <div className="kpi-sub">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card" style={{ display: "flex", flexDirection: "column", height: 520 }}>
          <div className="card-header" style={{ flexShrink: 0 }}>
            <div>
              <div className="card-title">AI Query Engine</div>
              <div className="card-subtitle">Ask anything about your ecosystem data</div>
            </div>
            <span className="badge badge-ai"><Brain size={10} style={{ marginRight: 4 }} />Gemini Powered</span>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "0 0 12px", display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                maxWidth: "85%", padding: "10px 13px", borderRadius: 10, fontSize: 12, lineHeight: 1.5,
                background: m.role === "ai" ? "var(--ai-bg)" : "var(--primary)",
                color: m.role === "ai" ? "var(--ai-text)" : "white",
                alignSelf: m.role === "ai" ? "flex-start" : "flex-end",
                border: m.role === "ai" ? "1px solid #c7d2fe" : "none"
              }}>
                {m.role === "ai" && <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4 }}>bondIT AI</div>}
                {m.text}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: "flex-start", background: "var(--ai-bg)", border: "1px solid #c7d2fe", borderRadius: 10, padding: "10px 13px" }}>
                <div className="flex-gap"><div className="ai-dot" /><span style={{ fontSize: 12, color: "var(--ai-text)" }}>Thinking...</span></div>
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ flexShrink: 0, display: "flex", gap: 8, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !loading && sendMessage()}
              placeholder="Ask about applicants, employees, performance..."
              style={{ flex: 1, padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12, outline: "none" }} />
            <button className="btn btn-primary" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
              <Send size={13} />
            </button>
          </div>
        </div>

        <div>
          <div className="card mb-12">
            <div className="card-header"><div className="card-title">Quick Questions</div></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {QUICK_QUESTIONS.map((q, i) => (
                <button key={i} className="btn btn-outline" style={{ justifyContent: "flex-start", width: "100%", textAlign: "left" }}
                  onClick={() => sendMessage(q)} disabled={loading}>
                  <Brain size={11} color="#3730a3" />{q}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">Relationship Entity Summary</div></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Applicant → Company", count: context.applicants.length, color: "#2563eb", desc: "Compatibility relationships" },
                { label: "Employee → Department", count: context.assignments.length || context.employees.length, color: "#0f766e", desc: "Assignment relationships" },
                { label: "Employee → Performance", count: totalRatingsCount, color: "#7c3aed", desc: "Rating entities" },
              ].map(r => (
                <div key={r.label} style={{ padding: "10px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid var(--border)", borderLeft: `3px solid ${r.color}` }}>
                  <div className="flex-between">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 12 }}>{r.label}</div>
                      <div className="text-sm">{r.desc}</div>
                    </div>
                    <span className="badge badge-blue">{r.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
