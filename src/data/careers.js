// SkillBridge AI — Core Data Store
// All career data, demo student, skill logic

export const CAREER_DATA = {
  'Data Analyst': {
    icon: '📊',
    color: 'blue',
    requiredSkills: ['Python', 'SQL', 'Excel', 'Statistics', 'Power BI', 'Data Visualization'],
    avgSalary: '₹6–12 LPA',
    growth: 'High',
    description: 'Analyze data to help organizations make better decisions.',
    learningPath: ['SQL Fundamentals', 'Excel Advanced', 'Power BI', 'Python for Data', 'Statistics', 'Data Viz'],
    relatedRoles: ['Business Analyst', 'Data Scientist', 'Product Analyst'],
  },
  'AI/ML Engineer': {
    icon: '🤖',
    color: 'purple',
    requiredSkills: ['Python', 'Machine Learning', 'Statistics', 'TensorFlow', 'SQL', 'Data Structures'],
    avgSalary: '₹10–25 LPA',
    growth: 'Very High',
    description: 'Build intelligent systems that learn from data.',
    learningPath: ['Python Advanced', 'Math & Statistics', 'ML Fundamentals', 'Deep Learning', 'TensorFlow/PyTorch', 'MLOps'],
    relatedRoles: ['Data Scientist', 'NLP Engineer', 'CV Engineer'],
  },
  'Software Developer': {
    icon: '💻',
    color: 'green',
    requiredSkills: ['Programming', 'Data Structures', 'Algorithms', 'Git', 'Database', 'Problem Solving'],
    avgSalary: '₹5–18 LPA',
    growth: 'High',
    description: 'Design, build, and maintain software applications.',
    learningPath: ['DSA', 'System Design', 'Database', 'API Development', 'Version Control', 'Testing'],
    relatedRoles: ['Full Stack Dev', 'Backend Dev', 'Frontend Dev'],
  },
  'Cybersecurity Analyst': {
    icon: '🔐',
    color: 'red',
    requiredSkills: ['Networking', 'Linux', 'Python', 'Security Fundamentals', 'SIEM', 'Threat Analysis'],
    avgSalary: '₹6–15 LPA',
    growth: 'Very High',
    description: 'Protect organizations from digital threats and vulnerabilities.',
    learningPath: ['Networking Basics', 'Linux CLI', 'Security+', 'Ethical Hacking', 'SIEM Tools', 'Incident Response'],
    relatedRoles: ['Penetration Tester', 'SOC Analyst', 'Cloud Security'],
  },
  'UI/UX Designer': {
    icon: '🎨',
    color: 'pink',
    requiredSkills: ['Figma', 'UX Research', 'Wireframing', 'Prototyping', 'Visual Design'],
    avgSalary: '₹5–14 LPA',
    growth: 'High',
    description: 'Create intuitive and beautiful user experiences.',
    learningPath: ['Design Principles', 'Figma', 'UX Research', 'Wireframing', 'Prototyping', 'Usability Testing'],
    relatedRoles: ['Product Designer', 'Interaction Designer', 'Visual Designer'],
  },
  'Cloud Engineer': {
    icon: '☁️',
    color: 'cyan',
    requiredSkills: ['AWS/Azure/GCP', 'Linux', 'Docker', 'Kubernetes', 'Networking', 'Python'],
    avgSalary: '₹8–20 LPA',
    growth: 'Very High',
    description: 'Build and manage scalable cloud infrastructure.',
    learningPath: ['Cloud Basics', 'AWS/Azure', 'Linux', 'Docker', 'Kubernetes', 'CI/CD'],
    relatedRoles: ['DevOps Engineer', 'Site Reliability Engineer', 'Cloud Architect'],
  },
  'Product Manager': {
    icon: '🚀',
    color: 'orange',
    requiredSkills: ['Product Thinking', 'Data Analysis', 'Communication', 'Agile', 'SQL', 'User Research'],
    avgSalary: '₹10–25 LPA',
    growth: 'High',
    description: 'Define product strategy and drive execution.',
    learningPath: ['Product Strategy', 'SQL for PMs', 'Agile/Scrum', 'User Research', 'Roadmapping', 'Growth'],
    relatedRoles: ['Product Owner', 'Growth Manager', 'Business Analyst'],
  },
};

