# bondIT — AI Ecosystem Linkage Platform

## Setup in 5 Steps

### Step 1 — Install Node.js
Download from https://nodejs.org (LTS version)

### Step 2 — Add your Gemini API Key
1. Copy `.env.example` → rename to `.env`
2. Replace `YOUR_GEMINI_API_KEY_HERE` with your actual key

### Step 3 — Install and Run Locally
```bash
npm install
npm start
```
Opens at http://localhost:3000

### Step 4 — Create Demo Account
- Click "Register Company"
- Use: admin@bondit.com / bondit2026
- Company Name: Your Company

### Step 5 — Deploy to Vercel (FREE)
1. Go to https://vercel.com → Sign in with GitHub
2. Click "Add New Project"
3. Upload this folder OR push to GitHub first
4. Add environment variable: REACT_APP_GEMINI_API_KEY = your key
5. Click Deploy → get live URL in 2 minutes

## Module Flow
1. Dashboard → see overview
2. Applicant Ingestion → load demo data + set requirements
3. AI Compatibility → run analysis → see ranked applicants
4. Relationship Graph → visualize connections
5. Interview Decision → select candidates → confirm hiring
6. Department Allocation → run AI assignment
7. Performance Intelligence → rate employees weekly → get reports
8. AI Reports → ask questions in plain English

## Tech Stack
- React 18
- Firebase (Auth + Firestore)
- Gemini AI API
- Recharts (graphs)
- Deployed on Vercel
