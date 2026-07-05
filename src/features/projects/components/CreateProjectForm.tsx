"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";

import { createProjectAction } from "@/features/projects/actions/project-actions";
import {
  createProjectFormSchema,
  type CreateProjectFormValues,
} from "@/features/projects/schemas/project-schema";

export function CreateProjectForm() {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectFormSchema),
  });

  async function onSubmit(values: CreateProjectFormValues) {
    setServerError(null);

    const techStack = values.techStack
      ? values.techStack
          .split(",")
          .map((tech) => tech.trim())
          .filter(Boolean)
      : [];

    const result = await createProjectAction({
      title: values.title,
      description: values.description,
      techStack,
      link: values.link || null,
    });

    if (!result.success) {
      setServerError(
        result.error ?? "Something went wrong. Please try again."
      );
      return;
    }

    reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New project</CardTitle>
        <CardDescription>
          Publish a new entry to the public portfolio.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.title}>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input id="title" {...register("title")} />
              <FieldError errors={errors.title ? [errors.title] : undefined} />
            </Field>

            <Field data-invalid={!!errors.description}>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Input id="description" {...register("description")} />
              <FieldError
                errors={errors.description ? [errors.description] : undefined}
              />
            </Field>

            <Field data-invalid={!!errors.techStack}>
              <FieldLabel htmlFor="techStack">Tech stack</FieldLabel>
              <Input
                id="techStack"
                placeholder="Next.js, TypeScript, Tailwind"
                {...register("techStack")}
              />
              <FieldError
                errors={errors.techStack ? [errors.techStack] : undefined}
              />
            </Field>

            <Field data-invalid={!!errors.link}>
              <FieldLabel htmlFor="link">Link</FieldLabel>
              <Input
                id="link"
                placeholder="https://..."
                {...register("link")}
              />
              <FieldError errors={errors.link ? [errors.link] : undefined} />
            </Field>

            {serverError && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {serverError}
              </p>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-fit">
              {isSubmitting ? "Creating..." : "Create project"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
