import React from "react";
import { Users, Brain, Building2, BarChart3, ArrowRight, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const weeklyData = [
  { week: "W1", avg: 3.6 }, { week: "W2", avg: 3.8 },
  { week: "W3", avg: 4.0 }, { week: "W4", avg: 4.2 },
];

const deptData = [
  { name: "AI & Data", score: 4.6 }, { name: "Frontend", score: 4.1 },
  { name: "Backend", score: 3.9 }, { name: "DevOps", score: 4.3 },
  { name: "Mobile", score: 3.7 }, { name: "Cybersec", score: 4.0 },
];

export default function Dashboard({ sharedState, setActive }) {
  const { applicants, scoredApplicants, hiredEmployees, assignments } = sharedState;
  const totalApplicants = applicants.length || 10;
  const screened = scoredApplicants.length || 0;
  const hired = hiredEmployees.length || 0;
  const assigned = assignments.length || 0;

  const pipeline = [
    { label: "Applicants Loaded", value: totalApplicants, icon: Users, color: "#2563eb", module: "ingestion" },
    { label: "AI Screened", value: screened, icon: Brain, color: "#0f766e", module: "compatibility" },
    { label: "Hired", value: hired, icon: CheckCircle, color: "#15803d", module: "interview" },
    { label: "Dept Assigned", value: assigned, icon: Building2, color: "#7c3aed", module: "department" },
  ];

  const activity = [
    { time: "Just now", text: "bondIT AI Engine initialised", type: "ai" },
    { time: "Today", text: "10 applicants loaded into system", type: "info" },
    { time: "Today", text: "Company requirements configured", type: "success" },
    { time: "Pending", text: "Run AI Compatibility Analysis", type: "warning" },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard Overview</h1>
        <p>Ecosystem linkage intelligence — real-time pipeline and performance summary</p>
      </div>

      <div className="kpi-grid">
        {pipeline.map(({ label, value, icon: Icon, color, module }) => (
          <div key={label} className="kpi-card" style={{ cursor: "pointer", borderTop: `3px solid ${color}` }} onClick={() => setActive(module)}>
            <div className="flex-between mb-12">
              <div className="kpi-label">{label}</div>
              <Icon size={16} color={color} />
            </div>
            <div className="kpi-value">{value}</div>
            <div className="flex-between mt-12">
              <span className="text-sm">View module</span>
              <ArrowRight size={12} color="#94a3b8" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 12 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Performance Trend</div>
              <div className="card-subtitle">Weekly average rating across all employees</div>
            </div>
            <span className="badge badge-green"><TrendingUp size={10} style={{ marginRight: 4 }} />+0.6 this month</span>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={weeklyData}>
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis domain={[3, 5]} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="avg" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Department Scores</div>
              <div className="card-subtitle">Average performance rating by department</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={deptData} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={60} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Bar dataKey="score" fill="#0f766e" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Workflow Pipeline Status</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Applicant Ingestion", done: totalApplicants > 0, desc: `${totalApplicants} applicants loaded` },
              { label: "AI Compatibility Screening", done: screened > 0, desc: screened > 0 ? `${screened} applicants scored` : "Not started" },
              { label: "Interview Decision", done: hired > 0, desc: hired > 0 ? `${hired} candidates selected` : "Awaiting screening" },
              { label: "Department Allocation", done: assigned > 0, desc: assigned > 0 ? `${assigned} employees placed` : "Awaiting hiring" },
              { label: "Performance Tracking", done: false, desc: "Activate after allocation" },
            ].map(({ label, done, desc }) => (
              <div key={label} className="flex-gap" style={{ padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span className={`status-dot ${done ? "green" : "yellow"}`} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{label}</div>
                  <div className="text-sm">{desc}</div>
                </div>
                <span className={`badge ${done ? "badge-green" : "badge-yellow"}`}>{done ? "Done" : "Pending"}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Activity</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {activity.map((a, i) => (
              <div key={i} className="flex-gap" style={{ padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                <Clock size={12} color="#94a3b8" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12 }}>{a.text}</div>
                  <div className="text-sm">{a.time}</div>
                </div>
                <span className={`badge ${a.type === "ai" ? "badge-ai" : a.type === "success" ? "badge-green" : a.type === "warning" ? "badge-yellow" : "badge-gray"}`}>
                  {a.type}
                </span>
              </div>
            ))}
          </div>

          <div className="ai-box" style={{ marginTop: 12 }}>
            <div className="ai-box-header"><div className="ai-dot" />bondIT AI Engine</div>
            <p style={{ fontSize: 11, color: "#3730a3" }}>
              System ready. Load applicants and run compatibility analysis to begin automated ecosystem linkage formation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
