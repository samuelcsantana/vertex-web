import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteProjectAction } from "@/features/projects/actions/project-actions";
import { CreateProjectForm } from "@/features/projects/components/CreateProjectForm";
import { getProjects } from "@/features/projects/api/project-service";

export default async function DashboardProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-bold">Manage Projects</h1>

      <div className="mt-8">
        <CreateProjectForm />
      </div>

      <div className="mt-10 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="w-px px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td
                  colSpan={2}
                  className="px-4 py-6 text-center text-muted-foreground"
                >
                  No projects published yet.
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr
                  key={project.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3">{project.title}</td>
                  <td className="px-4 py-3 text-right">
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={<Button variant="destructive" size="sm" />}
                      >
                        Excluir
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Tem certeza absoluta?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita e removerá os
                            dados permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <form
                            action={deleteProjectAction.bind(null, project.id)}
                          >
                            <AlertDialogAction
                              type="submit"
                              variant="destructive"
                            >
                              Continuar
                            </AlertDialogAction>
                          </form>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
