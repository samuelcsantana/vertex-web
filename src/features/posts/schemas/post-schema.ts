import { z } from "zod";

const slugSchema = z
  .string()
  .min(1, "Slug is required")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers, and hyphens only"
  );

// A locale-specific slug the author left blank submits as "" (react-hook-form
// always sends a defined string, never omits the field) — treat that the
// same as "no override" rather than failing the format regex.
const optionalSlugSchema = z
  .union([slugSchema, z.literal("")])
  .transform((value) => (value === "" ? undefined : value))
  .optional();

export const createPostFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  titleEn: z.string().optional(),
  titleEs: z.string().optional(),
  slug: slugSchema,
  slugEn: optionalSlugSchema,
  slugEs: optionalSlugSchema,
  content: z.string().min(1, "Content is required"),
  contentEn: z.string().optional(),
  contentEs: z.string().optional(),
  isPublished: z.boolean(),
  allowComments: z.boolean(),
  coverUrl: z.union([z.string().url("URL inválida"), z.literal("")]),
  coverUrlEn: z.union([z.string().url("URL inválida"), z.literal("")]),
  coverUrlEs: z.union([z.string().url("URL inválida"), z.literal("")]),
  coverAlt: z.string().optional(),
  coverAltEn: z.string().optional(),
  coverAltEs: z.string().optional(),
  // 160 chars matches Google's typical meta description truncation point.
  // Per locale, same as title/content — a locale without its own falls
  // back to an auto-generated excerpt of that locale's own content, not
  // another locale's hand-written text.
  metaDescription: z
    .string()
    .max(160, "Máximo de 160 caracteres")
    .optional(),
  metaDescriptionEn: z.string().max(160, "Max 160 characters").optional(),
  metaDescriptionEs: z
    .string()
    .max(160, "Máximo de 160 caracteres")
    .optional(),
  topicIds: z.array(z.string()),
});

export type CreatePostFormValues = z.infer<typeof createPostFormSchema>;
