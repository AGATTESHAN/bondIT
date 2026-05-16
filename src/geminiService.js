const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || "YOUR_GEMINI_KEY_HERE";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

async function callGemini(prompt) {
  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const clean = text.replace(/```json|```/g, "").trim();
  try { return JSON.parse(clean); } catch { return null; }
}

export async function runApplicantScreening(applicants, requirements) {
  const prompt = `
You are bondIT AI Engine — MODE 1: APPLICANT SCREENING.
Company Requirements: ${JSON.stringify(requirements)}
Applicants: ${JSON.stringify(applicants)}

For each applicant compute a compatibility_score (0-100):
- Skills match: 30 pts
- CGPA in range: 20 pts
- Education match: 15 pts
- Programming languages match: 20 pts
- Work experience: 15 pts

Return ONLY valid JSON (no markdown, no extra text):
{
  "ranked_applicants": [
    {
      "id": "applicant id",
      "name": "name",
      "compatibility_score": 87,
      "match_reasons": ["reason1", "reason2"],
      "grade": "Excellent|Good|Fair|Weak"
    }
  ]
}`;
  return callGemini(prompt);
}

export async function runDepartmentAssignment(employees, departments) {
  const prompt = `
You are bondIT AI Engine — MODE 2: DEPARTMENT ASSIGNMENT.
Selected Employees: ${JSON.stringify(employees)}
Available Departments: ${JSON.stringify(departments)}

Assign each employee to their best-fit department based on skills and languages.
Compute fit_score (0-100) and give clear fit_reasons.

Return ONLY valid JSON:
{
  "assignments": [
    {
      "employee_id": "id",
      "employee_name": "name",
      "assigned_department": "department name",
      "fit_score": 91,
      "fit_reasons": ["reason1", "reason2"]
    }
  ]
}`;
  return callGemini(prompt);
}

export async function runWeeklyReport(employees, ratings, weekNumber) {
  const prompt = `
You are bondIT AI Engine — MODE 3: WEEKLY PERFORMANCE REPORT.
Week: ${weekNumber}
Employees with ratings: ${JSON.stringify(employees)}
This week ratings: ${JSON.stringify(ratings)}

Star labels: 1=Needs significant improvement, 2=Below expectations, 3=Meets expectations, 4=Exceeds expectations, 5=Outstanding

For employees rated 1-2 stars for 2+ consecutive weeks, recommend reshuffle.
Return ONLY valid JSON:
{
  "week_number": ${weekNumber},
  "summary": "one sentence executive summary",
  "department_averages": { "DeptName": 4.2 },
  "employee_reports": [
    {
      "name": "name",
      "department": "dept",
      "rating": 4,
      "label": "Exceeds expectations",
      "action": "Confirm placement",
      "reshuffle_suggestion": null
    }
  ],
  "top_performer": "name",
  "flag_count": 0
}`;
  return callGemini(prompt);
}

export async function askAI(question, context) {
  const prompt = `
You are bondIT AI Engine — MODE 4: RELATIONSHIP QUERY.
Context data: ${JSON.stringify(context)}
Admin question: "${question}"
Answer in plain, professional English in 2-3 sentences. Be specific with names and numbers.
Return ONLY a JSON object: { "answer": "your answer here" }`;
  return callGemini(prompt);
}
