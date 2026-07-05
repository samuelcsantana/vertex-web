export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  link: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  title: string;
  description: string;
  techStack: string[];
  link?: string | null;
}
