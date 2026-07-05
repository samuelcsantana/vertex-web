import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getProjects } from "@/features/projects/api/project-service";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="container max-w-5xl py-12">
      <h1 className="text-4xl font-bold">Meus Projetos</h1>
      <p className="mt-2 text-muted-foreground">
        Casos de uso reais e estudos de arquitetura aplicados a produtos e
        plataformas escaláveis.
      </p>

      {projects.length === 0 ? (
        <p className="mt-10 text-muted-foreground">
          Nenhum projeto publicado ainda.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
            >
              <CardHeader>
                <CardTitle>{project.title}</CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <Badge key={tech} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>

                {project.link && (
                  <Link
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:underline"
                  >
                    Ver projeto
                    <ExternalLink className="size-3.5" />
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