export const DEMO_STUDENT = {
  name: 'Ananya',
  email: 'ananya@example.com',
  education: 'B.Tech Computer Science',
  university: 'VIT University',
  year: '3rd Year',
  skills: ['Python', 'Excel', 'Statistics'],
  projects: ['Sales Prediction System', 'Customer Segmentation Dashboard'],
  certificates: ['Python Fundamentals (Coursera)', 'Google Data Analytics (Partial)'],
  interests: ['Data Science', 'Business Intelligence', 'Machine Learning'],
  targetCareer: 'Data Analyst',
  experienceLevel: 'Student',
  analysisComplete: true,
};

export function analyzeProfile(student) {
  const career = CAREER_DATA[student.targetCareer];
  if (!career) return null;

  const studentSkillsLower = student.skills.map(s => s.toLowerCase().trim());
  const requiredSkills = career.requiredSkills;

  const matchedSkills = requiredSkills.filter(skill =>
    studentSkillsLower.some(s =>
      s.includes(skill.toLowerCase()) || skill.toLowerCase().includes(s)
    )
  );

  const missingSkills = requiredSkills.filter(skill =>
    !studentSkillsLower.some(s =>
      s.includes(skill.toLowerCase()) || skill.toLowerCase().includes(s)
    )
  );

  const matchScore = Math.round((matchedSkills.length / requiredSkills.length) * 100);
  // Job readiness factors in projects and certs
  const projectBonus = Math.min(student.projects?.length * 4, 12);
  const certBonus = Math.min(student.certificates?.length * 3, 9);
  const jobReadiness = Math.min(Math.round(matchScore * 0.75 + projectBonus + certBonus), 98);
  const skillStrength = Math.round((matchedSkills.length / 10) * 10 + projectBonus / 4);

  return {
    career: student.targetCareer,
    matchScore,
    jobReadiness,
    skillStrength: Math.min(skillStrength, 10),
    matchedSkills,
    missingSkills,
    totalRequired: requiredSkills.length,
    aiExplanation: generateExplanation(student, matchedSkills, missingSkills, student.targetCareer),
    roadmap: generateRoadmap(missingSkills, student.targetCareer),
    opportunities: generateOpportunities(student.targetCareer, matchScore, matchedSkills, missingSkills),
  };
}

function generateExplanation(student, matched, missing, career) {
  const name = student.name || 'You';
  const matchStr = matched.length > 0 ? matched.slice(0, 3).join(', ') : 'your existing skills';
  const missingStr = missing.slice(0, 3).join(', ');
  return `${name} already has a strong foundation in ${matchStr}. To become more competitive for ${career} roles, focus on ${missingStr} — these are the most in-demand skills employers look for. With your existing project experience, you're well on your way!`;
}

function generateRoadmap(missingSkills, career) {
  const careerSpecific = {
    'Data Analyst': [
      { title: 'SQL Fundamentals', desc: 'Learn SELECT, JOIN, GROUP BY, subqueries', duration: '3 weeks', resources: ['W3Schools SQL', 'Mode Analytics', 'Khan Academy'], progress: 65, status: 'in-progress' },
      { title: 'Power BI Basics', desc: 'Build dashboards, DAX formulas, data modeling', duration: '4 weeks', resources: ['Microsoft Learn', 'SQLBI', 'YouTube – Guy in a Cube'], progress: 0, status: 'locked' },
      { title: 'Data Visualization', desc: 'Charts, storytelling with data, Tableau intro', duration: '3 weeks', resources: ['Storytelling with Data (book)', 'Tableau Public', 'Google Charts'], progress: 0, status: 'locked' },
      { title: 'Real-world Project', desc: 'Build an end-to-end analytics project on GitHub', duration: '2 weeks', resources: ['Kaggle', 'GitHub', 'Towards Data Science'], progress: 0, status: 'locked' },
      { title: 'Google Data Analytics Certificate', desc: 'Complete the professional certificate', duration: '4 weeks', resources: ['Coursera – Google', 'DataCamp'], progress: 0, status: 'locked' },
      { title: 'Apply for Jobs', desc: 'Update resume, apply on LinkedIn, Internshala', duration: 'Ongoing', resources: ['LinkedIn', 'Internshala', 'Naukri'], progress: 0, status: 'locked' },
    ],
  };
  return careerSpecific[career] || careerSpecific['Data Analyst'];
}

