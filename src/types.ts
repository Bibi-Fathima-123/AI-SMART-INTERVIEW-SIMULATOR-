export interface InterviewRole {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const INTERVIEW_ROLES: InterviewRole[] = [
  {
    id: "software-engineer",
    title: "Software Engineer",
    description: "Technical questions on algorithms, system design, and coding practices.",
    icon: "Code",
  },
  {
    id: "product-manager",
    title: "Product Manager",
    description: "Product sense, execution, and leadership case studies.",
    icon: "Briefcase",
  },
  {
    id: "data-scientist",
    title: "Data Scientist",
    description: "Statistics, machine learning, and data intuition.",
    icon: "Database",
  },
  {
    id: "ux-designer",
    title: "UX Designer",
    description: "Design thinking, user research, and portfolio critiques.",
    icon: "Palette",
  },
  {
    id: "frontend-developer",
    title: "Frontend Developer",
    description: "React, CSS, web performance, and modern frontend architecture.",
    icon: "Layout",
  },
  {
    id: "backend-developer",
    title: "Backend Developer",
    description: "Databases, APIs, microservices, and server-side logic.",
    icon: "Server",
  },
  {
    id: "mobile-developer",
    title: "Mobile Developer",
    description: "iOS/Android development, React Native, and mobile UX.",
    icon: "Smartphone",
  },
  {
    id: "devops-engineer",
    title: "DevOps Engineer",
    description: "CI/CD, cloud infrastructure, Docker, and Kubernetes.",
    icon: "Cloud",
  },
  {
    id: "qa-engineer",
    title: "QA Engineer",
    description: "Automation testing, bug reporting, and quality assurance.",
    icon: "ShieldCheck",
  },
  {
    id: "cybersecurity-analyst",
    title: "Cybersecurity Analyst",
    description: "Network security, threat analysis, and risk management.",
    icon: "Lock",
  },
];

export interface InterviewFeedback {
  score: number;
  technicalAccuracy: string;
  communicationClarity: string;
  emotionalIntelligence: string;
  suggestions: string[];
}
