import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import Dashboard from "./modules/Dashboard";
import ApplicantIngestion from "./modules/ApplicantIngestion";
import AICompatibility from "./modules/AICompatibility";
import RelationshipGraph from "./modules/RelationshipGraph";
import InterviewDecision from "./modules/InterviewDecision";
import DepartmentAllocation from "./modules/DepartmentAllocation";
import WeeklyPerformance from "./modules/WeeklyPerformance";
import AIReports from "./modules/AIReports";
import {
  LayoutDashboard, Users, Brain, Network, ClipboardCheck,
  Building2, BarChart3, FileText, LogOut, ChevronRight, Settings, Bell
} from "lucide-react";
import "./App.css";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "ingestion", label: "Applicant Ingestion", icon: Users },
  { id: "compatibility", label: "AI Compatibility", icon: Brain },
  { id: "graph", label: "Relationship Graph", icon: Network },
  { id: "interview", label: "Interview Decision", icon: ClipboardCheck },
  { id: "department", label: "Department Allocation", icon: Building2 },
  { id: "performance", label: "Performance Intelligence", icon: BarChart3 },
  { id: "reports", label: "AI Reports", icon: FileText },
];

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    try {
      if (isRegister) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "companies", cred.user.uid), {
          companyName, email, createdAt: new Date().toISOString(),
          requirements: { skills: [], minCgpa: 3.0, maxCgpa: 4.0, education: "Bachelor's", languages: [], minExperience: 1 }
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <span className="logo-bond">bond</span><span className="logo-it">IT</span>
        </div>
        <p className="login-subtitle">AI-Powered Ecosystem Linkage Platform</p>
        <div className="login-tabs">
          <button className={!isRegister ? "active" : ""} onClick={() => setIsRegister(false)}>Sign In</button>
          <button className={isRegister ? "active" : ""} onClick={() => setIsRegister(true)}>Register Company</button>
        </div>
        {isRegister && (
          <input className="login-input" placeholder="Company Name" value={companyName} onChange={e => setCompanyName(e.target.value)} />
        )}
        <input className="login-input" placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="login-input" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        {error && <p className="login-error">{error}</p>}
        <button className="login-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "Please wait..." : isRegister ? "Create Account" : "Sign In"}
        </button>
        <p className="login-demo">Demo: admin@bondit.com / bondit2026</p>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [active, setActive] = useState("dashboard");
  const [companyData, setCompanyData] = useState(null);
  const [sharedState, setSharedState] = useState({
    applicants: [], scoredApplicants: [], selectedForInterview: [],
    hiredEmployees: [], assignments: [], weeklyRatings: [], reports: []
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const snap = await getDoc(doc(db, "companies", u.uid));
        if (snap.exists()) setCompanyData(snap.data());
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  if (authLoading) return <div className="loading-screen"><div className="loader"/><p>Loading bondIT...</p></div>;
  if (!user) return <LoginPage onLogin={setUser} />;

  const updateShared = (key, val) => setSharedState(s => ({ ...s, [key]: val }));

  const moduleProps = { sharedState, updateShared, companyData };

  const modules = {
    dashboard: <Dashboard {...moduleProps} setActive={setActive} />,
    ingestion: <ApplicantIngestion {...moduleProps} />,
    compatibility: <AICompatibility {...moduleProps} />,
    graph: <RelationshipGraph {...moduleProps} />,
    interview: <InterviewDecision {...moduleProps} />,
    department: <DepartmentAllocation {...moduleProps} />,
    performance: <WeeklyPerformance {...moduleProps} />,
    reports: <AIReports {...moduleProps} />,
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-bond">bond</span><span className="logo-it">IT</span>
        </div>
        <div className="sidebar-company">{companyData?.companyName || "Company Admin"}</div>
        <nav className="sidebar-nav">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-item ${active === id ? "active" : ""}`} onClick={() => setActive(id)}>
              <Icon size={16} />
              <span>{label}</span>
              {active === id && <ChevronRight size={12} className="nav-arrow" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-item" onClick={() => signOut(auth)}>
            <LogOut size={16} /><span>Sign Out</span>
          </button>
        </div>
      </aside>
      <div className="main-area">
        <header className="top-bar">
          <div className="top-bar-left">
            <span className="breadcrumb">{NAV.find(n => n.id === active)?.label}</span>
          </div>
          <div className="top-bar-right">
            <button className="icon-btn"><Bell size={16} /></button>
            <button className="icon-btn"><Settings size={16} /></button>
            <div className="user-badge">{user.email?.[0]?.toUpperCase()}</div>
          </div>
        </header>
        <main className="workspace">{modules[active]}</main>
      </div>
    </div>
  );
}
