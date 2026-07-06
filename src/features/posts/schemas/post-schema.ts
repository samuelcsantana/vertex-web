import { z } from "zod";

export const createPostFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  titleEn: z.string().optional(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers, and hyphens only"
    ),
  content: z.string().min(1, "Content is required"),
  contentEn: z.string().optional(),
  isPublished: z.boolean(),
  allowComments: z.boolean(),
  coverUrl: z.union([z.string().url("URL inválida"), z.literal("")]),
  topicIds: z.array(z.string()),
});

export type CreatePostFormValues = z.infer<typeof createPostFormSchema>;
