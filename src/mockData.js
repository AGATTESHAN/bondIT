export const mockApplicants = [
  { id: "a1", name: "Aisha Rahman", email: "aisha@email.com", cgpa: 3.85, education: "Bachelor's", course: "Computer Science", university: "UTM", skills: ["React", "Node.js", "MongoDB"], languages: ["JavaScript", "Python"], experience: 2, status: "pending", score: null },
  { id: "a2", name: "Wei Liang Tan", email: "weiliang@email.com", cgpa: 3.72, education: "Bachelor's", course: "Software Engineering", university: "UM", skills: ["Vue.js", "Django", "PostgreSQL"], languages: ["Python", "JavaScript"], experience: 1, status: "pending", score: null },
  { id: "a3", name: "Kavitha Subramaniam", email: "kavitha@email.com", cgpa: 3.91, education: "Master's", course: "Data Science", university: "USM", skills: ["Machine Learning", "TensorFlow", "SQL"], languages: ["Python", "R"], experience: 3, status: "pending", score: null },
  { id: "a4", name: "Hafiz Zulkifli", email: "hafiz@email.com", cgpa: 3.55, education: "Bachelor's", course: "Information Technology", university: "UPM", skills: ["Java", "Spring Boot", "MySQL"], languages: ["Java", "SQL"], experience: 2, status: "pending", score: null },
  { id: "a5", name: "Mei Ling Chong", email: "meiling@email.com", cgpa: 3.78, education: "Bachelor's", course: "Computer Engineering", university: "UTAR", skills: ["C++", "Embedded Systems", "Python"], languages: ["C++", "Python"], experience: 1, status: "pending", score: null },
  { id: "a6", name: "Danial Azri", email: "danial@email.com", cgpa: 3.60, education: "Bachelor's", course: "Cybersecurity", university: "MMU", skills: ["Network Security", "Linux", "Python"], languages: ["Python", "Bash"], experience: 2, status: "pending", score: null },
  { id: "a7", name: "Priya Nair", email: "priya@email.com", cgpa: 3.95, education: "Master's", course: "Artificial Intelligence", university: "UM", skills: ["Deep Learning", "NLP", "PyTorch"], languages: ["Python", "Julia"], experience: 4, status: "pending", score: null },
  { id: "a8", name: "Zack Farouk", email: "zack@email.com", cgpa: 3.42, education: "Bachelor's", course: "Software Engineering", university: "UTM", skills: ["Android", "Kotlin", "Firebase"], languages: ["Kotlin", "Java"], experience: 1, status: "pending", score: null },
  { id: "a9", name: "Siti Hajar", email: "siti@email.com", cgpa: 3.68, education: "Bachelor's", course: "Computer Science", university: "UITM", skills: ["React Native", "JavaScript", "REST API"], languages: ["JavaScript", "TypeScript"], experience: 2, status: "pending", score: null },
  { id: "a10", name: "Bryan Lim", email: "bryan@email.com", cgpa: 3.88, education: "Bachelor's", course: "Data Engineering", university: "Sunway", skills: ["AWS", "Spark", "Kafka"], languages: ["Python", "Scala"], experience: 3, status: "pending", score: null },
];

export const mockRequirements = {
  skills: ["React", "Python", "Node.js", "SQL", "Machine Learning"],
  minCgpa: 3.5,
  maxCgpa: 4.0,
  education: "Bachelor's",
  languages: ["Python", "JavaScript"],
  minExperience: 1,
};

export const mockDepartments = [
  { id: "d1", name: "Frontend Engineering", skills: ["React", "Vue.js", "JavaScript", "TypeScript", "React Native"], languages: ["JavaScript", "TypeScript"] },
  { id: "d2", name: "Backend Engineering", skills: ["Node.js", "Django", "Spring Boot", "REST API", "PostgreSQL", "MySQL"], languages: ["Python", "JavaScript", "Java"] },
  { id: "d3", name: "AI & Data Science", skills: ["Machine Learning", "Deep Learning", "NLP", "TensorFlow", "PyTorch", "SQL"], languages: ["Python", "R", "Julia"] },
  { id: "d4", name: "DevOps & Cloud", skills: ["AWS", "Spark", "Kafka", "Linux", "Docker"], languages: ["Python", "Bash", "Scala"] },
  { id: "d5", name: "Mobile Development", skills: ["Android", "Kotlin", "React Native", "Firebase", "Embedded Systems"], languages: ["Kotlin", "Java", "JavaScript", "C++"] },
  { id: "d6", name: "Cybersecurity", skills: ["Network Security", "Linux", "Cybersecurity"], languages: ["Python", "Bash"] },
];

export const mockWeeklyRatings = [
  { week: 1, ratings: { "Kavitha Subramaniam": 4, "Priya Nair": 5, "Bryan Lim": 4, "Aisha Rahman": 3, "Wei Liang Tan": 3 } },
  { week: 2, ratings: { "Kavitha Subramaniam": 4, "Priya Nair": 5, "Bryan Lim": 5, "Aisha Rahman": 4, "Wei Liang Tan": 2 } },
  { week: 3, ratings: { "Kavitha Subramaniam": 5, "Priya Nair": 5, "Bryan Lim": 4, "Aisha Rahman": 4, "Wei Liang Tan": 2 } },
];

export const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE";
