export const capabilities = [
  { id: "frontend", title: "Frontend", note: "The building blocks of the interface.", items: ["React", "Next.js", "JavaScript", "Tailwind CSS", "HTML", "CSS"] },
  { id: "core", title: "Core frontend", note: "The structure underneath the surface.", items: ["Responsive UI", "Components", "REST APIs", "State", "Forms"] },
  { id: "tools", title: "Tools", note: "From local ideas to something live.", items: ["Git", "GitHub", "Vercel", "VS Code"] },
  { id: "programming", title: "Programming", note: "A wider foundation. A frontend focus.", items: ["C++", "Python", "C#", "SQL"] },
] as const;