function generateOpportunities(career, matchScore, matched, missing) {
  const ops = [
    {
      id: 1,
      title: 'Data Analyst Intern',
      company: 'DataNova Analytics',
      companyLogo: '📊',
      location: 'Bengaluru',
      type: 'Internship',
      stipend: '₹15,000/month',
      requiredSkills: ['SQL', 'Excel', 'Power BI', 'Statistics'],
      matchScore: matchScore,
      postedDays: 2,
      deadline: '30 Sep 2026',
    },
    {
      id: 2,
      title: 'Junior Business Analyst',
      company: 'TechCorp Solutions',
      companyLogo: '💼',
      location: 'Remote',
      type: 'Full-time',
      stipend: '₹5.5 LPA',
      requiredSkills: ['Excel', 'SQL', 'Statistics', 'Communication'],
      matchScore: Math.max(matchScore - 8, 50),
      postedDays: 5,
      deadline: '15 Oct 2026',
    },
    {
      id: 3,
      title: 'Data Science Intern',
      company: 'AI Ventures',
      companyLogo: '🤖',
      location: 'Hyderabad',
      type: 'Internship',
      stipend: '₹20,000/month',
      requiredSkills: ['Python', 'Machine Learning', 'Statistics', 'SQL'],
      matchScore: Math.max(matchScore - 13, 45),
      postedDays: 1,
      deadline: '20 Sep 2026',
    },
    {
      id: 4,
      title: 'Product Analyst Intern',
      company: 'StartupX',
      companyLogo: '🚀',
      location: 'Mumbai',
      type: 'Internship',
      stipend: '₹12,000/month',
      requiredSkills: ['Excel', 'SQL', 'Python', 'Communication'],
      matchScore: Math.max(matchScore - 16, 40),
      postedDays: 3,
      deadline: '25 Sep 2026',
    },
    {
      id: 5,
      title: 'Analytics Engineer',
      company: 'Flipkart',
      companyLogo: '🛒',
      location: 'Bengaluru',
      type: 'Full-time',
      stipend: '₹8 LPA',
      requiredSkills: ['SQL', 'Python', 'Data Modeling', 'Power BI', 'Statistics'],
      matchScore: Math.max(matchScore - 20, 35),
      postedDays: 7,
      deadline: '10 Oct 2026',
    },
  ];

  return ops.map(op => ({
    ...op,
    matchedSkills: op.requiredSkills.filter(s =>
      matched.some(m => m.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(m.toLowerCase()))
    ),
    missingSkills: op.requiredSkills.filter(s =>
      !matched.some(m => m.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(m.toLowerCase()))
    ),
  }));
}

