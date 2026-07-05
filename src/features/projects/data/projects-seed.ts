export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  link: string;
}

export const PROJECTS: Project[] = [
  {
    id: "churrasco-calculator",
    title: "Calculadora de Churrasco",
    description:
      "Mobile MVP desenvolvido para planejamento de eventos, com interface responsiva e preparado para deployment na Play Store.",
    techStack: ["React Native", "Expo", "Mobile"],
    link: "#",
  },
  {
    id: "multi-tenant-migration",
    title: "Migração de Ecossistema Multi-tenant",
    description:
      "Liderança na transição arquitetural de sistemas da versão GA2 para GA3, estruturando isolamento de inquilinos e logs de migração.",
    techStack: ["Architecture", "SaaS", "System Migration"],
    link: "#",
  },
  {
    id: "micro-frontends-module-federation",
    title: "Micro-frontends & Module Federation",
    description:
      "Implementação de arquiteturas distribuídas e padrões reativos aplicados a plataformas escaláveis.",
    techStack: ["Angular", "Signals", "Micro-frontends"],
    link: "#",
  },
];
