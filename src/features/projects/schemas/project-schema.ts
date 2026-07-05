import { z } from "zod";

export const createProjectFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  techStack: z.string().optional(),
  link: z.union([z.literal(""), z.string().url("Enter a valid URL")]).optional(),
});

export type CreateProjectFormValues = z.infer<typeof createProjectFormSchema>;