export const SKILL_GAP_DETAILS = {
  SQL: {
    currentLevel: 'Beginner',
    requiredLevel: 'Intermediate',
    priority: 'HIGH',
    importance: 95,
    effort: '3–4 weeks',
    resource: 'W3Schools SQL + Mode Analytics Tutorial',
    resourceUrl: 'https://www.w3schools.com/sql/',
    why: 'SQL is the #1 required skill for Data Analyst roles. 90% of job postings mention it.',
  },
  'Power BI': {
    currentLevel: 'None',
    requiredLevel: 'Intermediate',
    priority: 'HIGH',
    importance: 85,
    effort: '3–5 weeks',
    resource: 'Microsoft Learn — Power BI',
    resourceUrl: 'https://learn.microsoft.com/en-us/training/powerplatform/power-bi',
    why: 'Power BI is used in 70% of enterprise analytics teams for dashboards and reporting.',
  },
  'Data Visualization': {
    currentLevel: 'Basic',
    requiredLevel: 'Intermediate',
    priority: 'MEDIUM',
    importance: 78,
    effort: '2–3 weeks',
    resource: 'Storytelling with Data + Tableau Public',
    resourceUrl: 'https://public.tableau.com',
    why: 'Communicating insights visually is a core analyst skill. Learn chart selection and storytelling.',
  },
  'Machine Learning': {
    currentLevel: 'None',
    requiredLevel: 'Advanced',
    priority: 'HIGH',
    importance: 92,
    effort: '8–12 weeks',
    resource: 'Andrew Ng ML Course (Coursera)',
    resourceUrl: 'https://coursera.org/learn/machine-learning',
    why: 'Core skill for AI/ML engineering roles.',
  },
  TensorFlow: {
    currentLevel: 'None',
    requiredLevel: 'Intermediate',
    priority: 'MEDIUM',
    importance: 80,
    effort: '6–8 weeks',
    resource: 'TensorFlow Official Tutorials',
    resourceUrl: 'https://tensorflow.org/tutorials',
    why: 'Most ML models in production are built with TensorFlow or PyTorch.',
  },
  'Data Structures': {
    currentLevel: 'Beginner',
    requiredLevel: 'Advanced',
    priority: 'HIGH',
    importance: 90,
    effort: '6–10 weeks',
    resource: 'LeetCode + GeeksForGeeks DSA',
    resourceUrl: 'https://leetcode.com',
    why: 'Essential for coding interviews and building efficient software.',
  },
};

export const CHATBOT_RESPONSES = {
  'what skills should i learn next': (analysis) =>
    `Based on your profile, I recommend focusing on **SQL** first — it's the highest priority gap for ${analysis?.career || 'your target role'}. After that, tackle **Power BI** to build dashboard skills. These two together will significantly boost your job readiness from ${analysis?.jobReadiness || 78}% to over 88%.`,
  'am i ready for data analyst jobs': (analysis) =>
    `You're at **${analysis?.jobReadiness || 78}% job readiness** — which is solid for internship applications! You match ${analysis?.matchedSkills?.length || 3} of ${analysis?.totalRequired || 6} required skills. I'd recommend applying to internships now while simultaneously learning SQL. Don't wait to be 100% ready — apply and learn in parallel!`,
  'which career suits my profile': (analysis) =>
    `Your current skills (Python, Excel, Statistics) align best with **Data Analyst** (${analysis?.matchScore || 92}% match). You're also a good fit for **Business Analyst** (80%) and **Data Science** (70%). The Data Analyst path requires the least additional learning from where you are now.`,
  'how can i improve my job readiness': (analysis) =>
    `Here's your personalized action plan:\n\n1. **Complete SQL on W3Schools** (2 weeks) → +8% readiness\n2. **Build a Power BI dashboard** using sample data (2 weeks) → +6%\n3. **Add a data analysis project** to GitHub (1 week) → +4%\n4. **Update LinkedIn** with your new skills → +visibility\n\nThis plan takes you from ${analysis?.jobReadiness || 78}% to ~96% readiness in about 5 weeks!`,
  default: (analysis) =>
    `Great question! Based on your profile, you're targeting **${analysis?.career || 'Data Analyst'}** with a ${analysis?.matchScore || 92}% career match. Your top strengths are Python, Excel, and Statistics. Focus on filling SQL and Power BI gaps to unlock more opportunities. What specific aspect would you like to explore?`,
};
