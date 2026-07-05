"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";

import { createPostAction } from "@/features/posts/actions/post-actions";
import {
  createPostFormSchema,
  type CreatePostFormValues,
} from "@/features/posts/schemas/post-schema";

export function CreatePostForm() {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreatePostFormValues>({
    resolver: zodResolver(createPostFormSchema),
    defaultValues: { isPublished: false },
  });

  async function onSubmit(values: CreatePostFormValues) {
    setServerError(null);

    const result = await createPostAction(values);

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
        <CardTitle>New post</CardTitle>
        <CardDescription>Publish a new article to the blog.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.title}>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input id="title" {...register("title")} />
              <FieldError errors={errors.title ? [errors.title] : undefined} />
            </Field>

            <Field data-invalid={!!errors.slug}>
              <FieldLabel htmlFor="slug">Slug</FieldLabel>
              <Input
                id="slug"
                placeholder="my-post-slug"
                {...register("slug")}
              />
              <FieldError errors={errors.slug ? [errors.slug] : undefined} />
            </Field>

            <Field data-invalid={!!errors.content}>
              <FieldLabel htmlFor="content">Conteúdo (Markdown)</FieldLabel>
              <Textarea
                id="content"
                rows={15}
                className="field-sizing-fixed"
                {...register("content")}
              />
              <FieldError
                errors={errors.content ? [errors.content] : undefined}
              />
            </Field>

            <Field orientation="horizontal">
              <Controller
                control={control}
                name="isPublished"
                render={({ field }) => (
                  <Checkbox
                    id="isPublished"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <FieldLabel htmlFor="isPublished">
                Publish immediately
              </FieldLabel>
            </Field>

            {serverError && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {serverError}
              </p>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-fit">
              {isSubmitting ? "Creating..." : "Create post"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
